import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import twilio from "twilio";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  reconcileSharedStudioExecutions,
  SHARED_STUDIO_EXECUTION_SCAN_LIMIT,
  type StudioExecutionReconciliation,
} from "@/lib/reservations/shared-studio-execution-reconciliation";

import {
  planSharedStaffHandoff,
} from "@/lib/reservations/shared-staff-handoff-plan";

const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const E164 = /^\+[1-9]\d{7,14}$/;
const ACCOUNT_SID = /^AC[0-9a-f]{32}$/i;
const FLOW_SID = /^FW[0-9a-f]{32}$/i;

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

type Check = {
  name: string;
  passed: boolean;
  detail: string;
};

type SharedPreflightRow = {
  conversation_id: string | null;
  reservation_request_id: string | null;
  guest_phone: string | null;
  restaurant_phone: string | null;
  conversation_mode: string | null;
  mode_version: number | string | null;
  matching_conversation_count: number | string;
  association_valid: boolean;
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

function validUuid(
  value: unknown,
): value is string {
  return (
    typeof value === "string" &&
    UUID.test(value)
  );
}

function validPhone(
  value: unknown,
): value is string {
  return (
    typeof value === "string" &&
    E164.test(value)
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

function safeNonnegativeInteger(
  value: unknown,
): number | null {
  if (
    typeof value !== "number" &&
    typeof value !== "string"
  ) {
    return null;
  }

  if (
    typeof value === "string" &&
    !/^(0|[1-9]\d*)$/.test(value)
  ) {
    return null;
  }

  const parsed = Number(value);

  if (
    !Number.isSafeInteger(parsed) ||
    parsed < 0
  ) {
    return null;
  }

  return parsed;
}

function isSharedPreflightRow(
  value: unknown,
): value is SharedPreflightRow {
  if (!isRecord(value)) {
    return false;
  }

  const nullableUuid = (
    candidate: unknown,
  ): boolean =>
    candidate === null ||
    validUuid(candidate);

  const nullablePhone = (
    candidate: unknown,
  ): boolean =>
    candidate === null ||
    validPhone(candidate);

  return (
    nullableUuid(value.conversation_id) &&
    nullableUuid(value.reservation_request_id) &&
    nullablePhone(value.guest_phone) &&
    nullablePhone(value.restaurant_phone) &&
    (
      value.conversation_mode === null ||
      typeof value.conversation_mode === "string"
    ) &&
    (
      value.mode_version === null ||
      safeNonnegativeInteger(
        value.mode_version,
      ) !== null
    ) &&
    safeNonnegativeInteger(
      value.matching_conversation_count,
    ) !== null &&
    typeof value.association_valid === "boolean"
  );
}

export async function GET(
  _request: Request,
  context: RouteContext,
): Promise<NextResponse> {
  try {
    const { id } = await context.params;

    if (!validUuid(id)) {
      return fail(
        "Invalid reservation ID.",
        400,
      );
    }

    // --------------------------------------------------
    // 1. Authenticate the active manager.
    // --------------------------------------------------

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
      !validUuid(managerId)
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

    // --------------------------------------------------
    // 2. Validate trusted service configuration.
    // --------------------------------------------------

    const supabaseUrl =
      process.env.SUPABASE_URL ??
      process.env.NEXT_PUBLIC_SUPABASE_URL;

    const serviceKey =
      process.env.SUPABASE_SECRET_KEY ??
      process.env.SUPABASE_SERVICE_ROLE_KEY;

    const restaurantPhone =
      process.env.TWILIO_FROM_NUMBER;

    if (
      !supabaseUrl ||
      !serviceKey ||
      !validPhone(restaurantPhone)
    ) {
      return fail(
        "Shared SMS preflight is not configured.",
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

    // --------------------------------------------------
    // 3. Read the authoritative reservation.
    //
    // Direct SELECT is permitted for service_role.
    // --------------------------------------------------

    const {
      data: reservation,
      error: reservationError,
    } = await admin
      .from("reservation_requests")
      .select("id, customer_phone")
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

    const guestPhone =
      reservation.customer_phone;

    if (
      !validPhone(guestPhone) ||
      guestPhone === restaurantPhone
    ) {
      return fail(
        "Reservation phone association is invalid.",
        409,
      );
    }

    // --------------------------------------------------
    // 4. Read protected shared conversation state.
    //
    // IMPORTANT:
    //
    // reservation_shared_conversations does not grant
    // direct SELECT to service_role.
    //
    // Use the SECURITY DEFINER RPC instead.
    //
    // The RPC must:
    // - Be deployed and owned by the trusted DB role
    // - Permit service_role EXECUTE
    // - Return exactly one row
    // - Perform no database mutations
    //
    // No provisioning occurs here.
    // --------------------------------------------------

    const {
      data: rpcData,
      error: rpcError,
    } = await admin.rpc(
      "get_reservation_shared_transition_preflight",
      {
        p_reservation_id: id,
        p_restaurant_phone: restaurantPhone,
      },
    );

    if (rpcError) {
      console.error(
        "Shared transition preflight RPC failed.",
        {
          code: rpcError.code,
        },
      );

      return fail(
        "Shared conversation RPC verification failed.",
        503,
      );
    }

    if (
      !Array.isArray(rpcData) ||
      rpcData.length !== 1 ||
      !isSharedPreflightRow(rpcData[0])
    ) {
      return fail(
        "Shared conversation RPC returned an invalid result.",
        503,
      );
    }

    const shared = rpcData[0];

    const matchingConversationCount =
      safeNonnegativeInteger(
        shared.matching_conversation_count,
      );

    const modeVersion =
      shared.mode_version === null
        ? null
        : safeNonnegativeInteger(
            shared.mode_version,
          );

    if (
      matchingConversationCount === null ||
      (
        shared.mode_version !== null &&
        modeVersion === null
      )
    ) {
      return fail(
        "Shared conversation metadata is invalid.",
        503,
      );
    }

    const checks: Check[] = [];

    // --------------------------------------------------
    // 5. Verify association and automation mode.
    //
    // Treat the RPC's association_valid value as
    // necessary but not sufficient.
    //
    // Recheck all returned identifiers locally.
    // --------------------------------------------------

    const associationValid =
      shared.association_valid === true &&
      validUuid(shared.conversation_id) &&
      shared.reservation_request_id === id &&
      shared.guest_phone === guestPhone &&
      shared.restaurant_phone === restaurantPhone;

    checks.push({
      name: "shared_conversation_association",
      passed: associationValid,
      detail: associationValid
        ? "Conversation is associated with the selected reservation and phone pair."
        : "No matching provisioned conversation association was verified.",
    });

    const modeValid =
      associationValid &&
      shared.conversation_mode === "automation" &&
      modeVersion !== null &&
      modeVersion > 0;

    checks.push({
      name: "shared_automation_mode",
      passed: modeValid,
      detail: modeValid
        ? "Shared conversation is currently in automation mode."
        : "Shared conversation is not in a verified automation state.",
    });

    // --------------------------------------------------
    // 6. Check legacy ownership for this phone pair.
    //
    // Direct SELECT is permitted for service_role.
    //
    // Multiple matching rows are always ambiguous.
    // --------------------------------------------------

    const {
      data: legacyRows,
      error: legacyError,
    } = await admin
      .from("reservation_conversation_ownership")
      .select(
        "id, reservation_request_id, ownership_status",
      )
      .eq("guest_phone", guestPhone)
      .eq("restaurant_phone", restaurantPhone)
      .limit(2);

    if (
      legacyError ||
      !Array.isArray(legacyRows)
    ) {
      return fail(
        "Legacy ownership verification failed.",
        503,
      );
    }

    const legacyAmbiguous =
      legacyRows.length > 1;

    const legacyRow =
      legacyRows.length === 1 &&
      isRecord(legacyRows[0])
        ? legacyRows[0]
        : null;

    const legacyStatus =
      typeof legacyRow?.ownership_status === "string"
        ? legacyRow.ownership_status
        : null;

    const legacyAssociationValid =
      legacyRows.length === 0 ||
      (
        legacyRow !== null &&
        legacyRow.reservation_request_id === id
      );

    const legacyClear =
      !legacyAmbiguous &&
      legacyAssociationValid &&
      (
        legacyRows.length === 0 ||
        legacyStatus === "automation" ||
        legacyStatus === "released"
      );

    checks.push({
      name: "legacy_ownership_clear",
      passed: legacyClear,
      detail: legacyAmbiguous
        ? "Multiple legacy ownership records match the phone pair."
        : !legacyAssociationValid
          ? "Legacy ownership is associated with another reservation."
          : legacyClear
            ? "No conflicting active legacy ownership was found."
            : "Legacy ownership requires reconciliation before staff activation.",
    });

    // --------------------------------------------------
    // 7. Check reservation phone ambiguity.
    //
    // A phone number alone is not sufficient proof
    // of reservation identity.
    // --------------------------------------------------

    const {
      data: matchingReservations,
      error: matchingError,
    } = await admin
      .from("reservation_requests")
      .select("id")
      .eq("customer_phone", guestPhone)
      .limit(2);

    if (
      matchingError ||
      !Array.isArray(matchingReservations)
    ) {
      return fail(
        "Reservation ambiguity verification failed.",
        503,
      );
    }

    const uniqueReservationPhone =
      matchingReservations.length === 1 &&
      matchingReservations[0]?.id === id;

    checks.push({
      name: "reservation_phone_unambiguous",
      passed: uniqueReservationPhone,
      detail: uniqueReservationPhone
        ? "Only the selected reservation matches this guest phone."
        : "The phone number does not uniquely identify this reservation.",
    });

    // --------------------------------------------------
    // 8. Check shared phone-pair ambiguity.
    //
    // This count comes from the protected RPC.
    //
    // No direct query of
    // reservation_shared_conversations is performed.
    // --------------------------------------------------

    const uniqueSharedPhonePair =
      associationValid &&
      matchingConversationCount === 1;

    checks.push({
      name: "shared_phone_pair_unambiguous",
      passed: uniqueSharedPhonePair,
      detail: uniqueSharedPhonePair
        ? "Only the selected shared conversation matches the phone pair."
        : "Shared conversation routing for this phone pair is ambiguous or unverified.",
    });

    // --------------------------------------------------
    // 9. Verify Twilio Studio configuration.
    //
    // READ ONLY:
    // - Fetch Flow
    // - List active executions
    //
    // DO NOT:
    // - Stop executions
    // - Update executions
    // - Send SMS
    // --------------------------------------------------

    const accountSid =
      process.env.TWILIO_ACCOUNT_SID;

    const authToken =
      process.env.TWILIO_AUTH_TOKEN;

    const flowSid =
      process.env.TWILIO_STUDIO_FLOW_SID;

    if (
      !accountSid ||
      !ACCOUNT_SID.test(accountSid) ||
      !authToken ||
      !flowSid ||
      !FLOW_SID.test(flowSid)
    ) {
      return fail(
        "Twilio Studio preflight is not configured.",
        503,
      );
    }

    const client = twilio(
      accountSid,
      authToken,
    );

    const flow = await client.studio.v2
      .flows(flowSid)
      .fetch();

    const published =
      flow.sid === flowSid &&
      flow.status === "published";

    checks.push({
      name: "studio_flow_published",
      passed: published,
      detail: published
        ? "Configured Studio Flow is published."
        : "Configured Studio Flow is not verified as published.",
    });

    let activeExecutionCount:
      number | null = null;

    let studioReconciliation:
      StudioExecutionReconciliation | null = null;

    if (published) {
      const executions = await client.studio.v2
        .flows(flowSid)
        .executions.list({
          status: "active",
          limit: SHARED_STUDIO_EXECUTION_SCAN_LIMIT,
        });

      const reconciliation =
        reconcileSharedStudioExecutions(
          executions,
          guestPhone,
          flowSid,
        );

      studioReconciliation = reconciliation;

      if (
        reconciliation.status === "clear" ||
        reconciliation.status === "active"
      ) {
        activeExecutionCount =
          reconciliation.executionCount;
      }

      checks.push({
        name: "studio_active_execution_scan",
        passed:
          reconciliation.status === "clear",
        detail:
          reconciliation.status === "incomplete"
            ? "Studio execution scan reached its limit and cannot be considered complete."
            : reconciliation.status === "invalid"
              ? "Studio execution identity was inconsistent."
              : reconciliation.status === "unavailable"
                ? "Studio execution scan was unavailable."
                : reconciliation.status === "clear"
                  ? "No active execution was observed for this guest during this scan."
                  : "One or more active Studio executions were observed for this guest.",
      });
    } else {
      checks.push({
        name: "studio_active_execution_scan",
        passed: false,
        detail:
          "Execution scan was not performed because the configured Flow was not verified.",
      });
    }

    // --------------------------------------------------
    // 10. Return diagnostic findings.
    //
    // Passing read-only checks does not authorize
    // a future staff takeover.
    //
    // Any state-changing coordinator must repeat
    // critical checks at transition time.
    //
    // Twilio Studio and Supabase do not share an
    // atomic transaction.
    // --------------------------------------------------

    const checksPassed =
      checks.every(
        (check) => check.passed,
      );

    const handoffPlan =
      planSharedStaffHandoff({
        checks,
        studio: studioReconciliation,
      });

    return respond({
      success: true,
      reservationId: id,
      conversationId: associationValid
        ? shared.conversation_id
        : null,
      sharedMode:
        shared.conversation_mode,
      modeVersion,
      matchingConversationCount,
      legacyStatus,
      activeStudioExecutions:
        activeExecutionCount,
      checksPassed,
      activationAuthorized: false,
      smsSent: false,
      studioExecutionsChanged: false,
      databaseChanged: false,
      handoffPlan,
      checks,
    });
  } catch (caught) {
    console.error(
      "Shared staff transition preflight failed.",
      {
        errorName:
          caught instanceof Error
            ? caught.name
            : "UnknownError",
      },
    );

    return fail(
      "Unable to complete shared staff transition preflight.",
      503,
    );
  }
}