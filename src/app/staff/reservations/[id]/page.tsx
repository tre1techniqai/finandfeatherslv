import { Suspense } from "react";
import { connection } from "next/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireReservationStaff } from "@/lib/auth/require-reservation-staff";
import ReservationWorkflowActions from "@/components/staff/reservation-workflow-actions";
import ReservationGuestConversation from "@/components/staff/reservation-guest-conversation";

export const metadata = {
  title: "Reservation Details | Fin & Feathers Las Vegas",
  description: "Restricted reservation staff detail view.",
};

type ReservationRequest = {
  id: string;
  customer_name: string | null;
  customer_phone: string;
  email: string | null;
  reservation_date: string | null;
  reservation_time: string | null;
  party_size: number | null;
  occasion: string | null;
  vip_preference: string | null;
  request_status: string;
  details_validated: boolean;
  deposit_amount: number | null;
  deposit_status: string;
  interruption_reason: string | null;
  interruption_stage: string | null;
  staff_notes: string | null;
  confirmed_at: string | null;
  closed_at: string | null;
  created_at: string;
  updated_at: string;
};

type ReservationWorkflow = {
  workflow_status:
    | "awaiting_review"
    | "available"
    | "unavailable"
    | "alternatives_proposed"
    | "alternatives_communicated"
    | "alternative_accepted"
    | "confirmed";
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

type PageProps = {
  params: Promise<{ id: string }>;
};

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function displayValue(value: string | number | null | undefined) {
  return value === null || value === undefined || value === ""
    ? "Not provided"
    : String(value);
}

function formatDate(value: string | null) {
  if (!value) return "Not provided";

  const date = new Date(`${value}T12:00:00Z`);

  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

function formatTime(value: string | null) {
  if (!value) return "Not provided";

  const match = /^(\d{2}):(\d{2})/.exec(value);

  if (!match) return value;

  const hours = Number(match[1]);

  if (hours > 23) return value;

  return `${hours % 12 || 12}:${match[2]} ${
    hours >= 12 ? "PM" : "AM"
  }`;
}

function formatTimestamp(value: string | null) {
  if (!value) return "Not recorded";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "America/Los_Angeles",
    timeZoneName: "short",
  }).format(date);
}

function formatDeposit(value: number | null) {
  if (value === null) return "Not required";

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

function formatUsPhone(value: string) {
  const digits = value.replace(/\D/g, "");
  const national = digits.length === 11 && digits.startsWith("1")
    ? digits.slice(1)
    : digits;

  if (national.length !== 10) return value;

  return `(${national.slice(0, 3)}) ${national.slice(3, 6)}-${national.slice(6)}`;
}

function displayStatus(reservation: ReservationRequest) {
  if (
    (reservation.request_status === "incomplete" ||
      reservation.request_status === "unvalidated") &&
    !reservation.details_validated
  ) {
    return "Unvalidated";
  }

  return reservation.request_status.replace(/_/g, " ");
}

// Show a personal follow-up alert only for recorded, unresolved interruptions.
// These fields describe the automation interruption, not the guest's exact SMS.
function getGuestFollowUpReason(reservation: ReservationRequest): string | null {
  if (
    reservation.request_status === "confirmed" ||
    reservation.request_status === "closed"
  ) {
    return null;
  }

  const reason = reservation.interruption_reason?.trim().toUpperCase() ?? "";
  const stage = reservation.interruption_stage?.trim().toUpperCase() ?? "";

  if (!reason && !stage) return null;

  if (stage.includes("EMAIL")) {
    return reason.includes("TIMEOUT")
      ? "Guest did not reply with an email address."
      : "Guest did not provide a valid email address.";
  }

  if (stage.includes("VIP")) {
    return reason.includes("TIMEOUT")
      ? "Guest did not reply to the VIP seating question."
      : "Guest needs help with the VIP seating question.";
  }

  if (stage.includes("RESERVATION CORRECTION")) {
    return "Guest did not complete the requested reservation details.";
  }

  if (stage.includes("ALTERNATIVE") || stage.includes("TIME SELECTION")) {
    return "Guest did not select one of the offered times.";
  }

  return "This reservation needs a personal follow-up.";
}

function Detail({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="min-w-0">
      <dt className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
        {label}
      </dt>

      <dd className="mt-2 break-words text-sm text-white">
        {value}
      </dd>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-white/10 bg-zinc-950/90 p-5 sm:p-6">
      <h2 className="text-lg font-bold text-white">{title}</h2>

      <dl className="mt-5 grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-2">
        {children}
      </dl>
    </section>
  );
}

function Loading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-black px-5 text-white">
      <p role="status" className="text-sm text-zinc-300">
        Verifying reservation staff access...
      </p>
    </main>
  );
}

