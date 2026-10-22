const crypto = require("node:crypto");

const MAX_MESSAGE_LENGTH = 1000;
const MAX_TIMESTAMP_AGE_SECONDS = 300;

const E164_PATTERN = /^\+[1-9]\d{7,14}$/;

const EVENT_KEY_PATTERN =
  /^reservation_confirmed:[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

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
    throw new Error(
      "Reservation confirmation secret is not configured.",
    );
  }

  const timestamp = String(event.timestamp ?? "");
  const signature = String(event.signature ?? "");

  if (
    !/^\d{10}$/.test(timestamp) ||
    !isValidSignature(signature)
  ) {
    throw new Error("Invalid authentication fields.");
  }

  const requestTime = Number(timestamp);
  const currentTime = Math.floor(Date.now() / 1000);

  if (
    Math.abs(currentTime - requestTime) >
    MAX_TIMESTAMP_AGE_SECONDS
  ) {
    throw new Error("Request timestamp has expired.");
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
    throw new Error("Invalid request signature.");
  }
}

function validateMessage(event) {
  if (
    typeof event.eventKey !== "string" ||
    !EVENT_KEY_PATTERN.test(event.eventKey)
  ) {
    throw new Error("Invalid notification event key.");
  }

  if (
    typeof event.to !== "string" ||
    !E164_PATTERN.test(event.to)
  ) {
    throw new Error("Invalid recipient phone number.");
  }

  if (
    typeof event.body !== "string" ||
    !event.body.trim() ||
    event.body.length > MAX_MESSAGE_LENGTH
  ) {
    throw new Error("Invalid confirmation message.");
  }

  return {
    eventKey: event.eventKey,
    to: event.to,
    body: event.body,
  };
}

exports.handler = async function (context, event, callback) {
  try {
    const message = validateMessage(event);

    authenticateRequest(context, event);

    const fromNumber = context.TWILIO_FROM_NUMBER;

    if (
      typeof fromNumber !== "string" ||
      !E164_PATTERN.test(fromNumber)
    ) {
      throw new Error(
        "Twilio sender number is not configured.",
      );
    }

    const client = context.getTwilioClient();

    const result = await client.messages.create({
      from: fromNumber,
      to: message.to,
      body: message.body,
    });

    if (!result.sid) {
      throw new Error(
        "Twilio did not return a message SID.",
      );
    }

    return callback(null, {
      success: true,
      accepted: true,
      messageSid: result.sid,
      messageStatus: result.status ?? "unknown",
      eventKey: message.eventKey,
    });
  } catch (error) {
    console.error(
      "Reservation confirmation SMS failed:",
      error instanceof Error
        ? error.message
        : "Unknown error",
    );

    return callback(null, {
      success: false,
      accepted: false,
      error: "RESERVATION_CONFIRMATION_SEND_FAILED",
    });
  }
};

exports._test = {
  buildSignedContent,
  validateMessage,
};