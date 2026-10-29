import type {
  PromptCorrelationResult,
  VerifiedClarityReply,
} from "@/lib/reservations/reservation-prompt-correlation";

import type {
  ProjectedCoordinatorState,
} from "@/lib/reservations/reservation-coordinator-state-projection";

/**
 * Fin & Feathers — Coordinator Event Provenance
 *
 * Step 58D.13.146L
 *
 * Read-only authorization boundary for preparing a
 * verified guest clarity event.
 *
 * Does not call the transition RPC, write to Supabase,
 * send SMS, or modify Twilio Studio.
 *
 * The caller must obtain correlation evidence from
 * the trusted prompt-snapshot processing pipeline.
 *
 * A successful result is not durable authorization.
 * The transactional database function must independently
 * revalidate event, prompt, and Coordinator state.
 */

const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const MESSAGE_SID = /^SM[0-9a-f]{32}$/i;

const E164 = /^\+[1-9]\d{7,14}$/;

export type GuestClarityTransitionIntent = {
  reservationId: string;
  expectedVersion: number;
  followupId: string;
  eventKey: string;
  eventType: "GUEST_CLARITY_YES" | "GUEST_CLARITY_NO";

  /**
   * Evidence identifiers for the future atomic
   * database authorization procedure.
   */
  inboundMessageSid: string;
  outboundMessageSid: string;
};

export type GuestClarityIntentResult =
  | {
      success: true;
      intent: GuestClarityTransitionIntent;
    }
  | {
      success: false;
      reason:
        | "INVALID_EVIDENCE"
        | "NOT_CORRELATED"
        | "REPLY_MISMATCH"
        | "STALE_COORDINATOR_STATE";
    };

function sameId(a: string, b: string): boolean {
  return a.toLowerCase() === b.toLowerCase();
}

/**
 * Prepare an advisory Coordinator transition intent
 * using independently obtained correlation and current
 * Coordinator evidence.
 *
 * IMPORTANT:
 *
 * - Do not accept these objects from browser JSON.
 * - Do not use an unverified incoming SMS body.
 * - Do not call the existing transition RPC directly
 *   based on this intent alone.
 * - The database must atomically consume the inbound
 *   Message SID and recheck prompt correlation.
 */
export function prepareGuestClarityTransitionIntent(input: {
  reply: VerifiedClarityReply;
  correlation: PromptCorrelationResult;
  coordinatorState: ProjectedCoordinatorState;
}): GuestClarityIntentResult {
  if (
    !input ||
    !input.reply ||
    !input.correlation ||
    !input.coordinatorState
  ) {
    return {
      success: false,
      reason: "INVALID_EVIDENCE",
    };
  }

  const { reply, correlation, coordinatorState } = input;

  if (
    typeof reply.inboundMessageSid !== "string" ||
    !MESSAGE_SID.test(reply.inboundMessageSid) ||
    typeof reply.restaurantPhone !== "string" ||
    !E164.test(reply.restaurantPhone) ||
    typeof reply.guestPhone !== "string" ||
    !E164.test(reply.guestPhone) ||
    reply.restaurantPhone === reply.guestPhone ||
    typeof reply.body !== "string" ||
    !Number.isFinite(Date.parse(reply.messageCreatedAt)) ||
    typeof coordinatorState.reservationId !== "string" ||
    !UUID.test(coordinatorState.reservationId) ||
    !Number.isSafeInteger(coordinatorState.stateVersion) ||
    coordinatorState.stateVersion < 0
  ) {
    return {
      success: false,
      reason: "INVALID_EVIDENCE",
    };
  }

  if (correlation.decision !== "correlated") {
    return {
      success: false,
      reason: "NOT_CORRELATED",
    };
  }

  if (
    !UUID.test(correlation.reservationId) ||
    !UUID.test(correlation.followupId) ||
    !MESSAGE_SID.test(correlation.outboundMessageSid) ||
    !MESSAGE_SID.test(correlation.inboundMessageSid) ||
    !Number.isSafeInteger(correlation.stateVersion) ||
    correlation.stateVersion < 0
  ) {
    return {
      success: false,
      reason: "INVALID_EVIDENCE",
    };
  }

  const answer = reply.body.trim().toUpperCase();

  if (
    (answer !== "YES" && answer !== "NO") ||
    answer !== correlation.answer ||
    !sameId(
      reply.inboundMessageSid,
      correlation.inboundMessageSid,
    )
  ) {
    return {
      success: false,
      reason: "REPLY_MISMATCH",
    };
  }

  if (
    coordinatorState.phase !== "awaiting_guest_clarity" ||
    coordinatorState.clarityWindowOpen !== true ||
    coordinatorState.followupId === null ||
    !sameId(
      coordinatorState.reservationId,
      correlation.reservationId,
    ) ||
    !sameId(
      coordinatorState.followupId,
      correlation.followupId,
    ) ||
    coordinatorState.stateVersion !==
      correlation.stateVersion
  ) {
    return {
      success: false,
      reason: "STALE_COORDINATOR_STATE",
    };
  }

  const inboundMessageSid =
    reply.inboundMessageSid.toUpperCase();

  return {
    success: true,
    intent: {
      reservationId: correlation.reservationId,
      expectedVersion: correlation.stateVersion,
      followupId: correlation.followupId,

      // Stable across webhook retries and independent
      // of the selected reservation or answer.
      eventKey: `clarity:${inboundMessageSid}`,

      eventType:
        answer === "YES"
          ? "GUEST_CLARITY_YES"
          : "GUEST_CLARITY_NO",

      inboundMessageSid,
      outboundMessageSid:
        correlation.outboundMessageSid.toUpperCase(),
    },
  };
}