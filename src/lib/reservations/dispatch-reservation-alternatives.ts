import { createHmac } from "node:crypto";
import { NextResponse } from "next/server";
import type { createSupabaseServerClient } from "@/lib/supabase/server";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const PHONE = /^\+[1-9]\d{7,14}$/;
const MESSAGE_SID = /^SM[0-9a-f]{32}$/i;
const TIME = /^(\d{2}):(\d{2})(?::00)?$/;
const MAX_MESSAGE_LENGTH = 1000;

type SupabaseClient = Awaited<ReturnType<typeof createSupabaseServerClient>>;

type Reservation = {
  id: string;
  customer_name: string | null;
  customer_phone: string;
  reservation_date: string | null;
  reservation_time: string | null;
  request_status: string;
  details_validated: boolean;
};

type Workflow = {
  workflow_status: string;
  proposed_times: string[];
};

type Prepared = {
  offer_id: string;
  notification_event_id: string;
  event_key: string;
};

type Claimed = {
  offer_id: string;
  notification_event_id: string;
  event_key: string;
  claim_token: string;
};

type TwilioResult = {
  success?: boolean;
  accepted?: boolean;
  messageSid?: string;
  eventKey?: string;
  messageStatus?: string;
  error?: string;
};

function jsonError(error: string, status: number): NextResponse {
  return NextResponse.json(
    { success: false, error },
    {
      status,
      headers: { "Cache-Control": "no-store" },
    },
  );
}

function formatTime(raw: string): string {
  const match = TIME.exec(raw);

  if (!match) {
    throw new Error("Invalid time format");
  }

  const hour = Number(match[1]);
  const minute = Number(match[2]);

  if (
    hour < 10 ||
    hour > 22 ||
    (minute !== 0 && minute !== 30) ||
    (hour === 22 && minute !== 0)
  ) {
    throw new Error("Alternative outside permitted time options");
  }

  return (
    `${hour % 12 || 12}:${match[2]} ` +
    (hour >= 12 ? "PM" : "AM")
  );
}

function canonicalTime(raw: string): string {
  const match = TIME.exec(raw);

  if (!match) {
    throw new Error("Invalid time");
  }

  return `${match[1]}:${match[2]}`;
}

function buildMessage(
  reservation: Reservation,
  times: string[],
): string {
  if (
    !reservation.reservation_date ||
    !/^\d{4}-\d{2}-\d{2}$/.test(reservation.reservation_date)
  ) {
    throw new Error("Missing reservation date");
  }

  if (
    !reservation.reservation_time ||
    times.length < 1 ||
    times.length > 3 ||
    new Set(times.map(canonicalTime)).size !== times.length
  ) {
    throw new Error("Invalid alternative times");
  }

  const date = new Date(
    `${reservation.reservation_date}T12:00:00Z`,
  );

  if (
    !Number.isFinite(date.valueOf()) ||
    date.toISOString().slice(0, 10) !== reservation.reservation_date
  ) {
    throw new Error("Invalid reservation date");
  }

  const formattedDate = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);

  const originalTime = canonicalTime(reservation.reservation_time);

  if (
    times.some((time) => canonicalTime(time) === originalTime)
  ) {
    throw new Error("Alternative matches original request");
  }

  const firstName = reservation.customer_name
    ?.trim()
    .split(/\s+/)[0];

  const replyOptions = times
    .map((_, index) => index + 1)
    .join(", ")
    .replace(/, (\d)$/, " or $1");

  const message = [
    "Fin & Feathers Las Vegas",
    "",
    `Hello${firstName ? ` ${firstName}` : ""}! Your requested time of ${formatTime(reservation.reservation_time)} on ${formattedDate} is unavailable.`,
    "",
    "We can offer these times on the same date:",
    ...times.map(
      (time, index) => `${index + 1}. ${formatTime(time)}`,
    ),
    "",
    `Reply ${replyOptions} to select a time.`,
    "Your reservation is NOT confirmed until our staff completes the booking and sends your final confirmation.",
  ].join("\n");

  if (message.length > MAX_MESSAGE_LENGTH) {
    throw new Error("Message exceeds size limit");
  }

  return message;
}

