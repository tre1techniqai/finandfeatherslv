"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  reservationId: string;
  guestName: string | null;
};

export default function CloseReservationButton({
  reservationId,
  guestName,
}: Props) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function closeReservation() {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/staff/reservations/${encodeURIComponent(reservationId)}/actions`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "close_reservation", payload: {} }),
          cache: "no-store",
        },
      );
      const result: unknown = await response.json();
      const body = result && typeof result === "object"
        ? (result as Record<string, unknown>)
        : {};
      if (!response.ok || body.success !== true) {
        throw new Error(
          typeof body.error === "string"
            ? body.error
            : "Unable to close this reservation.",
        );
      }
      setConfirming(false);
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to close reservation.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex shrink-0 flex-col items-end gap-2">
      <button
        type="button"
        onClick={() => { setError(null); setConfirming(true); }}
        className="inline-flex min-h-10 items-center justify-center rounded-lg border border-red-400/60 bg-red-950/30 px-4 text-xs font-bold tracking-wide text-red-200 transition hover:bg-red-900/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-400"
      >
        CLOSE
      </button>
      {confirming && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4" role="presentation">
          <div role="alertdialog" aria-modal="true" aria-labelledby={`close-title-${reservationId}`} aria-describedby={`close-desc-${reservationId}`} className="w-full max-w-md rounded-xl border border-white/20 bg-zinc-950 p-6 text-left shadow-2xl">
            <h2 id={`close-title-${reservationId}`} className="text-xl font-bold text-white">Close reservation?</h2>
            <p id={`close-desc-${reservationId}`} className="mt-3 text-sm leading-6 text-zinc-300">
              Close the request for <strong className="text-white">{guestName || "this guest"}</strong>?
              It will leave the Active Queue and appear under Closed. No SMS will be sent.
            </p>
            {error && <p role="alert" className="mt-3 text-sm text-red-300">{error}</p>}
            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <button type="button" disabled={busy} onClick={() => setConfirming(false)} className="min-h-11 rounded-lg border border-white/25 px-5 text-sm font-semibold text-white disabled:opacity-50">CANCEL</button>
              <button type="button" disabled={busy} onClick={closeReservation} className="min-h-11 rounded-lg bg-red-700 px-5 text-sm font-bold text-white hover:bg-red-600 disabled:opacity-50">{busy ? "CLOSING..." : "CONFIRM CLOSE"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}