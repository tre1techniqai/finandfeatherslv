import twilio from "twilio";

const E164 = /^\+[1-9]\d{7,14}$/;
const MESSAGE_SID = /^SM[0-9a-f]{32}$/i;
const ACCOUNT_SID = /^AC[0-9a-f]{32}$/i;

const FUTURE_CLOCK_SKEW_MS = 5 * 60 * 1000;
const TWILIO_REQUEST_TIMEOUT_MS = 3500;
const MAX_MESSAGE_CHARS = 1600;

const INVALID_BODY_CHARACTERS =
  /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/;

/**
 * Minimal Twilio SDK interface required by this helper.
 *
 * Existing test clients may omit body. In that case,
 * message identity can still be verified, but reservation
 * attribution must not use missing text.
 *
 * Production uses the normal Twilio SDK.
 */
export type InboundMessageClient = {
  messages: (
    sid: string,
  ) => {
    fetch: () => Promise<{
      sid: string;
      from: string;
      to: string;
      direction: string;
      dateCreated: Date;
      body?: string | null;
    }>;
  };
};

export type VerifyInboundMessageInput = {
  messageSid: string;
  guestPhone: string;
  restaurantPhone: string;
};

export type VerifiedInboundMessage = {
  messageSid: string;
  guestPhone: string;
  restaurantPhone: string;
  messageCreatedAt: string;

  /**
   * Verified message text obtained from Twilio.
   *
   * null means the body was unavailable or unsuitable
   * for automated reservation attribution.
   *
   * null must never be interpreted as an empty reply,
   * YES, NO, or any other Studio trigger.
   */
  messageBody: string | null;
};

export type InboundMessageVerificationResult =
  | {
      verified: true;
      message: VerifiedInboundMessage;
    }
  | {
      verified: false;
      reason:
        | "INVALID_INPUT"
        | "TWILIO_NOT_CONFIGURED"
        | "MESSAGE_NOT_FOUND"
        | "MESSAGE_IDENTITY_MISMATCH"
        | "INVALID_MESSAGE_TIMESTAMP"
        | "MESSAGE_LOOKUP_FAILED";
    };

export type VerifyInboundMessageOptions = {
  /**
   * Internal dependency injection.
   *
   * Never obtain this value from an HTTP request.
   * The Next.js API calls this helper without it.
   */
  client?: InboundMessageClient;

  /**
   * Optional test clock. Production uses Date.now().
   */
  now?: () => number;
};

function reject(
  reason: Extract<
    InboundMessageVerificationResult,
    { verified: false }
  >["reason"],
): InboundMessageVerificationResult {
  return {
    verified: false,
    reason,
  };
}

/**
 * Normalize the body only for reservation attribution.
 *
 * Do not modify or overwrite Twilio's stored message.
 * Do not infer content if Twilio does not supply it.
 */
function verifiedMessageBody(
  value: unknown,
): string | null {
  if (typeof value !== "string") {
    return null;
  }

  if (
    value.length > MAX_MESSAGE_CHARS ||
    INVALID_BODY_CHARACTERS.test(value)
  ) {
    return null;
  }

  const body = value.trim();

  return body.length > 0 ? body : null;
}

/**
 * Fetch and verify a specific inbound Twilio message.
 *
 * Establishes:
 * - Twilio Message SID identity
 * - Exact guest and restaurant phone numbers
 * - Inbound direction
 * - Valid creation timestamp
 * - Available verified message text
 *
 * This does NOT establish reservation ownership.
 *
 * It does not send SMS, modify Twilio, or write to
 * Supabase.
 */
export async function verifyInboundTwilioMessage(
  input: VerifyInboundMessageInput,
  options: VerifyInboundMessageOptions = {},
): Promise<InboundMessageVerificationResult> {
  if (
    !input ||
    typeof input !== "object" ||
    typeof input.messageSid !== "string" ||
    !MESSAGE_SID.test(input.messageSid) ||
    typeof input.guestPhone !== "string" ||
    !E164.test(input.guestPhone) ||
    typeof input.restaurantPhone !== "string" ||
    !E164.test(input.restaurantPhone) ||
    input.guestPhone === input.restaurantPhone
  ) {
    return reject("INVALID_INPUT");
  }

  let client = options.client;

  if (!client) {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;

    if (
      !accountSid ||
      !ACCOUNT_SID.test(accountSid) ||
      !authToken
    ) {
      return reject("TWILIO_NOT_CONFIGURED");
    }

    client = twilio(accountSid, authToken, {
      autoRetry: false,
      timeout: TWILIO_REQUEST_TIMEOUT_MS,
    });
  }

  try {
    const message = await client
      .messages(input.messageSid)
      .fetch();

    if (
      !message ||
      message.sid !== input.messageSid ||
      message.from !== input.guestPhone ||
      message.to !== input.restaurantPhone ||
      message.direction !== "inbound"
    ) {
      return reject("MESSAGE_IDENTITY_MISMATCH");
    }

    const createdAt = message.dateCreated;
    const now = options.now?.() ?? Date.now();

    if (
      !(createdAt instanceof Date) ||
      !Number.isFinite(createdAt.getTime()) ||
      !Number.isFinite(now) ||
      createdAt.getTime() >
        now + FUTURE_CLOCK_SKEW_MS
    ) {
      return reject("INVALID_MESSAGE_TIMESTAMP");
    }

    return {
      verified: true,
      message: {
        messageSid: message.sid,
        guestPhone: message.from,
        restaurantPhone: message.to,
        messageCreatedAt: createdAt.toISOString(),
        messageBody: verifiedMessageBody(message.body),
      },
    };
  } catch (error) {
    const status =
      error !== null &&
      typeof error === "object" &&
      "status" in error
        ? (error as { status?: unknown }).status
        : undefined;

    if (status === 404) {
      return reject("MESSAGE_NOT_FOUND");
    }

    // Never expose Twilio credentials, message bodies,
    // response contents, or exception text.
    return reject("MESSAGE_LOOKUP_FAILED");
  }
}