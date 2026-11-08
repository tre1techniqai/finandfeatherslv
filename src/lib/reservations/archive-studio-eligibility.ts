/**
 * Pure, reservation-specific eligibility decision for ARCHIVE.
 * Does not fetch Twilio data, mutate the database, or send messages.
 * A successful result is only a preflight, not an atomic automation fence.
 */

const EXECUTION_SID = /^FN[0-9a-f]{32}$/i;
const FLOW_SID = /^FW[0-9a-f]{32}$/i;
const E164 = /^\+[1-9]\d{7,14}$/;

type ExecutionIdentity = {
  sid?: unknown;
  flowSid?: unknown;
  contactChannelAddress?: unknown;
  status?: unknown;
};

export type ArchiveStudioDecision =
  | { eligible: true; reason: "ENDED_VERIFIED" }
  | {
      eligible: false;
      reason:
        | "INVALID_EXPECTED_IDENTITY"
        | "EXECUTION_UNAVAILABLE"
        | "EXECUTION_IDENTITY_MISMATCH"
        | "EXECUTION_NOT_ENDED";
    };

export function decideArchiveStudioEligibility(input: {
  expectedExecutionSid: unknown;
  expectedFlowSid: unknown;
  expectedGuestPhone: unknown;
  execution: ExecutionIdentity | null | undefined;
}): ArchiveStudioDecision {
  const { expectedExecutionSid, expectedFlowSid, expectedGuestPhone, execution } = input;

  if (
    typeof expectedExecutionSid !== "string" ||
    !EXECUTION_SID.test(expectedExecutionSid) ||
    typeof expectedFlowSid !== "string" ||
    !FLOW_SID.test(expectedFlowSid) ||
    typeof expectedGuestPhone !== "string" ||
    !E164.test(expectedGuestPhone)
  ) {
    return { eligible: false, reason: "INVALID_EXPECTED_IDENTITY" };
  }

  if (!execution || typeof execution !== "object" || Array.isArray(execution)) {
    return { eligible: false, reason: "EXECUTION_UNAVAILABLE" };
  }

  if (
    typeof execution.sid !== "string" ||
    !EXECUTION_SID.test(execution.sid) ||
    execution.sid.toLowerCase() !== expectedExecutionSid.toLowerCase() ||
    execution.flowSid !== expectedFlowSid ||
    execution.contactChannelAddress !== expectedGuestPhone
  ) {
    return { eligible: false, reason: "EXECUTION_IDENTITY_MISMATCH" };
  }

  if (execution.status !== "ended") {
    return { eligible: false, reason: "EXECUTION_NOT_ENDED" };
  }

  return { eligible: true, reason: "ENDED_VERIFIED" };
}