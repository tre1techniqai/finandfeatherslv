// Twilio Function: /check-conversation-ownership
// Visibility: Protected. Read-only. No SMS, database writes, or Studio changes.
const crypto = require("crypto");

const E164 = /^\+[1-9]\d{7,14}$/;

exports.handler = async function (context, event, callback) {
  const blocked = (reason) => callback(null, {
    success: false,
    route: "block",
    reason,
  });

  const secret = context.RESERVATION_STUDIO_ROUTER_SECRET;
  const endpoint = context.RESERVATION_STUDIO_ROUTER_URL;
  const restaurantPhone = context.RESERVATION_RESTAURANT_PHONE;
  const guestPhone = event.From;
  const incomingTo = event.To;

  if (typeof secret !== "string" || Buffer.byteLength(secret, "utf8") < 32) {
    return blocked("ROUTER_NOT_CONFIGURED");
  }
  if (typeof endpoint !== "string") return blocked("ROUTER_NOT_CONFIGURED");
  let url;
  try {
    url = new URL(endpoint);
    if (
      url.protocol !== "https:" ||
      url.username || url.password || url.hash ||
      url.pathname !== "/api/twilio/conversation-route" ||
      url.search
    ) return blocked("ROUTER_NOT_CONFIGURED");
  } catch {
    return blocked("ROUTER_NOT_CONFIGURED");
  }

  if (
    !E164.test(guestPhone || "") ||
    !E164.test(restaurantPhone || "") ||
    incomingTo !== restaurantPhone ||
    guestPhone === restaurantPhone
  ) return blocked("INVALID_PHONE_PAIR");

  const timestamp = String(Math.floor(Date.now() / 1000));
  const body = JSON.stringify({ from: guestPhone, to: restaurantPhone });
  const signature = crypto.createHmac("sha256", secret)
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
    if (!response.ok) return blocked("ROUTER_UNAVAILABLE");
    const result = await response.json();
    if (
      result?.success !== true ||
      !["automation", "staff"].includes(result.route)
    ) return blocked("INVALID_ROUTING_RESPONSE");

    // Diagnostic-only. A later Studio split must explicitly handle all 3 values.
    return callback(null, {
      success: true,
      route: result.route,
    });
  } catch {
    return blocked("ROUTER_UNAVAILABLE");
  }
};