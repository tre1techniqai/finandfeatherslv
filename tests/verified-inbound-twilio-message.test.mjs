import test from "node:test";
import assert from "node:assert/strict";

import {
  verifyInboundTwilioMessage,
} from "../src/lib/reservations/verified-inbound-twilio-message.ts";

const MESSAGE_SID = `SM${"a".repeat(32)}`;
const OTHER_SID = `SM${"b".repeat(32)}`;

const GUEST = "+15555550101";
const RESTAURANT = "+15555550100";

const NOW = Date.parse("2026-10-26T20:00:00.000Z");
const CREATED = new Date(NOW - 60_000);

const INPUT = {
  messageSid: MESSAGE_SID,
  guestPhone: GUEST,
  restaurantPhone: RESTAURANT,
};

function makeMessage(overrides = {}) {
  return {
    sid: MESSAGE_SID,
    from: GUEST,
    to: RESTAURANT,
    direction: "inbound",
    dateCreated: new Date(CREATED),
    ...overrides,
  };
}

function makeClient({
  message = makeMessage(),
  error = null,
} = {}) {
  const calls = [];

  return {
    calls,

    client: {
      messages(sid) {
        calls.push({
          operation: "messages",
          sid,
        });

        return {
          async fetch() {
            calls.push({
              operation: "fetch",
              sid,
            });

            if (error) {
              throw error;
            }

            return message;
          },
        };
      },
    },
  };
}

async function verify({
  input = INPUT,
  message = makeMessage(),
  error = null,
  now = NOW,
} = {}) {
  const mock = makeClient({ message, error });

  const result = await verifyInboundTwilioMessage(
    input,
    {
      client: mock.client,
      now: () => now,
    },
  );

  return {
    result,
    calls: mock.calls,
  };
}

function expectRejected(result, reason) {
  assert.deepEqual(result, {
    verified: false,
    reason,
  });
}

test("01 - Valid inbound message is verified", async () => {
  const { result, calls } = await verify();

  assert.deepEqual(result, {
    verified: true,
    message: {
      messageSid: MESSAGE_SID,
      guestPhone: GUEST,
      restaurantPhone: RESTAURANT,
      messageCreatedAt: CREATED.toISOString(),
    },
  });

  assert.deepEqual(calls, [
    {
      operation: "messages",
      sid: MESSAGE_SID,
    },
    {
      operation: "fetch",
      sid: MESSAGE_SID,
    },
  ]);
});

test("02 - Message SID mismatch is rejected", async () => {
  const { result } = await verify({
    message: makeMessage({
      sid: OTHER_SID,
    }),
  });

  expectRejected(result, "MESSAGE_IDENTITY_MISMATCH");
});

test("03 - Guest phone mismatch is rejected", async () => {
  const { result } = await verify({
    message: makeMessage({
      from: "+15555550102",
    }),
  });

  expectRejected(result, "MESSAGE_IDENTITY_MISMATCH");
});

test("04 - Restaurant phone mismatch is rejected", async () => {
  const { result } = await verify({
    message: makeMessage({
      to: "+15555550103",
    }),
  });

  expectRejected(result, "MESSAGE_IDENTITY_MISMATCH");
});

test("05 - Outbound direction is rejected", async () => {
  const { result } = await verify({
    message: makeMessage({
      direction: "outbound-api",
    }),
  });

  expectRejected(result, "MESSAGE_IDENTITY_MISMATCH");
});

test("06 - Missing message is rejected", async () => {
  const { result } = await verify({
    message: null,
  });

  expectRejected(result, "MESSAGE_IDENTITY_MISMATCH");
});

test("07 - Invalid creation date is rejected", async () => {
  const { result } = await verify({
    message: makeMessage({
      dateCreated: new Date("invalid"),
    }),
  });

  expectRejected(result, "INVALID_MESSAGE_TIMESTAMP");
});

