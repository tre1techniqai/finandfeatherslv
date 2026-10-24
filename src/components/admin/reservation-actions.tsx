
"use client";

import { useEffect, useRef, useState } from "react";

type ReservationActionsProps = {
  requestStatus: string;
  depositStatus: string;
  detailsValidated: boolean;
};

type ActionKey =
  | "verify_deposit"
  | "confirm"
  | "update_notes"
  | "close"
  | "cancel"
  | "complete";

type ActionDefinition = {
  key: ActionKey;
  label: string;
  description: string;
  confirmation: string;
  requiresNote?: boolean;
  requiresAcknowledgment?: boolean;
};

const ACTIONS: ActionDefinition[] = [
  {
    key: "verify_deposit",
    label: "Verify Deposit",
    description:
      "Record that the required deposit has been independently verified.",
    confirmation:
      "Before verifying a deposit, independently confirm that the required payment was received using the restaurant's authoritative payment records.",
    requiresAcknowledgment: true,
  },
  {
    key: "confirm",
    label: "Confirm Reservation",
    description:
      "Confirm an eligible reservation after validating guest details and deposit requirements.",
    confirmation:
      "Confirm that the guest information, reservation date, time, party size, and applicable deposit requirements are correct.",
  },
  {
    key: "update_notes",
    label: "Add Staff Note",
    description:
      "Append an internal note to the reservation activity record.",
    confirmation:
      "Enter an internal operational note. Once submitted in the future, the note will be appended to the reservation activity record.",
    requiresNote: true,
  },
  {
    key: "close",
    label: "Close Request",
    description:
      "Close an unconfirmed request with a required reason.",
    confirmation:
      "Closing an unconfirmed request ends its management workflow. Provide a reason for the closure.",
    requiresNote: true,
  },
  {
    key: "cancel",
    label: "Cancel Reservation",
    description:
      "Record a restaurant-initiated cancellation with a required reason.",
    confirmation:
      "Canceling a confirmed reservation ends its management workflow. Provide the reason for this restaurant-initiated cancellation.",
    requiresNote: true,
  },
  {
    key: "complete",
    label: "Complete Reservation",
    description:
      "Mark a confirmed reservation as completed after its scheduled start time.",
    confirmation:
      "A reservation can only be completed after its scheduled start time. The database will enforce this requirement when actions are enabled.",
  },
];

const MAX_NOTE_CHARACTERS = 2000;

const FOCUSABLE_SELECTOR = [
  'button:not([disabled])',
  'input:not([disabled])',
  'textarea:not([disabled])',
  'select:not([disabled])',
  'a[href]',
  '[tabindex]:not([tabindex="-1"])',
].join(", ");

function isActionEligible(
  action: ActionKey,
  requestStatus: string,
  depositStatus: string,
  detailsValidated: boolean,
): boolean {
  switch (action) {
    case "verify_deposit":
      return (
        ["pending", "incomplete"].includes(requestStatus) &&
        detailsValidated &&
        depositStatus === "pending"
      );

    case "confirm":
      return (
        ["pending", "incomplete"].includes(requestStatus) &&
        detailsValidated &&
        ["not_required", "verified"].includes(depositStatus)
      );

    case "update_notes":
      return requestStatus !== "closed";

    case "close":
      return ["pending", "incomplete", "unvalidated"].includes(
        requestStatus,
      );

    case "cancel":
    case "complete":
      return requestStatus === "confirmed";

    default:
      return false;
  }
}

function formatStatus(status: string): string {
  return status.replace(/_/g, " ");
}

