
import { NextResponse } from "next/server";
import twilio from "twilio";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const EXECUTION_SID_PATTERN = /^FN[0-9a-f]{32}$/i;
const FLOW_SID_PATTERN = /^FW[0-9a-f]{32}$/i;
const ACCOUNT_SID_PATTERN = /^AC[0-9a-f]{32}$/i;
const E164_PATTERN = /^\+[1-9]\d{7,14}$/;

const HANDOFF_STATES = new Set([
  "automation",
  "handoff_pending",
  "staff",
  "released",
]);

type RouteContext = {
  params: Promise<{ id: string }>;
};

type HandoffRow = {
  ownership_id: string;
  ownership_status: string;
  linked_reservation_id: string;
  claimed_by: string | null;
  claimed_at: string | null;
  released_at: string | null;
  updated_at: string;
};

function jsonResponse(
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

function jsonError(
  error: string,
  status: number,
): NextResponse {
  return jsonResponse(
    {
      success: false,
      error,
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

function isOptionalUuid(
  value: unknown,
): value is string | null {
  return (
    value === null ||
    (
      typeof value === "string" &&
      UUID_PATTERN.test(value)
    )
  );
}

function isOptionalTimestamp(
  value: unknown,
): value is string | null {
  return (
    value === null ||
    (
      typeof value === "string" &&
      !Number.isNaN(Date.parse(value))
    )
  );
}

function isHandoffRow(
  value: unknown,
): value is HandoffRow {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.ownership_id === "string" &&
    UUID_PATTERN.test(value.ownership_id) &&
    typeof value.ownership_status === "string" &&
    HANDOFF_STATES.has(value.ownership_status) &&
    typeof value.linked_reservation_id === "string" &&
    UUID_PATTERN.test(value.linked_reservation_id) &&
    isOptionalUuid(value.claimed_by) &&
    isOptionalTimestamp(value.claimed_at) &&
    isOptionalTimestamp(value.released_at) &&
    typeof value.updated_at === "string" &&
    !Number.isNaN(Date.parse(value.updated_at))
  );
}

function takeoverConfigured(): boolean {
  return (
    process.env.RESERVATION_STAFF_HANDOFF_COMPLETION_ENABLED ===
      "true" &&
    process.env.RESERVATION_STAFF_INBOUND_ROUTING_VERIFIED ===
      "true" &&
    process.env.RESERVATION_STUDIO_STAFF_ROUTING_ENABLED ===
      "true" &&
    process.env.RESERVATION_STUDIO_HANDOFF_FENCE_ENABLED ===
      "true"
  );
}

function messagingConfigured(): boolean {
  return (
    takeoverConfigured() &&
    process.env.RESERVATION_STAFF_SMS_ENABLED === "true"
  );
}

export async function GET(
  _request: Request,
  context: RouteContext,
): Promise<NextResponse> {
  try {
    const { id: routeId } = await context.params;

    const pathname = new URL(_request.url).pathname;

    const match = /^\/api\/staff\/reservations\/([^/]+)\/conversation\/ownership\/?$/i.exec(
    pathname,
    );

    const urlId = match?.[1] ?? null;

    if (
    !urlId ||
    !UUID_PATTERN.test(urlId) ||
    (
        typeof routeId === "string" &&
        UUID_PATTERN.test(routeId) &&
        routeId.toLowerCase() !== urlId.toLowerCase()
    )
    ) {
    console.error("Invalid reservation ownership route parameters.", {
        routeIdType: typeof routeId,
        routeIdValid:
        typeof routeId === "string" &&
        UUID_PATTERN.test(routeId),
        urlIdValid:
        typeof urlId === "string" &&
        UUID_PATTERN.test(urlId),
    });

    return jsonError(
        "Invalid reservation.",
        400,
    );
    }

    const id = urlId;

    const supabase =
      await createSupabaseServerClient();

    const {
      data: claimsData,
      error: claimsError,
    } = await supabase.auth.getClaims();

    const userId =
      claimsData?.claims?.sub;

    if (
      claimsError ||
      typeof userId !== "string" ||
      !UUID_PATTERN.test(userId)
    ) {
      return jsonError(
        "Please sign in to continue.",
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
      staffRole.role !== "manager"
    ) {
      return jsonError(
        "Staff access required.",
        403,
      );
    }

    const {
      data: reservation,
      error: reservationError,
    } = await supabase
      .from("reservation_requests")
      .select(
        "id, customer_phone, twilio_execution_sid",
      )
      .eq("id", id)
      .maybeSingle();

    if (reservationError) {
      return jsonError(
        "Unable to load the reservation.",
        500,
      );
    }

    if (!reservation) {
      return jsonError(
        "Reservation not found.",
        404,
      );
    }

    const guestPhone =
      reservation.customer_phone;

    const executionSid =
      reservation.twilio_execution_sid;

    if (
      typeof guestPhone !== "string" ||
      !E164_PATTERN.test(guestPhone)
    ) {
      return jsonError(
        "This reservation has no valid SMS phone number.",
        409,
      );
    }

    const restaurantPhone =
      process.env.TWILIO_FROM_NUMBER;

    if (
      !restaurantPhone ||
      !E164_PATTERN.test(restaurantPhone) ||
      guestPhone === restaurantPhone
    ) {
      return jsonError(
        "Restaurant SMS number is not configured.",
        503,
      );
    }

    // Query through the manager-authorized
    // SECURITY DEFINER function.
    // Do not read the RLS-protected table directly.
    const {
      data: handoffData,
      error: handoffError,
    } = await supabase.rpc(
      "get_reservation_conversation_handoff",
      {
        p_reservation_id: id,
        p_restaurant_phone: restaurantPhone,
      },
    );

    if (handoffError) {
      if (handoffError.code === "42501") {
        return jsonError(
          "Manager access required.",
          403,
        );
      }

      if (handoffError.code === "22023") {
        return jsonError(
          "Invalid conversation details.",
          409,
        );
      }

      if (handoffError.code === "P0002") {
        return jsonError(
          "Reservation not found.",
          404,
        );
      }

      console.error(
        "Stored conversation handoff lookup failed:",
        {
          category: "HANDOFF_READ_ERROR",
          code: handoffError.code,
          reservationId: id,
        },
      );

      return jsonError(
        "We couldn't read the conversation handoff state.",
        500,
      );
    }

    if (
      !Array.isArray(handoffData) ||
      handoffData.length > 1
    ) {
      return jsonError(
        "Conversation handoff state could not be verified.",
        500,
      );
    }

    const storedHandoff: unknown =
      handoffData[0] ?? null;

    if (
      storedHandoff !== null &&
      !isHandoffRow(storedHandoff)
    ) {
      return jsonError(
        "Conversation handoff state could not be verified.",
        500,
      );
    }

    const handoffRow =
      storedHandoff as HandoffRow | null;

    // Ownership is associated with a guest/restaurant
    // phone pair. Authorization must match this
    // exact reservation and this exact manager.
    const ownsLinkedReservation =
      handoffRow !== null &&
      handoffRow.linked_reservation_id === id &&
      handoffRow.claimed_by === userId;

    const actionsConfigured =
      takeoverConfigured();

    // Completing a new handoff must remain gated
    // by all takeover requirements.
    const canComplete =
      actionsConfigured &&
      ownsLinkedReservation &&
      handoffRow?.ownership_status ===
        "handoff_pending";

    // RELEASE IS A RECOVERY OPERATION.
    //
    // Do not require takeover or messaging flags.
    // Existing staff ownership is sufficient to make
    // the release option available to its manager.
    //
    // The release POST endpoint and database RPC
    // independently enforce manager authorization
    // and exact reservation ownership.
    const canRelease =
      ownsLinkedReservation &&
      handoffRow?.ownership_status === "staff";

    // UI eligibility only.
    //
    // The SMS send endpoint must independently verify
    // manager authorization, exact staff ownership,
    // and database-backed SMS operation coordination.
    //
    // This value does not authorize SMS by itself.
    const staffMessagingEnabled =
        messagingConfigured() &&
        ownsLinkedReservation &&
        handoffRow?.ownership_status === "staff";

    const handoff = handoffRow
      ? {
          exists: true,
          ownershipId: handoffRow.ownership_id,
          status: handoffRow.ownership_status,
          reservationId:
            handoffRow.linked_reservation_id,
          claimedByCurrentManager:
            handoffRow.claimed_by === userId,
          canCancel:
            handoffRow.ownership_status ===
              "handoff_pending" &&
            handoffRow.claimed_by === userId &&
            handoffRow.linked_reservation_id === id,
          canComplete,
          canRelease,
          claimedAt: handoffRow.claimed_at,
          releasedAt: handoffRow.released_at,
          updatedAt: handoffRow.updated_at,
        }
      : {
          exists: false,
          ownershipId: null,
          status: "not_recorded",
          reservationId: null,
          claimedByCurrentManager: false,
          canCancel: false,
          canComplete: false,
          canRelease: false,
          claimedAt: null,
          releasedAt: null,
          updatedAt: null,
        };

    // Diagnostics only.
    // This does not authorize staff messaging.
    const messagingPrerequisitesConfigured =
      messagingConfigured();

    // Preserve existing Studio execution diagnostics.
    // A missing or ended execution is not proof
    // of completed staff ownership.
    if (
      typeof executionSid !== "string" ||
      !EXECUTION_SID_PATTERN.test(executionSid)
    ) {
      return jsonResponse({
        success: true,
        reservationId: reservation.id,
        execution: null,
        state: "execution_not_recorded",
        ownership: "unverified",
        handoff,
        takeoverConfigured: actionsConfigured,
        messagingPrerequisitesConfigured,
        staffMessagingEnabled,
        readOnly: true,
      });
    }

    const accountSid =
      process.env.TWILIO_ACCOUNT_SID;

    const authToken =
      process.env.TWILIO_AUTH_TOKEN;

    const flowSid =
      process.env.TWILIO_STUDIO_FLOW_SID;

    if (
      !accountSid ||
      !ACCOUNT_SID_PATTERN.test(accountSid) ||
      !authToken ||
      !flowSid ||
      !FLOW_SID_PATTERN.test(flowSid)
    ) {
      return jsonError(
        "Studio execution lookup is not configured.",
        503,
      );
    }

    const client = twilio(
      accountSid,
      authToken,
    );

    let execution;

    try {
      execution = await client.studio.v2
        .flows(flowSid)
        .executions(executionSid)
        .fetch();
    } catch (error) {
      const status =
        typeof error === "object" &&
        error !== null &&
        "status" in error
          ? (error as {
              status?: unknown;
            }).status
          : undefined;

      if (status === 404) {
        return jsonResponse({
          success: true,
          reservationId: reservation.id,
          execution: null,
          state:
            "execution_not_found_in_configured_flow",
          ownership: "unverified",
          handoff,
          takeoverConfigured: actionsConfigured,
          messagingPrerequisitesConfigured,
          staffMessagingEnabled,
          readOnly: true,
        });
      }

      throw error;
    }

    const matchesGuest =
      execution.contactChannelAddress === guestPhone;

    const matchesFlow =
      execution.flowSid === flowSid;

    const verified =
      matchesGuest && matchesFlow;

    return jsonResponse({
      success: true,
      reservationId: reservation.id,
      execution: {
        sid: execution.sid,
        flowSid: execution.flowSid,
        status: execution.status,
        dateCreated:
          execution.dateCreated?.toISOString() ?? null,
        dateUpdated:
          execution.dateUpdated?.toISOString() ?? null,
        matchesReservationGuest: matchesGuest,
        matchesConfiguredFlow: matchesFlow,
      },
      state: verified
        ? execution.status
        : "identity_mismatch",
      ownership: verified
        ? "studio_execution_observed"
        : "unverified",
      handoff,
      takeoverConfigured: actionsConfigured,
      messagingPrerequisitesConfigured,
      staffMessagingEnabled,
      readOnly: true,
    });
  } catch (error) {
    console.error(
      "Studio ownership lookup failed:",
      {
        category:
          "STUDIO_OWNERSHIP_LOOKUP_ERROR",
        name:
          error instanceof Error
            ? error.name
            : "UnknownError",
      },
    );

    return jsonError(
      "We couldn't verify the conversation state.",
      502,
    );
  }
}
