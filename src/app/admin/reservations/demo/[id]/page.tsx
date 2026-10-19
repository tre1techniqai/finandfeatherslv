
import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import { notFound } from "next/navigation";

import { requireManager } from "@/lib/auth/require-manager";
import {
  getDemoReservation,
  demoStatusStyles,
  type DemoReservation,
  type DemoReservationStatus,
} from "@/lib/reservations/demo-data";
import MockConversationModal from "./mock-conversation-modal";

type PageProps = {
  params: Promise<{ id: string }>;
};

const statusLabels: Record<DemoReservationStatus, string> = {
  pending: "Pending",
  incomplete: "Incomplete",
  unvalidated: "Unvalidated",
  confirmed: "Confirmed",
  closed: "Closed",
};

function DetailField({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-lg border border-white/10 bg-black/40 p-4">
      <dt className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
        {label}
      </dt>

      <dd className="mt-2 break-words text-sm font-medium text-white">
        {value}
      </dd>
    </div>
  );
}

function ReservationInformation({
  reservation,
}: {
  reservation: DemoReservation;
}) {
  return (
    <section aria-labelledby="reservation-information-heading">
      <h2
        id="reservation-information-heading"
        className="mb-4 text-xl font-bold text-white"
      >
        Reservation Information
      </h2>

      <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <DetailField
          label="Guest Name"
          value={reservation.customerName}
        />

        <DetailField
          label="Phone Number"
          value={reservation.phone}
        />

        <DetailField
          label="Reservation Date"
          value={reservation.date}
        />

        <DetailField
          label="Reservation Time"
          value={reservation.time}
        />

        <DetailField
          label="Party Size"
          value={reservation.partySize ?? "Not validated"}
        />

        <DetailField
          label="Occasion"
          value={reservation.occasion}
        />
      </dl>
    </section>
  );
}

function ReservationRequirements({
  reservation,
}: {
  reservation: DemoReservation;
}) {
  return (
    <section
      aria-labelledby="reservation-requirements-heading"
      className="mt-8"
    >
      <h2
        id="reservation-requirements-heading"
        className="mb-4 text-xl font-bold text-white"
      >
        Deposit &amp; Seating Requirements
      </h2>

      <dl className="grid gap-3 sm:grid-cols-2">
        <DetailField
          label="Deposit Requirement"
          value={reservation.deposit}
        />

        <DetailField
          label="Deposit Status"
          value={reservation.depositStatus}
        />

        <DetailField
          label="Email Address"
          value={reservation.email}
        />

        <DetailField
          label="VIP Seating Preference"
          value={reservation.vipPreference}
        />
      </dl>

      <p className="mt-4 text-xs leading-5 text-zinc-500">
        Deposit verification and VIP seating availability require
        staff review. A VIP request does not guarantee VIP seating.
      </p>
    </section>
  );
}

function StaffNotes({
  reservation,
}: {
  reservation: DemoReservation;
}) {
  return (
    <section
      aria-labelledby="staff-notes-heading"
      className="mt-8 rounded-xl border border-white/10 bg-zinc-950 p-5"
    >
      <h2
        id="staff-notes-heading"
        className="text-xl font-bold text-white"
      >
        Staff Notes
      </h2>

      <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-zinc-300">
        {reservation.staffNotes}
      </p>
    </section>
  );
}

async function ProtectedReservationDetail({
  id,
}: {
  id: string;
}) {
  await connection();

  if (process.env.NODE_ENV !== "development") {
    notFound();
  }

  await requireManager();

  const reservation = getDemoReservation(id);

  if (!reservation) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-black px-3 py-6 text-white sm:px-8 sm:py-12">
      <div className="mx-auto max-w-5xl">
        <header className="border-b border-white/10 pb-7">
          <Link
            href="/admin/reservations/demo"
            className="text-sm text-zinc-400 underline decoration-zinc-700 underline-offset-4 hover:text-white"
          >
            ← Back to Reservation Scenarios
          </Link>

          <p className="mt-6 text-xs font-bold uppercase tracking-widest text-[#ea1b24]">
            Fin &amp; Feathers Las Vegas
          </p>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold sm:text-4xl">
                {reservation.customerName}
              </h1>

              <p className="mt-2 text-sm text-zinc-400">
                {reservation.id} · {reservation.scenario}
              </p>
            </div>

            <span
              className={`inline-flex rounded-full border px-4 py-2 text-xs font-semibold ${demoStatusStyles[reservation.status]}`}
            >
              {statusLabels[reservation.status]}
            </span>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-300">
              Development Only
            </span>

            <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold text-zinc-300">
              Fictional Reservation
            </span>
          </div>
        </header>

        <div className="mt-8">
          <ReservationInformation reservation={reservation} />

          <ReservationRequirements reservation={reservation} />

          <StaffNotes reservation={reservation} />
        </div>

        <section className="mt-8 rounded-xl border border-[#ea1b24]/30 bg-zinc-950 p-5 sm:p-6">
          <h2 className="text-xl font-bold text-white">
            Mock SMS Conversation
          </h2>

          <p className="mt-2 text-sm leading-6 text-zinc-400">
            Review the fictional customer interaction and the
            automated message templates associated with this
            reservation scenario.
          </p>

          <div className="mt-5">
            <MockConversationModal
              reservationId={reservation.id}
              customerName={reservation.customerName}
              messages={reservation.messages}
            />
          </div>
        </section>

        <footer className="mt-10 border-t border-white/10 pt-5">
          <Link
            href="/admin/reservations/demo"
            className="text-sm text-zinc-400 underline decoration-zinc-700 underline-offset-4 hover:text-white"
          >
            Return to Reservation Scenarios
          </Link>
        </footer>
      </div>
    </main>
  );
}

async function ReservationDetailContent({
  params,
}: PageProps) {
  const { id } = await params;

  return <ProtectedReservationDetail id={id} />;
}

export default function ReservationDemoDetailPage({
  params,
}: PageProps) {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-black text-white">
          <p role="status" className="text-sm text-zinc-300">
            Verifying manager access and loading reservation...
          </p>
        </main>
      }
    >
      <ReservationDetailContent params={params} />
    </Suspense>
  );
}
