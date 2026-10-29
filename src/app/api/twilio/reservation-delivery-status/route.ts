/**
 * Fin & Feathers — Reservation Delivery Status Callback
 *
 * Step 58D.13.146W.4
 *
 * Disabled by default.
 *
 * Authenticates Twilio's form-encoded status callback
 * and independently verifies the outgoing message
 * through Twilio's REST API.
 *
 * READ ONLY:
 * - Optional gated, read-only Supabase RPC
 * - No delivery-event recording
 * - No Coordinator state transitions
 * - No guest deadline activation
 * - No SMS sending
 * - No Studio operations
 *
 * This route is NOT sufficient for production activation.
 */

import twilio from "twilio";
import { createClient } from "@supabase/supabase-js";

import {
  verifyOutboundTwilioMessage,
} from "@/lib/reservations/verified-outbound-twilio-message";

import {
  classifyReservationDeliveryEvidence,
} from "@/lib/reservations/reservation-delivery-evidence";

import {
  readReservationDeliverySidContext,
} from "@/lib/reservations/reservation-delivery-sid-context-reader";

const CALLBACK_PATH =
  "/api/twilio/reservation-delivery-status";

const CALLBACK_ENABLED_FLAG =
  "RESERVATION_CLARITY_DELIVERY_CALLBACK_ENABLED";

const CALLBACK_URL_ENV =
  "RESERVATION_CLARITY_DELIVERY_CALLBACK_URL";

const MAX_BODY_BYTES = 16_384;

const CORRELATION_ENABLED_FLAG =
  "RESERVATION_DELIVERY_SID_CORRELATION_ENABLED";

const CORRELATION_DATABASE_TIMEOUT_MS = 5_000;

const MESSAGE_SID = /^SM[0-9a-f]{32}$/i;
const E164 = /^\+[1-9]\d{7,14}$/;

const ACCEPTED_CALLBACK_STATUSES = new Set([
  "accepted",
  "scheduled",
  "queued",
  "sending",
  "sent",
  "delivered",
  "undelivered",
  "failed",
  "canceled",
]);

function respond(status: number): Response {
  return new Response(null, {
    status,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

function callbackEnabled(): boolean {
  return (
    process.env[
      CALLBACK_ENABLED_FLAG
    ] === "true"
  );
}

function correlationEnabled(): boolean {
  return (
    process.env[CORRELATION_ENABLED_FLAG] === "true"
  );
}

function createCorrelationClient() {
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL;

  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    return null;
  }

  try {
    const parsed = new URL(url);

    if (
      !["https:", "http:"].includes(parsed.protocol) ||
      !parsed.hostname
    ) {
      return null;
    }

    if (
      parsed.protocol !== "https:" &&
      !["localhost", "127.0.0.1"].includes(
        parsed.hostname,
      )
    ) {
      return null;
    }
  } catch {
    return null;
  }

  return createClient(url, serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      fetch: (input, init) => {
        const deadline =
          AbortSignal.timeout(
            CORRELATION_DATABASE_TIMEOUT_MS,
          );

        const signal = init?.signal
          ? AbortSignal.any([
              init.signal,
              deadline,
            ])
          : deadline;

        return fetch(input, {
          ...init,
          signal,
        });
      },
    },
  });
}

function configuredCallbackUrl(): string | null {
  const value =
    process.env[CALLBACK_URL_ENV];

  if (!value) {
    return null;
  }

  try {
    const url = new URL(value);

    if (
      url.protocol !== "https:" ||
      url.pathname !== CALLBACK_PATH ||
      url.search !== "" ||
      url.hash !== "" ||
      url.username !== "" ||
      url.password !== "" ||
      !url.hostname
    ) {
      return null;
    }

    return url.toString();
  } catch {
    return null;
  }
}

function parseUniqueForm(
  rawBody: string,
): Record<string, string> | null {
  const params: Record<string, string> =
    Object.create(null);

  const form = new URLSearchParams(rawBody);

  for (const [key, value] of form.entries()) {
    if (
      !key ||
      Object.prototype.hasOwnProperty.call(
        params,
        key,
      )
    ) {
      return null;
    }

    params[key] = value;
  }

  return params;
}

/**
 * Twilio can add callback parameters over time.
 *
 * All received parameters are included in SDK
 * signature validation. We do not whitelist
 * parameters before verifying the signature.
 */
