import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isReservationStaffRole } from "@/lib/auth/require-reservation-staff";

const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const ACTIVE_STATUSES = [
  "draft",
  "awaiting_guest",
  "staff_review",
];

type RouteContext = {
  params: Promise<{ id: string }>;
};

type InterventionRow = {
  id: string;
  reservation_request_id: string;
  conversation_id: string;
  intervention_type: string;
  status: string;
  mode_version_at_start: number;
  initiated_by: string;
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
  details: Record<string, unknown>;
};

function respond(
  data: Record<string, unknown>,
  status = 200,
): NextResponse {
  return NextResponse.json(data, {
    status,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

function fail(message: string, status: number) {
  return respond(
    {
      success: false,
      error: message,
    },
    status,
  );
}

function validIntervention(
  value: unknown,
): value is InterventionRow {
  if (
    value === null ||
    typeof value !== "object" ||
    Array.isArray(value)
  ) {
    return false;
  }

  const row = value as Record<string, unknown>;

  return (
    typeof row.id === "string" &&
    UUID.test(row.id) &&
    typeof row.reservation_request_id === "string" &&
    UUID.test(row.reservation_request_id) &&
    typeof row.conversation_id === "string" &&
    UUID.test(row.conversation_id) &&
    typeof row.intervention_type === "string" &&
    row.intervention_type.length > 0 &&
    typeof row.status === "string" &&
    ACTIVE_STATUSES.includes(row.status) &&
    typeof row.mode_version_at_start === "number" &&
    Number.isSafeInteger(row.mode_version_at_start) &&
    row.mode_version_at_start >= 1 &&
    typeof row.initiated_by === "string" &&
    UUID.test(row.initiated_by) &&
    (
      row.assigned_to === null ||
      (
        typeof row.assigned_to === "string" &&
        UUID.test(row.assigned_to)
      )
    ) &&
    typeof row.created_at === "string" &&
    !Number.isNaN(Date.parse(row.created_at)) &&
    typeof row.updated_at === "string" &&
    !Number.isNaN(Date.parse(row.updated_at)) &&
    row.details !== null && typeof row.details === "object" && !Array.isArray(row.details)
  );
}

export async function GET(
  _request: Request,
  context: RouteContext,
): Promise<NextResponse> {
  try {
    const { id } = await context.params;

    if (!UUID.test(id)) {
      return fail("Invalid reservation ID.", 400);
    }

    const supabase =
      await createSupabaseServerClient();

    const {
      data: claimsData,
      error: claimsError,
    } = await supabase.auth.getClaims();

    const userId = claimsData?.claims?.sub;

    if (
      claimsError ||
      typeof userId !== "string" ||
      !UUID.test(userId)
    ) {
      return fail("Authentication required.", 401);
    }

    const {
      data: staffRole,
      error: roleError,
    } = await supabase
      .from("staff_roles")
      .select("role, is_active")
      .eq("user_id", userId)
      .eq("is_active", true)
      .maybeSingle();

    if (
      roleError ||
      !staffRole ||
      staffRole.is_active !== true ||
      !isReservationStaffRole(staffRole.role)
    ) {
      return fail(
        "Active reservation staff access required.",
        403,
      );
    }

    const supabaseUrl =
      process.env.SUPABASE_URL ??
      process.env.NEXT_PUBLIC_SUPABASE_URL;

    const serviceKey =
      process.env.SUPABASE_SECRET_KEY ??
      process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceKey) {
      return fail(
        "Intervention lookup is not configured.",
        503,
      );
    }

    // The intervention table has RLS enabled
    // and does not permit direct browser reads.
    //
    // This server-side service client is used
    // only AFTER authenticating reservation staff.

    const admin = createClient(
      supabaseUrl,
      serviceKey,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      },
    );

    const {
      data: reservation,
      error: reservationError,
    } = await admin
      .from("reservation_requests")
      .select("id")
      .eq("id", id)
      .maybeSingle();

    if (reservationError) {
      return fail(
        "Reservation verification is unavailable.",
        503,
      );
    }

    if (!reservation) {
      return fail("Reservation not found.", 404);
    }

    const {
      data: interventions,
      error: interventionError,
    } = await admin
      .from("reservation_staff_interventions")
      .select(
        "id, reservation_request_id, conversation_id, " +
        "intervention_type, status, mode_version_at_start, " +
        "initiated_by, assigned_to, created_at, updated_at, details",
      )
      .eq("reservation_request_id", id)
      .in("status", ACTIVE_STATUSES)
      .limit(2);

    if (interventionError) {
      console.error(
        "Active intervention lookup failed.",
        {
          reservationId: id,
          code:
            interventionError.code ?? "UNKNOWN",
        },
      );

      return fail(
        "Unable to verify active interventions.",
        503,
      );
    }

    if (
      !Array.isArray(interventions) ||
      interventions.length > 1
    ) {
      return fail(
        "Intervention state requires administrator review.",
        409,
      );
    }

    const intervention =
      interventions[0] ?? null;

    if (
      intervention !== null &&
      (
        !validIntervention(intervention) ||
        intervention.reservation_request_id.toLowerCase() !==
          id.toLowerCase()
      )
    ) {
      return fail(
        "Intervention record could not be verified.",
        503,
      );
    }

    const { data: booking, error: bookingError } = await admin
      .from("reservation_requests")
      .select("reservation_date")
      .eq("id", id)
      .maybeSingle();
    if (bookingError || !booking || typeof booking.reservation_date !== "string") {
      return fail("Unable to verify reservation date.", 503);
    }

    return respond({
      reservationDate: booking.reservation_date,
      success: true,
      reservationId: id,
      hasActiveIntervention: intervention !== null,
      intervention,
    });
  } catch (error) {
    console.error(
      "Unexpected intervention lookup error.",
      {
        name:
          error instanceof Error
            ? error.name
            : "UNKNOWN",
      },
    );

    return fail(
      "Unable to retrieve intervention status.",
      500,
    );
  }
}