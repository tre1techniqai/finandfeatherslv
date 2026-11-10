"use strict";

// Twilio Studio Run Function, PROTECTED visibility.
// Processes alternative-time replies before reservation intake.
// Classifies reservation submissions, deposit email candidates,
// guest assistance requests, and unrelated SMS.
//
// This function performs classification only for deposit emails.
// It does not establish reservation identity, register message
// ownership, save email addresses, send SMS, create alerts,
// or transfer conversation ownership.

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

const RESERVATION_REFERENCE =
  "[A-Z]{2}-\\d{6}-\\d{3,8}";

const EMAIL_ADDRESS =
  "[A-Z0-9.!#$%&'*+/=?^_`{|}~-]+@" +
  "[A-Z0-9](?:[A-Z0-9-]*[A-Z0-9])?" +
  "(?:\\.[A-Z0-9](?:[A-Z0-9-]*[A-Z0-9])?)+";

const DEPOSIT_EMAIL_PATTERN = new RegExp(
  `^${EMAIL_ADDRESS}(?:\\s+${RESERVATION_REFERENCE})?$`,
  "i"
);

function returnResult(callback, result) {
  return callback(null, result);
}

function formatTimeForGuest(value) {
  if (typeof value !== "string") {
    return "";
  }

  const match =
    /^([01]\d|2[0-3]):([0-5]\d)(?::[0-5]\d)?$/.exec(
      value.trim()
    );

  if (!match) {
    return "";
  }

  const hours = Number(match[1]);
  const minutes = match[2];

  const period = hours >= 12 ? "PM" : "AM";
  const displayHour = hours % 12 || 12;

  return `${displayHour}:${minutes} ${period}`;
}

function isStructuredReservation(body) {
  return RESERVATION_FIELDS.every((label) =>
    new RegExp(
      `(?:^|\\n)\\s*${label}:`,
      "i"
    ).test(body)
  );
}

