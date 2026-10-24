
const crypto = require("node:crypto");

const MAX_MESSAGE_LENGTH = 1000;
const MAX_TIMESTAMP_AGE_SECONDS = 300;
const E164_PATTERN = /^\+[1-9]\d{7,14}$/;
const EVENT_KEY_PATTERN =
  /^reservation_alternatives:(?:[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}):(?:[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i;

class AlternativeOfferError extends Error {
  constructor(code) {
    super(code);
    this.name = "AlternativeOfferError";
    this.code = code;
  }
}

function buildSignedContent(timestamp, eventKey, to, body) {
  return `${timestamp}.${JSON.stringify({ eventKey, to, body })}`;
}

function authenticateRequest(context, event) {
  const secret = context.RESERVATION_CONFIRMATION_SECRET;
  if (typeof secret !== "string" || !/^[a-f0-9]{64}$/i.test(secret)) {
    throw new AlternativeOfferError("SECRET_NOT_CONFIGURED");
  }

  const timestamp = String(event.timestamp ?? "");
  const signature = String(event.signature ?? "");
  if (!/^\d{10}$/.test(timestamp) || !/^[a-f0-9]{64}$/i.test(signature)) {
    throw new AlternativeOfferError("AUTHENTICATION_FAILED");
  }

  if (Math.abs(Math.floor(Date.now() / 1000) - Number(timestamp)) > MAX_TIMESTAMP_AGE_SECONDS) {
    throw new AlternativeOfferError("REQUEST_TIMESTAMP_EXPIRED");
  }

  const expected = crypto.createHmac("sha256", Buffer.from(secret, "hex"))
    .update(buildSignedContent(timestamp, event.eventKey, event.to, event.body))
    .digest();
  const received = Buffer.from(signature, "hex");
  if (received.length !== expected.length || !crypto.timingSafeEqual(received, expected)) {
    throw new AlternativeOfferError("AUTHENTICATION_FAILED");
  }
}

function validateMessage(event) {
  if (typeof event.eventKey !== "string" || !EVENT_KEY_PATTERN.test(event.eventKey)) {
    throw new AlternativeOfferError("INVALID_EVENT_KEY");
  }
  if (typeof event.to !== "string" || !E164_PATTERN.test(event.to)) {
    throw new AlternativeOfferError("INVALID_RECIPIENT");
  }
  if (typeof event.body !== "string" || !event.body.trim() || event.body.length > MAX_MESSAGE_LENGTH) {
    throw new AlternativeOfferError("INVALID_MESSAGE");
  }
  return { eventKey: event.eventKey, to: event.to, body: event.body };
}

exports.handler = async function (context, event, callback) {
  try {
    authenticateRequest(context, event);
    const message = validateMessage(event);
    const fromNumber = context.TWILIO_FROM_NUMBER;
    if (typeof fromNumber !== "string" || !E164_PATTERN.test(fromNumber)) {
      throw new AlternativeOfferError("SENDER_NOT_CONFIGURED");
    }

    let result;
    try {
      result = await context.getTwilioClient().messages.create({
        from: fromNumber,
        to: message.to,
        body: message.body,
      });
    } catch (error) {
      console.error("Alternative offer Twilio API failure:", {
        category: "TWILIO_SEND_FAILED",
        twilioCode: typeof error?.code === "number" ? error.code : null,
      });
      throw new AlternativeOfferError("TWILIO_SEND_FAILED");
    }

    if (!result || typeof result.sid !== "string" || !/^SM[0-9a-f]{32}$/i.test(result.sid)) {
      throw new AlternativeOfferError("MESSAGE_SID_MISSING");
    }

    return callback(null, {
      success: true,
      accepted: true,
      messageSid: result.sid,
      messageStatus: result.status ?? "unknown",
      eventKey: message.eventKey,
    });
  } catch (error) {
    const code = error instanceof AlternativeOfferError ? error.code : "UNEXPECTED_ERROR";
    console.error("Alternative offer SMS failed:", { code });
    return callback(null, { success: false, accepted: false, error: code });
  }
};

exports._test = { buildSignedContent, validateMessage };
