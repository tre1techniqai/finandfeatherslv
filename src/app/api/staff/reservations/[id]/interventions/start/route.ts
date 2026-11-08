import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isReservationStaffRole } from "@/lib/auth/require-reservation-staff";
import { validSharedActivationOrigin } from "@/lib/reservations/shared-activation-origin";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const MAX_BODY_BYTES = 4096;

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

type StartRequest = {
  conversationId: string;
  expectedModeVersion: number;
  requestKey: string;
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
  message: string,
  status: number,
): NextResponse {
  return respond(
    {
      success: false,
      interventionStarted: false,
      smsSent: false,
      error: message,
    },
    status,
  );
}

function isRecord(
  value: unknown,
): value is Record<string, unknown> {
  return (
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value)
  );
}

function parseStartRequest(
  value: unknown,
): StartRequest | null {
  if (!isRecord(value)) {
    return null;
  }

  const keys = Object.keys(value);

  if (
    keys.length !== 3 ||
    !keys.includes("conversationId") ||
    !keys.includes("expectedModeVersion") ||
    !keys.includes("requestKey")
  ) {
    return null;
  }

  if (
    typeof value.conversationId !== "string" ||
    !UUID_PATTERN.test(value.conversationId) ||
    typeof value.requestKey !== "string" ||
    !UUID_PATTERN.test(value.requestKey) ||
    typeof value.expectedModeVersion !== "number" ||
    !Number.isSafeInteger(value.expectedModeVersion) ||
    value.expectedModeVersion < 1
  ) {
    return null;
  }

  return {
    conversationId: value.conversationId,
    expectedModeVersion: value.expectedModeVersion,
    requestKey: value.requestKey,
  };
}

export async function POST(
  request: Request,
  context: RouteContext,
): Promise<NextResponse> {
  try {
    const { id } = await context.params;

    if (!UUID_PATTERN.test(id)) {
      return fail(
        "Invalid reservation ID.",
        400,
      );
    }

    if (!validSharedActivationOrigin(request)) {
      return fail(
        "Request origin is not authorized.",
        403,
      );
    }

    const contentType =
      request.headers.get("content-type") ?? "";

    if (
      !/^application\/json(?:\s*;|$)/i.test(
        contentType,
      )
    ) {
      return fail(
        "JSON request required.",
        415,
      );
    }

    const declaredLength =
      request.headers.get("content-length");

    if (declaredLength !== null) {
      if (
        !/^\d+$/.test(declaredLength) ||
        !Number.isSafeInteger(
          Number(declaredLength),
        )
      ) {
        return fail(
          "Invalid request length.",
          400,
        );
      }

      if (
        Number(declaredLength) > MAX_BODY_BYTES
      ) {
        return fail(
          "Request too large.",
          413,
        );
      }
    }

    const rawBody = await request.text();

    if (
      Buffer.byteLength(rawBody, "utf8") >
      MAX_BODY_BYTES
    ) {
      return fail(
        "Request too large.",
        413,
      );
    }

    let parsed: unknown;

    try {
      parsed = JSON.parse(rawBody);
    } catch {
      return fail(
        "Invalid JSON request.",
        400,
      );
    }

    const payload = parseStartRequest(parsed);

    if (!payload) {
      return fail(
        "Invalid intervention request.",
        400,
      );
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
      !UUID_PATTERN.test(userId)
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
      .eq("user_id", userId)
      .eq("is_active", true)
      .maybeSingle();

    if (
      roleError ||
      !staffRole ||
      staffRole.is_active !== true ||
      !isReservationStaffRole(
        staffRole.role,
      )
    ) {
      return fail(
        "Active reservation staff access required.",
        403,
      );
    }

    // The deployed SECURITY DEFINER function is the
    // authoritative intervention-creation gate.
    //
    // It verifies:
    // - Reservation eligibility
    // - Conversation association
    // - Staff conversation mode
    // - Expected mode version
    // - Request-key idempotency
    // - One active intervention per reservation
    //
    // No service-role bypass is used here.

    const {
      data,
      error,
    } = await supabase.rpc(
      "start_reservation_staff_intervention",
      {
        p_reservation_id: id,
        p_conversation_id:
          payload.conversationId,
        p_expected_mode_version:
          payload.expectedModeVersion,
        p_request_key:
          payload.requestKey,
      },
    );

    if (error) {
      if (error.code === "42501") {
        return fail(
          "Reservation staff authorization required.",
          403,
        );
      }

      if (error.code === "P0002") {
        return fail(
          "Reservation not found.",
          404,
        );
      }

      if (error.code === "23505") {
        return fail(
          "An active intervention already exists for this reservation. Review the existing intervention before starting another.",
          409,
        );
      }

      if (
        error.code === "22023" ||
        error.code === "23503" ||
        error.code === "23514"
      ) {
        return fail(
          "Intervention could not be started. Refresh the reservation and verify staff conversation ownership and reservation status.",
          409,
        );
      }

      console.error(
        "Reservation intervention start failed.",
        {
          code: error.code ?? "UNKNOWN",
          reservationId: id,
        },
      );

      return fail(
        "Unable to start the intervention.",
        500,
      );
    }

    if (
      typeof data !== "string" ||
      !UUID_PATTERN.test(data)
    ) {
      console.error(
        "Reservation intervention returned an invalid ID.",
        {
          reservationId: id,
        },
      );

      return fail(
        "Intervention result could not be verified. Check the reservation before retrying.",
        500,
      );
    }

    return respond(
      {
        success: true,
        interventionStarted: true,
        interventionId: data,
        reservationId: id,
        conversationId:
          payload.conversationId,
        interventionType:
          "revised_availability",
        status: "draft",
        smsSent: false,
        message:
          "Staff intervention is ready. No guest message has been sent.",
      },
      200,
    );
  } catch (error) {
    console.error(
      "Unexpected reservation intervention error.",
      {
        name:
          error instanceof Error
            ? error.name
            : "UNKNOWN",
      },
    );

    return fail(
      "Unable to process the intervention request.",
      500,
    );
  }
}