
import test from "node:test";
import assert from "node:assert/strict";

const RESERVATION_ID = "11111111-1111-4111-8111-111111111111";
const CONVERSATION_ID = "22222222-2222-4222-8222-222222222222";
const STAFF_A = "33333333-3333-4333-8333-333333333331";
const STAFF_B = "33333333-3333-4333-8333-333333333332";

const ACTIVE = new Set([
  "draft",
  "awaiting_guest",
  "staff_review",
]);

class InterventionModel {
  constructor() {
    this.mode = "staff";
    this.modeVersion = 4;
    this.reservationStatus = "pending";
    this.detailsValidated = true;
    this.staff = new Set([STAFF_A, STAFF_B]);
    this.interventions = [];
    this.locks = new Map();
    this.sequence = 0;
    this.smsCalls = 0;
    this.legacyAlternativeExists = false;
  }

  async locked(key, operation) {
    const previous = this.locks.get(key) ?? Promise.resolve();

    let release;
    const current = new Promise((resolve) => {
      release = resolve;
    });

    const tail = previous.then(() => current);
    this.locks.set(key, tail);

    await previous;

    try {
      return await operation();
    } finally {
      release();
      if (this.locks.get(key) === tail) {
        this.locks.delete(key);
      }
    }
  }

  requireStaff(actor) {
    if (!this.staff.has(actor)) {
      throw new Error("STAFF_AUTHORIZATION_REQUIRED");
    }
  }

  requireOwnership(version) {
    if (this.mode !== "staff" || this.modeVersion !== version) {
      throw new Error("STAFF_OWNERSHIP_REQUIRED");
    }
  }

  requireReservation() {
    if (
      !["pending", "incomplete"].includes(this.reservationStatus) ||
      !this.detailsValidated
    ) {
      throw new Error("RESERVATION_NOT_ELIGIBLE");
    }
  }

  active() {
    return this.interventions.filter((item) =>
      ACTIVE.has(item.status)
    );
  }

  async start({
    actor,
    requestKey,
    reservationId = RESERVATION_ID,
    conversationId = CONVERSATION_ID,
    version = 4,
  }) {
    this.requireStaff(actor);

    return this.locked(CONVERSATION_ID, async () => {
      if (
        reservationId !== RESERVATION_ID ||
        conversationId !== CONVERSATION_ID
      ) {
        throw new Error("CONVERSATION_MISMATCH");
      }

      this.requireOwnership(version);
      this.requireReservation();

      const existing = this.interventions.find(
        (item) => item.requestKey === requestKey
      );

      if (existing) {
        if (
          existing.actor !== actor ||
          existing.reservationId !== reservationId ||
          existing.conversationId !== conversationId ||
          existing.version !== version
        ) {
          throw new Error("REQUEST_KEY_CONFLICT");
        }

        return existing.id;
      }

      if (this.active().length > 0) {
        throw new Error("ACTIVE_INTERVENTION_EXISTS");
      }

      const item = {
        id: `intervention-${++this.sequence}`,
        actor,
        requestKey,
        reservationId,
        conversationId,
        version,
        status: "draft",
        revisedTimes: [],
        sendClaim: null,
        outbound: null,
        guestChoice: null,
      };

      this.interventions.push(item);
      return item.id;
    });
  }

  async prepare({
    actor,
    interventionId,
    version = 4,
  }) {
    this.requireStaff(actor);

    return this.locked(CONVERSATION_ID, async () => {
      this.requireOwnership(version);
      this.requireReservation();

      if (this.legacyAlternativeExists) {
        throw new Error("LEGACY_ALTERNATIVE_CONFLICT");
      }

      const item = this.interventions.find(
        (entry) => entry.id === interventionId
      );

      if (
        !item ||
        item.status !== "draft" ||
        item.version !== version ||
        item.sendClaim
      ) {
        throw new Error("DRAFT_NOT_AVAILABLE");
      }

      if (
        item.revisedTimes.length < 1 ||
        item.revisedTimes.length > 3 ||
        new Set(item.revisedTimes).size !== item.revisedTimes.length
      ) {
        throw new Error("INVALID_REVISED_TIMES");
      }

      item.sendClaim = {
        requestId: `sms-claim-${++this.sequence}`,
        actor,
      };

      return item.sendClaim.requestId;
    });
  }

