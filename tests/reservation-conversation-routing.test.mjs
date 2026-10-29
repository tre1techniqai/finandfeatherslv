
import test from "node:test";
import assert from "node:assert/strict";

import {
  decideConversationRoute,
  decideSharedConversationRoute,
} from "../src/lib/reservations/conversation-routing-decision.ts";

const NOT_FOUND = { kind: "not_found" };
const LOOKUP_ERROR = { kind: "error" };

const LEGACY_AUTOMATION = {
  kind: "found",
  status: "automation",
};

const LEGACY_PENDING = {
  kind: "found",
  status: "handoff_pending",
};

const LEGACY_STAFF = {
  kind: "found",
  status: "staff",
};

const LEGACY_RELEASED = {
  kind: "found",
  status: "released",
};

const SHARED_AUTOMATION = {
  kind: "found",
  mode: "automation",
};

const SHARED_TRANSITIONING = {
  kind: "found",
  mode: "transitioning_to_staff",
};

const SHARED_STAFF = {
  kind: "found",
  mode: "staff",
};

const LEGACY_READY = {
  staffInboundEnabled: true,
  studioHandoffVerified: true,
};

const LEGACY_NOT_READY = {
  staffInboundEnabled: false,
  studioHandoffVerified: false,
};

const SHARED_READY = {
  sharedRoutingEnabled: true,
  staffRoutingEnabled: true,
  handoffFenceEnabled: true,
};

function sharedReadiness(overrides = {}) {
  return {
    ...SHARED_READY,
    ...overrides,
  };
}

function assertLegacyDecision(
  ownership,
  readiness,
  destination,
  reason,
) {
  assert.deepEqual(
    decideConversationRoute(ownership, readiness),
    { destination, reason },
  );
}

function assertSharedDecision(
  legacy,
  shared,
  readiness,
  route,
  reason,
) {
  assert.deepEqual(
    decideSharedConversationRoute(
      legacy,
      shared,
      readiness,
    ),
    { route, reason },
  );
}

// ============================================================
// LEGACY INBOUND ROUTING
//
// Preserve the historical inbound webhook policy.
// Do not confuse this with the separate Studio router,
// which supports a pending-handoff fence.
// ============================================================

test("01 - Legacy lookup failure blocks routing", () => {
  assertLegacyDecision(
    LOOKUP_ERROR,
    LEGACY_READY,
    "blocked",
    "OWNERSHIP_LOOKUP_FAILED",
  );
});

test("02 - Missing legacy record selects Studio", () => {
  assertLegacyDecision(
    NOT_FOUND,
    LEGACY_NOT_READY,
    "studio",
    "NO_OWNERSHIP_RECORD",
  );
});

test("03 - Legacy automation remains in Studio", () => {
  assertLegacyDecision(
    LEGACY_AUTOMATION,
    LEGACY_NOT_READY,
    "studio",
    "AUTOMATION_OWNER",
  );
});

test("04 - Historical pending handoff remains in Studio", () => {
  assertLegacyDecision(
    LEGACY_PENDING,
    LEGACY_NOT_READY,
    "studio",
    "HANDOFF_NOT_COMPLETED",
  );
});

test("05 - Released legacy ownership returns to Studio", () => {
  assertLegacyDecision(
    LEGACY_RELEASED,
    LEGACY_NOT_READY,
    "studio",
    "RELEASED_TO_AUTOMATION",
  );
});

test("06 - Verified legacy staff routing is permitted", () => {
  assertLegacyDecision(
    LEGACY_STAFF,
    LEGACY_READY,
    "staff",
    "STAFF_ROUTING_VERIFIED",
  );
});

test("07 - Unverified legacy staff routing is blocked", () => {
  assertLegacyDecision(
    LEGACY_STAFF,
    LEGACY_NOT_READY,
    "blocked",
    "STAFF_ROUTING_NOT_READY",
  );
});

test("08 - Both legacy readiness checks are required", () => {
  for (const readiness of [
    {
      staffInboundEnabled: true,
      studioHandoffVerified: false,
    },
    {
      staffInboundEnabled: false,
      studioHandoffVerified: true,
    },
  ]) {
    assertLegacyDecision(
      LEGACY_STAFF,
      readiness,
      "blocked",
      "STAFF_ROUTING_NOT_READY",
    );
  }
});

// ============================================================
// SHARED ROUTING DISABLED
//
// Preserve legacy Studio router behavior when the
// shared feature flag is disabled.
// ============================================================

test("09 - Disabled shared routing preserves automation", () => {
  assertSharedDecision(
    LEGACY_AUTOMATION,
    SHARED_STAFF,
    sharedReadiness({
      sharedRoutingEnabled: false,
    }),
    "automation",
    "LEGACY_AUTOMATION",
  );
});