async function ProtectedReservationDetail({ params }: PageProps) {
  await connection();

  const { id } = await params;

  if (!UUID_PATTERN.test(id)) {
    notFound();
  }

  const { supabase, role } = await requireReservationStaff(
    `/staff/reservations/${id}`,
  );

  const { data, error } = await supabase
    .from("reservation_requests")
    .select(
      [
        "id",
        "customer_name",
        "customer_phone",
        "email",
        "reservation_date",
        "reservation_time",
        "party_size",
        "occasion",
        "vip_preference",
        "request_status",
        "details_validated",
        "deposit_amount",
        "deposit_status",
        "interruption_reason",
        "interruption_stage",
        "staff_notes",
        "confirmed_at",
        "closed_at",
        "created_at",
        "updated_at",
      ].join(","),
    )
    .eq("id", id)
    .maybeSingle();

  const reservation = data as ReservationRequest | null;

  // This table is introduced by the manager-only workflow migration.
  // A missing table or permission error must not block reservation details.
  const { data: workflowData, error: workflowError } =
    error || !reservation
      ? { data: null, error: null }
      : await supabase
          .from("reservation_staff_workflows")
          .select(
            [
              "workflow_status",
              "proposed_times",
              "accepted_time",
              "offer_channel",
              "offer_evidence",
              "acceptance_channel",
              "acceptance_evidence",
              "yelp_confirmation_number",
            ].join(","),
          )
          .eq("reservation_request_id", id)
          .maybeSingle();

  const workflow = workflowData as ReservationWorkflow | null;

  // The notification is read through the existing manager session.
  // A query error must not enable the SMS action or block guest details.
  const { data: notificationData, error: notificationError } =
    error || !reservation || workflowError
      ? { data: null, error: null }
      : await supabase
          .from("reservation_notification_events")
          .select("notification_status, twilio_message_sid, failure_code")
          .eq("reservation_request_id", id)
          .eq("notification_type", "reservation_confirmed")
          .maybeSingle();

  const confirmationNotification = notificationError
    ? null
    : (notificationData as ConfirmationNotification | null);

  return (
    <main className="min-h-screen bg-black px-3 py-6 text-white sm:px-8 sm:py-12">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/staff/reservations"
          className="text-sm text-zinc-400 underline decoration-zinc-700 underline-offset-4 transition hover:text-white"
        >
          ← Reservation Queue
        </Link>

        {error ? (
          <section
            role="alert"
            className="mt-8 rounded-xl border border-[#ea1b24]/30 bg-[#ea1b24]/10 p-6"
          >
            <h1 className="text-xl font-bold text-white">
              Reservation data unavailable
            </h1>

            <p className="mt-3 text-sm leading-6 text-zinc-300">
              This reservation could not be loaded. Please try
              again or contact an administrator.
            </p>

            <p className="mt-3 text-xs text-zinc-400">
              Database error code: {error.code || "Unavailable"}
            </p>
          </section>
        ) : !reservation ? (
          notFound()
        ) : (
          <>
            <header className="mt-7 border-b border-white/10 pb-6">
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#ea1b24]">
                Fin &amp; Feathers
              </p>

              <h1 className="mt-3 text-2xl font-bold tracking-tight text-white sm:text-4xl">
                {reservation.customer_name ||
                  "Guest name unavailable"}
              </h1>

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <span className="rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs font-semibold capitalize text-zinc-200">
                  {displayStatus(reservation)}
                </span>

                <span className="text-xs capitalize text-zinc-500">
                  Signed in as {role.replace(/_/g, " ")}
                </span>
              </div>

              <p className="mt-4 text-sm text-zinc-400">
                Reservation details and staff follow-up
              </p>
            </header>

            <div className="mt-6 space-y-5">
              <Section title="Guest Information">
                <Detail
                  label="Guest Name"
                  value={displayValue(reservation.customer_name)}
                />

                <Detail
                  label="Phone"
                  value={formatUsPhone(reservation.customer_phone)}
                />

                <Detail
                  label="Email"
                  value={displayValue(reservation.email)}
                />

                <Detail
                  label="VIP Preference"
                  value={displayValue(reservation.vip_preference)}
                />
              </Section>

              {getGuestFollowUpReason(reservation) && (
                <section
                  role="alert"
                  aria-labelledby="guest-follow-up-heading"
                  className="rounded-xl border border-amber-500/40 bg-amber-950/20 p-5 sm:p-6"
                >
                  <div className="flex items-center gap-3">
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-6 w-6 shrink-0 text-amber-300"
                    >
                      <path d="m10.3 3.9-8.1 14a2 2 0 0 0 1.7 3h16.2a2 2 0 0 0 1.7-3l-8.1-14a2 2 0 0 0-3.4 0Z" />
                      <path d="M12 9v4" />
                      <path d="M12 17h.01" />
                    </svg>
                    <h2
                      id="guest-follow-up-heading"
                      className="text-base font-bold text-amber-100"
                    >
                      CONTACT GUEST DIRECTLY
                    </h2>
                  </div>

                  <p className="mt-3 text-sm leading-6 text-amber-100">
                    <span className="font-semibold">Reason:</span>{" "}
                    {getGuestFollowUpReason(reservation)}
                  </p>

                  <p className="mt-2 text-sm leading-6 text-zinc-300">
                    Review the guest conversation to see what happened and
                    prepare a personal reply.
                  </p>

                  <a
                    href="#guest-conversation"
                    className="mt-4 inline-flex min-h-11 items-center rounded-lg border border-amber-400/40 bg-amber-500/10 px-4 py-2 text-sm font-semibold text-amber-100 transition hover:bg-amber-500/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                  >
                    VIEW GUEST CONVERSATION
                  </a>
                </section>
              )}

              <ReservationGuestConversation reservationId={reservation.id} />

              <Section title="Reservation Information">
                <Detail
                  label="Requested Date"
                  value={formatDate(reservation.reservation_date)}
                />

                <Detail
                  label="Requested Time (Las Vegas)"
                  value={formatTime(reservation.reservation_time)}
                />

                <Detail
                  label="Party Size"
                  value={displayValue(reservation.party_size)}
                />

                <Detail
                  label="Occasion"
                  value={displayValue(reservation.occasion)}
                />

                <Detail
                  label="Request Status"
                  value={displayStatus(reservation)}
                />

                <Detail
                  label="Details Validation"
                  value={
                    reservation.details_validated
                      ? "Validated"
                      : "Needs validation"
                  }
                />
              </Section>

              <Section title="Deposit Information">
                <Detail
                  label="Required Deposit"
                  value={formatDeposit(reservation.deposit_amount)}
                />

                <Detail
                  label="Deposit Status"
                  value={reservation.deposit_status.replace(/_/g, " ")}
                />
              </Section>

              <section className="rounded-xl border border-white/10 bg-zinc-950/90 p-5 sm:p-6">
                <h2 className="text-lg font-bold text-white">
                  Staff Notes
                </h2>

                <p className="mt-4 whitespace-pre-wrap break-words text-sm leading-6 text-zinc-300">
                  {reservation.staff_notes ||
                    "No staff notes recorded."}
                </p>
              </section>

              <Section title="Activity">
                <Detail
                  label="Received"
                  value={formatTimestamp(reservation.created_at)}
                />

                <Detail
                  label="Last Updated"
                  value={formatTimestamp(reservation.updated_at)}
                />

                <Detail
                  label="Confirmed At"
                  value={formatTimestamp(reservation.confirmed_at)}
                />

                <Detail
                  label="Closed At"
                  value={formatTimestamp(reservation.closed_at)}
                />
              </Section>

              {workflowError ? (
                <section
                  role="alert"
                  className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-5 sm:p-6"
                >
                  <h2 className="text-base font-semibold text-white">
                    Reservation Actions Unavailable
                  </h2>
                  <p className="mt-3 text-sm leading-6 text-amber-200">
                    The manager workflow database is not ready or cannot be
                    accessed. Reservation details remain available, but no
                    booking actions can be submitted.
                  </p>
                </section>
              ) : (
                <>
                  {notificationError && (
                    <section
                      role="alert"
                      className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-5 sm:p-6"
                    >
                      <h2 className="text-base font-semibold text-white">
                        Guest Notification Status Unavailable
                      </h2>
                      <p className="mt-3 text-sm leading-6 text-amber-200">
                        The confirmation notification could not be loaded.
                        Sending is disabled until its status can be verified.
                      </p>
                    </section>
                  )}
                  <ReservationWorkflowActions
                  key={`${reservation.id}:${workflow?.workflow_status ?? "awaiting_review"}:${reservation.deposit_status}`}
                  reservationId={reservation.id}
                  requestedDate={reservation.reservation_date}
                  requestedTime={reservation.reservation_time}
                  requestStatus={reservation.request_status}
                  detailsValidated={reservation.details_validated}
                  depositAmount={reservation.deposit_amount}
                  depositStatus={reservation.deposit_status}
                  workflow={workflow}
                  confirmationNotification={confirmationNotification}
                />
                </>
              )}
            </div>

            <footer className="mt-8 border-t border-white/10 pt-5">
              <Link
                href="/staff/reservations"
                className="inline-flex min-h-11 items-center text-sm font-medium text-zinc-300 underline decoration-zinc-600 underline-offset-4 transition hover:text-white"
              >
                ← Return to Reservation Queue
              </Link>
            </footer>
          </>
        )}
      </div>
    </main>
  );
}

export default function StaffReservationDetailPage(props: PageProps) {
  return (
    <Suspense fallback={<Loading />}>
      <ProtectedReservationDetail {...props} />
    </Suspense>
  );
}