"use strict";

// Twilio Studio Run Function, PROTECTED visibility.
// Processes alternative-time replies before reservation intake.
// Also identifies genuine guest assistance requests.
//
// Does not send SMS, create alerts, or transfer conversation ownership.

const E164 = /^\+[1-9]\d{7,14}$/;
const MESSAGE_SID = /^SM[0-9a-f]{32}$/i;
const MAX_BODY = 4000;

const RESERVATION_FIELDS = [
  "First Name",
  "Last Name",
  "Mobile Phone",
  "Date",
  "Time",
  "Guests",
  "Occasion"
];

function returnResult(callback, result) {
  return callback(null, result);
}

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

function isStructuredReservation(body) {
  return RESERVATION_FIELDS.every((label) =>
    new RegExp(`(?:^|\\n)\\s*${label}:`, "i").test(body)
  );
}

function hasReservationFields(body) {
  return RESERVATION_FIELDS.some((label) =>
    new RegExp(`(?:^|\\n)\\s*${label}:`, "i").test(body)
  );
}

function isMessagingControlCommand(body) {
  return /^(?:STOP|STOPALL|UNSUBSCRIBE|CANCEL|END|QUIT|START|UNSTOP|HELP|INFO)\s*[.!]?$/i.test(
    body
  );
}

function isOrphanedNumericReply(body) {
  return /^[1-3]$/.test(body);
}

// Intentionally conservative:
// An arbitrary SMS must not automatically become a staff alert.
//
// Questions and explicit assistance requests qualify.
// Structured reservation submissions remain in reservation intake.
//
// This is deterministic routing, not AI classification.
function isGuestAssistanceRequest(body) {
  if (!body || body.length > MAX_BODY) return false;

  if (isMessagingControlCommand(body)) return false;
  if (isOrphanedNumericReply(body)) return false;
  if (hasReservationFields(body)) return false;

  const normalized = body.replace(/\s+/g, " ").trim();

  if (normalized.includes("?")) return true;

  return /^(?:(?:hi|hello|hey)[,!.]?\s+)?(?:can you|could you|would you|will you|do you|does your|is there|are there|what|when|where|why|how|who|which|please help|i need help|i have a question|i wanted to ask|i would like to ask|i want to know|i need to speak|i would like to speak|please contact me|please call me|call me|can someone|could someone)\b/i.test(
    normalized
  );
}

function classifyWithoutActiveOffer(body) {
  if (isMessagingControlCommand(body)) {
    return {
      route: "handled",
      outcome: "MESSAGING_CONTROL_COMMAND"
    };
  }

  if (isOrphanedNumericReply(body)) {
    return {
      route: "handled",
      outcome: "no_active_offer"
    };
  }

  // Preserve the existing reservation intake, including
  // incomplete structured submissions needing validation.
  if (isStructuredReservation(body) || hasReservationFields(body)) {
    return {
      route: "reservation",
      outcome: "no_active_offer"
    };
  }

  if (isGuestAssistanceRequest(body)) {
    return {
      route: "assistance",
      outcome: "GUEST_ASSISTANCE_REQUIRED"
    };
  }

  // Preserve the existing intake behavior for messages that
  // are not confidently classified as assistance requests.
  return {
    route: "reservation",
    outcome: "no_active_offer"
  };
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
    console.error(
      "Alternative reply routing: Supabase configuration missing"
    );

    return returnResult(callback, {
      route: "error",
      outcome: "CONFIGURATION_ERROR"
    });
  }

  // The database determines whether there is an active
  // alternative-time offer before we interpret the SMS.
  //
  // Keep the RPC input within its accepted length.
  const replyForRpc = body.slice(0, 100);

  let response;

  try {
    response = await fetch(
      `${baseUrl}/rest/v1/rpc/record_reservation_alternative_reply`,
      {
        method: "POST",
        headers: {
          apikey: serviceKey,
          Authorization: `Bearer ${serviceKey}`,
          "Content-Type": "application/json",
          Accept: "application/json"
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
    console.error(
      "Alternative reply routing: database request unavailable"
    );

    return returnResult(callback, {
      route: "error",
      outcome: "DATABASE_UNAVAILABLE"
    });
  }

  if (!response.ok) {
    console.error(
      "Alternative reply routing: database call failed",
      { status: response.status }
    );

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

  if (outcome === "no_active_offer") {
    const classification = classifyWithoutActiveOffer(body);

    return returnResult(callback, {
      ...classification,
      previousOutcome: outcome
    });
  }

  if (outcome === "recently_accepted") {
    // A complete new reservation must still enter intake.
    if (isStructuredReservation(body) || hasReservationFields(body)) {
      return returnResult(callback, {
        route: "reservation",
        outcome
      });
    }

    // A follow-up question after an accepted alternative
    // is an appropriate guest assistance request.
    if (isGuestAssistanceRequest(body)) {
      return returnResult(callback, {
        route: "assistance",
        outcome: "GUEST_ASSISTANCE_REQUIRED",
        previousOutcome: outcome
      });
    }

    // Preserve existing suppression of ordinary repeat replies.
    return returnResult(callback, {
      route: "handled",
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