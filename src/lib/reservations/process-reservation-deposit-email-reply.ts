import type { SupabaseClient } from "@supabase/supabase-js";

import {
  verifyInboundTwilioMessage,
} from "@/lib/reservations/verified-inbound-twilio-message";

import {
  resolveReservationInboundContext,
} from "@/lib/reservations/reservation-inbound-context";

import {
  evaluateDepositEmailReply,
  type DepositEmailContext,
} from "@/lib/reservations/reservation-deposit-email-reply-policy";

const E164 = /^\+[1-9]\d{7,14}$/;
const MESSAGE_SID = /^SM[0-9a-f]{32}$/i;
const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type ProcessInput = {
  messageSid: string;
  guestPhone: string;
  restaurantPhone: string;
};

type ProcessOptions = {
  enabled?: boolean;
};

export type DepositEmailProcessingResult =
  | {
      status: "saved" | "duplicate";
      reservationId: string;
      messageSid: string;
    }
  | {
      status: "review";
      reason: string;
    }
  | {
      status: "blocked";
      reason: string;
    }
  | {
      status: "error";
      reason: string;
    };

type ReservationRow = {
  id: string;
  customer_phone: string;
  email: string | null;
  request_status: string;
  details_validated: boolean;
  party_size: number;
  deposit_amount: number | null;
  deposit_status: string;
};

type WorkflowRow = {
  workflow_status: string;
};

type NotificationRow = {
  notification_status: string;
  notification_type: string;
  twilio_message_sid: string | null;
  deposit_decision: string | null;
};

type RecordingRow = {
  outcome: string;
  reservation_id: string;
  inbound_message_sid: string;
};

type PersistenceRow = {
  outcome: string;
  reservation_id: string;
  inbound_message_sid: string;
};

function firstRow<T>(value: unknown): T | null {
  const row = Array.isArray(value) ? value[0] : value;

  if (
    row === null ||
    typeof row !== "object" ||
    Array.isArray(row)
  ) {
    return null;
  }

  return row as T;
}

function normalizeExistingEmail(
  value: string | null,
): string | null {
  if (value === null) return null;

  const trimmed = value.trim();

  if (
    trimmed === "" ||
    trimmed.toUpperCase() === "NOT PROVIDED"
  ) {
    return null;
  }

  return trimmed;
}

/**
 * Processes a previously authenticated inbound SMS.
 *
 * TRUST BOUNDARY:
 * - The caller must have authenticated the inbound webhook.
 * - The Supabase client must be server-side service-role.
 * - Guest identity comes from the trusted webhook.
 * - The actual message is fetched again from Twilio.
 * - Reservation attribution is verified independently.
 * - The database RPC rechecks message ownership.
 *
 * This adapter is disabled unless explicitly enabled
 * by its trusted server-side caller.
 *
 * It must never be called directly from browser input.
 */
