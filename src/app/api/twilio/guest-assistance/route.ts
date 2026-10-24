import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import twilio from "twilio";

const E164_PATTERN = /^\+[1-9]\d{7,14}$/;
const MESSAGE_SID_PATTERN = /^SM[0-9a-f]{32}$/i;
const ACCOUNT_SID_PATTERN = /^AC[0-9a-f]{32}$/i;
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const MAX_BODY_BYTES = 2048;
const CLOCK_SKEW_SECONDS = 300;

type AlertRequest = {
  from: string;
  to: string;
  messageSid: string;
};

type ExistingAlert = {
  id: string;
  reservation_request_id: string;
  alert_status: string;
};

function json(
  data: Record<string, unknown>,
  status = 200,
): NextResponse {
  return NextResponse.json(data, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

function fail(error: string, status: number): NextResponse {
  return json({ success: false, alertRecorded: false, error }, status);
}

function verifySignature(
  signature: string | null,
  timestamp: string | null,
  body: string,
  secret: string,
): boolean {
  if (
    !signature ||
    !timestamp ||
    !/^\d{10}$/.test(timestamp) ||
    !/^[0-9a-f]{64}$/i.test(signature)
  ) {
    return false;
  }

  const seconds = Number(timestamp);
  if (
    !Number.isSafeInteger(seconds) ||
    Math.abs(Math.floor(Date.now() / 1000) - seconds) > CLOCK_SKEW_SECONDS
  ) {
    return false;
  }

  const expected = createHmac("sha256", secret)
    .update(`${timestamp}.${body}`, "utf8")
    .digest();
  const received = Buffer.from(signature, "hex");

  return (
    received.length === expected.length &&
    timingSafeEqual(received, expected)
  );
}

function parsePayload(value: unknown): AlertRequest | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }
  const fields = value as Record<string, unknown>;

  if (
    Object.keys(fields).length !== 3 ||
    typeof fields.from !== "string" ||
    typeof fields.to !== "string" ||
    typeof fields.messageSid !== "string" ||
    !E164_PATTERN.test(fields.from) ||
    !E164_PATTERN.test(fields.to) ||
    !MESSAGE_SID_PATTERN.test(fields.messageSid)
  ) {
    return null;
  }

  return {
    from: fields.from,
    to: fields.to,
    messageSid: fields.messageSid,
  };
}

function validExistingAlert(value: unknown): value is ExistingAlert {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }
  const record = value as Record<string, unknown>;
  return (
    typeof record.id === "string" &&
    UUID_PATTERN.test(record.id) &&
    typeof record.reservation_request_id === "string" &&
    UUID_PATTERN.test(record.reservation_request_id) &&
    typeof record.alert_status === "string" &&
    ["open", "acknowledged", "resolved"].includes(record.alert_status)
  );
}

