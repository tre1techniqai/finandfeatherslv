
import { Suspense } from "react";
import { connection } from "next/server";
import Link from "next/link";
import GuestAssistanceActions from "@/components/staff/guest-assistance-actions";
import { requireReservationStaff } from "@/lib/auth/require-reservation-staff";

export const metadata = {
  title: "Reservations Staff Portal | Fin & Feathers Las Vegas",
  description: "Restricted reservation management for authorized staff.",
};

type ReservationStatus =
  | "pending"
  | "incomplete"
  | "unvalidated"
  | "confirmed"
  | "closed";

type QueueFilter = ReservationStatus | "all";

type ReservationRequest = {
  id: string;
  customer_phone: string;
  customer_name: string | null;
  reservation_date: string | null;
  reservation_time: string | null;
  party_size: number | null;
  occasion: string | null;
  vip_preference: string | null;
  request_status: ReservationStatus;
  details_validated: boolean;
  interruption_reason: string | null;
  interruption_stage: string | null;
  deposit_amount: number | null;
  deposit_status: string;
  created_at: string;
};

type GuestAssistanceAlert = {
  id: string;
  reservation_request_id: string;
  twilio_message_sid: string;
  alert_status: "open" | "acknowledged";
  created_at: string;
};

type PageProps = {
  searchParams: Promise<{
    q?: string | string[];
    status?: string | string[];
  }>;
};

const DEMO_RESERVATION_ID =
  "2646ba34-8c4e-42c2-96ff-81d3fe1f5459";

const QUEUE_LIMIT = 100;

const statusStyles: Record<ReservationStatus, string> = {
  pending: "border-amber-500/30 bg-amber-500/10 text-amber-300",
  incomplete: "border-orange-500/30 bg-orange-500/10 text-orange-300",
  unvalidated: "border-purple-500/30 bg-purple-500/10 text-purple-300",
  confirmed: "border-green-500/30 bg-green-500/10 text-green-300",
  closed: "border-white/15 bg-white/5 text-zinc-400",
};

const filterOptions: {
  value: QueueFilter;
  label: string;
}[] = [
  { value: "all", label: "All statuses" },
  { value: "pending", label: "Pending" },
  { value: "incomplete", label: "Incomplete" },
  { value: "unvalidated", label: "Unvalidated" },
  { value: "confirmed", label: "Confirmed" },
  { value: "closed", label: "Closed" },
];

function getSingleValue(value?: string | string[]) {
  return typeof value === "string" ? value : "";
}

function getQueueFilter(value: string): QueueFilter {
  const found = filterOptions.find(
    (option) => option.value === value,
  );

  return found?.value ?? "all";
}

function formatUsPhone(value: string) {
  const digits = value.replace(/\D/g, "");

  const national =
    digits.length === 11 && digits.startsWith("1")
      ? digits.slice(1)
      : digits;

  if (national.length !== 10) return value;

  return `(${national.slice(0, 3)}) ${national.slice(3, 6)}-${national.slice(6)}`;
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

function displayStatus(
  reservation: ReservationRequest,
): ReservationStatus {
  if (
    (reservation.request_status === "incomplete" ||
      reservation.request_status === "unvalidated") &&
    !reservation.details_validated
  ) {
    return "unvalidated";
  }

  return reservation.request_status;
}

function matchesSearch(
  reservation: ReservationRequest,
  search: string,
) {
  if (!search) return true;

  const normalized = search.toLowerCase();
  const digits = search.replace(/\D/g, "");

  const nameMatches = (
    reservation.customer_name ?? ""
  ).toLowerCase().includes(normalized);

  const phoneMatches =
    digits.length >= 3 &&
    reservation.customer_phone
      .replace(/\D/g, "")
      .includes(digits);

  return nameMatches || phoneMatches;
}

function StatusBadge({
  status,
}: {
  status: ReservationStatus;
}) {
  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold capitalize ${statusStyles[status]}`}
    >
      {status}
    </span>
  );
}

function SummaryCard({
  label,
  count,
  status,
  active,
  search,
}: {
  label: string;
  count: number;
  status: QueueFilter;
  active: boolean;
  search: string;
}) {
  const params = new URLSearchParams();

  if (status !== "all") {
    params.set("status", status);
  }

  if (search) {
    params.set("q", search);
  }

  const href = params.size
    ? `/staff/reservations?${params.toString()}#staff-queue-heading`
    : "/staff/reservations#staff-queue-heading";

  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`block rounded-xl border p-4 transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ea1b24] ${
        active
          ? "border-[#ea1b24]/60 bg-[#ea1b24]/10"
          : "border-white/10 bg-zinc-950/90 hover:border-white/30"
      }`}
    >
      <p className="text-xs font-medium text-zinc-400">
        {label}
      </p>

      <p className="mt-2 text-3xl font-bold text-white">
        {count}
      </p>

      <p className="mt-2 text-[11px] text-zinc-500">
        View requests →
      </p>
    </Link>
  );
}

