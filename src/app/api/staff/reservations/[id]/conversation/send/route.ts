import { NextResponse } from "next/server";
import twilio from "twilio";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const E164 = /^\+[1-9]\d{7,14}$/;
const MAX_REQUEST_BYTES = 4096;
const MAX_MESSAGE_CHARS = 1600;

type RouteContext = { params: Promise<{ id: string }> };

function respond(payload: Record<string, unknown>, status = 200): Response {
  return NextResponse.json(payload, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

function fail(error: string, status: number): Response {
  return respond({ success: false, error }, status);
}

function validOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    const source = new URL(origin);
    const target = new URL(request.url);
    return source.origin === target.origin &&
      (source.protocol === "https:" ||
        source.hostname === "localhost" ||
        source.hostname === "127.0.0.1");
  } catch {
    return false;
  }
}

async function readMessage(request: Request): Promise<
  | { ok: true; body: string }
  | { ok: false; status: number; error: string }
> {
  if (!/^application\/json(?:\s*;|$)/i.test(request.headers.get("content-type") ?? "")) {
    return { ok: false, status: 415, error: "JSON request required." };
  }
  const declared = request.headers.get("content-length");
  if (declared !== null) {
    if (!/^\d+$/.test(declared) || !Number.isSafeInteger(Number(declared))) {
      return { ok: false, status: 400, error: "Invalid request length." };
    }
    if (Number(declared) > MAX_REQUEST_BYTES) {
      return { ok: false, status: 413, error: "Request too large." };
    }
  }
  if (!request.body) {
    return { ok: false, status: 400, error: "Message is required." };
  }
  let raw = "";
  const reader = request.body.getReader();
  const decoder = new TextDecoder("utf-8", { fatal: true });
  let bytes = 0;
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
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { ok: false, status: 400, error: "Invalid JSON request." };
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    return { ok: false, status: 400, error: "Invalid message request." };
  }
  const fields = parsed as Record<string, unknown>;
  if (Object.keys(fields).length !== 1 || typeof fields.body !== "string") {
    return { ok: false, status: 400, error: "Invalid message request." };
  }
  const body = fields.body.trim();
  if (!body || body.length > MAX_MESSAGE_CHARS || /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(body)) {
    return { ok: false, status: 400, error: "Message must contain 1–1600 valid characters." };
  }
  return { ok: true, body };
}

export async function POST(request: Request, context: RouteContext): Promise<Response> {
  // Both switches are required. Do not enable until Studio has an independently
  // verified route that captures staff-owned guest replies and active executions
  // have been safely handed off. The current Studio flow is NOT yet configured.
  if (process.env.RESERVATION_STAFF_SMS_ENABLED !== "true" ||
      process.env.RESERVATION_STAFF_INBOUND_ROUTING_VERIFIED !== "true") {
    return fail("Staff SMS is not enabled until inbound routing and takeover are verified.", 503);
  }
  if (!validOrigin(request)) return fail("Request origin is not authorized.", 403);
  const { id } = await context.params;
  if (!UUID.test(id)) return fail("Invalid reservation ID.", 400);

  try {
    const supabase = await createSupabaseServerClient();
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();
    const userId = claimsData?.claims?.sub;
    if (claimsError || !userId) return fail("Authentication required.", 401);

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
    if (!from || !E164.test(from) || !accountSid || !/^AC[0-9a-f]{32}$/i.test(accountSid) || !authToken) {
      return fail("Restaurant SMS is not configured.", 503);
    }

    // Resolve the guest using the reservation, never a browser-supplied number.
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

    // The authenticated manager's RLS-scoped view must confirm actual staff
    // ownership. A pending request NEVER permits texting.
    const { data: owner, error: ownerError } = await supabase
      .from("reservation_conversation_ownership")
      .select("reservation_request_id, guest_phone, restaurant_phone, ownership_status, claimed_by")
      .eq("guest_phone", guestPhone)
      .eq("restaurant_phone", from)
      .maybeSingle();
    if (ownerError) return fail("Conversation ownership could not be verified.", 503);
    if (!owner || owner.ownership_status !== "staff" || owner.claimed_by !== userId ||
        owner.guest_phone !== guestPhone || owner.restaurant_phone !== from ||
        owner.reservation_request_id !== id) {
      return fail("Verified staff ownership is required before sending SMS.", 409);
    }

    // Once Twilio accepts a request, never automatically retry it; Twilio's
    // Messages.create endpoint does not provide an application idempotency key.
    // Review the message history if a network error makes the outcome uncertain.
    let message;
    try {
      const client = twilio(accountSid, authToken);
      message = await client.messages.create({
        from,
        to: guestPhone,
        body: parsed.body,
      });
    } catch (error) {
      console.error("Staff SMS result uncertain or rejected:", {
        reservationId: id,
        name: error instanceof Error ? error.name : "UnknownError",
      });
      return fail("Message was not confirmed. Refresh conversation history before attempting another send.", 502);
    }

    return respond({
      success: true,
      reservationId: id,
      messageSid: message.sid,
      status: message.status,
    });
  } catch (error) {
    console.error("Staff SMS endpoint failed:", {
      reservationId: id,
      name: error instanceof Error ? error.name : "UnknownError",
    });
    return fail("Unable to process the message request.", 500);
  }
}
