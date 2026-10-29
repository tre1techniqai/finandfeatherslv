import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import twilio from "twilio";

import { createSupabaseServerClient } from "@/lib/supabase/server";

const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const E164 = /^\+[1-9]\d{7,14}$/;
const ACCOUNT_SID = /^AC[0-9a-f]{32}$/i;
const MESSAGE_SID = /^SM[0-9a-f]{32}$/i;

const MAX_REQUEST_BYTES = 4096;
const MAX_MESSAGE_CHARS = 1600;

type RouteContext = {
  params: Promise<{
    conversationId: string;
  }>;
};

type OperationRow = {
  operation_id: string;
  operation_status: string;
};

type SubmissionRow = {
  operation_id: string;
  message_body: string;
  guest_phone: string;
  restaurant_phone: string;
};

type ValidMessage = {
  body: string;
  clientRequestId: string;
  reservationId: string | null;
};

type ParsedMessage =
  | {
      ok: true;
      value: ValidMessage;
    }
  | {
      ok: false;
      status: number;
      error: string;
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

function isRecord(
  value: unknown,
): value is Record<string, unknown> {
  return (
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value)
  );
}

function validOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");

  if (!origin) {
    return false;
  }

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

function sharedMessagingConfigured(): boolean {
  return (
    process.env.RESERVATION_SHARED_SMS_SEND_ENABLED === "true" &&
    process.env.RESERVATION_SHARED_SMS_ROUTING_ENABLED === "true" &&
    process.env.RESERVATION_SHARED_SMS_ACTIVATION_VERIFIED === "true" &&
    process.env.RESERVATION_STAFF_INBOUND_ROUTING_VERIFIED === "true" &&
    process.env.RESERVATION_STUDIO_STAFF_ROUTING_ENABLED === "true" &&
    process.env.RESERVATION_STUDIO_HANDOFF_FENCE_ENABLED === "true"
  );
}

function oneRow<T>(
  data: unknown,
  valid: (value: unknown) => value is T,
): T | null {
  if (!Array.isArray(data) || data.length !== 1) {
    return null;
  }

  return valid(data[0]) ? data[0] : null;
}

function isOperationRow(
  value: unknown,
): value is OperationRow {
  return (
    isRecord(value) &&
    typeof value.operation_id === "string" &&
    UUID.test(value.operation_id) &&
    typeof value.operation_status === "string"
  );
}

function isSubmissionRow(
  value: unknown,
): value is SubmissionRow {
  return (
    isRecord(value) &&
    typeof value.operation_id === "string" &&
    UUID.test(value.operation_id) &&
    typeof value.message_body === "string" &&
    typeof value.guest_phone === "string" &&
    E164.test(value.guest_phone) &&
    typeof value.restaurant_phone === "string" &&
    E164.test(value.restaurant_phone)
  );
}

async function readMessage(
  request: Request,
): Promise<ParsedMessage> {
  const contentType =
    request.headers.get("content-type") ?? "";

  if (
    !/^application\/json(?:\s*;|$)/i.test(
      contentType,
    )
  ) {
    return {
      ok: false,
      status: 415,
      error: "JSON request required.",
    };
  }

  const declaredLength =
    request.headers.get("content-length");

  if (
    declaredLength !== null &&
    (
      !/^\d+$/.test(declaredLength) ||
      !Number.isSafeInteger(Number(declaredLength))
    )
  ) {
    return {
      ok: false,
      status: 400,
      error: "Invalid request length.",
    };
  }

  if (
    declaredLength !== null &&
    Number(declaredLength) > MAX_REQUEST_BYTES
  ) {
    return {
      ok: false,
      status: 413,
      error: "Request too large.",
    };
  }

  if (!request.body) {
    return {
      ok: false,
      status: 400,
      error: "Message is required.",
    };
  }

  let raw = "";
  let bytes = 0;

  const reader = request.body.getReader();
  const decoder = new TextDecoder(
    "utf-8",
    {
      fatal: true,
    },
  );

  try {
    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        break;
      }

      bytes += value.byteLength;

      if (bytes > MAX_REQUEST_BYTES) {
        await reader.cancel();

        return {
          ok: false,
          status: 413,
          error: "Request too large.",
        };
      }

      raw += decoder.decode(
        value,
        {
          stream: true,
        },
      );
    }

    raw += decoder.decode();
  } catch {
    return {
      ok: false,
      status: 400,
      error: "Invalid JSON request.",
    };
  } finally {
    reader.releaseLock();
  }

  let value: unknown;

  try {
    value = JSON.parse(raw);
  } catch {
    return {
      ok: false,
      status: 400,
      error: "Invalid JSON request.",
    };
  }

  if (
    !isRecord(value) ||
    Object.keys(value).length !== 3 ||
    !Object.prototype.hasOwnProperty.call(
      value,
      "body",
    ) ||
    !Object.prototype.hasOwnProperty.call(
      value,
      "clientRequestId",
    ) ||
    !Object.prototype.hasOwnProperty.call(
      value,
      "reservationId",
    ) ||
    typeof value.body !== "string" ||
    typeof value.clientRequestId !== "string" ||
    !UUID.test(value.clientRequestId) ||
    (
      value.reservationId !== null &&
      (
        typeof value.reservationId !== "string" ||
        !UUID.test(value.reservationId)
      )
    )
  ) {
    return {
      ok: false,
      status: 400,
      error:
        "body, clientRequestId UUID, and reservationId UUID or null are required.",
    };
  }

  const body = value.body.trim();

  if (
    !body ||
    body.length > MAX_MESSAGE_CHARS ||
    /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(
      body,
    )
  ) {
    return {
      ok: false,
      status: 400,
      error:
        "Message must contain 1–1600 valid characters.",
    };
  }

  return {
    ok: true,
    value: {
      body,
      clientRequestId: value.clientRequestId,
      reservationId: value.reservationId as
        | string
        | null,
    },
  };
}

