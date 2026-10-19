import { Suspense } from "react";
import { connection } from "next/server";
import Link from "next/link";
import { requireManager } from "@/lib/auth/require-manager";

export const metadata = {
  title: "Reservations | Fin & Feathers Las Vegas",
  description: "Restricted reservation management dashboard.",
};

type ReservationStatus =
  | "pending"
  | "incomplete"
  | "unvalidated"
  | "confirmed"
  | "closed";

type ReservationRequest = {
  id: string;
  twilio_execution_sid: string;
  customer_phone: string;
  customer_name: string | null;
  reservation_date: string | null;
  reservation_time: string | null;
  party_size: number | null;
  occasion: string | null;
  email: string | null;
  vip_preference: string | null;
  request_status: ReservationStatus;
  details_validated: boolean;
  interruption_reason: string | null;
  interruption_stage: string | null;
  deposit_amount: number | null;
  deposit_status: string;
  staff_notes: string | null;
  confirmed_at: string | null;
  closed_at: string | null;
  created_at: string;
  updated_at: string;
};

const statusStyles: Record<ReservationStatus, string> = {
  pending: "border-amber-500/30 bg-amber-500/10 text-amber-300",
  incomplete: "border-orange-500/30 bg-orange-500/10 text-orange-300",
  unvalidated: "border-purple-500/30 bg-purple-500/10 text-purple-300",
  confirmed: "border-green-500/30 bg-green-500/10 text-green-300",
  closed: "border-white/15 bg-white/5 text-zinc-400",
};

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
  const minutes = match[2];

  if (hours > 23) return value;

  const period = hours >= 12 ? "PM" : "AM";
  const displayHour = hours % 12 || 12;

  return `${displayHour}:${minutes} ${period}`;
}

