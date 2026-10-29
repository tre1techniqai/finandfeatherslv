/**
 * Fin & Feathers — Verified Outbound Twilio Message
 *
 * Step 58D.13.146W.3
 *
 * Read-only provider message verification.
 *
 * Verifies:
 * - Twilio Message SID
 * - Restaurant sender
 * - Guest recipient
 * - Outbound direction
 * - Provider message status
 * - Valid creation timestamp
 *
 * Does NOT:
 * - Authenticate an HTTP webhook
 * - Determine reservation ownership
 * - Establish an exact delivery timestamp
 * - Write to Supabase
 * - Send SMS
 * - Activate Coordinator deadlines
 */

import twilio from "twilio";

const MESSAGE_SID = /^SM[0-9a-f]{32}$/i;
const ACCOUNT_SID = /^AC[0-9a-f]{32}$/i;
const E164 = /^\+[1-9]\d{7,14}$/;

const TWILIO_REQUEST_TIMEOUT_MS = 3500;
const FUTURE_CLOCK_SKEW_MS = 5 * 60 * 1000;

export type OutboundMessageStatus =
  | "accepted"
  | "scheduled"
  | "queued"
  | "sending"
  | "sent"
  | "delivered"
  | "undelivered"
  | "failed"
  | "canceled";

export type OutboundMessageClient = {
  messages: (
    sid: string,
  ) => {
    fetch: () => Promise<{
      sid: string;
      from: string | null;
      to: string;
      direction: string;
      status: string;
      dateCreated: Date;
      dateSent?: Date | null;
      dateUpdated?: Date | null;
    }>;
  };
};

export type VerifyOutboundMessageInput = {
  messageSid: string;
  restaurantPhone: string;
  guestPhone: string;
};

export type VerifiedOutboundMessage = {
  messageSid: string;
  restaurantPhone: string;
  guestPhone: string;

  providerStatus: OutboundMessageStatus;

  messageCreatedAt: string;
  messageSentAt: string | null;
  messageUpdatedAt: string | null;

  /**
   * Indicates provider-reported delivered status.
   *
   * This does not establish a reliable exact
   * delivery timestamp.
   */
  providerReportsDelivered: boolean;
};

export type OutboundVerificationFailure =
  | "INVALID_INPUT"
  | "TWILIO_NOT_CONFIGURED"
  | "MESSAGE_NOT_FOUND"
  | "MESSAGE_IDENTITY_MISMATCH"
  | "INVALID_MESSAGE_STATUS"
  | "INVALID_MESSAGE_TIMESTAMP"
  | "MESSAGE_LOOKUP_FAILED";

export type OutboundMessageVerificationResult =
  | {
      verified: true;
      message: VerifiedOutboundMessage;
    }
  | {
      verified: false;
      reason: OutboundVerificationFailure;
    };

export type VerifyOutboundMessageOptions = {
  /**
   * Internal dependency injection for tests.
   * Never accept this value from an HTTP request.
   */
  client?: OutboundMessageClient;

  /**
   * Optional test clock.
   * Production uses Date.now().
   */
  now?: () => number;
};

const VALID_STATUSES = new Set<OutboundMessageStatus>([
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

function reject(
  reason: OutboundVerificationFailure,
): OutboundMessageVerificationResult {
  return {
    verified: false,
    reason,
  };
}

function validDate(
  value: unknown,
  now: number,
): value is Date {
  return (
    value instanceof Date &&
    Number.isFinite(value.getTime()) &&
    value.getTime() <= now + FUTURE_CLOCK_SKEW_MS
  );
}

function optionalDate(
  value: unknown,
  now: number,
): string | null | undefined {
  if (value === null || value === undefined) {
    return null;
  }

  if (!validDate(value, now)) {
    return undefined;
  }

  return value.toISOString();
}

function isOutboundDirection(
  value: string,
): boolean {
  return (
    value === "outbound-api" ||
    value === "outbound-reply" ||
    value === "outbound-call"
  );
}

/**
 * Verify an outgoing Twilio SMS against the
 * provider's authenticated REST API.
 *
 * The restaurant and guest numbers must come
 * from trusted server-side reservation context,
 * not untrusted callback parameters alone.
 *
 * This returns provider status only.
 *
 * Neither dateSent nor dateUpdated is promoted
 * into an authoritative delivery timestamp.
 */
export async function verifyOutboundTwilioMessage(
  input: VerifyOutboundMessageInput,
  options: VerifyOutboundMessageOptions = {},
): Promise<OutboundMessageVerificationResult> {
  if (
    !input ||
    typeof input !== "object" ||
    typeof input.messageSid !== "string" ||
    !MESSAGE_SID.test(input.messageSid) ||
    typeof input.restaurantPhone !== "string" ||
    !E164.test(input.restaurantPhone) ||
    typeof input.guestPhone !== "string" ||
    !E164.test(input.guestPhone) ||
    input.restaurantPhone === input.guestPhone
  ) {
    return reject("INVALID_INPUT");
  }

  let client = options.client;

  if (!client) {
    const accountSid =
      process.env.TWILIO_ACCOUNT_SID;

    const authToken =
      process.env.TWILIO_AUTH_TOKEN;

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
      message.sid.toLowerCase() !==
        input.messageSid.toLowerCase() ||
      message.from !== input.restaurantPhone ||
      message.to !== input.guestPhone ||
      typeof message.direction !== "string" ||
      !isOutboundDirection(message.direction)
    ) {
      return reject("MESSAGE_IDENTITY_MISMATCH");
    }

    if (
      !VALID_STATUSES.has(
        message.status as OutboundMessageStatus,
      )
    ) {
      return reject("INVALID_MESSAGE_STATUS");
    }

    const now = options.now?.() ?? Date.now();

    if (
      !Number.isFinite(now) ||
      !validDate(message.dateCreated, now)
    ) {
      return reject("INVALID_MESSAGE_TIMESTAMP");
    }

    const sentAt = optionalDate(
      message.dateSent,
      now,
    );

    const updatedAt = optionalDate(
      message.dateUpdated,
      now,
    );

    if (
      sentAt === undefined ||
      updatedAt === undefined
    ) {
      return reject("INVALID_MESSAGE_TIMESTAMP");
    }

    if (
      sentAt !== null &&
      Date.parse(sentAt) <
        message.dateCreated.getTime()
    ) {
      return reject("INVALID_MESSAGE_TIMESTAMP");
    }

    if (
      updatedAt !== null &&
      Date.parse(updatedAt) <
        message.dateCreated.getTime()
    ) {
      return reject("INVALID_MESSAGE_TIMESTAMP");
    }

    const providerStatus =
      message.status as OutboundMessageStatus;

    return {
      verified: true,
      message: {
        messageSid: message.sid,
        restaurantPhone: message.from,
        guestPhone: message.to,

        providerStatus,

        messageCreatedAt:
          message.dateCreated.toISOString(),

        messageSentAt: sentAt,
        messageUpdatedAt: updatedAt,

        providerReportsDelivered:
          providerStatus === "delivered",
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

    // Never expose credentials, SMS contents,
    // provider response bodies, or exception text.
    return reject("MESSAGE_LOOKUP_FAILED");
  }
}