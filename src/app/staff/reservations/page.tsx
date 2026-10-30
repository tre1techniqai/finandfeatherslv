
import { Suspense } from "react";
import { connection } from "next/server";
import Link from "next/link";

import GuestAssistanceActions from "@/components/staff/guest-assistance-actions";
import { requireReservationStaff } from "@/lib/auth/require-reservation-staff";

export const metadata = {
  title: "Reservations Staff Portal | Fin & Feathers Las Vegas",
  description:
    "Restricted reservation management for authorized staff.",
};

type ReservationStatus =
  | "pending"
  | "incomplete"
  | "unvalidated"
  | "confirmed"
  | "closed";

type QueueFilter = ReservationStatus | "all";
type SortOrder = "newest" | "oldest";
type PageSize = 10 | 20 | 50 | 100;

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
  searchParams: Promise<
    Record<string, string | string[] | undefined>
  >;
};

function isOwnerDemoGuest(
  customerName: string | null,
): boolean {
  const firstName =
    customerName?.trim().split(/\s+/)[0] ?? "";

  return firstName.toLowerCase() === "test";
}

const ALERT_LIMIT = 100;

const statuses: QueueFilter[] = [
  "all",
  "pending",
  "incomplete",
  "unvalidated",
  "confirmed",
  "closed",
];

const statusStyles: Record<ReservationStatus, string> = {
  pending:
    "border-amber-400/60 bg-amber-400/15 text-amber-200",
  incomplete:
    "border-orange-400/60 bg-orange-400/15 text-orange-200",
  unvalidated:
    "border-fuchsia-400/60 bg-fuchsia-400/15 text-fuchsia-200",
  confirmed:
    "border-emerald-400/60 bg-emerald-400/15 text-emerald-200",
  closed:
    "border-zinc-500 bg-zinc-700/40 text-zinc-200",
};

function single(
  value: string | string[] | undefined,
) {
  return typeof value === "string" ? value : "";
}

function statusOf(
  reservation: ReservationRequest,
): ReservationStatus {
  return (
    (reservation.request_status === "incomplete" ||
      reservation.request_status === "unvalidated") &&
    !reservation.details_validated
  )
    ? "unvalidated"
    : reservation.request_status;
}

function formatDate(value: string | null) {
  if (!value) return "Date unavailable";

  const date = new Date(`${value}T12:00:00Z`);

  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        timeZone: "UTC",
      }).format(date);
}

function formatTime(value: string | null) {
  const match = value?.match(/^(\d{2}):(\d{2})/);

  if (!match) return "Time unavailable";

  const hours = Number(match[1]);

  return hours > 23
    ? value!
    : `${hours % 12 || 12}:${match[2]} ${
        hours >= 12 ? "PM" : "AM"
      }`;
}

function formatPhone(value: string) {
  const digits = value.replace(/\D/g, "");

  const national =
    digits.length === 11 && digits.startsWith("1")
      ? digits.slice(1)
      : digits;

  return national.length === 10
    ? `(${national.slice(0, 3)}) ${national.slice(
        3,
        6,
      )}-${national.slice(6)}`
    : value;
}

function formatTimestamp(value: string) {
  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        timeZone: "America/Los_Angeles",
        timeZoneName: "short",
      }).format(date);
}

