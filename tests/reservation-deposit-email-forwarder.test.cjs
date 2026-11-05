"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const crypto = require("node:crypto");

const { handler } = require(
  "../twilio/functions/forward-reservation-deposit-email-reply.js"
);

const SECRET = "ab".repeat(32);
const SID = `SM${"a".repeat(32)}`;
const RESERVATION_ID =
  "11111111-2222-4333-8444-555555555555";

const FROM = "+17025550123";
const TO = "+17025550999";
const URL =
  "https://finandfeatherslv.live/api/twilio/deposit-email-reply";

function makeContext(overrides = {}) {
  return {
    RESERVATION_DEPOSIT_EMAIL_INGRESS_SECRET: SECRET,
    RESERVATION_DEPOSIT_EMAIL_INGRESS_URL: URL,
    TWILIO_FROM_NUMBER: TO,
    ...overrides,
  };
}

function makeEvent(overrides = {}) {
  return {
    From: FROM,
    To: TO,
    MessageSid: SID,
    ...overrides,
  };
}

function jsonResponse(status, payload) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => payload,
  };
}

async function invoke({
  context = makeContext(),
  event = makeEvent(),
  response = jsonResponse(200, {
    success: true,
    status: "saved",
    reservationId: RESERVATION_ID,
    messageSid: SID,
  }),
  failFetch = false,
} = {}) {
  const originalFetch = global.fetch;
  const requests = [];

  global.fetch = async (url, options) => {
    requests.push({ url, options });

    if (failFetch) {
      throw new Error("Simulated network failure");
    }

    return response;
  };

  try {
    const result = await new Promise((resolve, reject) => {
      Promise.resolve(
        handler(context, event, (error, value) => {
          if (error) reject(error);
          else resolve(value);
        })
      ).catch(reject);
    });

    return { result, requests };
  } finally {
    global.fetch = originalFetch;
  }
}

test("valid request is signed and forwarded once", async () => {
  const { result, requests } = await invoke();

  assert.equal(requests.length, 1);
  assert.equal(requests[0].url, URL);

  const options = requests[0].options;

  assert.equal(options.method, "POST");
  assert.equal(options.redirect, "error");
  assert.equal(
    options.headers["Content-Type"],
    "application/json"
  );

  assert.deepEqual(JSON.parse(options.body), {
    messageSid: SID,
    guestPhone: FROM,
    restaurantPhone: TO,
  });

  const timestamp =
    options.headers["X-Deposit-Timestamp"];

  const expectedSignature = crypto
    .createHmac("sha256", Buffer.from(SECRET, "hex"))
    .update(`${timestamp}.${options.body}`)
    .digest("hex");

  assert.equal(
    options.headers["X-Deposit-Signature"],
    expectedSignature
  );

  assert.deepEqual(result, {
    route: "handled",
    outcome: "DEPOSIT_EMAIL_SAVED",
    reservationId: RESERVATION_ID,
  });
});

test("duplicate response is handled without retry", async () => {
  const { result, requests } = await invoke({
    response: jsonResponse(200, {
      success: true,
      status: "duplicate",
      reservationId: RESERVATION_ID,
      messageSid: SID,
    }),
  });

  assert.equal(requests.length, 1);
  assert.equal(result.route, "handled");
  assert.equal(result.outcome, "DEPOSIT_EMAIL_DUPLICATE");
});

test("review response does not claim success", async () => {
  const { result } = await invoke({
    response: jsonResponse(200, {
      success: false,
      status: "review",
      reason: "RESERVATION_REFERENCE_REQUIRED",
    }),
  });

  assert.equal(result.route, "review");
  assert.equal(
    result.outcome,
    "DEPOSIT_EMAIL_REVIEW_REQUIRED"
  );
});

test("blocked response does not claim success", async () => {
  const { result } = await invoke({
    response: jsonResponse(409, {
      success: false,
      status: "blocked",
      reason: "DEPOSIT_NOTIFICATION_NOT_SENT",
    }),
  });

  assert.equal(result.route, "review");
  assert.equal(result.outcome, "DEPOSIT_EMAIL_BLOCKED");
});

test("invalid phone pair is rejected before fetch", async () => {
  const { result, requests } = await invoke({
    event: makeEvent({ To: "+17025550000" }),
  });

  assert.equal(requests.length, 0);
  assert.equal(result.route, "error");
  assert.equal(result.outcome, "INVALID_INBOUND");
});

test("invalid Message SID is rejected before fetch", async () => {
  const { result, requests } = await invoke({
    event: makeEvent({ MessageSid: "invalid" }),
  });

  assert.equal(requests.length, 0);
  assert.equal(result.outcome, "INVALID_INBOUND");
});

test("invalid secret fails before fetch", async () => {
  const { result, requests } = await invoke({
    context: makeContext({
      RESERVATION_DEPOSIT_EMAIL_INGRESS_SECRET: "invalid",
    }),
  });

  assert.equal(requests.length, 0);
  assert.equal(result.outcome, "CONFIGURATION_ERROR");
});

test("incorrect endpoint path fails before fetch", async () => {
  const { result, requests } = await invoke({
    context: makeContext({
      RESERVATION_DEPOSIT_EMAIL_INGRESS_URL:
        "https://example.com/api/twilio/inbound",
    }),
  });

  assert.equal(requests.length, 0);
  assert.equal(result.outcome, "CONFIGURATION_ERROR");
});

test("network failure does not trigger retry", async () => {
  const { result, requests } = await invoke({
    failFetch: true,
  });

  assert.equal(requests.length, 1);
  assert.equal(result.route, "error");
  assert.equal(result.outcome, "ENDPOINT_UNAVAILABLE");
});

test("mismatched returned SID is rejected", async () => {
  const { result } = await invoke({
    response: jsonResponse(200, {
      success: true,
      status: "saved",
      reservationId: RESERVATION_ID,
      messageSid: `SM${"b".repeat(32)}`,
    }),
  });

  assert.equal(result.route, "error");
  assert.equal(
    result.outcome,
    "DEPOSIT_EMAIL_PROCESSING_FAILED"
  );
});

test("server failure does not claim success", async () => {
  const { result } = await invoke({
    response: jsonResponse(503, {
      success: false,
      code: "PROCESSING_UNAVAILABLE",
    }),
  });

  assert.equal(result.route, "error");
  assert.equal(
    result.outcome,
    "DEPOSIT_EMAIL_PROCESSING_FAILED"
  );
});