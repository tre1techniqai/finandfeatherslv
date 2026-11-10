import { createHash } from "node:crypto";
import twilio from "twilio";
import type { SupabaseClient } from "@supabase/supabase-js";

import {
  dispatchReservationDepositPaymentReplyActions,
  type DepositReplyFollowUpResult,
} from "@/lib/reservations/dispatch-reservation-deposit-payment-reply-actions";

// This is the same pure JS policy tested by
// tests/deposit-payment-reply-policy.test.cjs.
// @ts-ignore The protected Twilio-function CommonJS module has no TS declaration.
import paymentReplyPolicy from "../../../twilio/functions/deposit-payment-reply-policy.js";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MESSAGE_SID = /^SM[0-9a-f]{32}$/i;
const ACCOUNT_SID = /^AC[0-9a-f]{32}$/i;
const E164 = /^\+[1-9]\d{7,14}$/;
const INVOICE_BODY_START = "Fin & Feathers Las Vegas";
const INVOICE_BODY_PROMPT = "Please reply PAID once your payment is completed.";

type Input = { messageSid: string; guestPhone: string; restaurantPhone: string };
type Classification = "payment_claim" | "assistance";
type PolicyResult = { kind: "payment_claim" | "assistance" | "ignore"; reason?: string };
type Outcome =
  | { status: "recorded" | "duplicate"; reservationId: string; messageSid: string; followUp: DepositReplyFollowUpResult }
  | { status: "not_applicable" | "review" | "blocked" | "error"; reason: string };

type Candidate = {
  id: string;
  reservation_request_id: string;
  guest_phone: string;
  restaurant_phone: string;
  mode: string;
};
type Reservation = {
  id: string;
  customer_phone: string;
  request_status: string;
  details_validated: boolean;
  deposit_status: string;
  email: string | null;
  party_size: number;
};
type InvoiceOperation = {
  id: string;
  reservation_request_id: string;
  client_request_id: string;
  status: string;
  message_body: string;
  twilio_message_sid: string | null;
  completed_at: string | null;
};
type Ownership = { reservation_request_id: string; twilio_message_sid: string };
type Registered = {
  reply_id: string;
  outcome: "recorded" | "duplicate";
  reservation_id: string;
  conversation_id: string;
};

function exactlyOne<T>(value: T[] | null | undefined): T | null {
  return Array.isArray(value) && value.length === 1 ? value[0] : null;
}

function matchesId(a: string, b: string): boolean {
  return a.toLowerCase() === b.toLowerCase();
}

function validInvoiceBody(body: string): boolean {
  return body.startsWith(INVOICE_BODY_START) && body.includes(INVOICE_BODY_PROMPT);
}

/**
 * Called ONLY by the HMAC-protected Twilio ingress route with a service-role DB.
 * Never accepts a message body or reservation ID from the forwarder.
 * No guest-phone-only attribution: requires one independently verified
 * accepted invoice operation, matching outbound SID ownership and conversation.
 * The registration RPC is the final authoritative transactional gate.
 */
