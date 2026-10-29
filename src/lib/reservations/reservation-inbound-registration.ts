import type { SupabaseClient } from "@supabase/supabase-js";

import type {
  InboundMessageVerificationResult,
} from "@/lib/reservations/verified-inbound-twilio-message";

/**
 * Fin & Feathers — Inbound Attribution Registration
 *
 * Step 58D.13.146O
 *
 * Registers an already-verified inbound Twilio
 * Message SID through the protected Coordinator RPC.
 *
 * No reservation attribution is created here.
 * No SMS is sent.
 * No Coordinator state transition occurs.
 *
 * The RPC is currently REVIEW ONLY and undeployed.
 * This adapter is disabled by default.
 */

const E164 = /^\+[1-9]\d{7,14}$/;

const MESSAGE_SID = /^SM[0-9a-f]{32}$/i;

const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export type InboundRegistrationOptions = {
  /**
   * Explicit activation from trusted server code.
   *
   * The existing inbound handler does not enable
   * registration.
   */
  enabled?: boolean;
};

export type InboundRegistrationIdentity = {
  messageSid: string;
  guestPhone: string;
  restaurantPhone: string;
};

export type InboundRegistrationResult =
  | {
      success: true;
      registered: true;
      inserted: boolean;
      duplicate: boolean;
      messageSid: string;
      attributionStatus: "unresolved" | "verified";
      reservationId: string | null;
    }
  | {
      success: false;
      error:
        | "DISABLED"
        | "MESSAGE_NOT_VERIFIED"
        | "INVALID_VERIFIED_MESSAGE"
        | "IDENTITY_MISMATCH"
        | "DATABASE_LOOKUP_FAILED"
        | "INVALID_DATABASE_RESPONSE";
    };

function isRecord(
  value: unknown,
): value is Record<string, unknown> {
  return (
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value)
  );
}

function normalizeMessageSid(
  value: string,
): string {
  return `SM${value.slice(2).toLowerCase()}`;
}

/**
 * Register the exact verified inbound Message SID.
 *
 * SECURITY CONTRACT:
 *
 * 1. Caller must authenticate the webhook.
 *
 * 2. Caller must invoke verifyInboundTwilioMessage()
 *    using the trusted Twilio SDK.
 *
 * 3. Caller must supply that verification result
 *    and the independently validated request identity.
 *
 * 4. The adapter compares both identities before
 *    invoking the database RPC.
 *
 * 5. The RPC must preserve existing attribution and
 *    reject conflicting Message SID identity.
 *
 * 6. A returned "verified" status is observational.
 *    It does not authorize a Coordinator transition.
 *
 * 7. TypeScript objects are not security credentials.
 *    The function cannot independently prove that
 *    the caller actually performed Twilio verification.
 *
 * 8. Never pass these arguments directly from browser
 *    input or an unverified webhook.
 */
