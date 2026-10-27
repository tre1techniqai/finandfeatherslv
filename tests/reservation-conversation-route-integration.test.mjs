import test from "node:test";
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";

const MOCK_URL = "http://127.0.0.1:4318";

const ROUTER_URL =
  "http://127.0.0.1:3100/api/twilio/conversation-route";

const restaurantPhone = process.env.TWILIO_FROM_NUMBER;
const secret = process.env.RESERVATION_STUDIO_ROUTER_SECRET;

if (
  !/^\+[1-9]\d{7,14}$/.test(restaurantPhone ?? "") ||
  !secret ||
  Buffer.byteLength(secret, "utf8") < 32
) {
  throw new Error("Missing local routing test configuration.");
}

const scenarios = [
  {
    name: "No ownership record permits automation",
    legacyStatus: null,
    sharedMode: null,
    expectedStatus: 200,
    expectedRoute: "automation",
  },
  {
    name: "Shared automation mode permits automation",
    legacyStatus: "automation",
    sharedMode: "automation",
    expectedStatus: 200,
    expectedRoute: "automation",
  },
  {
    name: "Pending shared activation blocks routing",
    legacyStatus: null,
    sharedMode: "transitioning_to_staff",
    expectedStatus: 503,
    expectedRoute: "block",
  },
  {
    name: "Shared staff mode routes to staff",
    legacyStatus: null,
    sharedMode: "staff",
    expectedStatus: 200,
    expectedRoute: "staff",
  },
  {
    name: "Legacy staff ownership blocks shared takeover",
    legacyStatus: "staff",
    sharedMode: "staff",
    expectedStatus: 503,
    expectedRoute: "block",
  },
  {
    name: "Pending legacy handoff blocks shared takeover",
    legacyStatus: "handoff_pending",
    sharedMode: "staff",
    expectedStatus: 503,
    expectedRoute: "block",
  },
  {
    name: "Legacy handoff fence blocks automation",
    legacyStatus: "handoff_pending",
    sharedMode: "automation",
    expectedStatus: 503,
    expectedRoute: "block",
  },
  {
    name: "Legacy database failure blocks routing",
    legacyStatus: null,
    sharedMode: "staff",
    legacyError: true,
    expectedStatus: 503,
    expectedRoute: "block",
  },
  {
    name: "Shared database failure blocks routing",
    legacyStatus: null,
    sharedMode: "staff",
    sharedError: true,
    expectedStatus: 503,
    expectedRoute: "block",
  },
];

async function setupScenario(scenario, index) {
  const guestPhone =
    `+155500001${String(index).padStart(2, "0")}`;

  assert.notEqual(guestPhone, restaurantPhone);

  const response = await fetch(
    `${MOCK_URL}/__test/scenario`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        guestPhone,
        restaurantPhone,
        legacyStatus: scenario.legacyStatus,
        sharedMode: scenario.sharedMode,
        legacyError: scenario.legacyError === true,
        sharedError: scenario.sharedError === true,
      }),
      signal: AbortSignal.timeout(10000),
    },
  );

  assert.equal(
    response.status,
    200,
    `Mock configuration failed: ${scenario.name}`,
  );

  return guestPhone;
}

async function requestRouting(guestPhone) {
  const body = JSON.stringify({
    from: guestPhone,
    to: restaurantPhone,
  });

  const timestamp = String(
    Math.floor(Date.now() / 1000),
  );

  const signature = createHmac("sha256", secret)
    .update(`${timestamp}.${body}`, "utf8")
    .digest("hex");

  const response = await fetch(ROUTER_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-FF-Timestamp": timestamp,
      "X-FF-Signature": signature,
    },
    body,
    signal: AbortSignal.timeout(15000),
  });

  return {
    status: response.status,
    payload: await response.json(),
  };
}

// Each case has its own synthetic guest number.
// Tests are intentionally configured to run sequentially.
for (const [index, scenario] of scenarios.entries()) {
  test(
    scenario.name,
    { concurrency: false },
    async () => {
      const guestPhone = await setupScenario(
        scenario,
        index,
      );

      const result = await requestRouting(guestPhone);

      assert.equal(
        result.status,
        scenario.expectedStatus,
      );

      assert.equal(
        result.payload.route,
        scenario.expectedRoute,
      );

      assert.equal(
        result.payload.success,
        scenario.expectedRoute !== "block",
      );
    },
  );
}