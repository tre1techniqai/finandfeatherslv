import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { dispatchReservationConfirmation } from "@/lib/reservations/dispatch-reservation-confirmation";
import { dispatchReservationAlternatives } from "@/lib/reservations/dispatch-reservation-alternatives";

const MAX_BODY_BYTES = 8192;

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const TIME_PATTERN =
  /^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/;

const UNSUPPORTED_CONTROLS =
  /[\u0000-\u001F\u007F-\u009F]/u;

const ALLOWED_ACTIONS = [
  "approve_availability",
  "decline_availability",
  "propose_alternatives",
  "send_alternatives",
  "record_alternative_offer",
  "accept_alternative",
  "verify_deposit",
  "confirm_yelp_booking",
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
      return Object.keys(payload).length === 0;

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

    case "confirm_yelp_booking":
      // The database retrieves the guest phone number as the Yelp lookup
      // reference. Large-party confirmation requires staff acknowledgment
      // that the deposit payment link has been emailed, not that it was paid.
      // The database independently checks whether the acknowledgment is needed.
      return (
        Object.keys(payload).length === 0 ||
        (Object.keys(payload).length === 1 &&
          payload.deposit_link_sent === true)
      );

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
    !staffRole.is_active ||
    staffRole.role !== "manager"
  ) {
    return jsonError("Manager access required.", 403);
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

  // Send the previously saved alternative times.
  // The authenticated manager has already been verified above.
  // The dispatcher performs independent reservation checks and
  // uses database claims to prevent duplicate SMS requests.
  if (validatedAction === "send_alternatives") {
    return dispatchReservationAlternatives(supabase, id);
  }

  // The database function independently checks manager authorization
  // and enforces reservation state transitions.
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
      return jsonError("Manager access required.", 403);
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

  // Record the reservation confirmation first; SMS delivery must never undo
  // a confirmed reservation. All other actions retain their existing behavior.
  if (validatedAction !== "confirm_yelp_booking") {
    return NextResponse.json(
      { success: true, reservation: result },
      { headers: { "Cache-Control": "no-store" } },
    );
  }

  // Dispatch within this authenticated server request, not via a second
  // browser action or a fire-and-forget task. The shared dispatcher checks
  // the confirmed state and atomically claims the queued notification.
  try {
    const dispatchResponse = await dispatchReservationConfirmation(supabase, id);
    const rawDispatchResult: unknown = await dispatchResponse.json();
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
      console.error("Automatic guest confirmation not verified:", {
        reservationId: id,
        httpStatus: dispatchResponse.status,
        failureCode:
          typeof dispatchResult.failureCode === "string"
            ? dispatchResult.failureCode
            : "DISPATCH_NOT_VERIFIED",
      });
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
            accepted && typeof dispatchResult.messageSid === "string"
              ? dispatchResult.messageSid
              : null,
          failureCode:
            !accepted && typeof dispatchResult.failureCode === "string"
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
    console.error("Automatic confirmation dispatch failed unexpectedly:", {
      reservationId: id,
      errorName: error instanceof Error ? error.name : "UnknownError",
    });

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
          message: "Reservation confirmed, but SMS status could not be verified. Check notification status before any retry.",
        },
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  }
}