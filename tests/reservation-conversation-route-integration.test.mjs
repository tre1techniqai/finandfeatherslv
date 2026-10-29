import test from "node:test";
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";

const MOCK_URL =
  process.env.SMS_MOCK_BASE_URL ??
  "http://127.0.0.1:4318";

const ROUTER_URL =
  process.env.SMS_TEST_BASE_URL
    ? `${process.env.SMS_TEST_BASE_URL}/api/twilio/conversation-route`
    : "http://127.0.0.1:3100/api/twilio/conversation-route";

const restaurantPhone =
  process.env.TWILIO_FROM_NUMBER;

const secret =
  process.env.RESERVATION_STUDIO_ROUTER_SECRET;

const E164 = /^\+[1-9]\d{7,14}$/;

if (
  !E164.test(restaurantPhone ?? "") ||
  !secret ||
  Buffer.byteLength(secret, "utf8") < 32
) {
  throw new Error(
    "Missing local routing test configuration.",
  );
}

// ============================================================
// FIN & FEATHERS LAS VEGAS
// STEP 58D.15.27
//
// SHARED SMS ROUTING INTEGRATION TESTS
//
// Requirements:
// - Isolated Next.js test server
// - Mock Supabase database
// - Synthetic phone numbers
// - Shared routing enabled in isolated environment
// - Legacy handoff fence enabled
// - Staff routing enabled
//
// These tests do NOT:
// - Connect to production Supabase
// - Send Twilio messages
// - Modify reservations
// - Change Studio executions
// - Activate staff conversations
// ============================================================

const scenarios = [
  // ----------------------------------------------------------
  // ORIGINAL INTEGRATION SCENARIOS
  // ----------------------------------------------------------

  {
    name: "01 - No ownership record permits automation",
    legacyStatus: null,
    sharedMode: null,
    expectedStatus: 200,
    expectedRoute: "automation",
  },

  {
    name: "02 - Shared automation mode permits automation",
    legacyStatus: "automation",
    sharedMode: "automation",
    expectedStatus: 200,
    expectedRoute: "automation",
  },

  {
    name: "03 - Pending shared activation blocks routing",
    legacyStatus: null,
    sharedMode: "transitioning_to_staff",
    expectedStatus: 503,
    expectedRoute: "block",
  },

  {
    name: "04 - Shared staff mode routes to staff",
    legacyStatus: null,
    sharedMode: "staff",
    expectedStatus: 200,
    expectedRoute: "staff",
  },

  {
    name: "05 - Legacy staff ownership blocks shared takeover",
    legacyStatus: "staff",
    sharedMode: "staff",
    expectedStatus: 503,
    expectedRoute: "block",
  },

  {
    name: "06 - Pending legacy handoff blocks shared takeover",
    legacyStatus: "handoff_pending",
    sharedMode: "staff",
    expectedStatus: 503,
    expectedRoute: "block",
  },

  {
    name: "07 - Legacy handoff fence blocks automation",
    legacyStatus: "handoff_pending",
    sharedMode: "automation",
    expectedStatus: 503,
    expectedRoute: "block",
  },

  {
    name: "08 - Legacy database failure blocks routing",
    legacyStatus: null,
    sharedMode: "staff",
    legacyError: true,
    expectedStatus: 503,
    expectedRoute: "block",
  },

  {
    name: "09 - Shared database failure blocks routing",
    legacyStatus: null,
    sharedMode: "staff",
    sharedError: true,
    expectedStatus: 503,
    expectedRoute: "block",
  },

  // ----------------------------------------------------------
  // NEW LEGACY MULTI-ROW SCENARIOS
  // ----------------------------------------------------------

  {
    name: "10 - Two legacy automation records block routing",
    legacyStatuses: [
      "automation",
      "automation",
    ],
    sharedModes: [],
    expectedStatus: 503,
    expectedRoute: "block",
  },

  {
    name: "11 - Conflicting legacy ownership records block routing",
    legacyStatuses: [
      "automation",
      "staff",
    ],
    sharedModes: [],
    expectedStatus: 503,
    expectedRoute: "block",
  },

  {
    name: "12 - Multiple legacy records cannot be overridden by shared staff",
    legacyStatuses: [
      "released",
      "handoff_pending",
    ],
    sharedModes: [
      "staff",
    ],
    expectedStatus: 503,
    expectedRoute: "block",
  },

  // ----------------------------------------------------------
  // NEW SHARED CONVERSATION MULTI-ROW SCENARIOS
  // ----------------------------------------------------------

  {
    name: "13 - Two shared automation conversations preserve legacy automation",
    legacyStatuses: [],
    sharedModes: [
      "automation",
      "automation",
    ],
    expectedStatus: 200,
    expectedRoute: "automation",
  },

  {
    name: "14 - Shared automation and staff conversations block ambiguous routing",
    legacyStatuses: [],
    sharedModes: [
      "automation",
      "staff",
    ],
    expectedStatus: 503,
    expectedRoute: "block",
  },

  {
    name: "15 - Shared automation and transitioning conversations block ambiguous routing",
    legacyStatuses: [],
    sharedModes: [
      "automation",
      "transitioning_to_staff",
    ],
    expectedStatus: 503,
    expectedRoute: "block",
  },

  // ----------------------------------------------------------
  // ADDITIONAL LEGACY FENCE REGRESSION
  // ----------------------------------------------------------

  {
    name: "16 - Multiple shared automation conversations preserve legacy handoff fence",
    legacyStatuses: [
      "handoff_pending",
    ],
    sharedModes: [
      "automation",
      "automation",
    ],
    expectedStatus: 503,
    expectedRoute: "block",
  },
];

