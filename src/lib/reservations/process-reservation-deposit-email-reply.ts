import type { SupabaseClient } from "@supabase/supabase-js";

import {
  verifyInboundTwilioMessage,
} from "@/lib/reservations/verified-inbound-twilio-message";

import {
  resolveReservationInboundContext,
} from "@/lib/reservations/reservation-inbound-context";

import type {
  AttributionResult,
} from "@/lib/reservations/reservation-inbound-attribution";

import {
  evaluateDepositEmailReply,
  type DepositEmailContext,
} from "@/lib/reservations/reservation-deposit-email-reply-policy";

const E164 = /^\+[1-9]\d{7,14}$/;
const MESSAGE_SID = /^SM[0-9a-f]{32}$/i;

const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const REFERENCE =
  /^[A-Z]{2}-\d{6}-\d{3,8}$/;

const REFERENCE_IN_TEXT =
  /\b[A-Z]{2}-\d{6}-\d{3,8}\b/i;

const SIMPLE_EMAIL =
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type ProcessInput = {
  messageSid: string;
  guestPhone: string;
  restaurantPhone: string;
};

type ProcessOptions = {
  enabled?: boolean;
  // Staff recovery only: fail closed if independent
  // attribution chooses a different reservation.
  expectedReservationId?: string;
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
  reservation_request_id: string;
  workflow_status: string;
};

type NotificationRow = {
  reservation_request_id: string;
  event_key: string;
  notification_status: string;
  notification_type: string;
  deposit_decision: string | null;
  twilio_message_sid: string | null;
};

type ConversationRow = {
  id: string;
  reservation_request_id: string;
  guest_phone: string;
  restaurant_phone: string;
};

