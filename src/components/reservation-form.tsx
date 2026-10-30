"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import Image from "next/image";

const RESERVATION_PHONE = "17253082066";
const RESERVATION_PHONE_DISPLAY = "(725) 308-2066";
const TIME_ZONE = "America/Los_Angeles";
const MAX_DAYS_AHEAD = 90;
const MIN_HOURS_AHEAD = 2;

const OCCASIONS = [
  "JUST DINING",
  "BIRTHDAY",
  "ANNIVERSARY",
  "DATE NIGHT",
  "BUSINESS",
  "CELEBRATION",
  "OTHER",
] as const;

function getDateTimeParts(date: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);

  const values = Object.fromEntries(
    parts.map((part) => [part.type, part.value]),
  );

  return {
    year: Number(values.year),
    month: Number(values.month),
    day: Number(values.day),
    hour: Number(values.hour),
    minute: Number(values.minute),
  };
}

function getLocalDateString(date: Date) {
  const parts = getDateTimeParts(date);

  return `${parts.year}-${String(parts.month).padStart(2, "0")}-${String(
    parts.day,
  ).padStart(2, "0")}`;
}

function addCalendarDays(dateString: string, days: number) {
  const [year, month, day] = dateString.split("-").map(Number);

  const date = new Date(Date.UTC(year, month - 1, day + days));

  return [
    date.getUTCFullYear(),
    String(date.getUTCMonth() + 1).padStart(2, "0"),
    String(date.getUTCDate()).padStart(2, "0"),
  ].join("-");
}

function formatDate(dateString: string) {
  if (!dateString) return "";

  const [year, month, day] = dateString.split("-").map(Number);

  return new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC",
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(Date.UTC(year, month - 1, day)));
}

function formatDateForSms(dateString: string) {
  if (!dateString) return "";

  const [year, month, day] = dateString.split("-");

  return `${month}/${day}/${year}`;
}

