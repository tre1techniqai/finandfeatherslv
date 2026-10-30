type ConfirmationNotification = {
  notification_status: string;
  twilio_message_sid: string | null;
  failure_code: string | null;
};

type Props = {
  requestStatus: string;
  notification?: ConfirmationNotification | null;
  notificationUnavailable?: boolean;
};

function notificationMessage(
  notification: ConfirmationNotification | null,
  unavailable: boolean,
): string {
  if (unavailable) {
    return "Guest confirmation text status could not be verified.";
  }

  switch (notification?.notification_status) {
    case "delivered":
      return "Confirmation text delivered to the guest.";

    case "sent":
      return "Confirmation text sent. Delivery is not yet confirmed.";

    case "pending":
      return "Confirmation text is being prepared.";

    case "failed":
    case "undelivered":
      return "Confirmation text needs staff follow-up.";

    default:
      return "Confirmation text delivery has not been verified.";
  }
}

export default function ReservationConfirmationSummary({
  requestStatus,
  notification = null,
  notificationUnavailable = false,
}: Props) {
  if (requestStatus !== "confirmed") {
    return null;
  }

  const message = notificationMessage(
    notification,
    notificationUnavailable,
  );

  const needsAttention =
    notificationUnavailable ||
    notification?.notification_status === "failed" ||
    notification?.notification_status === "undelivered";

  return (
    <section
      aria-label="Reservation confirmation"
      className="rounded-xl border border-emerald-500/35 bg-emerald-950/20 p-4 sm:p-5"
    >
      <div className="flex items-start gap-3">
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="mt-0.5 h-6 w-6 shrink-0 text-emerald-400"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="m8 12 2.5 2.5L16 9" />
        </svg>

        <div className="min-w-0">
          <h2 className="text-sm font-bold uppercase tracking-wide text-emerald-200">
            Reservation Confirmed
          </h2>

          <p
            className={`mt-2 text-xs leading-5 ${
              needsAttention
                ? "text-amber-200"
                : "text-emerald-100/80"
            }`}
          >
            {message}
          </p>
        </div>
      </div>
    </section>
  );
}