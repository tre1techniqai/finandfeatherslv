
import { Suspense } from "react";
import { connection } from "next/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireManager } from "@/lib/auth/require-manager";
import ReservationActions from "@/components/admin/reservation-actions";

export const metadata = {
  title: "Reservation Details | Fin & Feathers Las Vegas",
  description: "Restricted reservation detail view.",
};

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
  request_status: string;
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
        Verifying manager access and loading reservation...
      </p>
    </main>
  );
}

async function ProtectedReservationDetail({ params }: PageProps) {
  await connection();

  const { supabase } = await requireManager();
  const { id } = await params;

  if (!UUID_PATTERN.test(id)) notFound();

  const { data, error } = await supabase
    .from("reservation_requests")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  const reservation = data as ReservationRequest | null;

  return (
    <main className="min-h-screen bg-black px-3 py-6 text-white sm:px-8 sm:py-12">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/admin/reservations"
          className="text-sm text-zinc-400 underline decoration-zinc-700 underline-offset-4 transition hover:text-white"
        >
          ← Reservation Queue
        </Link>

        {error ? (
          <section
            role="alert"
            className="mt-8 rounded-xl border border-[#ea1b24]/30 bg-[#ea1b24]/10 p-6"
          >
            <h1 className="text-xl font-bold">
              Reservation data unavailable
            </h1>

            <p className="mt-3 text-sm text-zinc-300">
              The reservation could not be loaded. Please try again
              or contact an administrator.
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

              <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h1 className="text-2xl font-bold tracking-tight sm:text-4xl">
                  {reservation.customer_name ||
                    "Guest name unavailable"}
                </h1>

                <span className="w-fit rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs font-semibold capitalize text-zinc-200">
                  {displayStatus(reservation)}
                </span>
              </div>

              <p className="mt-3 text-sm text-zinc-400">
                Reservation details · Manager workflow preview
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
                  value={reservation.customer_phone}
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

              <Section title="Reservation Information">
                <Detail
                  label="Reservation Date"
                  value={formatDate(reservation.reservation_date)}
                />
                <Detail
                  label="Reservation Time (Las Vegas)"
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

              <ReservationActions
                requestStatus={reservation.request_status}
                depositStatus={reservation.deposit_status}
                detailsValidated={reservation.details_validated}
              />

              <Section title="Interruption & Follow-Up">
                <Detail
                  label="Interruption Reason"
                  value={displayValue(reservation.interruption_reason)}
                />
                <Detail
                  label="Interruption Stage"
                  value={displayValue(reservation.interruption_stage)}
                />
              </Section>

              <section className="rounded-xl border border-white/10 bg-zinc-950/90 p-5 sm:p-6">
                <h2 className="text-lg font-bold">
                  Staff Notes
                </h2>

                <p className="mt-4 whitespace-pre-wrap break-words text-sm leading-6 text-zinc-300">
                  {reservation.staff_notes ||
                    "No staff notes recorded."}
                </p>
              </section>

              <Section title="Activity & Reference">
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
                <Detail
                  label="Reservation ID"
                  value={reservation.id}
                />
                <Detail
                  label="Twilio Execution SID"
                  value={reservation.twilio_execution_sid}
                />
              </Section>
            </div>

            <p className="mt-7 text-xs leading-5 text-zinc-500">
              Manager actions are currently disabled. This page
              does not update reservations, confirm requests, or
              send SMS messages.
            </p>
          </>
        )}
      </div>
    </main>
  );
}

export default function ReservationDetailPage(props: PageProps) {
  return (
    <Suspense fallback={<Loading />}>
      <ProtectedReservationDetail {...props} />
    </Suspense>
  );
}
