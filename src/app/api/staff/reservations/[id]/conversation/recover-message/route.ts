import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isReservationStaffRole } from "@/lib/auth/require-reservation-staff";
import { validSharedActivationOrigin } from "@/lib/reservations/shared-activation-origin";
import { processReservationDepositEmailReply } from "@/lib/reservations/process-reservation-deposit-email-reply";
import { verifyInboundTwilioMessage } from "@/lib/reservations/verified-inbound-twilio-message";

const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const MESSAGE_SID = /^SM[0-9a-f]{32}$/i;
const E164 = /^\+[1-9]\d{7,14}$/;
const MAX_REQUEST_BYTES = 1024;
const STANDALONE_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type RouteContext = {
  params: Promise<{ id: string }>;
};

function respond(
  payload: Record<string, unknown>,
  status: number,
): NextResponse {
  return NextResponse.json(payload, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

function fail(code: string, status: number): NextResponse {
  return respond({ success: false, code }, status);
}

function createTrustedClient() {
  const url =
    process.env.SUPABASE_URL ??
    process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SECRET_KEY ??
    process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) return null;

  try {
    const parsed = new URL(url);
    if (
      parsed.protocol !== "https:" ||
      parsed.username ||
      parsed.password ||
      parsed.search ||
      parsed.hash
    ) {
      return null;
    }

    return createClient(url, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  } catch {
    return null;
  }
}

export async function POST(
  request: Request,
  context: RouteContext,
): Promise<NextResponse> {
  try {
    const { id } = await context.params;

    if (!UUID.test(id)) {
      return fail("INVALID_RESERVATION_ID", 400);
    }

    if (!validSharedActivationOrigin(request)) {
      return fail("ORIGIN_NOT_AUTHORIZED", 403);
    }

    const supabase = await createSupabaseServerClient();
    const { data: claimsData, error: claimsError } =
      await supabase.auth.getClaims();
    const staffUserId = claimsData?.claims?.sub;

    if (
      claimsError ||
      typeof staffUserId !== "string" ||
      !UUID.test(staffUserId)
    ) {
      return fail("AUTHENTICATION_REQUIRED", 401);
    }

    const { data: role, error: roleError } = await supabase
      .from("staff_roles")
      .select("role, is_active")
      .eq("user_id", staffUserId)
      .eq("is_active", true)
      .maybeSingle();

    if (
      roleError ||
      !role ||
      role.is_active !== true ||
      !isReservationStaffRole(role.role)
    ) {
      return fail("RESERVATION_STAFF_REQUIRED", 403);
    }

    const contentType = request.headers.get("content-type") ?? "";
    if (!/^application\/json(?:\s*;|$)/i.test(contentType)) {
      return fail("UNSUPPORTED_CONTENT_TYPE", 415);
    }

    const declaredLength = request.headers.get("content-length");
    if (
      declaredLength !== null &&
      (!/^\d+$/.test(declaredLength) ||
        Number(declaredLength) > MAX_REQUEST_BYTES)
    ) {
      return fail("REQUEST_TOO_LARGE", 413);
    }

    let rawBody: string;
    try {
      rawBody = await request.text();
    } catch {
      return fail("INVALID_REQUEST", 400);
    }

    if (Buffer.byteLength(rawBody, "utf8") > MAX_REQUEST_BYTES) {
      return fail("REQUEST_TOO_LARGE", 413);
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(rawBody);
    } catch {
      return fail("INVALID_JSON", 400);
    }

    if (
      parsed === null ||
      typeof parsed !== "object" ||
      Array.isArray(parsed) ||
      Object.keys(parsed).length !== 1 ||
      !("messageSid" in parsed) ||
      typeof parsed.messageSid !== "string" ||
      !MESSAGE_SID.test(parsed.messageSid)
    ) {
      return fail("INVALID_MESSAGE_SID", 400);
    }

    const messageSid = parsed.messageSid;

    // Authoritative reservation identity comes from the database,
    // never from staff-supplied phone numbers or a message body.
    const admin = createTrustedClient();
    if (!admin) {
      return fail("DATABASE_NOT_CONFIGURED", 503);
    }

    const { data: reservation, error: reservationError } =
      await admin
        .from("reservation_requests")
        .select("id, customer_phone, request_status")
        .eq("id", id)
        .maybeSingle();

    if (reservationError) {
      return fail("RESERVATION_LOOKUP_FAILED", 503);
    }
    if (!reservation) {
      return fail("RESERVATION_NOT_FOUND", 404);
    }

    const { data: conversation, error: conversationError } =
      await admin
        .from("reservation_shared_conversations")
        .select("id, reservation_request_id, guest_phone, restaurant_phone")
        .eq("reservation_request_id", id)
        .maybeSingle();

    if (conversationError) {
      return fail("CONVERSATION_LOOKUP_FAILED", 503);
    }

    if (
      !conversation ||
      !UUID.test(conversation.id) ||
      conversation.reservation_request_id.toLowerCase() !== id.toLowerCase() ||
      !E164.test(reservation.customer_phone) ||
      conversation.guest_phone !== reservation.customer_phone ||
      !E164.test(conversation.restaurant_phone) ||
      conversation.restaurant_phone !== process.env.TWILIO_FROM_NUMBER
    ) {
      return fail("CONVERSATION_IDENTITY_UNVERIFIED", 409);
    }

    // Historical recovery is a separate, narrowly scoped path. It NEVER
    // passes a confirmed reservation through the live-processing RPCs.
    // The SQL procedure independently checks deposit notification ownership,
    // message chronology, exact reservation and conversation, and conflicts.
    if (reservation.request_status === "confirmed") {
      if (
        process.env.RESERVATION_HISTORICAL_DEPOSIT_EMAIL_RECOVERY_ENABLED !==
        "true"
      ) {
        return fail("HISTORICAL_RECOVERY_DISABLED", 503);
      }

      const verification = await verifyInboundTwilioMessage({
        messageSid,
        guestPhone: conversation.guest_phone,
        restaurantPhone: conversation.restaurant_phone,
      });

      if (!verification.verified) {
        console.warn("Historical recovery: Twilio verification failed.", {
          reservationId: id,
          reason: verification.reason,
        });
        return respond(
          { success: false, status: "review_required", reason: verification.reason },
          409,
        );
      }

      const verified = verification.message;
      const email = verified.messageBody?.trim() ?? "";
      if (!STANDALONE_EMAIL.test(email)) {
        return respond(
          { success: false, status: "review_required", reason: "EMAIL_ONLY_REPLY_REQUIRED" },
          409,
        );
      }

      // Never accept a caller-supplied email, timestamp, or phone number.
      // Only the original Twilio message supplies these values.
      const { data: recoveredData, error: recoveredError } = await admin.rpc(
        "recover_confirmed_reservation_deposit_email",
        {
          p_reservation_id: id,
          p_guest_phone: verified.guestPhone,
          p_restaurant_phone: verified.restaurantPhone,
          p_twilio_message_sid: verified.messageSid,
          p_message_created_at: verified.messageCreatedAt,
          p_email: email,
        },
      );

      if (recoveredError) {
        if (recoveredError.code === "PGRST202") {
          return fail("HISTORICAL_RECOVERY_RPC_NOT_DEPLOYED", 503);
        }

        // The DB intentionally rejects conflicts/ambiguous identity.
        // Do not retry using phone-only attribution or direct table writes.
        console.warn("Historical recovery RPC rejected.", {
          reservationId: id,
          code: recoveredError.code,
        });
        return respond(
          {
            success: false,
            status: "review_required",
            reason: "HISTORICAL_RECOVERY_REJECTED",
          },
          409,
        );
      }

      const row = Array.isArray(recoveredData)
        ? recoveredData.length === 1 ? recoveredData[0] : null
        : recoveredData;

      if (
        !row ||
        typeof row !== "object" ||
        !["saved", "duplicate"].includes(row.outcome) ||
        typeof row.reservation_id !== "string" ||
        row.reservation_id.toLowerCase() !== id.toLowerCase() ||
        typeof row.inbound_message_sid !== "string" ||
        row.inbound_message_sid.toLowerCase() !== messageSid.toLowerCase()
      ) {
        return fail("INVALID_HISTORICAL_RECOVERY_RESULT", 503);
      }

      return respond(
        {
          success: true,
          status: row.outcome === "saved" ? "recovered" : "already_recovered",
          recoveryPath: "historical_confirmed",
          reservationId: id,
          messageSid,
        },
        200,
      );
    }

    // Live-eligible requests retain the existing independently verified
    // processor and its strict current workflow rules.
    // No SMS is sent by either path.
    const result = await processReservationDepositEmailReply(
      admin,
      {
        messageSid,
        guestPhone: conversation.guest_phone,
        restaurantPhone: conversation.restaurant_phone,
      },
      {
        enabled: true,
        expectedReservationId: id,
      },
    );

    if (result.status === "saved" || result.status === "duplicate") {
      return respond(
        {
          success: true,
          status: result.status === "saved" ? "recovered" : "already_recovered",
          reservationId: result.reservationId,
          messageSid: result.messageSid,
        },
        200,
      );
    }

    if (result.status === "review") {
      return respond(
        { success: false, status: "review_required", reason: result.reason },
        409,
      );
    }

    if (result.status === "blocked") {
      return respond(
        { success: false, status: "blocked", reason: result.reason },
        409,
      );
    }

    if (result.status === "error") {
      console.error("Staff deposit-email message recovery failed.", {
        reservationId: id,
        reason: result.reason,
      });
      return fail("PROCESSING_UNAVAILABLE", 503);
    }

    return fail("UNEXPECTED_RECOVERY_RESULT", 503);
  } catch (error) {
    console.error("Unexpected staff deposit-email recovery failure.", {
      message: error instanceof Error ? error.message : "unknown",
    });
    return fail("RECOVERY_UNAVAILABLE", 503);
  }
}