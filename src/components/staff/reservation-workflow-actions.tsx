"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type WorkflowStatus =
  | "awaiting_review"
  | "available"
  | "unavailable"
  | "alternatives_proposed"
  | "alternatives_communicated"
  | "alternative_accepted"
  | "confirmed";

type WorkflowData = {
  workflow_status: WorkflowStatus;
  proposed_times: string[];
  accepted_time: string | null;
  offer_channel: string | null;
  offer_evidence: string | null;
  acceptance_channel: string | null;
  acceptance_evidence: string | null;
  yelp_confirmation_number: string | null;
};

type ConfirmationNotification = {
  notification_status: string;
  twilio_message_sid: string | null;
  failure_code: string | null;
};

type Props = {
  reservationId: string;
  requestedDate: string | null;
  requestedTime: string | null;
  requestStatus: string;
  detailsValidated: boolean;
  depositAmount: number | null;
  depositStatus: string;
  workflow: WorkflowData | null;
  confirmationNotification?: ConfirmationNotification | null;
};

type ActionName =
  | "approve_availability"
  | "decline_availability"
  | "propose_alternatives"
  | "send_alternatives"
  | "confirm_yelp_booking";

type ApiResult = Record<string, unknown>;

const TIME_OPTIONS = Array.from({ length: 25 }, (_, index) => {
  const total = 600 + index * 30;
  const hours = Math.floor(total / 60);
  const minutes = total % 60;

  return {
    value:
      `${String(hours).padStart(2, "0")}:` +
      `${String(minutes).padStart(2, "0")}`,
    label:
      `${hours % 12 || 12}:` +
      `${String(minutes).padStart(2, "0")} ` +
      (hours >= 12 ? "PM" : "AM"),
  };
});

const fieldClass =
  "min-h-11 w-full rounded-lg border border-white/20 " +
  "bg-zinc-900 px-3 py-2 text-sm text-white " +
  "outline-none focus:border-[#ea1b24]";

const buttonClass =
  "min-h-11 rounded-lg px-4 py-2 text-sm font-semibold " +
  "transition disabled:cursor-not-allowed disabled:opacity-40";

function formatTime(value: string | null) {
  if (!value) return "Not provided";

  const match = /^(\d{2}):(\d{2})/.exec(value);
  if (!match) return value;

  const hours = Number(match[1]);

  return `${hours % 12 || 12}:${match[2]} ${
    hours >= 12 ? "PM" : "AM"
  }`;
}

function formatDate(value: string | null) {
  if (!value) return "Not provided";

  const date = new Date(`${value}T12:00:00Z`);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

function formatStatus(value: string) {
  return value.replace(/_/g, " ");
}

function isObject(value: unknown): value is ApiResult {
  return (
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value)
  );
}

