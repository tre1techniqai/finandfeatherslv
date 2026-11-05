import { createHmac } from "node:crypto";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

import type { createSupabaseServerClient } from "@/lib/supabase/server";

type SupabaseClient = Awaited<
  ReturnType<typeof createSupabaseServerClient>
>;

type Decision = "required" | "waived";

type Reservation = {
  id: string;
  customer_name: string | null;
  customer_phone: string;
  reservation_reference: string | null;
  reservation_date: string | null;
  reservation_time: string | null;
  party_size: number | null;
  deposit_amount: number | null;
  deposit_status: string;
  request_status: string;
  details_validated: boolean;
};

type Workflow = {
  workflow_status: string;
  accepted_time: string | null;
};

type PreparedDecision = {
  notification_event_id: string;
  notification_event_key: string;
  deposit_decision: Decision;
};

type ClaimResult = {
  notification_event_id: string;
  notification_event_key: string;
  claim_token: string;
};

type NotificationEvent = {
  id: string;
  event_key: string;
  notification_type: string;
  notification_status: string;
  deposit_decision: string | null;
  dispatch_token: string | null;
  twilio_message_sid: string | null;
};

type FinishedDecision = {
  notification_event_id: string;
  notification_status: string;
  twilio_message_sid: string | null;
};

type TwilioResult = {
  success?: boolean;
  accepted?: boolean;
  eventKey?: string;
  messageSid?: string;
  messageStatus?: string;
  error?: string;
};

type OwnershipRow = {
  outcome: string;
  owner_reservation_id: string;
};

type OwnershipResult =
  | { status: "registered"; outcome: "recorded" | "duplicate" }
  | { status: "needs_attention"; reason: string };

const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const MESSAGE_SID = /^SM[0-9a-f]{32}$/i;
const E164 = /^\+[1-9]\d{7,14}$/;
const REFERENCE = /^[A-Z]{2}-\d{6}-\d{3,8}$/;
const MAX_MESSAGE_LENGTH = 1000;

const RESERVATION_SELECT = [
  "id",
  "customer_name",
  "customer_phone",
  "reservation_reference",
  "reservation_date",
  "reservation_time",
  "party_size",
  "deposit_amount",
  "deposit_status",
  "request_status",
  "details_validated",
].join(",");

const WORKFLOW_SELECT =
  "workflow_status,accepted_time";

const NOTIFICATION_SELECT = [
  "id",
  "event_key",
  "notification_type",
  "notification_status",
  "deposit_decision",
  "dispatch_token",
  "twilio_message_sid",
].join(",");

