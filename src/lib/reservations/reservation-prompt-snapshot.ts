import {
  correlateReservationClarityReply,
  type PromptCorrelationResult,
  type VerifiedClarityPrompt,
  type VerifiedClarityReply,
} from "@/lib/reservations/reservation-prompt-correlation";

/**
 * Fin & Feathers — Trusted Prompt Snapshot Resolver
 *
 * Step 58D.13.146I
 *
 * Read-only application boundary for retrieving and
 * evaluating clarification prompt evidence.
 *
 * Does not send SMS, access database tables directly,
 * change Coordinator state, or modify Twilio Studio.
 *
 * The protected database reader is NOT deployed.
 * The current inbound handler does NOT enable this.
 */

const E164 = /^\+[1-9]\d{7,14}$/;
const MESSAGE_SID = /^SM[0-9a-f]{32}$/i;

const MAX_PROMPTS = 100;

export type PromptSnapshotRequest = {
  restaurantPhone: string;
  guestPhone: string;
};

/**
 * Returned by a future authorized server-side reader.
 *
 * complete=true must mean the database retrieved the
 * ENTIRE relevant prompt set for the phone pair.
 *
 * It must not mean "the query succeeded" when the
 * result was limited, paginated, or otherwise partial.
 *
 * Rows must include authoritative Coordinator state
 * and verified provider delivery evidence.
 */
export type PromptSnapshot = {
  complete: boolean;
  prompts: readonly unknown[];
};

export type PromptSnapshotReader = (
  request: PromptSnapshotRequest,
) => Promise<PromptSnapshot>;

/**
 * A reader can only be supplied by trusted server code.
 *
 * Never construct one from browser data, incoming JSON,
 * or an unverified Twilio webhook.
 */
export type PromptSnapshotOptions = {
  enabled?: boolean;
  reader?: PromptSnapshotReader;
};

export type PromptSnapshotResult =
  | {
      success: true;
      status: "evaluated";
      promptCount: number;
      correlation: PromptCorrelationResult;
    }
  | {
      success: false;
      status:
        | "disabled"
        | "invalid_reply"
        | "reader_unavailable"
        | "lookup_failed"
        | "invalid_snapshot"
        | "incomplete_snapshot";
    };

function validReply(
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
    reply.body.length <= 1600 &&
    typeof reply.messageCreatedAt === "string" &&
    Number.isFinite(
      Date.parse(reply.messageCreatedAt),
    ) &&
    /(?:Z|[+-]\d{2}:\d{2})$/i.test(
      reply.messageCreatedAt,
    )
  );
}

/**
 * Evaluate a verified inbound SMS against the complete
 * authoritative set of potentially competing prompts.
 *
 * IMPORTANT:
 *
 * The caller is responsible for authenticating the
 * inbound request and verifying the Twilio message.
 *
 * The reader is responsible for retrieving the complete
 * prompt set from an authorized database interface.
 *
 * The correlation policy independently validates each
 * returned prompt's structure and matching phone pair.
 *
 * A "correlated" result is advisory. It is NOT
 * authorization for a Coordinator transition.
 *
 * The eventual transition RPC must atomically recheck:
 * - reservation and follow-up ownership
 * - Coordinator state and version
 * - active prompt identity and deadline
 * - inbound Message SID idempotency
 * - competing prompt eligibility
 *
 * No database writes occur in this function.
 */
export async function resolveReservationPromptSnapshot(
  reply: VerifiedClarityReply,
  options: PromptSnapshotOptions = {},
): Promise<PromptSnapshotResult> {
  // Disabled unless explicitly enabled by trusted code.
  if (options.enabled !== true) {
    return {
      success: false,
      status: "disabled",
    };
  }

  if (!validReply(reply)) {
    return {
      success: false,
      status: "invalid_reply",
    };
  }

  if (typeof options.reader !== "function") {
    return {
      success: false,
      status: "reader_unavailable",
    };
  }

  let snapshot: PromptSnapshot;

  try {
    snapshot = await options.reader({
      restaurantPhone: reply.restaurantPhone,
      guestPhone: reply.guestPhone,
    });
  } catch {
    // Never expose phone numbers, message bodies,
    // SQL responses, or exception text in errors.
    return {
      success: false,
      status: "lookup_failed",
    };
  }

  if (
    !snapshot ||
    typeof snapshot !== "object" ||
    Array.isArray(snapshot) ||
    typeof snapshot.complete !== "boolean" ||
    !Array.isArray(snapshot.prompts)
  ) {
    return {
      success: false,
      status: "invalid_snapshot",
    };
  }

  // A false completeness assertion blocks evaluation.
  // A database LIMIT must never be mistaken for proof
  // that all potentially competing prompts were read.
  if (snapshot.complete !== true) {
    return {
      success: false,
      status: "incomplete_snapshot",
    };
  }

  // The correlation policy also enforces this limit.
  // Reject rather than silently truncating.
  if (snapshot.prompts.length > MAX_PROMPTS) {
    return {
      success: false,
      status: "incomplete_snapshot",
    };
  }

  const correlation =
    correlateReservationClarityReply({
      reply,
      prompts:
        snapshot.prompts as VerifiedClarityPrompt[],
      snapshotComplete: true,
    });

  // A malformed or conflicting prompt set cannot
  // be considered a successfully evaluated snapshot.
  if (correlation.decision === "rejected") {
    return {
      success: false,
      status: "invalid_snapshot",
    };
  }

  return {
    success: true,
    status: "evaluated",
    promptCount: snapshot.prompts.length,
    correlation,
  };
}