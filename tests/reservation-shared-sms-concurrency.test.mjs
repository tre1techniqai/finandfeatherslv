import test from "node:test";
import assert from "node:assert/strict";

const CONVERSATION_ID =
  "11111111-1111-4111-8111-111111111111";

const MANAGERS = [
  "22222222-2222-4222-8222-222222222221",
  "22222222-2222-4222-8222-222222222222",
  "22222222-2222-4222-8222-222222222223",
];

const REQUEST_IDS = [
  "33333333-3333-4333-8333-333333333331",
  "33333333-3333-4333-8333-333333333332",
  "33333333-3333-4333-8333-333333333333",
];

class FakeSharedSmsSystem {
  constructor() {
    this.mode = "staff";
    this.managers = new Set(MANAGERS);
    this.operations = new Map();
    this.twilioCalls = [];
    this.failNextTwilioCall = false;
    this.nextOperation = 1;
  }

  authorizeManager(managerId) {
    if (!this.managers.has(managerId)) {
      throw new Error("MANAGER_NOT_AUTHORIZED");
    }
  }

  register({
    conversationId,
    managerId,
    clientRequestId,
    body,
  }) {
    this.authorizeManager(managerId);

    if (
      conversationId !== CONVERSATION_ID ||
      this.mode !== "staff"
    ) {
      throw new Error("STAFF_CONVERSATION_REQUIRED");
    }

    const normalizedBody = body.trim();

    if (
      normalizedBody.length < 1 ||
      normalizedBody.length > 1600
    ) {
      throw new Error("INVALID_BODY");
    }

    const existing = this.operations.get(
      clientRequestId,
    );

    if (existing) {
      if (
        existing.conversationId !== conversationId ||
        existing.managerId !== managerId ||
        existing.body !== normalizedBody
      ) {
        throw new Error("IDEMPOTENCY_CONFLICT");
      }

      return {
        operationId: existing.operationId,
        status: existing.status,
      };
    }

    const operation = {
      operationId: `operation-${this.nextOperation++}`,
      conversationId,
      managerId,
      clientRequestId,
      body: normalizedBody,
      status: "registered",
      messageSid: null,
    };

    this.operations.set(clientRequestId, operation);

    return {
      operationId: operation.operationId,
      status: operation.status,
    };
  }

  begin(clientRequestId) {
    const operation =
      this.operations.get(clientRequestId);

    if (!operation) {
      throw new Error("OPERATION_NOT_FOUND");
    }

    if (this.mode !== "staff") {
      throw new Error("STAFF_CONVERSATION_INACTIVE");
    }

    this.authorizeManager(operation.managerId);

    if (operation.status !== "registered") {
      throw new Error("SUBMISSION_NOT_ALLOWED");
    }

    // Models the atomic registered -> submitting
    // transition required from the database RPC.
    operation.status = "submitting";

    return operation;
  }

  async submit({
    conversationId = CONVERSATION_ID,
    managerId,
    clientRequestId,
    body,
  }) {
    const registration = this.register({
      conversationId,
      managerId,
      clientRequestId,
      body,
    });

    if (registration.status !== "registered") {
      return {
        success: false,
        duplicate: true,
        status: registration.status,
      };
    }

    const operation = this.begin(clientRequestId);

    try {
      // Fake Twilio API. No network request occurs.
      this.twilioCalls.push({
        operationId: operation.operationId,
        managerId: operation.managerId,
        body: operation.body,
      });

      await Promise.resolve();

      if (this.failNextTwilioCall) {
        this.failNextTwilioCall = false;
        throw new Error("SIMULATED_TWILIO_TIMEOUT");
      }

      operation.status = "accepted";
      operation.messageSid =
        `SM${String(this.twilioCalls.length).padStart(32, "0")}`;

      return {
        success: true,
        status: operation.status,
        operationId: operation.operationId,
      };
    } catch {
      operation.status = "uncertain";

      return {
        success: false,
        status: "uncertain",
        operationId: operation.operationId,
      };
    }
  }
}

function request(managerId, clientRequestId, body) {
  return {
    conversationId: CONVERSATION_ID,
    managerId,
    clientRequestId,
    body,
  };
}

