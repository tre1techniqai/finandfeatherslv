
const crypto = require("node:crypto");

const ALLOWED_STATUSES = new Set([
  "pending",
  "incomplete",
  "unvalidated",
]);

function normalizeDate(value) {
  if (typeof value !== "string") return null;

  const trimmed = value.trim();
  let year;
  let month;
  let day;

  const isoMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);
  const usMatch = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(trimmed);

  if (isoMatch) {
    year = Number(isoMatch[1]);
    month = Number(isoMatch[2]);
    day = Number(isoMatch[3]);
  } else if (usMatch) {
    month = Number(usMatch[1]);
    day = Number(usMatch[2]);
    year = Number(usMatch[3]);
  } else {
    return null;
  }

  if (year < 1 || month < 1 || month > 12 || day < 1) {
    return null;
  }

  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();

  if (day > daysInMonth) {
    return null;
  }

  return (
    `${String(year).padStart(4, "0")}-` +
    `${String(month).padStart(2, "0")}-` +
    `${String(day).padStart(2, "0")}`
  );
}

function normalizeTime(value) {
  if (typeof value !== "string") return null;

  const trimmed = value.trim();

  const twentyFourHourMatch =
    /^(\d{2}):(\d{2})(?::(\d{2}))?$/.exec(trimmed);

  if (twentyFourHourMatch) {
    const hour = Number(twentyFourHourMatch[1]);
    const minute = Number(twentyFourHourMatch[2]);
    const second = Number(twentyFourHourMatch[3] ?? "0");

    if (hour > 23 || minute > 59 || second > 59) {
      return null;
    }

    return (
      `${String(hour).padStart(2, "0")}:` +
      `${String(minute).padStart(2, "0")}:` +
      `${String(second).padStart(2, "0")}`
    );
  }

  const twelveHourMatch =
    /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec(trimmed);

  if (!twelveHourMatch) return null;

  let hour = Number(twelveHourMatch[1]);
  const minute = Number(twelveHourMatch[2]);
  const period = twelveHourMatch[3].toUpperCase();

  if (hour < 1 || hour > 12 || minute > 59) {
    return null;
  }

  if (period === "AM" && hour === 12) hour = 0;
  if (period === "PM" && hour !== 12) hour += 12;

  return `${String(hour).padStart(2, "0")}:${twelveHourMatch[2]}:00`;
}

function optionalText(value) {
  if (typeof value !== "string") return null;

  const trimmed = value.trim();

  return trimmed || null;
}

function buildPayload(event) {
  const requestStatus = optionalText(event.requestStatus);
  const detailsValidated =
    event.detailsValidated === true ||
    (
        typeof event.detailsValidated === "string" &&
        event.detailsValidated.trim().toLowerCase() === "true"
    );

  if (!ALLOWED_STATUSES.has(requestStatus)) {
    throw new Error("Invalid reservation status.");
  }

  const payload = {
    twilioExecutionSid: optionalText(event.twilioExecutionSid),
    customerPhone: optionalText(event.customerPhone),
    requestStatus,
    detailsValidated,
    customerName: null,
    reservationDate: null,
    reservationTime: null,
    partySize: null,
    occasion: null,
    email: null,
    vipPreference: null,
    interruptionReason: optionalText(event.interruptionReason),
    interruptionStage: optionalText(event.interruptionStage),
  };

  if (detailsValidated) {
    const partySizeValue = optionalText(String(event.partySize ?? ""));
    const partySize = partySizeValue === null ? null : Number(partySizeValue);

    if (
    partySize !== null &&
    (!Number.isInteger(partySize) || partySize < 1 || partySize > 20)
    ) {
    throw new Error("Invalid party size.");
    }
    payload.customerName = optionalText(event.customerName);
    payload.reservationDate = normalizeDate(event.reservationDate);
    payload.reservationTime = normalizeTime(event.reservationTime);
    payload.partySize = partySize;
    payload.occasion = optionalText(event.occasion);
    const email = optionalText(event.email);
    payload.email = email?.toUpperCase() === "NOT PROVIDED" ? null : email;
    const vipPreference = optionalText(event.vipPreference);
    payload.vipPreference =
      vipPreference?.toUpperCase() === "NOT PROVIDED"
        ? null
        : vipPreference;
  }

  return payload;
}

async function submitReservation(context, payload) {
  const apiUrl = context.RESERVATION_API_URL;
  const secret = context.RESERVATION_INGEST_SECRET;

const isHttps =
    typeof apiUrl === "string" &&
    /^https:\/\//i.test(apiUrl);

  if (!isHttps) {
    throw new Error("Reservation API URL is not configured.");
  }

  if (!secret || !/^[a-f0-9]{64}$/.test(secret)) {
    throw new Error("Reservation ingestion secret is invalid.");
  }

  const body = JSON.stringify(payload);
  const timestamp = String(Math.floor(Date.now() / 1000));

  const signature = crypto
    .createHmac("sha256", Buffer.from(secret, "hex"))
    .update(`${timestamp}.${body}`)
    .digest("hex");

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-reservation-timestamp": timestamp,
      "x-reservation-signature": signature,
    },
    body,
    signal: AbortSignal.timeout(10000),
  });

  const result = await response.json();

  if (!response.ok || result.success !== true) {
    throw new Error("Reservation API rejected the request.");
  }

  return result;
}

exports.handler = async function (context, event, callback) {
  try {
    const payload = buildPayload(event);
    const result = await submitReservation(context, payload);

    return callback(null, {
      success: true,
      persisted: result.persisted === true,
      reservationId: result.reservationId ?? null,
      reservationStatus: result.reservationStatus ?? null,
      notificationCreated: result.notificationCreated ?? false,
      notificationEventKey: result.notificationEventKey ?? null,
    });
  } catch (error) {
    console.error(
      "Reservation ingestion failed:",
      error instanceof Error ? error.message : "Unknown error",
    );

    return callback(null, {
      success: false,
      persisted: false,
      error: "RESERVATION_INGEST_FAILED",
    });
  }
};

// Export pure helpers for local tests only.
exports._test = {
  normalizeDate,
  normalizeTime,
  buildPayload,
};
