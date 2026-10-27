
import twilio from "twilio";

const E164 = /^\+[1-9]\d{7,14}$/;
const MESSAGE_SID = /^SM[0-9a-f]{32}$/i;
const ACCOUNT_SID = /^AC[0-9a-f]{32}$/i;

const FUTURE_CLOCK_SKEW_MS = 5 * 60 * 1000;

// Bound the production Twilio HTTP request.
// This does not establish a deadline for the entire
// inbound recording API operation.
const TWILIO_REQUEST_TIMEOUT_MS = 3500;

/**
 * Minimal Twilio SDK interface required by this helper.
 *
 * Tests can provide an in-memory implementation.
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
   * The Next.js API will call this helper without it.
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
 * Fetch and verify a specific inbound Twilio message.
 *
 * This establishes message identity, not permission to
 * record the message into a shared conversation.
 *
 * It does not send SMS, update Twilio, or write to Supabase.
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

    // Do not expose Twilio credentials, response bodies,
    // exception text, or message contents to callers.
    //
    // Request timeout and transport failures are handled
    // through the existing fail-closed lookup result.
    return reject("MESSAGE_LOOKUP_FAILED");
  }
}
