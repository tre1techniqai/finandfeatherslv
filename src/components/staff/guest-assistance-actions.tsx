"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type AlertStatus = "open" | "acknowledged";
type Action = "acknowledge" | "resolve";

type Props = {
  alertId: string;
  status: AlertStatus;
};

export default function GuestAssistanceActions({ alertId, status }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const action: Action = status === "open" ? "acknowledge" : "resolve";
  const label = action === "acknowledge" ? "ACKNOWLEDGE" : "MARK RESOLVED";

  async function submit() {
    if (busy) return;
    setBusy(true);
    setError("");

    try {
      const response = await fetch(
        `/api/staff/guest-assistance/${encodeURIComponent(alertId)}`,
        {
          method: "POST",
          credentials: "same-origin",
          cache: "no-store",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action }),
        },
      );
      const payload: unknown = await response.json();
      if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
        throw new Error("Alert response was invalid. Refresh and try again.");
      }
      const result = payload as Record<string, unknown>;
      if (!response.ok || result.success !== true) {
        throw new Error(
          typeof result.error === "string"
            ? result.error
            : "Could not update the assistance alert.",
        );
      }
      const updated = result.alert;
      if (
        !updated || typeof updated !== "object" || Array.isArray(updated) ||
        (updated as Record<string, unknown>).id !== alertId ||
        (updated as Record<string, unknown>).status !==
          (action === "acknowledge" ? "acknowledged" : "resolved")
      ) {
        throw new Error("Alert update could not be verified. Refresh the page.");
      }
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to update alert.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-w-0">
      <button
        type="button"
        disabled={busy}
        onClick={() => void submit()}
        className="inline-flex min-h-11 w-full items-center justify-center rounded-lg border border-amber-400/50 bg-amber-400/10 px-4 py-3 text-sm font-semibold text-amber-100 transition hover:bg-amber-400/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
      >
        {busy ? "UPDATING..." : label}
      </button>
      {error && (
        <p role="alert" className="mt-2 max-w-sm text-sm text-amber-200">
          {error}
        </p>
      )}
    </div>
  );
}