function formatTimestamp(value: string) {
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

function getDisplayStatus(reservation: ReservationRequest): ReservationStatus {
  if (reservation.request_status === "incomplete" && !reservation.details_validated) {
    return "unvalidated";
  }

  return reservation.request_status;
}

function StatusBadge({ status }: { status: ReservationStatus }) {
  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold capitalize ${
        statusStyles[status] ?? statusStyles.closed
      }`}
    >
      {status}
    </span>
  );
}

function DashboardLoading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-black px-5 text-white">
      <p className="text-sm text-zinc-300" role="status">
        Verifying manager access...
      </p>
    </main>
  );
}

function SummaryCard({
  label,
  value,
  description,
}: {
  label: string;
  value: number;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-zinc-950/90 p-5">
      <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
        {label}
      </p>

      <p className="mt-3 text-3xl font-bold text-white">{value}</p>

      <p className="mt-2 text-xs leading-5 text-zinc-500">
        {description}
      </p>
    </div>
  );
}

function ReservationCard({
  reservation,
}: {
  reservation: ReservationRequest;
}) {
  return (
    <article className="rounded-xl border border-white/10 bg-zinc-950/90 p-4 sm:p-6">
      <div className="flex flex-col gap-4 border-b border-white/10 pb-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h3 className="text-lg font-bold text-white">
            {reservation.customer_name || "Guest name unavailable"}
          </h3>

          <p className="mt-1 text-sm text-zinc-400">
            {reservation.customer_phone}
          </p>

          <p className="mt-2 text-xs text-zinc-500">
            Received {formatTimestamp(reservation.created_at)}
          </p>
        </div>

        <StatusBadge status={getDisplayStatus(reservation)} />
      </div>

      <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-5 sm:grid-cols-4">
        <div>
          <dt className="text-xs text-zinc-500">Reservation Date</dt>
          <dd className="mt-1 text-sm font-medium text-white">
            {formatDate(reservation.reservation_date)}
          </dd>
        </div>

        <div>
          <dt className="text-xs text-zinc-500">Time</dt>
          <dd className="mt-1 text-sm font-medium text-white">
            {formatTime(reservation.reservation_time)}
          </dd>
        </div>

        <div>
          <dt className="text-xs text-zinc-500">Party Size</dt>
          <dd className="mt-1 text-sm font-medium text-white">
            {reservation.party_size ?? "Not provided"}
          </dd>
        </div>

        <div>
          <dt className="text-xs text-zinc-500">Occasion</dt>
          <dd className="mt-1 text-sm font-medium text-white">
            {reservation.occasion || "Not provided"}
          </dd>
        </div>

        <div>
          <dt className="text-xs text-zinc-500">Validation</dt>
          <dd className="mt-1 text-sm font-medium text-white">
            {reservation.details_validated
              ? "Validated"
              : "Needs validation"}
          </dd>
        </div>

        <div>
          <dt className="text-xs text-zinc-500">Deposit</dt>
          <dd className="mt-1 text-sm font-medium text-white">
            {formatDeposit(reservation.deposit_amount)}
          </dd>
        </div>

        <div>
          <dt className="text-xs text-zinc-500">Deposit Status</dt>
          <dd className="mt-1 text-sm font-medium capitalize text-white">
            {reservation.deposit_status.replace(/_/g, " ")}
          </dd>
        </div>

        <div>
          <dt className="text-xs text-zinc-500">VIP Preference</dt>
          <dd className="mt-1 text-sm font-medium text-white">
            {reservation.vip_preference || "Not provided"}
          </dd>
        </div>
      </dl>

      {(reservation.interruption_reason ||
        reservation.interruption_stage) && (
        <div className="mt-5 rounded-lg border border-orange-500/20 bg-orange-500/5 p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-orange-300">
            Follow-Up Required
          </p>

          {reservation.interruption_reason && (
            <p className="mt-2 text-sm text-zinc-300">
              Reason: {reservation.interruption_reason}
            </p>
          )}

          {reservation.interruption_stage && (
            <p className="mt-1 text-sm text-zinc-400">
              Stage: {reservation.interruption_stage}
            </p>
          )}
        </div>
      )}

      {reservation.staff_notes && (
        <div className="mt-5 rounded-lg border border-white/10 bg-white/[0.03] p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            Staff Notes
          </p>

          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-zinc-300">
            {reservation.staff_notes}
          </p>
        </div>
      )}

      <div className="mt-5 flex flex-col gap-3 border-t border-white/10 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="break-all text-xs text-zinc-500">
          Execution: {reservation.twilio_execution_sid}
        </p>
        <Link
          href={`/admin/reservations/${reservation.id}`}
          className="inline-flex shrink-0 items-center justify-center rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:border-[#ea1b24]/60 hover:bg-[#ea1b24]/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ea1b24]"
          aria-label={`View details for ${reservation.customer_name || "guest"}`}
        >
          View Details →
        </Link>
      </div>
    </article>
  );
}

async function ProtectedReservationsDashboard() {
  await connection();

  const { supabase } = await requireManager();

  const { data, error } = await supabase
    .from("reservation_requests")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

  const reservations = (data ?? []) as ReservationRequest[];

  const counts = {
    pending: reservations.filter(
      (reservation) => reservation.request_status === "pending",
    ).length,
    incomplete: reservations.filter(
      (reservation) => reservation.request_status === "incomplete" && reservation.details_validated,
    ).length,
    unvalidated: reservations.filter(
      (reservation) => getDisplayStatus(reservation) === "unvalidated",
    ).length,
    confirmed: reservations.filter(
      (reservation) => reservation.request_status === "confirmed",
    ).length,
    closed: reservations.filter(
      (reservation) => reservation.request_status === "closed",
    ).length,
  };

  return (
    <main className="min-h-screen bg-black px-3 py-6 text-white sm:px-8 sm:py-12">
      <div className="mx-auto max-w-6xl">
        <header className="border-b border-white/10 pb-6">
          <Link
            href="/admin"
            className="text-sm text-zinc-400 underline decoration-zinc-700 underline-offset-4 transition hover:text-white"
          >
            ← Admin Dashboard
          </Link>

          <p className="mt-6 text-[11px] font-bold uppercase tracking-[0.22em] text-[#ea1b24]">
            Fin &amp; Feathers
          </p>

          <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-4xl">
            Reservations
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
            Review incoming reservation requests, validation details,
            deposits, and follow-up requirements.
          </p>

          <div className="mt-5 inline-flex rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold text-zinc-300">
            Read-Only MVP
          </div>
        </header>

        <section
          aria-label="Reservation summary"
          className="grid grid-cols-2 gap-3 py-7 lg:grid-cols-5"
        >
          <SummaryCard
            label="Pending"
            value={counts.pending}
            description="Awaiting staff review"
          />

          <SummaryCard
            label="Incomplete"
            value={counts.incomplete}
            description="Validated; requires follow-up"
          />

          <SummaryCard
            label="Unvalidated"
            value={counts.unvalidated}
            description="Details require validation"
          />

          <SummaryCard
            label="Confirmed"
            value={counts.confirmed}
            description="Accepted reservations"
          />

          <SummaryCard
            label="Closed"
            value={counts.closed}
            description="Closed requests"
          />
        </section>

        <section aria-labelledby="reservation-queue-heading">
          <div className="mb-5 flex flex-col gap-2 border-b border-white/10 pb-4 sm:flex-row sm:items-center sm:justify-between">
            <h2
              id="reservation-queue-heading"
              className="text-xl font-bold"
            >
              Reservation Queue
            </h2>

            <p className="text-xs text-zinc-500">
              Showing up to 100 most recent requests
            </p>
          </div>

          {error ? (
            <div
              role="alert"
              className="rounded-xl border border-[#ea1b24]/30 bg-[#ea1b24]/10 p-6"
            >
              <h3 className="text-base font-bold text-white">
                Reservation data unavailable
              </h3>

              <p className="mt-2 text-sm leading-6 text-zinc-300">
                The reservation queue could not be loaded. The database
                migrations may not have been applied, or the current
                manager may not have the required database permissions.
              </p>

              <p className="mt-3 text-xs text-zinc-400">
                Database error code: {error.code || "Unavailable"}
              </p>
            </div>
          ) : reservations.length === 0 ? (
            <div className="rounded-xl border border-white/10 bg-zinc-950/90 p-8 text-center">
              <h3 className="text-lg font-bold text-white">
                No reservation requests yet
              </h3>

              <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-zinc-400">
                There are currently no reservation requests available
                to this manager. This dashboard does not generate
                simulated requests or send SMS messages.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {reservations.map((reservation) => (
                <ReservationCard
                  key={reservation.id}
                  reservation={reservation}
                />
              ))}
            </div>
          )}
        </section>

        <section className="mt-8 rounded-xl border border-white/10 bg-white/[0.03] p-5">
          <h2 className="text-base font-semibold">
            Reservations MVP — Development Mode
          </h2>

          <p className="mt-2 text-sm leading-6 text-zinc-400">
            This dashboard displays reservation records available
            through the authenticated database connection. It does
            not confirm reservations, modify database records, or
            trigger live Twilio SMS messages.
          </p>
        </section>

        <footer className="mt-10 border-t border-white/10 pt-5">
          <Link
            href="/admin"
            className="text-sm text-zinc-400 underline decoration-zinc-700 underline-offset-4 transition hover:text-white"
          >
            Return to Admin Dashboard
          </Link>
        </footer>
      </div>
    </main>
  );
}

export default function ReservationsDashboardPage() {
  return (
    <Suspense fallback={<DashboardLoading />}>
      <ProtectedReservationsDashboard />
    </Suspense>
  );
}