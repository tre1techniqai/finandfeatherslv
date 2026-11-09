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
    const fields = ["conversationId", "expectedModeVersion", "interventionId", "staffVerifiedGuestAcceptance"];
    if (Object.keys(input).length !== fields.length ||
        !fields.every((key) => Object.prototype.hasOwnProperty.call(input, key)) ||
        typeof input.conversationId !== "string" || !UUID.test(input.conversationId) ||
        typeof input.interventionId !== "string" || !UUID.test(input.interventionId) ||
        typeof input.expectedModeVersion !== "number" ||
        !Number.isSafeInteger(input.expectedModeVersion) || input.expectedModeVersion < 1 ||
        input.staffVerifiedGuestAcceptance !== true) {
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
    const { data, error } = await db.rpc("resolve_reservation_staff_intervention_after_booking", {
      p_reservation_id: id,
      p_conversation_id: input.conversationId,
      p_expected_mode_version: input.expectedModeVersion,
      p_intervention_id: input.interventionId,
      p_staff_verified_guest_acceptance: true,
    });
    if (error) {
      if (error.code === "42501") return fail("Staff ownership required.", 403);
      if (error.code === "P0002") return fail("Reservation not found.", 404);
      if (["22023", "55000", "23514"].includes(error.code ?? "")) {
        return fail("Booking or intervention state is not eligible for resolution. Review guest selection and confirmed booking.", 409);
      }
      console.error("Intervention resolution rejected", { reservationId: id, code: error.code });
      return fail("Unable to verify intervention resolution.", 503);
    }
    if (data !== "resolved") return fail("Intervention resolution could not be verified.", 503);
    return respond({ success: true, interventionId: input.interventionId,
      status: "resolved", smsSent: false });
  } catch (error) {
    console.error("Intervention resolve failure", {
      name: error instanceof Error ? error.name : "UNKNOWN",
    });
    return fail("Resolution outcome uncertain. Refresh and reconcile.", 500);
  }
}