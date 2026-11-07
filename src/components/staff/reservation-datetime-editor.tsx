
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  reservationId: string;
  reservationDate: string | null;
  reservationTime: string | null;
  requestStatus: string;
  workflowStatus: string | null;
  acceptedTime: string | null;
  hasPreparedOffer: boolean;
  enabled?: boolean;
};

type ApiResponse = {
  success?: boolean;
  error?: string;
  message?: string;
};

const TIME_OPTIONS = Array.from(
  { length: 25 },
  (_, index) => {
    const totalMinutes = 600 + index * 30;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    return {
      value:
        `${String(hours).padStart(2, "0")}:` +
        `${String(minutes).padStart(2, "0")}`,
      label:
        `${hours % 12 || 12}:` +
        `${String(minutes).padStart(2, "0")} ` +
        (hours >= 12 ? "PM" : "AM"),
    };
  },
);

const inputClass =
  "min-h-11 w-full rounded-lg border border-white/20 " +
  "bg-zinc-900 px-3 py-2 text-sm text-white " +
  "outline-none focus:border-[#ea1b24] " +
  "disabled:cursor-not-allowed disabled:opacity-50";

const buttonClass =
  "inline-flex min-h-11 items-center justify-center " +
  "rounded-lg px-4 py-2 text-sm font-semibold " +
  "transition disabled:cursor-not-allowed " +
  "disabled:opacity-40";

function normalizeTime(
  value: string | null,
): string {
  if (!value) return "";

  const match = /^(\d{2}):(\d{2})/.exec(value);

  return match ? `${match[1]}:${match[2]}` : "";
}

function vegasToday(): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Los_Angeles",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const get = (type: string) =>
    parts.find((part) => part.type === type)?.value ?? "";

  return `${get("year")}-${get("month")}-${get("day")}`;
}

function addCalendarDays(
  dateString: string,
  days: number,
): string {
  const [year, month, day] =
    dateString.split("-").map(Number);

  const date = new Date(
    Date.UTC(year, month - 1, day + days),
  );

  return date.toISOString().slice(0, 10);
}

function formatDate(
  value: string | null,
): string {
  if (!value) return "Not provided";

  const parsed = new Date(`${value}T12:00:00Z`);

  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(parsed);
}

function formatTime(
  value: string | null,
): string {
  const normalized = normalizeTime(value);

  if (!normalized) return "Not provided";

  const [hours, minutes] =
    normalized.split(":").map(Number);

  return (
    `${hours % 12 || 12}:` +
    `${String(minutes).padStart(2, "0")} ` +
    (hours >= 12 ? "PM" : "AM")
  );
}

