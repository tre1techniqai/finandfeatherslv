import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import twilio from "twilio";

import type { createSupabaseServerClient } from "@/lib/supabase/server";

type StaffSupabase = Awaited<ReturnType<typeof createSupabaseServerClient>>;

type RegisterRow = { operation_id: string; operation_status: string };
type OwnershipRow = { outcome: "recorded" | "duplicate"; owner_reservation_id: string };
type BeginRow = {
  operation_id: string;
  message_body: string;
  guest_phone: string;
  restaurant_phone: string;
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const E164 = /^\+[1-9]\d{7,14}$/;
const ACCOUNT_SID = /^AC[0-9a-f]{32}$/i;
const MESSAGE_SID = /^SM[0-9a-f]{32}$/i;

function reply(error: string, status: number) {
  return NextResponse.json(
    { success: false, error },
    { status, headers: { "Cache-Control": "no-store" } },
  );
}

function isRegisterRow(value: unknown): value is RegisterRow {
  return value !== null && typeof value === "object" &&
    UUID.test(String((value as Record<string, unknown>).operation_id ?? "")) &&
    typeof (value as Record<string, unknown>).operation_status === "string";
}

function isOwnershipRow(value: unknown): value is OwnershipRow {
  if (value === null || typeof value !== "object" || Array.isArray(value)) return false;
  const row = value as Record<string, unknown>;
  return (row.outcome === "recorded" || row.outcome === "duplicate") &&
    UUID.test(String(row.owner_reservation_id ?? ""));
}

function isBeginRow(value: unknown): value is BeginRow {
  if (value === null || typeof value !== "object") return false;
  const row = value as Record<string, unknown>;
  return UUID.test(String(row.operation_id ?? "")) &&
    typeof row.message_body === "string" &&
    row.message_body.length > 0 && row.message_body.length <= 1600 &&
    E164.test(String(row.guest_phone ?? "")) &&
    E164.test(String(row.restaurant_phone ?? "")) &&
    row.guest_phone !== row.restaurant_phone;
}

/**
 * Sends a single staff-approved deposit-invoice notification.
 * Requires the REVIEW_ONLY SQL registration/begin functions to have been
 * independently reviewed, tested, and deployed before use.
 *
 * Never retries an uncertain Twilio call. The one-time database identity
 * prevents a different browser session from initiating another attempt.
 */
export async function dispatchReservationDepositPaymentLink(
  staffDb: StaffSupabase,
  reservationId: string,
  invoiceEmailConfirmed: boolean,
) {
  if (process.env.RESERVATION_DEPOSIT_PAYMENT_LINK_SEND_ENABLED !== "true") {
    return reply("Deposit payment notifications are not enabled.", 503);
  }
  if (!UUID.test(reservationId) || invoiceEmailConfirmed !== true) {
    return reply("Staff must confirm the invoice was emailed.", 400);
  }

  const accountSid = process.env.TWILIO_ACCOUNT_SID ?? "";
  const authToken = process.env.TWILIO_AUTH_TOKEN ?? "";
  const fromNumber = process.env.TWILIO_FROM_NUMBER ?? "";
  const supabaseUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const serviceKey = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

  // Refuse to claim an operation when a required sending dependency is absent.
  if (!ACCOUNT_SID.test(accountSid) || !authToken || !E164.test(fromNumber) ||
      !supabaseUrl || !serviceKey) {
    return reply("Deposit notification transport is not configured.", 503);
  }

  // Authenticated staff identity and role are checked again by registration RPC.
  const { data: registered, error: registrationError } = await staffDb.rpc(
    "register_reservation_deposit_payment_link_sms",
    { p_reservation_id: reservationId, p_invoice_email_confirmed: true },
  );

  if (registrationError) {
    console.error("Deposit notification registration failed", { code: registrationError.code });
    return reply("Deposit notification could not be authorized or registered.",
      registrationError.code === "42501" ? 403 : 409);
  }
  if (!Array.isArray(registered) || registered.length !== 1 || !isRegisterRow(registered[0])) {
    return reply("Deposit notification registration was not verifiable.", 503);
  }

  const operation = registered[0];
  if (operation.operation_status !== "registered") {
    // This also covers accepted, submitting, uncertain, rejected, cancelled.
    // In all cases, do not send again automatically.
    return reply("A deposit payment notification already exists. Review its recorded outcome before any follow-up.", 409);
  }

  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // The submission RPC atomically transitions registered -> submitting.
  // Concurrent calls cannot both submit the same operation.
  const { data: begun, error: beginError } = await admin.rpc(
    "begin_reservation_deposit_payment_link_sms",
    { p_operation_id: operation.operation_id, p_restaurant_phone: fromNumber },
  );
  if (beginError) {
    console.error("Deposit notification submission rejected", { code: beginError.code });
    return reply("Deposit notification could not begin. Review the reservation and SMS status.", 409);
  }
  if (!Array.isArray(begun) || begun.length !== 1 || !isBeginRow(begun[0]) ||
      begun[0].operation_id !== operation.operation_id ||
      begun[0].restaurant_phone !== fromNumber) {
    // Submission outcome may now be uncertain; do not retry.
    return reply("Deposit notification submission outcome requires review. Do not resend.", 503);
  }

  const submission = begun[0];
  let sentSid: string | null = null;
  try {
    const result = await twilio(accountSid, authToken).messages.create({
      from: submission.restaurant_phone,
      to: submission.guest_phone,
      body: submission.message_body,
    });
    if (MESSAGE_SID.test(result.sid ?? "")) {
      sentSid = result.sid;
    }
  } catch (error) {
    console.error("Deposit notification Twilio outcome uncertain", {
      name: error instanceof Error ? error.name : "UnknownError",
    });
  }

  // Any Twilio error is uncertain: we cannot reliably infer non-delivery.
  const status = sentSid ? "accepted" : "uncertain";
  const { data: finalized, error: finalizeError } = await admin.rpc(
    "finalize_reservation_contact_guest_sms",
    {
      p_operation_id: operation.operation_id,
      p_status: status,
      p_twilio_message_sid: sentSid,
      p_outcome_note: sentSid ? "Deposit payment-link notification accepted by Twilio" :
        "Deposit notification outcome uncertain; manual review required",
    },
  );
  if (finalizeError || !Array.isArray(finalized) || finalized.length !== 1 ||
      finalized[0]?.operation_status !== status) {
    console.error("Deposit notification finalization needs review", {
      code: finalizeError?.code ?? null,
    });
    return reply("Twilio submission outcome requires review. Do not resend.", 503);
  }

  if (!sentSid) {
    return reply("SMS acceptance was not verified. Review Twilio and the reservation before contacting the guest again.", 503);
  }

  // Twilio acceptance and the existing finalization RPC are not sufficient for
  // reservation-aware inbound attribution. Register the outbound SID with its
  // reservation owner, using the already-deployed conflict-checking RPC.
  //
  // This is deliberately fail-closed. If the registrar fails, the SMS may
  // already have been accepted, and the operation must NOT be retried.
  // Reconcile the owner record manually rather than assigning the SID by phone.
  const { data: ownershipData, error: ownershipError } = await admin.rpc(
    "register_reservation_message_sid_ownership",
    { p_reservation_id: reservationId, p_twilio_message_sid: sentSid },
  );
  const owner = Array.isArray(ownershipData) && ownershipData.length === 1
    ? ownershipData[0]
    : null;
  if (ownershipError || !isOwnershipRow(owner) ||
      owner.owner_reservation_id.toLowerCase() !== reservationId.toLowerCase()) {
    console.error("Deposit notification outbound SID ownership requires review", {
      reservationId,
      operationId: operation.operation_id,
      code: ownershipError?.code ?? "UNVERIFIED_OWNER_RESULT",
    });
    return reply(
      "Twilio accepted the invoice notification, but reservation-specific message ownership could not be verified. Do not resend; reconcile the Message SID before processing guest replies.",
      503,
    );
  }

  return NextResponse.json(
    {
      success: true,
      accepted: true,
      operationId: operation.operation_id,
      messageSid: sentSid,
      // Twilio API acceptance is not handset delivery or payment confirmation.
      deliveryVerified: false,
      reservationConfirmed: false,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}