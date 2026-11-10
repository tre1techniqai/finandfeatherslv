
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type ArchiveOutcome =
  | "seated"
  | "walk_in"
  | "no_show"
  | "canceled";

type Props = {
  reservationId: string;
  guestName: string | null;
  isConfirmed?: boolean;
  enabled?: boolean;
};

const OPTIONS = [
  {
    value: "seated",
    title: "SEATED",
    description: "Guest arrived and was seated.",
    symbol: "✓",
    selected:
      "border-emerald-400 bg-emerald-900/40 text-emerald-100",
    hover:
      "hover:border-emerald-400 hover:bg-emerald-900/30 hover:text-emerald-100",
  },
  {
    value: "walk_in",
    title: "WALK-IN",
    description:
      "Guest was accommodated as a walk-in without completing the original reservation.",
    symbol: "↳",
    selected:
      "border-sky-400 bg-sky-900/40 text-sky-100",
    hover:
      "hover:border-sky-400 hover:bg-sky-900/30 hover:text-sky-100",
  },
  {
    value: "no_show",
    title: "NO-SHOW",
    description: "Guest did not arrive.",
    symbol: "✕",
    selected:
      "border-red-400 bg-red-900/40 text-red-100",
    hover:
      "hover:border-red-400 hover:bg-red-900/30 hover:text-red-100",
  },
  {
    value: "canceled",
    title: "CANCELED",
    description: "Reservation was canceled.",
    symbol: "—",
    selected:
      "border-amber-400 bg-amber-900/40 text-amber-100",
    hover:
      "hover:border-amber-400 hover:bg-amber-900/30 hover:text-amber-100",
  },
] as const;