export async function POST(request: Request): Promise<NextResponse> {
  const secret = process.env.RESERVATION_STUDIO_ROUTER_SECRET;
  const supabaseUrl =
    process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
  const restaurantPhone = process.env.TWILIO_FROM_NUMBER;
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;

  if (
    !secret ||
    Buffer.byteLength(secret, "utf8") < 32 ||
    !supabaseUrl ||
    !supabaseKey ||
    !restaurantPhone ||
    !E164_PATTERN.test(restaurantPhone) ||
    !accountSid ||
    !ACCOUNT_SID_PATTERN.test(accountSid) ||
    !authToken
  ) {
    console.error("Guest assistance endpoint configuration missing.");
    return fail("Guest assistance service unavailable.", 503);
  }

  if (
    !/^application\/json(?:\s*;|$)/i.test(
      request.headers.get("content-type") ?? "",
    )
  ) {
    return fail("Unsupported content type.", 415);
  }

  const declaredLength = request.headers.get("content-length");
  if (
    declaredLength !== null &&
    (!/^\d+$/.test(declaredLength) || Number(declaredLength) > MAX_BODY_BYTES)
  ) {
    return fail("Request too large.", 413);
  }

  let rawBody: string;
  try {
    rawBody = await request.text();
  } catch {
    return fail("Invalid request body.", 400);
  }
  if (Buffer.byteLength(rawBody, "utf8") > MAX_BODY_BYTES) {
    return fail("Request too large.", 413);
  }

  if (
    !verifySignature(
      request.headers.get("x-ff-signature"),
      request.headers.get("x-ff-timestamp"),
      rawBody,
      secret,
    )
  ) {
    return fail("Unauthorized.", 401);
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawBody);
  } catch {
    return fail("Invalid JSON.", 400);
  }
  const payload = parsePayload(parsed);
  if (!payload || payload.to !== restaurantPhone || payload.from === restaurantPhone) {
    return fail("Invalid message details.", 400);
  }

  try {
    const twilioClient = twilio(accountSid, authToken);
    const message = await twilioClient.messages(payload.messageSid).fetch();

    // The message must exist in Twilio as an inbound SMS for this exact pair.
    if (
      message.from !== payload.from ||
      message.to !== restaurantPhone ||
      message.direction !== "inbound"
    ) {
      return fail("Twilio message identity mismatch.", 409);
    }
    if (!message.dateCreated || Number.isNaN(message.dateCreated.getTime())) {
      return fail("Message timestamp unavailable.", 409);
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    // Idempotency: retries never reset acknowledged or resolved alerts.
    const { data: existingData, error: existingError } = await supabase
      .from("reservation_guest_assistance_alerts")
      .select("id, reservation_request_id, alert_status")
      .eq("twilio_message_sid", payload.messageSid)
      .maybeSingle();

    if (existingError) {
      console.error("Guest assistance duplicate lookup failed:", {
        code: existingError.code,
      });
      return fail("Unable to verify existing alert.", 503);
    }
    if (existingData !== null) {
      if (!validExistingAlert(existingData)) {
        return fail("Existing alert is invalid.", 503);
      }
      return json({
        success: true,
        alertRecorded: true,
        duplicate: true,
        alertId: existingData.id,
        reservationId: existingData.reservation_request_id,
        status: existingData.alert_status,
      });
    }

    // The conversation ownership record is the authoritative link used to
    // navigate to a guest's conversation. It does NOT establish which booking
    // the guest's question is about.
    const { data: ownership, error: ownershipError } = await supabase
      .from("reservation_conversation_ownership")
      .select("reservation_request_id, guest_phone, restaurant_phone")
      .eq("guest_phone", payload.from)
      .eq("restaurant_phone", restaurantPhone)
      .maybeSingle();

    if (ownershipError) {
      console.error("Guest assistance ownership lookup failed:", {
        code: ownershipError.code,
      });
      return fail("Unable to verify conversation association.", 503);
    }

    if (
      !ownership ||
      ownership.guest_phone !== payload.from ||
      ownership.restaurant_phone !== restaurantPhone ||
      typeof ownership.reservation_request_id !== "string" ||
      !UUID_PATTERN.test(ownership.reservation_request_id)
    ) {
      return fail("No verified conversation association.", 409);
    }

    // Never allow a stale or incorrect ownership link to associate the alert
    // with a reservation belonging to another phone number.
    const { data: linkedReservation, error: reservationError } = await supabase
      .from("reservation_requests")
      .select("id, customer_phone, created_at")
      .eq("id", ownership.reservation_request_id)
      .maybeSingle();

    if (reservationError) {
      console.error("Guest assistance linked reservation lookup failed:", {
        code: reservationError.code,
      });
      return fail("Unable to verify linked reservation.", 503);
    }

    if (
      !linkedReservation ||
      linkedReservation.id !== ownership.reservation_request_id ||
      linkedReservation.customer_phone !== payload.from ||
      typeof linkedReservation.created_at !== "string" ||
      !Number.isFinite(Date.parse(linkedReservation.created_at)) ||
      Date.parse(linkedReservation.created_at) > message.dateCreated.getTime()
    ) {
      return fail("Conversation reservation association mismatch.", 409);
    }

    // Unique Twilio message SID constraint prevents concurrent duplicates.
    const { data: alert, error: insertError } = await supabase
      .from("reservation_guest_assistance_alerts")
      .insert({
        reservation_request_id: linkedReservation.id,
        twilio_message_sid: payload.messageSid,
        alert_status: "open",
      })
      .select("id, reservation_request_id, alert_status")
      .single();

    if (insertError) {
      if (insertError.code === "23505") {
        const { data: concurrent, error: concurrentError } = await supabase
          .from("reservation_guest_assistance_alerts")
          .select("id, reservation_request_id, alert_status")
          .eq("twilio_message_sid", payload.messageSid)
          .maybeSingle();

        if (concurrentError || !validExistingAlert(concurrent)) {
          return fail("Unable to verify existing alert.", 503);
        }
        return json({
          success: true,
          alertRecorded: true,
          duplicate: true,
          alertId: concurrent.id,
          reservationId: concurrent.reservation_request_id,
          status: concurrent.alert_status,
        });
      }

      console.error("Guest assistance alert insert failed:", {
        code: insertError.code,
      });
      return fail("Unable to record guest assistance alert.", 503);
    }

    if (!validExistingAlert(alert)) {
      return fail("Recorded alert could not be verified.", 503);
    }

    return json({
      success: true,
      alertRecorded: true,
      duplicate: false,
      alertId: alert.id,
      reservationId: alert.reservation_request_id,
      status: alert.alert_status,
    }, 201);
  } catch (error) {
    const status =
      typeof error === "object" && error !== null && "status" in error
        ? (error as { status?: unknown }).status
        : undefined;
    if (status === 404) return fail("Twilio message not found.", 404);

    console.error("Guest assistance intake failed:", {
      category: "GUEST_ASSISTANCE_INTAKE_ERROR",
      name: error instanceof Error ? error.name : "UnknownError",
    });
    return fail("Unable to process guest assistance request.", 502);
  }
}