function configuration(): {
  secret: string;
  url: string;
} | null {
  const secret = process.env.RESERVATION_CONFIRMATION_SECRET;

  const value =
    process.env.RESERVATION_ALTERNATIVES_FUNCTION_URL;

  if (
    !secret ||
    !/^[a-f0-9]{64}$/i.test(secret) ||
    !value
  ) {
    return null;
  }

  try {
    const url = new URL(value);

    if (
      url.protocol !== "https:" ||
      url.username ||
      url.password ||
      url.search ||
      url.hash ||
      !url.pathname.endsWith("/send-reservation-alternatives")
    ) {
      return null;
    }

    return {
      secret,
      url: url.toString(),
    };
  } catch {
    return null;
  }
}

async function twilioSend(
  config: {
    secret: string;
    url: string;
  },
  eventKey: string,
  to: string,
  body: string,
): Promise<TwilioResult> {
  const timestamp = String(
    Math.floor(Date.now() / 1000),
  );

  const payload = JSON.stringify({
    eventKey,
    to,
    body,
  });

  const signature = createHmac(
    "sha256",
    Buffer.from(config.secret, "hex"),
  )
    .update(`${timestamp}.${payload}`)
    .digest("hex");

  const form = new URLSearchParams({
    timestamp,
    signature,
    eventKey,
    to,
    body,
  });

  const response = await fetch(config.url, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: form.toString(),
    cache: "no-store",
    signal: AbortSignal.timeout(15000),
  });

  if (!response.ok) {
    throw new Error(`HTTP_${response.status}`);
  }

  const result: unknown = await response.json();

  if (
    !result ||
    typeof result !== "object" ||
    Array.isArray(result)
  ) {
    throw new Error("INVALID_TWILIO_RESPONSE");
  }

  return result as TwilioResult;
}

/**
 * Called only after the HTTP route authorizes an active manager.
 *
 * Uses an atomic database claim to prevent duplicate SMS sends.
 * An uncertain send result must never be retried automatically.
 */