  async recordSelection({
    actor,
    interventionId,
    inboundSid,
    option,
    version = 4,
    inboundConversationId = CONVERSATION_ID,
    inboundCreatedAt = 200,
  }) {
    this.requireStaff(actor);

    return this.locked(CONVERSATION_ID, async () => {
      this.requireOwnership(version);
      this.requireReservation();

      const item = this.interventions.find(
        (entry) => entry.id === interventionId
      );

      if (
        !item ||
        item.version !== version ||
        !["awaiting_guest", "staff_review"].includes(item.status) ||
        !item.outbound ||
        item.outbound.status !== "accepted"
      ) {
        throw new Error("SENT_INTERVENTION_REQUIRED");
      }

      if (
        inboundConversationId !== CONVERSATION_ID ||
        inboundCreatedAt <= item.outbound.acceptedAt
      ) {
        throw new Error("REPLY_CORRELATION_FAILED");
      }

      const selectedTime = item.revisedTimes[option - 1];

      if (
        !Number.isInteger(option) ||
        !selectedTime
      ) {
        throw new Error("INVALID_SELECTION");
      }

      if (item.guestChoice) {
        if (
          item.guestChoice.inboundSid.toLowerCase() ===
            inboundSid.toLowerCase() &&
          item.guestChoice.option === option &&
          item.guestChoice.selectedTime === selectedTime
        ) {
          return {
            outcome: "duplicate",
            selectedTime,
          };
        }

        throw new Error("SELECTION_ALREADY_RECORDED");
      }

      if (item.status !== "awaiting_guest") {
        throw new Error("STAFF_REVIEW_REQUIRED");
      }

      item.guestChoice = {
        inboundSid,
        option,
        selectedTime,
      };

      item.status = "staff_review";

      return {
        outcome: "recorded",
        selectedTime,
      };
    });
  }

  async handback() {
    return this.locked(CONVERSATION_ID, async () => {
      if (this.mode === "staff" && this.active().length > 0) {
        throw new Error("ACTIVE_INTERVENTION_PREVENTS_HANDBACK");
      }

      this.mode = "automation";
      this.modeVersion++;
    });
  }
}

function preparedModel() {
  const model = new InterventionModel();

  model.interventions.push({
    id: "intervention-1",
    actor: STAFF_A,
    requestKey: "initial-request",
    reservationId: RESERVATION_ID,
    conversationId: CONVERSATION_ID,
    version: 4,
    status: "draft",
    revisedTimes: ["18:00", "18:30"],
    sendClaim: null,
    outbound: null,
    guestChoice: null,
  });

  return model;
}

function awaitingGuestModel() {
  const model = preparedModel();
  const item = model.interventions[0];

  item.status = "awaiting_guest";
  item.sendClaim = {
    requestId: "accepted-request",
    actor: STAFF_A,
  };
  item.outbound = {
    status: "accepted",
    acceptedAt: 100,
  };

  return model;
}

test("Concurrent different starts permit one active intervention", async () => {
  const model = new InterventionModel();

  const results = await Promise.allSettled([
    model.start({ actor: STAFF_A, requestKey: "request-a" }),
    model.start({ actor: STAFF_B, requestKey: "request-b" }),
  ]);

  assert.equal(
    results.filter((result) => result.status === "fulfilled").length,
    1
  );
  assert.equal(model.active().length, 1);
});

test("Concurrent identical starts return the same intervention", async () => {
  const model = new InterventionModel();
  const request = { actor: STAFF_A, requestKey: "request-a" };

  const results = await Promise.all([
    model.start(request),
    model.start(request),
  ]);

  assert.equal(results[0], results[1]);
  assert.equal(model.interventions.length, 1);
});

