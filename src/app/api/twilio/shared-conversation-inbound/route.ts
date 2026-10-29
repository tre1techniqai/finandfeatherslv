import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

import {
  decideSharedConversationRoute,
  type OwnershipLookup,
  type SharedConversationLookup,
} from "@/lib/reservations/conversation-routing-decision";

import {
  decideSharedInboundRecording,
  type LegacyInboundOwnership,
  type SharedInboundLookup,
} from "@/lib/reservations/shared-inbound-recording-policy";

import {
  verifyInboundTwilioMessage,
} from "@/lib/reservations/verified-inbound-twilio-message";

import {
  resolveReservationInboundContext,
} from "@/lib/reservations/reservation-inbound-context";

const E164 = /^\+[1-9]\d{7,14}$/;
const MESSAGE_SID = /^SM[0-9a-f]{32}$/i;
const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const MAX_REQUEST_BYTES = 2048;
const CLOCK_SKEW_SECONDS = 300;
const DATABASE_WORK_BUDGET_MS = 5000;

/**
 * Each database operation receives only the remaining request budget.
 * A timed-out write may still commit on the database server; do not
 * automatically retry recording RPCs.
 */
function remainingDatabaseSignal(deadlineAt: number): AbortSignal | null {
  const remainingMs = deadlineAt - Date.now();
  if (remainingMs <= 0) return null;
  return AbortSignal.timeout(Math.ceil(remainingMs));
}


type InboundRequest = {
  from: string;
  to: string;
  messageSid: string;
};

type LegacyStatus =
  | "automation"
  | "handoff_pending"
  | "staff"
  | "released";

type SharedMode =
  | "automation"
  | "transitioning_to_staff"
  | "staff";

type RecordingResult = {
  conversation_id: string;
  inbound_event_id: string;
  duplicate: boolean;
  conversation_mode: SharedMode;
};

function respond(
  data: Record<string, unknown>,
  status = 200,
): NextResponse {
  return NextResponse.json(data, {
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
      recorded: false,
      error,
    },
    status,
  );
}

function configuredForRecording(): boolean {
  return (
    process.env.RESERVATION_SHARED_SMS_INBOUND_RECORDING_ENABLED ===
      "true" &&
    process.env.RESERVATION_SHARED_SMS_ROUTING_ENABLED ===
      "true" &&
    process.env.RESERVATION_STUDIO_STAFF_ROUTING_ENABLED ===
      "true" &&
    process.env.RESERVATION_STUDIO_HANDOFF_FENCE_ENABLED ===
      "true" &&
    process.env.RESERVATION_STAFF_INBOUND_ROUTING_VERIFIED ===
      "true"
  );
}

function verifySignature(
  signature: string | null,
  timestamp: string | null,
  body: string,
  secret: string,
): boolean {
  if (
    !signature ||
    !timestamp ||
    !/^\d{10}$/.test(timestamp) ||
    !/^[0-9a-f]{64}$/i.test(signature)
  ) {
    return false;
  }

  const seconds = Number(timestamp);

  if (
    !Number.isSafeInteger(seconds) ||
    Math.abs(Math.floor(Date.now() / 1000) - seconds) >
      CLOCK_SKEW_SECONDS
  ) {
    return false;
  }

  const expected = createHmac("sha256", secret)
    .update(`${timestamp}.${body}`, "utf8")
    .digest();

  const received = Buffer.from(signature, "hex");

  return (
    received.length === expected.length &&
    timingSafeEqual(expected, received)
  );
}

function parsePayload(
  value: unknown,
): InboundRequest | null {
  if (
    !value ||
    typeof value !== "object" ||
    Array.isArray(value)
  ) {
    return null;
  }

  const fields = value as Record<string, unknown>;

  if (
    Object.keys(fields).length !== 3 ||
    typeof fields.from !== "string" ||
    typeof fields.to !== "string" ||
    typeof fields.messageSid !== "string" ||
    !E164.test(fields.from) ||
    !E164.test(fields.to) ||
    !MESSAGE_SID.test(fields.messageSid) ||
    fields.from === fields.to
  ) {
    return null;
  }

  return {
    from: fields.from,
    to: fields.to,
    messageSid: fields.messageSid,
  };
}