function hasReservationFields(body) {
  return RESERVATION_FIELDS.some((label) =>
    new RegExp(
      `(?:^|\\n)\\s*${label}:`,
      "i"
    ).test(body)
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

function isCancellationRequest(body) {
  const normalized = body
    .replace(/\s+/g, " ")
    .trim();

  return /^(?:(?:hi|hello|hey)[,!.]?\s+)?(?:(?:please|i want to|i need to|i would like to|can you|could you)\s+)?(?:cancel|cancellation|canceling|cancelling)\b(?:\s+(?:my|the|a|our))?\s+(?:reservation|booking|table)\b/i.test(
    normalized
  );
}

// Deterministic classification only.
//
// This does NOT establish:
// - Reservation identity
// - Conversation UUID
// - Twilio message ownership
// - Deposit eligibility
// - Permission to save an email
//
// These checks belong to the existing server-side
// deposit email processor and database functions.

function isDepositEmailCandidate(body) {
  if (
    typeof body !== "string" ||
    body.length === 0 ||
    body.length > MAX_BODY
  ) {
    return false;
  }

  const normalized = body.trim();

  if (
    normalized.length === 0 ||
    normalized.length > 320
  ) {
    return false;
  }

  // Supported inputs:
  //
  // guest@example.com
  //
  // guest@example.com QM-261106-001
  //
  // The reservation reference is OPTIONAL.
  //
  // An email-only reply must still pass the separate
  // reservation-scoped attribution process.
  //
  // Malformed or ambiguous content is not accepted
  // by this classification rule.

  return DEPOSIT_EMAIL_PATTERN.test(normalized);
}

// Deterministic classification only.
// This does not establish reservation identity or SMS ownership.

function isGuestAssistanceRequest(body) {
  if (
    !body ||
    body.length > MAX_BODY
  ) {
    return false;
  }

  if (isMessagingControlCommand(body)) {
    return false;
  }

  if (isOrphanedNumericReply(body)) {
    return false;
  }

  if (hasReservationFields(body)) {
    return false;
  }

  if (isCancellationRequest(body)) {
    return true;
  }

  const normalized = body
    .replace(/\s+/g, " ")
    .trim();

  if (normalized.includes("?")) {
    return true;
  }

  return /^(?:(?:hi|hello|hey)[,!.]?\s+)?(?:can you|could you|would you|will you|do you|does your|is there|are there|what|when|where|why|how|who|which|please help|i need help|i have a question|i wanted to ask|i would like to ask|i want to know|i need to speak|i would like to speak|please contact me|please call me|call me|can someone|could someone)\b/i.test(
    normalized
  );
}

function classifyWithoutActiveOffer(body) {
  // Preserve Twilio messaging control behavior.

  if (isMessagingControlCommand(body)) {
    return {
      route: "handled",
      outcome: "MESSAGING_CONTROL_COMMAND"
    };
  }

  // Preserve suppression of orphaned numeric replies.

  if (isOrphanedNumericReply(body)) {
    return {
      route: "handled",
      outcome: "no_active_offer"
    };
  }

  // Structured and partially structured form submissions
  // must enter existing reservation parsing.
  //
  // Deposit email classification must never intercept
  // a legitimate reservation intake message.

  if (
    isStructuredReservation(body) ||
    hasReservationFields(body)
  ) {
    return {
      route: "reservation",
      outcome: "no_active_offer"
    };
  }

  // A standalone email address is a deposit email
  // candidate, NOT an authorized reservation update.
  //
  // The existing Studio forwarding branch sends the
  // inbound Message SID to the trusted Next.js endpoint.
  //
  // That endpoint independently verifies the Twilio SMS
  // and requires a uniquely identifiable outstanding
  // deposit request associated with the existing
  // reservation-specific conversation UUID.

  if (isDepositEmailCandidate(body)) {
    return {
      route: "handled",
      outcome: "DEPOSIT_EMAIL_CANDIDATE"
    };
  }

  // Preserve existing guest assistance classification.

  if (isGuestAssistanceRequest(body)) {
    return {
      route: "assistance",
      outcome: "GUEST_ASSISTANCE_REQUIRED"
    };
  }

  // An unrelated SMS is not a reservation submission.
  // Do not send it to the reservation correction workflow.
  //
  // Phone-level history is handled separately from this
  // classification result.

  return {
    route: "handled",
    outcome: "GENERAL_MESSAGE"
  };
}

exports.handler = async function (
  context,
  event,
  callback
) {
  const from = String(
    event.From ?? ""
  );

  const body = String(
    event.Body ?? ""
  ).trim();

  const messageSid = String(
    event.MessageSid ?? ""
  );

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

  const baseUrl = String(
    context.SUPABASE_URL ?? ""
  ).replace(/\/$/, "");

  const serviceKey = String(
    context.SUPABASE_SERVICE_ROLE_KEY ?? ""
  );

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
      throw new Error(
        "Invalid Supabase configuration"
      );
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

  // Preserve existing alternative-time RPC.
  //
  // The database determines whether an active offer
  // exists before classifying the SMS.
  //
  // Keep the RPC input within its accepted length.

  const replyForRpc =
    body.slice(0, 100);

  let response;

  try {
    response = await fetch(
      `${baseUrl}/rest/v1/rpc/record_reservation_alternative_reply`,
      {
        method: "POST",
        headers: {
          apikey: serviceKey,
          Authorization:
            `Bearer ${serviceKey}`,
          "Content-Type":
            "application/json",
          Accept:
            "application/json"
        },
        body: JSON.stringify({
          p_customer_phone: from,
          p_inbound_message_sid: messageSid,
          p_reply: replyForRpc
        }),
        signal:
          AbortSignal.timeout(10000)
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
      {
        status: response.status
      }
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

  const record = Array.isArray(rows)
    ? rows[0]
    : rows;

  const outcome =
    record &&
    typeof record.outcome === "string"
      ? record.outcome
      : "INVALID_DATABASE_RESPONSE";

  if (outcome === "no_active_offer") {
    const classification =
      classifyWithoutActiveOffer(body);

    return returnResult(callback, {
      ...classification,
      previousOutcome: outcome
    });
  }

  if (outcome === "recently_accepted") {
    // A new structured reservation must still
    // enter reservation parsing and eligibility checks.

    if (
      isStructuredReservation(body) ||
      hasReservationFields(body)
    ) {
      return returnResult(callback, {
        route: "reservation",
        outcome
      });
    }

    // Allow a verified standalone email candidate
    // to reach reservation-scoped deposit processing.
    //
    // Do not change alternative-time acceptance state.

    if (isDepositEmailCandidate(body)) {
      return returnResult(callback, {
        route: "handled",
        outcome: "DEPOSIT_EMAIL_CANDIDATE",
        previousOutcome: outcome
      });
    }

    if (isGuestAssistanceRequest(body)) {
      return returnResult(callback, {
        route: "assistance",
        outcome: "GUEST_ASSISTANCE_REQUIRED",
        previousOutcome: outcome
      });
    }

    if (isMessagingControlCommand(body)) {
      return returnResult(callback, {
        route: "handled",
        outcome: "MESSAGING_CONTROL_COMMAND",
        previousOutcome: outcome
      });
    }

    // Preserve suppression of ordinary repeat replies.

    return returnResult(callback, {
      route: "handled",
      outcome
    });
  }

  // Preserve existing alternative-time reply behavior.

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
      acceptedTimeFormatted:
        formatTimeForGuest(acceptedTime)
    });
  }

  return returnResult(callback, {
    route: "error",
    outcome: "UNEXPECTED_RESULT"
  });
};

// Pure helpers exposed for local unit testing.
// No Twilio or database calls are performed by these helpers.

exports._test = {
  isDepositEmailCandidate,
  classifyWithoutActiveOffer
};