test("10 - Disabled shared routing preserves legacy staff", () => {
  assertSharedDecision(
    LEGACY_STAFF,
    SHARED_STAFF,
    sharedReadiness({
      sharedRoutingEnabled: false,
    }),
    "staff",
    "LEGACY_STAFF",
  );
});

test("11 - Disabled shared routing honors handoff fence", () => {
  assertSharedDecision(
    LEGACY_PENDING,
    SHARED_STAFF,
    sharedReadiness({
      sharedRoutingEnabled: false,
    }),
    "block",
    "LEGACY_PENDING_BLOCKED",
  );
});

test("12 - Disabled handoff fence preserves legacy automation", () => {
  assertSharedDecision(
    LEGACY_PENDING,
    SHARED_AUTOMATION,
    sharedReadiness({
      sharedRoutingEnabled: false,
      handoffFenceEnabled: false,
    }),
    "automation",
    "LEGACY_PENDING_AUTOMATION",
  );
});

test("13 - Disabled staff routing blocks legacy staff", () => {
  assertSharedDecision(
    LEGACY_STAFF,
    NOT_FOUND,
    sharedReadiness({
      sharedRoutingEnabled: false,
      staffRoutingEnabled: false,
    }),
    "block",
    "LEGACY_STAFF_NOT_READY",
  );
});

// ============================================================
// SHARED ROUTING ENABLED
// ============================================================

test("14 - Missing shared record preserves legacy automation", () => {
  assertSharedDecision(
    NOT_FOUND,
    NOT_FOUND,
    SHARED_READY,
    "automation",
    "LEGACY_AUTOMATION",
  );
});

test("15 - Missing shared record preserves legacy staff", () => {
  assertSharedDecision(
    LEGACY_STAFF,
    NOT_FOUND,
    SHARED_READY,
    "staff",
    "LEGACY_STAFF",
  );
});

test("16 - Shared automation preserves legacy handoff fence", () => {
  assertSharedDecision(
    LEGACY_PENDING,
    SHARED_AUTOMATION,
    SHARED_READY,
    "block",
    "LEGACY_PENDING_BLOCKED",
  );
});

test("17 - Pending shared activation blocks routing", () => {
  for (const legacy of [
    NOT_FOUND,
    LEGACY_AUTOMATION,
    LEGACY_PENDING,
    LEGACY_STAFF,
    LEGACY_RELEASED,
  ]) {
    assertSharedDecision(
      legacy,
      SHARED_TRANSITIONING,
      SHARED_READY,
      "block",
      "SHARED_TRANSITION_PENDING",
    );
  }
});

test("18 - Shared staff mode permits verified staff routing", () => {
  assertSharedDecision(
    NOT_FOUND,
    SHARED_STAFF,
    SHARED_READY,
    "staff",
    "SHARED_STAFF_ACTIVE",
  );
});

test("19 - Shared staff mode blocks conflicting legacy staff", () => {
  assertSharedDecision(
    LEGACY_STAFF,
    SHARED_STAFF,
    SHARED_READY,
    "block",
    "SHARED_LEGACY_CONFLICT",
  );
});

test("20 - Shared staff mode blocks pending legacy handoff", () => {
  assertSharedDecision(
    LEGACY_PENDING,
    SHARED_STAFF,
    SHARED_READY,
    "block",
    "SHARED_LEGACY_CONFLICT",
  );
});

test("21 - Shared staff mode requires staff routing readiness", () => {
  assertSharedDecision(
    LEGACY_AUTOMATION,
    SHARED_STAFF,
    sharedReadiness({
      staffRoutingEnabled: false,
    }),
    "block",
    "SHARED_STAFF_NOT_READY",
  );
});

test("22 - Shared lookup failure blocks routing", () => {
  assertSharedDecision(
    LEGACY_AUTOMATION,
    LOOKUP_ERROR,
    SHARED_READY,
    "block",
    "SHARED_LOOKUP_FAILED",
  );
});

test("23 - Legacy lookup failure always blocks routing", () => {
  for (const shared of [
    NOT_FOUND,
    SHARED_AUTOMATION,
    SHARED_TRANSITIONING,
    SHARED_STAFF,
    LOOKUP_ERROR,
  ]) {
    assertSharedDecision(
      LOOKUP_ERROR,
      shared,
      SHARED_READY,
      "block",
      "LEGACY_LOOKUP_FAILED",
    );
  }
});

test("24 - Unknown shared mode fails closed", () => {
  assertSharedDecision(
    LEGACY_AUTOMATION,
    {
      kind: "found",
      mode: "unexpected_mode",
    },
    SHARED_READY,
    "block",
    "INVALID_SHARED_MODE",
  );
});