test("Request key cannot be reassigned to another staff member", async () => {
  const model = new InterventionModel();

  await model.start({
    actor: STAFF_A,
    requestKey: "shared-key",
  });

  await assert.rejects(
    model.start({
      actor: STAFF_B,
      requestKey: "shared-key",
    }),
    /REQUEST_KEY_CONFLICT/
  );
});

test("Concurrent SMS preparation creates one claim", async () => {
  const model = preparedModel();

  const results = await Promise.allSettled([
    model.prepare({
      actor: STAFF_A,
      interventionId: "intervention-1",
    }),
    model.prepare({
      actor: STAFF_B,
      interventionId: "intervention-1",
    }),
  ]);

  assert.equal(
    results.filter((result) => result.status === "fulfilled").length,
    1
  );
  assert.ok(model.interventions[0].sendClaim);
  assert.equal(model.smsCalls, 0);
});

test("Legacy alternative offers block SMS preparation", async () => {
  const model = preparedModel();
  model.legacyAlternativeExists = true;

  await assert.rejects(
    model.prepare({
      actor: STAFF_A,
      interventionId: "intervention-1",
    }),
    /LEGACY_ALTERNATIVE_CONFLICT/
  );

  assert.equal(model.interventions[0].sendClaim, null);
});

test("Conflicting guest selections cannot both succeed", async () => {
  const model = awaitingGuestModel();

  const results = await Promise.allSettled([
    model.recordSelection({
      actor: STAFF_A,
      interventionId: "intervention-1",
      inboundSid: "SM" + "a".repeat(32),
      option: 1,
    }),
    model.recordSelection({
      actor: STAFF_B,
      interventionId: "intervention-1",
      inboundSid: "SM" + "b".repeat(32),
      option: 2,
    }),
  ]);

  assert.equal(
    results.filter((result) => result.status === "fulfilled").length,
    1
  );
  assert.equal(model.interventions[0].status, "staff_review");
});

test("Repeated identical guest selection is idempotent", async () => {
  const model = awaitingGuestModel();
  const request = {
    actor: STAFF_A,
    interventionId: "intervention-1",
    inboundSid: "SM" + "c".repeat(32),
    option: 1,
  };

  const first = await model.recordSelection(request);
  const second = await model.recordSelection(request);

  assert.equal(first.outcome, "recorded");
  assert.equal(second.outcome, "duplicate");
  assert.equal(first.selectedTime, second.selectedTime);
});

test("Reply predating accepted SMS cannot select an option", async () => {
  const model = awaitingGuestModel();

  await assert.rejects(
    model.recordSelection({
      actor: STAFF_A,
      interventionId: "intervention-1",
      inboundSid: "SM" + "d".repeat(32),
      option: 1,
      inboundCreatedAt: 99,
    }),
    /REPLY_CORRELATION_FAILED/
  );

  assert.equal(model.interventions[0].guestChoice, null);
});

test("Active intervention blocks automation handback", async () => {
  const model = preparedModel();

  await assert.rejects(
    model.handback(),
    /ACTIVE_INTERVENTION_PREVENTS_HANDBACK/
  );

  assert.equal(model.mode, "staff");
});

test("Resolved intervention permits automation handback", async () => {
  const model = preparedModel();
  model.interventions[0].status = "resolved";

  await model.handback();

  assert.equal(model.mode, "automation");
  assert.equal(model.modeVersion, 5);
});

test("Stale conversation mode version rejects intervention start", async () => {
  const model = new InterventionModel();
  model.modeVersion = 5;

  await assert.rejects(
    model.start({
      actor: STAFF_A,
      requestKey: "stale-request",
      version: 4,
    }),
    /STAFF_OWNERSHIP_REQUIRED/
  );

  assert.equal(model.interventions.length, 0);
});

test("Inactive staff cannot start an intervention", async () => {
  const model = new InterventionModel();
  model.staff.delete(STAFF_B);

  await assert.rejects(
    model.start({
      actor: STAFF_B,
      requestKey: "unauthorized-request",
    }),
    /STAFF_AUTHORIZATION_REQUIRED/
  );

  assert.equal(model.interventions.length, 0);
});