/**
 * Fin & Feathers — Reservation Delivery Evidence
 *
 * Step 58D.13.146Y
 *
 * Pure evidence classification.
 *
 * Call only after:
 * 1. Authenticating the Twilio webhook signature.
 * 2. Verifying the outbound Message SID through Twilio.
 * 3. Comparing against trusted reservation context.
 *
 * This module does not authenticate the callback.
 *
 * No database access, SMS sending, or state mutation.
 *
 * CRITICAL:
 * RawDlrDoneDate is timezone-ambiguous and minute-
 * precision. Neither it nor dateSent/dateUpdated
 * establishes an authoritative delivery instant.
 */

import type {
  VerifiedOutboundMessage,
} from "@/lib/reservations/verified-outbound-twilio-message";

const SID = /^SM[0-9a-f]{32}$/i;

const CALLBACK_STATUSES = new Set([
  "accepted",
  "scheduled",
  "queued",
  "sending",
  "sent",
  "delivered",
  "undelivered",
  "failed",
  "canceled",
]);

export type DeliveryEvidenceInput = {
  messageSid: string;
  callbackStatus: string;
  rawDlrDoneDate: string | null;
  verifiedMessage: VerifiedOutboundMessage;
};

export type DeliveryEvidenceDecision =
  | {
      decision: "status_only";
      providerStatus: string;
      eventKey: string;
      providerEventAt: null;
      reason:
        | "NON_DELIVERY_STATUS"
        | "DELIVERY_TIME_UNRESOLVED";
    }
  | {
      decision: "reconcile";
      reason:
        | "STATUS_MISMATCH"
        | "UNSUPPORTED_STATUS"
        | "INVALID_EVIDENCE";
    };

/**
 * A stable, bounded status identity.
 *
 * This is NOT a unique Twilio callback identity.
 * Multiple callbacks for one SID and status will
 * intentionally share the same key.
 *
 * Never use it to assert an exact event timestamp.
 */
function statusEventKey(
  messageSid: string,
  status: string,
): string {
  return (
    "twilio-status:" +
    messageSid.toLowerCase() +
    ":" +
    status
  );
}

export function classifyReservationDeliveryEvidence(
  input: DeliveryEvidenceInput,
): DeliveryEvidenceDecision {
  if (
    !input ||
    typeof input !== "object" ||
    typeof input.messageSid !== "string" ||
    !SID.test(input.messageSid) ||
    typeof input.callbackStatus !== "string" ||
    !input.verifiedMessage ||
    typeof input.verifiedMessage !== "object" ||
    typeof input.verifiedMessage.messageSid !== "string" ||
    !SID.test(input.verifiedMessage.messageSid) ||
    input.verifiedMessage.messageSid.toLowerCase() !==
      input.messageSid.toLowerCase() ||
    (
      input.rawDlrDoneDate !== null &&
      typeof input.rawDlrDoneDate !== "string"
    )
  ) {
    return {
      decision: "reconcile",
      reason: "INVALID_EVIDENCE",
    };
  }

  if (!CALLBACK_STATUSES.has(input.callbackStatus)) {
    return {
      decision: "reconcile",
      reason: "UNSUPPORTED_STATUS",
    };
  }

  const restStatus =
    input.verifiedMessage.providerStatus;

  /*
   * A status callback represents one past state.
   *
   * Twilio REST may already have advanced to
   * a later state. We must not assume the two
   * values describe the same instant.
   *
   * Until event ordering is reconciled, a
   * mismatch remains unresolved.
   */
  if (restStatus !== input.callbackStatus) {
    return {
      decision: "reconcile",
      reason: "STATUS_MISMATCH",
    };
  }

  const eventKey = statusEventKey(
    input.messageSid,
    input.callbackStatus,
  );

  if (input.callbackStatus !== "delivered") {
    return {
      decision: "status_only",
      providerStatus: input.callbackStatus,
      eventKey,
      providerEventAt: null,
      reason: "NON_DELIVERY_STATUS",
    };
  }

  if (
    input.verifiedMessage.providerReportsDelivered !== true
  ) {
    return {
      decision: "reconcile",
      reason: "STATUS_MISMATCH",
    };
  }

  /*
   * Even a well-formed RawDlrDoneDate does not
   * supply the carrier's timezone or seconds.
   *
   * Reject malformed raw values rather than
   * treating them as authoritative evidence.
   */
  if (
    input.rawDlrDoneDate !== null &&
    !/^[0-9]{10}$/.test(input.rawDlrDoneDate)
  ) {
    return {
      decision: "reconcile",
      reason: "INVALID_EVIDENCE",
    };
  }

  /*
   * Provider reports delivered, but we do not
   * have an authoritative delivery instant.
   *
   * A delivery event may be retained for audit
   * through a separately approved writer.
   *
   * This result MUST NOT activate the guest
   * five-minute timer.
   */
  return {
    decision: "status_only",
    providerStatus: "delivered",
    eventKey,
    providerEventAt: null,
    reason: "DELIVERY_TIME_UNRESOLVED",
  };
}
