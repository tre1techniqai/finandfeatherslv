import test from "node:test";
import assert from "node:assert/strict";

import {
  planSharedStaffHandoff,
  SHARED_HANDOFF_CHECK_NAMES,
} from "../src/lib/reservations/shared-staff-handoff-plan.ts";

const EXECUTION_SID = "FN" + "a".repeat(32);

function checks(failures = []) {
  return SHARED_HANDOFF_CHECK_NAMES.map(
    (name) => ({
      name,
      passed: !failures.includes(name),
    }),
  );
}

function input({
  failures = [],
  studio = {
    status: "clear",
    executionCount: 0,
    executionSids: [],
  },
} = {}) {
  return {
    checks: checks(failures),
    studio,
  };
}

function assertSafe(plan) {
  assert.equal(plan.eligible, false);
  assert.equal(plan.activationAuthorized, false);
  assert.equal(plan.databaseChanged, false);
  assert.equal(plan.studioExecutionsChanged, false);
  assert.equal(plan.smsSent, false);

  assert.equal(
    plan.requiresOutboundMessageReconciliation,
    true,
  );

  assert.equal(
    plan.requiresRoutingFenceVerification,
    true,
  );
}

test("01 - Clear preflight still blocks activation", () => {
  const result = planSharedStaffHandoff(input());

  assertSafe(result);
  assert.equal(result.preflightReady, true);
  assert.equal(
    result.stage,
    "operational_fence_required",
  );
  assert.equal(
    result.reason,
    "OPERATIONAL_FENCE_NOT_VERIFIED",
  );
  assert.equal(result.activeExecutionCount, 0);
  assert.deepEqual(result.failedChecks, []);
});

test("02 - Active Studio execution requires reconciliation", () => {
  const result = planSharedStaffHandoff(
    input({
      failures: ["studio_active_execution_scan"],
      studio: {
        status: "active",
        executionCount: 1,
        executionSids: [EXECUTION_SID],
      },
    }),
  );

  assertSafe(result);
  assert.equal(result.preflightReady, false);
  assert.equal(
    result.reason,
    "ACTIVE_EXECUTIONS_PRESENT",
  );
  assert.equal(result.activeExecutionCount, 1);
  assert.equal(
    result.requiresExecutionCancellation,
    true,
  );
  assert.deepEqual(
    result.executionSids,
    [EXECUTION_SID],
  );
});

test("03 - Incomplete Studio scan fails closed", () => {
  const result = planSharedStaffHandoff(
    input({
      failures: ["studio_active_execution_scan"],
      studio: {
        status: "incomplete",
        executionCount: null,
        executionSids: [],
      },
    }),
  );

  assertSafe(result);
  assert.equal(
    result.reason,
    "STUDIO_SCAN_INCOMPLETE",
  );
  assert.equal(result.activeExecutionCount, null);
  assert.equal(
    result.requiresExecutionCancellation,
    false,
  );
});

test("04 - Invalid Studio result fails closed", () => {
  const result = planSharedStaffHandoff(
    input({
      failures: ["studio_active_execution_scan"],
      studio: {
        status: "invalid",
        executionCount: null,
        executionSids: [],
      },
    }),
  );

  assertSafe(result);
  assert.equal(
    result.reason,
    "STUDIO_SCAN_INVALID",
  );
});

test("05 - Unavailable Studio result fails closed", () => {
  const result = planSharedStaffHandoff(
    input({
      failures: ["studio_active_execution_scan"],
      studio: {
        status: "unavailable",
        executionCount: null,
        executionSids: [],
      },
    }),
  );

  assertSafe(result);
  assert.equal(
    result.reason,
    "STUDIO_SCAN_UNAVAILABLE",
  );
});

test("06 - Unpublished Flow blocks handoff", () => {
  const result = planSharedStaffHandoff(
    input({
      failures: [
        "studio_flow_published",
        "studio_active_execution_scan",
      ],
      studio: null,
    }),
  );

  assertSafe(result);
  assert.equal(
    result.stage,
    "studio_configuration",
  );
  assert.equal(
    result.reason,
    "STUDIO_FLOW_NOT_VERIFIED",
  );
});

test("07 - Reservation association failure blocks handoff", () => {
  const result = planSharedStaffHandoff(
    input({
      failures: ["shared_conversation_association"],
    }),
  );

  assertSafe(result);
  assert.equal(
    result.reason,
    "RESERVATION_OR_OWNERSHIP_BLOCKED",
  );
  assert.equal(
    result.requiresExecutionCancellation,
    false,
  );
});