export default function CloseReservationButton({
  reservationId,
  guestName,
  isConfirmed = false,
  enabled = false,
}: Props) {
  const router = useRouter();

  const [open, setOpen] = useState(false);

  const [selected, setSelected] =
    useState<ArchiveOutcome | null>(null);

  const [yelpAcknowledged, setYelpAcknowledged] =
    useState(false);

  const [busy, setBusy] = useState(false);

  const [error, setError] =
    useState<string | null>(null);

  // Confirmed reservations:
  // SEATED, WALK-IN, NO-SHOW, CANCELED.
  //
  // Unconfirmed reservations:
  // WALK-IN, CANCELED.
  //
  // The database independently validates
  // the reservation status and archive outcome.
  const availableOptions = OPTIONS.filter(
    (option) =>
      isConfirmed ||
      option.value === "walk_in" ||
      option.value === "canceled",
  );

  const selectedOption = OPTIONS.find(
    (option) => option.value === selected,
  );

  const needsYelpAcknowledgment =
    isConfirmed && selected === "canceled";

  const canSubmit =
    enabled &&
    !busy &&
    selected !== null &&
    (!needsYelpAcknowledgment || yelpAcknowledged);

  function closeDialog() {
    if (busy) return;

    setOpen(false);
    setSelected(null);
    setYelpAcknowledged(false);
    setError(null);
  }

  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !busy) {
        setOpen(false);
        setSelected(null);
        setYelpAcknowledged(false);
        setError(null);
      }
    }

    document.addEventListener(
      "keydown",
      onKeyDown,
    );

    return () => {
      document.removeEventListener(
        "keydown",
        onKeyDown,
      );
    };
  }, [open, busy]);

  async function archiveReservation() {
    if (!canSubmit || selected === null) {
      return;
    }

    setBusy(true);
    setError(null);

    try {
      const payload: Record<string, unknown> = {
        outcome: selected,
      };

      // Preserve the existing Yelp cancellation
      // acknowledgment behavior.
      //
      // WALK-IN does not perform or imply
      // a Yelp cancellation.
      if (selected === "canceled") {
        payload.yelp_cancellation_acknowledged =
          needsYelpAcknowledgment &&
          yelpAcknowledged;
      }

      const response = await fetch(
        `/api/staff/reservations/${encodeURIComponent(
          reservationId,
        )}/actions`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: "archive_reservation",
            payload,
          }),
          cache: "no-store",
        },
      );

      const result: unknown =
        await response.json();

      const body =
        result !== null &&
        typeof result === "object" &&
        !Array.isArray(result)
          ? (result as Record<string, unknown>)
          : {};

      if (
        !response.ok ||
        body.success !== true
      ) {
        throw new Error(
          typeof body.error === "string"
            ? body.error
            : "Unable to archive reservation.",
        );
      }

      setOpen(false);
      setSelected(null);
      setYelpAcknowledged(false);

      router.refresh();
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Unable to archive reservation.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex shrink-0 flex-col items-end gap-2">
      <button
        type="button"
        onClick={() => {
          setError(null);
          setSelected(null);
          setYelpAcknowledged(false);
          setOpen(true);
        }}
        className="inline-flex min-h-10 items-center justify-center rounded-lg border border-white/30 bg-zinc-800/60 px-4 text-xs font-bold tracking-wide text-white transition hover:border-white/60 hover:bg-zinc-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
      >
        ARCHIVE
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-4"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={`archive-title-${reservationId}`}
            aria-describedby={`archive-desc-${reservationId}`}
            className="w-full max-w-xl rounded-xl border border-white/20 bg-zinc-950 p-4 text-left shadow-2xl sm:p-7"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2
                  id={`archive-title-${reservationId}`}
                  className="text-xl font-bold text-white"
                >
                  Archive Reservation
                </h2>

                <p
                  id={`archive-desc-${reservationId}`}
                  className="mt-2 text-sm leading-6 text-zinc-300"
                >
                  Select the final outcome for{" "}
                  <strong className="text-white">
                    {guestName || "this guest"}
                  </strong>
                  .
                </p>
              </div>

              <button
                type="button"
                onClick={closeDialog}
                disabled={busy}
                aria-label="Close archive dialog"
                className="rounded-lg border border-white/20 px-3 py-2 text-lg text-zinc-300 hover:bg-white/10 disabled:opacity-50"
              >
                ×
              </button>
            </div>

            {/*
              Four equal-width columns on every
              screen size.

              Each button uses aspect-square so
              width and height remain equal.

              Unavailable outcomes are omitted,
              leaving WALK-IN and CANCELED for
              unconfirmed reservations.
            */}
            <div
              role="group"
              aria-label="Archive outcome"
              className="mt-6 grid grid-cols-4 gap-1.5 sm:gap-3"
            >
              {availableOptions.map((option) => {
                const active =
                  selected === option.value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    aria-pressed={active}
                    aria-label={option.title}
                    title={option.description}
                    disabled={busy}
                    onClick={() => {
                      setSelected(option.value);
                      setYelpAcknowledged(false);
                      setError(null);
                    }}
                    className={`flex aspect-square min-w-0 flex-col items-center justify-center gap-1 rounded-lg border-2 p-1 text-center transition duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:opacity-50 sm:gap-2 sm:rounded-xl sm:p-2 ${
                      active
                        ? option.selected
                        : `border-zinc-600 bg-zinc-800/50 text-zinc-300 ${option.hover}`
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className="text-2xl font-bold leading-none sm:text-3xl"
                    >
                      {option.symbol}
                    </span>

                    <span className="text-[9px] font-bold leading-tight tracking-tight sm:text-xs sm:tracking-wide">
                      {option.title}
                    </span>
                  </button>
                );
              })}
            </div>

            {/*
              Show the description outside the
              square buttons so all four options
              remain comfortably aligned.
            */}
            {selectedOption && (
              <div
                role="status"
                className="mt-4 rounded-lg border border-white/15 bg-white/5 p-3"
              >
                <p className="text-xs font-bold tracking-wide text-white">
                  {selectedOption.title}
                </p>

                <p className="mt-1 text-sm leading-5 text-zinc-300">
                  {selectedOption.description}
                </p>
              </div>
            )}

            {needsYelpAcknowledgment && (
              <label className="mt-5 flex items-start gap-3 rounded-lg border border-amber-400/30 bg-amber-950/20 p-4 text-sm leading-6 text-amber-100">
                <input
                  type="checkbox"
                  checked={yelpAcknowledged}
                  disabled={busy}
                  onChange={(event) =>
                    setYelpAcknowledged(
                      event.target.checked,
                    )
                  }
                  className="mt-1"
                />

                <span>
                  I confirm that this reservation
                  has already been canceled in
                  Yelp Reservations. Archiving
                  here does not cancel the Yelp
                  booking.
                </span>
              </label>
            )}

            {selected === "walk_in" &&
              isConfirmed && (
                <p className="mt-4 rounded-lg border border-sky-400/30 bg-sky-950/20 p-3 text-xs leading-5 text-sky-100">
                  This reservation is currently
                  confirmed. Archiving it as
                  WALK-IN does not modify or
                  cancel an existing Yelp booking.
                  Verify any necessary Yelp
                  adjustments separately.
                </p>
              )}

            {selected && (
              <p className="mt-5 text-sm leading-6 text-zinc-300">
                This reservation will move to
                the Archived category with the
                outcome{" "}
                <strong className="text-white">
                  {selectedOption?.title}
                </strong>
                . No guest SMS will be sent by
                this action.
              </p>
            )}

            {!enabled && (
              <p
                role="status"
                className="mt-5 rounded-lg border border-amber-400/30 bg-amber-950/20 p-3 text-xs leading-5 text-amber-200"
              >
                ARCHIVE preview is available.
                Saving is temporarily disabled
                until reservation workflow
                coordination is verified.
              </p>
            )}

            {error && (
              <p
                role="alert"
                className="mt-4 text-sm leading-6 text-red-300"
              >
                {error}
              </p>
            )}

            <div className="mt-7 flex flex-wrap justify-end gap-3">
              <button
                type="button"
                disabled={busy}
                onClick={closeDialog}
                className="min-h-11 rounded-lg border border-white/25 px-5 text-sm font-semibold text-white transition hover:bg-white/10 disabled:opacity-50"
              >
                CANCEL
              </button>

              <button
                type="button"
                disabled={!canSubmit}
                onClick={() =>
                  void archiveReservation()
                }
                className="min-h-11 rounded-lg bg-emerald-700 px-5 text-sm font-bold text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-400"
              >
                {busy
                  ? "ARCHIVING..."
                  : "CONFIRM ARCHIVE"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}