function validLegacyStatus(
  value: unknown,
): value is LegacyStatus {
  return (
    value === "automation" ||
    value === "handoff_pending" ||
    value === "staff" ||
    value === "released"
  );
}

function validSharedMode(
  value: unknown,
): value is SharedMode {
  return (
    value === "automation" ||
    value === "transitioning_to_staff" ||
    value === "staff"
  );
}

function validRecordingResult(
  value: unknown,
): value is RecordingResult {
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
    typeof row.inbound_event_id === "string" &&
    UUID.test(row.inbound_event_id) &&
    typeof row.duplicate === "boolean" &&
    validSharedMode(row.conversation_mode)
  );
}


function legacyForInbound(
  status: LegacyStatus | null,
): LegacyInboundOwnership {
  switch (status) {
    case null:
      return "none";

    case "automation":
      return "automation";

    case "handoff_pending":
      return "pending";

    case "staff":
      return "staff";

    case "released":
      // Preserve the actual legacy status.
      // The shared inbound eligibility policy permits
      // released ownership only when independently
      // verified shared staff mode and routing
      // safeguards are satisfied.
      return "released";
  }
}


export async function POST(
  request: Request,
): Promise<NextResponse> {
  // Shared inbound recording remains disabled until
  // the database, Studio handoff, and HTTP integration
  // tests have been verified.
  //
  // Do not enable this route based solely on a
  // successful TypeScript or production build.

  const databaseDeadlineAt = Date.now() + DATABASE_WORK_BUDGET_MS;

  if (!configuredForRecording()) {
    return fail(
      "Shared inbound recording is not enabled.",
      503,
    );
  }

  const secret =
    process.env.RESERVATION_STUDIO_ROUTER_SECRET;

  const restaurantPhone =
    process.env.TWILIO_FROM_NUMBER;

  const supabaseUrl =
    process.env.SUPABASE_URL ??
    process.env.NEXT_PUBLIC_SUPABASE_URL;

  const serviceKey =
    process.env.SUPABASE_SECRET_KEY ??
    process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (
    !secret ||
    Buffer.byteLength(secret, "utf8") < 32 ||
    !restaurantPhone ||
    !E164.test(restaurantPhone) ||
    !supabaseUrl ||
    !serviceKey
  ) {
    console.error(
      "Shared inbound recording configuration is incomplete.",
    );

    return fail(
      "Shared inbound recording is unavailable.",
      503,
    );
  }

  if (
    !/^application\/json(?:\s*;|$)/i.test(
      request.headers.get("content-type") ?? "",
    )
  ) {
    return fail(
      "Unsupported content type.",
      415,
    );
  }

  const contentLength =
    request.headers.get("content-length");

  if (
    contentLength !== null &&
    (
      !/^\d+$/.test(contentLength) ||
      !Number.isSafeInteger(Number(contentLength))
    )
  ) {
    return fail(
      "Invalid request length.",
      400,
    );
  }

  if (
    contentLength !== null &&
    Number(contentLength) > MAX_REQUEST_BYTES
  ) {
    return fail(
      "Request too large.",
      413,
    );
  }

  let rawBody: string;

  try {
    rawBody = await request.text();
  } catch {
    return fail(
      "Invalid request body.",
      400,
    );
  }

  if (
    Buffer.byteLength(rawBody, "utf8") >
    MAX_REQUEST_BYTES
  ) {
    return fail(
      "Request too large.",
      413,
    );
  }

  if (
    !verifySignature(
      request.headers.get("x-ff-signature"),
      request.headers.get("x-ff-timestamp"),
      rawBody,
      secret,
    )
  ) {
    return fail(
      "Unauthorized.",
      401,
    );
  }

  let parsed: unknown;

  try {
    parsed = JSON.parse(rawBody);
  } catch {
    return fail(
      "Invalid JSON.",
      400,
    );
  }

  const payload = parsePayload(parsed);

  if (
    !payload ||
    payload.to !== restaurantPhone
  ) {
    return fail(
      "Invalid inbound message details.",
      400,
    );
  }

  try {
    const legacySignal = remainingDatabaseSignal(databaseDeadlineAt);
    if (!legacySignal) {
      return fail("Inbound request deadline exceeded.", 503);
    }

    const supabase = createClient(
      supabaseUrl,
      serviceKey,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
        global: {
          fetch: (input, init) => {
            const deadlineSignal = remainingDatabaseSignal(databaseDeadlineAt);
            if (!deadlineSignal) {
              return Promise.reject(new Error("Inbound database request deadline exceeded."));
            }

            const signal = init?.signal
              ? AbortSignal.any([init.signal, deadlineSignal])
              : deadlineSignal;

            return fetch(input, { ...init, signal });
          },
        },
      },
    );

    // ======================================================
    // 1. Read legacy ownership first.
    // ======================================================

    const {
        data: legacyData,
        error: legacyError,
        } = await supabase
        .from("reservation_conversation_ownership")
        .select("ownership_status")
        .eq("guest_phone", payload.from)
        .eq("restaurant_phone", restaurantPhone)
        .maybeSingle()
        .retry(false);

    if (legacyError) {
      console.error(
        "Shared inbound legacy lookup failed.",
        {
          code: legacyError.code,
        },
      );

      return fail(
        "Conversation eligibility could not be verified.",
        503,
      );
    }

    const rawLegacy =
      legacyData?.ownership_status ?? null;

    if (
      rawLegacy !== null &&
      !validLegacyStatus(rawLegacy)
    ) {
      return fail(
        "Unknown legacy conversation state.",
        503,
      );
    }

    const legacy: OwnershipLookup =
      rawLegacy === null
        ? {
            kind: "not_found",
          }
        : {
            kind: "found",
            status: rawLegacy,
          };

    const inboundLegacy =
      legacyForInbound(rawLegacy);

    // ======================================================
    // 2. Read shared routing through the trusted RPC.
    // ======================================================

    const sharedSignal = remainingDatabaseSignal(databaseDeadlineAt);
    if (!sharedSignal) {
      return fail("Inbound request deadline exceeded.", 503);
    }

    const {
      data: sharedData,
      error: sharedError,
    } = await supabase
      .rpc(
        "get_reservation_shared_conversation_route",
        {
          p_restaurant_phone: restaurantPhone,
          p_guest_phone: payload.from,
        },
      )
      .maybeSingle()
      .retry(false);

    if (sharedError) {
      console.error(
        "Shared inbound routing lookup failed.",
        {
          code: sharedError.code,
        },
      );

      return fail(
        "Shared conversation lookup unavailable.",
        503,
      );
    }

    let shared: SharedConversationLookup;
    let inboundShared: SharedInboundLookup;

    if (sharedData == null) {
      shared = {
        kind: "not_found",
      };

      inboundShared = {
        status: "missing",
      };
    } else {
      const mode = (
        sharedData as Record<string, unknown>
      ).mode;

      if (!validSharedMode(mode)) {
        return fail(
          "Unknown shared conversation mode.",
          503,
        );
      }

      shared = {
        kind: "found",
        mode,
      };

      inboundShared = {
        status: "found",
        mode,
      };
    }

    // ======================================================
    // 3. Require both routing policies to approve.
    // ======================================================

    // Every required feature gate was checked at
    // request entry. These values represent that
    // enabled configuration; they do not independently
    // establish Studio deployment readiness.

    const routingReadiness = {
      sharedRoutingEnabled: true,
      staffRoutingEnabled: true,
      handoffFenceEnabled: true,
    };

    const routingDecision =
      decideSharedConversationRoute(
        legacy,
        shared,
        routingReadiness,
      );

    const eligibility =
      decideSharedInboundRecording({
        shared: inboundShared,
        legacy: inboundLegacy,
        readiness: {
          sharedRoutingEnabled: true,
          staffRoutingVerified: true,
          studioHandoffFenceEnabled: true,
          inboundRecordingEnabled: true,
        },
      });

    if (
      routingDecision.route !== "staff" ||
      eligibility.decision !== "record"
    ) {
      // Existing automation remains responsible for
      // messages that are explicitly safe to skip.
      //
      // No shared event is written, and no SMS is sent.

      if (
        routingDecision.route === "automation" &&
        eligibility.decision === "skip"
      ) {
        return respond({
          success: true,
          recorded: false,
          skipped: true,
          reason: "EXISTING_AUTOMATION_CONVERSATION",
        });
      }

      return fail(
        "Inbound recording is not authorized for this conversation state.",
        409,
      );
    }

    // ======================================================
    // 4. Verify the exact inbound message with Twilio.
    // ======================================================

    // A valid request signature is not enough to
    // establish the identity of a Twilio Message SID.
    //
    // This call uses the normal server-side Twilio SDK.
    // No synthetic test client is supplied by this route.
    //
    // The verified helper has no SMS send capability.

    if (!remainingDatabaseSignal(databaseDeadlineAt)) {
      return fail("Inbound request deadline exceeded.", 503);
    }

    const verified =
      await verifyInboundTwilioMessage({
        messageSid: payload.messageSid,
        guestPhone: payload.from,
        restaurantPhone,
      });

    if (!verified.verified) {
      switch (verified.reason) {
        case "INVALID_INPUT":
          return fail(
            "Invalid inbound message details.",
            400,
          );

        case "TWILIO_NOT_CONFIGURED":
          console.error(
            "Shared inbound Twilio configuration is incomplete.",
          );

          return fail(
            "Inbound message verification unavailable.",
            503,
          );

        case "MESSAGE_NOT_FOUND":
          return fail(
            "Twilio message not found.",
            404,
          );

        case "MESSAGE_IDENTITY_MISMATCH":
          return fail(
            "Twilio message identity mismatch.",
            409,
          );

        case "INVALID_MESSAGE_TIMESTAMP":
          return fail(
            "Twilio message timestamp is invalid.",
            409,
          );

        case "MESSAGE_LOOKUP_FAILED":
          return fail(
            "Twilio message verification failed.",
            502,
          );
      }
    }

    // ======================================================
    // 5. Resolve reservation attribution (read-only).
    // ======================================================

    // A verified phone pair is only transport identity.
    // It does not identify the reservation that owns this SMS.
    // The resolver uses the body retrieved directly from Twilio,
    // never an untrusted body supplied in the signed payload.
    //
    // Coordinator persistence is not deployed. Do not attach
    // this Message SID to a reservation, alter Studio state,
    // or send any follow-up from this read-only decision.
    //
    // Reservation attribution is mandatory for recording. Any
    // unresolved/ambiguous reply must fail closed without writing.

    if (verified.message.messageBody === null) {
      return fail("Verified message body unavailable for attribution.", 409);
    }
    if (!remainingDatabaseSignal(databaseDeadlineAt)) {
      return fail("Inbound request deadline exceeded.", 503);
    }

    const context = await resolveReservationInboundContext(supabase, {
      from: verified.message.guestPhone,
      body: verified.message.messageBody,
    });
    if (!context.success) {
      console.warn("Reservation inbound attribution unavailable.", {
        reason: context.error,
      });
      return fail("Reservation attribution unavailable.", 503);
    }
    if (context.attribution.decision !== "attributed") {
      return fail("Reservation attribution unresolved.", 409);
    }
    const attributedReservationId = context.attribution.reservationId;
    if (!UUID.test(attributedReservationId)) {
      return fail("Invalid attributed reservation.", 503);
    }

    // Protected, reservation-specific lookup: no direct table grants.
    if (!remainingDatabaseSignal(databaseDeadlineAt)) {
      return fail("Inbound request deadline exceeded.", 503);
    }
    const { data: scopedRows, error: scopedError } = await supabase.rpc(
      "get_reservation_shared_conversation_for_inbound",
      {
        p_reservation_id: attributedReservationId,
        p_restaurant_phone: restaurantPhone,
        p_guest_phone: payload.from,
      },
    ).retry(false);
    if (scopedError) {
      console.error("Reservation-scoped conversation lookup failed.", {
        code: scopedError.code,
      });
      return fail("Reservation conversation lookup unavailable.", 503);
    }
    if (!Array.isArray(scopedRows) || scopedRows.length !== 1) {
      return fail("Verified reservation conversation unavailable.", 409);
    }
    const scoped = scopedRows[0] as Record<string, unknown>;
    if (
      typeof scoped.conversation_id !== "string" ||
      !UUID.test(scoped.conversation_id) ||
      typeof scoped.reservation_id !== "string" ||
      scoped.reservation_id.toLowerCase() !== attributedReservationId.toLowerCase() ||
      scoped.conversation_mode !== "staff" ||
      scoped.staff_activated !== true
    ) {
      return fail("Reservation conversation is not activated for staff.", 409);
    }
    const attributedConversationId = scoped.conversation_id;

    // ======================================================
    // 6. Record verified inbound metadata.
    // ======================================================

    // The review-only recording RPC independently
    // requires an existing activated staff conversation
    // while holding the conversation row lock.
    //
    // It also enforces globally unique Message SIDs
    // and monotonic conversation activity timestamps.
    //
    // IMPORTANT:
    // The RPC and its permissions have not yet been
    // deployed or runtime-tested in production.

    const recordingSignal = remainingDatabaseSignal(databaseDeadlineAt);
    if (!recordingSignal) {
      return fail("Inbound request deadline exceeded.", 503);
    }

    const {
      data: recordedData,
      error: recordedError,
    } = await supabase.rpc(
      "record_reservation_shared_inbound",
      {
        p_restaurant_phone: restaurantPhone,
        p_guest_phone: payload.from,
        p_twilio_message_sid:
          verified.message.messageSid,
        p_message_created_at:
          verified.message.messageCreatedAt,
        p_reservation_id: attributedReservationId,
        p_conversation_id: attributedConversationId,
      },
    )
      .retry(false);

    if (recordedError) {
      console.error(
        "Shared inbound recording RPC failed.",
        {
          code: recordedError.code,
        },
      );

      return fail(
        "Unable to record verified inbound message.",
        503,
      );
    }

    if (
      !Array.isArray(recordedData) ||
      recordedData.length !== 1 ||
      !validRecordingResult(recordedData[0])
    ) {
      return fail(
        "Inbound recording result could not be verified.",
        503,
      );
    }

    const result = recordedData[0];

    // Response consistency is checked independently
    // of the database's row-locked staff-mode check.
    //
    // A response check alone cannot undo a write.

    if (
      result.conversation_mode !== "staff" ||
      result.conversation_id.toLowerCase() !== attributedConversationId.toLowerCase()
    ) {
      console.error(
        "Shared inbound recording returned a non-staff mode.",
      );

      return fail(
        "Inbound recording state changed; administrative review required.",
        503,
      );
    }

    return respond(
      {
        success: true,
        recorded: true,
        conversationId: result.conversation_id,
        inboundEventId: result.inbound_event_id,
        duplicate: result.duplicate,
        conversationMode: result.conversation_mode,
      },
      result.duplicate ? 200 : 201,
    );
  } catch (error) {
    console.error(
      "Shared inbound recording failed.",
      {
        category: "SHARED_INBOUND_RECORDING_ERROR",
        name:
          error instanceof Error
            ? error.name
            : "UnknownError",
      },
    );

    return fail(
      "Unable to process inbound message.",
      502,
    );
  }
}