import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import twilio from "twilio";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const E164 = /^\+[1-9]\d{7,14}$/;
const ACCOUNT_SID = /^AC[0-9a-f]{32}$/i;
const MESSAGE_SID = /^SM[0-9a-f]{32}$/i;
const MAX_REQUEST_BYTES = 4096;
const MAX_MESSAGE_CHARS = 1600;

type RouteContext = { params: Promise<{ id: string }> };
type OwnershipRow = {
  ownership_id: string;
  ownership_status: string;
  linked_reservation_id: string;
  claimed_by: string | null;
};
type OperationRow = { operation_id: string; operation_status: string };
type SubmissionRow = {
  operation_id: string;
  message_body: string;
  guest_phone: string;
  restaurant_phone: string;
};

function respond(payload: Record<string, unknown>, status = 200): NextResponse {
  return NextResponse.json(payload, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

function fail(error: string, status: number): NextResponse {
  return respond({ success: false, error }, status);
}

function validOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    const source = new URL(origin);
    const target = new URL(request.url);
    return (
      source.origin === target.origin &&
      (source.protocol === "https:" ||
        source.hostname === "localhost" ||
        source.hostname === "127.0.0.1")
    );
  } catch {
    return false;
  }
}

function staffMessagingConfigured(): boolean {
  return (
    process.env.RESERVATION_STAFF_SMS_ENABLED === "true" &&
    process.env.RESERVATION_STAFF_INBOUND_ROUTING_VERIFIED === "true" &&
    process.env.RESERVATION_STUDIO_STAFF_ROUTING_ENABLED === "true" &&
    process.env.RESERVATION_STAFF_HANDOFF_COMPLETION_ENABLED === "true" &&
    process.env.RESERVATION_STUDIO_HANDOFF_FENCE_ENABLED === "true"
  );
}

function oneRow<T>(data: unknown, valid: (value: unknown) => value is T): T | null {
  if (!Array.isArray(data) || data.length !== 1) return null;
  return valid(data[0]) ? data[0] : null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isOwnershipRow(value: unknown): value is OwnershipRow {
  return (
    isRecord(value) &&
    typeof value.ownership_id === "string" && UUID.test(value.ownership_id) &&
    typeof value.ownership_status === "string" &&
    typeof value.linked_reservation_id === "string" && UUID.test(value.linked_reservation_id) &&
    (value.claimed_by === null || (typeof value.claimed_by === "string" && UUID.test(value.claimed_by)))
  );
}

function isOperationRow(value: unknown): value is OperationRow {
  return (
    isRecord(value) &&
    typeof value.operation_id === "string" && UUID.test(value.operation_id) &&
    typeof value.operation_status === "string"
  );
}

function isSubmissionRow(value: unknown): value is SubmissionRow {
  return (
    isRecord(value) &&
    typeof value.operation_id === "string" && UUID.test(value.operation_id) &&
    typeof value.message_body === "string" &&
    typeof value.guest_phone === "string" && E164.test(value.guest_phone) &&
    typeof value.restaurant_phone === "string" && E164.test(value.restaurant_phone)
  );
}

async function readMessage(request: Request): Promise<
  | { ok: true; body: string; clientRequestId: string }
  | { ok: false; status: number; error: string }
> {
  if (!/^application\/json(?:\s*;|$)/i.test(request.headers.get("content-type") ?? "")) {
    return { ok: false, status: 415, error: "JSON request required." };
  }
  const declared = request.headers.get("content-length");
  if (declared !== null &&
    (!/^\d+$/.test(declared) || !Number.isSafeInteger(Number(declared)))) {
    return { ok: false, status: 400, error: "Invalid request length." };
  }
  if (declared !== null && Number(declared) > MAX_REQUEST_BYTES) {
    return { ok: false, status: 413, error: "Request too large." };
  }
  if (!request.body) {
    return { ok: false, status: 400, error: "Message is required." };
  }

  let raw = "";
  let bytes = 0;
  const reader = request.body.getReader();
  const decoder = new TextDecoder("utf-8", { fatal: true });
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > MAX_REQUEST_BYTES) {
        await reader.cancel();
        return { ok: false, status: 413, error: "Request too large." };
      }
      raw += decoder.decode(value, { stream: true });
    }
    raw += decoder.decode();
  } catch {
    return { ok: false, status: 400, error: "Invalid JSON request." };
  } finally {
    reader.releaseLock();
  }

  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    return { ok: false, status: 400, error: "Invalid JSON request." };
  }
  if (!isRecord(value) || Object.keys(value).length !== 2 ||
    typeof value.body !== "string" ||
    typeof value.clientRequestId !== "string" || !UUID.test(value.clientRequestId)) {
    return {
      ok: false,
      status: 400,
      error: "Message body and clientRequestId UUID are required.",
    };
  }
  const body = value.body.trim();
  if (!body || body.length > MAX_MESSAGE_CHARS ||
    /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(body)) {
    return { ok: false, status: 400, error: "Message must contain 1–1600 valid characters." };
  }
  return { ok: true, body, clientRequestId: value.clientRequestId };
}