function ReservationCard({
  reservation,
}: {
  reservation: ReservationRequest;
}) {
  const status = displayStatus(reservation);
  const isDemo = reservation.id === DEMO_RESERVATION_ID;

  return (
    <article className="rounded-xl border border-white/10 bg-zinc-950/90 p-4 sm:p-6">
      <div className="flex flex-col gap-3 border-b border-white/10 pb-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-bold text-white">
              {reservation.customer_name ||
                "Guest name unavailable"}
            </h3>

            {isDemo && (
              <span className="rounded-full border border-blue-400/30 bg-blue-400/10 px-2.5 py-1 text-[11px] font-semibold text-blue-200">
                Owner Demo
              </span>
            )}
          </div>

          <p className="mt-1 text-sm text-zinc-400">
            {formatUsPhone(reservation.customer_phone)}
          </p>

          <p className="mt-2 text-xs text-zinc-500">
            Received {formatTimestamp(reservation.created_at)}
          </p>
        </div>

        <div className="shrink-0">
          <StatusBadge status={status} />
        </div>
      </div>

      <dl className="mt-5 grid grid-cols-2 gap-4">
        <div>
          <dt className="text-xs text-zinc-500">
            Reservation Date
          </dt>
          <dd className="mt-1 text-sm font-medium text-white">
            {formatDate(reservation.reservation_date)}
          </dd>
        </div>

        <div>
          <dt className="text-xs text-zinc-500">
            Reservation Time
          </dt>
          <dd className="mt-1 text-sm font-medium text-white">
            {formatTime(reservation.reservation_time)}
          </dd>
        </div>

        <div>
          <dt className="text-xs text-zinc-500">
            Party Size
          </dt>
          <dd className="mt-1 text-sm font-medium text-white">
            {reservation.party_size ?? "Not provided"}
          </dd>
        </div>

        <div>
          <dt className="text-xs text-zinc-500">
            Occasion
          </dt>
          <dd className="mt-1 text-sm font-medium text-white">
            {reservation.occasion || "Not provided"}
          </dd>
        </div>

        <div>
          <dt className="text-xs text-zinc-500">
            Deposit
          </dt>
          <dd className="mt-1 text-sm font-medium text-white">
            {formatDeposit(reservation.deposit_amount)}
          </dd>
        </div>

        <div>
          <dt className="text-xs text-zinc-500">
            Deposit Status
          </dt>
          <dd className="mt-1 text-sm font-medium capitalize text-white">
            {reservation.deposit_status.replace(/_/g, " ")}
          </dd>
        </div>

        <div>
          <dt className="text-xs text-zinc-500">
            VIP Preference
          </dt>
          <dd className="mt-1 text-sm font-medium text-white">
            {reservation.vip_preference || "Not provided"}
          </dd>
        </div>

        <div>
          <dt className="text-xs text-zinc-500">
            Validation
          </dt>
          <dd className="mt-1 text-sm font-medium text-white">
            {reservation.details_validated
              ? "Validated"
              : "Needs validation"}
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

      <Link
        href={`/staff/reservations/${reservation.id}`}
        className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-[#ea1b24] px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ea1b24]"
      >
        Open Reservation →
      </Link>
    </article>
  );
}

function GuestAssistanceSection({
  alerts,
  error,
  reservations,
}: {
  alerts: GuestAssistanceAlert[];
  error: string | null;
  reservations: ReservationRequest[];
}) {
  const reservationById = new Map(
    reservations.map((reservation) => [
      reservation.id,
      reservation,
    ]),
  );

  const openCount = alerts.filter(
    (alert) => alert.alert_status === "open",
  ).length;

  return (
    <section
      aria-labelledby="guest-assistance-heading"
      className="mb-8"
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div>
          <h2
            id="guest-assistance-heading"
            className="text-xl font-bold text-white"
          >
            Guest Assistance
          </h2>

          <p className="mt-1 text-sm text-zinc-400">
            Guest messages that require staff review or follow-up.
          </p>
        </div>

        {!error && (
          <span className="rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-200">
            {openCount} open · {alerts.length} outstanding
          </span>
        )}
      </div>

      {error ? (
        <div
          role="alert"
          className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-5"
        >
          <p className="font-semibold text-amber-200">
            Assistance alerts unavailable
          </p>

          <p className="mt-2 text-sm text-amber-100">
            We couldn&apos;t retrieve the guest assistance
            queue. Refresh the page or contact an administrator.
          </p>

          <p className="mt-2 text-xs text-amber-200/80">
            Database error code: {error}
          </p>
        </div>
      ) : alerts.length === 0 ? (
        <div className="rounded-xl border border-white/10 bg-zinc-950/90 p-5">
          <p className="text-sm font-medium text-white">
            No outstanding assistance alerts
          </p>

          <p className="mt-2 text-sm text-zinc-400">
            No guest assistance alerts require attention at
            this time.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert) => {
            const reservation = reservationById.get(
              alert.reservation_request_id,
            );

            return (
              <article
                key={alert.id}
                className="rounded-xl border border-amber-500/25 bg-zinc-950/90 p-4 sm:p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-white">
                      {reservation?.customer_name ||
                        "Guest assistance requested"}
                    </p>

                    {reservation && (
                      <p className="mt-1 text-xs text-zinc-400">
                        {formatUsPhone(
                          reservation.customer_phone,
                        )}{" "}
                        · Reservation{" "}
                        {formatDate(
                          reservation.reservation_date,
                        )}
                      </p>
                    )}

                    <p className="mt-2 text-xs text-zinc-500">
                      Alert created{" "}
                      {formatTimestamp(alert.created_at)}
                    </p>
                  </div>

                  <span
                    className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                      alert.alert_status === "open"
                        ? "border-amber-500/40 bg-amber-500/10 text-amber-200"
                        : "border-blue-400/30 bg-blue-400/10 text-blue-200"
                    }`}
                  >
                    {alert.alert_status === "open"
                      ? "Needs Attention"
                      : "Acknowledged"}
                  </span>
                </div>

                <p className="mt-3 text-sm leading-6 text-zinc-300">
                  An incoming guest message requires review.
                  Open the reservation to read the SMS in
                  Guest Conversation.
                </p>

                <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-start">
                  <Link
                    href={`/staff/reservations/${alert.reservation_request_id}#guest-conversation`}
                    className="inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-[#ea1b24] px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:w-auto"
                  >
                    Open Reservation →
                  </Link>

                  <GuestAssistanceActions
                    alertId={alert.id}
                    status={alert.alert_status}
                  />
                </div>
              </article>
            );
          })}

          {alerts.length === QUEUE_LIMIT && (
            <p className="text-xs text-amber-200">
              Showing the newest 100 outstanding alerts.
              Additional alerts may exist.
            </p>
          )}
        </div>
      )}
    </section>
  );
}