export async function processReservationDepositPaymentReply(
  db: SupabaseClient,
  input: Input,
): Promise<Outcome> {
  if (
    !MESSAGE_SID.test(input.messageSid) ||
    !E164.test(input.guestPhone) ||
    !E164.test(input.restaurantPhone) ||
    input.guestPhone === input.restaurantPhone ||
    input.restaurantPhone !== process.env.TWILIO_FROM_NUMBER
  ) return { status: "blocked", reason: "INVALID_MESSAGE_IDENTITY" };

  const accountSid = process.env.TWILIO_ACCOUNT_SID ?? "";
  const authToken = process.env.TWILIO_AUTH_TOKEN ?? "";
  if (!ACCOUNT_SID.test(accountSid) || !authToken) {
    return { status: "error", reason: "TWILIO_NOT_CONFIGURED" };
  }

  // Independently fetch original content, source, destination and timestamp.
  // A forwarded SMS body, reference ID or browser input is never trusted.
  let body: string;
  let createdAt: Date;
  try {
    const message = await twilio(accountSid, authToken).messages(input.messageSid).fetch();
    if (
      !matchesId(message.sid, input.messageSid) ||
      message.from !== input.guestPhone ||
      message.to !== input.restaurantPhone ||
      message.direction !== "inbound" ||
      typeof message.body !== "string" ||
      !(message.dateCreated instanceof Date) ||
      !Number.isFinite(message.dateCreated.getTime())
    ) return { status: "review", reason: "TWILIO_IDENTITY_MISMATCH" };
    body = message.body.trim();
    createdAt = message.dateCreated;
  } catch {
    return { status: "error", reason: "TWILIO_VERIFICATION_UNAVAILABLE" };
  }

  // A previously verified reply retains its ownership and processing outcome
  // even after the reservation is confirmed, archived, or its deposit is verified.
  // Never claim follow-up SMS again on a duplicate webhook delivery.
  const { data: previousRows, error: previousError } = await db
    .from("reservation_deposit_payment_replies")
    .select("id, reservation_request_id, conversation_id, inbound_message_sid, inbound_message_created_at, guest_message_body, classification")
    .ilike("inbound_message_sid", input.messageSid);
  if (previousError) {
    return { status: "error", reason: "DUPLICATE_LOOKUP_UNAVAILABLE" };
  }
  if ((previousRows ?? []).length > 1) {
    return { status: "review", reason: "DUPLICATE_SID_COLLISION" };
  }
  if (previousRows?.length === 1) {
    const existing = previousRows[0];
    const [ownerResult, conversationResult, eventResult] = await Promise.all([
      db.from("reservation_message_sid_ownership")
        .select("reservation_request_id, twilio_message_sid")
        .ilike("twilio_message_sid", input.messageSid),
      db.from("reservation_shared_conversations")
        .select("id, reservation_request_id, guest_phone, restaurant_phone")
        .eq("id", existing.conversation_id),
      db.from("reservation_shared_inbound_events")
        .select("conversation_id, twilio_message_sid, message_created_at")
        .ilike("twilio_message_sid", input.messageSid),
    ]);
    if (ownerResult.error || conversationResult.error || eventResult.error) {
      return { status: "error", reason: "DUPLICATE_OWNERSHIP_UNAVAILABLE" };
    }
    const owner = exactlyOne(ownerResult.data);
    const conversation = exactlyOne(conversationResult.data);
    const inbound = exactlyOne(eventResult.data);
    if (!owner || !conversation || !inbound ||
        !UUID.test(existing.reservation_request_id) ||
        !matchesId(existing.inbound_message_sid, input.messageSid) ||
        !matchesId(owner.reservation_request_id, existing.reservation_request_id) ||
        !matchesId(conversation.reservation_request_id, existing.reservation_request_id) ||
        !matchesId(conversation.id, existing.conversation_id) ||
        !matchesId(inbound.conversation_id, existing.conversation_id) ||
        !matchesId(owner.twilio_message_sid, input.messageSid) ||
        !matchesId(inbound.twilio_message_sid, input.messageSid) ||
        conversation.guest_phone !== input.guestPhone ||
        conversation.restaurant_phone !== input.restaurantPhone ||
        existing.guest_message_body !== body ||
        Date.parse(existing.inbound_message_created_at) !== createdAt.getTime() ||
        Date.parse(inbound.message_created_at) !== createdAt.getTime()
    ) {
      return { status: "review", reason: "DUPLICATE_OWNERSHIP_MISMATCH" };
    }
    // Reconcile only actions still registered. The DB claim is the
    // at-most-once fence: accepted, submitting and uncertain are never retried.
    // This is safe on duplicate webhook deliveries and across parallel workers.
    const followUp = await dispatchReservationDepositPaymentReplyActions(db, {
      replyId: existing.id,
      reservationId: existing.reservation_request_id,
      conversationId: existing.conversation_id,
      guestPhone: input.guestPhone,
      classification: existing.classification as Classification,
    });
    return {
      status: "duplicate",
      reservationId: existing.reservation_request_id,
      messageSid: input.messageSid,
      followUp,
    };
  }

  const rawPolicy = paymentReplyPolicy as {
    classifyDepositPaymentReply?: (body: string) => PolicyResult;
  };
  if (typeof rawPolicy.classifyDepositPaymentReply !== "function") {
    return { status: "error", reason: "PAYMENT_POLICY_UNAVAILABLE" };
  }
  const decision = rawPolicy.classifyDepositPaymentReply(body);
  if (decision.kind === "ignore") {
    return { status: "blocked", reason: decision.reason ?? "MESSAGE_IGNORED" };
  }
  if (decision.kind !== "payment_claim" && decision.kind !== "assistance") {
    return { status: "error", reason: "INVALID_CLASSIFICATION" };
  }
  const classification: Classification = decision.kind;

  // Look up every conversation for this exact Twilio phone pair. Do not choose
  // the newest reservation or infer identity from the phone number alone.
  const { data: conversations, error: conversationError } = await db
    .from("reservation_shared_conversations")
    .select("id, reservation_request_id, guest_phone, restaurant_phone, mode")
    .eq("guest_phone", input.guestPhone)
    .eq("restaurant_phone", input.restaurantPhone);
  if (conversationError) return { status: "error", reason: "CONVERSATION_LOOKUP_FAILED" };
  const possible = (conversations ?? []) as Candidate[];
  if (!possible.length) return { status: "not_applicable", reason: "NO_VERIFIED_CONVERSATION" };
  if (possible.some(c => !UUID.test(c.id) || !UUID.test(c.reservation_request_id))) {
    return { status: "review", reason: "INVALID_CONVERSATION_IDENTITY" };
  }

  const ids = [...new Set(possible.map(c => c.reservation_request_id))];
  const invoiceRequestIds = ids.map(invoiceRequestId);
  const [reservationResult, invoiceResult] = await Promise.all([
    db.from("reservation_requests")
      .select("id, customer_phone, request_status, details_validated, deposit_status, email, party_size")
      .in("id", ids),
    db.from("reservation_guest_contact_sms_operations")
      .select("id, reservation_request_id, client_request_id, status, message_body, twilio_message_sid, completed_at")
      .in("reservation_request_id", ids)
      .in("client_request_id", invoiceRequestIds)
      .eq("status", "accepted"),
  ]);
  if (reservationResult.error || invoiceResult.error) {
    return { status: "error", reason: "INVOICE_CONTEXT_LOOKUP_FAILED" };
  }
  const reservations = (reservationResult.data ?? []) as Reservation[];
  const operations = (invoiceResult.data ?? []) as InvoiceOperation[];
  // Only accepted invoice-specific operations count; unrelated accepted
  // guest-contact SMS must not intercept Studio's existing routing.
  if (operations.length === 0) {
    return { status: "not_applicable", reason: "NO_ACCEPTED_INVOICE" };
  }
  const candidates: Array<{ conversation: Candidate; reservation: Reservation; invoice: InvoiceOperation }> = [];

  for (const conversation of possible) {
    if (conversation.mode !== "automation" && conversation.mode !== "staff") continue;
    if (possible.filter(c => matchesId(c.reservation_request_id, conversation.reservation_request_id)).length !== 1) continue;
    const reservation = exactlyOne(reservations.filter(r => matchesId(r.id, conversation.reservation_request_id)));
    if (
      !reservation || reservation.customer_phone !== input.guestPhone ||
      reservation.details_validated !== true ||
      !["pending", "incomplete"].includes(reservation.request_status) ||
      reservation.deposit_status !== "pending" ||
      !Number.isInteger(reservation.party_size) ||
      reservation.party_size < 9 || reservation.party_size > 20 ||
      !reservation.email || !reservation.email.trim()
    ) continue;
    const deterministicRequestId = invoiceRequestId(reservation.id);
    const invoice = exactlyOne(operations.filter(op =>
      matchesId(op.reservation_request_id, reservation.id) &&
      matchesId(op.client_request_id, deterministicRequestId) &&
      op.status === "accepted" &&
      typeof op.twilio_message_sid === "string" && MESSAGE_SID.test(op.twilio_message_sid) &&
      typeof op.completed_at === "string" &&
      Number.isFinite(Date.parse(op.completed_at)) &&
      createdAt.getTime() >= Date.parse(op.completed_at) &&
      validInvoiceBody(op.message_body),
    ));
    if (invoice) candidates.push({ conversation, reservation, invoice });
  }
  if (candidates.length !== 1) {
    return { status: "review", reason: candidates.length ? "AMBIGUOUS_ACTIVE_INVOICE" : "NO_ELIGIBLE_INVOICE" };
  }
  const selected = candidates[0];
  const outboundSid = selected.invoice.twilio_message_sid;
  if (!outboundSid) return { status: "review", reason: "INVOICE_SID_MISSING" };
  const { data: ownerRows, error: ownerError } = await db
    .from("reservation_message_sid_ownership")
    .select("reservation_request_id, twilio_message_sid")
    .ilike("twilio_message_sid", outboundSid);
  if (ownerError) return { status: "error", reason: "OUTBOUND_OWNERSHIP_LOOKUP_FAILED" };
  const owner = exactlyOne((ownerRows ?? []) as Ownership[]);
  if (!owner || !matchesId(owner.reservation_request_id, selected.reservation.id) ||
      !matchesId(owner.twilio_message_sid, outboundSid)) {
    return { status: "review", reason: "OUTBOUND_SID_OWNERSHIP_UNVERIFIED" };
  }

  // The RPC locks conversation first and reservation second, verifies all the
  // identities again, and atomically records both existing SID registries.
  const { data: registeredData, error: registrationError } = await db.rpc(
    "record_reservation_deposit_payment_reply",
    {
      p_reservation_id: selected.reservation.id,
      p_conversation_id: selected.conversation.id,
      p_guest_phone: input.guestPhone,
      p_restaurant_phone: input.restaurantPhone,
      p_message_sid: input.messageSid,
      p_message_created_at: createdAt.toISOString(),
      p_message_body: body,
      p_classification: classification,
    },
  );
  if (registrationError) {
    console.error("Deposit payment reply registration rejected", { code: registrationError.code });
    return { status: "review", reason: "REGISTRATION_REJECTED" };
  }
  const row = exactlyOne(Array.isArray(registeredData) ? registeredData as Registered[] : [registeredData as Registered]);
  if (!row || !UUID.test(row.reply_id) ||
      !["recorded", "duplicate"].includes(row.outcome) ||
      !matchesId(row.reservation_id, selected.reservation.id) ||
      !matchesId(row.conversation_id, selected.conversation.id)) {
    return { status: "error", reason: "INVALID_REGISTRATION_RESULT" };
  }

  // Registration and Twilio submission are separate transactions. A
  // duplicate registration may safely resume actions not yet claimed:
  // the service-role claim RPC never reclaims submitting/uncertain/accepted.
  const followUp = await dispatchReservationDepositPaymentReplyActions(db, {
    replyId: row.reply_id,
    reservationId: selected.reservation.id,
    conversationId: selected.conversation.id,
    guestPhone: input.guestPhone,
    classification,
  });
  return { status: row.outcome, reservationId: selected.reservation.id, messageSid: input.messageSid, followUp };
}

/** PostgreSQL md5(... )::uuid grouping, computed without relying on input IDs. */
function invoiceRequestId(reservationId: string): string {
  const hex = createHash("md5")
    .update(`fflv:deposit-payment-link-notification:v1:${reservationId}`)
    .digest("hex");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}