
import { Suspense } from "react";
import { connection } from "next/server";
import Link from "next/link";

import { requireReservationStaff } from "@/lib/auth/require-reservation-staff";

export const metadata = {
  title: "Conversations | Fin & Feathers Las Vegas",
  description:
    "Read-only guest conversation directory for authorized managers.",
};

type ReservationRow = {
  id: string;
  customer_name: string | null;
  customer_phone: string;
  reservation_date: string | null;
  request_status: string;
  created_at: string;
};

type GuestGroup = {
  phone: string;
  guestNames: string[];
  reservations: ReservationRow[];
  latestCreatedAt: string;
};

const PAGE_SIZE = 500;
const MAX_RECORDS = 5000;

function normalizePhone(value: string): string | null {
  const digits = value.replace(/\D/g, "");

  if (digits.length === 11 && digits.startsWith("1")) {
    return `+${digits}`;
  }

  if (digits.length === 10) {
    return `+1${digits}`;
  }

  if (/^\+[1-9]\d{7,14}$/.test(value)) {
    return value;
  }

  return null;
}

function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, "");

  if (digits.length === 11 && digits.startsWith("1")) {
    return `(${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  }

  return value;
}

function formatDate(value: string | null): string {
  if (!value) return "Date unavailable";

  const parsed = new Date(`${value}T12:00:00Z`);

  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(parsed);
}

function formatTimestamp(value: string): string {
  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return "Time unavailable";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "America/Los_Angeles",
    timeZoneName: "short",
  }).format(parsed);
}

function Loading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-black px-5 text-white">
      <p role="status" className="text-sm text-zinc-300">
        Verifying staff access and loading conversations...
      </p>
    </main>
  );
}

async function ProtectedConversationsInbox() {
  await connection();

  const { supabase, role } =
    await requireReservationStaff("/staff/conversations");

  const reservations: ReservationRow[] = [];
  let loadError: string | null = null;
  let limitReached = false;

  for (let offset = 0; offset < MAX_RECORDS; offset += PAGE_SIZE) {
    const { data, error } = await supabase
      .from("reservation_requests")
      .select(
        "id, customer_name, customer_phone, reservation_date, request_status, created_at",
      )
      .order("created_at", { ascending: false })
      .order("id", { ascending: false })
      .range(offset, offset + PAGE_SIZE - 1);

    if (error) {
      loadError = error.code || "QUERY_FAILED";
      break;
    }

    const batch = (data ?? []) as ReservationRow[];

    reservations.push(...batch);

    if (batch.length < PAGE_SIZE) {
      break;
    }

    if (reservations.length >= MAX_RECORDS) {
      limitReached = true;
      break;
    }
  }

  const groups = new Map<string, GuestGroup>();
  let skippedRecords = 0;

  if (!loadError) {
    for (const reservation of reservations) {
      const phone = normalizePhone(reservation.customer_phone);

      if (!phone) {
        skippedRecords++;
        continue;
      }

      const existing = groups.get(phone);

      if (!existing) {
        groups.set(phone, {
          phone,
          guestNames: reservation.customer_name?.trim()
            ? [reservation.customer_name.trim()]
            : [],
          reservations: [reservation],
          latestCreatedAt: reservation.created_at,
        });

        continue;
      }

      existing.reservations.push(reservation);

      const name = reservation.customer_name?.trim();

      if (name && !existing.guestNames.includes(name)) {
        existing.guestNames.push(name);
      }
    }
  }

  const conversations = [...groups.values()];

  return (
    <main className="w-full flex-1 bg-black px-3 py-6 text-white sm:px-8 sm:py-12">
      <div className="mx-auto max-w-5xl">
        <section className="mb-6 border-b border-white/10 pb-5">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Guest Conversations
          </h1>

          <p className="mt-3 text-sm leading-6 text-zinc-400">
            Browse reservation-linked guest contacts and review their
            existing SMS conversations.
          </p>

          <p className="mt-3 text-xs text-zinc-500">
            Authorized role:{" "}
            <span className="font-semibold capitalize text-zinc-300">
              {role.replace(/_/g, " ")}
            </span>
          </p>
        </section>

        <section
          aria-label="Conversation directory information"
          className="mb-6 rounded-xl border border-white/15 bg-zinc-950 p-4 sm:p-5"
        >
          <p className="text-sm font-semibold text-white">
            Reservation-Linked Directory
          </p>

          <p className="mt-2 text-sm leading-6 text-zinc-400">
            Entries are grouped by the guest phone number recorded
            on existing reservations. General inquiries without a
            reservation are not included yet.
          </p>

          <p className="mt-2 text-xs text-amber-200">
            Read-only development stage. Sending SMS is not enabled.
          </p>
        </section>

        {loadError ? (
          <section
            role="alert"
            className="rounded-xl border border-red-500/30 bg-red-950/20 p-5"
          >
            <h2 className="font-bold text-white">
              Conversations unavailable
            </h2>

            <p className="mt-2 text-sm text-zinc-300">
              The reservation directory could not be loaded.
              No messages or reservations were changed.
            </p>

            <p className="mt-2 text-xs text-red-200">
              Database error code: {loadError}
            </p>
          </section>
        ) : (
          <section aria-labelledby="conversation-list-heading">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2
                id="conversation-list-heading"
                className="text-lg font-bold"
              >
                Guest Directory
              </h2>

              <span className="rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs font-semibold">
                {conversations.length} guest contacts
              </span>
            </div>

            {limitReached && (
              <p className="mb-4 rounded-lg border border-amber-500/30 bg-amber-950/20 p-3 text-xs text-amber-200">
                This directory is limited to the newest {MAX_RECORDS}
                reservation records. Older guest contacts may not
                appear here.
              </p>
            )}

            {skippedRecords > 0 && (
              <p className="mb-4 text-xs text-zinc-400">
                {skippedRecords} reservation records were excluded
                because their phone numbers could not be normalized.
              </p>
            )}

            {conversations.length === 0 ? (
              <div className="rounded-xl border border-white/10 bg-zinc-950 p-6">
                <p className="font-semibold">
                  No reservation-linked guest contacts found
                </p>

                <p className="mt-2 text-sm text-zinc-400">
                  Contacts will appear when eligible reservation
                  records are available to your staff account.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {conversations.map((guest) => {
                  const referenceReservation = guest.reservations[0];

                  return (
                    <article
                      key={guest.phone}
                      className="rounded-xl border border-white/10 bg-zinc-950/90 p-4 sm:p-5"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="text-base font-bold text-white">
                            {guest.guestNames.length === 1
                              ? guest.guestNames[0]
                              : guest.guestNames.length > 1
                                ? "Multiple reservation names"
                                : "Guest name unavailable"}
                          </h3>

                          <p className="mt-1 text-sm text-zinc-300">
                            {formatPhone(guest.phone)}
                          </p>

                          {guest.guestNames.length > 1 && (
                            <p className="mt-2 text-xs text-zinc-400">
                              Reservation names:{" "}
                              {guest.guestNames.join(", ")}
                            </p>
                          )}
                        </div>

                        <span className="rounded-full border border-white/15 px-3 py-1 text-xs text-zinc-300">
                          {guest.reservations.length}{" "}
                          {guest.reservations.length === 1
                            ? "reservation"
                            : "reservations"}
                        </span>
                      </div>

                      <p className="mt-3 text-xs text-zinc-500">
                        Latest reservation record:{" "}
                        {formatTimestamp(guest.latestCreatedAt)}
                      </p>

                      <div className="mt-4">
                        <Link
                          href={`/staff/conversations/guest/${referenceReservation.id}`}
                          className="inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-[#ea1b24] px-5 py-3 text-sm font-bold text-white transition hover:bg-red-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:w-auto"
                        >
                          OPEN CONVERSATION →
                        </Link>
                      </div>

                      <div className="mt-5 border-t border-white/10 pt-4">
                        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-400">
                          Related Reservations
                        </p>

                        <div className="space-y-2">
                          {guest.reservations.map((reservation) => (
                            <div
                              key={reservation.id}
                              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-white/10 bg-black/30 p-3"
                            >
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-white">
                                  {formatDate(reservation.reservation_date)}
                                </p>

                                <p className="mt-1 text-xs capitalize text-zinc-400">
                                  {reservation.request_status.replace(
                                    /_/g,
                                    " ",
                                  )}
                                </p>
                              </div>

                              <Link
                                href={`/staff/reservations/${reservation.id}`}
                                className="inline-flex min-h-10 items-center rounded-lg border border-white/20 px-3 text-xs font-semibold text-white transition hover:bg-white/10"
                              >
                                VIEW RESERVATION
                              </Link>
                            </div>
                          ))}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        )}

        <nav className="mt-8 border-t border-white/10 pt-5">
          <Link
            href="/staff/reservations"
            className="inline-flex min-h-11 items-center text-sm font-medium text-zinc-300 underline underline-offset-4 hover:text-white"
          >
            ← Return to Reservations
          </Link>
        </nav>
      </div>
    </main>
  );
}

export default function StaffConversationsPage() {
  return (
    <Suspense fallback={<Loading />}>
      <ProtectedConversationsInbox />
    </Suspense>
  );
}
