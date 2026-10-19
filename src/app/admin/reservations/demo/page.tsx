
import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import { notFound } from "next/navigation";
import { requireManager } from "@/lib/auth/require-manager";
import {
  demoReservations,
  demoStatusStyles,
  type DemoReservationStatus,
} from "@/lib/reservations/demo-data";

export const metadata = {
  title: "Reservations Demo | Fin & Feathers Las Vegas",
  description: "Development-only reservation workflow demonstration.",
};

const statusLabels: Record<DemoReservationStatus, string> = {
  pending: "Pending",
  incomplete: "Incomplete",
  unvalidated: "Unvalidated",
  confirmed: "Confirmed",
  closed: "Closed",
};

function StatusBadge({
  status,
}: {
  status: DemoReservationStatus;
}) {
  return (
    <span
      className={`inline-flex w-fit rounded-full border px-3 py-1 text-xs font-semibold ${demoStatusStyles[status]}`}
    >
      {statusLabels[status]}
    </span>
  );
}

function ReservationSummary() {
  const counts = {
    pending: demoReservations.filter(
      (reservation) => reservation.status === "pending"
    ).length,
    incomplete: demoReservations.filter(
      (reservation) => reservation.status === "incomplete"
    ).length,
    unvalidated: demoReservations.filter(
      (reservation) => reservation.status === "unvalidated"
    ).length,
    confirmed: demoReservations.filter(
      (reservation) => reservation.status === "confirmed"
    ).length,
    closed: demoReservations.filter(
      (reservation) => reservation.status === "closed"
    ).length,
  };

  const summary = [
    { label: "Pending", value: counts.pending },
    { label: "Incomplete", value: counts.incomplete },
    { label: "Unvalidated", value: counts.unvalidated },
    { label: "Confirmed", value: counts.confirmed },
    { label: "Closed", value: counts.closed },
  ];

  return (
    <section
      aria-label="Demo reservation summary"
      className="grid grid-cols-2 gap-3 py-7 lg:grid-cols-5"
    >
      {summary.map((item) => (
        <div
          key={item.label}
          className="rounded-xl border border-white/10 bg-zinc-950 p-4 sm:p-5"
        >
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            {item.label}
          </p>

          <p className="mt-3 text-3xl font-bold text-white">
            {item.value}
          </p>
        </div>
      ))}
    </section>
  );
}

