import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isReservationStaffRole } from "@/lib/auth/require-reservation-staff";
import { validSharedActivationOrigin } from "@/lib/reservations/shared-activation-origin";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
type RouteContext = { params: Promise<{ id: string }> };
function respond(body: Record<string, unknown>, status = 200) {
  return NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });
}
function fail(error: string, status: number) {
  return respond({ success: false, smsSent: false, error }, status);
}
function isObject(v: unknown): v is Record<string, unknown> {
  return v !== null && typeof v === "object" && !Array.isArray(v);
}
export async function POST(request: Request, context: RouteContext): Promise<NextResponse> {
  try {
    // Honor the existing amendment feature gate; this route is not a bypass.
    if (process.env.RESERVATION_DATETIME_AMENDMENTS_ENABLED !== "true") {
      return fail("Reservation date/time editing is not enabled.", 503);
    }
    const { id } = await context.params;
    if (!UUID.test(id)) return fail("Invalid reservation ID.", 400);
    if (!validSharedActivationOrigin(request)) return fail("Unauthorized request origin.", 403);
    if (!/^application\/json(?:\s*;|$)/i.test(request.headers.get("content-type") ?? "")) {
      return fail("JSON request required.", 415);
    }
    const length = request.headers.get("content-length");
    if (length !== null && (!/^\d+$/.test(length) || Number(length) > 4096)) {
      return fail("Invalid request size.", 413);
    }
    const raw = await request.text();
    if (Buffer.byteLength(raw, "utf8") > 4096) return fail("Request too large.", 413);
    let input: unknown;
    try { input = JSON.parse(raw); } catch { return fail("Invalid JSON.", 400); }
    if (!isObject(input)) return fail("Invalid request.", 400);
    const fields = ["conversationId", "expectedModeVersion", "interventionId"];
    if (Object.keys(input).length !== fields.length ||
        !fields.every((key) => Object.prototype.hasOwnProperty.call(input, key)) ||
        typeof input.conversationId !== "string" || !UUID.test(input.conversationId) ||
        typeof input.interventionId !== "string" || !UUID.test(input.interventionId) ||
        typeof input.expectedModeVersion !== "number" ||
        !Number.isSafeInteger(input.expectedModeVersion) || input.expectedModeVersion < 1) {
      return fail("Invalid intervention request.", 400);
    }
    const db = await createSupabaseServerClient();
    const { data: claimsData, error: claimsError } = await db.auth.getClaims();
    const actor = claimsData?.claims?.sub;
    if (claimsError || typeof actor !== "string" || !UUID.test(actor)) {
      return fail("Authentication required.", 401);
    }
    const { data: role, error: roleError } = await db.from("staff_roles")
      .select("role, is_active").eq("user_id", actor).eq("is_active", true).maybeSingle();
    if (roleError || !role || role.is_active !== true || !isReservationStaffRole(role.role)) {
      return fail("Active reservation staff required.", 403);
    }
    const { data, error } = await db.rpc("apply_verified_staff_intervention_selected_time", {
      p_reservation_id: id,
      p_conversation_id: input.conversationId,
      p_expected_mode_version: input.expectedModeVersion,
      p_intervention_id: input.interventionId,
    });
    if (error) {
      if (error.code === "42501") return fail("Staff authorization required.", 403);
      if (error.code === "P0002") return fail("Reservation not found.", 404);
      if (["22023", "55000", "23514"].includes(error.code ?? "")) {
        return fail("Selected time cannot be applied. Check whether a legacy offer exists, whether the booking is confirmed, and whether the amendment workflow permits this change.", 409);
      }
      console.error("Intervention selected-time amendment rejected", { reservationId: id, code: error.code });
      return fail("Unable to verify selected-time amendment.", 503);
    }
    const row: unknown = Array.isArray(data) ? data[0] : data;
    if (!isObject(row) || row.reservation_id !== id ||
        typeof row.reservation_date !== "string" ||
        typeof row.reservation_time !== "string" ||
        row.workflow_status !== "awaiting_review") {
      return fail("Amendment result requires reconciliation. Refresh the reservation before another action.", 503);
    }
    return respond({ success: true, interventionId: input.interventionId,
      reservation: row, smsSent: false });
  } catch (error) {
    console.error("Intervention selected-time amendment failure", {
      name: error instanceof Error ? error.name : "UNKNOWN",
    });
    return fail("Amendment outcome uncertain. Refresh the reservation and reconcile before retrying.", 500);
  }
}