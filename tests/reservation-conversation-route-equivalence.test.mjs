
import test from "node:test";
import assert from "node:assert/strict";

import {
  decideSharedConversationRoute,
} from "../src/lib/reservations/conversation-routing-decision.ts";

// ============================================================
// FIN & FEATHERS | DEMO-SMS-001
// STEP 58D.11.20A
//
// Local-only behavioral comparison.
//
// The reference implementation below represents
// the existing application router's decision rules.
//
// No server, database, Twilio, or environment variables
// are needed.
//
// This verifies routing decisions, not HTTP behavior
// or Studio execution safety.
// ============================================================

const LEGACY_STATUSES = [
  null,
  "automation",
  "handoff_pending",
  "staff",
  "released",
  "unexpected_status",
];

const SHARED_MODES = [
  null,
  "automation",
  "transitioning_to_staff",
  "staff",
  "unexpected_mode",
];

const BOOLEAN_VALUES = [false, true];

// ============================================================
// CURRENT APPLICATION ROUTER REFERENCE
//
// Based on the existing legacyRoute() and sharedRoute()
// implementations reviewed in:
//
// src/app/api/twilio/conversation-route/route.ts
//
// Keep this reference independent of the centralized
// policy to detect differences in decision behavior.
// ============================================================

function referenceLegacyRoute(
  status,
  readiness,
) {
  if (
    status === null ||
    status === "automation" ||
    status === "released"
  ) {
    return "automation";
  }

  if (status === "handoff_pending") {
    if (readiness.handoffFenceEnabled) {
      return "block";
    }

    return "automation";
  }

  if (status === "staff") {
    if (!readiness.staffRoutingEnabled) {
      return "block";
    }

    return "staff";
  }

  return "block";
}

function referenceSharedRoute(
  mode,
  legacyStatus,
  readiness,
) {
  if (mode === "transitioning_to_staff") {
    return "block";
  }

  if (mode === "staff") {
    if (!readiness.staffRoutingEnabled) {
      return "block";
    }

    if (
      legacyStatus === "staff" ||
      legacyStatus === "handoff_pending"
    ) {
      return "block";
    }

    return "staff";
  }

  return referenceLegacyRoute(
    legacyStatus,
    readiness,
  );
}

function referenceRouterDecision({
  legacyStatus,
  sharedMode,
  legacyError,
  sharedError,
  readiness,
}) {
  // The current router verifies legacy ownership
  // before considering shared routing.
  if (legacyError) {
    return "block";
  }

  // The real router validates database status
  // values and blocks unexpected values.
  if (
    legacyStatus !== null &&
    ![
      "automation",
      "handoff_pending",
      "staff",
      "released",
    ].includes(legacyStatus)
  ) {
    return "block";
  }

  if (!readiness.sharedRoutingEnabled) {
    return referenceLegacyRoute(
      legacyStatus,
      readiness,
    );
  }

  if (sharedError) {
    return "block";
  }

  if (sharedMode === null) {
    return referenceLegacyRoute(
      legacyStatus,
      readiness,
    );
  }

  if (
    ![
      "automation",
      "transitioning_to_staff",
      "staff",
    ].includes(sharedMode)
  ) {
    return "block";
  }

  return referenceSharedRoute(
    sharedMode,
    legacyStatus,
    readiness,
  );
}

// ============================================================
// CENTRALIZED POLICY INPUT ADAPTERS
//
// These simulate the validated lookup results that
// the application router passes to its decision logic.
// ============================================================

function legacyLookup(
  status,
  failed,
) {
  if (failed) {
    return { kind: "error" };
  }

  if (status === null) {
    return { kind: "not_found" };
  }

  if (
    ![
      "automation",
      "handoff_pending",
      "staff",
      "released",
    ].includes(status)
  ) {
    // Unknown database values must fail closed.
    return { kind: "error" };
  }

  return {
    kind: "found",
    status,
  };
}

