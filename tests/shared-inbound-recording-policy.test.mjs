import test from "node:test";
import assert from "node:assert/strict";

import {
  decideSharedInboundRecording,
} from "../src/lib/reservations/shared-inbound-recording-policy.ts";

import {
  decideSharedConversationRoute,
} from "../src/lib/reservations/conversation-routing-decision.ts";

const READY = {
  sharedRoutingEnabled: true,
  staffRoutingVerified: true,
  studioHandoffFenceEnabled: true,
  inboundRecordingEnabled: true,
};

const STAFF = {
  status: "found",
  mode: "staff",
};

const AUTOMATION = {
  status: "found",
  mode: "automation",
};

const TRANSITIONING = {
  status: "found",
  mode: "transitioning_to_staff",
};

const MISSING = {
  status: "missing",
};

const LOOKUP_ERROR = {
  status: "error",
};

function decide({
  shared = STAFF,
  legacy = "none",
  readiness = READY,
} = {}) {
  return decideSharedInboundRecording({
    shared,
    legacy,
    readiness,
  });
}

function expectDecision(input, decision, reason) {
  assert.deepEqual(decide(input), {
    decision,
    reason,
  });
}

test("01 - Verified shared staff conversation is recordable", () => {
  expectDecision(
    {},
    "record",
    "VERIFIED_SHARED_STAFF_CONVERSATION",
  );
});

test("02 - Existing automation conversation is skipped", () => {
  expectDecision(
    { shared: AUTOMATION },
    "skip",
    "EXISTING_AUTOMATION_CONVERSATION",
  );
});

test("03 - Transitioning conversation is blocked", () => {
  expectDecision(
    { shared: TRANSITIONING },
    "block",
    "SHARED_CONVERSATION_TRANSITIONING",
  );
});

test("04 - Unclassified first-time conversation is blocked", () => {
  expectDecision(
    { shared: MISSING },
    "block",
    "UNCLASSIFIED_NEW_CONVERSATION",
  );
});

test("05 - Shared lookup failure blocks recording", () => {
  expectDecision(
    { shared: LOOKUP_ERROR },
    "block",
    "LOOKUP_UNAVAILABLE",
  );
});

test("06 - Legacy lookup failure blocks recording", () => {
  expectDecision(
    { legacy: "error" },
    "block",
    "LOOKUP_UNAVAILABLE",
  );
});

test("07 - Legacy staff ownership conflicts", () => {
  expectDecision(
    { legacy: "staff" },
    "block",
    "LEGACY_OWNERSHIP_CONFLICT",
  );
});

test("08 - Pending legacy handoff conflicts", () => {
  expectDecision(
    { legacy: "pending" },
    "block",
    "LEGACY_OWNERSHIP_CONFLICT",
  );
});

test("09 - Legacy automation is not sufficient for recording", () => {
  expectDecision(
    { legacy: "automation" },
    "block",
    "LEGACY_OWNERSHIP_CONFLICT",
  );
});

test("10 - Disabled recording blocks the operation", () => {
  expectDecision(
    {
      readiness: {
        ...READY,
        inboundRecordingEnabled: false,
      },
    },
    "block",
    "RECORDING_NOT_READY",
  );
});

test("11 - Disabled shared routing blocks recording", () => {
  expectDecision(
    {
      readiness: {
        ...READY,
        sharedRoutingEnabled: false,
      },
    },
    "block",
    "SHARED_ROUTING_NOT_READY",
  );
});

test("12 - Unverified staff routing blocks recording", () => {
  expectDecision(
    {
      readiness: {
        ...READY,
        staffRoutingVerified: false,
      },
    },
    "block",
    "STAFF_ROUTING_NOT_READY",
  );
});

test("13 - Disabled Studio handoff fence blocks recording", () => {
  expectDecision(
    {
      readiness: {
        ...READY,
        studioHandoffFenceEnabled: false,
      },
    },
    "block",
    "STUDIO_FENCE_NOT_READY",
  );
});

test("14 - Invalid legacy status fails closed", () => {
  assert.deepEqual(
    decide({ legacy: "unexpected" }),
    {
      decision: "block",
      reason: "INVALID_INPUT",
    },
  );
});

test("15 - Invalid shared mode fails closed", () => {
  assert.deepEqual(
    decide({
      shared: {
        status: "found",
        mode: "unexpected",
      },
    }),
    {
      decision: "block",
      reason: "INVALID_INPUT",
    },
  );
});

test("16 - Missing lookup carrying a mode is invalid", () => {
  assert.deepEqual(
    decide({
      shared: {
        status: "missing",
        mode: "staff",
      },
    }),
    {
      decision: "block",
      reason: "INVALID_INPUT",
    },
  );
});

