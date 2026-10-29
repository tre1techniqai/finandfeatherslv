import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import twilio from "twilio";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { validSharedActivationOrigin } from "@/lib/reservations/shared-activation-origin";

import {
  reconcileSharedStudioExecutions,
  SHARED_STUDIO_EXECUTION_SCAN_LIMIT,
  type StudioExecutionRecord,
} from "@/lib/reservations/shared-studio-execution-reconciliation";

const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const FLOW_SID = /^FW[0-9a-f]{32}$/i;
const ACCOUNT_SID = /^AC[0-9a-f]{32}$/i;
const E164 = /^\+[1-9]\d{7,14}$/;

const MAX_REQUEST_BYTES = 4096;

type RouteContext = {
  params: Promise<{ id: string }>;
};

type ActivationRequest = {
  conversationId: string;
  expectedModeVersion: number;
};

type TransitionPreflight = {
  conversation_id: string;
  reservation_request_id: string;
  guest_phone: string;
  restaurant_phone: string;
  conversation_mode: string;
  mode_version: number;
  matching_conversation_count: number;
  association_valid: boolean;
};

type ModeTransition = {
  conversation_id: string;
  conversation_mode: string;
  mode_version: number;
};

type AdminClient = ReturnType<
  typeof createClient<any, "public", "public">
>;

type StudioClient = ReturnType<typeof twilio>;

