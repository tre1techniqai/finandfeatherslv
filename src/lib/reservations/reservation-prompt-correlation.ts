/**
 * Fin & Feathers — Reservation Prompt Correlation
 *
 * Step 58D.13.146T.1
 *
 * Pure, read-only decision policy.
 *
 * Supports NULL expiration deadlines before verified
 * Twilio delivery.
 *
 * No database writes, SMS sends, Studio operations,
 * or Coordinator state transitions.
 *
 * IMPORTANT:
 * A correlated result is advisory only.
 * The database must independently revalidate all
 * evidence in its eventual atomic transition.
 */

const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const MESSAGE_SID = /^SM[0-9a-f]{32}$/i;
const E164 = /^\+[1-9]\d{7,14}$/;

const MAX_PROMPTS = 100;
const MAX_MESSAGE_LENGTH = 1600;

export type ClarityAnswer = "YES" | "NO";

export type PromptDeliveryStatus =
  | "pending"
  | "accepted"
  | "sent"
  | "delivered"
  | "failed"
  | "undelivered";

export type VerifiedClarityPrompt = {
  reservationId: string;
  followupId: string;
  stateVersion: number;

  // NULL is permitted before Twilio acceptance.
  outboundMessageSid: string | null;

  restaurantPhone: string;
  guestPhone: string;

  deliveryStatus: PromptDeliveryStatus;

  // Only verified delivery may establish this value.
  deliveredAt: string | null;

  // NULL until delivery is independently verified.
  expiresAt: string | null;

  // Current authoritative Coordinator state snapshot.
  coordinatorPhase: string;
  coordinatorStateVersion: number;
  coordinatorFollowupId: string | null;
};

export type VerifiedClarityReply = {
  inboundMessageSid: string;
  restaurantPhone: string;
  guestPhone: string;
  body: string;
  messageCreatedAt: string;
};

export type PromptCorrelationResult =
  | {
      decision: "correlated";
      answer: ClarityAnswer;
      reservationId: string;
      followupId: string;
      stateVersion: number;
      inboundMessageSid: string;
      outboundMessageSid: string;
    }
  | {
      decision: "unresolved";
      reason:
        | "NOT_CLARITY_RESPONSE"
        | "NO_ELIGIBLE_PROMPT"
        | "AMBIGUOUS_PROMPTS"
        | "PROMPT_NOT_DELIVERED"
        | "PROMPT_EXPIRED"
        | "STALE_COORDINATOR_STATE";
    }
  | {
      decision: "rejected";
      reason:
        | "INVALID_INPUT"
        | "INCOMPLETE_SNAPSHOT"
        | "DUPLICATE_PROMPT"
        | "INVALID_PROMPT_EVIDENCE";
    };

function validTimestamp(
  value: unknown,
): value is string {
  return (
    typeof value === "string" &&
    /(?:Z|[+-]\d{2}:\d{2})$/i.test(value) &&
    Number.isFinite(Date.parse(value))
  );
}

