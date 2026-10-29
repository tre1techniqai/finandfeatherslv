const test = require("node:test");
const assert = require("node:assert/strict");
const crypto = require("node:crypto");

const { handler } = require(
  "../twilio/functions/check-conversation-ownership.js"
);

const SECRET = "test-secret-with-more-than-32-characters";
const GUEST = "+17025550123";
const RESTAURANT = "+17255550123";
const SID = "SM" + "a".repeat(32);

const CONTEXT = {
  RESERVATION_STUDIO_ROUTER_SECRET: SECRET,
  RESERVATION_STUDIO_ROUTER_URL:
    "https://example.test/api/twilio/conversation-route",
  RESERVATION_RESTAURANT_PHONE: RESTAURANT,
  RESERVATION_STUDIO_STAFF_INBOUND_BRIDGE_ENABLED: "true",
};

function json(status, payload) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => payload,
  };
}

function routing(route) {
  return json(200, { success: true, route });
}

function recorded(duplicate = false) {
  return json(duplicate ? 200 : 201, {
    success: true,
    recorded: true,
    conversationMode: "staff",
    conversationId: "conversation-test",
    inboundEventId: "inbound-test",
    duplicate,
  });
}

async function execute({
  route = "staff",
  recordResponse = recorded(),
  context = {},
  event = {},
  responses,
  fetchErrorAt,
} = {}) {
  const originalFetch = global.fetch;
  const calls = [];

  const queue = responses ?? [
    routing(route),
    recordResponse,
  ];

  global.fetch = async (url, options) => {
    const body = options.body;
    const timestamp = options.headers["X-FF-Timestamp"];
    const signature = options.headers["X-FF-Signature"];

    const expected = crypto
      .createHmac("sha256", SECRET)
      .update(`${timestamp}.${body}`, "utf8")
      .digest("hex");

    assert.equal(options.method, "POST");
    assert.equal(
      options.headers["Content-Type"],
      "application/json"
    );
    assert.equal(signature, expected);

    calls.push({
      url: String(url),
      body: JSON.parse(body),
    });

    if (calls.length === fetchErrorAt) {
      throw new Error("Simulated network failure");
    }

    return queue[calls.length - 1] ??
      json(503, { success: false });
  };

  try {
    const result = await new Promise((resolve, reject) => {
      Promise.resolve(
        handler(
          { ...CONTEXT, ...context },
          {
            From: GUEST,
            To: RESTAURANT,
            MessageSid: SID,
            ...event,
          },
          (error, response) => {
            if (error) reject(error);
            else resolve(response);
          }
        )
      ).catch(reject);
    });

    return { result, calls };
  } finally {
    global.fetch = originalFetch;
  }
}

test("01 - Automation continues without recording", async () => {
  const { result, calls } = await execute({
    route: "automation",
  });

  assert.equal(result.route, "automation");
  assert.equal(result.success, true);
  assert.equal(calls.length, 1);
  assert.deepEqual(calls[0].body, {
    from: GUEST,
    to: RESTAURANT,
  });
});

test("02 - New staff inbound message is recorded", async () => {
  const { result, calls } = await execute();

  assert.equal(result.route, "staff");
  assert.equal(result.success, true);
  assert.equal(calls.length, 2);
  assert.equal(
    new URL(calls[1].url).pathname,
    "/api/twilio/shared-conversation-inbound"
  );
  assert.deepEqual(calls[1].body, {
    from: GUEST,
    to: RESTAURANT,
    messageSid: SID,
  });
});

test("03 - Confirmed duplicate is accepted", async () => {
  const { result } = await execute({
    recordResponse: recorded(true),
  });

  assert.equal(result.route, "staff");
});

test("04 - Disabled bridge blocks staff", async () => {
  const { result, calls } = await execute({
    context: {
      RESERVATION_STUDIO_STAFF_INBOUND_BRIDGE_ENABLED:
        "false",
    },
  });

  assert.equal(result.route, "block");
  assert.equal(
    result.reason,
    "STAFF_INBOUND_BRIDGE_DISABLED"
  );
  assert.equal(calls.length, 1);
});

test("05 - Missing MessageSid blocks staff", async () => {
  const { result, calls } = await execute({
    event: { MessageSid: undefined },
  });

  assert.equal(result.route, "block");
  assert.equal(result.reason, "INVALID_MESSAGE_SID");
  assert.equal(calls.length, 1);
});

test("06 - Invalid MessageSid blocks staff", async () => {
  const { result } = await execute({
    event: { MessageSid: "INVALID" },
  });

  assert.equal(result.route, "block");
});

test("07 - Recording HTTP failure blocks staff", async () => {
  const { result } = await execute({
    recordResponse: json(503, {
      success: false,
      recorded: false,
    }),
  });

  assert.equal(result.route, "block");
});

test("08 - Recorded false blocks staff", async () => {
  const { result } = await execute({
    recordResponse: json(200, {
      success: true,
      recorded: false,
    }),
  });

  assert.equal(result.route, "block");
});

test("09 - Wrong conversation mode blocks staff", async () => {
  const { result } = await execute({
    recordResponse: json(200, {
      ...await recorded().json(),
      conversationMode: "automation",
    }),
  });

  assert.equal(result.route, "block");
});

test("10 - Incomplete recording proof blocks staff", async () => {
  const { result } = await execute({
    recordResponse: json(200, {
      success: true,
      recorded: true,
      conversationMode: "staff",
    }),
  });

  assert.equal(result.route, "block");
});

test("11 - Router network failure blocks", async () => {
  const { result } = await execute({
    fetchErrorAt: 1,
  });

  assert.equal(result.route, "block");
  assert.equal(result.reason, "ROUTER_UNAVAILABLE");
});

test("12 - Recording network failure blocks", async () => {
  const { result } = await execute({
    fetchErrorAt: 2,
  });

  assert.equal(result.route, "block");
  assert.equal(
    result.reason,
    "INBOUND_RECORDING_UNAVAILABLE"
  );
});

test("13 - Unknown router decision blocks", async () => {
  const { result, calls } = await execute({
    route: "unknown",
  });

  assert.equal(result.route, "block");
  assert.equal(calls.length, 1);
});

test("14 - Invalid phone pair blocks before HTTP", async () => {
  const { result, calls } = await execute({
    event: { To: "+17025559999" },
  });

  assert.equal(result.route, "block");
  assert.equal(calls.length, 0);
});

test("15 - Invalid router URL blocks before HTTP", async () => {
  const { result, calls } = await execute({
    context: {
      RESERVATION_STUDIO_ROUTER_URL:
        "http://example.test/api/twilio/conversation-route",
    },
  });

  assert.equal(result.route, "block");
  assert.equal(calls.length, 0);
});

test("16 - Missing signing secret blocks", async () => {
  const { result, calls } = await execute({
    context: {
      RESERVATION_STUDIO_ROUTER_SECRET: "",
    },
  });

  assert.equal(result.route, "block");
  assert.equal(calls.length, 0);
});

test("17 - Automation works with bridge disabled", async () => {
  const { result, calls } = await execute({
    route: "automation",
    context: {
      RESERVATION_STUDIO_STAFF_INBOUND_BRIDGE_ENABLED:
        "false",
    },
    event: { MessageSid: undefined },
  });

  assert.equal(result.route, "automation");
  assert.equal(calls.length, 1);
});