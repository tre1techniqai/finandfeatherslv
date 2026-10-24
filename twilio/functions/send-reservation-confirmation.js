
const crypto = require("node:crypto");

const MAX_MESSAGE_LENGTH = 1000;
const MAX_TIMESTAMP_AGE_SECONDS = 300;

const E164_PATTERN = /^\+[1-9]\d{7,14}$/;

const EVENT_KEY_PATTERN =
  /^reservation_confirmed:[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

class ConfirmationError extends Error {
  constructor(code) {
    super(code);
    this.name = "ConfirmationError";
    this.code = code;
  }
}

function isValidSecret(value) {
  return (
    typeof value === "string" &&
    /^[a-f0-9]{64}$/i.test(value)
  );
}

function isValidSignature(value) {
  return (
    typeof value === "string" &&
    /^[a-f0-9]{64}$/i.test(value)
  );
}

function buildSignedContent(timestamp, eventKey, to, body) {
  const payload = JSON.stringify({
    eventKey,
    to,
    body,
  });

  return `${timestamp}.${payload}`;
}

function authenticateRequest(context, event) {
  const secret = context.RESERVATION_CONFIRMATION_SECRET;

  if (!isValidSecret(secret)) {
    throw new ConfirmationError("SECRET_NOT_CONFIGURED");
  }

  const timestamp = String(event.timestamp ?? "");
  const signature = String(event.signature ?? "");

  if (
    !/^\d{10}$/.test(timestamp) ||
    !isValidSignature(signature)
  ) {
    throw new ConfirmationError("AUTHENTICATION_FAILED");
  }

  const requestTime = Number(timestamp);
  const currentTime = Math.floor(Date.now() / 1000);

  if (
    Math.abs(currentTime - requestTime) >
    MAX_TIMESTAMP_AGE_SECONDS
  ) {
    throw new ConfirmationError("REQUEST_TIMESTAMP_EXPIRED");
  }

  const signedContent = buildSignedContent(
    timestamp,
    event.eventKey,
    event.to,
    event.body,
  );

  const expectedSignature = crypto
    .createHmac("sha256", Buffer.from(secret, "hex"))
    .update(signedContent)
    .digest();

  const receivedSignature = Buffer.from(signature, "hex");

  if (
    receivedSignature.length !== expectedSignature.length ||
    !crypto.timingSafeEqual(
      receivedSignature,
      expectedSignature,
    )
  ) {
    throw new ConfirmationError("AUTHENTICATION_FAILED");
  }
}

function validateMessage(event) {
  if (
    typeof event.eventKey !== "string" ||
    !EVENT_KEY_PATTERN.test(event.eventKey)
  ) {
    throw new ConfirmationError("INVALID_EVENT_KEY");
  }

  if (
    typeof event.to !== "string" ||
    !E164_PATTERN.test(event.to)
  ) {
    throw new ConfirmationError("INVALID_RECIPIENT");
  }

  if (
    typeof event.body !== "string" ||
    !event.body.trim() ||
    event.body.length > MAX_MESSAGE_LENGTH
  ) {
    throw new ConfirmationError("INVALID_MESSAGE");
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
    throw new ConfirmationError("SENDER_NOT_CONFIGURED");
  }

  return fromNumber;
}

async function createTwilioMessage(context, message, fromNumber) {
  const client = context.getTwilioClient();

  let result;

  try {
    result = await client.messages.create({
      from: fromNumber,
      to: message.to,
      body: message.body,
    });
  } catch (error) {
    const twilioCode =
      error &&
      typeof error.code === "number"
        ? error.code
        : null;

    console.error("Reservation confirmation Twilio API failure:", {
      category: "TWILIO_SEND_FAILED",
      twilioCode,
    });

    throw new ConfirmationError("TWILIO_SEND_FAILED");
  }

  if (
    !result ||
    typeof result.sid !== "string" ||
    !/^SM[0-9a-f]{32}$/i.test(result.sid)
  ) {
    throw new ConfirmationError("MESSAGE_SID_MISSING");
  }

  return result;
}

exports.handler = async function (context, event, callback) {
  try {
    // Authentication must succeed before processing the message.
    authenticateRequest(context, event);

    const message = validateMessage(event);
    const fromNumber = validateSender(context);

    const result = await createTwilioMessage(
      context,
      message,
      fromNumber,
    );

    return callback(null, {
      success: true,
      accepted: true,
      messageSid: result.sid,
      messageStatus: result.status ?? "unknown",
      eventKey: message.eventKey,
    });
  } catch (error) {
    const errorCode =
      error instanceof ConfirmationError
        ? error.code
        : "UNEXPECTED_ERROR";

    console.error("Reservation confirmation SMS failed:", {
      code: errorCode,
    });

    return callback(null, {
      success: false,
      accepted: false,
      error: errorCode,
    });
  }
};

exports._test = {
  buildSignedContent,
  validateMessage,
};
