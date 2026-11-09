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

type SaveRequest = {
  conversationId: string;
  expectedModeVersion: number;
  interventionId: string;
  revisedTimes: string[];
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
      timesSaved: false,
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

function parseSaveRequest(
  value: unknown,
): SaveRequest | null {
  if (!isRecord(value)) {
    return null;
  }

  const keys = Object.keys(value);

  if (keys.length !== 4 ||
      !keys.includes("conversationId") ||
      !keys.includes("expectedModeVersion") ||
      !keys.includes("interventionId") ||
      !keys.includes("revisedTimes")) return null;
  if (typeof value.conversationId !== "string" || !UUID_PATTERN.test(value.conversationId) ||
      typeof value.interventionId !== "string" || !UUID_PATTERN.test(value.interventionId) ||
      typeof value.expectedModeVersion !== "number" ||
      !Number.isSafeInteger(value.expectedModeVersion) || value.expectedModeVersion < 1 ||
      !Array.isArray(value.revisedTimes) || value.revisedTimes.length > 3 ||
      !value.revisedTimes.every((v) => typeof v === "string" &&
        /^(1[0-9]|2[0-1]):(00|30)$|^22:00$/.test(v)) ||
      new Set(value.revisedTimes).size !== value.revisedTimes.length) return null;
  return {
    conversationId: value.conversationId,
    expectedModeVersion: value.expectedModeVersion,
    interventionId: value.interventionId,
    revisedTimes: value.revisedTimes as string[],
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

    const payload = parseSaveRequest(parsed);

    if (!payload) {
      return fail(
        "Invalid revised time options.",
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

    // Atomic database procedure validates staff role, conversation mode,
    // reservation date, draft status, times and concurrency.
    // Empty revisedTimes clears the unsent draft so it can be canceled.
    const { data, error } = await supabase.rpc(
      "save_reservation_staff_intervention_times",
      {
        p_reservation_id: id,
        p_conversation_id: payload.conversationId,
        p_expected_mode_version: payload.expectedModeVersion,
        p_intervention_id: payload.interventionId,
        p_times: payload.revisedTimes,
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
          "Revised-time draft conflict. Refresh the active intervention.",
          409,
        );
      }

      if (
        error.code === "22023" ||
        error.code === "23503" ||
        error.code === "23514"
      ) {
        return fail(
          "Times were not saved. Verify the original reservation date, 2-hour lead time and staff ownership.",
          409,
        );
      }

      console.error(
        "Revised-time save failed.",
        {
          code: error.code ?? "UNKNOWN",
          reservationId: id,
        },
      );

      return fail(
        "Unable to save revised time options.",
        500,
      );
    }

    if (
      typeof data !== "string" ||
      !UUID_PATTERN.test(data)
    ) {
      console.error(
        "Revised-time save returned an invalid ID.",
        {
          reservationId: id,
        },
      );

      return fail(
        "Save result could not be verified. Recheck the active draft before retrying.",
        500,
      );
    }

    if (data.toLowerCase() !== payload.interventionId.toLowerCase()) {
      return fail("Saved intervention does not match requested draft.", 503);
    }
    return respond(
      {
        success: true,
        timesSaved: true,
        interventionId: data,
        reservationId: id,
        status: "draft",
        revisedTimes: payload.revisedTimes,
        smsSent: false,
        message: payload.revisedTimes.length
          ? "Revised times saved as an unsent draft."
          : "Draft options cleared. No SMS sent.",
      },
      200,
    );
  } catch (error) {
    console.error(
      "Unexpected revised-time save error.",
      {
        name:
          error instanceof Error
            ? error.name
            : "UNKNOWN",
      },
    );

    return fail(
      "Unable to process the revised-time save.",
      500,
    );
  }
}