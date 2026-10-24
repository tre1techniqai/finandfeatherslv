import { NextResponse } from "next/server";
import twilio from "twilio";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const E164 = /^\+[1-9]\d{7,14}$/;
const ACCOUNT_SID = /^AC[0-9a-f]{32}$/i;
const FLOW_SID = /^FW[0-9a-f]{32}$/i;
const MAX_BODY_BYTES = 256;

type RouteContext = { params: Promise<{ id: string }> };

function reply(data: Record<string, unknown>, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

function error(message: string, status: number) {
  return reply({ success: false, error: message }, status);
}

function sameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return false;

  try {
    const source = new URL(origin);
    const destination = new URL(request.url);

    return source.origin === destination.origin &&
      (source.protocol === "https:" ||
        source.hostname === "localhost" ||
        source.hostname === "127.0.0.1");
  } catch {
    return false;
  }
}

async function validEmptyBody(request: Request): Promise<boolean> {
  const contentType = request.headers.get("content-type") ?? "";

  if (!/^application\/json(?:\s*;|$)/i.test(contentType)) {
    return false;
  }

  const raw = await request.text();

  if (Buffer.byteLength(raw, "utf8") > MAX_BODY_BYTES) {
    return false;
  }

  try {
    const value: unknown = JSON.parse(raw);

    return value !== null &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      Object.keys(value).length === 0;
  } catch {
    return false;
  }
}

/**
 * READ-ONLY TAKEOVER PREFLIGHT.
 *
 * This route deliberately does NOT end Studio executions,
 * invoke the service_role completion RPC, or authorize
 * sending SMS.
 *
 * It can safely be deployed before the ownership branch
 * is published to Studio.
 *
 * Production takeover additionally requires:
 * - Verified published Studio routing
 * - A concurrency protocol
 * - Recovery for failures between Twilio and Supabase
 */
export async function POST(
  request: Request,
  context: RouteContext,
) {
  if (!sameOrigin(request)) {
    return error("Request origin is not authorized.", 403);
  }

  const { id } = await context.params;

  if (!UUID.test(id)) {
    return error("Invalid reservation ID.", 400);
  }

  try {
    const supabase = await createSupabaseServerClient();

    const { data: claims, error: claimsError } =
      await supabase.auth.getClaims();

    const managerId = claims?.claims?.sub;

    if (claimsError || !managerId) {
      return error("Authentication required.", 401);
    }

    const { data: role, error: roleError } = await supabase
      .from("staff_roles")
      .select("role, is_active")
      .eq("user_id", managerId)
      .eq("is_active", true)
      .maybeSingle();

    if (
      roleError ||
      role?.role !== "manager" ||
      role.is_active !== true
    ) {
      return error("Manager access required.", 403);
    }

    if (!(await validEmptyBody(request))) {
      return error("Expected an empty JSON object.", 400);
    }

    const restaurantPhone = process.env.TWILIO_FROM_NUMBER;
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const flowSid = process.env.TWILIO_STUDIO_FLOW_SID;

    if (
      !restaurantPhone ||
      !E164.test(restaurantPhone) ||
      !accountSid ||
      !ACCOUNT_SID.test(accountSid) ||
      !authToken ||
      !flowSid ||
      !FLOW_SID.test(flowSid)
    ) {
      return error("Takeover preflight is not configured.", 503);
    }

    const { data: reservation, error: reservationError } =
      await supabase
        .from("reservation_requests")
        .select("id, customer_phone")
        .eq("id", id)
        .maybeSingle();

    if (reservationError) {
      return error("Unable to verify reservation.", 500);
    }

    if (!reservation) {
      return error("Reservation not found.", 404);
    }

    const guestPhone = reservation.customer_phone;

    if (
      typeof guestPhone !== "string" ||
      !E164.test(guestPhone) ||
      guestPhone === restaurantPhone
    ) {
      return error("Reservation guest phone is invalid.", 409);
    }

    const { data: rows, error: ownershipError } =
      await supabase.rpc(
        "get_reservation_conversation_handoff",
        {
          p_reservation_id: id,
          p_restaurant_phone: restaurantPhone,
        },
      );

    if (
      ownershipError ||
      !Array.isArray(rows) ||
      rows.length !== 1
    ) {
      return error(
        "Unable to verify pending conversation ownership.",
        409,
      );
    }

    const claim = rows[0];

    if (
      claim?.ownership_status !== "handoff_pending" ||
      claim?.claimed_by !== managerId ||
      claim?.linked_reservation_id !== id ||
      typeof claim?.ownership_id !== "string" ||
      !UUID.test(claim.ownership_id)
    ) {
      return error(
        "A pending handoff for this manager and reservation is required.",
        409,
      );
    }

    const client = twilio(accountSid, authToken);

    // A bounded scan is used so that an incomplete result
    // cannot be mistaken for full execution verification.
    const executions = await client.studio.v2
      .flows(flowSid)
      .executions.list({
        status: "active",
        limit: 1000,
      });

    if (executions.length === 1000) {
      return error(
        "Active Studio execution scan was incomplete.",
        503,
      );
    }

    const activeForGuest = executions.filter(
      (execution) =>
        execution.contactChannelAddress === guestPhone,
    );

    const invalid = activeForGuest.some(
      (execution) =>
        execution.flowSid !== flowSid ||
        execution.status !== "active",
    );

    if (invalid) {
      return error(
        "Studio execution identity was inconsistent.",
        502,
      );
    }

    return reply({
      success: true,
      reservationId: id,
      preflight: "verified_pending_claim",
      activeStudioExecutions: activeForGuest.map(
        (execution) => ({
          sid: execution.sid,
          status: execution.status,
        }),
      ),
      activeExecutionCount: activeForGuest.length,
      publishedStaffRoutingVerified: false,
      ownershipChanged: false,
      studioExecutionsChanged: false,
      staffMessagingEnabled: false,
      takeoverReady: false,
    });
  } catch (caught) {
    console.error(
      "Conversation takeover preflight failed:",
      {
        reservationId: id,
        name:
          caught instanceof Error
            ? caught.name
            : "UnknownError",
      },
    );

    return error(
      "Unable to verify takeover prerequisites.",
      502,
    );
  }
}