import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { validSharedActivationOrigin } from "@/lib/reservations/shared-activation-origin";
import { recordStudioMessageHistory } from "@/lib/reservations/record-studio-message-history";

const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const EXECUTION_SID = /^FN[0-9a-f]{32}$/i;

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

function respond(
  payload: Record<string, unknown>,
  status: number,
): NextResponse {
  return NextResponse.json(payload, {
    status,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

function fail(
  error: string,
  status: number,
): NextResponse {
  return respond(
    {
      success: false,
      error,
    },
    status,
  );
}

export async function POST(
  request: Request,
  context: RouteContext,
): Promise<NextResponse> {
  try {
    const { id } = await context.params;

    if (!UUID.test(id)) {
      return fail("Invalid reservation ID.", 400);
    }

    // Prevent cross-origin requests from triggering
    // authenticated recovery operations.

    if (!validSharedActivationOrigin(request)) {
      return fail(
        "Request origin is not authorized.",
        403,
      );
    }

    // Manager authentication.

    const supabase =
      await createSupabaseServerClient();

    const {
      data: claimsData,
      error: claimsError,
    } = await supabase.auth.getClaims();

    const managerId =
      claimsData?.claims?.sub;

    if (
      claimsError ||
      typeof managerId !== "string" ||
      !UUID.test(managerId)
    ) {
      return fail(
        "Authentication required.",
        401,
      );
    }

    const {
      data: staffRole,
      error: roleError,
    } = await supabase
      .from("staff_roles")
      .select("role, is_active")
      .eq("user_id", managerId)
      .eq("is_active", true)
      .maybeSingle();

    if (
      roleError ||
      !staffRole ||
      staffRole.role !== "manager" ||
      staffRole.is_active !== true
    ) {
      return fail(
        "Manager access required.",
        403,
      );
    }

    // This endpoint accepts no client-provided
    // execution SID, phone number, or conversation ID.
    //
    // All recovery identity comes from the
    // authoritative reservation record.

    const {
      data: reservation,
      error: reservationError,
    } = await supabase
      .from("reservation_requests")
      .select(
        "id, twilio_execution_sid",
      )
      .eq("id", id)
      .maybeSingle();

    if (reservationError) {
      return fail(
        "Reservation verification failed.",
        503,
      );
    }

    if (!reservation) {
      return fail(
        "Reservation not found.",
        404,
      );
    }

    const executionSid =
      reservation.twilio_execution_sid;

    if (
      typeof executionSid !== "string" ||
      !EXECUTION_SID.test(executionSid)
    ) {
      return fail(
        "This reservation does not have a verified Studio execution for recovery.",
        409,
      );
    }

    // The existing recorder independently verifies:
    //
    // - Reservation and execution association
    // - Shared conversation
    // - Studio Flow and execution context
    // - Twilio Message SIDs and phone directions
    // - Existing ownership conflicts
    // - Duplicate associations
    //
    // It records only verified missing associations.
    // It does not send SMS or change conversation mode.

    const result =
      await recordStudioMessageHistory({
        reservationId: id,
        executionSid,
      });

    return respond(
      {
        success: true,
        reservationId: result.reservationId,
        discovered: result.discovered,
        verified: result.verified,
        recorded: result.recorded,
        duplicates: result.duplicates,
        excluded: result.excluded,
      },
      200,
    );
  } catch (caught) {
    console.error(
      "Reservation conversation recovery failed.",
      {
        error:
          caught instanceof Error
            ? caught.message
            : "Unknown error",
      },
    );

    return fail(
      "Conversation recovery could not be completed. Existing verified messages were preserved. Some associations may have been recorded before the error; review before retrying.",
      503,
    );
  }
}