import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isReservationStaffRole } from "@/lib/auth/require-reservation-staff";
import { validSharedActivationOrigin } from "@/lib/reservations/shared-activation-origin";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MAX_BODY_BYTES = 1024;

type RouteContext = {
  params: Promise<{ id: string }>;
};

type CancelRequest = {
  interventionId: string;
  conversationId: string;
  expectedModeVersion: number;
};

function respond(payload: Record<string, unknown>, status = 200) {
  return NextResponse.json(payload, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

function fail(error: string, status: number) {
  return respond({ success: false, smsSent: false, error }, status);
}

function validPayload(value: unknown): value is CancelRequest {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const row = value as Record<string, unknown>;
  return (
    Object.keys(row).length === 3 &&
    typeof row.interventionId === "string" && UUID.test(row.interventionId) &&
    typeof row.conversationId === "string" && UUID.test(row.conversationId) &&
    typeof row.expectedModeVersion === "number" &&
    Number.isSafeInteger(row.expectedModeVersion) &&
    row.expectedModeVersion >= 1
  );
}

export async function POST(request: Request, context: RouteContext): Promise<NextResponse> {
  try {
    const { id } = await context.params;
    if (!UUID.test(id)) return fail("Invalid reservation ID.", 400);
    if (!validSharedActivationOrigin(request)) return fail("Request origin is not authorized.", 403);
    if (!/^application\/json(?:\s*;|$)/i.test(request.headers.get("content-type") ?? "")) {
      return fail("JSON request required.", 415);
    }
    const declaredLength = request.headers.get("content-length");
    if (declaredLength !== null &&
      (!/^\d+$/.test(declaredLength) ||
       !Number.isSafeInteger(Number(declaredLength)) ||
       Number(declaredLength) > MAX_BODY_BYTES)) {
      return fail("Invalid request length.", 400);
    }
    const raw = await request.text();
    if (Buffer.byteLength(raw, "utf8") > MAX_BODY_BYTES) return fail("Request too large.", 413);
    let payload: unknown;
    try { payload = JSON.parse(raw); }
    catch { return fail("Invalid JSON request.", 400); }
    if (!validPayload(payload)) return fail("Invalid intervention cancellation request.", 400);

    const supabase = await createSupabaseServerClient();
    const { data: claims, error: claimsError } = await supabase.auth.getClaims();
    const userId = claims?.claims?.sub;
    if (claimsError || typeof userId !== "string" || !UUID.test(userId)) {
      return fail("Authentication required.", 401);
    }
    const { data: role, error: roleError } = await supabase
      .from("staff_roles")
      .select("role, is_active")
      .eq("user_id", userId)
      .eq("is_active", true)
      .maybeSingle();
    if (roleError || !role || role.is_active !== true || !isReservationStaffRole(role.role)) {
      return fail("Active reservation staff access required.", 403);
    }

    // The database RPC is the authority for staff ownership, status, and
    // cancellation. No direct service-role mutation occurs in this route.
    const { data, error } = await supabase.rpc(
      "cancel_reservation_staff_intervention_draft",
      {
        p_reservation_id: id,
        p_conversation_id: payload.conversationId,
        p_expected_mode_version: payload.expectedModeVersion,
        p_intervention_id: payload.interventionId,
      },
    );
    if (error) {
      if (error.code === "42501") return fail("Reservation staff authorization required.", 403);
      if (error.code === "P0002") return fail("Intervention or reservation not found.", 404);
      if (error.code === "22023" || error.code === "55000") {
        return fail("Draft cannot be canceled. Refresh and verify the active intervention and conversation ownership.", 409);
      }
      console.error("Draft cancellation failed", { reservationId: id, code: error.code });
      return fail("Unable to cancel draft. Recheck intervention status before attempting handback.", 503);
    }
    if (typeof data !== "string" || data.toLowerCase() !== payload.interventionId.toLowerCase()) {
      return fail("Draft cancellation result could not be verified. Refresh intervention status.", 503);
    }
    return respond({
      success: true,
      reservationId: id,
      interventionId: data,
      status: "canceled",
      smsSent: false,
    });
  } catch (error) {
    console.error("Unexpected draft cancellation error", {
      name: error instanceof Error ? error.name : "UNKNOWN",
    });
    return fail("Unable to cancel intervention draft. Refresh before retrying.", 500);
  }
}