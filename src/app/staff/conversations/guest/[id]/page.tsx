
import { Suspense } from "react";
import type { Metadata } from "next";
import { connection } from "next/server";
import { notFound } from "next/navigation";
import Link from "next/link";

import { requireReservationStaff } from "@/lib/auth/require-reservation-staff";
import GuestConversationWorkspace from "@/components/staff/guest-conversation-workspace";

export const metadata: Metadata = {
  title: "Guest Conversation | Fin & Feathers Las Vegas",
  description: "Reservation-specific staff SMS conversation.",
};

type PageProps = {
  params: Promise<{ id: string }>;
};

const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, "");

  if (
    digits.length === 11 &&
    digits.startsWith("1")
  ) {
    return `(${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  }

  return value;
}

function formatInternalId(id: string): string {
  return `${id.slice(0, 8).toUpperCase()}...`;
}

// Reservation dates represent Las Vegas calendar dates,
// not UTC instants that should be converted to local time.
function formatReservationDate(
  value: string | null,
): string {
  if (!value) return "Not specified";

  const match =
    /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

  if (!match) return value;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  const date = new Date(
    Date.UTC(year, month - 1, day),
  );

  if (
    Number.isNaN(date.getTime()) ||
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

// Reservation times are stored as local wall-clock
// values in HH:mm:ss format. Do not convert time zones.
function formatReservationTime(
  value: string | null,
): string {
  if (!value) return "Not specified";

  const match =
    /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/.exec(value);

  if (!match) return value;

  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  const seconds = Number(match[3] ?? "0");

  if (
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59 ||
    seconds < 0 ||
    seconds > 59
  ) {
    return value;
  }

  const hour12 = hours % 12 || 12;
  const period = hours >= 12 ? "PM" : "AM";

  return `${hour12}:${String(minutes).padStart(2, "0")} ${period}`;
}

function Loading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-black px-5 text-white">
      <p
        role="status"
        className="text-sm text-zinc-300"
      >
        Verifying staff access and loading conversation...
      </p>
    </main>
  );
}

async function ProtectedGuestConversation({
  params,
}: PageProps) {
  await connection();

  const { id } = await params;

  if (!UUID.test(id)) {
    notFound();
  }

  const { supabase, role } =
    await requireReservationStaff();

  if (role !== "manager") {
    return (
      <main className="flex-1 bg-black px-4 py-10 text-white">
        <div
          role="alert"
          className="mx-auto max-w-4xl rounded-xl border border-red-500/30 bg-red-950/20 p-6"
        >
          <h1 className="text-xl font-bold">
            Manager access required
          </h1>

          <p className="mt-3 text-sm text-zinc-300">
            This conversation is available to authorized
            reservation managers.
          </p>
        </div>
      </main>
    );
  }

  const {
    data: reservation,
    error: reservationError,
  } = await supabase
    .from("reservation_requests")
    .select(
      "id, customer_name, customer_phone, reservation_date, reservation_time",
    )
    .eq("id", id)
    .maybeSingle();

  if (reservationError) {
    return (
      <main className="flex-1 bg-black px-4 py-10 text-white">
        <div
          role="alert"
          className="mx-auto max-w-4xl rounded-xl border border-red-500/30 bg-red-950/20 p-6"
        >
          <h1 className="text-xl font-bold">
            Reservation unavailable
          </h1>

          <p className="mt-3 text-sm text-zinc-300">
            We could not retrieve the selected reservation.
            No messages were changed.
          </p>
        </div>
      </main>
    );
  }

  if (!reservation) {
    notFound();
  }

  const reservationDate =
    formatReservationDate(reservation.reservation_date);

  const reservationTime =
    formatReservationTime(reservation.reservation_time);

  const internalId = formatInternalId(reservation.id);

  // The reservation_reference database column is not yet deployed.
  // Do not generate or infer a reference in the presentation layer.
  // When the migration is approved, retrieve the stored reference
  // from the database and display it here.
  const reservationReference: string | null = null;

  return (
    <main className="w-full flex-1 bg-black px-3 py-6 text-white sm:px-8 sm:py-12">
      <div className="mx-auto max-w-4xl">
        <nav className="mb-6 flex flex-wrap gap-x-6 gap-y-2 text-sm">
          <Link
            href="/staff/conversations"
            className="text-zinc-300 underline underline-offset-4 hover:text-white"
          >
            ← Conversations
          </Link>

          <Link
            href={`/staff/reservations/${reservation.id}`}
            className="text-zinc-300 underline underline-offset-4 hover:text-white"
          >
            View Reservation Details
          </Link>
        </nav>

        <header className="mb-6 border-b border-white/10 pb-6">
          <p className="text-xs font-bold uppercase tracking-widest text-[#ea1b24]">
            Fin & Feathers Las Vegas
          </p>

          <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
            Guest Conversation
          </h1>

          <p className="mt-3 text-xl font-semibold">
            {reservation.customer_name ||
              "Guest name unavailable"}
          </p>

          <p className="mt-2 text-sm text-zinc-300">
            {formatPhone(reservation.customer_phone)}
          </p>

          <section
            aria-label="Reservation identification"
            className="mt-6 rounded-xl border border-white/15 bg-zinc-950 p-4 sm:p-5"
          >
            <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">
              Reservation Reference
            </p>

            {reservationReference ? (
              <p className="mt-2 text-2xl font-bold tracking-wide text-white">
                {reservationReference}
              </p>
            ) : (
              <div className="mt-2">
                <p className="text-lg font-semibold text-zinc-200">
                  Pending assignment
                </p>

                <p className="mt-1 text-xs leading-5 text-zinc-400">
                  Human-readable reservation references
                  have not yet been activated.
                </p>
              </div>
            )}

            <div className="mt-4 border-t border-white/10 pt-3">
              <p className="text-xs text-zinc-400">
                Internal Reservation ID
              </p>

              <p
                title={reservation.id}
                className="mt-1 font-mono text-sm tracking-wide text-zinc-200"
              >
                {internalId}
              </p>
            </div>
          </section>

          <div className="mt-4 flex flex-wrap gap-3 text-xs text-zinc-400">
            <span className="rounded-lg border border-white/15 px-3 py-2">
              Reservation: {reservationDate}
            </span>

            <span className="rounded-lg border border-white/15 px-3 py-2">
              Time: {reservationTime}
            </span>

            <span className="rounded-lg border border-white/15 px-3 py-2">
              Manager Access
            </span>
          </div>
        </header>

        <GuestConversationWorkspace
          reservationId={reservation.id}
        />

        <nav className="mt-8 border-t border-white/10 pt-5">
          <Link
            href={`/staff/reservations/${reservation.id}`}
            className="inline-flex min-h-11 items-center text-sm font-semibold text-zinc-300 underline underline-offset-4 hover:text-white"
          >
            Return to Reservation Details →
          </Link>
        </nav>
      </div>
    </main>
  );
}

export default function StaffGuestConversationPage(
  props: PageProps,
) {
  return (
    <Suspense fallback={<Loading />}>
      <ProtectedGuestConversation
        params={props.params}
      />
    </Suspense>
  );
}