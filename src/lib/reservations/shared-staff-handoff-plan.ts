import type {
  StudioExecutionReconciliation,
} from "./shared-studio-execution-reconciliation";

export const SHARED_HANDOFF_CHECK_NAMES = [
  "shared_conversation_association",
  "shared_automation_mode",
  "legacy_ownership_clear",
  "reservation_phone_unambiguous",
  "shared_phone_pair_unambiguous",
  "studio_flow_published",
  "studio_active_execution_scan",
] as const;

export type SharedHandoffCheckName =
  (typeof SHARED_HANDOFF_CHECK_NAMES)[number];

export type SharedHandoffCheck = {
  name: string;
  passed: boolean;
};

export type SharedHandoffPlanInput = {
  checks: readonly SharedHandoffCheck[];
  studio: StudioExecutionReconciliation | null;
};

export type SharedHandoffStage =
  | "preflight_validation"
  | "reservation_and_ownership"
  | "studio_configuration"
  | "studio_execution_reconciliation"
  | "operational_fence_required";

export type SharedHandoffReason =
  | "INVALID_PREFLIGHT"
  | "RESERVATION_OR_OWNERSHIP_BLOCKED"
  | "STUDIO_FLOW_NOT_VERIFIED"
  | "STUDIO_RESULT_MISMATCH"
  | "ACTIVE_EXECUTIONS_PRESENT"
  | "STUDIO_SCAN_INCOMPLETE"
  | "STUDIO_SCAN_INVALID"
  | "STUDIO_SCAN_UNAVAILABLE"
  | "OPERATIONAL_FENCE_NOT_VERIFIED";

export type SharedStaffHandoffPlan = {
  eligible: false;
  preflightReady: boolean;
  stage: SharedHandoffStage;
  reason: SharedHandoffReason;
  failedChecks: SharedHandoffCheckName[];
  activeExecutionCount: number | null;
  executionSids: string[];
  requiresExecutionCancellation: boolean;
  requiresOutboundMessageReconciliation: boolean;
  requiresRoutingFenceVerification: boolean;
  activationAuthorized: false;
  databaseChanged: false;
  studioExecutionsChanged: false;
  smsSent: false;
};

const CHECK_NAMES: ReadonlySet<string> = new Set(
  SHARED_HANDOFF_CHECK_NAMES,
);

const NON_STUDIO_CHECKS = [
  "shared_conversation_association",
  "shared_automation_mode",
  "legacy_ownership_clear",
  "reservation_phone_unambiguous",
  "shared_phone_pair_unambiguous",
] as const;

type PlanDetails = Pick<
  SharedStaffHandoffPlan,
  | "preflightReady"
  | "stage"
  | "reason"
  | "failedChecks"
  | "activeExecutionCount"
  | "executionSids"
  | "requiresExecutionCancellation"
>;

function plan(
  details: PlanDetails,
): SharedStaffHandoffPlan {
  return {
    eligible: false,
    ...details,
    requiresOutboundMessageReconciliation: true,
    requiresRoutingFenceVerification: true,
    activationAuthorized: false,
    databaseChanged: false,
    studioExecutionsChanged: false,
    smsSent: false,
  };
}

function invalidPlan(): SharedStaffHandoffPlan {
  return plan({
    preflightReady: false,
    stage: "preflight_validation",
    reason: "INVALID_PREFLIGHT",
    failedChecks: [],
    activeExecutionCount: null,
    executionSids: [],
    requiresExecutionCancellation: false,
  });
}

function validChecks(
  value: unknown,
): value is readonly SharedHandoffCheck[] {
  if (
    !Array.isArray(value) ||
    value.length !== SHARED_HANDOFF_CHECK_NAMES.length
  ) {
    return false;
  }

  const seen = new Set<string>();

  for (const item of value) {
    if (
      item === null ||
      typeof item !== "object" ||
      Array.isArray(item)
    ) {
      return false;
    }

    const check = item as Record<string, unknown>;

    if (
      typeof check.name !== "string" ||
      !CHECK_NAMES.has(check.name) ||
      typeof check.passed !== "boolean" ||
      seen.has(check.name)
    ) {
      return false;
    }

    seen.add(check.name);
  }

  return seen.size === SHARED_HANDOFF_CHECK_NAMES.length;
}

function validStudio(
  value: unknown,
): value is StudioExecutionReconciliation {
  if (
    value === null ||
    typeof value !== "object" ||
    Array.isArray(value)
  ) {
    return false;
  }

  const studio = value as Record<string, unknown>;

  if (
    !Array.isArray(studio.executionSids) ||
    !studio.executionSids.every(
      (sid: unknown) =>
        typeof sid === "string" &&
        /^FN[0-9a-f]{32}$/i.test(sid),
    )
  ) {
    return false;
  }

  switch (studio.status) {
    case "clear":
      return (
        studio.executionCount === 0 &&
        studio.executionSids.length === 0
      );

    case "active":
      return (
        typeof studio.executionCount === "number" &&
        Number.isSafeInteger(studio.executionCount) &&
        studio.executionCount > 0 &&
        studio.executionCount < 1000 &&
        studio.executionSids.length ===
          studio.executionCount &&
        new Set(studio.executionSids).size ===
          studio.executionSids.length
      );

    case "incomplete":
    case "invalid":
    case "unavailable":
      return (
        studio.executionCount === null &&
        studio.executionSids.length === 0
      );

    default:
      return false;
  }
}

