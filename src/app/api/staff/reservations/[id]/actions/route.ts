import { NextResponse } from "next/server";
import twilio from "twilio";
import { decideArchiveStudioEligibility } from "@/lib/reservations/archive-studio-eligibility";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isReservationStaffRole } from "@/lib/auth/require-reservation-staff";
import { dispatchReservationConfirmation } from "@/lib/reservations/dispatch-reservation-confirmation";
import { dispatchReservationAlternatives } from "@/lib/reservations/dispatch-reservation-alternatives";
import { dispatchReservationDepositDecision } from "@/lib/reservations/dispatch-reservation-deposit-decision";
const MAX_BODY_BYTES = 8192;
const TWILIO_ACCOUNT_SID_PATTERN = /^AC[0-9a-f]{32}$/i;
const TWILIO_FLOW_SID_PATTERN = /^FW[0-9a-f]{32}$/i;
const TWILIO_EXECUTION_SID_PATTERN = /^FN[0-9a-f]{32}$/i;
const E164_PATTERN = /^\+[1-9]\d{7,14}$/;
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const TIME_PATTERN =
  /^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/;
const UNSUPPORTED_CONTROLS =
  /[\u0000-\u001F\u007F-\u009F]/u;
const ALLOWED_ACTIONS = [
  "approve_availability",
  "decline_availability",
  "propose_alternatives",
  "send_alternatives",
  "send_deposit_decision",
  "record_alternative_offer",
  "accept_alternative",
  "verify_deposit",
  "waive_deposit",
  "confirm_yelp_booking",
  "close_reservation",
  "archive_reservation",
] as const;
type ActionKey = (typeof ALLOWED_ACTIONS)[number];
type RouteContext = {
  params: Promise<{ id: string }>;
};
type ActionRequest = {
  action?: unknown;
  payload?: unknown;
};
type JsonObject = Record<string, unknown>;
function jsonError(message: string, status: number) {
  return NextResponse.json(
    {
      success: false,
      error: message,
    },
    {
      status,
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
function hasValidOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    const source = new URL(origin);
    const target = new URL(request.url);
    return (
      source.origin === target.origin &&
      (
        source.protocol === "https:" ||
        source.hostname === "localhost" ||
        source.hostname === "127.0.0.1"
      )
    );
  } catch {
    return false;
  }
}
function isPlainObject(value: unknown): value is JsonObject {
  return (
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value)
  );
}
function isValidTime(value: unknown): value is string {
  if (typeof value !== "string") return false;
  if (!TIME_PATTERN.test(value)) return false;
  const [hours, minutes] = value.split(":").map(Number);
  return (
    hours >= 10 &&
    hours <= 22 &&
    (minutes === 0 || minutes === 30) &&
    !(hours === 22 && minutes !== 0)
  );
}
function isValidEvidence(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.trim().length >= 10 &&
    value.trim().length <= 500 &&
    !UNSUPPORTED_CONTROLS.test(value)
  );
}
function isValidChannel(value: unknown): value is string {
  return (
    value === "sms" ||
    value === "phone" ||
    value === "email" ||
    value === "in_person"
  );
}
function validatePayload(
  action: ActionKey,
  payload: JsonObject,
): boolean {
  switch (action) {
    case "approve_availability":
    case "decline_availability":
    case "close_reservation":
      return Object.keys(payload).length === 0;
    case "archive_reservation": {
      const keys = Object.keys(payload);

      if (
        payload.outcome !== "seated" &&
        payload.outcome !== "no_show" &&
        payload.outcome !== "canceled" &&
        payload.outcome !== "walk_in"
      ) {
        return false;
      }

      if (payload.outcome !== "canceled") {
        return (
          keys.length === 1 &&
          keys[0] === "outcome"
        );
      }
      return (
        keys.length === 2 &&
        Object.prototype.hasOwnProperty.call(
          payload,
          "outcome",
        ) &&
        Object.prototype.hasOwnProperty.call(
          payload,
          "yelp_cancellation_acknowledged",
        ) &&
        typeof payload.yelp_cancellation_acknowledged === "boolean"
      ) || (
        keys.length === 1 &&
        keys[0] === "outcome"
      );
    }
    case "propose_alternatives": {
      if (
        Object.keys(payload).length !== 1 ||
        !Array.isArray(payload.times) ||
        payload.times.length < 1 ||
        payload.times.length > 3
      ) {
        return false;
      }
      if (!payload.times.every(isValidTime)) {
        return false;
      }
      return new Set(payload.times).size === payload.times.length;
    }
    case "send_alternatives":
    case "send_deposit_decision":
      return Object.keys(payload).length === 0;
    case "record_alternative_offer":
      return (
        Object.keys(payload).length === 3 &&
        payload.offer_communicated === true &&
        isValidChannel(payload.offer_channel) &&
        isValidEvidence(payload.offer_evidence)
      );
    case "accept_alternative":
      return (
        Object.keys(payload).length === 4 &&
        isValidTime(payload.accepted_time) &&
        payload.guest_acceptance_verified === true &&
        isValidChannel(payload.acceptance_channel) &&
        isValidEvidence(payload.acceptance_evidence)
      );
    case "verify_deposit":
      return (
        Object.keys(payload).length === 1 &&
        payload.payment_independently_verified === true
      );
    case "waive_deposit":
      return (
        Object.keys(payload).length === 1 &&
        typeof payload.waiver_reason === "string" &&
        payload.waiver_reason.trim() === payload.waiver_reason &&
        payload.waiver_reason.length >= 10 &&
        payload.waiver_reason.length <= 500 &&
        !UNSUPPORTED_CONTROLS.test(payload.waiver_reason)
      );
    case "confirm_yelp_booking": {
      const keys = Object.keys(payload);
      if (keys.length === 0) return true;
      if (keys.length === 1) {
        return payload.deposit_link_sent === true;
      }
      return (
        keys.length === 2 &&
        Object.prototype.hasOwnProperty.call(
          payload,
          "deposit_waived",
        ) &&
        Object.prototype.hasOwnProperty.call(
          payload,
          "waiver_reason",
        ) &&
        payload.deposit_waived === true &&
        typeof payload.waiver_reason === "string" &&
        payload.waiver_reason.length >= 10 &&
        payload.waiver_reason.length <= 500 &&
        payload.waiver_reason.trim() === payload.waiver_reason &&
        !UNSUPPORTED_CONTROLS.test(payload.waiver_reason)
      );
    }
    default:
      return false;
  }
}
async function readLimitedJson(
  request: Request,
): Promise<
  | { success: true; body: ActionRequest }
  | { success: false; status: number; message: string }
