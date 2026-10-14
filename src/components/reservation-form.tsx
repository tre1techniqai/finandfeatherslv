
"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import Image from "next/image";

const RESERVATION_PHONE = "17025466394";
const RESERVATION_PHONE_DISPLAY = "(702) 546-6394";
const TIME_ZONE = "America/Los_Angeles";
const MAX_DAYS_AHEAD = 30;
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

function getTimeSlots() {
  const slots: string[] = [];

  // Reservation request times: 10:00 AM through 10:00 PM.
  for (let minutes = 10 * 60; minutes <= 22 * 60; minutes += 30) {
    const hour = Math.floor(minutes / 60);
    const minute = minutes % 60;

    slots.push(
      `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`,
    );
  }

  return slots;
}

function isMobileDevice() {
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

function buildReservationMessage(details: {
  name: string;
  date: string;
  time: string;
  partySize: string;
  occasion: string;
}) {
  return [
    "Hello Fin & Feathers! I'd like to request a reservation.",
    "",
    `Name: ${details.name.trim()}`,
    `Preferred date: ${formatDate(details.date)}`,
    `Preferred time: ${formatTime(details.time)}`,
    `Party size: ${details.partySize}`,
    `Occasion: ${details.occasion}`,
    "",
    "I understand reservations are for a maximum of two hours, subject to restaurant policy.",
    "",
    "I understand this is a request and is not confirmed until the Fin & Feathers team replies.",
  ].join("\n");
}

export default function ReservationForm() {
  const [now, setNow] = useState<Date | null>(null);

  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [partySize, setPartySize] = useState("2");
  const [occasion, setOccasion] =
    useState<(typeof OCCASIONS)[number]>("JUST DINING");

  const [smsConsent, setSmsConsent] = useState(false);
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

  const maximumDate = useMemo(
    () => (minimumDate ? addCalendarDays(minimumDate, MAX_DAYS_AHEAD) : ""),
    [minimumDate],
  );

  const availableTimes = useMemo(() => {
    const slots = getTimeSlots();

    if (!now || !date) return slots;

    const today = getLocalDateString(now);

    if (date !== today) return slots;

    const localParts = getDateTimeParts(now);
    const currentMinutes = localParts.hour * 60 + localParts.minute;
    const earliestMinutes = currentMinutes + MIN_HOURS_AHEAD * 60;

    return slots.filter((slot) => {
      const [hour, minute] = slot.split(":").map(Number);
      return hour * 60 + minute >= earliestMinutes;
    });
  }, [date, now]);

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

    if (!name.trim()) {
      setFormError("Please enter your name.");
      return;
    }

    if (name.trim().length > 100) {
      setFormError("Please keep your name to 100 characters or fewer.");
      return;
    }

    if (!date || !time) {
      setFormError("Please select your preferred date and time.");
      return;
    }

    if (date < minimumDate || date > maximumDate) {
      setFormError(
        `Please choose a date within the next ${MAX_DAYS_AHEAD} calendar days.`,
      );
      return;
    }

    if (!availableTimes.includes(time)) {
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
      name,
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
            <div>
              <label
                htmlFor="reservation-name"
                className="mb-2 block text-sm font-semibold"
              >
                Full Name <span className="text-red-400">*</span>
              </label>

              <input
                id="reservation-name"
                name="name"
                type="text"
                autoComplete="name"
                maxLength={100}
                required
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="w-full rounded-lg border border-white/20 bg-black/50 px-4 py-3 text-base text-white outline-none transition placeholder:text-white/40 focus:border-red-500 focus:ring-2 focus:ring-red-500/30"
                placeholder="Enter your full name"
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="min-w-0 w-full">
                <label
                    htmlFor="reservation-date"
                    className="mb-2 block text-sm font-semibold text-white"
                >
                    Preferred Date
                </label>
                <input
                    id="reservation-date"
                    name="date"
                    type="date"
                    required
                    min={minimumDate}
                    max={maximumDate}
                    disabled={!now}
                    value={date}
                    onChange={(event) => handleDateChange(event.target.value)}
                    className="block min-w-0 w-full max-w-full box-border rounded-lg border border-white/20 bg-black/50 px-4 py-3 text-base text-white outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-500/30 disabled:opacity-50"
                />

                <p className="mt-2 text-xs leading-5 text-white/60">
                  Requests may be made up to 30 calendar days in advance.
                </p>
              </div>

              <div>
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

              <label className="flex items-start gap-3 text-sm leading-6 text-white/80">
                <input
                  type="checkbox"
                  required
                  checked={smsConsent}
                  onChange={(event) => setSmsConsent(event.target.checked)}
                  className="mt-1 h-4 w-4 shrink-0 accent-red-500"
                />

                <span>
                  I agree to send my reservation request by text message to
                  Fin &amp; Feathers at {RESERVATION_PHONE_DISPLAY}. I
                  understand that selecting this box prepares a message on my
                  device; I must send the message myself. My reservation is
                  not confirmed until the restaurant responds. See our{" "}
                  <a
                    href="/terms-of-service"
                    className="font-semibold text-red-300 underline underline-offset-4 hover:text-red-200"
                  >
                    Terms of Service
                  </a>{" "}
                  and{" "}
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