test("08 - Legacy ownership conflict blocks handoff", () => {
  const result = planSharedStaffHandoff(
    input({
      failures: ["legacy_ownership_clear"],
    }),
  );

  assertSafe(result);
  assert.equal(
    result.reason,
    "RESERVATION_OR_OWNERSHIP_BLOCKED",
  );
});

test("09 - Ambiguous reservation phone blocks handoff", () => {
  const result = planSharedStaffHandoff(
    input({
      failures: ["reservation_phone_unambiguous"],
    }),
  );

  assertSafe(result);
  assert.equal(
    result.stage,
    "reservation_and_ownership",
  );
});

test("10 - Ambiguous shared phone pair blocks handoff", () => {
  const result = planSharedStaffHandoff(
    input({
      failures: ["shared_phone_pair_unambiguous"],
    }),
  );

  assertSafe(result);
  assert.equal(
    result.preflightReady,
    false,
  );
});

test("11 - Invalid check count fails closed", () => {
  const result = planSharedStaffHandoff({
    checks: checks().slice(0, 6),
    studio: {
      status: "clear",
      executionCount: 0,
      executionSids: [],
    },
  });

  assertSafe(result);
  assert.equal(
    result.reason,
    "INVALID_PREFLIGHT",
  );
});

test("12 - Duplicate diagnostic check fails closed", () => {
  const list = checks();
  list[6] = { ...list[5] };

  const result = planSharedStaffHandoff({
    checks: list,
    studio: {
      status: "clear",
      executionCount: 0,
      executionSids: [],
    },
  });

  assertSafe(result);
  assert.equal(
    result.reason,
    "INVALID_PREFLIGHT",
  );
});

test("13 - Unknown diagnostic name fails closed", () => {
  const list = checks();

  list[0] = {
    name: "unrecognized_check",
    passed: true,
  };

  const result = planSharedStaffHandoff({
    checks: list,
    studio: {
      status: "clear",
      executionCount: 0,
      executionSids: [],
    },
  });

  assertSafe(result);
  assert.equal(
    result.reason,
    "INVALID_PREFLIGHT",
  );
});

test("14 - Studio and preflight disagreement fails closed", () => {
  const result = planSharedStaffHandoff(
    input({
      studio: {
        status: "active",
        executionCount: 1,
        executionSids: [EXECUTION_SID],
      },
    }),
  );

  assertSafe(result);
  assert.equal(
    result.reason,
    "STUDIO_RESULT_MISMATCH",
  );
  assert.equal(result.activeExecutionCount, null);
});

test("15 - Invalid active execution count is rejected", () => {
  const result = planSharedStaffHandoff(
    input({
      failures: ["studio_active_execution_scan"],
      studio: {
        status: "active",
        executionCount: 2,
        executionSids: [EXECUTION_SID],
      },
    }),
  );

  assertSafe(result);
  assert.equal(
    result.reason,
    "STUDIO_SCAN_INVALID",
  );
});

test("16 - Missing Studio reconciliation fails closed", () => {
  const result = planSharedStaffHandoff(
    input({
      studio: null,
    }),
  );

  assertSafe(result);
  assert.equal(
    result.reason,
    "STUDIO_SCAN_INVALID",
  );
});

test("17 - Invalid execution SID fails closed", () => {
  const result = planSharedStaffHandoff(
    input({
      failures: ["studio_active_execution_scan"],
      studio: {
        status: "active",
        executionCount: 1,
        executionSids: ["NOT_A_TWILIO_SID"],
      },
    }),
  );

  assertSafe(result);
  assert.equal(
    result.reason,
    "STUDIO_SCAN_INVALID",
  );
});

test("18 - Planner does not mutate its inputs", () => {
  const original = input();
  const snapshot = JSON.stringify(original);

  const result = planSharedStaffHandoff(original);

  assertSafe(result);
  assert.equal(JSON.stringify(original), snapshot);
});

test("19 - All operational plans prohibit sending", () => {
  const scenarios = [
    input(),
    input({
      failures: ["studio_active_execution_scan"],
      studio: {
        status: "active",
        executionCount: 1,
        executionSids: [EXECUTION_SID],
      },
    }),
    input({
      failures: [
        "studio_flow_published",
        "studio_active_execution_scan",
      ],
      studio: null,
    }),
    input({
      failures: ["legacy_ownership_clear"],
    }),
  ];

  for (const scenario of scenarios) {
    const result = planSharedStaffHandoff(scenario);
    assertSafe(result);
  }
});