function formatTime(timeString: string) {
  if (!timeString) return "";

  const [hour, minute] = timeString.split(":").map(Number);
  const date = new Date(Date.UTC(2020, 0, 1, hour, minute));

  return new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function getLocalDateStringForUTC(date: Date) {
  return [
    date.getUTCFullYear(),
    String(date.getUTCMonth() + 1).padStart(2, "0"),
    String(date.getUTCDate()).padStart(2, "0"),
  ].join("-");
}

function getReservationTimestamp(dateString: string, timeString: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return null;
  if (!/^\d{2}:\d{2}$/.test(timeString)) return null;

  const [year, month, day] = dateString.split("-").map(Number);
  const [hour, minute] = timeString.split(":").map(Number);

  const desired = new Date(Date.UTC(year, month - 1, day, hour, minute));

  if (
    getLocalDateStringForUTC(
      new Date(Date.UTC(year, month - 1, day)),
    ) !== dateString ||
    hour > 23 ||
    minute > 59
  ) {
    return null;
  }

  // Search actual UTC instants so DST changes are handled correctly.
  const approximate = desired.getTime();

  for (let offset = -14; offset <= 14; offset++) {
    const candidate = new Date(approximate + offset * 60 * 60 * 1000);
    const parts = getDateTimeParts(candidate);

    if (
      parts.year === year &&
      parts.month === month &&
      parts.day === day &&
      parts.hour === hour &&
      parts.minute === minute
    ) {
      return candidate.getTime();
    }
  }

  return null;
}

function meetsAdvanceNotice(
  dateString: string,
  timeString: string,
  currentTime: Date,
) {
  const reservationTimestamp = getReservationTimestamp(dateString, timeString);

  return (
    reservationTimestamp !== null &&
    reservationTimestamp - currentTime.getTime() >=
      MIN_HOURS_AHEAD * 60 * 60 * 1000
  );
}

function getTimeSlots(dateString: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return [];

  const [year, month, day] = dateString.split("-").map(Number);
  const selectedDate = new Date(Date.UTC(year, month - 1, day));
  if (getLocalDateStringForUTC(selectedDate) !== dateString) return [];

  const dayOfWeek = selectedDate.getUTCDay();
  const opensAt = dayOfWeek === 0 || dayOfWeek === 6 ? 10 * 60 : 11 * 60;
  const closesForReservationsAt = dayOfWeek === 5 || dayOfWeek === 6
    ? 23 * 60 + 30
    : 22 * 60;

  const slots: string[] = [];
  for (let minutes = opensAt; minutes <= closesForReservationsAt; minutes += 30) {
    const hour = Math.floor(minutes / 60);
    const minute = minutes % 60;

    slots.push(
      `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`,
    );
  }

  return slots;
}

function formatMobilePhoneInput(value: string) {
  const enteredDigits = value.replace(/\D/g, "");
  const nationalDigits =
    enteredDigits.startsWith("1")
      ? enteredDigits.slice(1)
      : enteredDigits;

  const digits = nationalDigits.slice(0, 10);

  if (!digits) return "";
  if (digits.length < 4) return `(${digits}`;
  if (digits.length < 7) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  }

  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

function isMobileDevice() {
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

function buildReservationMessage(details: {
  first_name: string;
  last_name: string;
  mobilePhone: string;
  date: string;
  time: string;
  partySize: string;
  occasion: string;
}) {
  return [
    "Hello Fin & Feathers! I'd like to request a reservation.",
    "",
    `First Name: ${details.first_name.trim()}`,
    `Last Name: ${details.last_name.trim()}`,
    `Mobile Phone: ${details.mobilePhone}`,
    `Date: ${formatDateForSms(details.date)}`,
    `Time: ${formatTime(details.time)}`,
    `Guests: ${details.partySize}`,
    `Occasion: ${details.occasion}`,
    "",
    "I understand reservations are for a maximum of two hours, subject to restaurant policy.",
    "",
    "I understand this is a request and is not confirmed until the Fin & Feathers team replies.",
  ].join("\n");
}

export default function ReservationForm() {
  const [now, setNow] = useState<Date | null>(null);

  const [first_name, setFirstName] = useState("");
  const [last_name, setLastName] = useState("");
  const [mobilePhone, setMobilePhone] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [partySize, setPartySize] = useState("2");
  const [occasion, setOccasion] =
    useState<(typeof OCCASIONS)[number]>("JUST DINING");

  const [smsConsent, setSmsConsent] = useState(false);
  const [smsDetailsOpen, setSmsDetailsOpen] = useState(false);
  const [durationAcknowledged, setDurationAcknowledged] = useState(false);

  const [preparedMessage, setPreparedMessage] = useState("");
  const [showFallback, setShowFallback] = useState(false);
  const [smsHandoffAttempted, setSmsHandoffAttempted] = useState(false);
  const [copyStatus, setCopyStatus] = useState("");
  const [formError, setFormError] = useState("");

  useEffect(() => {
    setNow(new Date());

    const interval = window.setInterval(() => {
      setNow(new Date());
    }, 30_000);

    return () => window.clearInterval(interval);
  }, []);

  const minimumDate = useMemo(
    () => (now ? getLocalDateString(now) : ""),
    [now],
  );

  // Exclude today once no reservation slots satisfy the two-hour notice rule.
  // The native date input uses this minimum to disable earlier calendar dates.
  const earliestSelectableDate = useMemo(() => {
    if (!now || !minimumDate) return "";

    const hasEligibleTimeToday = getTimeSlots(minimumDate).some((slot) =>
      meetsAdvanceNotice(minimumDate, slot, now),
    );

    return hasEligibleTimeToday
      ? minimumDate
      : addCalendarDays(minimumDate, 1);
  }, [minimumDate, now]);

  const maximumDate = useMemo(
    () => (minimumDate ? addCalendarDays(minimumDate, MAX_DAYS_AHEAD) : ""),
    [minimumDate],
  );

  const availableTimes = useMemo(() => {
    if (!now || !date) return [];

    return getTimeSlots(date).filter((slot) =>
      meetsAdvanceNotice(date, slot, now),
    );
  }, [date, now]);

  // If the last eligible slot passes while the form remains open, clear
  // the now-ineligible date and time rather than leaving a stale selection.
  useEffect(() => {
    if (date && earliestSelectableDate && date < earliestSelectableDate) {
      setDate("");
      setTime("");
      setFormError("");
      setPreparedMessage("");
      setShowFallback(false);
      setSmsHandoffAttempted(false);
    }
  }, [date, earliestSelectableDate]);

  useEffect(() => {
    if (time && !availableTimes.includes(time)) {
      setTime("");
      setPreparedMessage("");
      setShowFallback(false);
      setSmsHandoffAttempted(false);
    }
  }, [time, availableTimes]);

  const handleDateChange = (value: string) => {
    setDate(value);
    setTime("");
    setFormError("");
    setPreparedMessage("");
    setShowFallback(false);
    setSmsHandoffAttempted(false);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");
    setCopyStatus("");
    setPreparedMessage("");
    setShowFallback(false);
    setSmsHandoffAttempted(false);

    if (!now) {
      setFormError("Please wait a moment and try again.");
      return;
    }

    if (!first_name.trim()) {
      setFormError("Please enter your first name.");
      return;
    }

    if (!last_name.trim()) {
      setFormError("Please enter your last name.");
      return;
    }

    if (first_name.trim().length > 50 || last_name.trim().length > 50) {
      setFormError("Please keep each name to 50 characters or fewer.");
      return;
    }

    if (`${first_name.trim()} ${last_name.trim()}`.length > 100) {
      setFormError("Please keep your full name to 100 characters or fewer.");
      return;
    }

    const phoneDigits = mobilePhone.replace(/\D/g, "");
    const normalizedPhone =
      phoneDigits.length === 11 && phoneDigits.startsWith("1")
        ? phoneDigits.slice(1)
        : phoneDigits;

    if (
      normalizedPhone.length !== 10 ||
      !/^[2-9]\d{2}[2-9]\d{6}$/.test(normalizedPhone)
    ) {
      setFormError("Please enter a valid 10-digit U.S. mobile phone number.");
      return;
    }

    const formattedMobilePhone = formatMobilePhoneInput(normalizedPhone);

    if (!date || !time) {
      setFormError("Please select your preferred date and time.");
      return;
    }

    if (date < getLocalDateString(new Date()) || date > addCalendarDays(getLocalDateString(new Date()), MAX_DAYS_AHEAD)) {
      setFormError(
        `Please choose a date within the next ${MAX_DAYS_AHEAD} calendar days.`,
      );
      return;
    }

    // Recheck against the actual submission time, not the last UI refresh.
    const submissionNow = new Date();
    const submissionToday = getLocalDateString(submissionNow);

    if (
      date < submissionToday ||
      !getTimeSlots(date).includes(time) ||
      !meetsAdvanceNotice(date, time, submissionNow)
    ) {
      setFormError(
        "That time is no longer available to select. Please choose another time.",
      );
      return;
    }

    if (!OCCASIONS.includes(occasion)) {
      setFormError("Please select an occasion.");
      return;
    }

    if (!durationAcknowledged) {
      setFormError(
        "Please acknowledge the two-hour reservation policy before continuing.",
      );
      return;
    }

    if (!smsConsent) {
      setFormError(
        "Please provide consent to continue with this text-based reservation request.",
      );
      return;
    }

    const message = buildReservationMessage({
      first_name,
      last_name,
      mobilePhone: formattedMobilePhone,
      date,
      time,
      partySize,
      occasion,
    });

    setPreparedMessage(message);

    if (isMobileDevice()) {
      setSmsHandoffAttempted(true);

      const smsUrl = `sms:${RESERVATION_PHONE}?body=${encodeURIComponent(
        message,
      )}`;

      window.location.href = smsUrl;
    } else {
      setShowFallback(true);
    }
  };

  const handleCopyMessage = async () => {
    if (!preparedMessage) return;

    try {
      await navigator.clipboard.writeText(preparedMessage);
      setCopyStatus("Message copied. Paste it into your messaging app.");
    } catch {
      setCopyStatus(
        "Automatic copying is unavailable. Select and copy the message above.",
      );
    }
  };

  const handleOpenMessagingApp = () => {
    if (!preparedMessage) return;

    const smsUrl = `sms:${RESERVATION_PHONE}?body=${encodeURIComponent(
      preparedMessage,
    )}`;

    window.location.href = smsUrl;
  };

  return (
    <section className="mx-auto w-full max-w-4xl px-4 py-8 text-white sm:px-6 sm:py-12">
      <div className="overflow-hidden rounded-2xl border border-white/20 bg-[#101010]/95 shadow-2xl">
        
      <div className="border-b border-white/15 bg-[rgb(234_27_36_/_40%)] px-5 py-6 sm:px-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0 flex-1">
            <p className="text-xs font-bold tracking-[0.2em] text-yellow-400">
                FIN &amp; FEATHERS · LAS VEGAS
            </p>

            <h1 className="mt-2 text-2xl font-bold tracking-wide sm:text-3xl">
                REQUEST A RESERVATION
            </h1>

            <p className="mt-3 text-sm leading-6 text-white/80">
                Submit your preferred date, time, party size, and occasion. Your
                request will be prepared as a text message for our team.
            </p>
            </div>

            <div className="flex shrink-0 justify-center sm:justify-end">
            <Image
                src="/img/fin-feathers-lv-logo-500.png"
                alt="Fin & Feathers Las Vegas"
                width={220}
                height={220}
                priority
                className="neon-flicker h-auto w-36 object-contain sm:w-44 md:w-52"
            />
            </div>
          </div>
        </div>


        <div className="min-w-0 px-4 py-5 sm:px-8 sm:py-7">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid min-w-0 grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="min-w-0">
                <label
                  htmlFor="reservation-first-name"
                  className="mb-2 block text-sm font-semibold"
                >
                  First Name <span className="text-red-400">*</span>
                </label>

                <input
                  id="reservation-first-name"
                  name="first_name"
                  type="text"
                  autoComplete="given-name"
                  maxLength={50}
                  required
                  value={first_name}
                  onChange={(event) => setFirstName(event.target.value)}
                  className="w-full min-w-0 rounded-lg border border-white/20 bg-black/50 px-4 py-3 text-base text-white outline-none transition placeholder:text-white/40 focus:border-red-500 focus:ring-2 focus:ring-red-500/30"
                  placeholder="Enter your first name"
                />
              </div>

              <div className="min-w-0">
                <label
                  htmlFor="reservation-last-name"
                  className="mb-2 block text-sm font-semibold"
                >
                  Last Name <span className="text-red-400">*</span>
                </label>

                <input
                  id="reservation-last-name"
                  name="last_name"
                  type="text"
                  autoComplete="family-name"
                  maxLength={50}
                  required
                  value={last_name}
                  onChange={(event) => setLastName(event.target.value)}
                  className="w-full min-w-0 rounded-lg border border-white/20 bg-black/50 px-4 py-3 text-base text-white outline-none transition placeholder:text-white/40 focus:border-red-500 focus:ring-2 focus:ring-red-500/30"
                  placeholder="Enter your last name"
                />
              </div>
            </div>

            <div className="min-w-0">
              <label
                htmlFor="reservation-mobile-phone"
                className="mb-2 block text-sm font-semibold"
              >
                Mobile Phone Number <span className="text-red-400">*</span>
              </label>
              <input
                id="reservation-mobile-phone"
                name="mobilePhone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                required
                maxLength={20}
                value={mobilePhone}
                onChange={(event) =>
                  setMobilePhone(formatMobilePhoneInput(event.target.value))
                }
                placeholder="(702) 555-0123"
                aria-describedby="reservation-mobile-phone-hint"
                className="w-full min-w-0 rounded-lg border border-white/20 bg-black/50 px-4 py-3 text-base text-white outline-none transition placeholder:text-white/40 focus:border-red-500 focus:ring-2 focus:ring-red-500/30"
              />
              <p
                id="reservation-mobile-phone-hint"
                className="mt-2 text-xs leading-5 text-white/60"
              >
                This number will be included in your prepared reservation text
                so our team can contact you about your request.
              </p>
            </div>

            <div className="grid min-w-0 grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
              <div className="w-full min-w-0">
                <label
                    htmlFor="reservation-date"
                    className="mb-2 block text-sm font-semibold text-white"
                >
                    Preferred Date <span className="text-red-400">*</span>
                </label>
                <input
                    id="reservation-date"
                    name="date"
                    type="date"
                    required
                    min={earliestSelectableDate}
                    max={maximumDate}
                    disabled={!now}
                    value={date}
                    onChange={(event) => handleDateChange(event.target.value)}
                    className="block w-full min-w-0 max-w-full appearance-none rounded-lg border border-white/20 bg-black/50 px-2 py-3 text-base text-white [box-sizing:border-box] [&::-webkit-date-and-time-value]:min-w-0 [&::-webkit-date-and-time-value]:text-left [&::-webkit-datetime-edit]:min-w-0 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/30 disabled:opacity-50 sm:px-3"
                />

                <p className="mt-2 text-xs leading-5 text-white/60">
                  Requests may be made up to 90 calendar days in advance.
                  {minimumDate && earliestSelectableDate > minimumDate && (
                    <span className="mt-1 block text-yellow-300/90">
                      No eligible times remain today. Please select a future date.
                    </span>
                  )}
                </p>
              </div>

              <div className="w-full min-w-0">
                <label
                  htmlFor="reservation-time"
                  className="mb-2 block text-sm font-semibold"
                >
                  Preferred Time <span className="text-red-400">*</span>
                </label>

                <select
                  id="reservation-time"
                  name="time"
                  required
                  disabled={!date || !now}
                  value={time}
                  onChange={(event) => {
                    setTime(event.target.value);
                    setFormError("");
                  }}
                  className="w-full rounded-lg border border-white/20 bg-black/50 px-4 py-3 text-base text-white outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-500/30 disabled:opacity-50"
                >
                  <option value="">Select a time</option>
                  {availableTimes.map((slot) => (
                    <option key={slot} value={slot} className="bg-[#101010]">
                      {formatTime(slot)}
                    </option>
                  ))}
                </select>

                <p className="mt-2 text-xs leading-5 text-white/60">
                  Available request times are shown in 30-minute increments.
                </p>
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="reservation-party-size"
                  className="mb-2 block text-sm font-semibold"
                >
                  Party Size <span className="text-red-400">*</span>
                </label>

                <select
                  id="reservation-party-size"
                  name="partySize"
                  required
                  value={partySize}
                  onChange={(event) => setPartySize(event.target.value)}
                  className="w-full rounded-lg border border-white/20 bg-black/50 px-4 py-3 text-base text-white outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-500/30"
                >
                  {Array.from({ length: 20 }, (_, index) => index + 1).map(
                    (size) => (
                      <option
                        key={size}
                        value={String(size)}
                        className="bg-[#101010]"
                      >
                        {size} {size === 1 ? "Guest" : "Guests"}
                      </option>
                    ),
                  )}
                </select>
              </div>

              <div>
                <label
                  htmlFor="reservation-occasion"
                  className="mb-2 block text-sm font-semibold"
                >
                  Occasion <span className="text-red-400">*</span>
                </label>

                <select
                  id="reservation-occasion"
                  name="occasion"
                  required
                  value={occasion}
                  onChange={(event) =>
                    setOccasion(
                      event.target.value as (typeof OCCASIONS)[number],
                    )
                  }
                  className="w-full rounded-lg border border-white/20 bg-black/50 px-4 py-3 text-base text-white outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-500/30"
                >
                  {OCCASIONS.map((item) => (
                    <option
                      key={item}
                      value={item}
                      className="bg-[#101010]"
                    >
                      {item}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-4 border-t border-white/15 pt-5">
              <label className="flex items-start gap-3 text-sm leading-6 text-white/80">
                <input
                  type="checkbox"
                  required
                  checked={durationAcknowledged}
                  onChange={(event) =>
                    setDurationAcknowledged(event.target.checked)
                  }
                  className="mt-1 h-4 w-4 shrink-0 accent-red-500"
                />

                <span>
                  I acknowledge that reservations are subject to a maximum
                  two-hour dining period and applicable restaurant policies.
                  <span className="text-red-400"> *</span>
                </span>
              </label>

              <div className="space-y-2">
                <label className="flex items-start gap-3 text-sm leading-6 text-white/80">
                  <input
                    type="checkbox"
                    required
                    checked={smsConsent}
                    onChange={(event) => setSmsConsent(event.target.checked)}
                    className="mt-1 h-4 w-4 shrink-0 accent-red-500"
                  />

                  <span>
                    I agree to receive reservation-related SMS/text messages,
                    including automated and staff-assisted replies, from
                    Fin &amp; Feathers Las Vegas. See{" "}
                    <a
                      href="#reservation-sms-details"
                      onClick={() => setSmsDetailsOpen(true)}
                      className="font-semibold text-red-300 underline underline-offset-4 hover:text-red-200"
                    >
                      SMS Messaging Details
                    </a>
                    ,{" "}
                    <a
                      href="/terms-of-service"
                      className="font-semibold text-red-300 underline underline-offset-4 hover:text-red-200"
                    >
                      Terms of Service
                    </a>
                    , and{" "}
                    <a
                      href="/privacy-policy"
                      className="font-semibold text-red-300 underline underline-offset-4 hover:text-red-200"
                    >
                      Privacy Policy
                    </a>
                    .
                    <span className="text-red-400"> *</span>
                  </span>
                </label>
                <p className="pl-7 text-xs leading-5 text-white/65">
                  Reservation updates and follow-ups. Typically 3–6 messages
                  per request; frequency varies. Msg &amp; data rates may
                  apply. Reply STOP to cancel, HELP for help when using our
                  Twilio messaging service.
                </p>
              </div>
            </div>

            {formError && (
              <p
                role="alert"
                className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200"
              >
                {formError}
              </p>
            )}

            <button
              type="submit"
              disabled={!now}
              className="w-full rounded-lg bg-[#ea1b24] px-5 py-4 text-sm font-extrabold tracking-[0.12em] text-white transition hover:bg-[#ff3038] focus:outline-none focus:ring-2 focus:ring-red-300 focus:ring-offset-2 focus:ring-offset-[#101010] disabled:cursor-not-allowed disabled:opacity-50"
            >
              PREPARE TEXT MESSAGE
            </button>

            <p className="text-center text-xs leading-5 text-white/50">
              Required fields are marked with an asterisk (*).
            </p>

            <div
              id="reservation-sms-details"
              className="scroll-mt-6 rounded-xl border border-white/15 bg-black/30"
            >
              <button
                type="button"
                onClick={() => setSmsDetailsOpen((open) => !open)}
                aria-expanded={smsDetailsOpen}
                aria-controls="reservation-sms-details-content"
                className="flex w-full items-center justify-between gap-4 rounded-xl px-4 py-4 text-left text-sm font-semibold text-white transition hover:bg-white/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-400 sm:px-5"
              >
                <span>SMS Messaging Details</span>
                <span aria-hidden="true" className="text-lg text-red-300">
                  {smsDetailsOpen ? "−" : "+"}
                </span>
              </button>

              {smsDetailsOpen && (
                <div
                  id="reservation-sms-details-content"
                  className="space-y-3 border-t border-white/15 px-4 py-4 text-xs leading-6 text-white/75 sm:px-5 sm:text-sm"
                >
                  <p>
                    Reservation-related replies may include request
                    acknowledgments, questions about missing details,
                    deposit requirements, VIP seating preferences,
                    availability updates, and confirmation or cancellation
                    information. A typical reservation conversation involves
                    approximately 3–6 text messages; frequency may vary.
                    Message and data rates may apply.
                  </p>

                  <p>
                    The website prepares a reservation text for you to send to{" "}
                    {RESERVATION_PHONE_DISPLAY} from your own device. You must
                    send the message yourself. Submitting a reservation request
                    does not guarantee availability, and your reservation is
                    not confirmed until our staff sends you a confirmation.
                  </p>

                  <p>
                    Reply STOP to opt out of reservation-related text messages
                    or HELP for assistance. For restaurant assistance, call
                    (725) 204-9655. Reservation messaging is separate
                    from optional promotional marketing. See our{ " "}
                    <a
                      href="/terms-of-service"
                      className="font-semibold text-red-300 underline underline-offset-4 hover:text-red-200"
                    >
                      Terms of Service
                    </a>{ " "}
                    and{" "}
                    <a
                      href="/privacy-policy"
                      className="font-semibold text-red-300 underline underline-offset-4 hover:text-red-200"
                    >
                      Privacy Policy
                    </a>.
                  </p>
                </div>
              )}
            </div>
          </form>

          {preparedMessage && showFallback && (
            <div className="mt-8 space-y-4 rounded-xl border border-white/20 bg-white/5 p-4 sm:p-6">
              <h2 className="text-lg font-bold">Your Request Is Ready</h2>

              <p className="text-sm leading-6 text-white/70">
                Review your message, then copy it or open your messaging app to
                send it to Fin &amp; Feathers.
              </p>

              <label
                htmlFor="reservation-prepared-message"
                className="block text-sm font-semibold"
              >
                Prepared message
              </label>

              <textarea
                id="reservation-prepared-message"
                readOnly
                rows={9}
                value={preparedMessage}
                className="w-full resize-y rounded-lg border border-white/20 bg-black/60 px-3 py-3 text-sm leading-6 text-white"
              />

              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={handleCopyMessage}
                  className="rounded-lg border border-white/30 px-4 py-3 text-sm font-bold transition hover:bg-white/10"
                >
                  COPY MESSAGE
                </button>

                <button
                  type="button"
                  onClick={handleOpenMessagingApp}
                  className="rounded-lg bg-[#ea1b24] px-4 py-3 text-sm font-bold transition hover:bg-[#ff3038]"
                >
                  OPEN MESSAGING APP
                </button>
              </div>

              {copyStatus && (
                <p role="status" className="text-sm text-white/80">
                  {copyStatus}
                </p>
              )}
            </div>
          )}

          {preparedMessage && smsHandoffAttempted && (
            <div className="mt-8 rounded-xl border border-white/20 bg-white/5 p-4 sm:p-6">
              <h2 className="text-lg font-bold">Finish Sending Your Request</h2>

              <p className="mt-2 text-sm leading-6 text-white/70">
                Your device may open its messaging app with the request
                prepared. Please review the message and tap Send. If your
                messaging app did not open, you can use the button below.
              </p>

              <button
                type="button"
                onClick={handleOpenMessagingApp}
                className="mt-4 w-full rounded-lg bg-[#ea1b24] px-4 py-3 text-sm font-bold transition hover:bg-[#ff3038]"
              >
                OPEN MESSAGING APP
              </button>

              <div className="mt-4">
                <label
                  htmlFor="reservation-mobile-message"
                  className="block text-sm font-semibold"
                >
                  Your prepared message
                </label>

                <textarea
                  id="reservation-mobile-message"
                  readOnly
                  rows={9}
                  value={preparedMessage}
                  className="mt-2 w-full resize-y rounded-lg border border-white/20 bg-black/60 px-3 py-3 text-sm leading-6 text-white"
                />
              </div>
            </div>
          )}

          <p className="mt-8 border-t border-white/15 pt-5 text-sm leading-6 text-white/60">
            Reservation requests are reviewed by the Fin &amp; Feathers team.
            Submitting this form does not guarantee availability. Your
            reservation is confirmed only after the restaurant responds.
          </p>
        </div>
      </div>
    </section>
  );
}