
import { Suspense } from "react";
import { connection } from "next/server";
import Link from "next/link";

import { requireReservationStaff } from "@/lib/auth/require-reservation-staff";

export const metadata = {
  title: "Staff Portal | Fin & Feathers Las Vegas",
  description:
    "Secure reservation management portal for authorized Fin & Feathers staff.",
};

function StaffPortalLoading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-black px-5 text-white">
      <p
        className="text-sm text-zinc-300"
        role="status"
      >
        Verifying reservation staff access...
      </p>
    </main>
  );
}

const staffSections = [
  {
    title: "Reservations",
    description:
      "Manage guest reservation requests, review conversations, coordinate booking actions, send confirmations, and track reservation activity.",
    href: "/staff/reservations",
    label: "Open Reservations",
    status: "Available",
  },
];

async function ProtectedStaffDashboard() {
  await connection();
  await requireReservationStaff();

  return (
    <main className="w-full flex-1 bg-black px-3 py-6 text-white sm:px-8 sm:py-12">
      <div className="mx-auto max-w-6xl">
        <section
          aria-labelledby="staff-dashboard-heading"
          className="border-b border-white/10 pb-6"
        >
          <h1
            id="staff-dashboard-heading"
            className="text-2xl font-bold tracking-tight sm:text-4xl"
          >
            Staff Portal
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
            Access your assigned restaurant operations tools
            from one central workspace.
          </p>
        </section>

        <section
          aria-label="Available staff areas"
          className="grid grid-cols-1 gap-4 py-7 md:grid-cols-2"
        >
          {staffSections.map((section) => (
            <Link
              key={section.href}
              href={section.href}
              className="group flex min-h-56 flex-col justify-between rounded-xl border border-white/10 bg-zinc-950/90 p-5 transition hover:border-[#ea1b24]/60 hover:bg-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ea1b24] sm:p-6"
            >
              <div>
                <span className="inline-flex rounded-full border border-white/15 px-3 py-1 text-xs font-semibold text-zinc-300">
                  {section.status}
                </span>

                <h2 className="mt-5 text-xl font-bold text-white sm:text-2xl">
                  {section.title}
                </h2>

                <p className="mt-3 text-sm leading-6 text-zinc-400">
                  {section.description}
                </p>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4">
                <span className="text-sm font-semibold text-white">
                  {section.label}
                </span>

                <span
                  aria-hidden="true"
                  className="text-xl text-[#ea1b24] transition-transform group-hover:translate-x-1"
                >
                  →
                </span>
              </div>
            </Link>
          ))}
        </section>

        <section className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
          <h2 className="text-base font-semibold">
            Reservations Management
          </h2>

          <p className="mt-2 text-sm leading-6 text-zinc-400">
            Review incoming reservation requests,
            communicate with guests, coordinate staff
            follow-ups, and manage booking confirmations
            through the reservations portal.
          </p>
        </section>
      </div>
    </main>
  );
}

export default function StaffDashboardPage() {
  return (
    <Suspense fallback={<StaffPortalLoading />}>
      <ProtectedStaffDashboard />
    </Suspense>
  );
}