test(
  "Three managers can send distinct messages to one conversation",
  async () => {
    const system = new FakeSharedSmsSystem();

    const results = await Promise.all(
      MANAGERS.map((managerId, index) =>
        system.submit(
          request(
            managerId,
            REQUEST_IDS[index],
            `Message from manager ${index + 1}`,
          ),
        ),
      ),
    );

    assert.equal(
      results.filter((result) => result.success).length,
      3,
    );

    assert.equal(system.twilioCalls.length, 3);

    assert.deepEqual(
      new Set(
        system.twilioCalls.map((call) => call.managerId),
      ),
      new Set(MANAGERS),
    );
  },
);

test(
  "Repeated request ID does not submit another SMS",
  async () => {
    const system = new FakeSharedSmsSystem();

    const message = request(
      MANAGERS[0],
      REQUEST_IDS[0],
      "Hello guest",
    );

    const first = await system.submit(message);
    const second = await system.submit(message);

    assert.equal(first.success, true);
    assert.equal(second.duplicate, true);
    assert.equal(system.twilioCalls.length, 1);
  },
);

test(
  "Concurrent duplicate requests authorize one submission",
  async () => {
    const system = new FakeSharedSmsSystem();

    const message = request(
      MANAGERS[0],
      REQUEST_IDS[0],
      "One message only",
    );

    const results = await Promise.allSettled([
      system.submit(message),
      system.submit(message),
    ]);

    assert.equal(
      results.filter(
        (result) =>
          result.status === "fulfilled" &&
          result.value.success === true,
      ).length,
      1,
    );

    assert.equal(system.twilioCalls.length, 1);
  },
);

test(
  "Request ID cannot be reused by another manager",
  async () => {
    const system = new FakeSharedSmsSystem();

    await system.submit(
      request(
        MANAGERS[0],
        REQUEST_IDS[0],
        "Original message",
      ),
    );

    await assert.rejects(
      system.submit(
        request(
          MANAGERS[1],
          REQUEST_IDS[0],
          "Original message",
        ),
      ),
      /IDEMPOTENCY_CONFLICT/,
    );

    assert.equal(system.twilioCalls.length, 1);
  },
);

test(
  "Inactive manager cannot register an SMS",
  async () => {
    const system = new FakeSharedSmsSystem();

    system.managers.delete(MANAGERS[1]);

    await assert.rejects(
      system.submit(
        request(
          MANAGERS[1],
          REQUEST_IDS[1],
          "Unauthorized message",
        ),
      ),
      /MANAGER_NOT_AUTHORIZED/,
    );

    assert.equal(system.twilioCalls.length, 0);
  },
);

test(
  "Revoked manager cannot begin a registered submission",
  () => {
    const system = new FakeSharedSmsSystem();

    system.register(
      request(
        MANAGERS[0],
        REQUEST_IDS[0],
        "Pending message",
      ),
    );

    system.managers.delete(MANAGERS[0]);

    assert.throws(
      () => system.begin(REQUEST_IDS[0]),
      /MANAGER_NOT_AUTHORIZED/,
    );

    assert.equal(system.twilioCalls.length, 0);
  },
);

test(
  "Transitioning conversation cannot authorize an SMS",
  async () => {
    const system = new FakeSharedSmsSystem();

    system.mode = "transitioning_to_staff";

    await assert.rejects(
      system.submit(
        request(
          MANAGERS[0],
          REQUEST_IDS[0],
          "Must remain blocked",
        ),
      ),
      /STAFF_CONVERSATION_REQUIRED/,
    );

    assert.equal(system.twilioCalls.length, 0);
  },
);

test(
  "Uncertain Twilio outcome cannot be automatically resent",
  async () => {
    const system = new FakeSharedSmsSystem();

    system.failNextTwilioCall = true;

    const message = request(
      MANAGERS[0],
      REQUEST_IDS[0],
      "Timeout simulation",
    );

    const first = await system.submit(message);
    const second = await system.submit(message);

    assert.equal(first.status, "uncertain");
    assert.equal(second.duplicate, true);
    assert.equal(second.status, "uncertain");

    assert.equal(system.twilioCalls.length, 1);
  },
);