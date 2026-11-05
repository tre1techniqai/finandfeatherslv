/**
 * Fin & Feathers Las Vegas
 * Reservation-specific deposit email reply policy.
 *
 * Pure policy only:
 * - No database writes
 * - No Twilio calls
 * - No email or SMS sending
 * - No reservation lookup by phone number alone
 *
 * The caller must supply an attribution decision from the
 * existing trusted reservation inbound attribution system.
 */

import type {
  AttributionResult,
} from "@/lib/reservations/reservation-inbound-attribution";

export type DepositEmailContext = {
  reservationId: string;
  guestPhone: string;
  requestStatus: string;
  detailsValidated: boolean;
  partySize: number;
  depositAmount: number | null;
  depositStatus: string;
  workflowStatus: string;
  depositDecisionNotificationStatus: string | null;
  existingEmail: string | null;
};

export type DepositEmailReplyResult =
  | {
      decision: "email_candidate";
      reservationId: string;
      email: string;
      attributionBasis:
        | "reference"
        | "active_context";
    }
  | {
      decision: "no_change";
      reason: "DUPLICATE_EMAIL";
    }
  | {
      decision: "needs_staff_review";
      reason:
        | "UNRESOLVED_ATTRIBUTION"
        | "INVALID_EMAIL"
        | "MULTIPLE_EMAILS"
        | "EMAIL_MISMATCH"
        | "EMAIL_ALREADY_PRESENT";
    }
  | {
      decision: "blocked";
      reason:
        | "INVALID_CONTEXT"
        | "RESERVATION_MISMATCH"
        | "INELIGIBLE_RESERVATION"
        | "DEPOSIT_NOT_REQUIRED"
        | "DEPOSIT_MESSAGE_NOT_SENT"
        | "INVALID_MESSAGE";
    };

const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const E164 = /^\+[1-9]\d{7,14}$/;