function respond(
  body: Record<string, unknown>,
  status = 200,
): NextResponse {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

function fail(
  error: string,
  status: number,
): NextResponse {
  return respond({ success: false, error }, status);
}

function firstRow<T>(value: unknown): T | null {
  const row = Array.isArray(value)
    ? value.length === 1 ? value[0] : null
    : value;

  if (
    !row ||
    typeof row !== "object" ||
    Array.isArray(row)
  ) {
    return null;
  }

  return row as T;
}

function expectedDeposit(
  partySize: number,
): number | null {
  if (partySize >= 9 && partySize <= 10) return 55;
  if (partySize >= 11 && partySize <= 14) return 80;
  if (partySize >= 15 && partySize <= 20) return 110;
  return null;
}

function partyRange(partySize: number): string {
  if (partySize <= 10) return "9-10";
  if (partySize <= 14) return "11-14";
  return "15-20";
}

function formatDate(value: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error("INVALID_DATE");
  }

  const date = new Date(`${value}T12:00:00Z`);

  if (
    !Number.isFinite(date.getTime()) ||
    date.toISOString().slice(0, 10) !== value
  ) {
    throw new Error("INVALID_DATE");
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
  const match =
    /^(\d{2}):(\d{2})(?::00)?$/.exec(value);

  if (!match) throw new Error("INVALID_TIME");

  const hours = Number(match[1]);
  const minutes = Number(match[2]);

  if (
    hours > 23 ||
    (minutes !== 0 && minutes !== 30)
  ) {
    throw new Error("INVALID_TIME");
  }

  return (
    `${hours % 12 || 12}:${match[2]} ` +
    (hours >= 12 ? "PM" : "AM")
  );
}

function validateReservation(
  reservation: Reservation,
): Decision | null {
  if (
    !reservation ||
    !UUID.test(reservation.id) ||
    !reservation.details_validated ||
    !["pending", "incomplete"].includes(
      reservation.request_status,
    ) ||
    !reservation.customer_name?.trim() ||
    !E164.test(reservation.customer_phone) ||
    !reservation.reservation_date ||
    !reservation.reservation_time ||
    !reservation.reservation_reference ||
    !REFERENCE.test(reservation.reservation_reference) ||
    !reservation.party_size ||
    reservation.party_size < 9 ||
    reservation.party_size > 20 ||
    reservation.deposit_amount !==
      expectedDeposit(reservation.party_size)
  ) {
    return null;
  }

  if (reservation.deposit_status === "pending") {
    return "required";
  }

  if (reservation.deposit_status === "waived") {
    return "waived";
  }

  return null;
}

function validWorkflow(
  workflow: Workflow | null,
): boolean {
  return (
    !!workflow &&
    ["available", "alternative_accepted"].includes(
      workflow.workflow_status,
    ) &&
    (
      workflow.workflow_status !==
        "alternative_accepted" ||
      !!workflow.accepted_time
    )
  );
}

function buildMessage(
  reservation: Reservation,
  workflow: Workflow,
  decision: Decision,
): string {
  const name = reservation.customer_name?.trim();
  const date = reservation.reservation_date;
  const time =
    workflow.accepted_time ??
    reservation.reservation_time;
  const size = reservation.party_size;
  const amount = reservation.deposit_amount;
  const reference = reservation.reservation_reference;

  if (
    !name || !date || !time ||
    !size || amount === null
  ) {
    throw new Error("INCOMPLETE_RESERVATION");
  }

  const firstName = name.split(/\s+/)[0];

  const availability =
    `Hi ${firstName}! Your reservation request ` +
    `at Fin & Feathers Las Vegas for ` +
    `${formatDate(date)} at ${formatTime(time)}, ` +
    `for ${size} guests, is available!`;

  let message: string;

  if (decision === "waived") {
    message = [
      "Fin & Feathers Las Vegas",
      "",
      availability,
      "",
      `Normally, parties of ${partyRange(size)} guests ` +
        `require a $${amount} deposit. ` +
        "As a courtesy, we have waived the deposit " +
        "for you. No deposit payment is necessary.",
    ].join("\n");
  } else {
    if (!reference || !REFERENCE.test(reference)) {
      throw new Error("INVALID_RESERVATION_REFERENCE");
    }

    message = [
      "Fin & Feathers Las Vegas",
      "",
      availability,
      "",
      `A $${amount} deposit is required for your party size.`,
      "",
      `Reservation Reference: ${reference}`,
      "",
      "Please reply with your email address AND " +
        "the reservation reference shown above " +
        "so our team can send your secure payment link.",
      "",
      `Example: guest@example.com ${reference}`,
    ].join("\n");
  }

  if (
    !message.trim() ||
    message.length > MAX_MESSAGE_LENGTH
  ) {
    throw new Error("INVALID_MESSAGE_LENGTH");
  }

  return message;
}

function equalReservation(
  a: Reservation,
  b: Reservation,
): boolean {
  return (
    a.id === b.id &&
    a.customer_name === b.customer_name &&
    a.customer_phone === b.customer_phone &&
    a.reservation_reference === b.reservation_reference &&
    a.reservation_date === b.reservation_date &&
    a.reservation_time === b.reservation_time &&
    a.party_size === b.party_size &&
    a.deposit_amount === b.deposit_amount &&
    a.deposit_status === b.deposit_status &&
    a.request_status === b.request_status &&
    a.details_validated === b.details_validated
  );
}

function equalWorkflow(
  a: Workflow,
  b: Workflow,
): boolean {
  return (
    a.workflow_status === b.workflow_status &&
    a.accepted_time === b.accepted_time
  );
}

async function loadReservation(
  supabase: SupabaseClient,
  id: string,
): Promise<Reservation | null> {
  const { data, error } = await supabase
    .from("reservation_requests")
    .select(RESERVATION_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error("RESERVATION_LOOKUP_FAILED");

  return data as Reservation | null;
}

async function loadWorkflow(
  supabase: SupabaseClient,
  id: string,
): Promise<Workflow | null> {
  const { data, error } = await supabase
    .from("reservation_staff_workflows")
    .select(WORKFLOW_SELECT)
    .eq("reservation_request_id", id)
    .maybeSingle();

  if (error) throw new Error("WORKFLOW_LOOKUP_FAILED");

  return data as Workflow | null;
}

async function loadNotification(
  supabase: SupabaseClient,
  eventKey: string,
): Promise<NotificationEvent | null> {
  const { data, error } = await supabase
    .from("reservation_notification_events")
    .select(NOTIFICATION_SELECT)
    .eq("event_key", eventKey)
    .maybeSingle();

  if (error) throw new Error("NOTIFICATION_LOOKUP_FAILED");

  return data as NotificationEvent | null;
}

function notificationConfig(): {
  secret: string;
  functionUrl: string;
} | null {
  const secret =
    process.env.RESERVATION_CONFIRMATION_SECRET;
  const rawUrl =
    process.env.RESERVATION_DEPOSIT_DECISION_FUNCTION_URL;

  if (
    !secret ||
    !/^[a-f0-9]{64}$/i.test(secret) ||
    !rawUrl
  ) {
    return null;
  }

  try {
    const url = new URL(rawUrl);

    if (
      url.protocol !== "https:" ||
      url.username ||
      url.password ||
      url.search ||
      url.hash ||
      !url.pathname.endsWith(
        "/send-reservation-deposit-decision",
      )
    ) {
      return null;
    }

    return {
      secret,
      functionUrl: url.toString(),
    };
  } catch {
    return null;
  }
}

async function sendToTwilio(
  config: { secret: string; functionUrl: string },
  eventKey: string,
  to: string,
  body: string,
): Promise<TwilioResult> {
  const timestamp = String(
    Math.floor(Date.now() / 1000),
  );

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

  const form = new URLSearchParams({
    timestamp,
    signature,
    eventKey,
    to,
    body,
  });

  const response = await fetch(
    config.functionUrl,
    {
      method: "POST",
      headers: {
        "Content-Type":
          "application/x-www-form-urlencoded",
      },
      body: form.toString(),
      cache: "no-store",
      signal: AbortSignal.timeout(15000),
    },
  );

  if (!response.ok) {
    throw new Error("TWILIO_FUNCTION_HTTP_ERROR");
  }

  const data: unknown = await response.json();

  if (
    !data ||
    typeof data !== "object" ||
    Array.isArray(data)
  ) {
    throw new Error("TWILIO_INVALID_RESPONSE");
  }

  return data as TwilioResult;
}

/**
 * Construct a trusted, service-role-only client.
 *
 * This client is never shared with the browser and is used
 * exclusively for the privileged claim/finish and outbound
 * Message SID ownership operations.
 *
 * Construct it BEFORE preparing a notification so a missing
 * key cannot leave a new, unclaimed notification behind.
 */
function createTrustedNotificationClient() {
  const rawUrl =
    process.env.SUPABASE_URL ??
    process.env.NEXT_PUBLIC_SUPABASE_URL;

  const serviceKey =
    process.env.SUPABASE_SECRET_KEY ??
    process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!rawUrl || !serviceKey) {
    return null;
  }

  try {
    const url = new URL(rawUrl);

    if (
      (url.protocol !== "https:" &&
        !(url.protocol === "http:" &&
          ["localhost", "127.0.0.1"].includes(url.hostname))) ||
      !url.hostname ||
      url.username ||
      url.password
    ) {
      return null;
    }

    return createClient(rawUrl, serviceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  } catch {
    return null;
  }
}

/**
 * Register an already-accepted Twilio Message SID.
 *
 * Never call this before the notification finish RPC
 * has successfully saved the SID.
 *
 * Uses the preconfigured service-role client.
 * The staff session client is never used for registration.
 *
 * Registration failure must NEVER initiate another SMS.
 */
async function registerOutboundOwnership(
  admin: NonNullable<ReturnType<typeof createTrustedNotificationClient>>,
  reservationId: string,
  messageSid: string,
): Promise<OwnershipResult> {
  try {
    const { data, error } = await admin.rpc(
      "register_reservation_message_sid_ownership",
      {
        p_reservation_id: reservationId,
        p_twilio_message_sid: messageSid,
      },
    );

    if (error) {
      console.error(
        "Deposit SMS ownership registration failed.",
        {
          reservationId,
          code: error.code,
        },
      );

      return {
        status: "needs_attention",
        reason: "OWNERSHIP_RPC_FAILED",
      };
    }

    const result = firstRow<OwnershipRow>(data);

    if (
      !result ||
      !["recorded", "duplicate"].includes(result.outcome) ||
      typeof result.owner_reservation_id !== "string" ||
      result.owner_reservation_id.toLowerCase() !==
        reservationId.toLowerCase()
    ) {
      console.error(
        "Deposit SMS ownership response rejected.",
        { reservationId },
      );

      return {
        status: "needs_attention",
        reason: "OWNERSHIP_RESULT_INVALID",
      };
    }

    return {
      status: "registered",
      outcome: result.outcome as "recorded" | "duplicate",
    };
  } catch {
    console.error(
      "Deposit SMS ownership registration exception.",
      { reservationId },
    );

    return {
      status: "needs_attention",
      reason: "OWNERSHIP_REGISTRATION_EXCEPTION",
    };
  }
}

function validPrepared(
  value: PreparedDecision | null,
  eventKey: string,
  decision: Decision,
): value is PreparedDecision {
  return (
    !!value &&
    UUID.test(value.notification_event_id) &&
    value.notification_event_key === eventKey &&
    value.deposit_decision === decision
  );
}

function validClaim(
  value: ClaimResult | null,
  prepared: PreparedDecision,
): value is ClaimResult {
  return (
    !!value &&
    UUID.test(value.notification_event_id) &&
    UUID.test(value.claim_token) &&
    value.notification_event_id ===
      prepared.notification_event_id &&
    value.notification_event_key ===
      prepared.notification_event_key
  );
}

/**
 * The caller must authenticate and authorize staff.
 *
 * Sending is disabled until its feature flag is enabled.
 * Notification claims must be completed before ownership
 * registration is attempted.
 *
 * No automatic retry occurs after any uncertain result.
 */
export async function dispatchReservationDepositDecision(
  supabase: SupabaseClient,
  reservationId: string,
): Promise<NextResponse> {
  if (
    process.env.RESERVATION_DEPOSIT_DECISION_SEND_ENABLED !==
    "true"
  ) {
    return fail(
      "Deposit-decision SMS sending is not enabled.",
      503,
    );
  }

  if (!UUID.test(reservationId)) {
    return fail("Invalid reservation ID.", 400);
  }

  const config = notificationConfig();

  if (!config) {
    return fail(
      "Deposit-decision messaging is not configured.",
      503,
    );
  }

  // The staff client remains the authorization boundary.
  // The trusted client is needed only for claim, finish, and
  // outbound ownership registration; fail before preparation
  // if it cannot be constructed.
  const admin = createTrustedNotificationClient();

  if (!admin) {
    return fail(
      "Trusted deposit notification access is not configured.",
      503,
    );
  }

  let before: Reservation | null;
  let beforeWorkflow: Workflow | null;

  try {
    [before, beforeWorkflow] = await Promise.all([
      loadReservation(supabase, reservationId),
      loadWorkflow(supabase, reservationId),
    ]);
  } catch {
    return fail(
      "Unable to load reservation details.",
      500,
    );
  }

  if (!before) {
    return fail("Reservation not found.", 404);
  }

  const decision = validateReservation(before);

  if (
    !decision ||
    !beforeWorkflow ||
    !validWorkflow(beforeWorkflow)
  ) {
    return fail(
      "Reservation is not eligible for deposit notification.",
      409,
    );
  }

  let originalBody: string;

  try {
    originalBody = buildMessage(
      before,
      beforeWorkflow,
      decision,
    );
  } catch {
    return fail(
      "Guest notification details are incomplete.",
      409,
    );
  }

  const eventKey =
    `reservation_deposit_decision:${reservationId}`;

  try {
    if (await loadNotification(supabase, eventKey)) {
      return fail(
        "A deposit-decision notification already exists. Review its status before proceeding.",
        409,
      );
    }
  } catch {
    return fail(
      "Unable to check notification history.",
      500,
    );
  }

  // Prepare the decision under database row locks.
  const {
    data: preparedData,
    error: preparedError,
  } = await supabase.rpc(
    "prepare_reservation_deposit_decision",
    { p_reservation_id: reservationId },
  );

  if (preparedError) {
    return fail(
      "Deposit notification could not be prepared.",
      preparedError.code === "42501" ? 403 :
      preparedError.code === "22023" ? 409 : 500,
    );
  }

  const prepared =
    firstRow<PreparedDecision>(preparedData);

  if (!validPrepared(prepared, eventKey, decision)) {
    return fail(
      "Prepared decision mismatch. Manual reconciliation required.",
      409,
    );
  }

  // Recheck all message-relevant details before claim.
  let current: Reservation | null;
  let currentWorkflow: Workflow | null;
  let event: NotificationEvent | null;

  try {
    [current, currentWorkflow, event] =
      await Promise.all([
        loadReservation(supabase, reservationId),
        loadWorkflow(supabase, reservationId),
        loadNotification(supabase, eventKey),
      ]);
  } catch {
    return fail(
      "Prepared notification snapshot could not be verified.",
      500,
    );
  }

  if (
    !current ||
    !currentWorkflow ||
    !event ||
    !equalReservation(before, current) ||
    !equalWorkflow(beforeWorkflow, currentWorkflow) ||
    validateReservation(current) !== decision ||
    !validWorkflow(currentWorkflow) ||
    event.id !== prepared.notification_event_id ||
    event.event_key !== eventKey ||
    event.notification_type !==
      "reservation_deposit_decision" ||
    event.deposit_decision !== decision ||
    event.notification_status !== "pending" ||
    event.dispatch_token !== null ||
    event.twilio_message_sid !== null
  ) {
    return fail(
      "Prepared notification differs from reservation state. Do not resend without reconciliation.",
      409,
    );
  }

  let messageBody: string;

  try {
    messageBody = buildMessage(
      current,
      currentWorkflow,
      decision,
    );
  } catch {
    return fail(
      "Prepared notification message is invalid.",
      409,
    );
  }

  if (messageBody !== originalBody) {
    return fail(
      "Notification contents changed during preparation.",
      409,
    );
  }

  // Claim exactly once before the external send.
  const {
    data: claimData,
    error: claimError,
  } = await admin.rpc(
    "claim_reservation_deposit_decision",
    { p_reservation_id: reservationId },
  );

  if (claimError) {
    return fail(
      "Deposit notification could not be claimed. Check its status before retrying.",
      claimError.code === "42501" ? 403 :
      claimError.code === "22023" ? 409 : 500,
    );
  }

  const claim = firstRow<ClaimResult>(claimData);

  if (!validClaim(claim, prepared)) {
    return fail(
      "Notification claim could not be verified. Do not send.",
      500,
    );
  }

  let twilioResult: TwilioResult | null = null;
  let messageSid: string | null = null;

  try {
    twilioResult = await sendToTwilio(
      config,
      eventKey,
      current.customer_phone,
      messageBody,
    );

    if (
      twilioResult.success === true &&
      twilioResult.accepted === true &&
      twilioResult.eventKey === eventKey &&
      typeof twilioResult.messageSid === "string" &&
      MESSAGE_SID.test(twilioResult.messageSid)
    ) {
      messageSid = twilioResult.messageSid;
    }
  } catch {
    // Unknown external outcomes are never retried.
  }

  // Store Twilio acceptance or uncertain outcome.
  const {
    data: finishData,
    error: finishError,
  } = await admin.rpc(
    "finish_reservation_deposit_decision",
    {
      p_notification_event_id:
        claim.notification_event_id,
      p_claim_token: claim.claim_token,
      p_result: messageSid ? "accepted" : "uncertain",
      p_message_sid: messageSid,
    },
  );

  const finished = firstRow<FinishedDecision>(
    finishData,
  );

  if (
    finishError ||
    !finished ||
    finished.notification_event_id !==
      claim.notification_event_id ||
    finished.notification_status !==
      (messageSid ? "sent" : "unknown") ||
    (
      messageSid !== null &&
      (
        !finished.twilio_message_sid ||
        finished.twilio_message_sid.toLowerCase() !==
          messageSid.toLowerCase()
      )
    )
  ) {
    console.error(
      "Deposit notification finish verification failed.",
      {
        reservationId,
        notificationEventId:
          claim.notification_event_id,
        code: finishError?.code ?? "INVALID_RESULT",
      },
    );

    return fail(
      "SMS result could not be verified in Supabase. Check Twilio and notification history before attempting another send.",
      500,
    );
  }

  if (!messageSid) {
    return respond(
      {
        success: false,
        accepted: false,
        failureCode: "TWILIO_ACCEPTANCE_UNVERIFIED",
        error:
          "SMS acceptance could not be verified. Automatic resend is disabled.",
      },
      502,
    );
  }

  // ====================================================
  // REGISTER ACCEPTED MESSAGE OWNERSHIP
  // ====================================================
  //
  // Twilio acceptance is already recorded in Supabase.
  // This step is strictly for durable reservation
  // association and conversation-history consistency.
  //
  // Failure here must not trigger another SMS.

  const ownership = await registerOutboundOwnership(
    admin,
    reservationId,
    messageSid,
  );

  if (ownership.status === "needs_attention") {
    console.error(
      "Deposit SMS accepted; ownership needs reconciliation.",
      {
        reservationId,
        notificationEventId:
          claim.notification_event_id,
        reason: ownership.reason,
      },
    );

    return respond(
      {
        success: true,
        accepted: true,
        reservationId,
        notificationEventId:
          claim.notification_event_id,
        notificationStatus: "sent",
        depositDecision: decision,
        messageSid,
        messageStatus:
          twilioResult?.messageStatus ?? "unknown",
        historyRegistration: "needs_attention",
        historyFailureCode: ownership.reason,
        message:
          "Twilio accepted the SMS, but reservation history registration needs attention. Do not resend.",
      },
      202,
    );
  }

  return respond({
    success: true,
    accepted: true,
    reservationId,
    notificationEventId:
      claim.notification_event_id,
    notificationStatus: "sent",
    depositDecision: decision,
    messageSid,
    messageStatus:
      twilioResult?.messageStatus ?? "unknown",
    historyRegistration: "registered",
    historyRegistrationOutcome: ownership.outcome,
    message:
      "Twilio accepted the SMS and reservation-specific message ownership was registered. Handset delivery is not yet verified.",
  });
}