export async function POST(
  request: Request,
  context: RouteContext,
): Promise<Response> {
  // Disabled until shared schema, inbound capture,
  // Studio activation and routing have been verified.
  if (!sharedMessagingConfigured()) {
    return fail(
      "Shared SMS is not enabled until routing, inbound handling and activation are verified.",
      503,
    );
  }

  if (!validOrigin(request)) {
    return fail(
      "Request origin is not authorized.",
      403,
    );
  }

  const { conversationId } = await context.params;

  if (!UUID.test(conversationId)) {
    return fail(
      "Invalid conversation ID.",
      400,
    );
  }

  try {
    const supabase =
      await createSupabaseServerClient();

    const {
      data: claimsData,
      error: claimsError,
    } = await supabase.auth.getClaims();

    const userId = claimsData?.claims?.sub;

    if (
      claimsError ||
      typeof userId !== "string" ||
      !UUID.test(userId)
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
      .eq("user_id", userId)
      .eq("is_active", true)
      .maybeSingle();

    if (
      roleError ||
      role?.is_active !== true ||
      role.role !== "manager"
    ) {
      return fail(
        "Manager access required.",
        403,
      );
    }

    const parsed = await readMessage(request);

    if (!parsed.ok) {
      return fail(
        parsed.error,
        parsed.status,
      );
    }

    const {
      body,
      clientRequestId,
      reservationId,
    } = parsed.value;

    const from = process.env.TWILIO_FROM_NUMBER;
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
      !from ||
      !E164.test(from) ||
      !accountSid ||
      !ACCOUNT_SID.test(accountSid) ||
      !authToken ||
      !supabaseUrl ||
      !serviceKey
    ) {
      return fail(
        "Restaurant SMS or trusted ledger access is not configured.",
        503,
      );
    }

    // Authenticated-manager RPC:
    //
    // Checks the manager's active role,
    // conversation mode, reservation linkage,
    // idempotency key and message content.
    //
    // No exclusive ownership claim is required.
    //
    // No browser-supplied destination phone
    // is accepted.
    const {
      data: registeredData,
      error: registeredError,
    } = await supabase.rpc(
      "register_reservation_shared_sms",
      {
        p_conversation_id: conversationId,
        p_reservation_id: reservationId,
        p_client_request_id: clientRequestId,
        p_message_body: body,
      },
    );

    if (registeredError) {
      console.error(
        "Shared SMS registration failed.",
        {
          conversationId,
          code: registeredError.code,
        },
      );

      return fail(
        "Shared SMS authorization failed; no new submission was started.",
        registeredError.code === "42501"
          ? 403
          : 409,
      );
    }

    const registered = oneRow(
      registeredData,
      isOperationRow,
    );

    if (!registered) {
      return fail(
        "SMS operation registration could not be verified.",
        503,
      );
    }

    // The RPC may return an existing registered
    // operation for an identical idempotency key.
    //
    // Only the service-role begin RPC can grant
    // a Twilio attempt. Its locked state
    // transition prevents a second submission.
    if (
      registered.operation_status !== "registered"
    ) {
      return respond(
        {
          success: false,
          duplicate: true,
          operationId: registered.operation_id,
          operationStatus:
            registered.operation_status,
          error:
            "This SMS request was already processed or is in progress. Do not resend it.",
        },
        409,
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

    // The service-role RPC must atomically
    // change 'registered' to 'submitting',
    // while holding the shared conversation lock.
    //
    // This is the only permitted authorization
    // for an actual Twilio submission.
    const {
      data: submissionData,
      error: submissionError,
    } = await admin.rpc(
      "begin_reservation_shared_sms_submission",
      {
        p_operation_id:
          registered.operation_id,
      },
    );

    if (submissionError) {
      console.error(
        "Shared SMS submission authorization failed.",
        {
          conversationId,
          operationId: registered.operation_id,
          code: submissionError.code,
        },
      );

      return fail(
        "SMS submission was not authorized. Do not resend this request.",
        409,
      );
    }

    const submission = oneRow(
      submissionData,
      isSubmissionRow,
    );

    if (
      !submission ||
      submission.operation_id !==
        registered.operation_id ||
      submission.message_body !== body ||
      submission.restaurant_phone !== from ||
      submission.guest_phone === from
    ) {
      // The database may already have authorized
      // an attempt. Never automatically retry
      // after an unexpected response.
      console.error(
        "Shared SMS submission validation failed.",
        {
          conversationId,
          operationId: registered.operation_id,
        },
      );

      return fail(
        "SMS submission details could not be verified; the operation requires review. Do not resend.",
        503,
      );
    }

    let messageSid: string | null = null;
    let messageStatus: string | null = null;

    try {
      const client = twilio(
        accountSid,
        authToken,
        {
          autoRetry: false,
        },
      );

      // Twilio does not supply an application
      // idempotency key for this API operation.
      //
      // Our database is the submission fence.
      const message = await client.messages.create({
        from: submission.restaurant_phone,
        to: submission.guest_phone,
        body: submission.message_body,
      });

      messageSid = message.sid;
      messageStatus = message.status;
    } catch (error) {
      console.error(
        "Shared SMS Twilio outcome uncertain.",
        {
          conversationId,
          operationId: registered.operation_id,
          name:
            error instanceof Error
              ? error.name
              : "UnknownError",
        },
      );

      const {
        error: finalizeError,
      } = await admin.rpc(
        "finalize_reservation_shared_sms",
        {
          p_operation_id:
            registered.operation_id,
          p_status: "uncertain",
          p_twilio_message_sid: null,
          p_outcome_note:
            "Twilio API result unavailable; reconciliation required.",
        },
      );

      if (finalizeError) {
        console.error(
          "Unable to record uncertain shared SMS outcome.",
          {
            operationId: registered.operation_id,
            code: finalizeError.code,
          },
        );
      }

      return respond(
        {
          success: false,
          operationId: registered.operation_id,
          operationStatus: "uncertain",
          error:
            "Message outcome could not be confirmed. Do not resend; contact an administrator.",
        },
        502,
      );
    }

    if (
      !messageSid ||
      !MESSAGE_SID.test(messageSid)
    ) {
      const {
        error: finalizeError,
      } = await admin.rpc(
        "finalize_reservation_shared_sms",
        {
          p_operation_id:
            registered.operation_id,
          p_status: "uncertain",
          p_twilio_message_sid: null,
          p_outcome_note:
            "Twilio response lacked a valid Message SID.",
        },
      );

      if (finalizeError) {
        console.error(
          "Unable to record invalid Twilio response.",
          {
            operationId: registered.operation_id,
            code: finalizeError.code,
          },
        );
      }

      return fail(
        "SMS acceptance could not be verified. Do not resend.",
        502,
      );
    }

    const {
      data: finalizedData,
      error: finalizedError,
    } = await admin.rpc(
      "finalize_reservation_shared_sms",
      {
        p_operation_id:
          registered.operation_id,
        p_status: "accepted",
        p_twilio_message_sid: messageSid,
        p_outcome_note:
          "Twilio Messages.create returned a Message SID.",
      },
    );

    const finalized = oneRow(
      finalizedData,
      isOperationRow,
    );

    if (
      finalizedError ||
      !finalized ||
      finalized.operation_id !==
        registered.operation_id ||
      finalized.operation_status !== "accepted"
    ) {
      console.error(
        "Twilio SMS accepted but shared ledger finalization failed.",
        {
          conversationId,
          operationId: registered.operation_id,
          code: finalizedError?.code,
        },
      );

      return respond(
        {
          success: false,
          operationId: registered.operation_id,
          messageSid,
          error:
            "Twilio accepted the SMS, but ledger confirmation needs administrative review. Do not resend.",
        },
        502,
      );
    }

    return respond({
      success: true,
      conversationId,
      operationId: registered.operation_id,
      messageSid,
      status: messageStatus,
      operationStatus: "accepted",
    });
  } catch (error) {
    console.error(
      "Shared SMS endpoint failed.",
      {
        conversationId,
        name:
          error instanceof Error
            ? error.name
            : "UnknownError",
      },
    );

    return fail(
      "Unable to process the SMS request. Do not automatically retry an uncertain send.",
      500,
    );
  }
}