export async function dispatchReservationAlternatives(
  supabase: SupabaseClient,
  reservationId: string,
): Promise<NextResponse> {
  if (
    process.env.RESERVATION_ALTERNATIVES_SEND_ENABLED !== "true"
  ) {
    return jsonError(
      "Alternative-time SMS sending is disabled.",
      503,
    );
  }

  const config = configuration();

  if (!config) {
    return jsonError(
      "Alternative-time SMS is not configured.",
      503,
    );
  }

  if (!UUID.test(reservationId)) {
    return jsonError("Invalid reservation ID.", 400);
  }

  const [
    {
      data: rawReservation,
      error: reservationError,
    },
    {
      data: rawWorkflow,
      error: workflowError,
    },
  ] = await Promise.all([
    supabase
      .from("reservation_requests")
      .select(
        "id,customer_name,customer_phone,reservation_date,reservation_time,request_status,details_validated",
      )
      .eq("id", reservationId)
      .maybeSingle(),

    supabase
      .from("reservation_staff_workflows")
      .select("workflow_status,proposed_times")
      .eq("reservation_request_id", reservationId)
      .maybeSingle(),
  ]);

  if (reservationError || workflowError) {
    return jsonError(
      "Unable to load offer details.",
      500,
    );
  }

  const reservation = rawReservation as Reservation | null;
  const workflow = rawWorkflow as Workflow | null;

  if (!reservation || !workflow) {
    return jsonError(
      "Reservation or workflow not found.",
      404,
    );
  }

  if (
    !reservation.details_validated ||
    !["pending", "incomplete"].includes(
      reservation.request_status,
    ) ||
    workflow.workflow_status !== "alternatives_proposed"
  ) {
    return jsonError(
      "Alternative times must be saved for an eligible unavailable reservation.",
      409,
    );
  }

  if (!PHONE.test(reservation.customer_phone)) {
    return jsonError(
      "Guest phone is invalid.",
      409,
    );
  }

  let body: string;

  try {
    body = buildMessage(
      reservation,
      workflow.proposed_times,
    );
  } catch {
    return jsonError(
      "Proposed times or reservation details are invalid.",
      409,
    );
  }

  // Create the offer and its notification under a database lock.
  const {
    data: rawPrepared,
    error: prepareError,
  } = await supabase.rpc(
    "prepare_reservation_alternative_offer",
    {
      p_reservation_id: reservationId,
    },
  );

  if (prepareError) {
    if (prepareError.code === "42501") {
      return jsonError(
        "Manager access required.",
        403,
      );
    }

    if (prepareError.code === "22023") {
      return jsonError(
        "An alternative-time offer is already prepared or reservation status changed.",
        409,
      );
    }

    console.error(
      "Alternative offer preparation failed",
      {
        reservationId,
        code: prepareError.code,
      },
    );

    return jsonError(
      "Unable to prepare alternative-time offer.",
      500,
    );
  }

  const prepared = (
    Array.isArray(rawPrepared)
      ? rawPrepared[0]
      : rawPrepared
  ) as Prepared | null;

  if (
    !prepared ||
    !UUID.test(prepared.offer_id) ||
    !UUID.test(prepared.notification_event_id) ||
    prepared.event_key !==
      `reservation_alternatives:${reservationId}:${prepared.offer_id}`
  ) {
    return jsonError(
      "Offer preparation could not be verified. Check its status before trying again.",
      500,
    );
  }

  // Atomically claim this SMS before making the Twilio request.
  const {
    data: rawClaim,
    error: claimError,
  } = await supabase.rpc(
    "claim_reservation_alternative_offer",
    {
      p_offer_id: prepared.offer_id,
    },
  );

  if (claimError) {
    console.error(
      "Alternative offer claim failed",
      {
        reservationId,
        code: claimError.code,
      },
    );

    return jsonError(
      "SMS was not sent; offer claim failed. Review offer status before retrying.",
      claimError.code === "22023" ? 409 : 500,
    );
  }

  const claim = (
    Array.isArray(rawClaim)
      ? rawClaim[0]
      : rawClaim
  ) as Claimed | null;

  if (
    !claim?.claim_token ||
    claim.offer_id !== prepared.offer_id ||
    claim.notification_event_id !==
      prepared.notification_event_id ||
    claim.event_key !== prepared.event_key
  ) {
    return jsonError(
      "SMS claim result is uncertain. Do not resend automatically.",
      500,
    );
  }

  let sid: string | null = null;
  let sendFailure = "TWILIO_ACCEPTANCE_UNVERIFIED";
  let twilioStatus = "unknown";

  try {
    const result = await twilioSend(
      config,
      claim.event_key,
      reservation.customer_phone,
      body,
    );

    if (
      result.success === true &&
      result.accepted === true &&
      result.eventKey === claim.event_key &&
      typeof result.messageSid === "string" &&
      MESSAGE_SID.test(result.messageSid)
    ) {
      sid = result.messageSid;
      twilioStatus = result.messageStatus ?? "unknown";
    } else {
      sendFailure =
        typeof result.error === "string"
          ? result.error
          : sendFailure;
    }
  } catch (error) {
    sendFailure =
      error instanceof Error &&
      error.name === "TimeoutError"
        ? "TWILIO_REQUEST_TIMEOUT"
        : "TWILIO_REQUEST_OR_RESPONSE_ERROR";
  }

  // Record the result using the matching claim token.
  const {
    data: completed,
    error: finishError,
  } = await supabase.rpc(
    "finish_reservation_alternative_offer",
    {
      p_offer_id: claim.offer_id,
      p_claim_token: claim.claim_token,
      p_result: sid ? "accepted" : "uncertain",
      p_message_sid: sid,
    },
  );

  if (
    finishError ||
    completed !== (sid ? "sent" : "uncertain")
  ) {
    console.error(
      "Alternative offer completion not verified",
      {
        reservationId,
        offerId: claim.offer_id,
        code: finishError?.code ?? "BAD_RESULT",
        messageSid: sid,
      },
    );

    return jsonError(
      "SMS outcome was not recorded. Review Twilio and Supabase before any retry.",
      500,
    );
  }

  if (!sid) {
    console.error(
      "Alternative offer SMS outcome uncertain",
      {
        reservationId,
        offerId: claim.offer_id,
        failureCode: sendFailure,
      },
    );

    return jsonError(
      "SMS acceptance could not be verified. Review Twilio logs; automatic resend is disabled.",
      502,
    );
  }

  return NextResponse.json(
    {
      success: true,
      accepted: true,
      reservationId,
      offerId: claim.offer_id,
      notificationStatus: "sent",
      messageSid: sid,
      messageStatus: twilioStatus,
      message:
        "Twilio accepted the alternative-times SMS. Delivery is not yet verified.",
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}