export default function ReservationWorkflowActions({
  reservationId,
  requestedDate,
  requestedTime,
  requestStatus,
  detailsValidated,
  depositAmount,
  depositStatus,
  workflow,
  confirmationNotification = null,
}: Props) {
  const router = useRouter();

  const status = workflow?.workflow_status ?? "awaiting_review";

  const [busy, setBusy] = useState<ActionName | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [changingAvailability, setChangingAvailability] =
    useState(false);

  const [alternativeTimes, setAlternativeTimes] = useState([
    "",
    "",
    "",
  ]);

  // Disable further send attempts after an uncertain outcome.
  // The database claim also independently prevents duplicate sends.
  const [sendNeedsReview, setSendNeedsReview] = useState(false);

  const [offerAccepted, setOfferAccepted] = useState(false);

  const [depositLinkSent, setDepositLinkSent] = useState(false);
  const [yelpBookingVerified, setYelpBookingVerified] =
    useState(false);

  const [notificationResult, setNotificationResult] = useState<{
    accepted: boolean;
  } | null>(null);

  const isConfirmed =
    status === "confirmed" ||
    requestStatus === "confirmed";

  const isClosed = requestStatus === "closed";

  const eligible =
    detailsValidated &&
    (requestStatus === "pending" ||
      requestStatus === "incomplete") &&
    !isConfirmed &&
    !isClosed;

  const canConfirm =
    status === "available" ||
    status === "alternative_accepted";

  const depositRequired = depositAmount !== null;

  const actionPending = busy !== null;
  const availableAlternatives = workflow?.proposed_times ?? [];

  const selectedTimes = alternativeTimes.filter(Boolean);
  const distinctTimes =
    new Set(selectedTimes).size === selectedTimes.length;

  async function callAction(
    action: ActionName,
    payload: Record<string, unknown> = {},
  ): Promise<ApiResult> {
    const response = await fetch(
      `/api/staff/reservations/${encodeURIComponent(
        reservationId,
      )}/actions`,
      {
        method: "POST",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action, payload }),
      },
    );

    const raw: unknown = await response.json();
    const result = isObject(raw) ? raw : {};

    if (!response.ok || result.success !== true) {
      throw new Error(
        typeof result.error === "string"
          ? result.error
          : "Unable to complete this reservation action.",
      );
    }

    return result;
  }

  async function performAction(
    action: ActionName,
    payload: Record<string, unknown> = {},
  ) {
    if (actionPending || !eligible) return;

    setBusy(action);
    setError("");
    setSuccess("");
    setNotificationResult(null);

    try {
      const result = await callAction(action, payload);

      setChangingAvailability(false);

      if (action === "confirm_yelp_booking") {
        const notification = isObject(result.notification)
          ? result.notification
          : null;

        const accepted = notification?.accepted === true;

        setSuccess("Reservation confirmed successfully.");
        setNotificationResult({ accepted });
      } else {
        setSuccess("Reservation action saved successfully.");
      }

      router.refresh();
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Unable to complete this reservation action.",
      );
    } finally {
      setBusy(null);
    }
  }

  async function sendAlternativeTimes() {
    if (
      actionPending ||
      !eligible ||
      sendNeedsReview ||
      !["unavailable", "alternatives_proposed"].includes(status)
    ) {
      return;
    }

    const needsSaving = status === "unavailable";

    if (
      needsSaving &&
      (selectedTimes.length < 1 ||
        selectedTimes.length > 3 ||
        !distinctTimes)
    ) {
      setError("Select one to three different alternative times.");
      return;
    }

    setBusy("send_alternatives");
    setError("");
    setSuccess("");

    let timesSaved = !needsSaving;

    try {
      if (needsSaving) {
        await callAction("propose_alternatives", {
          times: selectedTimes,
        });

        timesSaved = true;
      }

      // Once a request may have reached the dispatcher, block further
      // attempts in this component until the outcome is reviewed.
      setSendNeedsReview(true);

      const result = await callAction("send_alternatives");

      if (result.accepted !== true) {
        throw new Error(
          "Twilio acceptance was not verified. Review the offer before attempting another send.",
        );
      }

      setOfferAccepted(true);
      setSuccess(
        "Twilio accepted the alternative-times SMS. " +
          "The guest can reply with a numbered choice. " +
          "Handset delivery is not yet verified.",
      );

      router.refresh();
    } catch (caught) {
      const message =
        caught instanceof Error
          ? caught.message
          : "Unable to process the alternative-time offer.";

      setError(
        timesSaved
          ? "Alternative times are saved, but SMS acceptance " +
              "could not be verified. " +
              message +
              " Do not resend until its status has been checked."
          : "Alternative times were not saved. " + message,
      );

      // Saving alone failed: no dispatch was attempted.
      // The manager may correct their selection and try again.
      router.refresh();
    } finally {
      setBusy(null);
    }
  }

  return (
    <section className="rounded-xl border border-white/10 bg-zinc-950/90 p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-white">
            Reservation Actions
          </h2>
          <p className="mt-2 text-sm text-zinc-400">
            Manager reservation processing
          </p>
        </div>

        <span className="rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs font-semibold capitalize text-zinc-200">
          {formatStatus(status)}
        </span>
      </div>

      <div className="mt-5 grid gap-3 rounded-lg border border-white/10 bg-black/40 p-4 sm:grid-cols-2">
        <div>
          <p className="text-xs text-zinc-500">
            Original requested date
          </p>
          <p className="mt-1 text-sm font-semibold text-white">
            {formatDate(requestedDate)}
          </p>
        </div>

        <div>
          <p className="text-xs text-zinc-500">
            Original requested time
          </p>
          <p className="mt-1 text-sm font-semibold text-white">
            {formatTime(requestedTime)}
          </p>
        </div>

        {workflow?.accepted_time && (
          <div className="sm:col-span-2">
            <p className="text-xs text-zinc-500">
              Guest-accepted alternative
            </p>
            <p className="mt-1 text-sm font-semibold text-white">
              {formatTime(workflow.accepted_time)}
              {" — "}
              {formatDate(requestedDate)}
            </p>
          </div>
        )}

        {workflow?.yelp_confirmation_number && (
          <div className="sm:col-span-2">
            <p className="text-xs text-zinc-500">
              Guest phone / Yelp lookup reference
            </p>
            <p className="mt-1 break-words text-sm font-semibold text-white">
              {workflow.yelp_confirmation_number}
            </p>
          </div>
        )}
      </div>

      {error && (
        <p
          role="alert"
          className="mt-5 rounded-lg border border-red-500/40 bg-red-950/30 p-3 text-sm leading-6 text-red-200"
        >
          {error}
        </p>
      )}

      {success && (
        <p
          role="status"
          className="mt-5 rounded-lg border border-emerald-500/30 bg-emerald-950/20 p-3 text-sm leading-6 text-emerald-200"
        >
          {success}
        </p>
      )}

      {!eligible && (
        <p className="mt-5 text-sm leading-6 text-amber-200">
          {isConfirmed
            ? "This reservation has been confirmed. No additional booking actions are available."
            : isClosed
              ? "This reservation is closed."
              : "This reservation requires validated guest details before staff processing."}
        </p>
      )}

      {eligible && (
        <div className="mt-6 space-y-6">
          {(status === "awaiting_review" ||
            ((status === "available" || status === "unavailable") &&
              changingAvailability)) && (
            <div className="border-b border-white/10 pb-6">
              <h3 className="text-base font-semibold text-white">
                1. Requested Time Availability
              </h3>

              <p className="mt-2 text-sm text-zinc-400">
                Check availability for the original requested date
                and time.
              </p>

              {changingAvailability && (
                <p className="mt-3 text-sm leading-6 text-amber-200">
                  Current saved decision:{" "}
                  {status === "available"
                    ? "Available"
                    : "Unavailable"}
                  . A revised selection must be accepted by the
                  reservation system before the status changes.
                </p>
              )}

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  disabled={
                    actionPending || status === "available"
                  }
                  onClick={() =>
                    performAction("approve_availability")
                  }
                  className={`${buttonClass} border border-emerald-500/40 bg-emerald-950/30 text-emerald-200 hover:bg-emerald-900/40`}
                >
                  YES — Available
                </button>

                <button
                  type="button"
                  disabled={
                    actionPending || status === "unavailable"
                  }
                  onClick={() =>
                    performAction("decline_availability")
                  }
                  className={`${buttonClass} border border-red-500/40 bg-red-950/30 text-red-200 hover:bg-red-900/40`}
                >
                  NO — Unavailable
                </button>
              </div>

              {changingAvailability && (
                <button
                  type="button"
                  disabled={actionPending}
                  onClick={() => setChangingAvailability(false)}
                  className={`${buttonClass} mt-3 border border-white/20 bg-white/5 text-zinc-200 hover:bg-white/10`}
                >
                  Cancel — Keep Saved Decision
                </button>
              )}
            </div>
          )}

          {(status === "available" ||
            status === "unavailable") &&
            !changingAvailability && (
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-6">
                <p className="text-sm font-medium text-white">
                  Availability:{" "}
                  {status === "available"
                    ? "YES — Available"
                    : "NO — Unavailable"}
                </p>

                <button
                  type="button"
                  disabled={actionPending}
                  onClick={() => setChangingAvailability(true)}
                  className={`${buttonClass} border border-white/20 bg-white/5 text-zinc-200 hover:bg-white/10`}                >
                  Change Decision
                </button>
              </div>
            )}

          {!changingAvailability &&
            status === "unavailable" && (
              <div className="border-b border-white/10 pb-6">
                <h3 className="text-base font-semibold text-white">
                  2. Offer Alternative Times
                </h3>

                <p className="mt-2 text-sm leading-6 text-zinc-400">
                  Choose up to three times on{" "}
                  <strong className="text-white">
                    {formatDate(requestedDate)}
                  </strong>
                  . Alternative dates are not permitted.
                </p>

                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  {alternativeTimes.map((value, index) => (
                    <label
                      key={index}
                      className="block text-xs text-zinc-300"
                    >
                      Alternative {index + 1}

                      <select
                        value={value}
                        onChange={(event) => {
                          const next = [...alternativeTimes];
                          next[index] = event.target.value;
                          setAlternativeTimes(next);
                        }}
                        disabled={actionPending}
                        className={`mt-2 ${fieldClass}`}
                      >
                        <option value="">
                          {index === 0
                            ? "Select a time"
                            : "Optional"}
                        </option>

                        {TIME_OPTIONS.filter(
                          (option) =>
                            option.value !==
                            requestedTime?.slice(0, 5),
                        ).map((option) => (
                          <option
                            key={option.value}
                            value={option.value}
                          >
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </label>
                  ))}
                </div>

                {!distinctTimes && (
                  <p className="mt-3 text-sm text-amber-200">
                    Each alternative time must be different.
                  </p>
                )}

                <button
                  type="button"
                  disabled={
                    actionPending ||
                    sendNeedsReview ||
                    selectedTimes.length === 0 ||
                    !distinctTimes
                  }
                  onClick={sendAlternativeTimes}
                  className={`${buttonClass} mt-4 w-full bg-[#ea1b24] text-white hover:bg-red-700`}
                >
                  {busy === "send_alternatives"
                    ? "Saving and Sending..."
                    : "Send Alternative Times"}
                </button>

                <p className="mt-3 text-xs leading-5 text-zinc-500">
                  This action first saves your selections, then
                  requests one SMS containing numbered choices.
                  Sending is not proof of delivery.
                </p>
              </div>
            )}

          {status === "alternatives_proposed" && (
            <div className="border-b border-white/10 pb-6">
              <h3 className="text-base font-semibold text-white">
                2. Alternative Times Ready
              </h3>

              <p className="mt-2 text-sm text-zinc-400">
                These alternatives are saved for{" "}
                {formatDate(requestedDate)}.
              </p>

              <div className="mt-4 space-y-2">
                {availableAlternatives.map((time, index) => (
                  <p key={`${time}-${index}`} className="text-sm text-white">
                    {index + 1}. {formatTime(time)}
                  </p>
                ))}
              </div>

              <button
                type="button"
                disabled={
                  actionPending ||
                  sendNeedsReview ||
                  offerAccepted ||
                  availableAlternatives.length === 0
                }
                onClick={sendAlternativeTimes}
                className={`${buttonClass} mt-4 w-full bg-[#ea1b24] text-white hover:bg-red-700`}
              >
                {busy === "send_alternatives"
                  ? "Sending Alternative Times..."
                  : "Send Alternative Times"}
              </button>

              <p className="mt-3 text-xs leading-5 text-zinc-500">
                Send once only. If SMS status is uncertain,
                verify the Twilio and reservation logs before
                taking further action.
              </p>
            </div>
          )}

          {status === "alternatives_communicated" && (
            <div className="border-b border-white/10 pb-6">
              <h3 className="text-base font-semibold text-white">
                3. Awaiting Guest Selection
              </h3>

              <p className="mt-2 text-sm leading-6 text-zinc-300">
                Twilio accepted the alternative-time offer.
                The guest can reply with the number corresponding
                to their preferred time.
              </p>

              <div className="mt-4 space-y-2">
                {availableAlternatives.map((time, index) => (
                  <p
                    key={`${time}-${index}`}
                    className="text-sm text-white"
                  >
                    {index + 1}. {formatTime(time)}
                  </p>
                ))}
              </div>

              <p className="mt-4 text-sm text-amber-200">
                No reservation has been confirmed yet.
                Refresh the reservation details to check
                whether the guest has selected a time.
              </p>

              <button
                type="button"
                disabled={actionPending}
                onClick={() => router.refresh()}
                className={`${buttonClass} mt-4 border border-white/20 bg-white/5 text-white hover:bg-white/10`}              >
                Refresh Guest Status
              </button>
            </div>
          )}

          {status === "alternative_accepted" && (
            <div className="border-b border-white/10 pb-6">
              <h3 className="text-base font-semibold text-white">
                3. Guest Selection Recorded
              </h3>

              <p className="mt-2 text-sm leading-6 text-emerald-200">
                The guest accepted{" "}
                <strong>
                  {formatTime(workflow?.accepted_time ?? null)}
                </strong>{" "}
                on {formatDate(requestedDate)}.
              </p>

              <p className="mt-3 text-sm text-zinc-400">
                Complete the booking in Yelp, then confirm the reservation below.
              </p>
            </div>
          )}

          {canConfirm && !changingAvailability && (
            <div>
              <h3 className="text-base font-semibold text-white">
                Final Reservation Confirmation
              </h3>

              <p className="mt-2 text-sm leading-6 text-zinc-400">
                Complete the booking in Yelp before confirming it here.
                The guest phone number will be saved as the Yelp lookup reference.
              </p>

              <p className="mt-3 text-sm text-white">
                Booking time:{" "}
                <strong>
                  {formatTime(
                    workflow?.accepted_time ?? requestedTime,
                  )}
                </strong>
                {" on "}
                {formatDate(requestedDate)}
              </p>

              {depositRequired && (
                <div className="mt-4 rounded-lg border border-white/10 bg-white/5 p-4">
                  <p className="text-sm text-zinc-300">
                    Required deposit: ${depositAmount?.toFixed(2)}
                  </p>
                  <p className="mt-2 text-xs leading-5 text-zinc-400">
                    Staff emails the payment link through the POS.
                    A sent link does not mean payment has been received.
                    Deposit record: {formatStatus(depositStatus)}.
                  </p>
                  <label className="mt-4 flex items-start gap-3 text-sm text-white">
                    <input
                      type="checkbox"
                      checked={depositLinkSent}
                      onChange={(event) => setDepositLinkSent(event.target.checked)}
                      className="mt-1"
                    />
                    I confirm that the deposit payment link has been emailed to the guest.
                  </label>
                </div>
              )}

              <label className="mt-4 flex items-start gap-3 text-sm text-zinc-300">
                <input
                  type="checkbox"
                  checked={yelpBookingVerified}
                  onChange={(event) =>
                    setYelpBookingVerified(event.target.checked)
                  }
                  className="mt-1"
                />
                I confirm this reservation has been booked in
                Yelp for the correct date, time, and party size.
              </label>

              <button
                type="button"
                disabled={
                  actionPending ||
                  !yelpBookingVerified ||
                  (depositRequired && !depositLinkSent)
                }
                onClick={() =>
                  performAction("confirm_yelp_booking", {
                    ...(depositRequired ? { deposit_link_sent: true } : {}),
                  })
                }
                className={`${buttonClass} mt-4 w-full bg-[#ea1b24] text-white hover:bg-red-700`}
              >
                Confirm Reservation
              </button>

              <p className="mt-3 text-xs leading-5 text-zinc-500">
                Confirming the reservation automatically
                requests a guest confirmation SMS.
                Its status appears below.
              </p>
            </div>
          )}
        </div>
      )}

      {(isConfirmed || notificationResult) && (
        <div className="mt-6 space-y-4 border-t border-white/10 pt-6">
          <h3 className="text-base font-semibold text-white">
            Guest Confirmation
          </h3>

          <p className="text-sm leading-6 text-zinc-400">
            A confirmation text is requested automatically when
            the reservation is confirmed. No additional staff
            action is required.
          </p>

          {(() => {
            const savedStatus =
              confirmationNotification?.notification_status;

            const state = notificationResult
              ? notificationResult.accepted
                ? "sent"
                : "attention"
              : savedStatus === "delivered"
                ? "delivered"
                : savedStatus === "sent"
                  ? "sent"
                  : savedStatus === "pending"
                    ? "pending"
                    : "attention";

            const heading =
              state === "delivered"
                ? "Confirmation Delivered"
                : state === "sent"
                  ? "Confirmation Sent"
                  : state === "pending"
                    ? "Confirmation Pending"
                    : "Notification Needs Attention";

            const description =
              state === "delivered"
                ? "The guest's reservation confirmation was delivered."
                : state === "sent"
                  ? "Twilio accepted the guest confirmation SMS. Handset delivery is not yet verified."
                  : state === "pending"
                    ? "The reservation is confirmed. Guest notification is being processed."
                    : "The reservation is confirmed, but SMS delivery could not be verified. Check Twilio logs and contact the guest if necessary. Do not resend without reviewing the notification status.";

            return (
              <div
                role={
                  state === "attention" ? "alert" : "status"
                }
                className={`rounded-lg border p-4 text-sm leading-6 ${
                  state === "attention"
                    ? "border-amber-500/30 bg-amber-950/20 text-amber-200"
                    : state === "pending"
                      ? "border-white/20 bg-white/5 text-zinc-200"
                      : "border-emerald-500/30 bg-emerald-950/20 text-emerald-200"
                }`}
              >
                <p className="font-semibold">{heading}</p>
                <p className="mt-1">{description}</p>
              </div>
            );
          })()}
        </div>
      )}
    </section>
  );
}