export async function processReservationDepositEmailReply(
  supabase: SupabaseClient,
  input: ProcessInput,
  options: ProcessOptions = {},
): Promise<DepositEmailProcessingResult> {
  if (options.enabled !== true) {
    return {
      status: "blocked",
      reason: "DISABLED",
    };
  }

  if (
    !input ||
    !MESSAGE_SID.test(input.messageSid) ||
    !E164.test(input.guestPhone) ||
    !E164.test(input.restaurantPhone) ||
    input.guestPhone === input.restaurantPhone ||
    process.env.TWILIO_FROM_NUMBER !==
      input.restaurantPhone
  ) {
    return {
      status: "blocked",
      reason: "INVALID_MESSAGE_IDENTITY",
    };
  }

  // The actual message body and identity come from Twilio,
  // not from an HTTP request body.
  const verified = await verifyInboundTwilioMessage({
    messageSid: input.messageSid,
    guestPhone: input.guestPhone,
    restaurantPhone: input.restaurantPhone,
  });

  if (!verified.verified) {
    return {
      status: "error",
      reason: verified.reason,
    };
  }

  const message = verified.message;

  if (!message.messageBody) {
    return {
      status: "review",
      reason: "MESSAGE_BODY_UNAVAILABLE",
    };
  }

  // Resolve reservation candidates using the existing
  // server-side reservation attribution architecture.
  //
  // Do not enable undeployed Coordinator state lookups.
  const context = await resolveReservationInboundContext(
    supabase,
    {
      from: message.guestPhone,
      body: message.messageBody,
    },
    {
      coordinatorStateReadEnabled: false,
    },
  );

  if (!context.success) {
    return {
      status: "error",
      reason: context.error,
    };
  }

  if (
    context.attribution.decision !== "attributed" ||
    context.attribution.basis !== "reference"
  ) {
    return {
      status: "review",
      reason: "RESERVATION_REFERENCE_REQUIRED",
    };
  }

  const reservationId =
    context.attribution.reservationId;

  if (!UUID.test(reservationId)) {
    return {
      status: "blocked",
      reason: "INVALID_RESERVATION_ID",
    };
  }

  // Verify that the reference is one of the trusted,
  // database-generated candidates for this guest phone.
  const matchingCandidate = context.candidates.filter(
    (candidate) =>
      candidate.reservationId.toLowerCase() ===
        reservationId.toLowerCase() &&
      candidate.guestPhone === message.guestPhone &&
      candidate.reference !== null,
  );

  if (matchingCandidate.length !== 1) {
    return {
      status: "review",
      reason: "UNVERIFIED_RESERVATION_REFERENCE",
    };
  }

  // Load the current reservation details.
  const {
    data: reservationData,
    error: reservationError,
  } = await supabase
    .from("reservation_requests")
    .select(
      "id, customer_phone, email, request_status, " +
      "details_validated, party_size, deposit_amount, " +
      "deposit_status",
    )
    .eq("id", reservationId)
    .maybeSingle();

  if (reservationError) {
    return {
      status: "error",
      reason: "RESERVATION_LOOKUP_FAILED",
    };
  }

  const reservation =
    reservationData as ReservationRow | null;

  if (
    !reservation ||
    reservation.id.toLowerCase() !==
      reservationId.toLowerCase() ||
    reservation.customer_phone !== message.guestPhone
  ) {
    return {
      status: "blocked",
      reason: "RESERVATION_IDENTITY_MISMATCH",
    };
  }

  const {
    data: workflowData,
    error: workflowError,
  } = await supabase
    .from("reservation_staff_workflows")
    .select("workflow_status")
    .eq("reservation_request_id", reservationId)
    .maybeSingle();

  if (workflowError) {
    return {
      status: "error",
      reason: "WORKFLOW_LOOKUP_FAILED",
    };
  }

  const workflow = workflowData as WorkflowRow | null;

  if (!workflow) {
    return {
      status: "blocked",
      reason: "WORKFLOW_NOT_FOUND",
    };
  }

  const eventKey =
    `reservation_deposit_decision:${reservationId}`;

  const {
    data: notificationData,
    error: notificationError,
  } = await supabase
    .from("reservation_notification_events")
    .select(
      "notification_status, notification_type, twilio_message_sid, deposit_decision",
    )
    .eq("reservation_request_id", reservationId)
    .eq("event_key", eventKey)
    .maybeSingle();

  if (notificationError) {
    return {
      status: "error",
      reason: "NOTIFICATION_LOOKUP_FAILED",
    };
  }

  const notification =
    notificationData as NotificationRow | null;

  if (
    !notification ||
    notification.notification_type !==
      "reservation_deposit_decision"
  ) {
    return {
      status: "blocked",
      reason: "DEPOSIT_NOTIFICATION_NOT_FOUND",
    };
  }

  if (notification.deposit_decision !== "required") {
    return {
      status: "blocked",
      reason: "DEPOSIT_NOT_REQUIRED",
    };
  }

  // Only a completed, accepted notification can
  // establish an outstanding deposit email request.
  if (
    !["sent", "delivered"].includes(
      notification.notification_status,
    ) ||
    !notification.twilio_message_sid
  ) {
    return {
      status: "blocked",
      reason: "DEPOSIT_NOTIFICATION_NOT_SENT",
    };
  }

  const emailContext: DepositEmailContext = {
    reservationId,
    guestPhone: message.guestPhone,
    requestStatus: reservation.request_status,
    detailsValidated: reservation.details_validated,
    partySize: reservation.party_size,
    depositAmount: reservation.deposit_amount,
    depositStatus: reservation.deposit_status,
    workflowStatus: workflow.workflow_status,
    depositDecisionNotificationStatus:
      notification.notification_status,
    existingEmail: normalizeExistingEmail(
      reservation.email,
    ),
  };

  const evaluation = evaluateDepositEmailReply({
    body: message.messageBody,
    attribution: context.attribution,
    context: emailContext,
  });

  if (evaluation.decision === "needs_staff_review") {
    return {
      status: "review",
      reason: evaluation.reason,
    };
  }

  if (evaluation.decision === "blocked") {
    return {
      status: "blocked",
      reason: evaluation.reason,
    };
  }

  // The registrar is an atomic, reservation-aware database
  // operation. It must be deployed and verified separately.
  // It must validate the reference, phone pair, conversation,
  // outstanding required-deposit notification, and message
  // timestamp before creating BOTH the inbound event and the
  // Message SID ownership record in one transaction.
  // No direct table inserts or phone-only ownership fallback.
  const {
    data: recordingData,
    error: recordingError,
  } = await supabase.rpc(
    "record_reservation_deposit_email_inbound",
    {
      p_reservation_id: reservationId,
      p_guest_phone: message.guestPhone,
      p_restaurant_phone: message.restaurantPhone,
      p_twilio_message_sid: message.messageSid,
      p_message_created_at: message.messageCreatedAt,
      p_reservation_reference: matchingCandidate[0].reference,
    },
  );

  if (recordingError) {
    console.error("Deposit email inbound registration rejected.", {
      reservationId,
      code: recordingError.code,
    });

    return {
      status: "error",
      reason: "INBOUND_REGISTRATION_UNAVAILABLE",
    };
  }

  const recorded = firstRow<RecordingRow>(recordingData);

  if (
    !recorded ||
    recorded.reservation_id.toLowerCase() !==
      reservationId.toLowerCase() ||
    recorded.inbound_message_sid.toLowerCase() !==
      message.messageSid.toLowerCase() ||
    !["recorded", "duplicate"].includes(recorded.outcome)
  ) {
    return {
      status: "error",
      reason: "INVALID_INBOUND_REGISTRATION_RESULT",
    };
  }

  const email = evaluation.decision === "no_change"
    ? normalizeExistingEmail(reservation.email)
    : evaluation.email;

  if (!email) {
    return {
      status: "review",
      reason: "EMAIL_NOT_AVAILABLE",
    };
  }

  // The SQL RPC must independently verify:
  // - Message SID ownership (registered atomically above)
  // - Shared inbound event association
  // - Reservation/deposit eligibility
  // - Event state and timing
  // - Existing email consistency
  //
  // This call will fail until the reviewed database
  // migration is explicitly deployed.
  const {
    data: savedData,
    error: saveError,
  } = await supabase.rpc(
    "save_reservation_deposit_email",
    {
      p_reservation_id: reservationId,
      p_twilio_message_sid: message.messageSid,
      p_email: email,
    },
  );

  if (saveError) {
    console.error(
      "Deposit email persistence rejected:",
      {
        reservationId,
        code: saveError.code,
      },
    );

    return {
      status: "error",
      reason: "EMAIL_PERSISTENCE_REJECTED",
    };
  }

  const saved =
    firstRow<PersistenceRow>(savedData);

  if (
    !saved ||
    saved.reservation_id.toLowerCase() !==
      reservationId.toLowerCase() ||
    saved.inbound_message_sid.toLowerCase() !==
      message.messageSid.toLowerCase()
  ) {
    return {
      status: "error",
      reason: "INVALID_PERSISTENCE_RESULT",
    };
  }

  if (
    saved.outcome !== "saved" &&
    saved.outcome !== "duplicate"
  ) {
    return {
      status: "error",
      reason: "UNEXPECTED_PERSISTENCE_OUTCOME",
    };
  }

  return {
    status: saved.outcome,
    reservationId,
    messageSid: message.messageSid,
  };
}