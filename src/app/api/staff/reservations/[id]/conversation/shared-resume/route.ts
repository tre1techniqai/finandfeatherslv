import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import twilio from "twilio";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { validSharedActivationOrigin } from "@/lib/reservations/shared-activation-origin";

import {
  reconcileSharedStudioExecutions,
  SHARED_STUDIO_EXECUTION_SCAN_LIMIT,
} from "@/lib/reservations/shared-studio-execution-reconciliation";

const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const E164 = /^\+[1-9]\d{7,14}$/;
const FLOW_SID = /^FW[0-9a-f]{32}$/i;
const ACCOUNT_SID = /^AC[0-9a-f]{32}$/i;

const MAX_REQUEST_BYTES = 4096;

type RouteContext = {
  params: Promise<{ id: string }>;
};

type ResumeRequest = {
  conversationId: string;
  expectedModeVersion: number;
};

type PreflightRow = {
  conversation_id: string;
  reservation_request_id: string;
  guest_phone: string;
  restaurant_phone: string;
  conversation_mode: string;
  mode_version: number;
  matching_conversation_count: number;
  association_valid: boolean;
};

type TransitionRow = {
  conversation_id: string;
  conversation_mode: string;
  mode_version: number;
};

function respond(
  payload: Record<string, unknown>,
  status = 200,
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
      error: message,
      databaseChanged: false,
      smsSent: false,
      studioExecutionsChanged: false,
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

function validPreflight(
  value: unknown,
): value is PreflightRow {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.conversation_id === "string" &&
    UUID.test(value.conversation_id) &&
    typeof value.reservation_request_id === "string" &&
    UUID.test(value.reservation_request_id) &&
    typeof value.guest_phone === "string" &&
    E164.test(value.guest_phone) &&
    typeof value.restaurant_phone === "string" &&
    E164.test(value.restaurant_phone) &&
    typeof value.conversation_mode === "string" &&
    typeof value.mode_version === "number" &&
    Number.isSafeInteger(value.mode_version) &&
    value.mode_version >= 1 &&
    typeof value.matching_conversation_count === "number" &&
    Number.isSafeInteger(
      value.matching_conversation_count,
    ) &&
    typeof value.association_valid === "boolean"
  );
}

function validTransition(
  value: unknown,
): value is TransitionRow {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.conversation_id === "string" &&
    UUID.test(value.conversation_id) &&
    typeof value.conversation_mode === "string" &&
    typeof value.mode_version === "number" &&
    Number.isSafeInteger(value.mode_version) &&
    value.mode_version >= 1
  );
}

async function parseRequest(
  request: Request,
): Promise<ResumeRequest | null> {
  const contentType =
    request.headers.get("content-type") ?? "";

  if (
    !/^application\/json(?:\s*;|$)/i.test(
      contentType,
    )
  ) {
    return null;
  }

  const declaredLength =
    request.headers.get("content-length");

  if (
    declaredLength !== null &&
    (
      !/^\d+$/.test(declaredLength) ||
      !Number.isSafeInteger(
        Number(declaredLength),
      ) ||
      Number(declaredLength) > MAX_REQUEST_BYTES
    )
  ) {
    return null;
  }

  let raw: string;

  try {
    raw = await request.text();
  } catch {
    return null;
  }

  if (
    Buffer.byteLength(raw, "utf8") >
    MAX_REQUEST_BYTES
  ) {
    return null;
  }

  let parsed: unknown;

  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }

  if (!isRecord(parsed)) {
    return null;
  }

  if (
    Object.keys(parsed).length !== 2 ||
    typeof parsed.conversationId !== "string" ||
    !UUID.test(parsed.conversationId) ||
    typeof parsed.expectedModeVersion !== "number" ||
    !Number.isSafeInteger(
      parsed.expectedModeVersion,
    ) ||
    parsed.expectedModeVersion < 1
  ) {
    return null;
  }

  return {
    conversationId: parsed.conversationId,
    expectedModeVersion:
      parsed.expectedModeVersion,
  };
}

