import twilio from "twilio";
import type { SupabaseClient } from "@supabase/supabase-js";

// Trusted-server-only follow-up sender. The caller must first verify the actual
// Twilio inbound message, unique reservation/conversation attribution, and
// register it with record_reservation_deposit_payment_reply.
// Requires the REVIEW_ONLY ledger RPCs to be reviewed, tested, and deployed.
// Never retry an uncertain Twilio submission.

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const SID = /^SM[0-9a-f]{32}$/i;
const ACCOUNT_SID = /^AC[0-9a-f]{32}$/i;
const E164 = /^\+[1-9]\d{7,14}$/;

export const DEPOSIT_ASSISTANCE_REPLY =
  "Questions or concerns? No worries, a member of our staff will contact you directly to assist.";

type Kind = "staff_alert" | "assistance_reply";
type Claim = {
  reply_id: string;
  action_kind: Kind;
  claim_status: "claimed" | "already_claimed" | "staff_control";
  guest_message_body: string;
  reservation_id: string;
  conversation_id: string;
};

type Finalized = {
  reply_id: string;
  action_kind: Kind;
  action_status: "accepted" | "uncertain" | "rejected";
};

type DispatchState = "accepted" | "already_claimed" | "staff_control" | "uncertain" | "not_configured" | "claim_failed";

export type DepositReplyFollowUpResult = {
  staffAlert: DispatchState;
  assistanceReply: DispatchState | "not_required";
};

export type VerifiedDepositReply = {
  replyId: string;
  reservationId: string;
  conversationId: string;
  guestPhone: string;
  classification: "payment_claim" | "assistance";
};

function firstRow<T>(value: unknown): T | null {
  if (Array.isArray(value)) return value.length === 1 ? (value[0] as T) : null;
  return value && typeof value === "object" ? (value as T) : null;
}

function isClaim(value: unknown, input: VerifiedDepositReply, kind: Kind): value is Claim {
  if (!value || typeof value !== "object") return false;
  const r = value as Record<string, unknown>;
  return r.reply_id === input.replyId &&
    r.reservation_id === input.reservationId &&
    r.conversation_id === input.conversationId &&
    r.action_kind === kind &&
    ["claimed", "already_claimed", "staff_control"].includes(String(r.claim_status)) &&
    typeof r.guest_message_body === "string" &&
    r.guest_message_body.length > 0 && r.guest_message_body.length <= 4000;
}

function isFinalized(value: unknown, input: VerifiedDepositReply, kind: Kind, status: Finalized["action_status"]): value is Finalized {
  if (!value || typeof value !== "object") return false;
  const r = value as Record<string, unknown>;
  return r.reply_id === input.replyId && r.action_kind === kind && r.action_status === status;
}

function staffAlertBody(input: VerifiedDepositReply, originalReply: string): string {
  // The reservation UUID is an internal lookup aid, not a guest-facing value.
  // Truncate to keep the message under Twilio's practical SMS length limits.
  const excerpt = originalReply.replace(/[\u0000-\u001f\u007f]/g, " ").trim().slice(0, 550);
  const heading = input.classification === "payment_claim"
    ? "Fin & Feathers LV — Guest replied to deposit link (PAID). Verify payment in Toast."
    : "Fin & Feathers LV — Guest needs deposit invoice assistance. Contact guest directly.";
  return `${heading}\nReservation: ${input.reservationId}\nGuest reply: ${excerpt}`;
}

async function dispatchOne(
  db: SupabaseClient,
  client: ReturnType<typeof twilio>,
  input: VerifiedDepositReply,
  kind: Kind,
  from: string,
  recipient: string,
): Promise<DispatchState> {
  const { data: claimData, error: claimError } = await db.rpc(
    "claim_reservation_deposit_payment_reply_action",
    { p_reply_id: input.replyId, p_kind: kind },
  );
  if (claimError) {
    console.error("Deposit reply follow-up claim failed", { kind, code: claimError.code });
    return "claim_failed";
  }
  const claim = firstRow<Claim>(claimData);
  if (!isClaim(claim, input, kind)) {
    console.error("Deposit reply follow-up claim identity mismatch", { kind });
    return "claim_failed";
  }
  if (claim.claim_status !== "claimed") return claim.claim_status;

  // At this point the DB claim is committed. Network failures are UNCERTAIN:
  // do not automatically retry this action, even if the Twilio call throws.
  const body = kind === "staff_alert"
    ? staffAlertBody(input, claim.guest_message_body)
    : DEPOSIT_ASSISTANCE_REPLY;
  let status: Finalized["action_status"] = "uncertain";
  let messageSid: string | null = null;
  try {
    const sent = await client.messages.create({ from, to: recipient, body });
    if (SID.test(sent.sid)) {
      status = "accepted";
      messageSid = sent.sid;
    }
  } catch (error) {
    console.error("Deposit reply follow-up Twilio outcome uncertain", {
      kind,
      name: error instanceof Error ? error.name : "UnknownError",
    });
  }

  const { data: finalized, error: finalizationError } = await db.rpc(
    "finalize_reservation_deposit_payment_reply_action",
    {
      p_reply_id: input.replyId,
      p_kind: kind,
      p_status: status,
      p_twilio_message_sid: messageSid,
    },
  );
  if (finalizationError || !isFinalized(firstRow(finalized), input, kind, status)) {
    console.error("Deposit reply follow-up finalization needs manual reconciliation", {
      kind,
      code: finalizationError?.code ?? "INVALID_RESULT",
    });
    return "uncertain";
  }
  return status;
}

/**
 * Invoke on the server after a VERIFIED record/duplicate response from the
 * registration RPC, never directly from a guest-supplied body or browser.
 * The database decides whether actions can be claimed and blocks automatic
 * guest assistance while the conversation is in staff mode.
 */
export async function dispatchReservationDepositPaymentReplyActions(
  db: SupabaseClient,
  input: VerifiedDepositReply,
): Promise<DepositReplyFollowUpResult> {
  const fallback: DepositReplyFollowUpResult = {
    staffAlert: "not_configured",
    assistanceReply: input.classification === "assistance" ? "not_configured" : "not_required",
  };
  if (
    !UUID.test(input.replyId) || !UUID.test(input.reservationId) ||
    !UUID.test(input.conversationId) || !E164.test(input.guestPhone) ||
    !["payment_claim", "assistance"].includes(input.classification)
  ) return fallback;

  if (process.env.RESERVATION_DEPOSIT_PAYMENT_REPLY_SEND_ENABLED !== "true") return fallback;
  const accountSid = process.env.TWILIO_ACCOUNT_SID ?? "";
  const token = process.env.TWILIO_AUTH_TOKEN ?? "";
  const from = process.env.TWILIO_FROM_NUMBER ?? "";
  const staffPhone = process.env.RESERVATION_DEPOSIT_STAFF_ALERT_PHONE ?? "";
  if (!ACCOUNT_SID.test(accountSid) || !token || !E164.test(from) ||
      !E164.test(staffPhone) || staffPhone === from || input.guestPhone === from) return fallback;

  const client = twilio(accountSid, token);
  const staffAlert = await dispatchOne(db, client, input, "staff_alert", from, staffPhone);
  const assistanceReply = input.classification === "assistance"
    ? await dispatchOne(db, client, input, "assistance_reply", from, input.guestPhone)
    : "not_required";
  return { staffAlert, assistanceReply };
}