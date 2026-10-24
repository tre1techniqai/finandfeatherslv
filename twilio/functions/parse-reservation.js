const TIME_ZONE = "America/Los_Angeles";
const MIN_LEAD_MINUTES = 120;
const MAX_ADVANCE_DAYS = 90;

const ALLOWED_OCCASIONS = [
  "JUST DINING",
  "BIRTHDAY",
  "ANNIVERSARY",
  "DATE NIGHT",
  "BUSINESS",
  "CELEBRATION",
  "OTHER"
];

// Sunday = 0, Monday = 1, ... Saturday = 6.
// Minutes are measured from midnight of the reservation date.
// Midnight and after-midnight reservations are not permitted.
const SERVICE_HOURS = [
  { open: 600, last: 1320 }, // Sunday: 10 AM - 10 PM
  { open: 660, last: 1320 }, // Monday: 11 AM - 10 PM
  { open: 660, last: 1320 }, // Tuesday: 11 AM - 10 PM
  { open: 660, last: 1320 }, // Wednesday: 11 AM - 10 PM
  { open: 660, last: 1320 }, // Thursday: 11 AM - 10 PM
  { open: 660, last: 1410 }, // Friday: 11 AM - 11:30 PM
  { open: 600, last: 1410 }  // Saturday: 10 AM - 11:30 PM
];

function parseDate(value) {
  let year, month, day;

  let match = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);

  if (match) {
    month = Number(match[1]);
    day = Number(match[2]);
    year = Number(match[3]);
  } else {
    match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);

    if (!match) return null;

    year = Number(match[1]);
    month = Number(match[2]);
    day = Number(match[3]);
  }

  if (year < 1000 || year > 9999) return null;

  const candidate = new Date(Date.UTC(year, month - 1, day));

  if (
    candidate.getUTCFullYear() !== year ||
    candidate.getUTCMonth() + 1 !== month ||
    candidate.getUTCDate() !== day
  ) {
    return null;
  }

  return { year, month, day };
}

function parseTime(value) {
  let match = value.match(
    /^(1[0-2]|0?[1-9]):([0-5]\d)\s*(AM|PM)$/i
  );

  if (match) {
    let hour = Number(match[1]) % 12;

    if (match[3].toUpperCase() === "PM") {
      hour += 12;
    }

    return {
      hour,
      minute: Number(match[2])
    };
  }

  match = value.match(/^([01]\d|2[0-3]):([0-5]\d)$/);

  if (!match) return null;

  return {
    hour: Number(match[1]),
    minute: Number(match[2])
  };
}

function parseMobilePhone(value) {
  // Allow the same common U.S. formatting as the website form.
  // Do not accept letters or international country codes other than +1.
  if (!/^[+\d\s().-]+$/.test(value)) return null;

  const digits = value.replace(/\D/g, "");
  const normalized = digits.length === 11 && digits.startsWith("1")
    ? digits.slice(1)
    : digits;

  if (!/^[2-9]\d{2}[2-9]\d{6}$/.test(normalized)) return null;

  return `+1${normalized}`;
}

function addDays(date, days) {
  const result = new Date(
    Date.UTC(date.year, date.month - 1, date.day + days)
  );

  return {
    year: result.getUTCFullYear(),
    month: result.getUTCMonth() + 1,
    day: result.getUTCDate()
  };
}

function getWeekday(date) {
  return new Date(
    Date.UTC(date.year, date.month - 1, date.day)
  ).getUTCDay();
}

function getLocalParts(instant) {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23"
  });

  const parts = Object.fromEntries(
    formatter.formatToParts(instant)
      .filter(part => part.type !== "literal")
      .map(part => [part.type, Number(part.value)])
  );

  return parts;
}

function sameLocalDateTime(parts, date, time) {
  return (
    parts.year === date.year &&
    parts.month === date.month &&
    parts.day === date.day &&
    parts.hour === time.hour &&
    parts.minute === time.minute
  );
}

// Resolve a Las Vegas local date/time to real UTC instants.
// This also detects nonexistent and ambiguous DST times.
function resolveLocalInstants(date, time) {
  const wallTime = Date.UTC(
    date.year,
    date.month - 1,
    date.day,
    time.hour,
    time.minute
  );

  const matches = [];

  // Las Vegas uses UTC-8 or UTC-7.
  for (const offsetHours of [7, 8]) {
    const instant = new Date(
      wallTime + offsetHours * 60 * 60 * 1000
    );

    if (
      sameLocalDateTime(
        getLocalParts(instant),
        date,
        time
      )
    ) {
      matches.push(instant);
    }
  }

  return matches;
}

function isWithinReservationHours(date, time) {
  const weekday = getWeekday(date);
  const minutes = time.hour * 60 + time.minute;

  const today = SERVICE_HOURS[weekday];

  return (
    minutes >= today.open &&
    minutes <= today.last
  );
}