export async function registerVerifiedInboundMessage(
  supabase: SupabaseClient,
  verification: InboundMessageVerificationResult,
  expected: InboundRegistrationIdentity,
  options: InboundRegistrationOptions = {},
): Promise<InboundRegistrationResult> {
  // ====================================================
  // 1. Require explicit server-side activation.
  // ====================================================

  if (options.enabled !== true) {
    return {
      success: false,
      error: "DISABLED",
    };
  }

  // ====================================================
  // 2. Require successful Twilio verification.
  // ====================================================

  if (!verification || verification.verified !== true) {
    return {
      success: false,
      error: "MESSAGE_NOT_VERIFIED",
    };
  }

  const message = verification.message;

  if (
    !isRecord(message) ||
    typeof message.messageSid !== "string" ||
    !MESSAGE_SID.test(message.messageSid) ||
    typeof message.guestPhone !== "string" ||
    !E164.test(message.guestPhone) ||
    typeof message.restaurantPhone !== "string" ||
    !E164.test(message.restaurantPhone) ||
    message.guestPhone === message.restaurantPhone ||
    typeof message.messageCreatedAt !== "string" ||
    !Number.isFinite(
      Date.parse(message.messageCreatedAt),
    ) ||
    typeof message.messageBody !== "string" &&
      message.messageBody !== null
  ) {
    return {
      success: false,
      error: "INVALID_VERIFIED_MESSAGE",
    };
  }

  // ====================================================
  // 3. Verify identity against the trusted request.
  // ====================================================

  if (
    !isRecord(expected) ||
    typeof expected.messageSid !== "string" ||
    !MESSAGE_SID.test(expected.messageSid) ||
    typeof expected.guestPhone !== "string" ||
    !E164.test(expected.guestPhone) ||
    typeof expected.restaurantPhone !== "string" ||
    !E164.test(expected.restaurantPhone)
  ) {
    return {
      success: false,
      error: "IDENTITY_MISMATCH",
    };
  }

  const canonicalSid = normalizeMessageSid(
    message.messageSid,
  );

  if (
    canonicalSid !== normalizeMessageSid(
      expected.messageSid,
    ) ||
    message.guestPhone !== expected.guestPhone ||
    message.restaurantPhone !== expected.restaurantPhone
  ) {
    return {
      success: false,
      error: "IDENTITY_MISMATCH",
    };
  }

  // ====================================================
  // 4. Invoke the protected registration RPC.
  // ====================================================

  // No reservation UUID is supplied.
  //
  // The database function may only register an
  // unresolved message or return its existing record.

  let data: unknown;

  try {
    const result = await supabase.rpc(
      "register_reservation_inbound_attribution",
      {
        p_twilio_message_sid: canonicalSid,
        p_restaurant_phone: message.restaurantPhone,
        p_guest_phone: message.guestPhone,
      },
    );

    if (result.error) {
      // Never log phone numbers, message contents,
      // or raw SQL responses.
      console.error(
        "Inbound attribution registration failed.",
        { code: result.error.code },
      );

      return {
        success: false,
        error: "DATABASE_LOOKUP_FAILED",
      };
    }

    data = result.data;
  } catch {
    return {
      success: false,
      error: "DATABASE_LOOKUP_FAILED",
    };
  }

  // ====================================================
  // 5. Validate the complete RPC response.
  // ====================================================

  if (
    !isRecord(data) ||
    data.registered !== true ||
    typeof data.inserted !== "boolean" ||
    typeof data.duplicate !== "boolean" ||
    data.duplicate === data.inserted ||
    typeof data.messageSid !== "string" ||
    !MESSAGE_SID.test(data.messageSid) ||
    normalizeMessageSid(data.messageSid) !== canonicalSid ||
    (
      data.attributionStatus !== "unresolved" &&
      data.attributionStatus !== "verified"
    )
  ) {
    return {
      success: false,
      error: "INVALID_DATABASE_RESPONSE",
    };
  }

  const status = data.attributionStatus;
  const reservationId = data.reservationId;

  // An unresolved message must have no reservation.
  //
  // An existing verified message must have a valid
  // reservation UUID.
  //
  // Registration itself can never create a newly
  // verified association.

  if (
    (
      status === "unresolved" &&
      reservationId !== null
    ) ||
    (
      status === "verified" &&
      (
        typeof reservationId !== "string" ||
        !UUID.test(reservationId)
      )
    ) ||
    (
      data.inserted === true &&
      status !== "unresolved"
    )
  ) {
    return {
      success: false,
      error: "INVALID_DATABASE_RESPONSE",
    };
  }

  // ====================================================
  // 6. Return the validated registration receipt.
  // ====================================================

  return {
    success: true,
    registered: true,
    inserted: data.inserted,
    duplicate: data.duplicate,
    messageSid: canonicalSid,
    attributionStatus: status,
    reservationId:
      typeof reservationId === "string"
        ? reservationId
        : null,
  };
}