type Configuration = {
  checks: Record<string, boolean>;
  allConfigured: boolean;
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

function denied(
  error: string,
  status: number,
  details: Record<string, unknown> = {},
): NextResponse {
  return respond(
    {
      success: false,
      activationAuthorized: false,
      operationalVerificationComplete: false,
      databaseChanged: false,
      studioExecutionsChanged: false,
      smsSent: false,
      error,
      ...details,
    },
    status,
  );
}

function configured(name: string): boolean {
  return process.env[name] === "true";
}

function readiness(): Configuration {
  const checks = {
    sharedRoutingEnabled: configured(
      "RESERVATION_SHARED_SMS_ROUTING_ENABLED",
    ),
    staffRoutingEnabled: configured(
      "RESERVATION_STUDIO_STAFF_ROUTING_ENABLED",
    ),
    handoffFenceEnabled: configured(
      "RESERVATION_STUDIO_HANDOFF_FENCE_ENABLED",
    ),
    inboundRoutingVerified: configured(
      "RESERVATION_STAFF_INBOUND_ROUTING_VERIFIED",
    ),
    inboundRecordingEnabled: configured(
      "RESERVATION_SHARED_SMS_INBOUND_RECORDING_ENABLED",
    ),
    inboundBridgeEnabled: configured(
      "RESERVATION_STUDIO_STAFF_INBOUND_BRIDGE_ENABLED",
    ),
    activationVerified: configured(
      "RESERVATION_SHARED_SMS_ACTIVATION_VERIFIED",
    ),
    sendEnabled: configured(
      "RESERVATION_SHARED_SMS_SEND_ENABLED",
    ),
  };

  return {
    checks,
    allConfigured: Object.values(checks).every(Boolean),
  };
}

function parseActivationRequest(
  value: unknown,
): ActivationRequest | null {
  if (
    !value ||
    typeof value !== "object" ||
    Array.isArray(value)
  ) {
    return null;
  }

  const fields = value as Record<string, unknown>;

  if (
    Object.keys(fields).length !== 2 ||
    typeof fields.conversationId !== "string" ||
    !UUID.test(fields.conversationId) ||
    typeof fields.expectedModeVersion !== "number" ||
    !Number.isSafeInteger(fields.expectedModeVersion) ||
    fields.expectedModeVersion < 1
  ) {
    return null;
  }

  return {
    conversationId: fields.conversationId,
    expectedModeVersion: fields.expectedModeVersion,
  };
}

function validPreflight(
  value: unknown,
): value is TransitionPreflight {
  if (
    !value ||
    typeof value !== "object" ||
    Array.isArray(value)
  ) {
    return false;
  }

  const row = value as Record<string, unknown>;

  return (
    typeof row.conversation_id === "string" &&
    UUID.test(row.conversation_id) &&
    typeof row.reservation_request_id === "string" &&
    UUID.test(row.reservation_request_id) &&
    typeof row.guest_phone === "string" &&
    E164.test(row.guest_phone) &&
    typeof row.restaurant_phone === "string" &&
    E164.test(row.restaurant_phone) &&
    typeof row.conversation_mode === "string" &&
    typeof row.mode_version === "number" &&
    Number.isSafeInteger(row.mode_version) &&
    row.mode_version >= 1 &&
    typeof row.matching_conversation_count === "number" &&
    Number.isSafeInteger(
      row.matching_conversation_count,
    ) &&
    typeof row.association_valid === "boolean"
  );
}

function validTransition(
  value: unknown,
): value is ModeTransition {
  if (
    !value ||
    typeof value !== "object" ||
    Array.isArray(value)
  ) {
    return false;
  }

  const row = value as Record<string, unknown>;

  return (
    typeof row.conversation_id === "string" &&
    UUID.test(row.conversation_id) &&
    typeof row.conversation_mode === "string" &&
    typeof row.mode_version === "number" &&
    Number.isSafeInteger(row.mode_version) &&
    row.mode_version >= 1
  );
}

function getFlowSid(): string | null {
  const value =
    process.env.TWILIO_STUDIO_FLOW_SID ??
    process.env.TWILIO_FLOW_SID;

  return value && FLOW_SID.test(value)
    ? value
    : null;
}

function getStudioClient(): StudioClient | null {
  const accountSid =
    process.env.TWILIO_ACCOUNT_SID;

  const authToken =
    process.env.TWILIO_AUTH_TOKEN;

  if (
    !accountSid ||
    !ACCOUNT_SID.test(accountSid) ||
    !authToken
  ) {
    return null;
  }

  return twilio(accountSid, authToken);
}

async function readActiveExecutions(
  client: StudioClient,
  flowSid: string,
  guestPhone: string,
) {
  const executions = await client.studio.v2
    .flows(flowSid)
    .executions.list({
      status: "active",
      limit: SHARED_STUDIO_EXECUTION_SCAN_LIMIT,
    });

  const records: StudioExecutionRecord[] =
    executions.map((execution) => ({
      sid: execution.sid,
      flowSid: execution.flowSid,
      status: execution.status,
      contactChannelAddress:
        execution.contactChannelAddress ?? null,
    }));

  return reconcileSharedStudioExecutions(
    records,
    guestPhone,
    flowSid,
  );
}

async function transition(
  admin: AdminClient,
  functionName:
    | "request_reservation_shared_staff_mode"
    | "complete_reservation_shared_staff_mode"
    | "cancel_reservation_shared_staff_transition",
  conversationId: string,
  expectedVersion: number,
  expectedMode: string,
): Promise<ModeTransition> {
  const { data, error } = await admin.rpc(
    functionName,
    {
      p_conversation_id: conversationId,
      p_expected_mode_version: expectedVersion,
    },
  );

  if (error) {
    console.error(
      "Shared conversation mode transition failed.",
      {
        functionName,
        code: error.code ?? "UNKNOWN",
      },
    );

    throw new Error(
      "Conversation ownership could not be updated.",
    );
  }

  if (
    !Array.isArray(data) ||
    data.length !== 1 ||
    !validTransition(data[0])
  ) {
    throw new Error(
      "Conversation transition returned an invalid result.",
    );
  }

  const result = data[0];

  if (
    result.conversation_id.toLowerCase() !==
      conversationId.toLowerCase() ||
    result.conversation_mode !== expectedMode ||
    result.mode_version !== expectedVersion + 1
  ) {
    throw new Error(
      "Conversation transition did not reach the expected state.",
    );
  }

  return result;
}

export async function POST(
  request: Request,
  context: RouteContext,
): Promise<NextResponse> {
  try {
    const { id } = await context.params;

    if (!UUID.test(id)) {
      return denied("Invalid reservation ID.", 400);
    }

    if (!validSharedActivationOrigin(request)) {
      return denied(
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
      return denied(
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
      return denied(
        "Manager access required.",
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
      return denied(
        "Unsupported content type.",
        415,
      );
    }

    const declaredLength =
      request.headers.get("content-length");

    if (
      declaredLength !== null &&
      (
        !/^\d+$/.test(declaredLength) ||
        !Number.isSafeInteger(
          Number(declaredLength),
        )
      )
    ) {
      return denied(
        "Invalid request length.",
        400,
      );
    }

    if (
      declaredLength !== null &&
      Number(declaredLength) > MAX_REQUEST_BYTES
    ) {
      return denied(
        "Request too large.",
        413,
      );
    }

    let rawBody: string;

    try {
      rawBody = await request.text();
    } catch {
      return denied(
        "Invalid request body.",
        400,
      );
    }

    if (
      Buffer.byteLength(rawBody, "utf8") >
      MAX_REQUEST_BYTES
    ) {
      return denied(
        "Request too large.",
        413,
      );
    }

    let parsed: unknown;

    try {
      parsed = JSON.parse(rawBody);
    } catch {
      return denied(
        "Invalid JSON.",
        400,
      );
    }

    const payload =
      parseActivationRequest(parsed);

    if (!payload) {
      return denied(
        "Invalid activation request.",
        400,
      );
    }

    const configuration = readiness();

    if (!configuration.allConfigured) {
      return denied(
        "Staff messaging is not fully configured.",
        503,
        {
          configurationChecks:
            configuration.checks,
        },
      );
    }

    const restaurantPhone =
      process.env.TWILIO_FROM_NUMBER;

    const supabaseUrl =
      process.env.SUPABASE_URL ??
      process.env.NEXT_PUBLIC_SUPABASE_URL;

    const serviceKey =
      process.env.SUPABASE_SECRET_KEY ??
      process.env.SUPABASE_SERVICE_ROLE_KEY;

    const flowSid = getFlowSid();

    const studio = getStudioClient();

    if (
      !restaurantPhone ||
      !E164.test(restaurantPhone) ||
      !supabaseUrl ||
      !serviceKey ||
      !flowSid ||
      !studio
    ) {
      return denied(
        "Staff messaging configuration is unavailable.",
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

    if (preflightError) {
      console.error(
        "Shared activation preflight failed.",
        {
          code:
            preflightError.code ?? "UNKNOWN",
        },
      );

      return denied(
        "Conversation verification is unavailable.",
        503,
      );
    }

    if (
      !Array.isArray(preflightData) ||
      preflightData.length !== 1 ||
      !validPreflight(preflightData[0])
    ) {
      return denied(
        "Conversation verification failed.",
        409,
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
      return denied(
        "Reservation conversation association could not be verified.",
        409,
      );
    }

    if (
      row.conversation_mode !== "automation" ||
      row.mode_version !==
        payload.expectedModeVersion
    ) {
      return denied(
        "Conversation state has changed. Refresh and try again.",
        409,
      );
    }

    // Verify that the live Studio Flow is published
    // before requesting a staff transition.

    let published = false;

    try {
      const flow = await studio.studio.v2
        .flows(flowSid)
        .fetch();

      published =
        flow.sid === flowSid &&
        flow.status === "published";
    } catch {
      published = false;
    }

    if (!published) {
      return denied(
        "The restaurant messaging service is unavailable.",
        503,
      );
    }

    // Read the current Studio execution state.
    // An incomplete or invalid scan blocks activation.

    let initialExecutions;

    try {
      initialExecutions =
        await readActiveExecutions(
          studio,
          flowSid,
          row.guest_phone,
        );
    } catch {
      return denied(
        "Unable to verify active restaurant messages.",
        503,
      );
    }

    if (
      initialExecutions.status !== "clear" &&
      initialExecutions.status !== "active"
    ) {
      return denied(
        "Active restaurant messaging could not be verified.",
        503,
      );
    }

    // First establish the database routing fence.
    // Inbound messages must be blocked from automation
    // while this transition is in progress.

    let pending: ModeTransition;

    try {
      pending = await transition(
        admin,
        "request_reservation_shared_staff_mode",
        row.conversation_id,
        row.mode_version,
        "transitioning_to_staff",
      );
    } catch {
      return denied(
        "Unable to begin staff handoff. Refresh and try again.",
        409,
      );
    }

    let studioExecutionsChanged = false;

    try {
      // End active Studio executions belonging to
      // this specific guest and published Flow.

      // A fresh scan after the transition catches
      // executions that became active in the meantime.

      const currentExecutions =
        await readActiveExecutions(
          studio,
          flowSid,
          row.guest_phone,
        );

      if (
        currentExecutions.status !== "clear" &&
        currentExecutions.status !== "active"
      ) {
        throw new Error(
          "Studio execution verification is incomplete.",
        );
      }

      if (currentExecutions.status === "active") {
        for (
          const executionSid of
          currentExecutions.executionSids
        ) {
          const execution = await studio.studio.v2
            .flows(flowSid)
            .executions(executionSid)
            .update({
              status: "ended",
            });

          if (
            execution.sid !== executionSid ||
            execution.status !== "ended"
          ) {
            throw new Error(
              "Studio execution did not end.",
            );
          }

          studioExecutionsChanged = true;
        }
      }

      // Do not activate staff messaging unless
      // Studio confirms no matching active executions.

      const finalExecutions =
        await readActiveExecutions(
          studio,
          flowSid,
          row.guest_phone,
        );

      if (finalExecutions.status !== "clear") {
        throw new Error(
          "Restaurant automation is still active.",
        );
      }

      // Recheck the operational configuration
      // immediately before final activation.

      if (!readiness().allConfigured) {
        throw new Error(
          "Staff messaging configuration changed.",
        );
      }

      const active = await transition(
        admin,
        "complete_reservation_shared_staff_mode",
        row.conversation_id,
        pending.mode_version,
        "staff",
      );

      return respond(
        {
          success: true,
          reservationId: id,
          conversationId:
            active.conversation_id,
          conversationMode:
            active.conversation_mode,
          modeVersion:
            active.mode_version,
          activationAuthorized: true,
          operationalVerificationComplete: true,
          databaseChanged: true,
          studioExecutionsChanged,
          smsSent: false,
          message:
            "You have joined the conversation. Staff messaging is now active.",
        },
        200,
      );
    } catch (error) {
      console.error(
        "Shared staff handoff failed.",
        {
          name:
            error instanceof Error
              ? error.name
              : "UNKNOWN",
        },
      );

      // Keep the conversation fenced until the
      // server can verify whether returning control
      // to automation is safe.

      // An incomplete Studio scan must not cause
      // an automatic rollback.

      let restoredAutomation = false;
      let recoveryVerified = false;

      try {
        const recoveryExecutions =
          await readActiveExecutions(
            studio,
            flowSid,
            row.guest_phone,
          );

        if (
          recoveryExecutions.status === "clear" &&
          readiness().allConfigured
        ) {
          recoveryVerified = true;

          const restored = await transition(
            admin,
            "cancel_reservation_shared_staff_transition",
            row.conversation_id,
            pending.mode_version,
            "automation",
          );

          restoredAutomation =
            restored.conversation_mode ===
            "automation";
        }
      } catch {
        restoredAutomation = false;
      }

      return denied(
        restoredAutomation
          ? "Staff handoff could not be completed. Please try again."
          : "Staff handoff needs administrator review before messaging can continue.",
        503,
        {
          conversationId:
            row.conversation_id,
          conversationMode:
            restoredAutomation
              ? "automation"
              : "transitioning_to_staff",
          databaseChanged: true,
          studioExecutionsChanged,
          recoveryVerified,
          restoredAutomation,
          manualReviewRequired:
            !restoredAutomation,
        },
      );
    }
  } catch (error) {
    console.error(
      "Shared activation coordination failed.",
      {
        name:
          error instanceof Error
            ? error.name
            : "UNKNOWN",
      },
    );

    return denied(
      "Shared staff activation is unavailable.",
      503,
    );
  }
}