test("17 - Missing readiness object fails closed", () => {
  assert.deepEqual(
    decideSharedInboundRecording({
      shared: STAFF,
      legacy: "none",
    }),
    {
      decision: "block",
      reason: "INVALID_INPUT",
    },
  );
});

test("18 - Nonboolean readiness fails closed", () => {
  assert.deepEqual(
    decide({
      readiness: {
        ...READY,
        staffRoutingVerified: "true",
      },
    }),
    {
      decision: "block",
      reason: "INVALID_INPUT",
    },
  );
});

test("19 - Null input fails closed", () => {
  assert.deepEqual(
    decideSharedInboundRecording(null),
    {
      decision: "block",
      reason: "INVALID_INPUT",
    },
  );
});

test("20 - Every readiness combination is conservative", () => {
  const flags = [
    "sharedRoutingEnabled",
    "staffRoutingVerified",
    "studioHandoffFenceEnabled",
    "inboundRecordingEnabled",
  ];

  let checked = 0;

  for (let mask = 0; mask < 16; mask++) {
    const readiness = {};

    flags.forEach((flag, index) => {
      readiness[flag] = Boolean(mask & (1 << index));
    });

    const result = decide({ readiness });

    if (mask === 15) {
      assert.equal(result.decision, "record");
    } else {
      assert.equal(result.decision, "block");
    }

    checked++;
  }

  assert.equal(checked, 16);
});

test("21 - Complete decision matrix permits recording only in safe state", () => {
  const sharedStates = [
    STAFF,
    AUTOMATION,
    TRANSITIONING,
    MISSING,
    LOOKUP_ERROR,
  ];

  const legacyStates = [
    "none",
    "automation",
    "staff",
    "pending",
    "error",
  ];

  const readinessFlags = [
    "sharedRoutingEnabled",
    "staffRoutingVerified",
    "studioHandoffFenceEnabled",
    "inboundRecordingEnabled",
  ];

  let checked = 0;
  let permitted = 0;

  for (const shared of sharedStates) {
    for (const legacy of legacyStates) {
      for (let mask = 0; mask < 16; mask++) {
        const readiness = {};

        readinessFlags.forEach((flag, index) => {
          readiness[flag] = Boolean(mask & (1 << index));
        });

        const result = decide({
          shared,
          legacy,
          readiness,
        });

        const shouldRecord =
          shared.status === "found" &&
          shared.mode === "staff" &&
          legacy === "none" &&
          mask === 15;

        assert.equal(
          result.decision === "record",
          shouldRecord,
          JSON.stringify({
            shared,
            legacy,
            readiness,
            result,
          }),
        );

        if (result.decision === "record") {
          permitted++;
        }

        checked++;
      }
    }
  }

  assert.equal(checked, 400);
  assert.equal(permitted, 1);
});

test("22 - Every permitted recording is also eligible for staff routing", () => {
  // Map the inbound policy's legacy "none" to the
  // centralized router's legacy "not_found" state.
  //
  // The router and recorder use separate readiness objects,
  // so their respective feature gates are checked independently.

  const routingDecision = decideSharedConversationRoute(
    { kind: "not_found" },
    {
      kind: "found",
      mode: "staff",
    },
    {
      sharedRoutingEnabled: true,
      staffRoutingEnabled: true,
      handoffFenceEnabled: true,
    },
  );

  const recordingDecision = decide({
    shared: STAFF,
    legacy: "none",
    readiness: READY,
  });

  assert.equal(recordingDecision.decision, "record");
  assert.equal(routingDecision.route, "staff");
});

test("23 - A blocked routing state cannot authorize recording", () => {
  const routingDecision = decideSharedConversationRoute(
    { kind: "found", status: "handoff_pending" },
    {
      kind: "found",
      mode: "staff",
    },
    {
      sharedRoutingEnabled: true,
      staffRoutingEnabled: true,
      handoffFenceEnabled: true,
    },
  );

  const recordingDecision = decide({
    shared: STAFF,
    legacy: "pending",
    readiness: READY,
  });

  assert.equal(routingDecision.route, "block");
  assert.equal(recordingDecision.decision, "block");
});

test("24 - Unknown lookup states never authorize recording", () => {
  const invalidCases = [
    {
      shared: { status: "unknown" },
      legacy: "none",
    },
    {
      shared: { status: "found", mode: "released" },
      legacy: "none",
    },
    {
      shared: STAFF,
      legacy: "released",
    },
    {
      shared: {
        status: "error",
        mode: "staff",
      },
      legacy: "none",
    },
  ];

  for (const input of invalidCases) {
    const result = decide(input);

    assert.notEqual(
      result.decision,
      "record",
      JSON.stringify(input),
    );
  }
});