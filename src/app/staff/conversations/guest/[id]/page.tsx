import { Suspense } from "react";
import type { Metadata } from "next";
import { connection } from "next/server";
import { notFound } from "next/navigation";
import Link from "next/link";

import { requireReservationStaff } from "@/lib/auth/require-reservation-staff";
import GuestConversationWorkspace from "@/components/staff/guest-conversation-workspace";

export const metadata: Metadata = {
  title: "Reservation | Fin & Feathers Las Vegas",
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

function formatGuests(
  value: number | null,
): string {
  if (
    typeof value !== "number" ||
    !Number.isSafeInteger(value) ||
    value < 1
  ) {
    return "Not specified";
  }

  return String(value);
}

function isVip(
  value: string | null,
): boolean {
  return value?.trim().toUpperCase() === "YES";
}

function Loading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-black px-5 text-white">
      <p
        role="status"
        className="text-sm text-zinc-300"
      >
        Verifying staff access and loading reservation...
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
            This reservation conversation is available
            to authorized reservation managers.
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
  "id, customer_name, customer_phone, reservation_date, reservation_time, reservation_reference, party_size, vip_preference",
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

  const reservationReference =
    typeof reservation.reservation_reference === "string" &&
    reservation.reservation_reference.trim().length > 0
      ? reservation.reservation_reference.trim()
      : null;

  const guestCount =
    formatGuests(reservation.party_size);

  const showVipBadge =
    isVip(reservation.vip_preference);

  const reservationDetailsHref =
    `/staff/reservations/${reservation.id}`;

  return (
    <main className="w-full flex-1 bg-black px-3 py-6 text-white sm:px-8 sm:py-12">
      <div className="mx-auto max-w-4xl">
        <nav
          aria-label="Reservation navigation"
          className="mb-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm"
        >
          <Link
            href="/admin/reservations"
            className="inline-flex min-h-11 items-center text-zinc-300 underline underline-offset-4 hover:text-white"
          >
            ← Reservations
          </Link>

          <Link
            href={reservationDetailsHref}
            className="inline-flex min-h-11 items-center text-zinc-300 underline underline-offset-4 hover:text-white"
          >
            Reservation Details
          </Link>
        </nav>

        <header className="mb-6 border-b border-white/10 pb-6">
          <p className="text-xs font-bold uppercase tracking-widest text-[#ea1b24]">
            Fin &amp; Feathers Las Vegas
          </p>

          <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
            Reservation
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

            <p className="mt-2 text-2xl font-bold tracking-wide text-white">
              {reservationReference ?? "Reference unavailable"}
            </p>
          </section>

          <div className="mt-4 flex flex-wrap gap-3 text-xs text-zinc-300">
            <span className="rounded-lg border border-white/15 px-3 py-2">
              Date: {reservationDate}
            </span>

            <span className="rounded-lg border border-white/15 px-3 py-2">
              Time: {reservationTime}
            </span>

            <span className="rounded-lg border border-white/15 px-3 py-2">
              Guests: {guestCount}
            </span>

            {showVipBadge && (
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-amber-400/40 bg-amber-500/10 px-3 py-2 text-xs font-bold text-amber-300">
                <span aria-hidden="true">★</span>
                VIP
              </span>
            )}
          </div>
        </header>

        <GuestConversationWorkspace
          reservationId={reservation.id}
        />

        <nav
          aria-label="Return navigation"
          className="mt-8 border-t border-white/10 pt-5"
        >
          <Link
            href="/admin/reservations"
            className="inline-flex min-h-11 items-center text-sm font-semibold text-zinc-300 underline underline-offset-4 hover:text-white"
          >
            Return to Reservations →
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