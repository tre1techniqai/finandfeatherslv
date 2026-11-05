"use strict";

const crypto = require("node:crypto");

const MAX_MESSAGE_LENGTH = 1000;
const MAX_TIMESTAMP_AGE_SECONDS = 300;

const E164_PATTERN = /^\+[1-9]\d{7,14}$/;

const MESSAGE_SID_PATTERN = /^SM[0-9a-f]{32}$/i;

const EVENT_KEY_PATTERN =
  /^reservation_deposit_decision:[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

class DepositDecisionError extends Error {
  constructor(code) {
    super(code);
    this.name = "DepositDecisionError";
    this.code = code;
  }
}

function buildSignedContent(timestamp, eventKey, to, body) {
  return `${timestamp}.${JSON.stringify({ eventKey, to, body })}`;
}

function authenticateRequest(context, event) {
  const secret = context.RESERVATION_CONFIRMATION_SECRET;

  if (
    typeof secret !== "string" ||
    !/^[a-f0-9]{64}$/i.test(secret)
  ) {
    throw new DepositDecisionError("SECRET_NOT_CONFIGURED");
  }

  const timestamp = String(event.timestamp ?? "");
  const signature = String(event.signature ?? "");

  if (
    !/^\d{10}$/.test(timestamp) ||
    !/^[a-f0-9]{64}$/i.test(signature)
  ) {
    throw new DepositDecisionError("AUTHENTICATION_FAILED");
  }

  if (
    Math.abs(
      Math.floor(Date.now() / 1000) - Number(timestamp)
    ) > MAX_TIMESTAMP_AGE_SECONDS
  ) {
    throw new DepositDecisionError(
      "REQUEST_TIMESTAMP_EXPIRED"
    );
  }

  const expected = crypto
    .createHmac("sha256", Buffer.from(secret, "hex"))
    .update(
      buildSignedContent(
        timestamp,
        event.eventKey,
        event.to,
        event.body,
      ),
    )
    .digest();

  const received = Buffer.from(signature, "hex");

  if (
    received.length !== expected.length ||
    !crypto.timingSafeEqual(received, expected)
  ) {
    throw new DepositDecisionError("AUTHENTICATION_FAILED");
  }
}

function validateMessage(event) {
  if (
    typeof event.eventKey !== "string" ||
    !EVENT_KEY_PATTERN.test(event.eventKey)
  ) {
    throw new DepositDecisionError("INVALID_EVENT_KEY");
  }

  if (
    typeof event.to !== "string" ||
    !E164_PATTERN.test(event.to)
  ) {
    throw new DepositDecisionError("INVALID_RECIPIENT");
  }

  if (
    typeof event.body !== "string" ||
    !event.body.trim() ||
    event.body.length > MAX_MESSAGE_LENGTH
  ) {
    throw new DepositDecisionError("INVALID_MESSAGE");
  }

  return {
    eventKey: event.eventKey,
    to: event.to,
    body: event.body,
  };
}

function validateSender(context) {
  const fromNumber = context.TWILIO_FROM_NUMBER;

  if (
    typeof fromNumber !== "string" ||
    !E164_PATTERN.test(fromNumber)
  ) {
    throw new DepositDecisionError("SENDER_NOT_CONFIGURED");
  }

  return fromNumber;
}

exports.handler = async function (context, event, callback) {
  try {
    authenticateRequest(context, event);

    const message = validateMessage(event);
    const fromNumber = validateSender(context);

    let result;

    try {
      result = await context
        .getTwilioClient()
        .messages.create({
          from: fromNumber,
          to: message.to,
          body: message.body,
        });
    } catch (error) {
      console.error("Deposit decision Twilio API failure:", {
        category: "TWILIO_SEND_FAILED",
        twilioCode:
          typeof error?.code === "number"
            ? error.code
            : null,
      });

      throw new DepositDecisionError("TWILIO_SEND_FAILED");
    }

    if (
      !result ||
      typeof result.sid !== "string" ||
      !MESSAGE_SID_PATTERN.test(result.sid)
    ) {
      throw new DepositDecisionError("MESSAGE_SID_MISSING");
    }

    return callback(null, {
      success: true,
      accepted: true,
      eventKey: message.eventKey,
      messageSid: result.sid,
      messageStatus: result.status ?? "unknown",
    });
  } catch (error) {
    const code =
      error instanceof DepositDecisionError
        ? error.code
        : "UNEXPECTED_ERROR";

    console.error("Deposit decision SMS failed:", {
      code,
    });

    return callback(null, {
      success: false,
      accepted: false,
      error: code,
    });
  }
};

exports._test = {
  buildSignedContent,
  authenticateRequest,
  validateMessage,
};