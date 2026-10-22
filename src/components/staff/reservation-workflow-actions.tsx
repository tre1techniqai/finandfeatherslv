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
  | "record_alternative_offer"
  | "accept_alternative"
  | "verify_deposit"
  | "confirm_yelp_booking";

type CommunicationChannel =
  | "sms"
  | "phone"
  | "email"
  | "in_person";

const TIME_OPTIONS = Array.from({ length: 25 }, (_, index) => {
  const totalMinutes = 600 + index * 30;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  const value =
    `${String(hours).padStart(2, "0")}:` +
    `${String(minutes).padStart(2, "0")}`;

  const label =
    `${hours % 12 || 12}:` +
    `${String(minutes).padStart(2, "0")} ` +
    `${hours >= 12 ? "PM" : "AM"}`;

  return { value, label };
});

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

const fieldClass =
  "min-h-11 w-full rounded-lg border border-white/20 " +
  "bg-zinc-900 px-3 py-2 text-sm text-white " +
  "outline-none focus:border-[#ea1b24]";

const buttonClass =
  "min-h-11 rounded-lg px-4 py-2 text-sm font-semibold " +
  "transition disabled:cursor-not-allowed disabled:opacity-40";

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
  const [changingAvailability, setChangingAvailability] = useState(false);
  const [notificationResult, setNotificationResult] = useState<{
    accepted: boolean;
  } | null>(null);

  const [alternativeTimes, setAlternativeTimes] = useState([
    "",
    "",
    "",
  ]);

  const [offerChannel, setOfferChannel] =
    useState<CommunicationChannel>("phone");
  const [offerEvidence, setOfferEvidence] = useState("");

  const [acceptedTime, setAcceptedTime] = useState("");
  const [acceptanceChannel, setAcceptanceChannel] =
    useState<CommunicationChannel>("phone");
  const [acceptanceEvidence, setAcceptanceEvidence] =
    useState("");
  const [acceptanceVerified, setAcceptanceVerified] =
    useState(false);

  const [paymentVerified, setPaymentVerified] =
    useState(false);

  const [yelpNumber, setYelpNumber] = useState("");
  const [yelpBookingVerified, setYelpBookingVerified] =
    useState(false);

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
  const depositSatisfied = depositRequired
    ? depositStatus === "verified"
    : depositStatus === "not_required";

  const actionPending = busy !== null;

  async function performAction(
    action: ActionName,
    payload: Record<string, unknown> = {},
  ) {
    if (actionPending || !eligible) return;

    setError("");
    setSuccess("");
    setNotificationResult(null);
    setBusy(action);

    try {
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

      const result: unknown = await response.json();

      const resultObject =
        result !== null &&
        typeof result === "object" &&
        !Array.isArray(result)
          ? (result as Record<string, unknown>)
          : {};

      if (!response.ok || resultObject.success !== true) {
        throw new Error(
          typeof resultObject.error === "string"
            ? resultObject.error
            : "Unable to complete this reservation action.",
        );
      }

      setChangingAvailability(false);

      if (action === "confirm_yelp_booking") {
        // Booking success and SMS dispatch are separate outcomes.
        // The API records the Yelp booking before attempting delivery.
        const notification =
          resultObject.notification !== null &&
          typeof resultObject.notification === "object" &&
          !Array.isArray(resultObject.notification)
            ? (resultObject.notification as Record<string, unknown>)
            : null;

        const accepted = notification?.accepted === true;
        setSuccess("Yelp reservation confirmed successfully.");
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

  const availableAlternatives =
    workflow?.proposed_times ?? [];

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
              Yelp confirmation number
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
          className="mt-5 rounded-lg border border-red-500/40 bg-red-950/30 p-3 text-sm text-red-200"
        >
          {error}
        </p>
      )}

      {success && (
        <p
          role="status"
          className="mt-5 rounded-lg border border-emerald-500/30 bg-emerald-950/20 p-3 text-sm text-emerald-200"
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
                Check availability for the original requested date and time.
              </p>

              {changingAvailability && (
                <p className="mt-3 text-sm leading-6 text-amber-200">
                  Current saved decision: {status === "available" ? "Available" : "Unavailable"}.
                  A revised selection must be accepted by the reservation system
                  before the saved status changes.
                </p>
              )}

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  disabled={actionPending || status === "available"}
                  onClick={() => performAction("approve_availability")}
                  className={`${buttonClass} border border-emerald-500/40 bg-emerald-950/30 text-emerald-200 hover:bg-emerald-900/40`}
                >
                  YES — Available
                </button>

                <button
                  type="button"
                  disabled={actionPending || status === "unavailable"}
                  onClick={() => performAction("decline_availability")}
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

          {(status === "available" || status === "unavailable") &&
            !changingAvailability && (
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-6">
                <p className="text-sm font-medium text-white">
                  Availability: {status === "available" ? "YES — Available" : "NO — Unavailable"}
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
            (status === "unavailable" ||
              status === "alternatives_proposed") && (
            <div className="border-b border-white/10 pb-6">
              <h3 className="text-base font-semibold text-white">
                2. Alternative Times
              </h3>

              <p className="mt-2 text-sm leading-6 text-zinc-400">
                Propose up to three alternatives on{" "}
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
                      className={`mt-2 ${fieldClass}`}
                    >
                      <option value="">
                        {index === 0
                          ? "Select a time"
                          : "Optional"}
                      </option>
                      {TIME_OPTIONS.filter(
                        (option) =>
                          option.value !== requestedTime?.slice(0, 5),
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

              <button
                type="button"
                disabled={
                  actionPending ||
                  alternativeTimes.every((value) => !value)
                }
                onClick={() =>
                  performAction("propose_alternatives", {
                    times: alternativeTimes.filter(Boolean),
                  })
                }
                className={`${buttonClass} mt-4 bg-[#ea1b24] text-white hover:bg-red-700`}
              >
                Save Alternative Times
              </button>
            </div>
          )}

          {status === "alternatives_proposed" && (
            <div className="border-b border-white/10 pb-6">
              <h3 className="text-base font-semibold text-white">
                3. Record Alternative Offer
              </h3>

              <p className="mt-2 text-sm text-zinc-400">
                Document how these times were actually offered
                to the guest.
              </p>

              <p className="mt-3 text-sm text-white">
                {availableAlternatives
                  .map(formatTime)
                  .join(" / ")}
              </p>

              <label className="mt-4 block text-xs text-zinc-300">
                Communication Channel
                <select
                  value={offerChannel}
                  onChange={(event) =>
                    setOfferChannel(
                      event.target.value as CommunicationChannel,
                    )
                  }
                  className={`mt-2 ${fieldClass}`}
                >
                  <option value="phone">Phone</option>
                  <option value="sms">SMS</option>
                  <option value="email">Email</option>
                  <option value="in_person">In Person</option>
                </select>
              </label>

              <label className="mt-4 block text-xs text-zinc-300">
                Communication Evidence
                <textarea
                  value={offerEvidence}
                  onChange={(event) =>
                    setOfferEvidence(event.target.value)
                  }
                  maxLength={500}
                  rows={3}
                  placeholder="Document when and how the alternatives were communicated to the guest."
                  className={`mt-2 ${fieldClass}`}
                />
              </label>

              <button
                type="button"
                disabled={
                  actionPending ||
                  offerEvidence.trim().length < 10
                }
                onClick={() =>
                  performAction("record_alternative_offer", {
                    offer_communicated: true,
                    offer_channel: offerChannel,
                    offer_evidence: offerEvidence.trim(),
                  })
                }
                className={`${buttonClass} mt-4 bg-[#ea1b24] text-white hover:bg-red-700`}
              >
                Record Completed Offer
              </button>
            </div>
          )}

          {status === "alternatives_communicated" && (
            <div className="border-b border-white/10 pb-6">
              <h3 className="text-base font-semibold text-white">
                4. Guest Acceptance
              </h3>

              <p className="mt-2 text-sm text-zinc-400">
                Only record a time after the guest has
                explicitly accepted it.
              </p>

              <label className="mt-4 block text-xs text-zinc-300">
                Accepted Time
                <select
                  value={acceptedTime}
                  onChange={(event) =>
                    setAcceptedTime(event.target.value)
                  }
                  className={`mt-2 ${fieldClass}`}
                >
                  <option value="">Select accepted time</option>
                  {availableAlternatives.map((time) => (
                    <option
                      key={time}
                      value={time.slice(0, 5)}
                    >
                      {formatTime(time)}
                    </option>
                  ))}
                </select>
              </label>

              <label className="mt-4 block text-xs text-zinc-300">
                Acceptance Channel
                <select
                  value={acceptanceChannel}
                  onChange={(event) =>
                    setAcceptanceChannel(
                      event.target.value as CommunicationChannel,
                    )
                  }
                  className={`mt-2 ${fieldClass}`}
                >
                  <option value="phone">Phone</option>
                  <option value="sms">SMS</option>
                  <option value="email">Email</option>
                  <option value="in_person">In Person</option>
                </select>
              </label>

              <label className="mt-4 block text-xs text-zinc-300">
                Guest Acceptance Evidence
                <textarea
                  value={acceptanceEvidence}
                  onChange={(event) =>
                    setAcceptanceEvidence(event.target.value)
                  }
                  maxLength={500}
                  rows={3}
                  placeholder="Record the guest's explicit acceptance and when it was received."
                  className={`mt-2 ${fieldClass}`}
                />
              </label>

              <label className="mt-4 flex items-start gap-3 text-sm text-zinc-300">
                <input
                  type="checkbox"
                  checked={acceptanceVerified}
                  onChange={(event) =>
                    setAcceptanceVerified(event.target.checked)
                  }
                  className="mt-1"
                />
                I have verified that the guest accepted
                this specific alternative time.
              </label>

              <button
                type="button"
                disabled={
                  actionPending ||
                  !acceptedTime ||
                  !acceptanceVerified ||
                  acceptanceEvidence.trim().length < 10
                }
                onClick={() =>
                  performAction("accept_alternative", {
                    accepted_time: acceptedTime,
                    guest_acceptance_verified: true,
                    acceptance_channel: acceptanceChannel,
                    acceptance_evidence:
                      acceptanceEvidence.trim(),
                  })
                }
                className={`${buttonClass} mt-4 bg-[#ea1b24] text-white hover:bg-red-700`}
              >
                Record Guest Acceptance
              </button>
            </div>
          )}

          {depositRequired &&
            depositStatus === "pending" && (
              <div className="border-b border-white/10 pb-6">
                <h3 className="text-base font-semibold text-white">
                  Deposit Verification
                </h3>

                <p className="mt-2 text-sm text-zinc-400">
                  Required deposit:{" "}
                  ${depositAmount.toFixed(2)}
                </p>

                <label className="mt-4 flex items-start gap-3 text-sm text-zinc-300">
                  <input
                    type="checkbox"
                    checked={paymentVerified}
                    onChange={(event) =>
                      setPaymentVerified(event.target.checked)
                    }
                    className="mt-1"
                  />
                  I independently verified receipt of
                  the required deposit.
                </label>

                <button
                  type="button"
                  disabled={
                    actionPending || !paymentVerified
                  }
                  onClick={() =>
                    performAction("verify_deposit", {
                      payment_independently_verified: true,
                    })
                  }
                  className={`${buttonClass} mt-4 border border-white/20 bg-white/10 text-white hover:bg-white/20`}
                >
                  Verify Deposit
                </button>
              </div>
            )}

          {canConfirm && !changingAvailability && (
            <div>
              <h3 className="text-base font-semibold text-white">
                Final Yelp Booking Confirmation
              </h3>

              <p className="mt-2 text-sm leading-6 text-zinc-400">
                Complete the actual booking in Yelp before
                recording its confirmation number here.
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

              {!depositSatisfied && (
                <p className="mt-3 text-sm text-amber-200">
                  Deposit requirements must be satisfied
                  before final confirmation.
                </p>
              )}

              <label className="mt-4 block text-xs text-zinc-300">
                Yelp Confirmation Number
                <input
                  type="text"
                  value={yelpNumber}
                  onChange={(event) =>
                    setYelpNumber(event.target.value)
                  }
                  maxLength={100}
                  placeholder="Enter actual Yelp confirmation number"
                  className={`mt-2 ${fieldClass}`}
                />
              </label>

              <label className="mt-4 flex items-start gap-3 text-sm text-zinc-300">
                <input
                  type="checkbox"
                  checked={yelpBookingVerified}
                  onChange={(event) =>
                    setYelpBookingVerified(event.target.checked)
                  }
                  className="mt-1"
                />
                I confirm this reservation has been
                booked in Yelp for the correct date,
                time, and party size.
              </label>

              <button
                type="button"
                disabled={
                  actionPending ||
                  !depositSatisfied ||
                  !yelpBookingVerified ||
                  !yelpNumber.trim()
                }
                onClick={() =>
                  performAction("confirm_yelp_booking", {
                    yelp_confirmation_number:
                      yelpNumber.trim(),
                  })
                }
                className={`${buttonClass} mt-4 w-full bg-[#ea1b24] text-white hover:bg-red-700`}
              >
                Confirm Yelp Booking
              </button>

              <p className="mt-3 text-xs leading-5 text-zinc-500">
                Confirming the Yelp booking automatically requests a guest
                confirmation SMS. Its status appears below after confirmation.
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
            A confirmation text is requested automatically when the Yelp
            booking is confirmed. No additional staff action is required.
          </p>

          {(() => {
            // Prefer the latest action result until refreshed server props arrive.
            // A successful send request is not proof of handset delivery.
            const savedStatus = confirmationNotification?.notification_status;
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
                  ? "The guest's reservation confirmation has been sent successfully."
                  : state === "pending"
                    ? "The reservation is confirmed. The guest notification is being processed."
                    : "The reservation is confirmed, but we couldn't verify that the guest received the text message. Please contact the guest or notify a manager. Do not resend the text until its status has been checked.";

            return (
              <div
                role={state === "attention" ? "alert" : "status"}
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