// ============================================================
// MOCK SCENARIO SETUP
// ============================================================

async function setupScenario(
  scenario,
  index,
) {
  // Every test gets a unique synthetic phone pair.
  // This prevents one scenario from affecting another.

  const guestPhone =
    `+155500001${String(index).padStart(2, "0")}`;

  assert.match(
    guestPhone,
    E164,
  );

  assert.notEqual(
    guestPhone,
    restaurantPhone,
  );

  const payload = {
    guestPhone,
    restaurantPhone,
    legacyError:
      scenario.legacyError === true,
    sharedError:
      scenario.sharedError === true,
  };

  // Preserve compatibility with original tests.
  //
  // The mock accepts either:
  // legacyStatus OR legacyStatuses
  // sharedMode OR sharedModes
  //
  // Never send both forms for the same field.

  if (
    Object.prototype.hasOwnProperty.call(
      scenario,
      "legacyStatuses",
    )
  ) {
    payload.legacyStatuses =
      scenario.legacyStatuses;
  } else {
    payload.legacyStatus =
      scenario.legacyStatus;
  }

  if (
    Object.prototype.hasOwnProperty.call(
      scenario,
      "sharedModes",
    )
  ) {
    payload.sharedModes =
      scenario.sharedModes;
  } else {
    payload.sharedMode =
      scenario.sharedMode;
  }

  const response = await fetch(
    `${MOCK_URL}/__test/scenario`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(10000),
    },
  );

  let responseBody;

  try {
    responseBody = await response.json();
  } catch {
    throw new Error(
      `Invalid mock response: ${scenario.name}`,
    );
  }

  assert.equal(
    response.status,
    200,
    `Mock configuration failed: ${scenario.name} - ${JSON.stringify(responseBody)}`,
  );

  assert.equal(
    responseBody.success,
    true,
    `Mock rejected scenario: ${scenario.name}`,
  );

  return guestPhone;
}

// ============================================================
// SIGNED ROUTING REQUEST
// ============================================================

async function requestRouting(
  guestPhone,
) {
  const body = JSON.stringify({
    from: guestPhone,
    to: restaurantPhone,
  });

  const timestamp = String(
    Math.floor(Date.now() / 1000),
  );

  const signature = createHmac(
    "sha256",
    secret,
  )
    .update(
      `${timestamp}.${body}`,
      "utf8",
    )
    .digest("hex");

  const response = await fetch(
    ROUTER_URL,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-FF-Timestamp": timestamp,
        "X-FF-Signature": signature,
      },
      body,
      signal: AbortSignal.timeout(15000),
    },
  );

  const payload =
    await response.json();

  return {
    status: response.status,
    payload,
  };
}

// ============================================================
// TEST EXECUTION
// ============================================================
//
// Tests use unique synthetic phone numbers.
//
// The mock scenario is configured before its
// corresponding signed router request.
//
// No real reservation records are accessed.
//
// The isolated Next.js server must be running
// against the mock database.
// ============================================================

for (
  const [index, scenario]
  of scenarios.entries()
) {
  test(
    scenario.name,
    {
      concurrency: false,
    },
    async () => {
      const guestPhone =
        await setupScenario(
          scenario,
          index,
        );

      const result =
        await requestRouting(
          guestPhone,
        );

      assert.equal(
        result.status,
        scenario.expectedStatus,
        `Unexpected HTTP status: ${scenario.name}`,
      );

      assert.equal(
        result.payload.route,
        scenario.expectedRoute,
        `Unexpected route: ${scenario.name}`,
      );

      assert.equal(
        result.payload.success,
        scenario.expectedRoute !== "block",
        `Unexpected success flag: ${scenario.name}`,
      );
    },
  );
}