> {
  const declaredLength = request.headers.get("content-length");
  if (declaredLength !== null) {
    const length = Number(declaredLength);
    if (!Number.isSafeInteger(length) || length < 0) {
      return {
        success: false,
        status: 400,
        message: "Invalid Content-Length header.",
      };
    }
    if (length > MAX_BODY_BYTES) {
      return {
        success: false,
        status: 413,
        message: "Request body exceeds 8 KB.",
      };
    }
  }
  if (!request.body) {
    return {
      success: false,
      status: 400,
      message: "JSON request body required.",
    };
  }
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      totalBytes += value.byteLength;
      if (totalBytes > MAX_BODY_BYTES) {
        await reader.cancel();
        return {
          success: false,
          status: 413,
          message: "Request body exceeds 8 KB.",
        };
      }
      chunks.push(value);
    }
    const bytes = new Uint8Array(totalBytes);
    let offset = 0;
    for (const chunk of chunks) {
      bytes.set(chunk, offset);
      offset += chunk.byteLength;
    }
    const parsed: unknown = JSON.parse(
      new TextDecoder("utf-8", {
        fatal: true,
      }).decode(bytes),
    );
    if (!isPlainObject(parsed)) {
      return {
        success: false,
        status: 400,
        message: "Invalid JSON object.",
      };
    }
    return {
      success: true,
      body: parsed as ActionRequest,
    };
  } catch {
    return {
      success: false,
      status: 400,
      message: "Invalid JSON request.",
    };
  } finally {
    reader.releaseLock();
  }
}
export async function POST(
  request: Request,
  context: RouteContext,
) {
  if (
    process.env.RESERVATION_STAFF_ACTIONS_ENABLED !== "true"
  ) {
    return jsonError(
      "Reservation staff actions are not enabled.",
      503,
    );
  }
  if (!hasValidOrigin(request)) {
    return jsonError(
      "Request origin is not authorized.",
      403,
    );
  }
  const { id } = await context.params;
  if (!UUID_PATTERN.test(id)) {
    return jsonError("Invalid reservation ID.", 400);
  }
  const supabase = await createSupabaseServerClient();
  const {
    data: claimsData,
    error: claimsError,
  } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;
  if (claimsError || !userId) {
    return jsonError("Authentication required.", 401);
  }
  const { data: staffRole, error: roleError } = await supabase
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
    return jsonError(
      "Active reservation staff access required.",
      403,
    );
  }
  const contentType =
    request.headers.get("content-type") ?? "";
  if (!/^application\/json(?:\s*;|$)/i.test(contentType)) {
    return jsonError(
      "JSON request body required.",
      415,
    );
  }
  const parsed = await readLimitedJson(request);
  if (!parsed.success) {
    return jsonError(parsed.message, parsed.status);
  }
  const { action, payload } = parsed.body;
  if (
    typeof action !== "string" ||
    !ALLOWED_ACTIONS.includes(action as ActionKey)
  ) {
    return jsonError(
      "Unsupported reservation action.",
      400,
    );
  }
  const validatedAction = action as ActionKey;
  const validatedPayload =
    payload === undefined ? {} : payload;
  if (
    !isPlainObject(validatedPayload) ||
    !validatePayload(validatedAction, validatedPayload)
  ) {
    return jsonError(
      "Invalid reservation action details.",
      400,
    );
  }
  // Manager-only authorization is enforced independently here
  // and in the database RPC.
  if (
    (validatedAction === "waive_deposit" ||
      (validatedAction === "confirm_yelp_booking" &&
        validatedPayload.deposit_waived === true)) &&
    staffRole.role !== "manager"
  ) {
    return jsonError(
      "Manager approval required to waive a deposit.",
      403,
    );
  }
  if (validatedAction === "archive_reservation") {
    if (
      process.env.RESERVATION_ARCHIVE_ENABLED !== "true"
    ) {
      return jsonError(
        "Reservation archiving is not yet enabled.",
        503,
      );
    }
    // Fail closed unless the target reservation's own Studio execution
    // is verified to have ended. Never infer ownership from the phone alone.
    const { data: reservation, error: reservationError } =
      await supabase
        .from("reservation_requests")
        .select("id, customer_phone, twilio_execution_sid, request_status")
        .eq("id", id)
        .maybeSingle();
    if (reservationError) {
      console.error("Archive Studio preflight reservation lookup failed:", {
        reservationId: id,
        code: reservationError.code,
      });
      return jsonError("Unable to verify reservation Studio status.", 503);
    }
    if (!reservation) {
      return jsonError("Reservation not found.", 404);
    }
    if (reservation.request_status === "closed") {
      return jsonError("Reservation is already archived.", 409);
    }
    if (
      reservation.id !== id ||
      typeof reservation.customer_phone !== "string" ||
      !E164_PATTERN.test(reservation.customer_phone) ||
      typeof reservation.twilio_execution_sid !== "string" ||
      !TWILIO_EXECUTION_SID_PATTERN.test(reservation.twilio_execution_sid)
    ) {
      return jsonError(
        "Reservation Studio execution identity cannot be verified.",
        409,
      );
    }
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const flowSid = process.env.TWILIO_STUDIO_FLOW_SID;
    if (
      !accountSid ||
      !TWILIO_ACCOUNT_SID_PATTERN.test(accountSid) ||
      !authToken ||
      !flowSid ||
      !TWILIO_FLOW_SID_PATTERN.test(flowSid)
    ) {
      return jsonError("Studio execution verification is not configured.", 503);
    }
    let execution;
    try {
      const client = twilio(accountSid, authToken);
      execution = await client.studio.v2
        .flows(flowSid)
        .executions(reservation.twilio_execution_sid)
        .fetch();
    } catch (caught) {
      console.error("Archive Studio execution verification failed:", {
        reservationId: id,
        errorName: caught instanceof Error ? caught.name : "UnknownError",
      });
      return jsonError(
        "Unable to verify that the reservation's Studio execution has ended.",
        503,
      );
    }
    const studioDecision = decideArchiveStudioEligibility({
      expectedExecutionSid: reservation.twilio_execution_sid,
      expectedFlowSid: flowSid,
      expectedGuestPhone: reservation.customer_phone,
      execution,
    });
    if (!studioDecision.eligible) {
      return jsonError(
        studioDecision.reason === "EXECUTION_NOT_ENDED"
          ? "Reservation cannot be archived until its Studio execution has ended and been verified."
          : "Studio execution identity or availability could not be verified for this reservation.",
        409,
      );
    }
    // The archive RPC performs authoritative, locked reservation/SMS/
    // notification checks. This external preflight is not an atomic Studio fence.
    const { data: archiveData, error: archiveError } =
      await supabase.rpc("archive_reservation", {
        p_reservation_id: id,
        p_outcome: validatedPayload.outcome as string,
        p_yelp_cancellation_acknowledged:
          validatedPayload.yelp_cancellation_acknowledged === true,
      });
    if (archiveError) {
      if (archiveError.code === "42501") {
        return jsonError(
          "Reservation staff authorization required.",
          403,
        );
      }
      if (archiveError.code === "P0002") {
        return jsonError(
          "Reservation not found.",
          404,
        );
      }
      if (archiveError.code === "22023") {
        return jsonError(
          "Archiving was rejected. Check the reservation status, selected outcome, and Yelp cancellation acknowledgment.",
          409,
        );
      }
      if (archiveError.code === "55000") {
        return jsonError(
          "An unresolved SMS or notification dispatch prevents archiving. Reconcile messaging activity before retrying.",
          409,
        );
      }
      if (archiveError.code === "54000") {
        return jsonError(
          "Reservation activity limit reached.",
          409,
        );
      }
      console.error("Reservation archive failed:", {
        reservationId: id,
        code: archiveError.code,
      });
      return jsonError(
        "Unable to archive reservation.",
        500,
      );
    }
    const archived = Array.isArray(archiveData)
      ? archiveData[0]
      : archiveData;
    if (
      !archived ||
      archived.reservation_id !== id ||
      archived.archived_status !== "closed" ||
      archived.archive_outcome !== validatedPayload.outcome
    ) {
      return jsonError(
        "Archive result could not be verified. Review reservation status before trying again.",
        500,
      );
    }
    return NextResponse.json(
      {
        success: true,
        archive: archived,
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  }
  if (validatedAction === "send_alternatives") {
    return dispatchReservationAlternatives(supabase, id);
  }
  // Send the separate deposit-decision SMS only on explicit staff action.
  // The dispatcher enforces its own feature flag, eligibility checks,
  // notification claim lifecycle, and no-automatic-resend policy.
  if (validatedAction === "send_deposit_decision") {
    return dispatchReservationDepositDecision(supabase, id);
  }
  const { data, error } = await supabase.rpc(
    "apply_reservation_staff_action",
    {
      p_reservation_id: id,
      p_action: validatedAction,
      p_payload: validatedPayload,
    },
  );
  if (error) {
    if (error.code === "42501") {
      return jsonError(
        "Reservation staff access required.",
        403,
      );
    }
    if (error.code === "P0002") {
      return jsonError("Reservation not found.", 404);
    }
    if (error.code === "22023") {
      return jsonError(
        "Reservation action rejected. Check the reservation's current status and required information.",
        409,
      );
    }
    if (error.code === "54000") {
      return jsonError(
        "Reservation activity limit reached. Contact an administrator.",
        409,
      );
    }
    console.error("Reservation staff action failed:", {
      code: error.code,
      message: error.message,
      action: validatedAction,
      reservationId: id,
    });
    return jsonError(
      "Unable to process reservation action.",
      500,
    );
  }
  const result = Array.isArray(data) ? data[0] : data;
  if (!result) {
    return jsonError(
      "Reservation action returned no result.",
      500,
    );
  }
  // An approved waiver is saved before notification dispatch.
  // SMS failure must never be reported as waiver-approval failure.
  if (validatedAction === "waive_deposit") {
    try {
      const dispatchResponse =
        await dispatchReservationDepositDecision(
          supabase,
          id,
          "waiver",
        );
      const rawDispatchResult: unknown =
        await dispatchResponse.json();
      const dispatchResult =
        rawDispatchResult !== null &&
        typeof rawDispatchResult === "object" &&
        !Array.isArray(rawDispatchResult)
          ? (rawDispatchResult as Record<string, unknown>)
          : {};
      const accepted =
        dispatchResponse.ok &&
        dispatchResult.success === true &&
        dispatchResult.accepted === true;
      if (!accepted) {
        console.error(
          "Automatic courtesy-waiver SMS not verified:",
          {
            reservationId: id,
            httpStatus: dispatchResponse.status,
            failureCode:
              typeof dispatchResult.failureCode === "string"
                ? dispatchResult.failureCode
                : "WAIVER_NOTIFICATION_NOT_VERIFIED",
          },
        );
      }
      return NextResponse.json(
        {
          success: true,
          reservation: result,
          notification: {
            attempted: true,
            accepted,
            status: accepted ? "sent" : "needs_attention",
            messageSid:
              accepted &&
              typeof dispatchResult.messageSid === "string"
                ? dispatchResult.messageSid
                : null,
            failureCode:
              !accepted &&
              typeof dispatchResult.failureCode === "string"
                ? dispatchResult.failureCode
                : !accepted
                  ? "WAIVER_NOTIFICATION_NOT_VERIFIED"
                  : null,
            message: accepted
              ? "Deposit waiver approved. Twilio accepted the courtesy SMS. Handset delivery is not yet verified."
              : "Deposit waiver approved, but courtesy SMS acceptance was not verified. Review Twilio and notification history; do not resend automatically.",
          },
        },
        { headers: { "Cache-Control": "no-store" } },
      );
    } catch (error) {
      console.error(
        "Automatic courtesy-waiver dispatch failed:",
        {
          reservationId: id,
          errorName:
            error instanceof Error
              ? error.name
              : "UNKNOWN_ERROR",
        },
      );
      return NextResponse.json(
        {
          success: true,
          reservation: result,
          notification: {
            attempted: true,
            accepted: false,
            status: "needs_attention",
            messageSid: null,
            failureCode: "WAIVER_DISPATCH_EXCEPTION",
            message:
              "Deposit waiver approved, but the courtesy SMS outcome requires review. Do not resend automatically.",
          },
        },
        { headers: { "Cache-Control": "no-store" } },
      );
    }
  }
  // Other non-confirmation actions retain existing behavior.
  // Final Yelp confirmation retains its existing SMS dispatch.
  if (validatedAction !== "confirm_yelp_booking") {
    return NextResponse.json(
      { success: true, reservation: result },
      { headers: { "Cache-Control": "no-store" } },
    );
  }
  try {
    const dispatchResponse =
      await dispatchReservationConfirmation(supabase, id);
    const rawDispatchResult: unknown =
      await dispatchResponse.json();
    const dispatchResult =
      rawDispatchResult !== null &&
      typeof rawDispatchResult === "object" &&
      !Array.isArray(rawDispatchResult)
        ? (rawDispatchResult as Record<string, unknown>)
        : {};
    const accepted =
      dispatchResponse.ok &&
      dispatchResult.success === true &&
      dispatchResult.accepted === true;
    if (!accepted) {
      console.error(
        "Automatic guest confirmation not verified:",
        {
          reservationId: id,
          httpStatus: dispatchResponse.status,
          failureCode:
            typeof dispatchResult.failureCode === "string"
              ? dispatchResult.failureCode
              : "DISPATCH_NOT_VERIFIED",
        },
      );
    }
    return NextResponse.json(
      {
        success: true,
        reservation: result,
        notification: {
          attempted: true,
          accepted,
          status: accepted ? "sent" : "needs_attention",
          messageSid:
            accepted &&
            typeof dispatchResult.messageSid === "string"
              ? dispatchResult.messageSid
              : null,
          failureCode:
            !accepted &&
            typeof dispatchResult.failureCode === "string"
              ? dispatchResult.failureCode
              : null,
          message: accepted
            ? "Twilio accepted the guest confirmation SMS. Handset delivery is not yet verified."
            : "Reservation confirmed, but the guest SMS was not verified. Review notification status and Twilio logs; do not resend automatically.",
        },
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error(
      "Automatic confirmation dispatch failed unexpectedly:",
      {
        reservationId: id,
        errorName:
          error instanceof Error
            ? error.name
            : "UnknownError",
      },
    );
    return NextResponse.json(
      {
        success: true,
        reservation: result,
        notification: {
          attempted: true,
          accepted: false,
          status: "needs_attention",
          messageSid: null,
          failureCode: "DISPATCH_EXCEPTION",
          message:
            "Reservation confirmed, but SMS status could not be verified. Check notification status before any retry.",
        },
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  }
}