function StatusBadge({
  status,
}: {
  status: ReservationStatus;
}) {
  return (
    <span
      className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${statusStyles[status]}`}
    >
      {status}
    </span>
  );
}

function SummaryCard({
  label,
  count,
  href,
  active,
}: {
  label: string;
  count: number;
  status: ReservationStatus;
  href: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`rounded-xl border p-2.5 transition hover:border-white/40 focus-visible:outline-2 focus-visible:outline-[#ea1b24] sm:p-3 ${
        active
          ? "border-[#ea1b24] bg-[#ea1b24]/10"
          : "border-white/10 bg-zinc-950/90"
      }`}
    >
      <span className="block text-[10px] leading-tight text-zinc-400 sm:text-xs">
        {label}
      </span>

      <span className="mt-1 block text-2xl font-bold text-white">
        {count}
      </span>
    </Link>
  );
}

function ReservationRow({
  reservation,
}: {
  reservation: ReservationRequest;
}) {
  const status = statusOf(reservation);

  const vip =
    reservation.vip_preference
      ?.trim()
      .toUpperCase() === "YES";

  return (
    <article className="rounded-lg border border-white/10 bg-zinc-950/90 px-3 py-3 sm:px-4">
      <div className="flex min-w-0 items-start justify-between gap-3">
        <h3 className="min-w-0 truncate text-sm font-bold text-white sm:text-base">
          {reservation.customer_name ||
            "Guest name unavailable"}

          {isOwnerDemoGuest(reservation.customer_name) && (
            <span className="ml-2 align-middle text-[10px] font-semibold text-sky-300">
              OWNER DEMO
            </span>
          )}
        </h3>

        <StatusBadge status={status} />
      </div>

      <p className="mt-2 text-xs text-zinc-300 sm:text-sm">
        Guests:{" "}
        <span className="font-medium text-white">
          {reservation.party_size ?? "—"}
        </span>

        <span className="mx-1.5 text-zinc-600">·</span>

        {formatDate(reservation.reservation_date)}

        <span className="mx-1.5 text-zinc-600">·</span>

        {formatTime(reservation.reservation_time)}
      </p>

      <div className="mt-2 flex min-h-10 items-end justify-between gap-3">
        <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1 pb-1 text-xs text-zinc-400 sm:text-sm">
          <span>
            {reservation.occasion ||
              "Occasion not provided"}
          </span>

          {vip && (
            <span
              className="font-bold text-amber-300"
              aria-label="VIP preference affirmed"
            >
              ★ VIP
            </span>
          )}

          {(reservation.interruption_reason ||
            reservation.interruption_stage) && (
            <span className="font-semibold text-orange-300">
              Follow-up required
            </span>
          )}
        </div>

        <Link
          href={`/staff/reservations/${reservation.id}`}
          aria-label={`View reservation for ${
            reservation.customer_name || "guest"
          }`}
          title="View reservation details"
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/5 text-white transition hover:border-[#ea1b24] hover:bg-[#ea1b24] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5"
          >
            <path d="m9 5 7 7-7 7" />
          </svg>
        </Link>
      </div>
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
  const byId = new Map(
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
            Guest messages that require staff review or
            follow-up.
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
            Refresh the page or contact an administrator.
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
            No guest assistance alerts require attention
            at this time.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert) => {
            const reservation = byId.get(
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
                        {formatPhone(
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
                  An incoming guest message requires
                  review. Open the reservation to read
                  the SMS in Guest Conversation.
                </p>

                <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-start">
                  <Link
                    href={`/staff/reservations/${alert.reservation_request_id}#guest-conversation`}
                    className="inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-[#ea1b24] px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-700 sm:w-auto"
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

          {alerts.length === ALERT_LIMIT && (
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

function makeHref(params: {
  q: string;
  status: QueueFilter;
  sort: SortOrder;
  size: PageSize;
  page?: number;
  anchor?: boolean;
}) {
  const query = new URLSearchParams();

  if (params.q) query.set("q", params.q);

  if (params.status !== "all") {
    query.set("status", params.status);
  }

  if (params.sort !== "newest") {
    query.set("sort", params.sort);
  }

  if (params.size !== 10) {
    query.set("size", String(params.size));
  }

  if ((params.page ?? 1) > 1) {
    query.set("page", String(params.page));
  }

  const qs = query.toString();

  return `/staff/reservations${
    qs ? `?${qs}` : ""
  }${params.anchor ? "#staff-queue-heading" : ""}`;
}

async function ProtectedReservationQueue({
  searchParams,
}: PageProps) {
  await connection();

  const { supabase, role } =
    await requireReservationStaff();

  const params = await searchParams;

  const search = single(params.q)
    .trim()
    .slice(0, 100);

  const rawStatus = single(params.status);

  const selectedStatus: QueueFilter =
    statuses.includes(rawStatus as QueueFilter)
      ? (rawStatus as QueueFilter)
      : "all";

  const sort: SortOrder =
    single(params.sort) === "oldest"
      ? "oldest"
      : "newest";

  const rawSize = Number(single(params.size));

  const size: PageSize = [
    10,
    20,
    50,
    100,
  ].includes(rawSize)
    ? (rawSize as PageSize)
    : 10;

  const rawPage = Number(single(params.page));

  const page =
    Number.isSafeInteger(rawPage) && rawPage > 0
      ? Math.min(rawPage, 100000)
      : 1;

  // Database-side filtering ensures all historical
  // requests remain searchable across pagination.
  let query = supabase
    .from("reservation_requests")
    .select(
      "id, customer_phone, customer_name, reservation_date, reservation_time, party_size, occasion, vip_preference, request_status, details_validated, interruption_reason, interruption_stage, deposit_amount, deposit_status, created_at",
      { count: "exact" },
    );

  if (search) {
    const safeSearch = search
      .replace(/[,%()]/g, " ")
      .trim();

    if (safeSearch) {
      const digits = safeSearch.replace(/\D/g, "");
      const pattern = `%${safeSearch}%`;

      query =
        digits.length >= 3
          ? query.or(
              `customer_name.ilike.${pattern},customer_phone.ilike.%${digits}%`,
            )
          : query.ilike("customer_name", pattern);
    }
  }

  if (selectedStatus === "unvalidated") {
    query = query.or(
      "request_status.eq.unvalidated,and(request_status.eq.incomplete,details_validated.eq.false)",
    );
  } else if (selectedStatus === "incomplete") {
    query = query
      .eq("request_status", "incomplete")
      .eq("details_validated", true);
  } else if (selectedStatus !== "all") {
    query = query.eq(
      "request_status",
      selectedStatus,
    );
  }

  const { data, error, count } = await query
    .order("created_at", {
      ascending: sort === "oldest",
    })
    .order("id", {
      ascending: sort === "oldest",
    })
    .range(
      (page - 1) * size,
      page * size - 1,
    );

  const reservations =
    (data ?? []) as ReservationRequest[];

  const total = count ?? 0;
  const pages = Math.max(1, Math.ceil(total / size));

  const start =
    total === 0 || reservations.length === 0
      ? 0
      : (page - 1) * size + 1;

  const end =
    start === 0
      ? 0
      : start + reservations.length - 1;

  // Summary numbers reflect all accessible records,
  // not just the current page.
  const countStatus = async (
    status: ReservationStatus,
  ) => {
    let countQuery = supabase
      .from("reservation_requests")
      .select("id", {
        count: "exact",
        head: true,
      });

    if (status === "unvalidated") {
      countQuery = countQuery.or(
        "request_status.eq.unvalidated,and(request_status.eq.incomplete,details_validated.eq.false)",
      );
    } else if (status === "incomplete") {
      countQuery = countQuery
        .eq("request_status", "incomplete")
        .eq("details_validated", true);
    } else {
      countQuery = countQuery.eq(
        "request_status",
        status,
      );
    }

    const result = await countQuery;

    return result.error
      ? null
      : (result.count ?? 0);
  };

  const [
    pending,
    incomplete,
    unvalidated,
    confirmed,
    closed,
  ] = await Promise.all([
    countStatus("pending"),
    countStatus("incomplete"),
    countStatus("unvalidated"),
    countStatus("confirmed"),
    countStatus("closed"),
  ]);

  const counts = {
    pending,
    incomplete,
    unvalidated,
    confirmed,
    closed,
  };

  const {
    data: assistanceData,
    error: assistanceError,
  } = await supabase
    .from("reservation_guest_assistance_alerts")
    .select(
      "id, reservation_request_id, twilio_message_sid, alert_status, created_at",
    )
    .in("alert_status", [
      "open",
      "acknowledged",
    ])
    .order("created_at", {
      ascending: false,
    })
    .limit(ALERT_LIMIT);

  const assistanceAlerts =
    (assistanceData ?? []) as GuestAssistanceAlert[];

  // Resolve alert guest names independently from
  // queue pagination and sorting.
  const alertReservationIds = [
    ...new Set(
      assistanceAlerts.map(
        (alert) => alert.reservation_request_id,
      ),
    ),
  ];

  const { data: alertGuestData } =
    alertReservationIds.length > 0
      ? await supabase
          .from("reservation_requests")
          .select(
            "id, customer_phone, customer_name, reservation_date, reservation_time, party_size, occasion, vip_preference, request_status, details_validated, interruption_reason, interruption_stage, deposit_amount, deposit_status, created_at",
          )
          .in("id", alertReservationIds)
      : { data: [] };

  const alertGuests =
    (alertGuestData ?? []) as ReservationRequest[];

  const filtersActive =
    !!search ||
    selectedStatus !== "all" ||
    sort !== "newest" ||
    size !== 10;

  const common = {
    q: search,
    status: selectedStatus,
    sort,
    size,
  };

  // The export intentionally excludes page and size:
  // all matching records are exported.
  const exportQuery = new URLSearchParams({
    q: search,
    status: selectedStatus,
    sort,
  });

  const exportHref =
    `/api/staff/reservations/export?${exportQuery.toString()}`;

  return (
    <main className="w-full flex-1 bg-black px-3 py-6 text-white sm:px-8 sm:py-12">
      <div className="mx-auto max-w-5xl">

        {/*
          The shared Staff Portal layout supplies
          the header, navigation menu, Sign Out,
          and universal footer.
        */}
        <section
          aria-label="Staff portal introduction"
          className="mb-5 border-b border-white/10 pb-5"
        >
          <p className="text-sm leading-6 text-zinc-400">
            Review guest reservations, manage follow-ups,
            and access guest conversations.
          </p>

          <p className="mt-3 text-xs text-zinc-500">
            Authorized role:{" "}
            <span className="font-semibold capitalize text-zinc-300">
              {role.replace(/_/g, " ")}
            </span>
          </p>
        </section>

        {/* Reservation status summary */}
        <section
          aria-label="Reservation summary"
          className="grid grid-cols-3 gap-2 py-6 sm:gap-3 lg:grid-cols-5"
        >
          {(
            [
              "pending",
              "incomplete",
              "unvalidated",
              "confirmed",
              "closed",
            ] as ReservationStatus[]
          ).map((status) => (
            <SummaryCard
              key={status}
              label={
                status.charAt(0).toUpperCase() +
                status.slice(1)
              }
              count={counts[status] ?? 0}
              status={status}
              active={selectedStatus === status}
              href={makeHref({
                ...common,
                status,
                page: 1,
                anchor: true,
              })}
            />
          ))}
        </section>

        {/* Guest assistance alerts */}
        <GuestAssistanceSection
          alerts={assistanceAlerts}
          error={assistanceError?.code ?? null}
          reservations={alertGuests}
        />

        {/* Reservation queue */}
        <section aria-labelledby="staff-queue-heading">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div>
              <h2
                id="staff-queue-heading"
                className="text-xl font-bold text-white"
              >
                Reservation Queue
              </h2>

              <p className="mt-1 text-xs text-zinc-400">
                {error
                  ? "Unable to load reservations"
                  : `${start}–${end} of ${total} reservations`}
              </p>
            </div>

            {/* Existing CSV export functionality */}
            <Link
              href={exportHref}
              prefetch={false}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-white/20 bg-zinc-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:border-[#ea1b24] hover:bg-[#ea1b24]/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              <svg
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 3v12m0 0 4-4m-4 4-4-4M5 17v3h14v-3" />
              </svg>

              DOWNLOAD CSV
            </Link>
          </div>

          {/* Filters and sorting */}
          <form
            action="/staff/reservations"
            method="get"
            className="mb-4 rounded-xl border border-white/10 bg-zinc-950/90 p-3 sm:p-4"
          >
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-[minmax(0,1fr)_150px_135px_105px_auto] sm:items-end">
              <div className="col-span-2 sm:col-span-1">
                <label
                  htmlFor="queue-search"
                  className="mb-1 block text-xs font-semibold text-zinc-300"
                >
                  Search Guests
                </label>

                <input
                  id="queue-search"
                  name="q"
                  type="search"
                  defaultValue={search}
                  maxLength={100}
                  placeholder="Name or phone"
                  className="min-h-11 w-full rounded-lg border border-white/20 bg-black px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:border-[#ea1b24] focus:outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor="queue-status"
                  className="mb-1 block text-xs font-semibold text-zinc-300"
                >
                  Status
                </label>

                <select
                  id="queue-status"
                  name="status"
                  defaultValue={selectedStatus}
                  className="min-h-11 w-full rounded-lg border border-white/20 bg-black px-2 text-sm text-white"
                >
                  {statuses.map((status) => (
                    <option
                      key={status}
                      value={status}
                    >
                      {status === "all"
                        ? "All statuses"
                        : status.charAt(0).toUpperCase() +
                          status.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="queue-sort"
                  className="mb-1 block text-xs font-semibold text-zinc-300"
                >
                  Sort by received
                </label>

                <select
                  id="queue-sort"
                  name="sort"
                  defaultValue={sort}
                  className="min-h-11 w-full rounded-lg border border-white/20 bg-black px-2 text-sm text-white"
                >
                  <option value="newest">
                    Newest first
                  </option>

                  <option value="oldest">
                    Oldest first
                  </option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="queue-size"
                  className="mb-1 block text-xs font-semibold text-zinc-300"
                >
                  Show
                </label>

                <select
                  id="queue-size"
                  name="size"
                  defaultValue={size}
                  className="min-h-11 w-full rounded-lg border border-white/20 bg-black px-2 text-sm text-white"
                >
                  {[10, 20, 50, 100].map((number) => (
                    <option
                      key={number}
                      value={number}
                    >
                      {number} / page
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="min-h-11 rounded-lg bg-[#ea1b24] px-5 py-2 text-sm font-bold text-white transition hover:bg-red-700"
              >
                Apply
              </button>
            </div>

            {filtersActive && (
              <Link
                href="/staff/reservations#staff-queue-heading"
                className="mt-3 inline-block text-xs font-semibold text-zinc-300 underline underline-offset-4 hover:text-white"
              >
                Clear filters
              </Link>
            )}
          </form>

          {/* Queue results */}
          {error ? (
            <div
              role="alert"
              className="rounded-xl border border-[#ea1b24]/30 bg-[#ea1b24]/10 p-6"
            >
              <p className="font-bold">
                Reservation data unavailable
              </p>

              <p className="mt-2 text-sm text-zinc-300">
                Please refresh or contact an
                administrator. Error:{" "}
                {error.code || "Unavailable"}
              </p>
            </div>
          ) : reservations.length === 0 ? (
            <div className="rounded-xl border border-white/10 bg-zinc-950/90 p-8 text-center">
              <p className="font-bold text-white">
                No matching reservations
              </p>

              <p className="mt-2 text-sm text-zinc-400">
                Try a different search, status, or
                page number.
              </p>

              <Link
                href="/staff/reservations#staff-queue-heading"
                className="mt-4 inline-block text-sm text-white underline"
              >
                Reset queue
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {reservations.map((reservation) => (
                <ReservationRow
                  key={reservation.id}
                  reservation={reservation}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {!error && total > 0 && (
            <nav
              aria-label="Reservation pages"
              className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4"
            >
              <p className="text-xs text-zinc-400">
                Page {page} of {pages} · {size} per page
              </p>

              <div className="flex items-center gap-2">
                {page > 1 ? (
                  <Link
                    href={makeHref({
                      ...common,
                      page: page - 1,
                      anchor: true,
                    })}
                    className="inline-flex min-h-10 items-center rounded-lg border border-white/20 px-3 text-sm font-semibold hover:bg-white/10"
                  >
                    ← Previous
                  </Link>
                ) : (
                  <span className="inline-flex min-h-10 items-center rounded-lg border border-white/10 px-3 text-sm text-zinc-600">
                    ← Previous
                  </span>
                )}

                {page < pages ? (
                  <Link
                    href={makeHref({
                      ...common,
                      page: page + 1,
                      anchor: true,
                    })}
                    className="inline-flex min-h-10 items-center rounded-lg border border-white/20 px-3 text-sm font-semibold hover:bg-white/10"
                  >
                    Next →
                  </Link>
                ) : (
                  <span className="inline-flex min-h-10 items-center rounded-lg border border-white/10 px-3 text-sm text-zinc-600">
                    Next →
                  </span>
                )}
              </div>
            </nav>
          )}
        </section>
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