exports.handler = function (context, event, callback) {
  const body = String(event.Body || "").trim();
  const errors = [];
  const fields = {};

  // Require the current website's split-name and mobile-phone format.
  for (const line of body.split(/\r?\n/)) {
    const match = line.match(
      /^\s*(First Name|Last Name|Mobile Phone|Date|Time|Guests|Occasion)\s*:\s*(.*?)\s*$/i
    );

    if (match) {
      const key = match[1]
        .toLowerCase()
        .replace(/\s+/g, "_");

      fields[key] = match[2].trim();
    }
  }

  const first_name = fields.first_name || "";
  const last_name = fields.last_name || "";
  const customer_name = [first_name, last_name].filter(Boolean).join(" ");
  const name = customer_name;
  const submittedPhone = fields.mobile_phone || "";
  const mobilePhone = submittedPhone ? parseMobilePhone(submittedPhone) : null;

  const date = fields.date || "";
  const time = fields.time || "";
  const guests = fields.guests || "";
  const occasion = (fields.occasion || "").toUpperCase();

  if (!first_name) errors.push("Missing first_name");
  if (!last_name) errors.push("Missing last_name");
  if (!submittedPhone) {
    errors.push("Missing Mobile Phone");
  } else if (!mobilePhone) {
    errors.push("Mobile Phone must be a valid 10-digit U.S. phone number");
  }

  if (first_name && first_name.length > 50) {
    errors.push("First name must not exceed 50 characters");
  }

  if (last_name && last_name.length > 50) {
    errors.push("Last name must not exceed 50 characters");
  }

  for (const field of [
    "date",
    "time",
    "guests",
    "occasion"
  ]) {
    if (!fields[field]) {
      errors.push(`Missing ${field}`);
    }
  }

  if (name && (name.length < 2 || name.length > 100)) {
    errors.push(
      "Name must contain between 2 and 100 characters"
    );
  }

  const partySize = /^\d+$/.test(guests)
    ? Number(guests)
    : null;

  if (
    guests &&
    (
      partySize === null ||
      partySize < 1 ||
      partySize > 20
    )
  ) {
    errors.push(
      "Guests must be a number between 1 and 20"
    );
  }

  if (
    occasion &&
    !ALLOWED_OCCASIONS.includes(occasion)
  ) {
    errors.push("Invalid occasion");
  }

  const parsedDate = date ? parseDate(date) : null;
  const parsedTime = time ? parseTime(time) : null;

  if (date && !parsedDate) {
    errors.push(
      "Date must be a valid calendar date using MM/DD/YYYY or YYYY-MM-DD"
    );
  }

  if (time && !parsedTime) {
    errors.push(
      "Time must use H:MM AM/PM or HH:MM"
    );
  }

  if (parsedDate && parsedTime) {
    if (parsedTime.minute % 30 !== 0) {
      errors.push(
        "Reservation times must be in 30-minute increments"
      );
    }

    if (!isWithinReservationHours(parsedDate, parsedTime)) {
      errors.push(
        "Requested time is outside available reservation hours"
      );
    }

    const possibleInstants = resolveLocalInstants(
      parsedDate,
      parsedTime
    );

    if (possibleInstants.length === 0) {
      errors.push(
        "Requested time does not exist in Las Vegas local time"
      );
    } else if (possibleInstants.length > 1) {
      errors.push(
        "Requested time is ambiguous due to daylight saving time"
      );
    } else {
      const requestedAt = possibleInstants[0];
      const now = new Date();

      const earliestAllowed = new Date(
        now.getTime() + MIN_LEAD_MINUTES * 60 * 1000
      );

      if (requestedAt < earliestAllowed) {
        errors.push(
          "Reservations require at least 2 hours advance notice"
        );
      }

      // Maximum 90 calendar days ahead in Las Vegas time.
      const localToday = getLocalParts(now);

      const maximumDate = addDays(
        {
          year: localToday.year,
          month: localToday.month,
          day: localToday.day
        },
        MAX_ADVANCE_DAYS
      );

      const maximumDateKey = Date.UTC(
        maximumDate.year,
        maximumDate.month - 1,
        maximumDate.day
      );

      const requestedDateKey = Date.UTC(
        parsedDate.year,
        parsedDate.month - 1,
        parsedDate.day
      );

      if (requestedDateKey > maximumDateKey) {
        errors.push(
          `Reservations cannot be requested more than ${MAX_ADVANCE_DAYS} days in advance`
        );
      }
    }
  }

  const response = {
    isValid: errors.length === 0,
    first_name,
    last_name,
    mobilePhone,
    customer_name,
    name,
    date,
    time,
    guests,
    partySize,
    occasion,
    errors,
    errorMessage: errors.join("; ")
  };

  return callback(null, response);
};