export default function ReservationActions({
  requestStatus,
  depositStatus,
  detailsValidated,
}: ReservationActionsProps) {
  const [selectedAction, setSelectedAction] =
    useState<ActionDefinition | null>(null);

  const [note, setNote] = useState("");
  const [acknowledged, setAcknowledged] = useState(false);

  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const triggerButtonRef = useRef<HTMLButtonElement | null>(null);

  const noteLength = Array.from(note).length;

  const noteIsValid =
    note.trim().length > 0 &&
    noteLength <= MAX_NOTE_CHARACTERS;

  const previewRequirementsMet =
    selectedAction !== null &&
    (!selectedAction.requiresNote || noteIsValid) &&
    (!selectedAction.requiresAcknowledgment || acknowledged);

  function openAction(
    action: ActionDefinition,
    trigger: HTMLButtonElement,
  ) {
    triggerButtonRef.current = trigger;

    setNote("");
    setAcknowledged(false);
    setSelectedAction(action);
  }

  function closeAction() {
    setSelectedAction(null);
    setNote("");
    setAcknowledged(false);
  }

  useEffect(() => {
    if (!selectedAction) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    closeButtonRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        closeAction();
        return;
      }

      if (event.key !== "Tab") return;

      const modal = modalRef.current;
      if (!modal) return;

      const focusableElements = Array.from(
        modal.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      ).filter(
        (element) =>
          element.getClientRects().length > 0 &&
          element.getAttribute("aria-hidden") !== "true",
      );

      if (focusableElements.length === 0) {
        event.preventDefault();
        modal.focus();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement =
        focusableElements[focusableElements.length - 1];

      const activeElement = document.activeElement;

      if (event.shiftKey) {
        if (
          activeElement === firstElement ||
          !modal.contains(activeElement)
        ) {
          event.preventDefault();
          lastElement.focus();
        }
      } else if (
        activeElement === lastElement ||
        !modal.contains(activeElement)
      ) {
        event.preventDefault();
        firstElement.focus();
      }
    }

    function handleFocusIn(event: FocusEvent) {
      const modal = modalRef.current;

      if (
        modal &&
        event.target instanceof Node &&
        !modal.contains(event.target)
      ) {
        closeButtonRef.current?.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("focusin", handleFocusIn);

    return () => {
      document.body.style.overflow = previousOverflow;

      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("focusin", handleFocusIn);

      triggerButtonRef.current?.focus();
    };
  }, [selectedAction]);

  return (
    <section
      aria-labelledby="reservation-actions-heading"
      className="rounded-xl border border-white/10 bg-zinc-950/90 p-5 sm:p-6"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2
            id="reservation-actions-heading"
            className="text-lg font-bold text-white"
          >
            Manager Actions
          </h2>

          <p className="mt-2 text-sm leading-6 text-zinc-400">
            Preview the reservation management workflow. You can
            inspect action requirements, but submissions are
            disabled.
          </p>
        </div>

        <span className="w-fit rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-xs font-semibold text-amber-200">
          Preview Mode
        </span>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-white/10 bg-black/40 p-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Request Status
          </p>

          <p className="mt-2 break-words text-sm capitalize text-white">
            {formatStatus(requestStatus)}
          </p>
        </div>

        <div className="rounded-lg border border-white/10 bg-black/40 p-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Deposit Status
          </p>

          <p className="mt-2 break-words text-sm capitalize text-white">
            {formatStatus(depositStatus)}
          </p>
        </div>

        <div className="rounded-lg border border-white/10 bg-black/40 p-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Guest Details
          </p>

          <p className="mt-2 text-sm text-white">
            {detailsValidated ? "Validated" : "Needs validation"}
          </p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {ACTIONS.map((action) => {
          const eligible = isActionEligible(
            action.key,
            requestStatus,
            depositStatus,
            detailsValidated,
          );

          return (
            <div
              key={action.key}
              className="rounded-lg border border-white/10 bg-black/30 p-4"
            >
              <button
                type="button"
                onClick={(event) =>
                  openAction(action, event.currentTarget)
                }
                className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-left text-sm font-semibold text-white transition hover:border-white/40 hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                {action.label}
              </button>

              <p className="mt-3 text-xs leading-5 text-zinc-400">
                {action.description}
              </p>

              <p
                className={`mt-3 text-xs font-semibold ${
                  eligible
                    ? "text-emerald-300"
                    : "text-amber-300"
                }`}
              >
                {eligible
                  ? "Potentially eligible"
                  : "Current status does not meet preliminary requirements"}
              </p>
            </div>
          );
        })}
      </div>

      <p className="mt-5 text-xs leading-5 text-zinc-500">
        Preview only. Eligibility indicators are informational and
        do not replace database validation. No reservation records
        can be modified, and no SMS notifications are sent.
      </p>

      {selectedAction && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-3 sm:p-6"
          role="presentation"
        >
          <div
            ref={modalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="reservation-action-dialog-title"
            aria-describedby="reservation-action-dialog-description"
            tabIndex={-1}
            className="flex max-h-[90dvh] w-full max-w-lg flex-col overflow-hidden rounded-xl border border-white/15 bg-zinc-950 text-white shadow-2xl"
          >
            <div className="overflow-y-auto overscroll-contain p-5 sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-amber-300">
                    Manager Action Preview
                  </p>

                  <h3
                    id="reservation-action-dialog-title"
                    className="mt-2 text-xl font-bold text-white"
                  >
                    {selectedAction.label}
                  </h3>
                </div>

                <button
                  ref={closeButtonRef}
                  type="button"
                  onClick={closeAction}
                  aria-label="Close dialog"
                  className="rounded-lg border border-white/15 px-3 py-2 text-sm text-zinc-300 hover:bg-white/10"
                >
                  Close
                </button>
              </div>

              <p
                id="reservation-action-dialog-description"
                className="mt-5 text-sm leading-6 text-zinc-300"
              >
                {selectedAction.confirmation}
              </p>

              {selectedAction.requiresAcknowledgment && (
                <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-lg border border-amber-400/20 bg-amber-400/5 p-4">
                  <input
                    type="checkbox"
                    checked={acknowledged}
                    onChange={(event) =>
                      setAcknowledged(event.target.checked)
                    }
                    className="mt-1 h-4 w-4 accent-red-600"
                  />

                  <span className="text-sm leading-6 text-zinc-200">
                    I have independently verified that the required
                    deposit payment was received.
                  </span>
                </label>
              )}

              {selectedAction.requiresNote && (
                <div className="mt-5">
                  <label
                    htmlFor="reservation-action-note"
                    className="block text-sm font-semibold text-white"
                  >
                    {selectedAction.key === "update_notes"
                      ? "Staff Note"
                      : selectedAction.key === "close"
                        ? "Closure Reason"
                        : "Cancellation Reason"}
                  </label>

                  <textarea
                    id="reservation-action-note"
                    value={note}
                    onChange={(event) =>
                      setNote(event.target.value)
                    }
                    rows={5}
                    maxLength={MAX_NOTE_CHARACTERS}
                    placeholder="Enter the required details..."
                    className="mt-2 w-full resize-y rounded-lg border border-white/20 bg-black/50 px-3 py-3 text-sm text-white placeholder:text-zinc-500 focus:border-red-500 focus:outline-none"
                  />

                  <div className="mt-2 flex items-center justify-between gap-3 text-xs">
                    <span className="text-zinc-400">
                      Required. Internal staff use only.
                    </span>

                    <span
                      className={
                        noteLength > MAX_NOTE_CHARACTERS
                          ? "text-red-300"
                          : "text-zinc-400"
                      }
                    >
                      {noteLength}/{MAX_NOTE_CHARACTERS}
                    </span>
                  </div>
                </div>
              )}

              <div className="mt-6 rounded-lg border border-amber-400/20 bg-amber-400/5 p-4">
                <p className="text-sm font-semibold text-amber-200">
                  Preview Mode — No Changes Will Be Made
                </p>

                <p className="mt-2 text-xs leading-5 text-zinc-300">
                  This interface does not submit requests to the
                  reservation API. Final action execution will be
                  implemented only after the database function and
                  operational workflow are approved.
                </p>
              </div>

              <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeAction}
                  className="rounded-lg border border-white/20 px-4 py-3 text-sm font-semibold text-white hover:bg-white/10"
                >
                  Back
                </button>

                <button
                  type="button"
                  disabled
                  title={
                    previewRequirementsMet
                      ? "Action execution is disabled in preview mode."
                      : "Complete the required fields. Action execution remains disabled."
                  }
                  className="cursor-not-allowed rounded-lg bg-red-700/40 px-4 py-3 text-sm font-semibold text-white/50"
                >
                  {selectedAction.label} — Disabled
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