type MessageOwnershipRow = {
  reservation_request_id: string;
  twilio_message_sid: string;
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

type VerifiedDepositContext = {
  reservationId: string;
  conversationId: string;
  reference: string;
};

type ResolveDepositResult =
  | {
      status: "resolved";
      context: VerifiedDepositContext;
    }
  | {
      status: "review";
      reason: string;
    }
  | {
      status: "error";
      reason: string;
    };

type ReservationCandidate = {
  reservationId: string;
  guestPhone: string;
  reference: string | null;
};

function firstRow<T>(
  value: unknown,
): T | null {
  const row = Array.isArray(value)
    ? value.length === 1
      ? value[0]
      : null
    : value;

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
  if (value === null) {
    return null;
  }

  const trimmed = value.trim();

  if (
    trimmed === "" ||
    trimmed.toUpperCase() === "NOT PROVIDED"
  ) {
    return null;
  }

  return trimmed;
}

function expectedDeposit(
  partySize: number,
): number | null {
  if (partySize >= 9 && partySize <= 10) {
    return 55;
  }

  if (partySize >= 11 && partySize <= 14) {
    return 80;
  }

  if (partySize >= 15 && partySize <= 20) {
    return 110;
  }

  return null;
}

/**
 * Resolve an email-only reply against the existing
 * reservation-specific conversation architecture.
 *
 * This function performs read-only database queries.
 *
 * A phone pair alone does not establish ownership.
 *
 * Required evidence:
 *
 * 1. A trusted reservation candidate.
 * 2. Exactly one conversation for that reservation.
 * 3. A verified required-deposit notification.
 * 4. A valid outbound Twilio Message SID.
 * 5. Recorded outbound Message SID ownership.
 * 6. An eligible reservation awaiting its email.
 *
 * More than one verified eligible reservation must
 * result in staff review, not automatic attribution.
 */
async function resolveOutstandingDepositContext(
  supabase: SupabaseClient,
  candidates: ReadonlyArray<ReservationCandidate>,
  guestPhone: string,
  restaurantPhone: string,
): Promise<ResolveDepositResult> {
  const validCandidates = candidates.filter(
    (candidate) =>
      UUID.test(candidate.reservationId) &&
      candidate.guestPhone === guestPhone &&
      typeof candidate.reference === "string" &&
      REFERENCE.test(candidate.reference),
  );

  if (validCandidates.length === 0) {
    return {
      status: "review",
      reason: "NO_DEPOSIT_RESERVATION_CANDIDATE",
    };
  }

  const ids = [
    ...new Set(
      validCandidates.map(
        (candidate) => candidate.reservationId,
      ),
    ),
  ];

  // Each query targets its own authoritative table.
  //
  // Literal select strings preserve Supabase's
  // TypeScript inference.

  const [
    conversationsResult,
    notificationsResult,
    reservationsResult,
    workflowsResult,
  ] = await Promise.all([
    supabase
      .from("reservation_shared_conversations")
      .select(
        "id, reservation_request_id, guest_phone, restaurant_phone",
      )
      .in("reservation_request_id", ids)
      .eq("guest_phone", guestPhone)
      .eq("restaurant_phone", restaurantPhone),

    supabase
      .from("reservation_notification_events")
      .select(
        "reservation_request_id, event_key, notification_status, notification_type, deposit_decision, twilio_message_sid",
      )
      .in("reservation_request_id", ids)
      .eq(
        "notification_type",
        "reservation_deposit_decision",
      )
      .eq("deposit_decision", "required")
      .in(
        "notification_status",
        ["sent", "delivered"],
      ),

    supabase
      .from("reservation_requests")
      .select(
        "id, customer_phone, email, request_status, details_validated, party_size, deposit_amount, deposit_status",
      )
      .in("id", ids),

    supabase
      .from("reservation_staff_workflows")
      .select(
        "reservation_request_id, workflow_status",
      )
      .in("reservation_request_id", ids),
  ]);

  if (
    conversationsResult.error ||
    notificationsResult.error ||
    reservationsResult.error ||
    workflowsResult.error
  ) {
    console.error(
      "Deposit email context lookup failed.",
      {
        conversationCode:
          conversationsResult.error?.code ?? null,
        notificationCode:
          notificationsResult.error?.code ?? null,
        reservationCode:
          reservationsResult.error?.code ?? null,
        workflowCode:
          workflowsResult.error?.code ?? null,
      },
    );

    return {
      status: "error",
      reason: "DEPOSIT_CONTEXT_LOOKUP_FAILED",
    };
  }

  const conversations: ConversationRow[] =
    conversationsResult.data ?? [];

  const notifications: NotificationRow[] =
    notificationsResult.data ?? [];

  const reservations: ReservationRow[] =
    reservationsResult.data ?? [];

  const workflows: WorkflowRow[] =
    workflowsResult.data ?? [];

  const eligible: Array<{
    reservationId: string;
    conversationId: string;
    reference: string;
    outboundSid: string;
  }> = [];

  for (const candidate of validCandidates) {
    const reservationId = candidate.reservationId;

    const matchingConversations =
      conversations.filter(
        (row) =>
          row.reservation_request_id ===
            reservationId &&
          UUID.test(row.id) &&
          row.guest_phone === guestPhone &&
          row.restaurant_phone === restaurantPhone,
      );

    const eventKey =
      `reservation_deposit_decision:${reservationId}`;

    const matchingNotifications =
      notifications.filter(
        (row) =>
          row.reservation_request_id ===
            reservationId &&
          row.event_key === eventKey &&
          row.notification_type ===
            "reservation_deposit_decision" &&
          row.deposit_decision === "required" &&
          ["sent", "delivered"].includes(
            row.notification_status,
          ) &&
          typeof row.twilio_message_sid ===
            "string" &&
          MESSAGE_SID.test(
            row.twilio_message_sid,
          ),
      );

    const matchingReservations =
      reservations.filter(
        (row) => row.id === reservationId,
      );

    const matchingWorkflows =
      workflows.filter(
        (row) =>
          row.reservation_request_id === reservationId,
      );

    // Require exactly one matching record from
    // every authoritative source.
    if (
      matchingConversations.length !== 1 ||
      matchingNotifications.length !== 1 ||
      matchingReservations.length !== 1 ||
      matchingWorkflows.length !== 1
    ) {
      continue;
    }

    const reservation =
      matchingReservations[0];

    const workflow =
      matchingWorkflows[0];

    const notification =
      matchingNotifications[0];

    if (
      reservation.customer_phone !== guestPhone ||
      !reservation.details_validated ||
      !["pending", "incomplete"].includes(
        reservation.request_status,
      ) ||
      reservation.deposit_status !== "pending" ||
      !Number.isInteger(reservation.party_size) ||
      reservation.deposit_amount !==
        expectedDeposit(reservation.party_size) ||
      ![
        "available",
        "alternative_accepted",
      ].includes(workflow.workflow_status) ||
      normalizeExistingEmail(reservation.email) !==
        null
    ) {
      continue;
    }

    const outboundSid =
      notification.twilio_message_sid;

    if (!outboundSid) {
      continue;
    }

    if (
      !candidate.reference ||
      !REFERENCE.test(candidate.reference)
    ) {
      continue;
    }

    eligible.push({
      reservationId,
      conversationId: matchingConversations[0].id,
      reference: candidate.reference,
      outboundSid,
    });
  }

  if (eligible.length === 0) {
    return {
      status: "review",
      reason: "NO_OUTSTANDING_DEPOSIT_EMAIL_REQUEST",
    };
  }

  // Verify ownership of the outbound deposit message.
  //
  // The stored Message SID must belong to the same
  // reservation as the existing conversation UUID.

  const outboundSids = [
    ...new Set(
      eligible.map(
        (candidate) => candidate.outboundSid,
      ),
    ),
  ];

  const {
    data: ownershipData,
    error: ownershipError,
  } = await supabase
    .from("reservation_message_sid_ownership")
    .select(
      "reservation_request_id, twilio_message_sid",
    )
    .in("twilio_message_sid", outboundSids);

  if (ownershipError) {
    console.error(
      "Deposit message ownership lookup failed.",
      {
        code: ownershipError.code,
      },
    );

    return {
      status: "error",
      reason: "DEPOSIT_OWNERSHIP_LOOKUP_FAILED",
    };
  }

  const ownership: MessageOwnershipRow[] =
    ownershipData ?? [];

  const verified = eligible.filter(
    (candidate) => {
      const owners = ownership.filter(
        (row) =>
          row.twilio_message_sid.toLowerCase() ===
          candidate.outboundSid.toLowerCase(),
      );

      return (
        owners.length === 1 &&
        owners[0].reservation_request_id.toLowerCase() ===
          candidate.reservationId.toLowerCase()
      );
    },
  );

  // Never choose the newest reservation simply
  // because multiple reservations share a phone.

  if (verified.length !== 1) {
    return {
      status: "review",
      reason:
        verified.length > 1
          ? "MULTIPLE_OUTSTANDING_DEPOSIT_REQUESTS"
          : "DEPOSIT_MESSAGE_OWNERSHIP_UNVERIFIED",
    };
  }

  return {
    status: "resolved",
    context: {
      reservationId: verified[0].reservationId,
      conversationId: verified[0].conversationId,
      reference: verified[0].reference,
    },
  };
}

/**
 * Process an authenticated inbound deposit-email SMS.
 *
 * The trusted caller supplies:
 * - The inbound Twilio Message SID.
 * - The verified guest phone.
 * - The restaurant phone.
 * - A server-side Supabase client.
 *
 * Twilio is queried again to verify the message.
 *
 * This function does not send SMS.
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

  // Fetch the actual inbound message from Twilio.
  //
  // Never trust an email body supplied by a browser
  // or by an unauthenticated request.

  const verifiedMessage =
    await verifyInboundTwilioMessage({
      messageSid: input.messageSid,
      guestPhone: input.guestPhone,
      restaurantPhone: input.restaurantPhone,
    });

  if (!verifiedMessage.verified) {
    return {
      status: "error",
      reason: verifiedMessage.reason,
    };
  }

  const message = verifiedMessage.message;

  if (!message.messageBody) {
    return {
      status: "review",
      reason: "MESSAGE_BODY_UNAVAILABLE",
    };
  }

  // Reuse the existing reservation attribution system.
  //
  // Coordinator state reads remain disabled.

  const context =
    await resolveReservationInboundContext(
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
    context.attribution.decision === "rejected"
  ) {
    return {
      status: "review",
      reason: "UNRESOLVED_ATTRIBUTION",
    };
  }

  let reservationId: string;
  let reservationReference: string;

  let attribution: AttributionResult =
    context.attribution;

  // Existing explicit-reference attribution.
  //
  // Preserve this path for guests who voluntarily
  // include their reservation reference.

  if (
    context.attribution.decision === "attributed" &&
    context.attribution.basis === "reference"
  ) {
    reservationId =
      context.attribution.reservationId;

    const matchingCandidates =
      context.candidates.filter(
        (candidate) =>
          candidate.reservationId.toLowerCase() ===
            reservationId.toLowerCase() &&
          candidate.guestPhone === message.guestPhone &&
          candidate.reference !== null,
      );

    if (matchingCandidates.length !== 1) {
      return {
        status: "review",
        reason: "UNVERIFIED_RESERVATION_REFERENCE",
      };
    }

    const reference =
      matchingCandidates[0].reference;

    if (
      !reference ||
      !REFERENCE.test(reference)
    ) {
      return {
        status: "review",
        reason: "INVALID_RESERVATION_REFERENCE",
      };
    }

    reservationReference = reference;
  } else {
    // Do not override an explicit reference that
    // could not be resolved safely.

    if (
      REFERENCE_IN_TEXT.test(message.messageBody)
    ) {
      return {
        status: "review",
        reason: "UNRESOLVED_RESERVATION_REFERENCE",
      };
    }

    // Preserve the existing YES/NO clarity safeguards.

    if (
      context.attribution.decision === "attributed" &&
      context.attribution.basis === "active_clarity"
    ) {
      return {
        status: "review",
        reason: "ACTIVE_CLARITY_CONTEXT",
      };
    }

    // The new attribution path applies only to
    // standalone email-address replies.
    //
    // The existing policy performs full validation.

    if (
      !SIMPLE_EMAIL.test(
        message.messageBody.trim(),
      )
    ) {
      return {
        status: "review",
        reason: "EMAIL_ONLY_REPLY_REQUIRED",
      };
    }

    const resolved =
      await resolveOutstandingDepositContext(
        supabase,
        context.candidates,
        message.guestPhone,
        message.restaurantPhone,
      );

    if (resolved.status !== "resolved") {
      return {
        status: resolved.status,
        reason: resolved.reason,
      };
    }

    reservationId =
      resolved.context.reservationId;

    reservationReference =
      resolved.context.reference;

    // The deposit notification must not silently
    // override a conflicting, already-attributed
    // active conversation.

    if (
      context.attribution.decision === "attributed" &&
      context.attribution.basis === "active_context" &&
      context.attribution.reservationId.toLowerCase() !==
        reservationId.toLowerCase()
    ) {
      return {
        status: "review",
        reason: "CONFLICTING_ACTIVE_CONTEXT",
      };
    }

    // Exactly one verified outstanding deposit
    // conversation establishes active_context.

    attribution = {
      decision: "attributed",
      reservationId,
      basis: "active_context",
    };
  }

  if (!UUID.test(reservationId)) {
    return {
      status: "blocked",
      reason: "INVALID_RESERVATION_ID",
    };
  }

  // Before any registration or email persistence,
  // enforce the target reservation selected by staff.
  // Normal automated processing remains unchanged when
  // expectedReservationId is omitted.
  if (options.expectedReservationId !== undefined) {
    if (!UUID.test(options.expectedReservationId)) {
      return {
        status: "blocked",
        reason: "INVALID_EXPECTED_RESERVATION_ID",
      };
    }

    if (
      reservationId.toLowerCase() !==
      options.expectedReservationId.toLowerCase()
    ) {
      return {
        status: "review",
        reason: "RECOVERY_RESERVATION_MISMATCH",
      };
    }
  }

  // Independently verify the selected reservation's
  // existing conversation UUID and phone pair.

  const {
    data: conversationData,
    error: conversationError,
  } = await supabase
    .from("reservation_shared_conversations")
    .select(
      "id, reservation_request_id, guest_phone, restaurant_phone",
    )
    .eq(
      "reservation_request_id",
      reservationId,
    )
    .maybeSingle();

  if (conversationError) {
    return {
      status: "error",
      reason: "CONVERSATION_LOOKUP_FAILED",
    };
  }

  const conversation: ConversationRow | null =
    conversationData;

  if (
    !conversation ||
    !UUID.test(conversation.id) ||
    conversation.reservation_request_id !==
      reservationId ||
    conversation.guest_phone !==
      message.guestPhone ||
    conversation.restaurant_phone !==
      message.restaurantPhone
  ) {
    return {
      status: "blocked",
      reason: "CONVERSATION_IDENTITY_MISMATCH",
    };
  }

  // Verify reservation details.

  const {
    data: reservationData,
    error: reservationError,
  } = await supabase
    .from("reservation_requests")
    .select(
      "id, customer_phone, email, request_status, details_validated, party_size, deposit_amount, deposit_status",
    )
    .eq("id", reservationId)
    .maybeSingle();

  if (reservationError) {
    return {
      status: "error",
      reason: "RESERVATION_LOOKUP_FAILED",
    };
  }

  const reservation: ReservationRow | null =
    reservationData;

  if (
    !reservation ||
    reservation.id !== reservationId ||
    reservation.customer_phone !==
      message.guestPhone
  ) {
    return {
      status: "blocked",
      reason: "RESERVATION_IDENTITY_MISMATCH",
    };
  }

  // Verify staff workflow eligibility.

  const {
    data: workflowData,
    error: workflowError,
  } = await supabase
    .from("reservation_staff_workflows")
    .select(
      "reservation_request_id, workflow_status",
    )
    .eq(
      "reservation_request_id",
      reservationId,
    )
    .maybeSingle();

  if (workflowError) {
    return {
      status: "error",
      reason: "WORKFLOW_LOOKUP_FAILED",
    };
  }

  const workflow: WorkflowRow | null =
    workflowData;

  if (
    !workflow ||
    workflow.reservation_request_id !==
      reservationId
  ) {
    return {
      status: "blocked",
      reason: "WORKFLOW_NOT_FOUND",
    };
  }

  // Verify the accepted required-deposit notification.

  const eventKey =
    `reservation_deposit_decision:${reservationId}`;

  const {
    data: notificationData,
    error: notificationError,
  } = await supabase
    .from("reservation_notification_events")
    .select(
      "reservation_request_id, event_key, notification_status, notification_type, deposit_decision, twilio_message_sid",
    )
    .eq(
      "reservation_request_id",
      reservationId,
    )
    .eq("event_key", eventKey)
    .maybeSingle();

  if (notificationError) {
    return {
      status: "error",
      reason: "NOTIFICATION_LOOKUP_FAILED",
    };
  }

  const notification: NotificationRow | null =
    notificationData;

  if (
    !notification ||
    notification.reservation_request_id !==
      reservationId ||
    notification.event_key !== eventKey ||
    notification.notification_type !==
      "reservation_deposit_decision"
  ) {
    return {
      status: "blocked",
      reason: "DEPOSIT_NOTIFICATION_NOT_FOUND",
    };
  }

  if (
    notification.deposit_decision !== "required"
  ) {
    return {
      status: "blocked",
      reason: "DEPOSIT_NOT_REQUIRED",
    };
  }

  if (
    !["sent", "delivered"].includes(
      notification.notification_status,
    ) ||
    !notification.twilio_message_sid ||
    !MESSAGE_SID.test(
      notification.twilio_message_sid,
    )
  ) {
    return {
      status: "blocked",
      reason: "DEPOSIT_NOTIFICATION_NOT_SENT",
    };
  }

  // Reuse the existing pure deposit-email policy.

  const emailContext: DepositEmailContext = {
    reservationId,
    guestPhone: message.guestPhone,
    requestStatus:
      reservation.request_status,
    detailsValidated:
      reservation.details_validated,
    partySize:
      reservation.party_size,
    depositAmount:
      reservation.deposit_amount,
    depositStatus:
      reservation.deposit_status,
    workflowStatus:
      workflow.workflow_status,
    depositDecisionNotificationStatus:
      notification.notification_status,
    existingEmail: normalizeExistingEmail(
      reservation.email,
    ),
  };

  const evaluation =
    evaluateDepositEmailReply({
      body: message.messageBody,
      attribution,
      context: emailContext,
    });

  if (
    evaluation.decision === "needs_staff_review"
  ) {
    return {
      status: "review",
      reason: evaluation.reason,
    };
  }

  if (
    evaluation.decision === "blocked"
  ) {
    return {
      status: "blocked",
      reason: evaluation.reason,
    };
  }

  // Register the verified inbound SMS through the
  // existing reservation-aware database procedure.
  //
  // The reference is retrieved from trusted
  // reservation data, not typed by the guest.
  //
  // The database registrar independently validates:
  // - Reservation identity.
  // - Reservation reference.
  // - Guest and restaurant phone pair.
  // - Existing conversation association.
  // - Accepted required-deposit notification.
  // - Inbound message timestamp.
  // - Message SID ownership and idempotency.

  const {
    data: recordingData,
    error: recordingError,
  } = await supabase.rpc(
    "record_reservation_deposit_email_inbound",
    {
      p_reservation_id: reservationId,
      p_guest_phone: message.guestPhone,
      p_restaurant_phone:
        message.restaurantPhone,
      p_twilio_message_sid:
        message.messageSid,
      p_message_created_at:
        message.messageCreatedAt,
      p_reservation_reference:
        reservationReference,
    },
  );

  if (recordingError) {
    console.error(
      "Deposit email inbound registration rejected.",
      {
        reservationId,
        code: recordingError.code,
      },
    );

    return {
      status: "error",
      reason: "INBOUND_REGISTRATION_UNAVAILABLE",
    };
  }

  const recorded =
    firstRow<RecordingRow>(recordingData);

  if (
    !recorded ||
    recorded.reservation_id.toLowerCase() !==
      reservationId.toLowerCase() ||
    recorded.inbound_message_sid.toLowerCase() !==
      message.messageSid.toLowerCase() ||
    !["recorded", "duplicate"].includes(
      recorded.outcome,
    )
  ) {
    return {
      status: "error",
      reason: "INVALID_INBOUND_REGISTRATION_RESULT",
    };
  }

  const email =
    evaluation.decision === "no_change"
      ? normalizeExistingEmail(
          reservation.email,
        )
      : evaluation.email;

  if (!email) {
    return {
      status: "review",
      reason: "EMAIL_NOT_AVAILABLE",
    };
  }

  // Save through the existing transactional RPC.
  //
  // The database independently rechecks:
  // - Message SID ownership.
  // - Verified inbound conversation association.
  // - Reservation and deposit eligibility.
  // - Notification state and timing.
  // - Existing email consistency.

  const {
    data: savedData,
    error: saveError,
  } = await supabase.rpc(
    "save_reservation_deposit_email",
    {
      p_reservation_id: reservationId,
      p_twilio_message_sid:
        message.messageSid,
      p_email: email,
    },
  );

  if (saveError) {
    console.error(
      "Deposit email persistence rejected.",
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