export default function ReservationDateTimeEditor({
  reservationId,
  reservationDate,
  reservationTime,
  requestStatus,
  workflowStatus,
  acceptedTime,
  hasPreparedOffer,
  enabled = false,
}: Props) {
  const router = useRouter();

  const originalDate = reservationDate ?? "";
  const originalTime = normalizeTime(reservationTime);

  const [editing, setEditing] = useState(false);
  const [date, setDate] = useState(originalDate);
  const [time, setTime] = useState(originalTime);
  const [yelpUpdated, setYelpUpdated] = useState(false);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const confirmed = requestStatus === "confirmed";

  const allowedStatus =
    requestStatus === "pending" ||
    requestStatus === "incomplete" ||
    confirmed;

  const allowedWorkflow =
    workflowStatus === null ||
    workflowStatus === "awaiting_review" ||
    workflowStatus === "available" ||
    workflowStatus === "unavailable" ||
    workflowStatus === "confirmed";

  const workflowConsistent = confirmed
    ? workflowStatus === "confirmed"
    : workflowStatus !== "confirmed";

  const canEdit =
    enabled &&
    allowedStatus &&
    allowedWorkflow &&
    workflowConsistent &&
    !acceptedTime &&
    !hasPreparedOffer &&
    Boolean(originalDate) &&
    Boolean(originalTime);

  const today = vegasToday();
  const maximumDate = addCalendarDays(today, 90);

  const changed =
    date !== originalDate ||
    time !== originalTime;

  const validSelection =
    Boolean(date) &&
    date >= today &&
    date <= maximumDate &&
    TIME_OPTIONS.some(
      (option) => option.value === time,
    );

  const canSave =
    canEdit &&
    !busy &&
    changed &&
    validSelection &&
    (!confirmed || yelpUpdated);

  let unavailableReason = "";

  if (!enabled) {
    unavailableReason =
      "Date/time editing is not enabled yet.";
  } else if (!allowedStatus) {
    unavailableReason =
      "This reservation status cannot be edited.";
  } else if (
    hasPreparedOffer ||
    Boolean(acceptedTime) ||
    !allowedWorkflow ||
    !workflowConsistent
  ) {
    unavailableReason =
      "This reservation has an alternative-time or workflow state that requires review before editing.";
  } else if (!originalDate || !originalTime) {
    unavailableReason =
      "Reservation date and time must already be recorded.";
  }

  function startEditing() {
    if (!canEdit) return;

    setDate(originalDate);
    setTime(originalTime);
    setYelpUpdated(false);
    setError("");
    setSuccess("");
    setEditing(true);
  }

  function discardChanges() {
    if (busy) return;

    setDate(originalDate);
    setTime(originalTime);
    setYelpUpdated(false);
    setError("");
    setEditing(false);
  }

  async function saveChanges() {
    if (!canSave) return;

    setBusy(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `/api/staff/reservations/${encodeURIComponent(reservationId)}/amend-datetime`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "same-origin",
          cache: "no-store",
          body: JSON.stringify({
            expectedDate: originalDate,
            expectedTime: originalTime,
            newDate: date,
            newTime: time,
            yelpBookingUpdated: confirmed
              ? yelpUpdated
              : false,
          }),
        },
      );

      const result: ApiResponse =
        await response.json();

      if (!response.ok || result.success !== true) {
        setError(
          result.error ||
            "Unable to update the reservation. Refresh and try again.",
        );
        return;
      }

      setEditing(false);
      setSuccess(
        "Reservation date/time updated. No SMS was sent.",
      );

      router.refresh();
    } catch {
      setError(
        "The update result could not be verified. Refresh the reservation before trying again.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <section
      aria-labelledby="reservation-datetime-heading"
      className="rounded-xl border border-white/10 bg-zinc-950/90 p-5 sm:p-6"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2
            id="reservation-datetime-heading"
            className="text-lg font-bold text-white"
          >
            Reservation Date &amp; Time
          </h2>

          <p className="mt-2 text-sm text-zinc-400">
            Las Vegas local time
          </p>
        </div>

        {!editing && canEdit && (
          <button
            type="button"
            onClick={startEditing}
            className={`${buttonClass} border border-white/25 bg-white/5 text-white hover:bg-white/10`}
          >
            EDIT DATE / TIME
          </button>
        )}
      </div>

      {success && (
        <p
          role="status"
          className="mt-4 rounded-lg border border-emerald-500/30 bg-emerald-950/20 p-3 text-sm text-emerald-200"
        >
          {success}
        </p>
      )}

      {error && (
        <p
          role="alert"
          className="mt-4 rounded-lg border border-red-500/30 bg-red-950/20 p-3 text-sm text-red-200"
        >
          {error}
        </p>
      )}

      {!editing ? (
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Reservation Date
            </p>
            <p className="mt-2 text-sm text-white">
              {formatDate(reservationDate)}
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Reservation Time
            </p>
            <p className="mt-2 text-sm text-white">
              {formatTime(reservationTime)}
            </p>
          </div>
        </div>
      ) : (
        <div className="mt-5 space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="reservation-edit-date"
                className="mb-2 block text-sm font-semibold text-white"
              >
                Reservation Date
              </label>

              <input
                id="reservation-edit-date"
                type="date"
                value={date}
                min={today}
                max={maximumDate}
                disabled={busy}
                onChange={(event) =>
                  setDate(event.target.value)
                }
                className={inputClass}
              />
            </div>

            <div>
              <label
                htmlFor="reservation-edit-time"
                className="mb-2 block text-sm font-semibold text-white"
              >
                Reservation Time
              </label>

              <select
                id="reservation-edit-time"
                value={time}
                disabled={busy}
                onChange={(event) =>
                  setTime(event.target.value)
                }
                className={inputClass}
              >
                {!TIME_OPTIONS.some(
                  (option) => option.value === time,
                ) && (
                  <option value="">
                    Select a time
                  </option>
                )}

                {TIME_OPTIONS.map((option) => (
                  <option
                    key={option.value}
                    value={option.value}
                  >
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="rounded-lg border border-white/10 bg-black/40 p-4 text-sm leading-6 text-zinc-300">
            <p className="font-semibold text-white">
              Review changes
            </p>

            <p className="mt-2">
              Current: {formatDate(originalDate)} at{" "}
              {formatTime(originalTime)}
            </p>

            <p className="mt-1">
              New: {formatDate(date || null)} at{" "}
              {formatTime(time || null)}
            </p>
          </div>

          {confirmed && (
            <label className="flex items-start gap-3 rounded-lg border border-amber-500/30 bg-amber-950/20 p-4 text-sm leading-6 text-amber-100">
              <input
                type="checkbox"
                checked={yelpUpdated}
                disabled={busy}
                onChange={(event) =>
                  setYelpUpdated(event.target.checked)
                }
                className="mt-1 h-4 w-4 shrink-0 accent-[#ea1b24]"
              />

              <span>
                I confirm that the corresponding Yelp
                reservation has already been updated
                to the new date and time.
              </span>
            </label>
          )}

          <p className="text-xs leading-5 text-zinc-400">
            Saving updates the internal reservation
            record. It does not send an SMS or modify
            a Yelp booking.
          </p>

          {!validSelection && (
            <p className="text-xs text-amber-200">
              Select a valid date within the next 90
              calendar days and a reservation time
              between 10:00 AM and 10:00 PM.
            </p>
          )}

          <div className="flex flex-wrap justify-end gap-3">
            <button
              type="button"
              disabled={busy}
              onClick={discardChanges}
              className={`${buttonClass} border border-white/20 text-white hover:bg-white/10`}
            >
              DISCARD
            </button>

            <button
              type="button"
              disabled={!canSave}
              onClick={saveChanges}
              className={`${buttonClass} bg-[#ea1b24] text-white hover:bg-red-700`}
            >
              {busy
                ? "SAVING..."
                : "SAVE CHANGES"}
            </button>
          </div>
        </div>
      )}

      {!editing && unavailableReason && (
        <p className="mt-4 text-xs leading-5 text-zinc-500">
          {unavailableReason}
        </p>
      )}
    </section>
  );
}