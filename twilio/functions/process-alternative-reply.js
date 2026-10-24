"use strict";

// Twilio Studio Run Function, PROTECTED visibility.
// Run BEFORE the existing parse-reservation widget on new executions.
// Pass From, Body, MessageSid from trigger.message.*.
// Requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.
// Do not use this Function as a public incoming-message webhook.

const E164 = /^\+[1-9]\d{7,14}$/;
const MESSAGE_SID = /^SM[0-9a-f]{32}$/i;
const MAX_BODY = 4000;

function returnResult(callback, result) {
  return callback(null, result);
}

// Format database times for guest-facing messages.
// Keep the original acceptedTime value unchanged for compatibility.
function formatTimeForGuest(value) {
  if (typeof value !== "string") return "";

  const match = /^([01]\d|2[0-3]):([0-5]\d)(?::[0-5]\d)?$/.exec(
    value.trim()
  );

  if (!match) return "";

  const hours = Number(match[1]);
  const minutes = match[2];
  const period = hours >= 12 ? "PM" : "AM";
  const displayHour = hours % 12 || 12;

  return `${displayHour}:${minutes} ${period}`;
}

exports.handler = async function (context, event, callback) {
  const from = String(event.From ?? "");
  const body = String(event.Body ?? "").trim();
  const messageSid = String(event.MessageSid ?? "");

  if (
    !E164.test(from) ||
    !MESSAGE_SID.test(messageSid) ||
    body.length > MAX_BODY
  ) {
    return returnResult(callback, {
      route: "error",
      outcome: "INVALID_INBOUND"
    });
  }

  const baseUrl = String(context.SUPABASE_URL ?? "").replace(/\/$/, "");
  const serviceKey = String(context.SUPABASE_SERVICE_ROLE_KEY ?? "");

  try {
    const parsed = new URL(baseUrl);

    if (
      parsed.protocol !== "https:" ||
      parsed.username ||
      parsed.password ||
      parsed.search ||
      parsed.hash ||
      !serviceKey
    ) {
      throw new Error("Invalid Supabase configuration");
    }
  } catch {
    console.error("Alternative reply routing: Supabase configuration missing");

    return returnResult(callback, {
      route: "error",
      outcome: "CONFIGURATION_ERROR"
    });
  }

  // The database checks for active offers before interpreting the SMS.
  // Limit the value to the RPC's maximum accepted input length.
  const replyForRpc = body.slice(0, 100);

  let response;

  try {
    response = await fetch(
      `${baseUrl}/rest/v1/rpc/record_reservation_alternative_reply`,
      {
        method: "POST",
        headers: {
          "apikey": serviceKey,
          "Authorization": `Bearer ${serviceKey}`,
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          p_customer_phone: from,
          p_inbound_message_sid: messageSid,
          p_reply: replyForRpc
        }),
        signal: AbortSignal.timeout(10000)
      }
    );
  } catch {
    console.error("Alternative reply routing: database request unavailable");

    return returnResult(callback, {
      route: "error",
      outcome: "DATABASE_UNAVAILABLE"
    });
  }

  if (!response.ok) {
    console.error("Alternative reply routing: database call failed", {
      status: response.status
    });

    return returnResult(callback, {
      route: "error",
      outcome: "DATABASE_ERROR"
    });
  }

  let rows;

  try {
    rows = await response.json();
  } catch {
    return returnResult(callback, {
      route: "error",
      outcome: "INVALID_DATABASE_RESPONSE"
    });
  }

  const record = Array.isArray(rows) ? rows[0] : rows;

  const outcome =
    record && typeof record.outcome === "string"
      ? record.outcome
      : "INVALID_DATABASE_RESPONSE";

  // Do not send orphaned numeric replies to reservation intake.
  if (outcome === "no_active_offer") {
    return returnResult(callback, {
      route: /^[1-3]$/.test(body) ? "handled" : "reservation",
      outcome
    });
  }

  if (outcome === "recently_accepted") {
    // Permit a new, complete reservation request from the same guest.
    const isNewReservation = [
      "First Name",
      "Last Name",
      "Mobile Phone",
      "Date",
      "Time",
      "Guests",
      "Occasion"
    ].every((label) =>
      new RegExp(`(?:^|\\n)\\s*${label}:`, "i").test(body)
    );

    return returnResult(callback, {
      route: isNewReservation ? "reservation" : "handled",
      outcome
    });
  }

  if (
    [
      "accepted",
      "duplicate",
      "invalid_selection",
      "ambiguous_offer"
    ].includes(outcome)
  ) {
    const acceptedTime =
      typeof record.accepted_time === "string"
        ? record.accepted_time
        : "";

    return returnResult(callback, {
      route: "handled",
      outcome,
      reservationId:
        typeof record.reservation_id === "string"
          ? record.reservation_id
          : "",
      acceptedTime,
      acceptedTimeFormatted: formatTimeForGuest(acceptedTime)
    });
  }

  return returnResult(callback, {
    route: "error",
    outcome: "UNEXPECTED_RESULT"
  });
};