function Loading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-black px-5 text-white">
      <p
        role="status"
        className="text-sm text-zinc-300"
      >
        Verifying reservation staff access...
      </p>
    </main>
  );
}

async function ProtectedReservationQueue({
  searchParams,
}: PageProps) {
  await connection();

  const { supabase, role } =
    await requireReservationStaff();

  const resolvedParams = await searchParams;

  const search = getSingleValue(
    resolvedParams.q,
  ).trim().slice(0, 100);

  const selectedStatus = getQueueFilter(
    getSingleValue(resolvedParams.status),
  );

  const { data, error } = await supabase
    .from("reservation_requests")
    .select(
      "id, customer_phone, customer_name, reservation_date, reservation_time, party_size, occasion, vip_preference, request_status, details_validated, interruption_reason, interruption_stage, deposit_amount, deposit_status, created_at",
    )
    .order("created_at", { ascending: false })
    .limit(QUEUE_LIMIT);

  const reservations =
    (data ?? []) as ReservationRequest[];

  const { data: assistanceData, error: assistanceError } =
    await supabase
      .from("reservation_guest_assistance_alerts")
      .select(
        "id, reservation_request_id, twilio_message_sid, alert_status, created_at",
      )
      .in("alert_status", ["open", "acknowledged"])
      .order("created_at", { ascending: false })
      .limit(QUEUE_LIMIT);

  const assistanceAlerts =
    (assistanceData ?? []) as GuestAssistanceAlert[];

  const counts = {
    pending: reservations.filter(
      (reservation) =>
        displayStatus(reservation) === "pending",
    ).length,

    incomplete: reservations.filter(
      (reservation) =>
        displayStatus(reservation) === "incomplete",
    ).length,

    unvalidated: reservations.filter(
      (reservation) =>
        displayStatus(reservation) === "unvalidated",
    ).length,

    confirmed: reservations.filter(
      (reservation) =>
        displayStatus(reservation) === "confirmed",
    ).length,

    closed: reservations.filter(
      (reservation) =>
        displayStatus(reservation) === "closed",
    ).length,
  };

  const filteredReservations = reservations.filter(
    (reservation) => {
      const statusMatches =
        selectedStatus === "all" ||
        displayStatus(reservation) === selectedStatus;

      return (
        statusMatches &&
        matchesSearch(reservation, search)
      );
    },
  );

  const filtersActive =
    search !== "" || selectedStatus !== "all";

  return (
    <main className="min-h-screen bg-black px-3 py-6 text-white sm:px-8 sm:py-12">
      <div className="mx-auto max-w-5xl">
        <header className="border-b border-white/10 pb-6">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#ea1b24]">
            Fin &amp; Feathers
          </p>

          <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-4xl">
            Reservations
          </h1>

          <p className="mt-2 text-sm font-medium text-zinc-300">
            Staff Management Portal
          </p>

          <p className="mt-3 text-sm leading-6 text-zinc-400">
            Review guest reservations, manage follow-ups,
            and access guest conversations.
          </p>

          <p className="mt-3 text-xs text-zinc-500">
            Authorized role:{" "}
            <span className="font-semibold capitalize text-zinc-300">
              {role.replace(/_/g, " ")}
            </span>
          </p>
        </header>

        <section
          aria-label="Reservation summary"
          className="grid grid-cols-2 gap-3 py-6 sm:grid-cols-3 lg:grid-cols-5"
        >
          <SummaryCard
            label="Pending"
            count={counts.pending}
            status="pending"
            active={selectedStatus === "pending"}
            search={search}
          />

          <SummaryCard
            label="Incomplete"
            count={counts.incomplete}
            status="incomplete"
            active={selectedStatus === "incomplete"}
            search={search}
          />

          <SummaryCard
            label="Unvalidated"
            count={counts.unvalidated}
            status="unvalidated"
            active={selectedStatus === "unvalidated"}
            search={search}
          />

          <SummaryCard
            label="Confirmed"
            count={counts.confirmed}
            status="confirmed"
            active={selectedStatus === "confirmed"}
            search={search}
          />

          <SummaryCard
            label="Closed"
            count={counts.closed}
            status="closed"
            active={selectedStatus === "closed"}
            search={search}
          />
        </section>

        <GuestAssistanceSection
          alerts={assistanceAlerts}
          error={assistanceError?.code ?? null}
          reservations={reservations}
        />

        <section aria-labelledby="staff-queue-heading">
          <div className="mb-5 flex flex-col gap-2 border-b border-white/10 pb-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2
                id="staff-queue-heading"
                className="text-xl font-bold text-white"
              >
                Reservation Queue
              </h2>

              <p className="mt-1 text-xs text-zinc-500">
                Search and filter the 100 most recent
                reservation requests.
              </p>
            </div>

            {!error && (
              <p className="text-xs text-zinc-400">
                Showing{" "}
                <span className="font-semibold text-white">
                  {filteredReservations.length}
                </span>{" "}
                of {reservations.length}
              </p>
            )}
          </div>

          <form
            action="/staff/reservations"
            method="get"
            className="mb-6 rounded-xl border border-white/10 bg-zinc-950/90 p-4"
          >
            <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_190px_auto] sm:items-end">
              <div>
                <label
                  htmlFor="reservation-search"
                  className="mb-2 block text-xs font-semibold text-zinc-300"
                >
                  Search Guests
                </label>

                <input
                  id="reservation-search"
                  name="q"
                  type="search"
                  defaultValue={search}
                  maxLength={100}
                  placeholder="Guest name or phone number"
                  className="min-h-11 w-full rounded-lg border border-white/20 bg-black px-3 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:border-[#ea1b24] focus:outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor="reservation-status"
                  className="mb-2 block text-xs font-semibold text-zinc-300"
                >
                  Status
                </label>

                <select
                  id="reservation-status"
                  name="status"
                  defaultValue={selectedStatus}
                  className="min-h-11 w-full rounded-lg border border-white/20 bg-black px-3 py-2.5 text-sm text-white focus:border-[#ea1b24] focus:outline-none"
                >
                  {filterOptions.map((option) => (
                    <option
                      key={option.value}
                      value={option.value}
                    >
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="min-h-11 rounded-lg bg-[#ea1b24] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                Apply Filters
              </button>
            </div>

            {filtersActive && (
              <div className="mt-3">
                <Link
                  href="/staff/reservations#staff-queue-heading"
                  className="text-xs font-semibold text-zinc-300 underline underline-offset-4 transition hover:text-white"
                >
                  Clear filters
                </Link>
              </div>
            )}
          </form>

          {error ? (
            <div
              role="alert"
              className="rounded-xl border border-[#ea1b24]/30 bg-[#ea1b24]/10 p-6"
            >
              <h3 className="text-base font-bold text-white">
                Reservation data unavailable
              </h3>

              <p className="mt-2 text-sm text-zinc-300">
                The reservation queue could not be loaded.
                Contact an administrator if the problem persists.
              </p>

              <p className="mt-3 text-xs text-zinc-400">
                Database error code:{" "}
                {error.code || "Unavailable"}
              </p>
            </div>
          ) : reservations.length === 0 ? (
            <div className="rounded-xl border border-white/10 bg-zinc-950/90 p-8 text-center">
              <h3 className="text-lg font-bold text-white">
                No reservation requests
              </h3>

              <p className="mt-3 text-sm text-zinc-400">
                No reservation records are currently
                available to your account.
              </p>
            </div>
          ) : filteredReservations.length === 0 ? (
            <div className="rounded-xl border border-white/10 bg-zinc-950/90 p-8 text-center">
              <h3 className="text-lg font-bold text-white">
                No matching reservations
              </h3>

              <p className="mt-3 text-sm text-zinc-400">
                No results were found in the most recent
                100 reservation requests. Try changing
                your search or status filter.
              </p>

              <Link
                href="/staff/reservations#staff-queue-heading"
                className="mt-5 inline-flex min-h-11 items-center justify-center rounded-lg border border-white/20 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Clear Filters
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredReservations.map((reservation) => (
                <ReservationCard
                  key={reservation.id}
                  reservation={reservation}
                />
              ))}
            </div>
          )}
        </section>

        <footer className="mt-9 border-t border-white/10 pt-5">
          <Link
            href="/"
            className="text-sm text-zinc-400 underline decoration-zinc-700 underline-offset-4 transition hover:text-white"
          >
            Return to the website
          </Link>
        </footer>
      </div>
    </main>
  );
}

export default function StaffReservationsPage(
  props: PageProps,
) {
  return (
    <Suspense fallback={<Loading />}>
      <ProtectedReservationQueue
        searchParams={props.searchParams}
      />
    </Suspense>
  );
}