const EMAIL =
  /^[A-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?(?:\.[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?)+$/i;

const EMAIL_CANDIDATE =
  /[^\s<>,;:"()]+@[^\s<>,;:"()]+/g;

function expectedDeposit(
  partySize: number,
): number | null {
  if (partySize >= 9 && partySize <= 10) return 55;
  if (partySize >= 11 && partySize <= 14) return 80;
  if (partySize >= 15 && partySize <= 20) return 110;

  return null;
}

function normalizeEmail(
  value: string,
): string | null {
  const email = value.trim().toLowerCase();

  if (
    email.length < 6 ||
    email.length > 254 ||
    !EMAIL.test(email)
  ) {
    return null;
  }

  const [localPart, domain] = email.split("@");

  if (
    !localPart ||
    !domain ||
    localPart.length > 64 ||
    localPart.startsWith(".") ||
    localPart.endsWith(".") ||
    localPart.includes("..") ||
    domain.split(".").some(
      (label) =>
        label.length === 0 ||
        label.length > 63 ||
        label.startsWith("-") ||
        label.endsWith("-"),
    )
  ) {
    return null;
  }

  return email;
}

function validContext(
  context: DepositEmailContext,
): boolean {
  return (
    UUID.test(context.reservationId) &&
    E164.test(context.guestPhone) &&
    Number.isInteger(context.partySize) &&
    context.partySize >= 1 &&
    context.partySize <= 20 &&
    typeof context.requestStatus === "string" &&
    typeof context.detailsValidated === "boolean" &&
    typeof context.depositStatus === "string" &&
    typeof context.workflowStatus === "string" &&
    (
      context.depositAmount === null ||
      (
        Number.isFinite(context.depositAmount) &&
        context.depositAmount >= 0
      )
    ) &&
    (
      context.depositDecisionNotificationStatus === null ||
      typeof context.depositDecisionNotificationStatus === "string"
    ) &&
    (
      context.existingEmail === null ||
      typeof context.existingEmail === "string"
    )
  );
}

/**
 * Determine whether a verified inbound SMS may supply
 * an email candidate for a specific reservation.
 *
 * An "email_candidate" result does NOT authorize
 * directly updating reservation_requests.email.
 *
 * A separate transactional operation must recheck:
 * - Reservation identity
 * - Current workflow and deposit state
 * - Notification status
 * - Existing email
 * - Inbound message ownership and idempotency
 *
 * before saving the address.
 */
export function evaluateDepositEmailReply(input: {
  body: string;
  attribution: AttributionResult;
  context: DepositEmailContext;
}): DepositEmailReplyResult {
  const { body, attribution, context } = input;

  if (!validContext(context)) {
    return {
      decision: "blocked",
      reason: "INVALID_CONTEXT",
    };
  }

  if (
    typeof body !== "string" ||
    body.length === 0 ||
    body.length > 1600 ||
    /[\u0000-\u0008\u000B\u000C\u000E-\u001F]/u.test(body)
  ) {
    return {
      decision: "blocked",
      reason: "INVALID_MESSAGE",
    };
  }

  if (attribution.decision !== "attributed") {
    return {
      decision: "needs_staff_review",
      reason: "UNRESOLVED_ATTRIBUTION",
    };
  }

  if (
    attribution.reservationId.toLowerCase() !==
    context.reservationId.toLowerCase()
  ) {
    return {
      decision: "blocked",
      reason: "RESERVATION_MISMATCH",
    };
  }

  if (
    !context.detailsValidated ||
    !["pending", "incomplete"].includes(
      context.requestStatus,
    ) ||
    !["available", "alternative_accepted"].includes(
      context.workflowStatus,
    )
  ) {
    return {
      decision: "blocked",
      reason: "INELIGIBLE_RESERVATION",
    };
  }

  if (
    context.depositAmount !==
      expectedDeposit(context.partySize) ||
    context.depositStatus !== "pending"
  ) {
    return {
      decision: "blocked",
      reason: "DEPOSIT_NOT_REQUIRED",
    };
  }

  if (
    !["sent", "delivered"].includes(
      context.depositDecisionNotificationStatus ?? "",
    )
  ) {
    return {
      decision: "blocked",
      reason: "DEPOSIT_MESSAGE_NOT_SENT",
    };
  }

  const matches = [
    ...new Set(
      (body.match(EMAIL_CANDIDATE) ?? [])
        .map((value) =>
          value.replace(/[.!?]+$/u, "").toLowerCase(),
        ),
    ),
  ];

  if (matches.length > 1) {
    return {
      decision: "needs_staff_review",
      reason: "MULTIPLE_EMAILS",
    };
  }

  if (matches.length === 0) {
    return {
      decision: "needs_staff_review",
      reason: "INVALID_EMAIL",
    };
  }

  const email = normalizeEmail(matches[0]);

  if (!email) {
    return {
      decision: "needs_staff_review",
      reason: "INVALID_EMAIL",
    };
  }

  if (context.existingEmail?.trim()) {
    const existing =
      normalizeEmail(context.existingEmail);

    if (existing === email) {
      return {
        decision: "no_change",
        reason: "DUPLICATE_EMAIL",
      };
    }

    if (existing !== null) {
      return {
        decision: "needs_staff_review",
        reason: "EMAIL_MISMATCH",
      };
    }

    return {
      decision: "needs_staff_review",
      reason: "EMAIL_ALREADY_PRESENT",
    };
  }

  // YES/NO clarity prompts are not deposit email prompts.
  // Even valid email-looking text attributed through an
  // active clarity context must not be auto-accepted.
  if (attribution.basis === "active_clarity") {
    return {
      decision: "needs_staff_review",
      reason: "UNRESOLVED_ATTRIBUTION",
    };
  }

  return {
    decision: "email_candidate",
    reservationId: context.reservationId,
    email,
    attributionBasis: attribution.basis,
  };
}