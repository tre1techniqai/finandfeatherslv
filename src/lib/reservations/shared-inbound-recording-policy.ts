/**
 * FIN & FEATHERS | DEMO-SMS-001
 * Step 58D.13.8
 *
 * Shared inbound SMS recording eligibility.
 *
 * Pure decision logic:
 * - No database operations.
 * - No Twilio API calls.
 * - No SMS sending.
 * - No conversation provisioning.
 * - No routing mode changes.
 *
 * IMPORTANT:
 * A valid Twilio Message SID establishes message identity,
 * not authorization for shared-conversation recording.
 *
 * This policy must only be evaluated using trusted,
 * independently verified routing and ownership information.
 */

export type SharedInboundMode =
  | "automation"
  | "transitioning_to_staff"
  | "staff";

export type SharedInboundLookup =
  | {
      status: "found";
      mode: SharedInboundMode;
    }
  | {
      status: "missing";
    }
  | {
      status: "error";
    };

export type LegacyInboundOwnership =
  | "none"
  | "automation"
  | "released"
  | "staff"
  | "pending"
  | "error";

export type SharedInboundReadiness = {
  sharedRoutingEnabled: boolean;
  staffRoutingVerified: boolean;
  studioHandoffFenceEnabled: boolean;
  inboundRecordingEnabled: boolean;
};

export type SharedInboundEligibilityInput = {
  shared: SharedInboundLookup;
  legacy: LegacyInboundOwnership;
  readiness: SharedInboundReadiness;
};

export type SharedInboundEligibilityDecision =
  | {
      decision: "record";
      reason: "VERIFIED_SHARED_STAFF_CONVERSATION";
    }
  | {
      decision: "skip";
      reason: "EXISTING_AUTOMATION_CONVERSATION";
    }
  | {
      decision: "block";
      reason:
        | "INVALID_INPUT"
        | "LOOKUP_UNAVAILABLE"
        | "RECORDING_NOT_READY"
        | "SHARED_ROUTING_NOT_READY"
        | "STAFF_ROUTING_NOT_READY"
        | "STUDIO_FENCE_NOT_READY"
        | "LEGACY_OWNERSHIP_CONFLICT"
        | "SHARED_CONVERSATION_TRANSITIONING"
        | "UNCLASSIFIED_NEW_CONVERSATION";
    };

function block(
  reason: Extract<
    SharedInboundEligibilityDecision,
    { decision: "block" }
  >["reason"],
): SharedInboundEligibilityDecision {
  return {
    decision: "block",
    reason,
  };
}

/**
 * Decide whether a verified inbound SMS may be recorded
 * against the shared conversation ledger.
 *
 * A decision of "record" does not authorize outbound SMS.
 *
 * A decision of "skip" means the existing automation
 * workflow retains responsibility for the message.
 *
 * A decision of "block" means shared inbound recording
 * must not occur.
 */
export function decideSharedInboundRecording(
  input: SharedInboundEligibilityInput,
): SharedInboundEligibilityDecision {
  // Runtime validation is necessary because callers may
  // receive malformed values from external services.
  // TypeScript types alone are not a trust boundary.

  if (
    !input ||
    typeof input !== "object" ||
    !input.shared ||
    typeof input.shared !== "object" ||
    !input.readiness ||
    typeof input.readiness !== "object"
  ) {
    return block("INVALID_INPUT");
  }

  const { shared, legacy, readiness } = input;

  if (
    !["none", "automation", "released", "staff", "pending", "error"].includes(
      legacy,
    ) ||
    !["found", "missing", "error"].includes(
      shared.status,
    )
  ) {
    return block("INVALID_INPUT");
  }

  if (
    shared.status === "found" &&
    ![
      "automation",
      "transitioning_to_staff",
      "staff",
    ].includes(shared.mode)
  ) {
    return block("INVALID_INPUT");
  }

  if (
    shared.status !== "found" &&
    "mode" in shared
  ) {
    return block("INVALID_INPUT");
  }

  const readinessValues = [
    readiness.sharedRoutingEnabled,
    readiness.staffRoutingVerified,
    readiness.studioHandoffFenceEnabled,
    readiness.inboundRecordingEnabled,
  ];

  if (
    readinessValues.some(
      (value) => typeof value !== "boolean",
    )
  ) {
    return block("INVALID_INPUT");
  }

  // Unknown database states must never be interpreted
  // as missing conversations or valid automation.

  if (
    shared.status === "error" ||
    legacy === "error"
  ) {
    return block("LOOKUP_UNAVAILABLE");
  }

  // Disabled recording always wins.
  // No shared metadata is persisted.

  if (!readiness.inboundRecordingEnabled) {
    return block("RECORDING_NOT_READY");
  }

  if (!readiness.sharedRoutingEnabled) {
    return block("SHARED_ROUTING_NOT_READY");
  }

  // Never interpret an existing legacy staff claim or
  // pending handoff as safe shared staff authorization.

  if (
    legacy === "staff" ||
    legacy === "pending"
  ) {
    return block("LEGACY_OWNERSHIP_CONFLICT");
  }

  // No verified shared conversation currently exists.
  //
  // A missing reservation or shared record does not
  // establish that an SMS is a general inquiry.
  //
  // Trusted general-inquiry classification/provisioning
  // will be designed separately.

  if (shared.status === "missing") {
    return block("UNCLASSIFIED_NEW_CONVERSATION");
  }

  // While transitioning, neither automation processing
  // nor shared staff recording is authorized here.

  if (shared.mode === "transitioning_to_staff") {
    return block("SHARED_CONVERSATION_TRANSITIONING");
  }

  // Existing automation remains responsible for its
  // messages. Recording them as staff activity would
  // create ambiguous ownership.

  if (shared.mode === "automation") {
    return {
      decision: "skip",
      reason: "EXISTING_AUTOMATION_CONVERSATION",
    };
  }

  // The only remaining permitted shared mode is staff.
  // Both the Studio routing fence and staff inbound
  // integration must independently be verified.

  if (!readiness.staffRoutingVerified) {
    return block("STAFF_ROUTING_NOT_READY");
  }

  if (!readiness.studioHandoffFenceEnabled) {
    return block("STUDIO_FENCE_NOT_READY");
  }

  // A released legacy claim is permitted only after
  // the shared conversation has independently passed
  // staff-mode and routing-readiness verification.
  //
  // Legacy automation, pending, or active staff
  // ownership must not authorize shared recording.

  if (
    legacy !== "none" &&
    legacy !== "released"
  ) {
    return block("LEGACY_OWNERSHIP_CONFLICT");
  }

  return {
    decision: "record",
    reason: "VERIFIED_SHARED_STAFF_CONVERSATION",
  };
}