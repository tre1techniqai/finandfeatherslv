
"use strict";

const crypto = require("node:crypto");

const E164 = /^\+[1-9]\d{7,14}$/;
const MESSAGE_SID = /^SM[0-9a-f]{32}$/i;
const HEX_64 = /^[0-9a-f]{64}$/i;

const ENDPOINT_PATH = "/api/twilio/deposit-email-reply";

const REQUEST_TIMEOUT_MS = 10000;

function result(callback, route, outcome) {
  return callback(null, { route, outcome });
}

function validateConfiguration(context) {
  const secret =
    context.RESERVATION_DEPOSIT_EMAIL_INGRESS_SECRET;

  const restaurantPhone = context.TWILIO_FROM_NUMBER;

  const rawUrl =
    context.RESERVATION_DEPOSIT_EMAIL_INGRESS_URL;

  if (
    typeof secret !== "string" ||
    !HEX_64.test(secret) ||
    typeof restaurantPhone !== "string" ||
    !E164.test(restaurantPhone) ||
    typeof rawUrl !== "string"
  ) {
    return null;
  }

  try {
    const url = new URL(rawUrl);

    if (
      url.protocol !== "https:" ||
      url.pathname !== ENDPOINT_PATH ||
      url.username ||
      url.password ||
      url.search ||
      url.hash
    ) {
      return null;
    }

    return {
      secret,
      restaurantPhone,
      url: url.toString(),
    };
  } catch {
    return null;
  }
}

function validateInbound(event, restaurantPhone) {
  const guestPhone = event.From;
  const to = event.To;
  const messageSid = event.MessageSid;

  if (
    typeof guestPhone !== "string" ||
    typeof to !== "string" ||
    typeof messageSid !== "string" ||
    !E164.test(guestPhone) ||
    !E164.test(to) ||
    !MESSAGE_SID.test(messageSid) ||
    guestPhone === to ||
    to !== restaurantPhone
  ) {
    return null;
  }

  return {
    messageSid,
    guestPhone,
    restaurantPhone: to,
  };
}

function signRequest(timestamp, body, secret) {
  return crypto
    .createHmac("sha256", Buffer.from(secret, "hex"))
    .update(`${timestamp}.${body}`)
    .digest("hex");
}

exports.handler = async function (
  context,
  event,
  callback
) {
  const configuration = validateConfiguration(context);

  if (!configuration) {
    console.error(
      "Deposit email forwarder: configuration unavailable."
    );

    return result(
      callback,
      "error",
      "CONFIGURATION_ERROR"
    );
  }

  const input = validateInbound(
    event,
    configuration.restaurantPhone
  );

  if (!input) {
    return result(
      callback,
      "error",
      "INVALID_INBOUND"
    );
  }

  const timestamp = String(
    Math.floor(Date.now() / 1000)
  );

  const body = JSON.stringify(input);

  const signature = signRequest(
    timestamp,
    body,
    configuration.secret
  );

  let response;

  try {
    response = await fetch(configuration.url, {
      method: "POST",
      redirect: "error",
      headers: {
        "Content-Type": "application/json",
        "X-Deposit-Timestamp": timestamp,
        "X-Deposit-Signature": signature,
      },
      body,
      signal: AbortSignal.timeout(
        REQUEST_TIMEOUT_MS
      ),
    });
  } catch {
    console.error(
      "Deposit email forwarder: endpoint unavailable."
    );

    return result(
      callback,
      "error",
      "ENDPOINT_UNAVAILABLE"
    );
  }

  let payload;

  try {
    payload = await response.json();
  } catch {
    return result(
      callback,
      "error",
      "INVALID_ENDPOINT_RESPONSE"
    );
  }

  if (
    response.ok &&
    payload &&
    payload.success === true &&
    (
      payload.status === "saved" ||
      payload.status === "duplicate"
    ) &&
    typeof payload.reservationId === "string" &&
    payload.reservationId.length > 0 &&
    typeof payload.messageSid === "string" &&
    payload.messageSid.toLowerCase() ===
      input.messageSid.toLowerCase()
  ) {
    return callback(null, {
      route: "handled",
      outcome:
        payload.status === "saved"
          ? "DEPOSIT_EMAIL_SAVED"
          : "DEPOSIT_EMAIL_DUPLICATE",
      reservationId: payload.reservationId,
    });
  }

  if (
    response.ok &&
    payload &&
    payload.status === "review"
  ) {
    return result(
      callback,
      "review",
      "DEPOSIT_EMAIL_REVIEW_REQUIRED"
    );
  }

  if (
    response.status === 409 &&
    payload &&
    payload.status === "blocked"
  ) {
    return result(
      callback,
      "review",
      "DEPOSIT_EMAIL_BLOCKED"
    );
  }

  console.error(
    "Deposit email forwarder: processing rejected.",
    {
      status: response.status,
    }
  );

  return result(
    callback,
    "error",
    "DEPOSIT_EMAIL_PROCESSING_FAILED"
  );
};

exports._test = {
  validateConfiguration,
  validateInbound,
  signRequest,
};