/**
 * Pure, read-only diagnostic planner.
 *
 * Input must be produced from authoritative preflight
 * checks and the bounded Studio reconciliation helper.
 *
 * This helper never authorizes a transition, cancels
 * Studio executions, or sends SMS.
 *
 * Even "preflightReady" does not establish that the
 * operational routing or outbound-message fence exists.
 */
export function planSharedStaffHandoff(
  input: SharedHandoffPlanInput,
): SharedStaffHandoffPlan {
  if (
    !input ||
    !validChecks(input.checks)
  ) {
    return invalidPlan();
  }

  const byName = new Map(
    input.checks.map(
      (check) => [check.name, check.passed],
    ),
  );

  const failedChecks =
    SHARED_HANDOFF_CHECK_NAMES.filter(
      (name) => byName.get(name) !== true,
    );

  const ownershipBlocked = NON_STUDIO_CHECKS.some(
    (name) => byName.get(name) !== true,
  );

  // No operation should be planned while the
  // reservation association or ownership is invalid.
  if (ownershipBlocked) {
    return plan({
      preflightReady: false,
      stage: "reservation_and_ownership",
      reason: "RESERVATION_OR_OWNERSHIP_BLOCKED",
      failedChecks,
      activeExecutionCount: null,
      executionSids: [],
      requiresExecutionCancellation: false,
    });
  }

  // An unpublished or unverified Flow must not
  // trigger execution cancellation.
  if (byName.get("studio_flow_published") !== true) {
    return plan({
      preflightReady: false,
      stage: "studio_configuration",
      reason: "STUDIO_FLOW_NOT_VERIFIED",
      failedChecks,
      activeExecutionCount: null,
      executionSids: [],
      requiresExecutionCancellation: false,
    });
  }

  if (!validStudio(input.studio)) {
    return plan({
      preflightReady: false,
      stage: "studio_execution_reconciliation",
      reason: "STUDIO_SCAN_INVALID",
      failedChecks,
      activeExecutionCount: null,
      executionSids: [],
      requiresExecutionCancellation: false,
    });
  }

  const studio = input.studio;

  // Protect against disagreement between the
  // preflight check and reconciliation result.
  const expectedStudioCheck =
    studio.status === "clear";

  if (
    byName.get("studio_active_execution_scan") !==
    expectedStudioCheck
  ) {
    return plan({
      preflightReady: false,
      stage: "studio_execution_reconciliation",
      reason: "STUDIO_RESULT_MISMATCH",
      failedChecks,
      activeExecutionCount: null,
      executionSids: [],
      requiresExecutionCancellation: false,
    });
  }

  if (studio.status === "active") {
    return plan({
      preflightReady: false,
      stage: "studio_execution_reconciliation",
      reason: "ACTIVE_EXECUTIONS_PRESENT",
      failedChecks,
      activeExecutionCount: studio.executionCount,
      executionSids: [...studio.executionSids],
      requiresExecutionCancellation: true,
    });
  }

  if (studio.status === "incomplete") {
    return plan({
      preflightReady: false,
      stage: "studio_execution_reconciliation",
      reason: "STUDIO_SCAN_INCOMPLETE",
      failedChecks,
      activeExecutionCount: null,
      executionSids: [],
      requiresExecutionCancellation: false,
    });
  }

  if (studio.status === "invalid") {
    return plan({
      preflightReady: false,
      stage: "studio_execution_reconciliation",
      reason: "STUDIO_SCAN_INVALID",
      failedChecks,
      activeExecutionCount: null,
      executionSids: [],
      requiresExecutionCancellation: false,
    });
  }

  if (studio.status === "unavailable") {
    return plan({
      preflightReady: false,
      stage: "studio_execution_reconciliation",
      reason: "STUDIO_SCAN_UNAVAILABLE",
      failedChecks,
      activeExecutionCount: null,
      executionSids: [],
      requiresExecutionCancellation: false,
    });
  }

  // All seven diagnostics are clear, but they
  // are only a point-in-time observation.
  //
  // No routing fence, outbound-message fence,
  // or atomic provider handoff is established here.
  return plan({
    preflightReady: true,
    stage: "operational_fence_required",
    reason: "OPERATIONAL_FENCE_NOT_VERIFIED",
    failedChecks: [],
    activeExecutionCount: 0,
    executionSids: [],
    requiresExecutionCancellation: false,
  });
}