
"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useRef,
  type FormEvent,
} from "react";

const RESERVATION_PHONE = "17025466394";
const RESERVATION_PHONE_DISPLAY = "(702) 546-6394";
const TIME_ZONE = "America/Los_Angeles";
const OPEN_MODAL_EVENT = "fin-feathers:open-reservation-modal";

const OCCASIONS = [
  "JUST DINING",
  "BIRTHDAY",
  "ANNIVERSARY",
  "DATE NIGHT",
  "BUSINESS",
  "CELEBRATION",
  "OTHER",
] as const;

type DateTimeParts = {
  date: string;
  time: string;
};

function getDateTimeParts(date: Date): DateTimeParts {
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
    date: `${values.year}-${values.month}-${values.day}`,
    time: `${values.hour}:${values.minute}`,
  };
}

function addCalendarDays(dateString: string, days: number): string {
  const [year, month, day] = dateString.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + days));

  return [
    date.getUTCFullYear(),
    String(date.getUTCMonth() + 1).padStart(2, "0"),
    String(date.getUTCDate()).padStart(2, "0"),
  ].join("-");
}

function formatDate(dateString: string): string {
  const [year, month, day] = dateString.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  return new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC",
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function formatTime(timeString: string): string {
  const [hour, minute] = timeString.split(":").map(Number);
  const suffix = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;

  return `${displayHour}:${String(minute).padStart(2, "0")} ${suffix}`;
}

function getTimeSlots(): string[] {
  const slots: string[] = [];

  for (let minutes = 10 * 60; minutes <= 22 * 60; minutes += 30) {
    const hour = Math.floor(minutes / 60);
    const minute = minutes % 60;

    slots.push(
      `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`,
    );
  }

  return slots;
}

const ALL_TIME_SLOTS = getTimeSlots();

function isMobileDevice(): boolean {
  if (typeof navigator === "undefined") return false;

  return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
}

function buildReservationMessage(data: {
  name: string;
  date: string;
  time: string;
  partySize: string;
  occasion: string;
}): string {
  return [
    "Hello Fin & Feathers! I'd like to request a reservation.",
    "",
    `Name: ${data.name.trim()}`,
    `Date: ${formatDate(data.date)}`,
    `Time: ${formatTime(data.time)}`,
    `Party Size: ${data.partySize} ${data.partySize === "1" ? "guest" : "guests"}`,
    `Occasion: ${data.occasion}`,
    "",
    "I understand that my reservation is for a maximum of 2 hours, starting from my scheduled time or when the first member of my party arrives.",
    "",
    "Please let me know if this time is available or if an alternative is needed. I understand this is a reservation request and is not confirmed until I receive a response from your team.",
  ].join("\n");
}

export default function ReservationModal() {
  const modalContentRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [partySize, setPartySize] = useState("2");
  const [occasion, setOccasion] = useState<(typeof OCCASIONS)[number]>(
    "JUST DINING",
  );
  const [smsConsent, setSmsConsent] = useState(false);
  const [durationAcknowledged, setDurationAcknowledged] = useState(false);
  const [preparedMessage, setPreparedMessage] = useState("");
  const [showFallback, setShowFallback] = useState(false);
  const [smsHandoffAttempted, setSmsHandoffAttempted] = useState(false);
  const [copyStatus, setCopyStatus] = useState("");
  const [formError, setFormError] = useState("");
  const [now, setNow] = useState<Date | null>(null);

const localNow = useMemo(
  () => (now ? getDateTimeParts(now) : null),
  [now],
);

const minimumDate = localNow?.date ?? "";

const maximumDate = useMemo(
  () => (minimumDate ? addCalendarDays(minimumDate, 30) : ""),
  [minimumDate],
);

const minimumDateTime = useMemo(
  () =>
    now
      ? getDateTimeParts(
          new Date(now.getTime() + 2 * 60 * 60 * 1000),
        )
      : null,
  [now],
);

const availableTimes = useMemo(() => {
  if (!date) return ALL_TIME_SLOTS;

  if (!minimumDateTime) return [];

  if (date < minimumDateTime.date) return [];

  if (date > minimumDateTime.date) return ALL_TIME_SLOTS;

  return ALL_TIME_SLOTS.filter(
    (slot) =>
      `${date}T${slot}` >=
      `${minimumDateTime.date}T${minimumDateTime.time}`,
  );
}, [date, minimumDateTime]);

  const closeModal = useCallback(() => {
    setIsOpen(false);
    setFormError("");
  }, []);

  useEffect(() => {
    // Defer initialization until after the initial render.
    // This also avoids a server/client initial-time mismatch.
    const timeoutId = window.setTimeout(() => {
      setNow(new Date());
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

    useEffect(() => {
    if (!preparedMessage) return;

    const frame = window.requestAnimationFrame(() => {
      const container = modalContentRef.current;
      if (!container) return;

      container.scrollTo({
        top: container.scrollHeight,
        behavior: "smooth",
      });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [preparedMessage, showFallback, smsHandoffAttempted]);

  useEffect(() => {
    const openModal = () => {
      setNow(new Date());
      setIsOpen(true);
      setFormError("");
    };

    window.addEventListener(OPEN_MODAL_EVENT, openModal);

    return () => {
      window.removeEventListener(OPEN_MODAL_EVENT, openModal);
    };
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeModal();
        return;
      }

      // Keep keyboard focus within the dialog.
      if (event.key !== "Tab") return;

      const dialog = document.getElementById("reservation-dialog");
      if (!dialog) return;

      const focusable = Array.from(
        dialog.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((element) => element.offsetParent !== null);

      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, closeModal]);

  useEffect(() => {
    if (!isOpen) return;

    // Refresh the available same-day times while the dialog is open.
    const interval = window.setInterval(() => setNow(new Date()), 30_000);

    return () => window.clearInterval(interval);
  }, [isOpen]);

  const handleDateChange = (nextDate: string) => {
    setDate(nextDate);
    setTime("");
    setPreparedMessage("");
    setShowFallback(false);
    setSmsHandoffAttempted(false);
    setFormError("");
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");
    setCopyStatus("");

    const trimmedName = name.trim();

    if (!trimmedName) {
      setFormError("Please enter your name.");
      return;
    }

    if (!date || !time) {
      setFormError("Please select a reservation date and time.");
      return;
    }

    if (!availableTimes.includes(time)) {
      setFormError(
        "That time is no longer available. Please select another time.",
      );
      return;
    }

    // Re-check against the current clock at submission time.
    const current = new Date();
    const currentParts = getDateTimeParts(current);
    const earliestAllowed = getDateTimeParts(
      new Date(current.getTime() + 2 * 60 * 60 * 1000),
    );
    const latestAllowedDate = addCalendarDays(currentParts.date, 30);

    if (date < currentParts.date || date > latestAllowedDate) {
      setFormError(
        "Please select a date between today and 30 calendar days from today.",
      );
      return;
    }

    if (`${date}T${time}` < `${earliestAllowed.date}T${earliestAllowed.time}`) {
      setFormError(
        "Please select a time at least 2 hours from now. The available times have been refreshed.",
      );
      setNow(new Date());
      return;
    }

    if (!ALL_TIME_SLOTS.includes(time)) {
      setFormError("Please select a valid reservation time.");
      return;
    }

    if (!OCCASIONS.includes(occasion)) {
      setFormError("Please select an occasion.");
      return;
    }

    if (!durationAcknowledged) {
      setFormError("Please acknowledge the 2-hour reservation policy.");
      return;
    }

    if (!smsConsent) {
      setFormError("Please provide consent to use text messaging for this request.");
      return;
    }

    const message = buildReservationMessage({
      name: trimmedName,
      date,
      time,
      partySize,
      occasion,
    });

    setPreparedMessage(message);
    setShowFallback(false);

    if (isMobileDevice()) {
      setSmsHandoffAttempted(true);

      // Attempt to open the phone's native SMS composer.
      // This does not send the message automatically.
      window.location.href = `sms:${RESERVATION_PHONE}?body=${encodeURIComponent(message)}`;
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
        "Automatic copying was blocked. Select and copy the message manually.",
      );
    }
  };

  const openMessagingApp = () => {
    if (!preparedMessage) return;

    window.location.href = `sms:${RESERVATION_PHONE}?body=${encodeURIComponent(preparedMessage)}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/80 p-0 backdrop-blur-sm sm:items-center sm:p-4">
      <section
        id="reservation-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="reservation-dialog-title"
        aria-describedby="reservation-dialog-description"
        className="relative flex max-h-[94dvh] w-full max-w-2xl flex-col overflow-hidden rounded-t-2xl border border-white/20 bg-[#101010] text-white shadow-2xl sm:max-h-[90dvh] sm:rounded-2xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-white/15 bg-[rgb(234_27_36_/_35%)] px-5 py-4 sm:px-7">
          <div>
            <p className="text-xs font-bold tracking-[0.2em] text-red-100">
              FIN & FEATHERS · LAS VEGAS
            </p>
            <h2
              id="reservation-dialog-title"
              className="mt-1 text-2xl font-bold tracking-wide sm:text-3xl"
            >
              REQUEST A RESERVATION
            </h2>
          </div>

          <button
            type="button"
            onClick={closeModal}
            aria-label="Close reservation form"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/30 text-2xl leading-none transition hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            ×
          </button>
        </div>

        <div
            ref={modalContentRef}
            className="min-w-0 overflow-x-hidden overflow-y-auto px-4 py-5 sm:px-7 sm:py-6"
        >
          <p
            id="reservation-dialog-description"
            className="mb-5 text-sm leading-6 text-white/80"
          >
            Submit a request by text message. Our team will check availability
            and reply with a confirmation or an alternative. Your reservation
            is not confirmed until our team responds.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="reservation-name"
                className="mb-2 block text-sm font-semibold"
              >
                Name <span className="text-red-400">*</span>
              </label>
              <input
                id="reservation-name"
                name="name"
                type="text"
                autoComplete="name"
                required
                maxLength={100}
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Your full name"
                className="min-h-12 w-full rounded-lg border border-white/25 bg-white/5 px-4 py-3 text-base text-white placeholder:text-white/45 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/30"
              />
            </div>

            <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="w-full min-w-0">
                <label
                  htmlFor="reservation-date"
                  className="mb-2 block text-sm font-semibold"
                >
                  Date <span className="text-red-400">*</span>
                </label>
                <input
                    id="reservation-date"
                    name="date"
                    type="date"
                    required
                    min={minimumDate || undefined}
                    max={maximumDate || undefined}
                    disabled={!now}
                    value={date}
                    onChange={(event) => handleDateChange(event.target.value)}
                    className="block min-h-12 w-full min-w-0 max-w-full box-border rounded-lg border border-white/25 bg-[#191919] px-2 py-3 text-base text-white focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/30 disabled:cursor-not-allowed disabled:opacity-50"
                />
                <p className="mt-1 text-xs text-white/55">
                  Requests are limited to the next 30 calendar days.
                </p>
              </div>

              <div>
                <label
                  htmlFor="reservation-time"
                  className="mb-2 block text-sm font-semibold"
                >
                  Time <span className="text-red-400">*</span>
                </label>
                <select
                  id="reservation-time"
                  name="time"
                  required
                  value={time}
                  onChange={(event) => setTime(event.target.value)}
                  disabled={!date || !now || availableTimes.length === 0}
                  className="min-h-12 w-full rounded-lg border border-white/25 bg-[#191919] px-3 py-3 text-base text-white focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/30 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">
                    {!date
                      ? "Choose a date first"
                      : availableTimes.length === 0
                        ? "No times available today"
                        : "Select a time"}
                  </option>
                  {availableTimes.map((slot) => (
                    <option key={slot} value={slot}>
                      {formatTime(slot)}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-white/55">
                  10:00 AM–10:00 PM, in 30-minute increments.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="reservation-party-size"
                  className="mb-2 block text-sm font-semibold"
                >
                  Party size <span className="text-red-400">*</span>
                </label>
                <select
                  id="reservation-party-size"
                  name="partySize"
                  required
                  value={partySize}
                  onChange={(event) => setPartySize(event.target.value)}
                  className="min-h-12 w-full rounded-lg border border-white/25 bg-[#191919] px-3 py-3 text-base text-white focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/30"
                >
                  {Array.from({ length: 20 }, (_, index) => {
                    const guests = String(index + 1);
                    return (
                      <option key={guests} value={guests}>
                        {guests} {guests === "1" ? "Guest" : "Guests"}
                      </option>
                    );
                  })}
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
                    setOccasion(event.target.value as (typeof OCCASIONS)[number])
                  }
                  className="min-h-12 w-full rounded-lg border border-white/25 bg-[#191919] px-3 py-3 text-base text-white focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/30"
                >
                  {OCCASIONS.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-4 rounded-xl border border-white/15 bg-white/[0.03] p-4">
              <label className="flex cursor-pointer items-start gap-3 text-sm leading-6 text-white/90">
                <input
                  type="checkbox"
                  required
                  checked={durationAcknowledged}
                  onChange={(event) =>
                    setDurationAcknowledged(event.target.checked)
                  }
                  className="mt-1 h-5 w-5 shrink-0 accent-[#ea1b24]"
                />
                <span>
                  I understand that my reservation is for a maximum of 2 hours,
                  starting from my scheduled time or when the first member of
                  my party arrives.
                  <span className="text-red-400"> *</span>
                </span>
              </label>

              <div className="border-t border-white/15 pt-4">
                <label className="flex cursor-pointer items-start gap-3 text-sm leading-6 text-white/90">
                  <input
                    type="checkbox"
                    required
                    checked={smsConsent}
                    onChange={(event) => setSmsConsent(event.target.checked)}
                    className="mt-1 h-5 w-5 shrink-0 accent-[#ea1b24]"
                  />
                  <span>
                    By checking this box, you agree to receive text messages
                    from Fin & Feathers to process and confirm your reservation
                    details. Message and data rates may apply. View our{" "}
                    <a
                      href="/terms-of-service"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-red-300 underline underline-offset-2 hover:text-white"
                    >
                      Terms of Service
                    </a>{" "}
                    and{" "}
                    <a
                      href="/privacy-policy"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-red-300 underline underline-offset-2 hover:text-white"
                    >
                      Privacy Policy
                    </a>
                    .
                    <span className="text-red-400"> *</span>
                  </span>
                </label>
                <p className="mt-3 pl-8 text-xs leading-5 text-white/55">
                  Consent is required to use this text-based reservation
                  request process. You must send the prepared message yourself.
                  This form does not send a text automatically.
                </p>
              </div>
            </div>

            {formError && (
              <p
                role="alert"
                className="rounded-lg border border-red-400/50 bg-red-950/50 px-4 py-3 text-sm text-red-100"
              >
                {formError}
              </p>
            )}

            <button
              type="submit"
              className="min-h-14 w-full rounded-xl border border-white/25 bg-[#ea1b24] px-5 py-4 text-center text-sm font-bold tracking-[0.12em] text-white transition-colors hover:bg-red-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:text-base"
            >
              PREPARE TEXT MESSAGE
            </button>
          </form>

          {preparedMessage && showFallback && (
            <div
              className="mt-6 space-y-4 rounded-xl border border-red-400/40 bg-red-950/25 p-4 sm:p-5"
              aria-live="polite"
            >
              <h3 className="text-lg font-bold">Your request is ready</h3>
              <p className="text-sm leading-6 text-white/80">
                Recipient:{" "}
                <strong className="text-white">
                  {RESERVATION_PHONE_DISPLAY}
                </strong>
              </p>
              <pre className="max-h-64 overflow-auto whitespace-pre-wrap break-words rounded-lg border border-white/15 bg-black/40 p-4 font-sans text-sm leading-6 text-white/90">
                {preparedMessage}
              </pre>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={handleCopyMessage}
                  className="min-h-12 rounded-lg border border-white/30 px-4 py-3 text-sm font-bold tracking-wide hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  COPY MESSAGE
                </button>
                <button
                  type="button"
                  onClick={openMessagingApp}
                  className="min-h-12 rounded-lg bg-[#ea1b24] px-4 py-3 text-sm font-bold tracking-wide hover:bg-red-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  OPEN MESSAGING APP
                </button>
              </div>
              {copyStatus && (
                <p role="status" className="text-sm text-white/80">
                  {copyStatus}
                </p>
              )}
              <p className="text-sm leading-6 text-yellow-100">
                Important: this request has not been sent yet. Send the text
                message from your messaging app, then wait for a reply from
                Fin & Feathers. Your reservation is not confirmed until our
                team responds.
              </p>
            </div>
          )}

          {preparedMessage && smsHandoffAttempted && !showFallback && (
            <div
              className="mt-6 rounded-xl border border-white/20 bg-white/[0.04] p-4"
              aria-live="polite"
            >
              <h3 className="font-bold">Finish in your messaging app</h3>
              <p className="mt-2 text-sm leading-6 text-white/80">
                Your phone should open a text message addressed to{" "}
                <strong className="text-white">
                  {RESERVATION_PHONE_DISPLAY}
                </strong>
                . Review the message and tap Send. If the messaging app did not
                open or the message was not filled in, use the fallback below.
              </p>
              <button
                type="button"
                onClick={() => setShowFallback(true)}
                className="mt-4 min-h-12 w-full rounded-lg border border-white/30 px-4 py-3 text-sm font-bold tracking-wide hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                SMS DIDN&apos;T OPEN? SHOW MESSAGE & COPY OPTION
              </button>
              <p className="mt-3 text-xs leading-5 text-white/60">
                Opening the composer does not send the text. Your reservation
                remains unconfirmed until the restaurant responds.
              </p>
            </div>
          )}

          <p className="mt-6 text-center text-xs leading-5 text-white/50">
            Reservation requests are reviewed by the Fin & Feathers team.
            Submitting this form does not guarantee availability.
          </p>
        </div>
      </section>
    </div>
  );
}
