// Twilio Function: /record-guest-assistance
// Visibility: Protected
// Records unhandled guest messages through the signed Vercel API.
// Does not send SMS, transfer ownership, or modify Studio.

const crypto = require("crypto");

const E164 = /^\+[1-9]\d{7,14}$/;
const MESSAGE_SID = /^SM[0-9a-f]{32}$/i;

exports.handler = async function (context, event, callback) {
  const respond = (data) => callback(null, data);

  const failure = (reason) =>
    respond({
      success: false,
      alertRecorded: false,
      shouldAcknowledge: false,
      reason,
    });

  const secret = context.RESERVATION_STUDIO_ROUTER_SECRET;
  const endpoint = context.RESERVATION_GUEST_ASSISTANCE_URL;
  const restaurantPhone = context.RESERVATION_RESTAURANT_PHONE;

  const guestPhone = event.From;
  const incomingTo = event.To;
  const messageSid = event.MessageSid;

  if (
    typeof secret !== "string" ||
    Buffer.byteLength(secret, "utf8") < 32
  ) {
    return failure("SIGNING_SECRET_NOT_CONFIGURED");
  }

  if (typeof endpoint !== "string") {
    return failure("ALERT_ENDPOINT_NOT_CONFIGURED");
  }

  let url;

  try {
    url = new URL(endpoint);

    if (
      url.protocol !== "https:" ||
      url.hostname !== "finandfeatherslv.live" ||
      url.port ||
      url.username ||
      url.password ||
      url.hash ||
      url.search ||
      url.pathname !== "/api/twilio/guest-assistance"
    ) {
      return failure("INVALID_ALERT_ENDPOINT");
    }
  } catch {
    return failure("INVALID_ALERT_ENDPOINT");
  }

  if (
    !E164.test(guestPhone || "") ||
    !E164.test(restaurantPhone || "") ||
    incomingTo !== restaurantPhone ||
    guestPhone === restaurantPhone
  ) {
    return failure("INVALID_PHONE_PAIR");
  }

  if (!MESSAGE_SID.test(messageSid || "")) {
    return failure("INVALID_MESSAGE_SID");
  }

  const body = JSON.stringify({
    from: guestPhone,
    to: restaurantPhone,
    messageSid,
  });

  const timestamp = String(
    Math.floor(Date.now() / 1000),
  );

  const signature = crypto
    .createHmac("sha256", secret)
    .update(`${timestamp}.${body}`, "utf8")
    .digest("hex");

  try {
    const response = await fetch(url.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-FF-Timestamp": timestamp,
        "X-FF-Signature": signature,
      },
      body,
      signal: AbortSignal.timeout(6000),
    });

    if (!response.ok) {
      console.error("Guest assistance API rejected request:", {
        status: response.status,
      });

      return failure("ALERT_API_UNAVAILABLE");
    }

    const result = await response.json();

    if (
      result?.success !== true ||
      result?.alertRecorded !== true ||
      typeof result.alertId !== "string" ||
      typeof result.reservationId !== "string" ||
      typeof result.duplicate !== "boolean"
    ) {
      return failure("INVALID_ALERT_API_RESPONSE");
    }

    return respond({
      success: true,
      alertRecorded: true,
      alertId: result.alertId,
      reservationId: result.reservationId,
      duplicate: result.duplicate,

      // Only newly created alerts qualify for
      // an automatic acknowledgement.
      // This is not an SMS delivery guarantee.
      shouldAcknowledge: result.duplicate === false,

      // Recording an alert does NOT grant staff ownership.
      staffOwnershipChanged: false,
    });
  } catch (error) {
    console.error("Guest assistance Function failed:", {
      name: error instanceof Error ? error.name : "UnknownError",
    });

    return failure("ALERT_API_UNAVAILABLE");
  }
};