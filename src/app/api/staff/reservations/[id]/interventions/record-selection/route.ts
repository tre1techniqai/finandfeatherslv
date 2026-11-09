import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import twilio from "twilio";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isReservationStaffRole } from "@/lib/auth/require-reservation-staff";
import { validSharedActivationOrigin } from "@/lib/reservations/shared-activation-origin";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MESSAGE_SID = /^SM[0-9a-f]{32}$/i;
const E164 = /^\+[1-9]\d{7,14}$/;

type RouteContext = { params: Promise<{ id: string }> };
type SelectionRequest = {
  conversationId: string;
  expectedModeVersion: number;
  interventionId: string;
  inboundMessageSid: string;
};

function respond(data: Record<string, unknown>, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}
function fail(error: string, status: number) {
  return respond({ success: false, smsSent: false, reservationChanged: false, error }, status);
}
function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}
function parseRequest(value: unknown): SelectionRequest | null {
  if (!isObject(value)) return null;
  const expected = ["conversationId", "expectedModeVersion", "interventionId", "inboundMessageSid"];
  if (Object.keys(value).length !== expected.length ||
      !expected.every((field) => Object.prototype.hasOwnProperty.call(value, field)) ||
      typeof value.conversationId !== "string" || !UUID.test(value.conversationId) ||
      typeof value.interventionId !== "string" || !UUID.test(value.interventionId) ||
      typeof value.expectedModeVersion !== "number" ||
      !Number.isSafeInteger(value.expectedModeVersion) || value.expectedModeVersion < 1 ||
      typeof value.inboundMessageSid !== "string" || !MESSAGE_SID.test(value.inboundMessageSid)) {
    return null;
  }
  return {
    conversationId: value.conversationId,
    expectedModeVersion: value.expectedModeVersion,
    interventionId: value.interventionId,
    inboundMessageSid: value.inboundMessageSid,
  };
}

/**
 * Staff-initiated verification of a single, reservation-scoped guest reply.
 * This never sends SMS, interprets phone-only history, or changes bookings.
 * Twilio verifies the message body; the DB verifies reservation ownership.
 */
export async function POST(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    if (!UUID.test(id)) return fail("Invalid reservation ID.", 400);
    if (!validSharedActivationOrigin(request)) return fail("Unauthorized request origin.", 403);
    if (!/^application\/json(?:\s*;|$)/i.test(request.headers.get("content-type") ?? "")) {
      return fail("JSON request required.", 415);
    }
    const declared = request.headers.get("content-length");
    if (declared !== null && (!/^\d+$/.test(declared) || Number(declared) > 2048)) {
      return fail("Invalid request size.", 413);
    }
    const raw = await request.text();
    if (Buffer.byteLength(raw, "utf8") > 2048) return fail("Request is too large.", 413);
    let decoded: unknown;
    try { decoded = JSON.parse(raw); } catch { return fail("Invalid JSON.", 400); }
    const selection = parseRequest(decoded);
    if (!selection) return fail("Invalid selection verification request.", 400);

    const db = await createSupabaseServerClient();
    const { data: claims, error: claimsError } = await db.auth.getClaims();
    const actor = claims?.claims?.sub;
    if (claimsError || typeof actor !== "string" || !UUID.test(actor)) {
      return fail("Authentication required.", 401);
    }
    const { data: role, error: roleError } = await db.from("staff_roles")
      .select("role,is_active").eq("user_id", actor).eq("is_active", true).maybeSingle();
    if (roleError || !role || role.is_active !== true || !isReservationStaffRole(role.role)) {
      return fail("Active reservation staff required.", 403);
    }
    const supabaseUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const restaurantPhone = process.env.TWILIO_FROM_NUMBER;
    if (!supabaseUrl || !serviceKey || !accountSid || !authToken ||
        !restaurantPhone || !E164.test(restaurantPhone)) {
      return fail("Selection verification is not configured.", 503);
    }
    const admin = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data: reservation, error: reservationError } = await admin
      .from("reservation_requests")
      .select("id,customer_phone")
      .eq("id", id).maybeSingle();
    if (reservationError || !reservation || !E164.test(reservation.customer_phone)) {
      return fail("Reservation guest identity could not be verified.", 409);
    }

    // Fetch the exact SID supplied by a staff selection from the on-screen
    // reservation-specific conversation, not by searching guest phone history.
    let verified;
    try {
      verified = await twilio(accountSid, authToken)
        .messages(selection.inboundMessageSid).fetch();
    } catch {
      return fail("Twilio reply could not be verified; no selection was recorded.", 502);
    }
    if (verified.sid.toLowerCase() !== selection.inboundMessageSid.toLowerCase() ||
        verified.direction !== "inbound" ||
        verified.from !== reservation.customer_phone ||
        verified.to !== restaurantPhone) {
      return fail("Inbound message identity mismatch.", 409);
    }
    const body = (verified.body ?? "").trim();
    if (!/^[1-3]$/.test(body)) {
      return fail("The selected guest reply must contain only 1, 2, or 3.", 409);
    }

    const { data, error } = await admin.rpc(
      "record_verified_staff_intervention_guest_selection",
      {
        p_reservation_id: id,
        p_conversation_id: selection.conversationId,
        p_expected_mode_version: selection.expectedModeVersion,
        p_intervention_id: selection.interventionId,
        p_inbound_message_sid: selection.inboundMessageSid,
        p_option_number: Number(body),
        p_staff_user_id: actor,
      },
    );
    if (error) {
      if (error.code === "42501") return fail("Staff authorization required.", 403);
      if (["22023", "55000", "23514"].includes(error.code ?? "")) {
        return fail("This reply cannot be associated with the active intervention. Refresh and review the verified conversation.", 409);
      }
      console.error("Intervention selection recording failed", { reservationId: id, code: error.code });
      return fail("Selection recording outcome is uncertain. Refresh before retrying.", 503);
    }
    const record: unknown = Array.isArray(data) ? (data.length === 1 ? data[0] : null) : data;
    if (!isObject(record) ||
        !["recorded", "duplicate"].includes(String(record.outcome)) ||
        typeof record.selected_time !== "string" ||
        !/^(1[0-9]|2[0-1]):(00|30)$|^22:00$/.test(record.selected_time)) {
      return fail("Selection result could not be verified. Refresh intervention state.", 503);
    }
    return respond({
      success: true,
      interventionId: selection.interventionId,
      selectedTime: record.selected_time,
      outcome: record.outcome,
      status: "staff_review",
      smsSent: false,
      reservationChanged: false,
    });
  } catch (error) {
    console.error("Intervention selection error", { name: error instanceof Error ? error.name : "UNKNOWN" });
    return fail("Unable to verify guest selection. No booking was changed.", 503);
  }
}