function ReservationTable() {
  return (
    <section aria-labelledby="demo-queue-heading">
      <div className="mb-5 border-b border-white/10 pb-4">
        <h2
          id="demo-queue-heading"
          className="text-xl font-bold text-white"
        >
          Reservation Scenarios
        </h2>

        <p className="mt-2 text-sm text-zinc-400">
          {demoReservations.length} fictional reservations for owner
          review. Select a reservation to view its details and mock
          conversation.
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-white/10 bg-zinc-950">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse text-left">
            <thead className="border-b border-white/10 bg-white/[0.04]">
              <tr className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                <th scope="col" className="px-5 py-4">
                  Guest
                </th>

                <th scope="col" className="px-4 py-4">
                  Reservation
                </th>

                <th scope="col" className="px-4 py-4">
                  Party
                </th>

                <th scope="col" className="px-4 py-4">
                  Scenario
                </th>

                <th scope="col" className="px-4 py-4">
                  Status
                </th>

                <th scope="col" className="px-5 py-4 text-right">
                  Details
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/10">
              {demoReservations.map((reservation) => {
                const detailsHref =
                  `/admin/reservations/demo/${encodeURIComponent(
                    reservation.id
                  )}`;

                return (
                  <tr
                    key={reservation.id}
                    className="transition-colors hover:bg-white/[0.04]"
                  >
                    <td className="px-5 py-4">
                      <Link
                        href={detailsHref}
                        className="block rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ea1b24]"
                        aria-label={`View reservation ${reservation.id} for ${reservation.customerName}`}
                      >
                        <span className="block text-sm font-semibold text-white hover:text-[#ff555d]">
                          {reservation.customerName}
                        </span>

                        <span className="mt-1 block text-xs text-zinc-500">
                          {reservation.id}
                        </span>
                      </Link>
                    </td>

                    <td className="px-4 py-4">
                      <span className="block whitespace-nowrap text-sm text-white">
                        {reservation.date}
                      </span>

                      <span className="mt-1 block text-xs text-zinc-400">
                        {reservation.time}
                      </span>
                    </td>

                    <td className="px-4 py-4 text-sm text-white">
                      {reservation.partySize ?? "—"}
                    </td>

                    <td className="px-4 py-4">
                      <span className="text-sm text-zinc-300">
                        {reservation.scenario}
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      <StatusBadge status={reservation.status} />
                    </td>

                    <td className="px-5 py-4 text-right">
                      <Link
                        href={detailsHref}
                        className="inline-flex items-center gap-2 whitespace-nowrap rounded-md border border-white/15 px-3 py-2 text-xs font-semibold text-white transition-colors hover:border-[#ea1b24] hover:bg-[#ea1b24]/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ea1b24]"
                      >
                        View Details
                        <span aria-hidden="true">→</span>
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <p className="mt-3 text-xs text-zinc-500">
        On smaller screens, scroll the table horizontally to view all
        columns.
      </p>
    </section>
  );
}

async function ProtectedDemoDashboard() {
  await connection();

  if (process.env.NODE_ENV !== "development") {
    notFound();
  }

  await requireManager();

  return (
    <main className="min-h-screen bg-black px-3 py-6 text-white sm:px-8 sm:py-12">
      <div className="mx-auto max-w-6xl">
        <header className="border-b border-white/10 pb-6">
          <Link
            href="/admin/reservations"
            className="text-sm text-zinc-400 underline decoration-zinc-700 underline-offset-4 hover:text-white"
          >
            ← Reservations Dashboard
          </Link>

          <p className="mt-6 text-xs font-bold uppercase tracking-widest text-[#ea1b24]">
            Fin &amp; Feathers Las Vegas
          </p>

          <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
            Reservations Workflow Demo
          </h1>

          <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-400">
            Explore fictional reservation scenarios illustrating the
            current Twilio Studio workflow, customer communication,
            and staff review requirements.
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-300">
              Development Only
            </span>

            <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold text-zinc-300">
              Fictional Data · No SMS Sent
            </span>
          </div>
        </header>

        <ReservationSummary />

        <ReservationTable />

        <section className="mt-8 rounded-xl border border-amber-500/20 bg-amber-500/5 p-5">
          <h2 className="text-base font-bold text-white">
            Workflow Demonstration Notes
          </h2>

          <p className="mt-2 text-sm leading-6 text-zinc-300">
            All reservations and customer identities are fictional.
            Automated message templates are based on the reviewed
            Twilio Studio workflow. Sample customer replies and
            staff-handled actions are illustrative and are identified
            as such in the conversation details.
          </p>

          <p className="mt-3 text-sm leading-6 text-zinc-300">
            An automated acknowledgment does not confirm a reservation.
            Staff must review availability and any applicable deposit
            or VIP seating requirements before confirming a request.
          </p>

          <p className="mt-3 text-sm leading-6 text-zinc-300">
            SMS consent disclosures, HELP/STOP handling, campaign
            classification, and final messaging language must be
            reviewed before A2P submission.
          </p>
        </section>

        <footer className="mt-10 border-t border-white/10 pt-5">
          <Link
            href="/admin/reservations"
            className="text-sm text-zinc-400 underline decoration-zinc-700 underline-offset-4 hover:text-white"
          >
            Return to Reservations Dashboard
          </Link>
        </footer>
      </div>
    </main>
  );
}

export default function ReservationsDemoPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-black text-white">
          <p role="status" className="text-sm text-zinc-300">
            Verifying manager access and loading demo...
          </p>
        </main>
      }
    >
      <ProtectedDemoDashboard />
    </Suspense>
  );
}
