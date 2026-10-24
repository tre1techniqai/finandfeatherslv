
import { NextResponse } from "next/server";
import twilio from "twilio";
import { createClient } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const E164 = /^\+[1-9]\d{7,14}$/;

const ACCOUNT_SID = /^AC[0-9a-f]{32}$/i;
const FLOW_SID = /^FW[0-9a-f]{32}$/i;

const MAX_BODY_BYTES = 256;
const EXECUTION_SCAN_LIMIT = 1000;

type RouteContext = {
  params: Promise<{ id: string }>;
};

type OwnershipRow = {
  ownership_id: string;
  ownership_status: string;
  linked_reservation_id: string;
  claimed_by: string | null;
};

type CompletionRow = {
  ownership_id: string;
  ownership_status: string;
  claimed_by: string | null;
};

function respond(
  payload: Record<string, unknown>,
  status = 200,
) {
  return NextResponse.json(payload, {
    status,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

function fail(error: string, status: number) {
  return respond(
    {
      success: false,
      error,
    },
    status,
  );
}

function validOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");

  if (!origin) {
    return false;
  }

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

async function validEmptyBody(
  request: Request,
): Promise<boolean> {
  const contentType =
    request.headers.get("content-type") ?? "";

  if (
    !/^application\/json(?:\s*;|$)/i.test(
      contentType,
    )
  ) {
    return false;
  }

  const declaredLength =
    request.headers.get("content-length");

  if (declaredLength !== null) {
    if (
      !/^\d+$/.test(declaredLength) ||
      !Number.isSafeInteger(Number(declaredLength)) ||
      Number(declaredLength) > MAX_BODY_BYTES
    ) {
      return false;
    }
  }

  let raw: string;

  try {
    raw = await request.text();
  } catch {
    return false;
  }

  if (
    Buffer.byteLength(raw, "utf8") >
    MAX_BODY_BYTES
  ) {
    return false;
  }

  try {
    const parsed: unknown = JSON.parse(raw);

    return (
      parsed !== null &&
      typeof parsed === "object" &&
      !Array.isArray(parsed) &&
      Object.keys(parsed).length === 0
    );
  } catch {
    return false;
  }
}

function isOwnershipRow(
  value: unknown,
): value is OwnershipRow {
  if (
    value === null ||
    typeof value !== "object" ||
    Array.isArray(value)
  ) {
    return false;
  }

  const row = value as Record<string, unknown>;

  return (
    typeof row.ownership_id === "string" &&
    UUID.test(row.ownership_id) &&
    typeof row.ownership_status === "string" &&
    typeof row.linked_reservation_id === "string" &&
    UUID.test(row.linked_reservation_id) &&
    (row.claimed_by === null ||
      (typeof row.claimed_by === "string" &&
        UUID.test(row.claimed_by)))
  );
}

function isCompletionRow(
  value: unknown,
): value is CompletionRow {
  if (
    value === null ||
    typeof value !== "object" ||
    Array.isArray(value)
  ) {
    return false;
  }

  const row = value as Record<string, unknown>;

  return (
    typeof row.ownership_id === "string" &&
    UUID.test(row.ownership_id) &&
    typeof row.ownership_status === "string" &&
    (row.claimed_by === null ||
      (typeof row.claimed_by === "string" &&
        UUID.test(row.claimed_by)))
  );
}

export async function POST(
  request: Request,
  context: RouteContext,
): Promise<Response> {
  // This endpoint must remain disabled until staff-owned
  // inbound routing and the takeover procedure are verified.
  //
  // A successful preflight alone does not grant SMS access.
  if (
    process.env
      .RESERVATION_STAFF_HANDOFF_COMPLETION_ENABLED !==
      "true" ||
    process.env
      .RESERVATION_STAFF_INBOUND_ROUTING_VERIFIED !==
      "true" ||
    process.env
      .RESERVATION_STUDIO_STAFF_ROUTING_ENABLED !==
      "true"
  ) {
    return fail(
      "Staff conversation takeover is not enabled.",
      503,
    );
  }

  if (!validOrigin(request)) {
    return fail(
      "Request origin is not authorized.",
      403,
    );
  }

  const { id } = await context.params;

  if (!UUID.test(id)) {
    return fail("Invalid reservation ID.", 400);
  }

  if (!(await validEmptyBody(request))) {
    return fail(
      "Expected an empty JSON object.",
      400,
    );
  }

  try {
    const supabase =
      await createSupabaseServerClient();

    // Verify the signed-in manager.
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
      data: role,
      error: roleError,
    } = await supabase
      .from("staff_roles")
      .select("role, is_active")
      .eq("user_id", managerId)
      .eq("is_active", true)
      .maybeSingle();

    if (
      roleError ||
      !role ||
      role.role !== "manager" ||
      role.is_active !== true
    ) {
      return fail(
        "Manager access required.",
        403,
      );
    }

    // Resolve server-side configuration.
    const restaurantPhone =
      process.env.TWILIO_FROM_NUMBER;

    const accountSid =
      process.env.TWILIO_ACCOUNT_SID;

    const authToken =
      process.env.TWILIO_AUTH_TOKEN;

    const flowSid =
      process.env.TWILIO_STUDIO_FLOW_SID;

    if (
      !restaurantPhone ||
      !E164.test(restaurantPhone) ||
      !accountSid ||
      !ACCOUNT_SID.test(accountSid) ||
      !authToken ||
      !flowSid ||
      !FLOW_SID.test(flowSid)
    ) {
      return fail(
        "Studio takeover verification is not configured.",
        503,
      );
    }

    // Guest phone identity must come from the reservation,
    // never from a browser-provided phone number.
    const {
      data: reservation,
      error: reservationError,
    } = await supabase
      .from("reservation_requests")
      .select("id, customer_phone")
      .eq("id", id)
      .maybeSingle();

    if (reservationError) {
      return fail(
        "Reservation could not be verified.",
        503,
      );
    }

    if (!reservation) {
      return fail(
        "Reservation not found.",
        404,
      );
    }

    const guestPhone =
      reservation.customer_phone;

    if (
      typeof guestPhone !== "string" ||
      !E164.test(guestPhone) ||
      guestPhone === restaurantPhone
    ) {
      return fail(
        "Reservation guest phone is invalid.",
        409,
      );
    }

    // Read the current canonical ownership record
    // using the authenticated manager's session.
    const {
      data: ownershipData,
      error: ownershipError,
    } = await supabase.rpc(
      "get_reservation_conversation_handoff",
      {
        p_reservation_id: id,
        p_restaurant_phone:
          restaurantPhone,
      },
    );

    if (ownershipError) {
      return fail(
        "Conversation ownership could not be verified.",
        503,
      );
    }

    if (
      !Array.isArray(ownershipData) ||
      ownershipData.length !== 1 ||
      !isOwnershipRow(ownershipData[0])
    ) {
      return fail(
        "An eligible pending handoff was not found.",
        409,
      );
    }

    const ownership =
      ownershipData[0];

    if (
      ownership.ownership_status !==
        "handoff_pending" ||
      ownership.linked_reservation_id !==
        id ||
      ownership.claimed_by !==
        managerId
    ) {
      return fail(
        "This conversation is not pending takeover by your account.",
        409,
      );
    }

    // Verify Twilio Studio before completing ownership.
    // This is a fresh lookup, not a browser's earlier
    // preflight result.
    const client = twilio(
      accountSid,
      authToken,
    );

    const flow = await client.studio.v2
      .flows(flowSid)
      .fetch();

    if (
      flow.status !== "published" ||
      flow.sid !== flowSid
    ) {
      return fail(
        "The configured Studio flow is not published.",
        503,
      );
    }

    // Reject the takeover if the scan reaches its limit.
    // In that case, we cannot confidently exclude
    // additional active executions for this guest.
    const executions =
      await client.studio.v2
        .flows(flowSid)
        .executions.list({
          status: "active",
          limit: EXECUTION_SCAN_LIMIT,
        });

    if (
      executions.length >=
      EXECUTION_SCAN_LIMIT
    ) {
      return fail(
        "Active Studio execution verification was incomplete.",
        503,
      );
    }

    const activeForGuest =
      executions.filter(
        (execution) =>
          execution.contactChannelAddress ===
          guestPhone,
      );

    if (
      activeForGuest.length > 0
    ) {
      return respond(
        {
          success: false,
          error:
            "The guest still has an active Studio execution. Takeover has not been completed.",
          activeExecutionCount:
            activeForGuest.length,
          ownershipChanged: false,
          staffMessagingEnabled: false,
        },
        409,
      );
    }

    // Only a trusted server uses the service-role
    // credentials needed by the existing completion RPC.
    const supabaseUrl =
      process.env.SUPABASE_URL ??
      process.env.NEXT_PUBLIC_SUPABASE_URL;

    const serviceKey =
      process.env.SUPABASE_SECRET_KEY ??
      process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (
      !supabaseUrl ||
      !serviceKey
    ) {
      return fail(
        "Trusted handoff completion is not configured.",
        503,
      );
    }

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

    // This function uses a database row lock and
    // verifies that the original pending claim still
    // belongs to the same manager and reservation.
    const {
      data: completionData,
      error: completionError,
    } = await admin.rpc(
      "complete_reservation_conversation_handoff",
      {
        p_reservation_id: id,
        p_restaurant_phone:
          restaurantPhone,
        p_manager_id: managerId,
      },
    );

    if (completionError) {
      if (
        completionError.code === "42501"
      ) {
        return fail(
          "Manager authorization failed.",
          403,
        );
      }

      if (
        completionError.code === "22023" ||
        completionError.code === "P0002"
      ) {
        return fail(
          "The pending handoff is no longer available.",
          409,
        );
      }

      console.error(
        "Conversation completion RPC failed:",
        {
          reservationId: id,
          code: completionError.code,
        },
      );

      return fail(
        "Unable to complete the handoff.",
        500,
      );
    }

    if (
      !Array.isArray(completionData) ||
      completionData.length !== 1 ||
      !isCompletionRow(completionData[0])
    ) {
      return fail(
        "Handoff completion could not be confirmed. Check ownership before retrying.",
        500,
      );
    }

    const completed =
      completionData[0];

    if (
      completed.ownership_status !== "staff" ||
      completed.claimed_by !== managerId ||
      completed.ownership_id !==
        ownership.ownership_id
    ) {
      return fail(
        "The resulting ownership state could not be verified. Check ownership before retrying.",
        500,
      );
    }

    return respond({
      success: true,
      reservationId: id,
      ownership: "staff",
      ownershipId:
        completed.ownership_id,
      claimedByCurrentManager: true,
      activeStudioExecutions: 0,
      studioExecutionsChanged: false,
      smsSent: false,
      staffMessagingEnabled: false,
    });
  } catch (caught) {
    console.error(
      "Conversation handoff completion failed:",
      {
        reservationId: id,
        name:
          caught instanceof Error
            ? caught.name
            : "UnknownError",
      },
    );

    return fail(
      "Unable to verify and complete the conversation handoff.",
      502,
    );
  }
}
