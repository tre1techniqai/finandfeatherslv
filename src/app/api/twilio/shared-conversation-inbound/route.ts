import {
  createHmac,
  timingSafeEqual,
} from "node:crypto";

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

const E164 = /^\+[1-9]\d{7,14}$/;
const MESSAGE_SID = /^SM[0-9a-f]{32}$/i;

const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const MAX_REQUEST_BYTES = 2048;
const CLOCK_SKEW_SECONDS = 300;
const DATABASE_WORK_BUDGET_MS = 5000;
const MAX_RESERVATION_CANDIDATES = 100;

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

type ScopedConversation = {
  conversation_id: string;
  reservation_id: string;
  conversation_mode: SharedMode;
  staff_activated: boolean;
};

type VerifiedAssociation = {
  reservationId: string;
  conversationId: string;
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

function remainingDatabaseSignal(
  deadlineAt: number,
): AbortSignal | null {
  const remainingMs = deadlineAt - Date.now();

  if (remainingMs <= 0) {
    return null;
  }

  return AbortSignal.timeout(
    Math.ceil(remainingMs),
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
    Math.abs(
      Math.floor(Date.now() / 1000) - seconds,
    ) > CLOCK_SKEW_SECONDS
  ) {
    return false;
  }

  const expected = createHmac(
    "sha256",
    secret,
  )
    .update(
      `${timestamp}.${body}`,
      "utf8",
    )
    .digest();

  const received = Buffer.from(
    signature,
    "hex",
  );

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

  const fields =
    value as Record<string, unknown>;

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

  const row =
    value as Record<string, unknown>;

  return (
    typeof row.conversation_id === "string" &&
    UUID.test(row.conversation_id) &&
    typeof row.inbound_event_id === "string" &&
    UUID.test(row.inbound_event_id) &&
    typeof row.duplicate === "boolean" &&
    validSharedMode(
      row.conversation_mode,
    )
  );
}

function validScopedConversation(
  value: unknown,
): value is ScopedConversation {
  if (
    !value ||
    typeof value !== "object" ||
    Array.isArray(value)
  ) {
    return false;
  }

  const row =
    value as Record<string, unknown>;

  return (
    typeof row.conversation_id === "string" &&
    UUID.test(row.conversation_id) &&
    typeof row.reservation_id === "string" &&
    UUID.test(row.reservation_id) &&
    validSharedMode(row.conversation_mode) &&
    typeof row.staff_activated === "boolean"
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
      return "released";
  }
}

export async function POST(
  request: Request,
): Promise<NextResponse> {
  const databaseDeadlineAt =
    Date.now() + DATABASE_WORK_BUDGET_MS;

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

  const declaredLength =
    request.headers.get("content-length");

  if (
    declaredLength !== null &&
    (
      !/^\d+$/.test(declaredLength) ||
      !Number.isSafeInteger(
        Number(declaredLength),
      ) ||
      Number(declaredLength) > MAX_REQUEST_BYTES
    )
  ) {
    return fail(
      "Invalid request length.",
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
    Buffer.byteLength(
      rawBody,
      "utf8",
    ) > MAX_REQUEST_BYTES
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
            const deadlineSignal =
              remainingDatabaseSignal(
                databaseDeadlineAt,
              );

            if (!deadlineSignal) {
              return Promise.reject(
                new Error(
                  "Inbound database request deadline exceeded.",
                ),
              );
            }

            const signal = init?.signal
              ? AbortSignal.any([
                  init.signal,
                  deadlineSignal,
                ])
              : deadlineSignal;

            return fetch(input, {
              ...init,
              signal,
            });
          },
        },
      },
    );

    // ====================================================
    // 1. Verify legacy ownership.
    // ====================================================

    if (
      !remainingDatabaseSignal(
        databaseDeadlineAt,
      )
    ) {
      return fail(
        "Inbound request deadline exceeded.",
        503,
      );
    }

    const {
      data: legacyRows,
      error: legacyError,
    } = await supabase
      .from("reservation_conversation_ownership")
      .select("ownership_status")
      .eq("guest_phone", payload.from)
      .eq("restaurant_phone", restaurantPhone)
      .limit(2)
      .retry(false);

    if (
      legacyError ||
      !Array.isArray(legacyRows) ||
      legacyRows.length > 1
    ) {
      console.error(
        "Shared inbound legacy ownership verification failed.",
        {
          code: legacyError?.code ?? "INVALID_RESULT",
        },
      );

      return fail(
        "Conversation eligibility could not be verified.",
        503,
      );
    }

    const rawLegacy =
      legacyRows.length === 0
        ? null
        : legacyRows[0]?.ownership_status;

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

    // ====================================================
    // 2. Resolve shared conversation routing.
    // ====================================================

    if (
      !remainingDatabaseSignal(
        databaseDeadlineAt,
      )
    ) {
      return fail(
        "Inbound request deadline exceeded.",
        503,
      );
    }

    const {
      data: sharedData,
      error: sharedError,
    } = await supabase.rpc(
      "get_reservation_shared_conversation_route",
      {
        p_restaurant_phone: restaurantPhone,
        p_guest_phone: payload.from,
      },
    ).retry(false);

    if (
      sharedError ||
      !Array.isArray(sharedData)
    ) {
      console.error(
        "Shared inbound routing lookup failed.",
        {
          code: sharedError?.code ?? "INVALID_RESULT",
        },
      );

      return fail(
        "Shared conversation lookup unavailable.",
        503,
      );
    }

    // Shared-mode routing must be unambiguous.
    // Never choose an arbitrary conversation.

    if (sharedData.length !== 1) {
      return fail(
        "A unique shared conversation could not be verified.",
        409,
      );
    }

    const routeRow =
      sharedData[0] as Record<string, unknown>;

    if (
      !routeRow ||
      !validSharedMode(routeRow.mode)
    ) {
      return fail(
        "Invalid shared conversation mode.",
        503,
      );
    }

    const shared: SharedConversationLookup = {
      kind: "found",
      mode: routeRow.mode,
    };

    const inboundShared: SharedInboundLookup = {
      status: "found",
      mode: routeRow.mode,
    };

    // ====================================================
    // 3. Enforce the existing routing policies.
    // ====================================================

    const routingDecision =
      decideSharedConversationRoute(
        legacy,
        shared,
        {
          sharedRoutingEnabled: true,
          staffRoutingEnabled: true,
          handoffFenceEnabled: true,
        },
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

    // ====================================================
    // 4. Verify the actual incoming Twilio message.
    // ====================================================

    if (
      !remainingDatabaseSignal(
        databaseDeadlineAt,
      )
    ) {
      return fail(
        "Inbound request deadline exceeded.",
        503,
      );
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

    // ====================================================
    // 5. Resolve the unique verified staff conversation.
    // ====================================================

    // Staff conversation ownership is established by
    // the protected reservation/conversation association,
    // NOT by parsing the SMS body.
    //
    // Phone number is used only to discover candidates.
    // Each candidate must pass the protected RPC.
    //
    // Multiple reservations may share a phone number.
    // Only one eligible staff conversation is permitted.

    if (
      !remainingDatabaseSignal(
        databaseDeadlineAt,
      )
    ) {
      return fail(
        "Inbound request deadline exceeded.",
        503,
      );
    }

    const {
      data: reservationRows,
      error: reservationError,
    } = await supabase
      .from("reservation_requests")
      .select("id, customer_phone")
      .eq("customer_phone", payload.from)
      .limit(MAX_RESERVATION_CANDIDATES + 1)
      .retry(false);

    if (
      reservationError ||
      !Array.isArray(reservationRows)
    ) {
      console.error(
        "Staff inbound reservation candidate lookup failed.",
        {
          code:
            reservationError?.code ?? "INVALID_RESULT",
        },
      );

      return fail(
        "Reservation association lookup unavailable.",
        503,
      );
    }

    if (
      reservationRows.length === 0 ||
      reservationRows.length >
        MAX_RESERVATION_CANDIDATES
    ) {
      return fail(
        "Reservation association is missing or ambiguous.",
        409,
      );
    }

    const candidateIds = new Set<string>();

    for (const row of reservationRows) {
      if (
        !row ||
        typeof row.id !== "string" ||
        !UUID.test(row.id) ||
        row.customer_phone !== payload.from ||
        candidateIds.has(
          row.id.toLowerCase(),
        )
      ) {
        return fail(
          "Invalid reservation candidate set.",
          409,
        );
      }

      candidateIds.add(
        row.id.toLowerCase(),
      );
    }

    const matches: VerifiedAssociation[] = [];

    for (const reservationId of candidateIds) {
      if (
        !remainingDatabaseSignal(
          databaseDeadlineAt,
        )
      ) {
        return fail(
          "Inbound request deadline exceeded.",
          503,
        );
      }

      const {
        data: scopedRows,
        error: scopedError,
      } = await supabase.rpc(
        "get_reservation_shared_conversation_for_inbound",
        {
          p_reservation_id: reservationId,
          p_restaurant_phone:
            restaurantPhone,
          p_guest_phone: payload.from,
        },
      ).retry(false);

      if (scopedError) {
        console.error(
          "Protected staff conversation lookup failed.",
          {
            code: scopedError.code,
          },
        );

        return fail(
          "Staff conversation association unavailable.",
          503,
        );
      }

      if (
        !Array.isArray(scopedRows) ||
        scopedRows.length > 1
      ) {
        return fail(
          "Ambiguous protected conversation association.",
          409,
        );
      }

      if (scopedRows.length === 0) {
        continue;
      }

      const scoped = scopedRows[0];

      if (!validScopedConversation(scoped)) {
        return fail(
          "Invalid protected conversation association.",
          503,
        );
      }

      if (
        scoped.reservation_id.toLowerCase() !==
        reservationId
      ) {
        return fail(
          "Reservation association mismatch.",
          409,
        );
      }

      if (
        scoped.conversation_mode !== "staff" ||
        scoped.staff_activated !== true
      ) {
        continue;
      }

      matches.push({
        reservationId,
        conversationId:
          scoped.conversation_id,
      });

      if (matches.length > 1) {
        return fail(
          "Multiple staff conversations match this guest.",
          409,
        );
      }
    }

    if (matches.length !== 1) {
      return fail(
        "A unique active staff conversation could not be verified.",
        409,
      );
    }

    const association = matches[0];

    // ====================================================
    // 6. Persist verified inbound message metadata.
    // ====================================================

    // This RPC is responsible for the final,
    // row-locked conversation-mode authorization
    // and unique Message SID constraint.
    //
    // Never retry an uncertain recording write
    // automatically.

    if (
      !remainingDatabaseSignal(
        databaseDeadlineAt,
      )
    ) {
      return fail(
        "Inbound request deadline exceeded.",
        503,
      );
    }

    const {
      data: recordedData,
      error: recordedError,
    } = await supabase.rpc(
      "record_reservation_shared_inbound",
      {
        p_restaurant_phone:
          restaurantPhone,
        p_guest_phone: payload.from,
        p_twilio_message_sid:
          verified.message.messageSid,
        p_message_created_at:
          verified.message.messageCreatedAt,
        p_reservation_id:
          association.reservationId,
        p_conversation_id:
          association.conversationId,
      },
    ).retry(false);

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
      !validRecordingResult(
        recordedData[0],
      )
    ) {
      return fail(
        "Inbound recording result could not be verified.",
        503,
      );
    }

    const result = recordedData[0];

    if (
      result.conversation_mode !== "staff" ||
      result.conversation_id.toLowerCase() !==
        association.conversationId.toLowerCase()
    ) {
      console.error(
        "Shared inbound recording returned an unexpected conversation.",
      );

      return fail(
        "Inbound recording requires administrative review.",
        503,
      );
    }

    return respond(
      {
        success: true,
        recorded: true,
        conversationId:
          result.conversation_id,
        inboundEventId:
          result.inbound_event_id,
        duplicate: result.duplicate,
        conversationMode:
          result.conversation_mode,
      },
      result.duplicate ? 200 : 201,
    );
  } catch (error) {
    console.error(
      "Shared inbound recording failed.",
      {
        category:
          "SHARED_INBOUND_RECORDING_ERROR",
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