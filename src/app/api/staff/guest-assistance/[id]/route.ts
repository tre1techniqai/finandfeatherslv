import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const MAX_BODY_BYTES = 512;

type RouteContext = {
  params: Promise<{ id: string }>;
};

type Action = "acknowledge" | "resolve";

type AlertRow = {
  id: string;
  reservation_request_id: string;
  alert_status: string;
  acknowledged_by: string | null;
  acknowledged_at: string | null;
  resolved_by: string | null;
  resolved_at: string | null;
  updated_at: string;
};

function json(
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

function fail(
  message: string,
  status: number,
): NextResponse {
  return json(
    {
      success: false,
      error: message,
    },
    status,
  );
}

function parseAction(
  value: unknown,
): Action | null {
  if (
    !value ||
    typeof value !== "object" ||
    Array.isArray(value)
  ) {
    return null;
  }

  const fields = value as Record<string, unknown>;

  if (
    Object.keys(fields).length !== 1 ||
    !Object.prototype.hasOwnProperty.call(
      fields,
      "action",
    )
  ) {
    return null;
  }

  if (
    fields.action === "acknowledge" ||
    fields.action === "resolve"
  ) {
    return fields.action;
  }

  return null;
}

export async function POST(
  request: Request,
  context: RouteContext,
): Promise<NextResponse> {
  try {
    const { id } = await context.params;

    if (!UUID_PATTERN.test(id)) {
      return fail("Invalid assistance alert.", 400);
    }

    // Only requests originating from this website
    // may perform manager alert actions.
    const origin = request.headers.get("origin");
    const expectedOrigin = new URL(request.url).origin;

    if (origin !== expectedOrigin) {
      return fail("Request origin not permitted.", 403);
    }

    if (
      !/^application\/json(?:\s*;|$)/i.test(
        request.headers.get("content-type") ?? "",
      )
    ) {
      return fail("Unsupported content type.", 415);
    }

    const declaredLength =
      request.headers.get("content-length");

    if (
      declaredLength !== null &&
      (!/^\d+$/.test(declaredLength) ||
        Number(declaredLength) > MAX_BODY_BYTES)
    ) {
      return fail("Request too large.", 413);
    }

    const rawBody = await request.text();

    if (
      Buffer.byteLength(rawBody, "utf8") >
      MAX_BODY_BYTES
    ) {
      return fail("Request too large.", 413);
    }

    let payload: unknown;

    try {
      payload = JSON.parse(rawBody);
    } catch {
      return fail("Invalid JSON.", 400);
    }

    const action = parseAction(payload);

    if (!action) {
      return fail("Invalid assistance action.", 400);
    }

    // Validate the current manager's authenticated
    // session before accessing privileged credentials.
    const supabase =
      await createSupabaseServerClient();

    const {
      data: claimsData,
      error: claimsError,
    } = await supabase.auth.getClaims();

    const userId = claimsData?.claims?.sub;

    if (
      claimsError ||
      !userId ||
      !UUID_PATTERN.test(userId)
    ) {
      return fail("Please sign in to continue.", 401);
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
      staffRole.role !== "manager" ||
      staffRole.is_active !== true
    ) {
      return fail("Manager access required.", 403);
    }

    // Service-role access is used only after
    // authenticating and authorizing the manager.
    const supabaseUrl =
      process.env.SUPABASE_URL ??
      process.env.NEXT_PUBLIC_SUPABASE_URL;

    const supabaseKey =
      process.env.SUPABASE_SECRET_KEY ??
      process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error(
        "Guest assistance manager API is not configured.",
      );

      return fail(
        "Assistance actions are unavailable.",
        503,
      );
    }

    const admin = createClient(
      supabaseUrl,
      supabaseKey,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      },
    );

    // State transitions are deliberately strict:
    //
    // open         -> acknowledged
    // acknowledged -> resolved
    //
    // The database UPDATE checks the expected
    // previous state, preventing two simultaneous
    // manager actions from overwriting one another.
    const expectedStatus =
      action === "acknowledge"
        ? "open"
        : "acknowledged";

    const nextStatus =
      action === "acknowledge"
        ? "acknowledged"
        : "resolved";

    const timestamp = new Date().toISOString();

    const changes =
      action === "acknowledge"
        ? {
            alert_status: nextStatus,
            acknowledged_by: userId,
            acknowledged_at: timestamp,
            updated_at: timestamp,
          }
        : {
            alert_status: nextStatus,
            resolved_by: userId,
            resolved_at: timestamp,
            updated_at: timestamp,
          };

    const {
      data: updated,
      error: updateError,
    } = await admin
      .from("reservation_guest_assistance_alerts")
      .update(changes)
      .eq("id", id)
      .eq("alert_status", expectedStatus)
      .select(
        [
          "id",
          "reservation_request_id",
          "alert_status",
          "acknowledged_by",
          "acknowledged_at",
          "resolved_by",
          "resolved_at",
          "updated_at",
        ].join(","),
      )
      .maybeSingle();

    if (updateError) {
      console.error(
        "Guest assistance manager update failed:",
        {
          category: "GUEST_ASSISTANCE_UPDATE_ERROR",
          code: updateError.code,
        },
      );

      return fail(
        "Unable to update the assistance alert.",
        503,
      );
    }

    if (!updated) {
      // No matching row means the alert is missing
      // or its status has already changed.
      const {
        data: existing,
        error: lookupError,
      } = await admin
        .from("reservation_guest_assistance_alerts")
        .select("id, alert_status")
        .eq("id", id)
        .maybeSingle();

      if (lookupError) {
        return fail(
          "Unable to verify the assistance alert.",
          503,
        );
      }

      if (!existing) {
        return fail(
          "Assistance alert not found.",
          404,
        );
      }

      return fail(
        `Alert status is ${existing.alert_status}. Refresh before trying again.`,
        409,
      );
    }

    const alert = updated as unknown as AlertRow;

    if (
      !UUID_PATTERN.test(alert.id) ||
      !UUID_PATTERN.test(
        alert.reservation_request_id,
      ) ||
      alert.alert_status !== nextStatus
    ) {
      return fail(
        "Updated alert could not be verified.",
        503,
      );
    }

    return json({
      success: true,
      alert: {
        id: alert.id,
        reservationId:
          alert.reservation_request_id,
        status: alert.alert_status,
        acknowledgedBy: alert.acknowledged_by,
        acknowledgedAt: alert.acknowledged_at,
        resolvedBy: alert.resolved_by,
        resolvedAt: alert.resolved_at,
        updatedAt: alert.updated_at,
      },

      // Alert management does not grant SMS access.
      ownershipChanged: false,
      staffMessagingEnabled: false,
    });
  } catch (error) {
    console.error(
      "Guest assistance manager action failed:",
      {
        category: "GUEST_ASSISTANCE_ACTION_ERROR",
        name:
          error instanceof Error
            ? error.name
            : "UnknownError",
      },
    );

    return fail(
      "Unable to process the assistance action.",
      502,
    );
  }
}