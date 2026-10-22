import { createHmac } from "node:crypto";
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const E164_PATTERN = /^\+[1-9]\d{7,14}$/;

const MESSAGE_SID_PATTERN = /^SM[0-9a-f]{32}$/i;

const MAX_MESSAGE_LENGTH = 1000;

type RouteContext = {
  params: Promise<{ id: string }>;
};

type Reservation = {
  id: string;
  customer_name: string | null;
  customer_phone: string;
  reservation_date: string | null;
  reservation_time: string | null;
  party_size: number | null;
  request_status: string;
  details_validated: boolean;
};

type Workflow = {
  workflow_status: string;
  accepted_time: string | null;
  yelp_confirmation_number: string | null;
};

type Notification = {
  id: string;
  event_key: string;
  notification_type: string;
  notification_status: string;
  twilio_message_sid: string | null;
  dispatch_token: string | null;
};

type ClaimResult = {
  notification_event_id: string;
  notification_event_key: string;
  claim_token: string;
};

type TwilioResult = {
  success?: boolean;
  accepted?: boolean;
  messageSid?: string;
  messageStatus?: string;
  eventKey?: string;
  error?: string;
};

const TWILIO_FAILURE_CODES = [
  "SECRET_NOT_CONFIGURED",
  "AUTHENTICATION_FAILED",
  "REQUEST_TIMESTAMP_EXPIRED",
  "INVALID_EVENT_KEY",
  "INVALID_RECIPIENT",
  "INVALID_MESSAGE",
  "SENDER_NOT_CONFIGURED",
  "TWILIO_SEND_FAILED",
  "MESSAGE_SID_MISSING",
  "UNEXPECTED_ERROR",
] as const;

function safeFailureCode(value: unknown): string {
  return typeof value === "string" &&
    (TWILIO_FAILURE_CODES as readonly string[]).includes(value)
    ? value
    : "UNRECOGNIZED_TWILIO_RESPONSE";
}

class DispatchError extends Error {
  constructor(readonly code: string) {
    super(code);
    this.name = "DispatchError";
  }
}


function jsonError(message: string, status: number) {
  return NextResponse.json(
    { success: false, error: message },
    {
      status,
      headers: { "Cache-Control": "no-store" },
    },
  );
}

function sameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");

  if (!origin) return false;

  try {
    const source = new URL(origin);
    const destination = new URL(request.url);

    return (
      source.origin === destination.origin &&
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

function formatDate(value: string): string {
  const date = new Date(`${value}T12:00:00Z`);

  if (Number.isNaN(date.getTime())) {
    throw new Error("Invalid reservation date.");
  }

  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

function formatTime(value: string): string {
  const match = /^(\d{2}):(\d{2})(?::\d{2})?$/.exec(value);

  if (!match) {
    throw new Error("Invalid reservation time.");
  }

  const hours = Number(match[1]);
  const minutes = Number(match[2]);

  if (hours > 23 || minutes > 59) {
    throw new Error("Invalid reservation time.");
  }

  return (
    `${hours % 12 || 12}:${match[2]} ` +
    (hours >= 12 ? "PM" : "AM")
  );
}

function buildConfirmationMessage(
  reservation: Reservation,
  workflow: Workflow,
): string {
  if (
    !reservation.customer_name?.trim() ||
    !reservation.reservation_date ||
    !reservation.reservation_time ||
    !reservation.party_size ||
    !workflow.yelp_confirmation_number?.trim()
  ) {
    throw new Error("Missing confirmed reservation details.");
  }

  const finalTime =
    workflow.accepted_time ?? reservation.reservation_time;

  const guestName = reservation.customer_name.trim();
  const date = formatDate(reservation.reservation_date);
  const time = formatTime(finalTime);

  const message = [
    "Fin & Feathers Las Vegas",
    "",
    `Hello ${guestName}! Your reservation is CONFIRMED.`,
    "",
    `Date: ${date}`,
    `Time: ${time}`,
    `Party Size: ${reservation.party_size}`,
    `Confirmation #: ${workflow.yelp_confirmation_number.trim()}`,
    "",
    "We look forward to welcoming you!",
  ].join("\n");

  if (message.length > MAX_MESSAGE_LENGTH) {
    throw new Error("Confirmation message is too long.");
  }

  return message;
}

function getDispatcherConfig() {
  const secret = process.env.RESERVATION_CONFIRMATION_SECRET;
  const functionUrl =
    process.env.RESERVATION_CONFIRMATION_FUNCTION_URL;

  if (!secret || !/^[a-f0-9]{64}$/i.test(secret)) {
    return null;
  }

  if (!functionUrl) {
    return null;
  }

  try {
    const parsedUrl = new URL(functionUrl);

    if (
      parsedUrl.protocol !== "https:" ||
      parsedUrl.username ||
      parsedUrl.password ||
      parsedUrl.search ||
      parsedUrl.hash ||
      !parsedUrl.pathname.endsWith(
        "/send-reservation-confirmation",
      )
    ) {
      return null;
    }

    return {
      secret,
      functionUrl: parsedUrl.toString(),
    };
  } catch {
    return null;
  }
}

async function sendToTwilio(
  config: {
    secret: string;
    functionUrl: string;
  },
  eventKey: string,
  to: string,
  body: string,
): Promise<TwilioResult> {
  const timestamp = String(Math.floor(Date.now() / 1000));

  // Must match buildSignedContent() in the Twilio Function.
  const signedPayload = JSON.stringify({
    eventKey,
    to,
    body,
  });

  const signature = createHmac(
    "sha256",
    Buffer.from(config.secret, "hex"),
  )
    .update(`${timestamp}.${signedPayload}`)
    .digest("hex");

  // Twilio Functions exposes submitted form fields through `event`.
  const form = new URLSearchParams({
    timestamp,
    signature,
    eventKey,
    to,
    body,
  });

  const response = await fetch(config.functionUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: form.toString(),
    cache: "no-store",
    signal: AbortSignal.timeout(15000),
  });

  if (!response.ok) {
    throw new DispatchError(`TWILIO_FUNCTION_HTTP_${response.status}`);
  }

  let parsed: unknown;
  try {
    parsed = await response.json();
  } catch {
    throw new DispatchError("TWILIO_INVALID_JSON_RESPONSE");
  }

  if (
    !parsed ||
    typeof parsed !== "object" ||
    Array.isArray(parsed)
  ) {
    throw new DispatchError("TWILIO_INVALID_RESPONSE");
  }

  return parsed as TwilioResult;
}

export async function POST(
  request: Request,
  context: RouteContext,
) {
  if (
    process.env.RESERVATION_CONFIRMATION_SEND_ENABLED !== "true"
  ) {
    return jsonError(
      "Guest confirmation SMS sending is not enabled.",
      503,
    );
  }

  if (!sameOrigin(request)) {
    return jsonError("Request origin is not authorized.", 403);
  }

  const { id } = await context.params;

  if (!UUID_PATTERN.test(id)) {
    return jsonError("Invalid reservation ID.", 400);
  }

  const config = getDispatcherConfig();

  if (!config) {
    return jsonError(
      "Outbound confirmation messaging is not configured.",
      503,
    );
  }

  const supabase = await createSupabaseServerClient();

  const { data: claimsData, error: claimsError } =
    await supabase.auth.getClaims();

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
    staffRole.role !== "manager" ||
    !staffRole.is_active
  ) {
    return jsonError("Manager access required.", 403);
  }

  const { data: reservationData, error: reservationError } =
    await supabase
      .from("reservation_requests")
      .select(
        [
          "id",
          "customer_name",
          "customer_phone",
          "reservation_date",
          "reservation_time",
          "party_size",
          "request_status",
          "details_validated",
        ].join(","),
      )
      .eq("id", id)
      .maybeSingle();

  if (reservationError) {
    return jsonError("Unable to load reservation.", 500);
  }

  const reservation =
    reservationData as Reservation | null;

  if (!reservation) {
    return jsonError("Reservation not found.", 404);
  }

  if (
    reservation.request_status !== "confirmed" ||
    !reservation.details_validated
  ) {
    return jsonError(
      "Reservation must be confirmed before notifying the guest.",
      409,
    );
  }

  if (!E164_PATTERN.test(reservation.customer_phone)) {
    return jsonError(
      "Reservation has no valid SMS destination.",
      409,
    );
  }

  const { data: workflowData, error: workflowError } =
    await supabase
      .from("reservation_staff_workflows")
      .select(
        "workflow_status, accepted_time, yelp_confirmation_number",
      )
      .eq("reservation_request_id", id)
      .maybeSingle();

  if (workflowError) {
    return jsonError("Unable to load booking workflow.", 500);
  }

  const workflow = workflowData as Workflow | null;

  if (!workflow || workflow.workflow_status !== "confirmed") {
    return jsonError(
      "Yelp booking confirmation is required.",
      409,
    );
  }

  const { data: notificationData, error: notificationError } =
    await supabase
      .from("reservation_notification_events")
      .select(
        [
          "id",
          "event_key",
          "notification_type",
          "notification_status",
          "twilio_message_sid",
          "dispatch_token",
        ].join(","),
      )
      .eq("reservation_request_id", id)
      .eq("notification_type", "reservation_confirmed")
      .maybeSingle();

  if (notificationError) {
    return jsonError(
      "Unable to load guest notification.",
      500,
    );
  }

  const notification =
    notificationData as Notification | null;

  if (!notification) {
    return jsonError(
      "Guest confirmation notification not found.",
      404,
    );
  }

  if (
    notification.notification_status !== "pending" ||
    notification.twilio_message_sid !== null ||
    notification.dispatch_token !== null
  ) {
    return jsonError(
      "This confirmation notification has already been processed or claimed.",
      409,
    );
  }

  const expectedEventKey = `reservation_confirmed:${id}`;

  if (notification.event_key !== expectedEventKey) {
    return jsonError(
      "Notification event does not match the reservation.",
      409,
    );
  }

  let messageBody: string;

  try {
    messageBody = buildConfirmationMessage(
      reservation,
      workflow,
    );
  } catch {
    return jsonError(
      "Confirmed reservation details are incomplete.",
      409,
    );
  }

  // Claim only after all local preflight checks succeed.
  const { data: claimData, error: claimError } =
    await supabase.rpc("claim_reservation_confirmation", {
      p_reservation_id: id,
    });

  if (claimError) {
    if (claimError.code === "42501") {
      return jsonError("Manager access required.", 403);
    }

    if (claimError.code === "22023") {
      return jsonError(
        "Notification is already being processed.",
        409,
      );
    }

    if (claimError.code === "P0002") {
      return jsonError("Notification not found.", 404);
    }

    console.error("Confirmation claim failed:", {
      code: claimError.code,
      message: claimError.message,
      reservationId: id,
    });

    return jsonError(
      "Unable to claim guest confirmation.",
      500,
    );
  }

  const claim = (
    Array.isArray(claimData) ? claimData[0] : claimData
  ) as ClaimResult | null;

  if (
    !claim?.notification_event_id ||
    !claim.notification_event_key ||
    !claim.claim_token
  ) {
    return jsonError(
      "Notification claim returned an invalid result. Check notification status before retrying.",
      500,
    );
  }

  // A claim that succeeded must not be automatically retried
  // if the Twilio request or result becomes uncertain.
  let twilioResult: TwilioResult | null = null;
  let acceptedMessageSid: string | null = null;
  let sendErrorCode: string | null = null;

  try {
    if (
      claim.notification_event_id !== notification.id ||
      claim.notification_event_key !== notification.event_key
    ) {
      throw new Error("Claimed notification does not match.");
    }

    twilioResult = await sendToTwilio(
      config,
      claim.notification_event_key,
      reservation.customer_phone,
      messageBody,
    );

    if (
      twilioResult.success === true &&
      twilioResult.accepted === true &&
      twilioResult.eventKey === claim.notification_event_key &&
      typeof twilioResult.messageSid === "string" &&
      MESSAGE_SID_PATTERN.test(twilioResult.messageSid)
    ) {
      acceptedMessageSid = twilioResult.messageSid;
    } else {
      sendErrorCode =
        twilioResult.success === false || twilioResult.accepted === false
          ? safeFailureCode(twilioResult.error)
          : "TWILIO_ACCEPTANCE_UNVERIFIED";
    }
  } catch (error) {
    sendErrorCode =
      error instanceof DispatchError
        ? error.code
        : error instanceof Error && error.name === "TimeoutError"
          ? "TWILIO_REQUEST_TIMEOUT"
          : "TWILIO_REQUEST_FAILED";
  }

  const { data: finishData, error: finishError } =
    await supabase.rpc("finish_reservation_confirmation", {
      p_notification_event_id: claim.notification_event_id,
      p_claim_token: claim.claim_token,
      p_result: acceptedMessageSid ? "accepted" : "uncertain",
      p_message_sid: acceptedMessageSid,
    });

  if (finishError) {
    console.error("Confirmation result recording failed:", {
      code: finishError.code,
      message: finishError.message,
      reservationId: id,
      notificationEventId: claim.notification_event_id,
      messageSid: acceptedMessageSid,
    });

    return jsonError(
      "SMS outcome could not be recorded. Check Twilio and Supabase before attempting another send.",
      500,
    );
  }

  const finished = Array.isArray(finishData)
    ? finishData[0]
    : finishData;

  if (!finished) {
    return jsonError(
      "Notification completion returned no result.",
      500,
    );
  }

  if (!acceptedMessageSid) {
    console.error("Confirmation SMS outcome uncertain:", {
      reservationId: id,
      notificationEventId: claim.notification_event_id,
      failureCode: sendErrorCode ?? "TWILIO_ACCEPTANCE_UNVERIFIED",
    });

    return NextResponse.json(
      {
        success: false,
        error: "SMS delivery request could not be verified. Check Twilio message logs. Automatic resend is disabled.",
        failureCode: sendErrorCode ?? "TWILIO_ACCEPTANCE_UNVERIFIED",
      },
      { status: 502, headers: { "Cache-Control": "no-store" } },
    );
  }

  return NextResponse.json(
    {
      success: true,
      accepted: true,
      reservationId: id,
      notificationEventId: claim.notification_event_id,
      notificationStatus: "sent",
      messageSid: acceptedMessageSid,
      messageStatus: twilioResult?.messageStatus ?? "unknown",
      message:
        "Twilio accepted the confirmation SMS. Delivery is not yet verified.",
    },
    {
      headers: { "Cache-Control": "no-store" },
    },
  );
}