function isValidPrompt(
  value: unknown,
): value is VerifiedClarityPrompt {
  if (
    value === null ||
    typeof value !== "object" ||
    Array.isArray(value)
  ) {
    return false;
  }

  const prompt = value as Record<string, unknown>;

  if (
    typeof prompt.reservationId !== "string" ||
    !UUID.test(prompt.reservationId) ||
    typeof prompt.followupId !== "string" ||
    !UUID.test(prompt.followupId) ||
    !Number.isSafeInteger(prompt.stateVersion) ||
    (prompt.stateVersion as number) < 0 ||
    typeof prompt.restaurantPhone !== "string" ||
    !E164.test(prompt.restaurantPhone) ||
    typeof prompt.guestPhone !== "string" ||
    !E164.test(prompt.guestPhone) ||
    prompt.restaurantPhone === prompt.guestPhone ||
    ![
      "pending",
      "accepted",
      "sent",
      "delivered",
      "failed",
      "undelivered",
    ].includes(String(prompt.deliveryStatus)) ||
    typeof prompt.coordinatorPhase !== "string" ||
    !Number.isSafeInteger(
      prompt.coordinatorStateVersion,
    ) ||
    (prompt.coordinatorStateVersion as number) < 0 ||
    (
      prompt.coordinatorFollowupId !== null &&
      (
        typeof prompt.coordinatorFollowupId !== "string" ||
        !UUID.test(prompt.coordinatorFollowupId)
      )
    )
  ) {
    return false;
  }

  if (
    prompt.outboundMessageSid !== null &&
    (
      typeof prompt.outboundMessageSid !== "string" ||
      !MESSAGE_SID.test(prompt.outboundMessageSid)
    )
  ) {
    return false;
  }

  if (prompt.deliveryStatus === "delivered") {
    if (
      typeof prompt.outboundMessageSid !== "string" ||
      !validTimestamp(prompt.deliveredAt) ||
      !validTimestamp(prompt.expiresAt)
    ) {
      return false;
    }

    const delivered = Date.parse(prompt.deliveredAt);
    const expiry = Date.parse(prompt.expiresAt);

    // Both timestamps must reflect the agreed
    // five-minute response window.
    return expiry - delivered === 5 * 60 * 1000;
  }

  // Other delivery states must never carry an active
  // delivery timestamp or response deadline.
  if (
    prompt.deliveredAt !== null ||
    prompt.expiresAt !== null
  ) {
    return false;
  }

  // Accepted or sent messages must have a provider SID.
  if (
    (prompt.deliveryStatus === "accepted" ||
      prompt.deliveryStatus === "sent") &&
    prompt.outboundMessageSid === null
  ) {
    return false;
  }

  return true;
}

function isValidReply(
  value: unknown,
): value is VerifiedClarityReply {
  if (
    value === null ||
    typeof value !== "object" ||
    Array.isArray(value)
  ) {
    return false;
  }

  const reply = value as Record<string, unknown>;

  return (
    typeof reply.inboundMessageSid === "string" &&
    MESSAGE_SID.test(reply.inboundMessageSid) &&
    typeof reply.restaurantPhone === "string" &&
    E164.test(reply.restaurantPhone) &&
    typeof reply.guestPhone === "string" &&
    E164.test(reply.guestPhone) &&
    reply.restaurantPhone !== reply.guestPhone &&
    typeof reply.body === "string" &&
    reply.body.length <= MAX_MESSAGE_LENGTH &&
    validTimestamp(reply.messageCreatedAt)
  );
}

/**
 * Correlate a verified YES/NO SMS reply with a unique
 * delivered clarification prompt.
 *
 * REQUIREMENTS:
 *
 * 1. The caller supplies a complete authoritative
 *    snapshot of prompts for the phone pair.
 *
 * 2. Delivery evidence must originate from trusted
 *    provider verification.
 *
 * 3. Every returned prompt is validated.
 *
 * 4. Pending, accepted, sent, failed and undelivered
 *    prompts cannot individually authorize YES/NO.
 *
 * 5. Uncertain outstanding prompts can prevent unique
 *    correlation rather than being silently ignored.
 *
 * 6. This function cannot perform a state transition.
 */