function sharedLookup(
  mode,
  failed,
) {
  if (failed) {
    return { kind: "error" };
  }

  if (mode === null) {
    return { kind: "not_found" };
  }

  return {
    kind: "found",
    mode,
  };
}

// ============================================================
// ROUTING EQUIVALENCE MATRIX
//
// 6 legacy states
// x 5 shared states
// x 8 readiness configurations
// x 4 database failure combinations
//
// Total: 960 distinct combinations.
//
// The policy runs entirely in memory.
// ============================================================

test(
  "Centralized routing matches the existing router decision matrix",
  () => {
    let comparisons = 0;

    for (const legacyStatus of LEGACY_STATUSES) {
      for (const sharedMode of SHARED_MODES) {
        for (const sharedRoutingEnabled of BOOLEAN_VALUES) {
          for (const staffRoutingEnabled of BOOLEAN_VALUES) {
            for (const handoffFenceEnabled of BOOLEAN_VALUES) {
              for (const legacyError of BOOLEAN_VALUES) {
                for (const sharedError of BOOLEAN_VALUES) {
                  const readiness = {
                    sharedRoutingEnabled,
                    staffRoutingEnabled,
                    handoffFenceEnabled,
                  };

                  const scenario = {
                    legacyStatus,
                    sharedMode,
                    legacyError,
                    sharedError,
                    readiness,
                  };

                  const expected =
                    referenceRouterDecision(scenario);

                  const actual =
                    decideSharedConversationRoute(
                      legacyLookup(
                        legacyStatus,
                        legacyError,
                      ),
                      sharedLookup(
                        sharedMode,
                        sharedError,
                      ),
                      readiness,
                    ).route;

                  assert.equal(
                    actual,
                    expected,
                    `Routing mismatch: ${JSON.stringify(
                      scenario,
                    )}`,
                  );

                  comparisons++;
                }
              }
            }
          }
        }
      }
    }

    assert.equal(comparisons, 960);
  },
);

// ============================================================
// EXPLICIT SAFETY REGRESSIONS
// ============================================================

test(
  "Shared transition always blocks routing",
  () => {
    for (const legacyStatus of [
      null,
      "automation",
      "handoff_pending",
      "staff",
      "released",
    ]) {
      const decision =
        decideSharedConversationRoute(
          legacyLookup(legacyStatus, false),
          {
            kind: "found",
            mode: "transitioning_to_staff",
          },
          {
            sharedRoutingEnabled: true,
            staffRoutingEnabled: true,
            handoffFenceEnabled: true,
          },
        );

      assert.equal(decision.route, "block");
      assert.equal(
        decision.reason,
        "SHARED_TRANSITION_PENDING",
      );
    }
  },
);

test(
  "Shared routing never overrides conflicting legacy ownership",
  () => {
    for (const legacyStatus of [
      "staff",
      "handoff_pending",
    ]) {
      const decision =
        decideSharedConversationRoute(
          legacyLookup(legacyStatus, false),
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

      assert.equal(decision.route, "block");
      assert.equal(
        decision.reason,
        "SHARED_LEGACY_CONFLICT",
      );
    }
  },
);

test(
  "Disabled shared routing preserves legacy decisions",
  () => {
    for (const legacyStatus of [
      null,
      "automation",
      "handoff_pending",
      "staff",
      "released",
    ]) {
      for (const staffRoutingEnabled of BOOLEAN_VALUES) {
        for (const handoffFenceEnabled of BOOLEAN_VALUES) {
          const readiness = {
            sharedRoutingEnabled: false,
            staffRoutingEnabled,
            handoffFenceEnabled,
          };

          const actual =
            decideSharedConversationRoute(
              legacyLookup(
                legacyStatus,
                false,
              ),
              { kind: "error" },
              readiness,
            );

          const expected =
            referenceLegacyRoute(
              legacyStatus,
              readiness,
            );

          assert.equal(
            actual.route,
            expected,
          );
        }
      }
    }
  },
);
