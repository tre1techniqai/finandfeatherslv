import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isReservationStaffRole } from "@/lib/auth/require-reservation-staff";
import { validSharedActivationOrigin } from "@/lib/reservations/shared-activation-origin";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
type RouteContext = { params: Promise<{ id: string }> };
function respond(body: Record<string, unknown>, status = 200) {
  return NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });
}
function fail(message: string, status: number) {
  return respond({ success: false, smsSent: false, error: message }, status);
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
    if (!isObject(input)) return fail("Invalid intervention request.", 400);
    const permitted = ["conversationId", "expectedModeVersion", "interventionId", "clientRequestId"];
    if (Object.keys(input).length !== permitted.length ||
        !permitted.every((key) => Object.prototype.hasOwnProperty.call(input, key)) ||
        typeof input.conversationId !== "string" || !UUID.test(input.conversationId) ||
        typeof input.interventionId !== "string" || !UUID.test(input.interventionId) ||
        typeof input.expectedModeVersion !== "number" ||
        !Number.isSafeInteger(input.expectedModeVersion) || input.expectedModeVersion < 1 || typeof input.clientRequestId !== "string" || !UUID.test(input.clientRequestId)) {
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
    const { data, error } = await db.rpc("complete_reservation_staff_intervention_sms", {
      p_reservation_id: id,
      p_conversation_id: input.conversationId,
      p_expected_mode_version: input.expectedModeVersion,
      p_intervention_id: input.interventionId,
      p_client_request_id: input.clientRequestId,
    });
    if (error) {
      if (error.code === "42501") return fail("Staff ownership required.", 403);
      if (error.code === "P0002") return fail("Reservation not found.", 404);
      if (["22023", "55000", "23514"].includes(error.code ?? "")) {
        return fail("Intervention cannot proceed. Refresh and review its state; never resend an uncertain SMS.", 409);
      }
      console.error("Intervention complete failed", { reservationId: id, code: error.code });
      return fail("Intervention state could not be verified. Do not resend.", 503);
    }
    if (data !== "awaiting_guest") {
      return fail("Accepted SMS evidence could not be verified.", 503);
    }
    return respond({ success: true, interventionId: input.interventionId,
      status: "awaiting_guest", smsAccepted: true });
  } catch (error) {
    console.error("Intervention complete failure", {
      name: error instanceof Error ? error.name : "UNKNOWN",
    });
    return fail("Intervention outcome uncertain. Refresh and reconcile before retrying.", 500);
  }
}