function routingConfigured(): boolean {
  return (
    process.env.RESERVATION_SHARED_SMS_ROUTING_ENABLED ===
      "true" &&
    process.env.RESERVATION_STUDIO_STAFF_ROUTING_ENABLED ===
      "true" &&
    process.env.RESERVATION_STUDIO_HANDOFF_FENCE_ENABLED ===
      "true" &&
    process.env.RESERVATION_STAFF_INBOUND_ROUTING_VERIFIED ===
      "true" &&
    process.env.RESERVATION_SHARED_SMS_ACTIVATION_VERIFIED ===
      "true"
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

    if (!validSharedActivationOrigin(request)) {
      return fail(
        "Request origin is not authorized.",
        403,
      );
    }

    const supabase =
      await createSupabaseServerClient();

    const {
      data: claimsData,
      error: claimsError,
    } = await supabase.auth.getClaims();

    const managerId = claimsData?.claims?.sub;

    if (
      claimsError ||
      typeof managerId !== "string" ||
      !UUID.test(managerId)
    ) {
      return fail("Authentication required.", 401);
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
      role?.role !== "manager" ||
      role.is_active !== true
    ) {
      return fail("Manager access required.", 403);
    }

    const payload = await parseRequest(request);

    if (!payload) {
      return fail(
        "Invalid automation resume request.",
        400,
      );
    }

    if (!routingConfigured()) {
      return fail(
        "Automation routing has not been verified.",
        503,
      );
    }

    const restaurantPhone =
      process.env.TWILIO_FROM_NUMBER;

    const flowSid =
      process.env.TWILIO_STUDIO_FLOW_SID ??
      process.env.TWILIO_FLOW_SID;

    const accountSid =
      process.env.TWILIO_ACCOUNT_SID;

    const authToken =
      process.env.TWILIO_AUTH_TOKEN;

    const supabaseUrl =
      process.env.SUPABASE_URL ??
      process.env.NEXT_PUBLIC_SUPABASE_URL;

    const serviceKey =
      process.env.SUPABASE_SECRET_KEY ??
      process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (
      !restaurantPhone ||
      !E164.test(restaurantPhone) ||
      !flowSid ||
      !FLOW_SID.test(flowSid) ||
      !accountSid ||
      !ACCOUNT_SID.test(accountSid) ||
      !authToken ||
      !supabaseUrl ||
      !serviceKey
    ) {
      return fail(
        "Messaging configuration is unavailable.",
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

    const {
      data: preflightData,
      error: preflightError,
    } = await admin.rpc(
      "get_reservation_shared_transition_preflight",
      {
        p_reservation_id: id,
        p_restaurant_phone: restaurantPhone,
      },
    );

    if (
      preflightError ||
      !Array.isArray(preflightData) ||
      preflightData.length !== 1 ||
      !validPreflight(preflightData[0])
    ) {
      return fail(
        "Conversation verification is unavailable.",
        503,
      );
    }

    const row = preflightData[0];

    if (
      row.reservation_request_id.toLowerCase() !==
        id.toLowerCase() ||
      row.conversation_id.toLowerCase() !==
        payload.conversationId.toLowerCase() ||
      row.restaurant_phone !== restaurantPhone ||
      row.association_valid !== true ||
      row.matching_conversation_count !== 1
    ) {
      return fail(
        "Reservation conversation association is not verified.",
        409,
      );
    }

    if (
      row.conversation_mode !== "staff" ||
      row.mode_version !==
        payload.expectedModeVersion
    ) {
      return fail(
        "Conversation state has changed. Reload before continuing.",
        409,
      );
    }

    // A shared guest phone must not be used to
    // resume reservation-specific automation
    // when multiple reservations match it.

    const {
      data: matchingReservations,
      error: matchingError,
    } = await admin
      .from("reservation_requests")
      .select("id")
      .eq("customer_phone", row.guest_phone)
      .limit(2);

    if (
      matchingError ||
      !Array.isArray(matchingReservations) ||
      matchingReservations.length !== 1 ||
      matchingReservations[0]?.id !== id
    ) {
      return fail(
        "Automation cannot safely resume because this phone number is associated with multiple reservations.",
        409,
      );
    }

    // Confirm that any legacy ownership record
    // belongs to this same reservation and is
    // in a released or automation state.

    const {
      data: legacyRows,
      error: legacyError,
    } = await admin
      .from("reservation_conversation_ownership")
      .select(
        "reservation_request_id, ownership_status",
      )
      .eq("guest_phone", row.guest_phone)
      .eq("restaurant_phone", restaurantPhone)
      .limit(2);

    if (
      legacyError ||
      !Array.isArray(legacyRows) ||
      legacyRows.length > 1 ||
      (
        legacyRows.length === 1 &&
        (
          legacyRows[0].reservation_request_id !== id ||
          ![
            "released",
            "automation",
          ].includes(
            legacyRows[0].ownership_status,
          )
        )
      )
    ) {
      return fail(
        "Legacy conversation ownership requires administrator review.",
        409,
      );
    }

    const studio = twilio(
      accountSid,
      authToken,
      {
        autoRetry: false,
      },
    );

    // A valid published Flow is mandatory.

    let flowPublished = false;

    try {
      const flow = await studio.studio.v2
        .flows(flowSid)
        .fetch();

      flowPublished =
        flow.sid === flowSid &&
        flow.status === "published";
    } catch {
      flowPublished = false;
    }

    if (!flowPublished) {
      return fail(
        "Restaurant automation is not verified as published.",
        503,
      );
    }

    // A complete execution scan is mandatory.
    // This endpoint never ends an execution
    // or starts a replacement execution.

    try {
      const executions = await studio.studio.v2
        .flows(flowSid)
        .executions.list({
          status: "active",
          limit:
            SHARED_STUDIO_EXECUTION_SCAN_LIMIT,
        });

      const reconciliation =
        reconcileSharedStudioExecutions(
          executions,
          row.guest_phone,
          flowSid,
        );

      if (reconciliation.status !== "clear") {
        return fail(
          "Active or unverified Studio executions prevent automation handback.",
          409,
        );
      }
    } catch {
      return fail(
        "Studio execution state could not be verified.",
        503,
      );
    }

    if (!routingConfigured()) {
      return fail(
        "Routing configuration changed during verification.",
        503,
      );
    }

    // The protected RPC additionally locks the
    // conversation and rejects unresolved SMS
    // operations, stale mode versions, and
    // invalid reservation associations.

    const {
      data: transitionData,
      error: transitionError,
    } = await admin.rpc(
      "resume_reservation_shared_automation",
      {
        p_conversation_id:
          payload.conversationId,
        p_expected_mode_version:
          payload.expectedModeVersion,
      },
    );

    if (transitionError) {
      console.error(
        "Shared automation resume rejected.",
        {
          conversationId:
            payload.conversationId,
          code:
            transitionError.code ?? "UNKNOWN",
        },
      );

      return fail(
        "Automation handback was not authorized. The conversation remains under staff control until its state is verified.",
        409,
      );
    }

    if (
      !Array.isArray(transitionData) ||
      transitionData.length !== 1 ||
      !validTransition(transitionData[0])
    ) {
      return respond(
        {
          success: false,
          error:
            "Automation handback result could not be verified. Reload the conversation before taking further action.",
          databaseChanged: "unknown",
          smsSent: false,
          studioExecutionsChanged: false,
        },
        502,
      );
    }

    const transition = transitionData[0];

    if (
      transition.conversation_id.toLowerCase() !==
        payload.conversationId.toLowerCase() ||
      transition.conversation_mode !==
        "automation" ||
      transition.mode_version !==
        payload.expectedModeVersion + 1
    ) {
      return respond(
        {
          success: false,
          error:
            "Automation handback state was unexpected. Administrator verification is required.",
          databaseChanged: "unknown",
          smsSent: false,
          studioExecutionsChanged: false,
        },
        502,
      );
    }

    return respond({
      success: true,
      reservationId: id,
      conversationId:
        transition.conversation_id,
      conversationMode:
        transition.conversation_mode,
      modeVersion:
        transition.mode_version,
      operationalVerificationComplete: true,
      databaseChanged: true,
      studioExecutionsChanged: false,
      smsSent: false,
      message:
        "Automation has resumed for future incoming guest messages.",
    });
  } catch (error) {
    console.error(
      "Shared automation resume endpoint failed.",
      {
        name:
          error instanceof Error
            ? error.name
            : "UNKNOWN",
      },
    );

    return fail(
      "Automation handback could not be completed.",
      503,
    );
  }
}