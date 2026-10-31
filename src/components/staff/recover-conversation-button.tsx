"use client";

import { useRef, useState } from "react";

type RecoveryResponse = {
  success?: boolean;
  reservationId?: string;
  discovered?: number;
  verified?: number;
  recorded?: number;
  duplicates?: number;
  excluded?: number;
  error?: string;
};

type Props = {
  reservationId: string;
  onRecovered: () => Promise<void>;
  disabled?: boolean;
};

function validCount(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isSafeInteger(value) &&
    value >= 0
  );
}

function validRecovery(
  value: RecoveryResponse,
  reservationId: string,
): boolean {
  return (
    value.success === true &&
    value.reservationId === reservationId &&
    validCount(value.discovered) &&
    validCount(value.verified) &&
    validCount(value.recorded) &&
    validCount(value.duplicates) &&
    validCount(value.excluded)
  );
}

export default function RecoverConversationButton({
  reservationId,
  onRecovered,
  disabled = false,
}: Props) {
  const [recovering, setRecovering] =
    useState(false);

  const [result, setResult] =
    useState("");

  const [error, setError] =
    useState("");

  const recoveryGuardRef = useRef(false);

  async function recoverConversation() {
    if (recoveryGuardRef.current || disabled) {
      return;
    }

    recoveryGuardRef.current = true;
    setRecovering(true);
    setResult("");
    setError("");

    try {
      const response = await fetch(
        `/api/staff/reservations/${encodeURIComponent(
          reservationId,
        )}/conversation/recover`,
        {
          method: "POST",
          credentials: "same-origin",
          cache: "no-store",
          headers: {
            "Content-Type": "application/json",
          },
          body: "{}",
        },
      );

      const payload: RecoveryResponse =
        await response.json();

      if (!response.ok || !validRecovery(
        payload,
        reservationId,
      )) {
        throw new Error(
          typeof payload.error === "string"
            ? payload.error
            : "Conversation recovery failed.",
        );
      }

      const recorded = payload.recorded ?? 0;
      const duplicates = payload.duplicates ?? 0;
      const excluded = payload.excluded ?? 0;

      setResult(
        recorded > 0
          ? `${recorded} message${recorded === 1 ? "" : "s"} recovered. ` +
            `${duplicates} previously recorded. ` +
            `${excluded} excluded.`
          : `No new messages recovered. ` +
            `${duplicates} previously recorded. ` +
            `${excluded} excluded.`,
      );

      await onRecovered();
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Unable to recover conversation history.",
      );
    } finally {
      recoveryGuardRef.current = false;
      setRecovering(false);
    }
  }

  return (
    <div className="flex flex-col items-start gap-2">
      <button
        type="button"
        onClick={() => void recoverConversation()}
        disabled={disabled || recovering}
        aria-busy={recovering}
        className={[
          "inline-flex items-center gap-2 rounded-lg",
          "border border-teal-400/40 px-4 py-2",
          "text-sm font-semibold text-teal-200",
          "transition-colors",
          "hover:border-teal-300 hover:bg-teal-950/40",
          "focus-visible:outline focus-visible:outline-2",
          "focus-visible:outline-offset-2",
          "focus-visible:outline-teal-400",
          "disabled:cursor-not-allowed disabled:opacity-50",
        ].join(" ")}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className={recovering ? "animate-spin" : ""}
        >
          <path d="M3 11a9 9 0 0 1 15.36-6.36L21 7" />
          <path d="M21 3v4h-4" />
          <path d="M21 13a9 9 0 0 1-15.36 6.36L3 17" />
          <path d="M3 21v-4h4" />
        </svg>

        {recovering
          ? "RECOVERING..."
          : "RECOVER CONVERSATION"}
      </button>

      {result && (
        <p
          role="status"
          className="text-xs leading-5 text-emerald-300"
        >
          {result}
        </p>
      )}

      {error && (
        <p
          role="alert"
          className="text-xs leading-5 text-red-300"
        >
          {error}
        </p>
      )}
    </div>
  );
}