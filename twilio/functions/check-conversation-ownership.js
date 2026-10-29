// Twilio Function: /check-conversation-ownership
//
// Shared inbound recording bridge.
//
// IMPORTANT:
// - No SMS is sent by this Function.
// - No Studio Flow is modified.
// - Staff inbound recording is disabled by default.
// - Automation routing preserves the existing behavior.
// - Staff routing is allowed only after durable recording succeeds.

const crypto = require("crypto");

const E164 = /^\+[1-9]\d{7,14}$/;
const MESSAGE_SID = /^SM[0-9a-f]{32}$/i;

const REQUEST_TIMEOUT_MS = 6000;

function validEndpoint(value, expectedPath) {
  if (typeof value !== "string") {
    return null;
  }

  try {
    const url = new URL(value);

    if (
      url.protocol !== "https:" ||
      url.username ||
      url.password ||
      url.hash ||
      url.search ||
      url.pathname !== expectedPath
    ) {
      return null;
    }

    return url;
  } catch {
    return null;
  }
}

function signRequest(secret, body) {
  const timestamp = String(
    Math.floor(Date.now() / 1000)
  );

  const signature = crypto
    .createHmac("sha256", secret)
    .update(`${timestamp}.${body}`, "utf8")
    .digest("hex");

  return {
    "Content-Type": "application/json",
    "X-FF-Timestamp": timestamp,
    "X-FF-Signature": signature,
  };
}

async function signedPost(url, secret, payload) {
  const body = JSON.stringify(payload);

  const response = await fetch(url.toString(), {
    method: "POST",
    headers: signRequest(secret, body),
    body,
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });

  if (!response.ok) {
    return null;
  }

  return response.json();
}

exports.handler = async function (
  context,
  event,
  callback
) {
  const blocked = (reason) =>
    callback(null, {
      success: false,
      route: "block",
      reason,
    });

  const secret =
    context.RESERVATION_STUDIO_ROUTER_SECRET;

  const routerEndpoint =
    context.RESERVATION_STUDIO_ROUTER_URL;

  const restaurantPhone =
    context.RESERVATION_RESTAURANT_PHONE;

  const guestPhone = event.From;
  const incomingTo = event.To;

  if (
    typeof secret !== "string" ||
    Buffer.byteLength(secret, "utf8") < 32
  ) {
    return blocked("ROUTER_NOT_CONFIGURED");
  }

  const routerUrl = validEndpoint(
    routerEndpoint,
    "/api/twilio/conversation-route"
  );

  if (!routerUrl) {
    return blocked("ROUTER_NOT_CONFIGURED");
  }

  if (
    !E164.test(guestPhone || "") ||
    !E164.test(restaurantPhone || "") ||
    incomingTo !== restaurantPhone ||
    guestPhone === restaurantPhone
  ) {
    return blocked("INVALID_PHONE_PAIR");
  }

  let routingResult;

  try {
    routingResult = await signedPost(
      routerUrl,
      secret,
      {
        from: guestPhone,
        to: restaurantPhone,
      }
    );
  } catch {
    return blocked("ROUTER_UNAVAILABLE");
  }

  if (
    routingResult?.success !== true ||
    !["automation", "staff"].includes(
      routingResult.route
    )
  ) {
    return blocked("INVALID_ROUTING_RESPONSE");
  }

  // Preserve the original automation path.
  // No recording request is made in automation mode.

  if (routingResult.route === "automation") {
    return callback(null, {
      success: true,
      route: "automation",
    });
  }

  // Staff inbound bridge:
  //
  // This flag MUST remain disabled until:
  // 1. Studio passes a verified MessageSid.
  // 2. Isolated HTTP tests pass.
  // 3. Protected recording RPCs are deployed.
  // 4. Staff handoff fencing is verified.
  // 5. Production activation is explicitly approved.

  if (
    context.RESERVATION_STUDIO_STAFF_INBOUND_BRIDGE_ENABLED !==
    "true"
  ) {
    return blocked("STAFF_INBOUND_BRIDGE_DISABLED");
  }

  const messageSid = event.MessageSid;

  if (
    typeof messageSid !== "string" ||
    !MESSAGE_SID.test(messageSid)
  ) {
    return blocked("INVALID_MESSAGE_SID");
  }

  // Use the same trusted origin as the configured router.
  // Do not accept a caller-provided recording destination.

  const recordingUrl = new URL(
    "/api/twilio/shared-conversation-inbound",
    routerUrl.origin
  );

  let recordingResult;

  try {
    recordingResult = await signedPost(
      recordingUrl,
      secret,
      {
        from: guestPhone,
        to: restaurantPhone,
        messageSid,
      }
    );
  } catch {
    return blocked("INBOUND_RECORDING_UNAVAILABLE");
  }

  if (
    recordingResult?.success !== true ||
    recordingResult.recorded !== true ||
    recordingResult.conversationMode !== "staff" ||
    typeof recordingResult.conversationId !== "string" ||
    !recordingResult.conversationId ||
    typeof recordingResult.inboundEventId !== "string" ||
    !recordingResult.inboundEventId ||
    typeof recordingResult.duplicate !== "boolean"
  ) {
    return blocked("INBOUND_RECORDING_NOT_CONFIRMED");
  }

  // Both conditions are now confirmed:
  //
  // - The shared router selected staff.
  // - The protected inbound API recorded the message
  //   or confirmed its existing durable record.
  //
  // Studio's staff branch terminates automation.

  return callback(null, {
    success: true,
    route: "staff",
  });
};