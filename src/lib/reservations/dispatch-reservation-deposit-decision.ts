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

type StudioConfig = {
  accountSid: string;
  authToken: string;
  flowSid: string;
  restaurantPhone: string;
};

type StudioExecution = {
  sid: string;
  flow_sid: string;
  status: string;
};

type StudioMessage = {
  sid: string;
  account_sid: string;
  from: string;
  to: string;
  body: string;
  status: string;
};

type OwnershipRow = {
  outcome: string;
  owner_reservation_id: string;
};

type OwnershipResult =
  | {
      status: "registered";
      outcome: "recorded" | "duplicate";
    }
  | {
      status: "needs_attention";
      reason: string;
    };

const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const MESSAGE_SID = /^SM[0-9a-f]{32}$/i;
const EXECUTION_SID = /^FN[0-9a-f]{32}$/i;
const FLOW_SID = /^FW[0-9a-f]{32}$/i;
const ACCOUNT_SID = /^AC[0-9a-f]{32}$/i;

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

function firstRow<T>(
  value: unknown,
): T | null {
  const row = Array.isArray(value)
    ? value.length === 1
      ? value[0]
      : null
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
  if (
    partySize >= 9 &&
    partySize <= 10
  ) {
    return 55;
  }

  if (
    partySize >= 11 &&
    partySize <= 14
  ) {
    return 80;
  }

  if (
    partySize >= 15 &&
    partySize <= 20
  ) {
    return 110;
  }

  return null;
}

function partyRange(
  partySize: number,
): string {
  if (partySize <= 10) return "9–10";
  if (partySize <= 14) return "11–14";

  return "15–20";
}

function formatDate(
  value: string,
): string {
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(value)
  ) {
    throw new Error("INVALID_DATE");
  }

  const date = new Date(
    `${value}T12:00:00Z`,
  );

  if (
    !Number.isFinite(date.getTime()) ||
    date.toISOString().slice(0, 10) !== value
  ) {
    throw new Error("INVALID_DATE");
  }

  return new Intl.DateTimeFormat(
    "en-US",
    {
      month: "long",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC",
    },
  ).format(date);
}

function formatTime(
  value: string,
): string {
  const match =
    /^(\d{2}):(\d{2})(?::00)?$/.exec(
      value,
    );

  if (!match) {
    throw new Error("INVALID_TIME");
  }

  const hours = Number(match[1]);
  const minutes = Number(match[2]);

  if (
    hours > 23 ||
    (
      minutes !== 0 &&
      minutes !== 30
    )
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
    ![
      "pending",
      "incomplete",
    ].includes(
      reservation.request_status,
    ) ||
    !reservation.customer_name?.trim() ||
    !E164.test(
      reservation.customer_phone,
    ) ||
    !reservation.reservation_date ||
    !reservation.reservation_time ||
    !reservation.reservation_reference ||
    !REFERENCE.test(
      reservation.reservation_reference,
    ) ||
    !reservation.party_size ||
    reservation.party_size < 9 ||
    reservation.party_size > 20 ||
    reservation.deposit_amount !==
      expectedDeposit(
        reservation.party_size,
      )
  ) {
    return null;
  }

  if (
    reservation.deposit_status ===
    "pending"
  ) {
    return "required";
  }

  if (
    reservation.deposit_status ===
    "waived"
  ) {
    return "waived";
  }

  return null;
}