export function correlateReservationClarityReply(input: {
  reply: VerifiedClarityReply;
  prompts: readonly VerifiedClarityPrompt[];
  snapshotComplete: boolean;
}): PromptCorrelationResult {
  if (
    !input ||
    !isValidReply(input.reply) ||
    !Array.isArray(input.prompts) ||
    input.prompts.length > MAX_PROMPTS
  ) {
    return {
      decision: "rejected",
      reason: "INVALID_INPUT",
    };
  }

  if (input.snapshotComplete !== true) {
    return {
      decision: "rejected",
      reason: "INCOMPLETE_SNAPSHOT",
    };
  }

  const seenSids = new Set<string>();
  const seenFollowups = new Set<string>();

  for (const prompt of input.prompts) {
    if (!isValidPrompt(prompt)) {
      return {
        decision: "rejected",
        reason: "INVALID_PROMPT_EVIDENCE",
      };
    }

    if (
      prompt.restaurantPhone !==
        input.reply.restaurantPhone ||
      prompt.guestPhone !== input.reply.guestPhone
    ) {
      return {
        decision: "rejected",
        reason: "INVALID_PROMPT_EVIDENCE",
      };
    }

    if (prompt.outboundMessageSid !== null) {
      const sid = prompt.outboundMessageSid.toUpperCase();

      if (seenSids.has(sid)) {
        return {
          decision: "rejected",
          reason: "DUPLICATE_PROMPT",
        };
      }

      seenSids.add(sid);
    }

    const followupKey =
      `${prompt.reservationId.toLowerCase()}:` +
      prompt.followupId.toLowerCase();

    if (seenFollowups.has(followupKey)) {
      return {
        decision: "rejected",
        reason: "DUPLICATE_PROMPT",
      };
    }

    seenFollowups.add(followupKey);
  }

  const answer = input.reply.body.trim().toUpperCase();

  if (answer !== "YES" && answer !== "NO") {
    return {
      decision: "unresolved",
      reason: "NOT_CLARITY_RESPONSE",
    };
  }

  const replyTime =
    Date.parse(input.reply.messageCreatedAt);

  const eligible = input.prompts.filter((prompt) => {
    if (
      prompt.deliveryStatus !== "delivered" ||
      prompt.deliveredAt === null ||
      prompt.expiresAt === null
    ) {
      return false;
    }

    const deliveredAt = Date.parse(prompt.deliveredAt);
    const expiresAt = Date.parse(prompt.expiresAt);

    return (
      deliveredAt <= replyTime &&
      replyTime < expiresAt
    );
  });

  if (eligible.length > 1) {
    return {
      decision: "unresolved",
      reason: "AMBIGUOUS_PROMPTS",
    };
  }

  // An unresolved outstanding provider submission
  // might have reached the same guest without its
  // status having been confirmed yet.
  //
  // Without a verified, bounded competing window,
  // do not silently choose another delivered prompt.
  //
  // Conservative policy: any currently unconfirmed
  // submission blocks automatic YES/NO correlation.
  const unconfirmed = input.prompts.some(
    (prompt) =>
      prompt.deliveryStatus === "pending" ||
      prompt.deliveryStatus === "accepted" ||
      prompt.deliveryStatus === "sent",
  );

  if (eligible.length === 1 && unconfirmed) {
    return {
      decision: "unresolved",
      reason: "AMBIGUOUS_PROMPTS",
    };
  }

  if (eligible.length === 0) {
    if (unconfirmed) {
      return {
        decision: "unresolved",
        reason: "PROMPT_NOT_DELIVERED",
      };
    }

    return {
      decision: "unresolved",
      reason: input.prompts.length > 0
        ? "PROMPT_EXPIRED"
        : "NO_ELIGIBLE_PROMPT",
    };
  }

  const prompt = eligible[0];

  if (
    prompt.coordinatorPhase !==
      "awaiting_guest_clarity" ||
    prompt.coordinatorStateVersion !==
      prompt.stateVersion ||
    prompt.coordinatorFollowupId?.toLowerCase() !==
      prompt.followupId.toLowerCase()
  ) {
    return {
      decision: "unresolved",
      reason: "STALE_COORDINATOR_STATE",
    };
  }

  // The eligibility filter has already established
  // these values, but recheck before returning the
  // definitive advisory correlation structure.
  if (
    prompt.outboundMessageSid === null ||
    prompt.deliveryStatus !== "delivered"
  ) {
    return {
      decision: "unresolved",
      reason: "PROMPT_NOT_DELIVERED",
    };
  }

  return {
    decision: "correlated",
    answer: answer as ClarityAnswer,
    reservationId: prompt.reservationId,
    followupId: prompt.followupId,
    stateVersion: prompt.stateVersion,
    inboundMessageSid: input.reply.inboundMessageSid,
    outboundMessageSid: prompt.outboundMessageSid,
  };
}