export async function POST(request: Request, context: RouteContext): Promise<Response> {
  // Deployment stays fail-closed until takeover, inbound routing and ledger
  // migration have been independently verified and explicitly enabled.
  if (!staffMessagingConfigured()) {
    return fail("Staff SMS is not enabled until inbound routing and takeover are verified.", 503);
  }
  if (!validOrigin(request)) return fail("Request origin is not authorized.", 403);
  const { id } = await context.params;
  if (!UUID.test(id)) return fail("Invalid reservation ID.", 400);

  try {
    const supabase = await createSupabaseServerClient();
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();
    const userId = claimsData?.claims?.sub;
    if (claimsError || typeof userId !== "string" || !UUID.test(userId)) {
      return fail("Authentication required.", 401);
    }
    const { data: role, error: roleError } = await supabase
      .from("staff_roles")
      .select("role, is_active")
      .eq("user_id", userId)
      .eq("is_active", true)
      .maybeSingle();
    if (roleError || role?.is_active !== true || role.role !== "manager") {
      return fail("Manager access required.", 403);
    }

    const parsed = await readMessage(request);
    if (!parsed.ok) return fail(parsed.error, parsed.status);

    const from = process.env.TWILIO_FROM_NUMBER;
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const supabaseUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!from || !E164.test(from) || !accountSid || !ACCOUNT_SID.test(accountSid) ||
      !authToken || !supabaseUrl || !serviceKey) {
      return fail("Restaurant SMS or trusted ledger access is not configured.", 503);
    }

    const { data: reservation, error: reservationError } = await supabase
      .from("reservation_requests")
      .select("id, customer_phone")
      .eq("id", id)
      .maybeSingle();
    if (reservationError) return fail("Reservation could not be verified.", 503);
    if (!reservation) return fail("Reservation not found.", 404);
    const guestPhone = reservation.customer_phone;
    if (typeof guestPhone !== "string" || !E164.test(guestPhone) || guestPhone === from) {
      return fail("Reservation guest phone is invalid.", 409);
    }

    const { data: ownershipData, error: ownershipError } = await supabase.rpc(
      "get_reservation_conversation_handoff",
      { p_reservation_id: id, p_restaurant_phone: from },
    );
    if (ownershipError) {
      return fail("Conversation ownership could not be verified.",
        ownershipError.code === "42501" ? 403 : 503);
    }
    const owner = oneRow(ownershipData, isOwnershipRow);
    if (!owner || owner.ownership_status !== "staff" ||
      owner.claimed_by !== userId || owner.linked_reservation_id !== id) {
      return fail("Verified staff ownership is required before sending SMS.", 409);
    }

    // Authenticated manager RPC: row-locks current ownership and registers
    // exactly one request per clientRequestId within the current claim session.
    const { data: registeredData, error: registeredError } = await supabase.rpc(
      "authorize_reservation_staff_sms",
      {
        p_reservation_id: id,
        p_restaurant_phone: from,
        p_client_request_id: parsed.clientRequestId,
        p_message_body: parsed.body,
      },
    );
    if (registeredError) {
      console.error("Staff SMS registration failed", {
        reservationId: id, code: registeredError.code,
      });
      return fail("Message authorization failed; no new submission was started.",
        registeredError.code === "42501" ? 403 : 409);
    }
    const registered = oneRow(registeredData, isOperationRow);
    if (!registered) return fail("SMS operation registration could not be verified.", 503);

    // A duplicate request must never call Twilio again, even if the original
    // succeeded or the network outcome is still unknown.
    if (registered.operation_status !== "registered") {
      return respond({
        success: false,
        duplicate: true,
        operationId: registered.operation_id,
        operationStatus: registered.operation_status,
        error: "This SMS request was already processed or is in progress. Do not resend it.",
      }, 409);
    }

    const admin = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    // This RPC is the only transition that grants a submission attempt.
    // If two requests race, at most one can leave 'registered' successfully.
    const { data: submissionData, error: submissionError } = await admin.rpc(
      "begin_reservation_staff_sms_submission",
      { p_operation_id: registered.operation_id },
    );
    if (submissionError) {
      console.error("Staff SMS submission authorization failed", {
        reservationId: id, operationId: registered.operation_id, code: submissionError.code,
      });
      return fail("SMS submission was not authorized. Refresh before sending again.", 409);
    }
    const submission = oneRow(submissionData, isSubmissionRow);
    if (!submission || submission.operation_id !== registered.operation_id ||
      submission.message_body !== parsed.body || submission.guest_phone !== guestPhone ||
      submission.restaurant_phone !== from) {
      // Submission may already be marked 'submitting'. Never retry automatically.
      return fail("SMS submission details could not be verified; outcome requires review.", 503);
    }

    let messageSid: string | null = null;
    let messageStatus: string | null = null;
    try {
      const client = twilio(accountSid, authToken);
      // Twilio Messages.create has no application idempotency key.
      const message = await client.messages.create({
        from: submission.restaurant_phone,
        to: submission.guest_phone,
        body: submission.message_body,
      });
      messageSid = message.sid;
      messageStatus = message.status;
    } catch (error) {
      // Treat all API exceptions as uncertain unless there is affirmative
      // evidence that Twilio did not accept the message. Never auto-retry.
      console.error("Staff SMS Twilio outcome uncertain", {
        reservationId: id,
        operationId: registered.operation_id,
        name: error instanceof Error ? error.name : "UnknownError",
      });
      const { error: finalizeError } = await admin.rpc(
        "finalize_reservation_staff_sms",
        {
          p_operation_id: registered.operation_id,
          p_outcome: "uncertain",
          p_twilio_message_sid: null,
          p_note: "Twilio API result unavailable; reconciliation required.",
        },
      );
      if (finalizeError) {
        console.error("Unable to mark uncertain staff SMS operation", {
          operationId: registered.operation_id,
          code: finalizeError.code,
        });
      }
      return respond({
        success: false,
        operationId: registered.operation_id,
        operationStatus: "uncertain",
        error: "Message outcome could not be confirmed. Do not resend; contact an administrator.",
      }, 502);
    }

    if (!messageSid || !MESSAGE_SID.test(messageSid)) {
      // The remote API apparently returned, but acceptance evidence is invalid.
      // Keep the operation unresolved instead of claiming success.
      await admin.rpc("finalize_reservation_staff_sms", {
        p_operation_id: registered.operation_id,
        p_outcome: "uncertain",
        p_twilio_message_sid: null,
        p_note: "Twilio response lacked a valid Message SID.",
      });
      return fail("SMS acceptance could not be verified. Do not resend.", 502);
    }

    const { data: finalizedData, error: finalizedError } = await admin.rpc(
      "finalize_reservation_staff_sms",
      {
        p_operation_id: registered.operation_id,
        p_outcome: "accepted",
        p_twilio_message_sid: messageSid,
        p_note: "Twilio Messages.create returned a Message SID.",
      },
    );
    const finalized = oneRow(finalizedData, isOperationRow);
    if (finalizedError || !finalized || finalized.operation_status !== "accepted" ||
      finalized.operation_id !== registered.operation_id) {
      // Twilio acceptance happened, but DB confirmation failed. Never resend.
      console.error("Twilio SMS accepted but ledger finalization failed", {
        reservationId: id,
        operationId: registered.operation_id,
        code: finalizedError?.code,
      });
      return respond({
        success: false,
        operationId: registered.operation_id,
        messageSid,
        error: "Twilio accepted the SMS, but ledger confirmation needs administrative review. Do not resend.",
      }, 502);
    }

    return respond({
      success: true,
      reservationId: id,
      operationId: registered.operation_id,
      messageSid,
      status: messageStatus,
      operationStatus: "accepted",
    });
  } catch (error) {
    console.error("Staff SMS endpoint failed", {
      reservationId: id,
      name: error instanceof Error ? error.name : "UnknownError",
    });
    return fail("Unable to process the SMS request. Do not retry an uncertain send.", 500);
  }
}