export async function POST(
  request: Request,
): Promise<Response> {
  // Remain inert until explicitly enabled.
  if (!callbackEnabled()) {
    return respond(503);
  }

  const expectedUrl =
    configuredCallbackUrl();

  const token =
    process.env.TWILIO_AUTH_TOKEN;

  const restaurantPhone =
    process.env.TWILIO_FROM_NUMBER;

  if (
    !expectedUrl ||
    !token ||
    !restaurantPhone ||
    !E164.test(restaurantPhone)
  ) {
    return respond(503);
  }

  const contentType =
    request.headers.get("content-type") ?? "";

  if (
    !/^application\/x-www-form-urlencoded(?:\s*;|$)/i.test(
      contentType,
    )
  ) {
    return respond(415);
  }

  const signature =
    request.headers.get("x-twilio-signature");

  if (!signature) {
    return respond(401);
  }

  const advertisedLength =
    request.headers.get("content-length");

  if (advertisedLength !== null) {
    const length = Number(advertisedLength);

    if (
      !Number.isSafeInteger(length) ||
      length < 0 ||
      length > MAX_BODY_BYTES
    ) {
      return respond(413);
    }
  }

  let rawBody: string;

  try {
    rawBody = await request.text();
  } catch {
    return respond(400);
  }

  if (
    new TextEncoder().encode(rawBody).length >
    MAX_BODY_BYTES
  ) {
    return respond(413);
  }

  const params = parseUniqueForm(rawBody);

  if (!params) {
    return respond(400);
  }

  const signatureValid =
    twilio.validateRequest(
      token,
      signature,
      expectedUrl,
      params,
    );

  if (!signatureValid) {
    return respond(401);
  }

  const messageSid =
    params.MessageSid;

  const callbackStatus =
    params.MessageStatus;

  const guestPhone =
    params.To;

  const callbackFrom =
    params.From;

  if (
    !messageSid ||
    !MESSAGE_SID.test(messageSid) ||
    !callbackStatus ||
    !ACCEPTED_CALLBACK_STATUSES.has(
      callbackStatus,
    ) ||
    !guestPhone ||
    !E164.test(guestPhone) ||
    guestPhone === restaurantPhone
  ) {
    return respond(400);
  }

  // Twilio status callbacks may omit From.
  // If present, it must match our restaurant.
  if (
    callbackFrom !== undefined &&
    callbackFrom !== restaurantPhone
  ) {
    return respond(400);
  }

  /*
   * The callback To value is still not an
   * authoritative reservation association.
   *
   * The REST API independently verifies the
   * Message SID, From, To, and direction.
   *
   * A future database writer must additionally
   * validate the reservation-specific prompt
   * and outbound message attribution.
   */
  const verification =
    await verifyOutboundTwilioMessage({
      messageSid,
      restaurantPhone,
      guestPhone,
    });

  if (!verification.verified) {
    if (
      verification.reason ===
        "TWILIO_NOT_CONFIGURED" ||
      verification.reason ===
        "MESSAGE_LOOKUP_FAILED"
    ) {
      return respond(503);
    }

    return respond(400);
  }

  /*
   * The webhook signature has been authenticated
   * and the outgoing message identity has been
   * independently verified against Twilio.
   *
   * Classify the evidence without promoting
   * callback receipt time, dateSent, dateUpdated,
   * or RawDlrDoneDate into a delivery timestamp.
   *
   * The classifier does not establish reservation
   * ownership or authorize database writes.
   */

  const rawDlrDoneDate =
    params.RawDlrDoneDate ?? null;

  const evidence =
    classifyReservationDeliveryEvidence({
      messageSid,
      callbackStatus,
      rawDlrDoneDate,
      verifiedMessage: verification.message,
    });

  /*
   * RECONCILIATION:
   *
   * A signed callback may describe an older status
   * than Twilio's current REST API response.
   *
   * Conflicting or incomplete evidence must not
   * activate a Coordinator deadline.
   *
   * During this read-only integration, both
   * classification outcomes are acknowledged
   * without writes or retries.
   *
   * A future trusted writer must explicitly
   * handle evidence.decision before persisting
   * any event.
   */

  if (evidence.decision === "reconcile") {
    return respond(204);
  }

  /*
   * STEP 58D.13.147E.5
   *
   * Optional read-only reservation correlation.
   *
   * This executes ONLY when the separate server-side
   * correlation gate is explicitly enabled.
   *
   * The exact verified outgoing Message SID and
   * phone pair are passed to the protected database
   * RPC. Reservation and follow-up UUIDs must come
   * from the database, never webhook parameters.
   *
   * A matched result is NOT delivery authorization.
   * No event recording or deadline activation occurs.
   */

  if (correlationEnabled()) {
    if (
      evidence.decision !== "status_only" ||
      evidence.providerEventAt !== null
    ) {
      return respond(503);
    }

    const supabase = createCorrelationClient();

    if (!supabase) {
      return respond(503);
    }

    const association =
      await readReservationDeliverySidContext(
        supabase,
        {
          messageSid,
          restaurantPhone,
          guestPhone,
        },
        { enabled: true },
      );

    if (!association.success) {
      // Missing RPC, denied access, invalid database
      // response, and timeouts all fail closed.
      return respond(503);
    }

    if (
      association.outcome === "no_match" ||
      association.outcome === "not_eligible"
    ) {
      // No association or activation authorization.
      // Do not disclose reservation identity.
      return respond(204);
    }

    if (association.outcome !== "matched") {
      return respond(503);
    }

    // association.context is validated, read-only.
    // Deliberately do not persist, log, or transition.
  }

  /*
   * STATUS ONLY:
   *
   * providerEventAt is null under the currently
   * approved evidence policy.
   *
   * This branch does NOT call the recording RPC
   * or the delivery-activation RPC.
   */

  if (
    evidence.decision === "status_only" &&
    evidence.providerEventAt === null
  ) {
    return respond(204);
  }

  // Fail closed if the classifier contract changes.
  return respond(503);
}
