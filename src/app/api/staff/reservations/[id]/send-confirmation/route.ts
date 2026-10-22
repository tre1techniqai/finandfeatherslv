import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { dispatchReservationConfirmation } from "@/lib/reservations/dispatch-reservation-confirmation";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type RouteContext = {
  params: Promise<{ id: string }>;
};

function jsonError(message: string, status: number) {
  return NextResponse.json(
    { success: false, error: message },
    {
      status,
      headers: { "Cache-Control": "no-store" },
    },
  );
}

function sameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");

  if (!origin) return false;

  try {
    const source = new URL(origin);
    const destination = new URL(request.url);

    return (
      source.origin === destination.origin &&
      (source.protocol === "https:" ||
        source.hostname === "localhost" ||
        source.hostname === "127.0.0.1")
    );
  } catch {
    return false;
  }
}

export async function POST(request: Request, context: RouteContext) {
  if (process.env.RESERVATION_CONFIRMATION_SEND_ENABLED !== "true") {
    return jsonError("Guest confirmation SMS sending is not enabled.", 503);
  }

  if (!sameOrigin(request)) {
    return jsonError("Request origin is not authorized.", 403);
  }

  const { id } = await context.params;

  if (!UUID_PATTERN.test(id)) {
    return jsonError("Invalid reservation ID.", 400);
  }

  const supabase = await createSupabaseServerClient();

  const { data: claimsData, error: claimsError } =
    await supabase.auth.getClaims();

  const userId = claimsData?.claims?.sub;

  if (claimsError || !userId) {
    return jsonError("Authentication required.", 401);
  }

  const { data: staffRole, error: roleError } = await supabase
    .from("staff_roles")
    .select("role, is_active")
    .eq("user_id", userId)
    .eq("is_active", true)
    .maybeSingle();

  if (
    roleError ||
    !staffRole ||
    staffRole.role !== "manager" ||
    !staffRole.is_active
  ) {
    return jsonError("Manager access required.", 403);
  }

  // The shared dispatcher performs reservation and notification validation,
  // claims the pending event atomically, sends the signed Twilio request,
  // and records the outcome. It retains the existing JSON response contract.
  return dispatchReservationConfirmation(supabase, id);
}