test("08 - Non-Date timestamp is rejected", async () => {
  const { result } = await verify({
    message: makeMessage({
      dateCreated: CREATED.toISOString(),
    }),
  });

  expectRejected(result, "INVALID_MESSAGE_TIMESTAMP");
});

test("09 - Future timestamp beyond five minutes is rejected", async () => {
  const { result } = await verify({
    message: makeMessage({
      dateCreated: new Date(NOW + 300_001),
    }),
  });

  expectRejected(result, "INVALID_MESSAGE_TIMESTAMP");
});

test("10 - Timestamp exactly five minutes ahead is permitted", async () => {
  const { result } = await verify({
    message: makeMessage({
      dateCreated: new Date(NOW + 300_000),
    }),
  });

  assert.equal(result.verified, true);
});

test("11 - Twilio 404 is classified without exposing details", async () => {
  const { result } = await verify({
    error: {
      status: 404,
      message: "Synthetic private Twilio detail",
    },
  });

  expectRejected(result, "MESSAGE_NOT_FOUND");

  assert.equal(
    JSON.stringify(result).includes("Synthetic private"),
    false,
  );
});

test("12 - Unexpected Twilio failure is rejected", async () => {
  const { result } = await verify({
    error: new Error("Synthetic transport failure"),
  });

  expectRejected(result, "MESSAGE_LOOKUP_FAILED");
});

test("13 - Invalid SID is rejected before client access", async () => {
  const { result, calls } = await verify({
    input: {
      ...INPUT,
      messageSid: "INVALID",
    },
  });

  expectRejected(result, "INVALID_INPUT");
  assert.equal(calls.length, 0);
});

test("14 - Invalid phone pair is rejected before client access", async () => {
  const invalidInputs = [
    {
      ...INPUT,
      guestPhone: "5555550101",
    },
    {
      ...INPUT,
      restaurantPhone: "INVALID",
    },
    {
      ...INPUT,
      restaurantPhone: GUEST,
    },
  ];

  for (const input of invalidInputs) {
    const { result, calls } = await verify({
      input,
    });

    expectRejected(result, "INVALID_INPUT");
    assert.equal(calls.length, 0);
  }
});

test("15 - Null input is rejected without lookup", async () => {
  const { result, calls } = await verify({
    input: null,
  });

  expectRejected(result, "INVALID_INPUT");
  assert.equal(calls.length, 0);
});

test("16 - Invalid test clock is rejected", async () => {
  const { result } = await verify({
    now: Number.NaN,
  });

  expectRejected(result, "INVALID_MESSAGE_TIMESTAMP");
});

test("17 - Unconfigured default client fails closed", async () => {
  const previousAccountSid =
    process.env.TWILIO_ACCOUNT_SID;

  const previousAuthToken =
    process.env.TWILIO_AUTH_TOKEN;

  try {
    delete process.env.TWILIO_ACCOUNT_SID;
    delete process.env.TWILIO_AUTH_TOKEN;

    const result = await verifyInboundTwilioMessage(INPUT);

    expectRejected(result, "TWILIO_NOT_CONFIGURED");
  } finally {
    if (previousAccountSid === undefined) {
      delete process.env.TWILIO_ACCOUNT_SID;
    } else {
      process.env.TWILIO_ACCOUNT_SID =
        previousAccountSid;
    }

    if (previousAuthToken === undefined) {
      delete process.env.TWILIO_AUTH_TOKEN;
    } else {
      process.env.TWILIO_AUTH_TOKEN =
        previousAuthToken;
    }
  }
});

test("18 - Valid verification does not expose message body", async () => {
  const { result } = await verify({
    message: {
      ...makeMessage(),
      body: "Synthetic private customer message",
    },
  });

  assert.equal(result.verified, true);

  assert.equal(
    JSON.stringify(result).includes(
      "Synthetic private customer message",
    ),
    false,
  );

  assert.deepEqual(
    Object.keys(result.message).sort(),
    [
      "guestPhone",
      "messageCreatedAt",
      "messageSid",
      "restaurantPhone",
    ],
  );
});