function validWorkflow(
  workflow: Workflow | null,
): boolean {
  return (
    !!workflow &&
    [
      "available",
      "alternative_accepted",
    ].includes(
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
  const name =
    reservation.customer_name?.trim();

  const date =
    reservation.reservation_date;

  const time =
    workflow.accepted_time ??
    reservation.reservation_time;

  const size =
    reservation.party_size;

  const amount =
    reservation.deposit_amount;

  const reference =
    reservation.reservation_reference;

  if (
    !name ||
    !date ||
    !time ||
    !size ||
    amount === null
  ) {
    throw new Error(
      "INCOMPLETE_RESERVATION",
    );
  }

  const availability =
    "GOOD NEWS! Your requested reservation for " +
    `${formatDate(date)} at ${formatTime(time)} ` +
    "is tentatively available!";

  let message: string;

  if (decision === "waived") {
    message = [
      "Fin & Feathers Las Vegas",
      "",
      availability,
      "",
      `For your party of ${partyRange(size)} guests, ` +
        `the normally required $${amount} deposit ` +
        "has been waived by management. " +
        "No deposit payment is necessary.",
      "",
      "Your reservation is NOT confirmed until " +
        "our team completes the booking and " +
        "sends your confirmation.",
    ].join("\n");
  } else {
    // Preserve internal reference validation.
    // The guest only needs to reply with
    // their email address.

    if (
      !reference ||
      !REFERENCE.test(reference)
    ) {
      throw new Error(
        "INVALID_RESERVATION_REFERENCE",
      );
    }

    message = [
      "Fin & Feathers Las Vegas",
      "",
      availability,
      "",
      `For your party of ${partyRange(size)} guests, ` +
        `a $${amount} deposit is required. ` +
        "The deposit is non-refundable and " +
        "will be credited toward your final bill.",
      "",
      "Please reply with your email address " +
        "so we can send you a secure payment link.",
      "",
      "Your reservation is NOT confirmed until " +
        "our team completes the booking and " +
        "sends your confirmation.",
    ].join("\n");
  }

  if (
    !message.trim() ||
    message.length > MAX_MESSAGE_LENGTH
  ) {
    throw new Error(
      "INVALID_MESSAGE_LENGTH",
    );
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
    a.reservation_reference ===
      b.reservation_reference &&
    a.reservation_date ===
      b.reservation_date &&
    a.reservation_time ===
      b.reservation_time &&
    a.party_size === b.party_size &&
    a.deposit_amount ===
      b.deposit_amount &&
    a.deposit_status ===
      b.deposit_status &&
    a.request_status ===
      b.request_status &&
    a.details_validated ===
      b.details_validated
  );
}

function equalWorkflow(
  a: Workflow,
  b: Workflow,
): boolean {
  return (
    a.workflow_status ===
      b.workflow_status &&
    a.accepted_time ===
      b.accepted_time
  );
}

async function loadReservation(
  supabase: SupabaseClient,
  id: string,
): Promise<Reservation | null> {
  const {
    data,
    error,
  } = await supabase
    .from("reservation_requests")
    .select(RESERVATION_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(
      "RESERVATION_LOOKUP_FAILED",
    );
  }

  return data as Reservation | null;
}

async function loadWorkflow(
  supabase: SupabaseClient,
  id: string,
): Promise<Workflow | null> {
  const {
    data,
    error,
  } = await supabase
    .from(
      "reservation_staff_workflows",
    )
    .select(WORKFLOW_SELECT)
    .eq(
      "reservation_request_id",
      id,
    )
    .maybeSingle();

  if (error) {
    throw new Error(
      "WORKFLOW_LOOKUP_FAILED",
    );
  }

  return data as Workflow | null;
}

async function loadNotification(
  supabase: SupabaseClient,
  eventKey: string,
): Promise<NotificationEvent | null> {
  const {
    data,
    error,
  } = await supabase
    .from(
      "reservation_notification_events",
    )
    .select(NOTIFICATION_SELECT)
    .eq("event_key", eventKey)
    .maybeSingle();

  if (error) {
    throw new Error(
      "NOTIFICATION_LOOKUP_FAILED",
    );
  }

  return data as NotificationEvent | null;
}

// ====================================================
// TWILIO STUDIO CONFIGURATION
// ====================================================

function studioConfig():
  StudioConfig | null {
  const accountSid =
    process.env.TWILIO_ACCOUNT_SID ?? "";

  const authToken =
    process.env.TWILIO_AUTH_TOKEN ?? "";

  const flowSid =
    process.env.RESERVATION_STUDIO_FLOW_SID ?? "";

  const restaurantPhone =
    process.env.TWILIO_FROM_NUMBER ?? "";

  if (
    !ACCOUNT_SID.test(accountSid) ||
    !authToken ||
    !FLOW_SID.test(flowSid) ||
    !E164.test(restaurantPhone)
  ) {
    return null;
  }

  return {
    accountSid,
    authToken,
    flowSid,
    restaurantPhone,
  };
}

function studioAuth(
  config: StudioConfig,
): string {
  const encoded = Buffer.from(
    `${config.accountSid}:${config.authToken}`,
    "utf8",
  ).toString("base64");

  return `Basic ${encoded}`;
}

// ====================================================
// START STUDIO EXECUTION
// ====================================================
//
// Studio sends the SMS through the
// send_staff_tentative_yes widget.
//
// The API starts the execution exactly once.
// It does not send through Twilio Messages API.
// ====================================================

async function startDepositStudioExecution(
  config: StudioConfig,
  eventKey: string,
  reservationId: string,
  depositDecision: Decision,
  guestPhone: string,
  guestMessage: string,
): Promise<StudioExecution> {
  const url =
    "https://studio.twilio.com/v2/Flows/" +
    `${config.flowSid}/Executions`;

  const body = new URLSearchParams({
    To: guestPhone,
    From: config.restaurantPhone,
    Parameters: JSON.stringify({
      requestType:
        "staff_tentative_yes",
      guestMessage,
      eventKey,
      reservationId,
      depositDecision,
    }),
  });

  // Execution creation is not idempotent.
  // Never automatically retry an ambiguous POST.

  const response = await fetch(
    url,
    {
      method: "POST",
      headers: {
        Authorization:
          studioAuth(config),
        "Content-Type":
          "application/x-www-form-urlencoded",
      },
      body: body.toString(),
      cache: "no-store",
      signal:
        AbortSignal.timeout(15000),
    },
  );

  if (response.status !== 201) {
    throw new Error(
      `STUDIO_EXECUTION_HTTP_${response.status}`,
    );
  }

  const json: unknown =
    await response.json();

  if (
    !json ||
    typeof json !== "object" ||
    Array.isArray(json)
  ) {
    throw new Error(
      "INVALID_STUDIO_EXECUTION_RESPONSE",
    );
  }

  const record =
    json as Record<string, unknown>;

  if (
    typeof record.sid !== "string" ||
    !EXECUTION_SID.test(
      record.sid,
    ) ||
    record.flow_sid !==
      config.flowSid ||
    (
      record.status !== "active" &&
      record.status !== "ended"
    )
  ) {
    throw new Error(
      "STUDIO_EXECUTION_IDENTITY_MISMATCH",
    );
  }

  return {
    sid: record.sid,
    flow_sid:
      record.flow_sid as string,
    status:
      record.status as string,
  };
}

// ====================================================
// READ ACTUAL SMS SID FROM STUDIO CONTEXT
// ====================================================
//
// Studio Execution SID: FN...
// Twilio SMS Message SID: SM...
//
// Only the SM SID may be recorded as the
// accepted outbound reservation message.
// ====================================================

async function readStudioMessageSid(
  config: StudioConfig,
  executionSid: string,
): Promise<string | null> {
  const url =
    "https://studio.twilio.com/v2/Flows/" +
    `${config.flowSid}/Executions/` +
    `${executionSid}/Context`;

  const response = await fetch(
    url,
    {
      headers: {
        Authorization:
          studioAuth(config),
      },
      cache: "no-store",
      signal:
        AbortSignal.timeout(5000),
    },
  );

  if (!response.ok) {
    return null;
  }

  const json: unknown =
    await response.json();

  if (
    !json ||
    typeof json !== "object" ||
    Array.isArray(json)
  ) {
    return null;
  }

  const context =
    (json as {
      context?: unknown;
    }).context;

  if (
    !context ||
    typeof context !== "object" ||
    Array.isArray(context)
  ) {
    return null;
  }

  const widgets =
    (context as {
      widgets?: unknown;
    }).widgets;

  if (
    !widgets ||
    typeof widgets !== "object" ||
    Array.isArray(widgets)
  ) {
    return null;
  }

  const widget =
    (
      widgets as
        Record<string, unknown>
    ).send_staff_tentative_yes;

  if (
    !widget ||
    typeof widget !== "object" ||
    Array.isArray(widget)
  ) {
    return null;
  }

  const outbound =
    (widget as {
      outbound?: unknown;
    }).outbound;

  if (
    !outbound ||
    typeof outbound !== "object" ||
    Array.isArray(outbound)
  ) {
    return null;
  }

  const sid =
    (outbound as {
      Sid?: unknown;
    }).Sid;

  if (
    typeof sid !== "string" ||
    !MESSAGE_SID.test(sid)
  ) {
    return null;
  }

  return sid;
}

// ====================================================
// VERIFY THE ACTUAL TWILIO MESSAGE
// ====================================================

async function verifyStudioMessage(
  config: StudioConfig,
  messageSid: string,
  expectedTo: string,
  expectedBody: string,
): Promise<boolean> {
  const url =
    "https://api.twilio.com/2010-04-01/" +
    `Accounts/${config.accountSid}/` +
    `Messages/${messageSid}.json`;

  const response = await fetch(
    url,
    {
      headers: {
        Authorization:
          studioAuth(config),
      },
      cache: "no-store",
      signal:
        AbortSignal.timeout(5000),
    },
  );

  if (!response.ok) {
    return false;
  }

  const json: unknown =
    await response.json();

  if (
    !json ||
    typeof json !== "object" ||
    Array.isArray(json)
  ) {
    return false;
  }

  const message =
    json as Partial<StudioMessage>;

  return (
    message.sid?.toLowerCase() ===
      messageSid.toLowerCase() &&
    message.account_sid ===
      config.accountSid &&
    message.from ===
      config.restaurantPhone &&
    message.to === expectedTo &&
    message.body === expectedBody &&
    typeof message.status ===
      "string" &&
    ![
      "failed",
      "undelivered",
      "canceled",
    ].includes(
      message.status,
    )
  );
}

// ====================================================
// POLL STUDIO CONTEXT WITHOUT RESENDING
// ====================================================
//
// Studio widgets execute asynchronously.
//
// These are read-only checks.
// No additional Studio execution is created.
// ====================================================

async function findVerifiedStudioSmsSid(
  config: StudioConfig,
  executionSid: string,
  expectedTo: string,
  expectedBody: string,
): Promise<string | null> {
  for (
    let attempt = 0;
    attempt < 5;
    attempt += 1
  ) {
    if (attempt > 0) {
      await new Promise<void>(
        (resolve) =>
          setTimeout(
            resolve,
            750,
          ),
      );
    }

    try {
      const sid =
        await readStudioMessageSid(
          config,
          executionSid,
        );

      if (
        sid &&
        await verifyStudioMessage(
          config,
          sid,
          expectedTo,
          expectedBody,
        )
      ) {
        return sid;
      }
    } catch {
      // A context lookup failure does not
      // authorize another SMS.
    }
  }

  return null;
}

// ====================================================
// TRUSTED SUPABASE CLIENT
// ====================================================

function createTrustedNotificationClient() {
  const rawUrl =
    process.env.SUPABASE_URL ??
    process.env.NEXT_PUBLIC_SUPABASE_URL;

  const serviceKey =
    process.env.SUPABASE_SECRET_KEY ??
    process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (
    !rawUrl ||
    !serviceKey
  ) {
    return null;
  }

  try {
    const url = new URL(rawUrl);

    if (
      (
        url.protocol !== "https:" &&
        !(
          url.protocol === "http:" &&
          [
            "localhost",
            "127.0.0.1",
          ].includes(
            url.hostname,
          )
        )
      ) ||
      !url.hostname ||
      url.username ||
      url.password
    ) {
      return null;
    }

    return createClient(
      rawUrl,
      serviceKey,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      },
    );
  } catch {
    return null;
  }
}

// ====================================================
// REGISTER OUTBOUND MESSAGE OWNERSHIP
// ====================================================

async function registerOutboundOwnership(
  admin: NonNullable<
    ReturnType<
      typeof createTrustedNotificationClient
    >
  >,
  reservationId: string,
  messageSid: string,
): Promise<OwnershipResult> {
  try {
    const {
      data,
      error,
    } = await admin.rpc(
      "register_reservation_message_sid_ownership",
      {
        p_reservation_id:
          reservationId,
        p_twilio_message_sid:
          messageSid,
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
        status:
          "needs_attention",
        reason:
          "OWNERSHIP_RPC_FAILED",
      };
    }

    const result =
      firstRow<OwnershipRow>(
        data,
      );

    if (
      !result ||
      ![
        "recorded",
        "duplicate",
      ].includes(
        result.outcome,
      ) ||
      typeof result.owner_reservation_id !==
        "string" ||
      result.owner_reservation_id.toLowerCase() !==
        reservationId.toLowerCase()
    ) {
      console.error(
        "Deposit SMS ownership response rejected.",
        {
          reservationId,
        },
      );

      return {
        status:
          "needs_attention",
        reason:
          "OWNERSHIP_RESULT_INVALID",
      };
    }

    return {
      status: "registered",
      outcome:
        result.outcome as
          | "recorded"
          | "duplicate",
    };
  } catch {
    console.error(
      "Deposit SMS ownership registration exception.",
      {
        reservationId,
      },
    );

    return {
      status:
        "needs_attention",
      reason:
        "OWNERSHIP_REGISTRATION_EXCEPTION",
    };
  }
}

// ====================================================
// NOTIFICATION VALIDATION
// ====================================================

function validPrepared(
  value: PreparedDecision | null,
  eventKey: string,
  decision: Decision,
): value is PreparedDecision {
  return (
    !!value &&
    UUID.test(
      value.notification_event_id,
    ) &&
    value.notification_event_key ===
      eventKey &&
    value.deposit_decision ===
      decision
  );
}

function validClaim(
  value: ClaimResult | null,
  prepared: PreparedDecision,
): value is ClaimResult {
  return (
    !!value &&
    UUID.test(
      value.notification_event_id,
    ) &&
    UUID.test(
      value.claim_token,
    ) &&
    value.notification_event_id ===
      prepared.notification_event_id &&
    value.notification_event_key ===
      prepared.notification_event_key
  );
}

// ====================================================
// MAIN DEPOSIT DECISION DISPATCHER
// ====================================================
//
// The caller must authenticate and
// authorize reservation staff.
//
// All existing reservation checks,
// notification locks and RPCs remain.
//
// No automatic resend after uncertainty.
// ====================================================

export async function dispatchReservationDepositDecision(
  supabase: SupabaseClient,
  reservationId: string,
  notificationKind: "decision" | "waiver" = "decision",
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

  if (
    !UUID.test(reservationId)
  ) {
    return fail(
      "Invalid reservation ID.",
      400,
    );
  }

  const config =
    studioConfig();

  if (!config) {
    return fail(
      "Deposit-decision messaging is not configured.",
      503,
    );
  }

  // Preserve the staff authorization boundary.

  const admin =
    createTrustedNotificationClient();

  if (!admin) {
    return fail(
      "Trusted deposit notification access is not configured.",
      503,
    );
  }

  let before:
    Reservation | null;

  let beforeWorkflow:
    Workflow | null;

  try {
    [
      before,
      beforeWorkflow,
    ] = await Promise.all([
      loadReservation(
        supabase,
        reservationId,
      ),
      loadWorkflow(
        supabase,
        reservationId,
      ),
    ]);
  } catch {
    return fail(
      "Unable to load reservation details.",
      500,
    );
  }

  if (!before) {
    return fail(
      "Reservation not found.",
      404,
    );
  }

  const decision =
    validateReservation(before);

  if (
    !decision ||
    !beforeWorkflow ||
    !validWorkflow(
      beforeWorkflow,
    )
  ) {
    return fail(
      "Reservation is not eligible for deposit notification.",
      409,
    );
  }

  if (
    notificationKind === "waiver" &&
    decision !== "waived"
  ) {
    return fail(
      "An approved deposit waiver is required.",
      409,
    );
  }

  // Courtesy waivers use only their dedicated event identity.
  // Never send a waiver through the legacy manual decision path.
  if (
    notificationKind === "decision" &&
    decision === "waived"
  ) {
    return fail(
      "Approved deposit waivers use automatic courtesy notification.",
      409,
    );
  }

  let originalBody: string;

  try {
    originalBody =
      buildMessage(
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
    notificationKind === "waiver"
      ? `reservation_deposit_waiver:${reservationId}`
      : `reservation_deposit_decision:${reservationId}`;

  try {
    if (
      await loadNotification(
        supabase,
        eventKey,
      )
    ) {
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

  // Prepare under existing database row locks.

  const {
    data: preparedData,
    error: preparedError,
  } = await supabase.rpc(
    notificationKind === "waiver"
      ? "prepare_reservation_deposit_waiver"
      : "prepare_reservation_deposit_decision",
    {
      p_reservation_id:
        reservationId,
    },
  );

  if (preparedError) {
    return fail(
      "Deposit notification could not be prepared.",
      preparedError.code === "42501"
        ? 403
        : preparedError.code === "22023"
          ? 409
          : 500,
    );
  }

  const prepared =
    firstRow<PreparedDecision>(
      preparedData,
    );

  if (
    !validPrepared(
      prepared,
      eventKey,
      decision,
    )
  ) {
    return fail(
      "Prepared decision mismatch. Manual reconciliation required.",
      409,
    );
  }

  let current:
    Reservation | null;

  let currentWorkflow:
    Workflow | null;

  let event:
    NotificationEvent | null;

  try {
    [
      current,
      currentWorkflow,
      event,
    ] = await Promise.all([
      loadReservation(
        supabase,
        reservationId,
      ),
      loadWorkflow(
        supabase,
        reservationId,
      ),
      loadNotification(
        supabase,
        eventKey,
      ),
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
    !equalReservation(
      before,
      current,
    ) ||
    !equalWorkflow(
      beforeWorkflow,
      currentWorkflow,
    ) ||
    validateReservation(
      current,
    ) !== decision ||
    !validWorkflow(
      currentWorkflow,
    ) ||
    event.id !==
      prepared.notification_event_id ||
    event.event_key !== eventKey ||
    event.notification_type !==
      "reservation_deposit_decision" ||
    event.deposit_decision !==
      decision ||
    event.notification_status !==
      "pending" ||
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
    messageBody =
      buildMessage(
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

  if (
    messageBody !== originalBody
  ) {
    return fail(
      "Notification contents changed during preparation.",
      409,
    );
  }

  // Claim exactly once before starting Studio.

  const {
    data: claimData,
    error: claimError,
  } = await admin.rpc(
    notificationKind === "waiver"
      ? "claim_reservation_deposit_waiver"
      : "claim_reservation_deposit_decision",
    {
      p_reservation_id:
        reservationId,
    },
  );

  if (claimError) {
    return fail(
      "Deposit notification could not be claimed. Check its status before retrying.",
      claimError.code === "42501"
        ? 403
        : claimError.code === "22023"
          ? 409
          : 500,
    );
  }

  const claim =
    firstRow<ClaimResult>(
      claimData,
    );

  if (
    !validClaim(
      claim,
      prepared,
    )
  ) {
    return fail(
      "Notification claim could not be verified. Do not send.",
      500,
    );
  }

  // ====================================================
  // SEND THROUGH TWILIO STUDIO
  // ====================================================

  let studioExecutionSid:
    string | null = null;

  let messageSid:
    string | null = null;

  try {
    const execution =
      await startDepositStudioExecution(
        config,
        eventKey,
        reservationId,
        decision,
        current.customer_phone,
        messageBody,
      );

    studioExecutionSid =
      execution.sid;

    // Retrieve the actual SMS SID from the widget.
    // This does not generate another message.

    messageSid =
      await findVerifiedStudioSmsSid(
        config,
        execution.sid,
        current.customer_phone,
        messageBody,
      );
  } catch (error) {
    console.error(
      "Studio deposit execution could not be verified.",
      {
        reservationId,
        category:
          error instanceof Error
            ? error.message
            : "UNKNOWN_ERROR",
      },
    );

    // Never automatically repeat
    // the Studio execution POST.
  }

  // ====================================================
  // COMPLETE EXISTING NOTIFICATION RECORD
  // ====================================================

  const {
    data: finishData,
    error: finishError,
  } = await admin.rpc(
    "finish_reservation_deposit_decision",
    {
      p_notification_event_id:
        claim.notification_event_id,

      p_claim_token:
        claim.claim_token,

      p_result:
        messageSid
          ? "accepted"
          : "uncertain",

      p_message_sid:
        messageSid,
    },
  );

  const finished =
    firstRow<FinishedDecision>(
      finishData,
    );

  if (
    finishError ||
    !finished ||
    finished.notification_event_id !==
      claim.notification_event_id ||
    finished.notification_status !==
      (
        messageSid
          ? "sent"
          : "unknown"
      ) ||
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
        code:
          finishError?.code ??
          "INVALID_RESULT",
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
        failureCode:
          "STUDIO_SMS_ACCEPTANCE_UNVERIFIED",
        studioExecutionSid,
        error:
          "Studio SMS acceptance could not be verified. No automatic resend. Reconcile the Studio execution, Twilio Messages, and Supabase notification history.",
      },
      502,
    );
  }

  // ====================================================
  // REGISTER ACTUAL TWILIO MESSAGE OWNERSHIP
  // ====================================================

  const ownership =
    await registerOutboundOwnership(
      admin,
      reservationId,
      messageSid,
    );

  if (
    ownership.status ===
    "needs_attention"
  ) {
    console.error(
      "Deposit SMS accepted; ownership needs reconciliation.",
      {
        reservationId,
        notificationEventId:
          claim.notification_event_id,
        reason:
          ownership.reason,
      },
    );

    return respond(
      {
        success: true,
        accepted: true,
        reservationId,
        notificationEventId:
          claim.notification_event_id,
        notificationStatus:
          "sent",
        depositDecision:
          decision,
        messageSid,
        messageStatus:
          "verified_twilio_message",
        historyRegistration:
          "needs_attention",
        historyFailureCode:
          ownership.reason,
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
    notificationStatus:
      "sent",
    depositDecision:
      decision,
    messageSid,
    messageStatus:
      "verified_twilio_message",
    historyRegistration:
      "registered",
    historyRegistrationOutcome:
      ownership.outcome,
    message:
      "Twilio accepted the SMS and reservation-specific message ownership was registered. Handset delivery is not yet verified.",
  });
}