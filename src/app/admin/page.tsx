
import { Suspense } from "react";
import { connection } from "next/server";
import Link from "next/link";
import { requireManager } from "@/lib/auth/require-manager";

export const metadata = {
  title: "Admin Dashboard | Fin & Feathers Las Vegas",
  description: "Restricted management dashboard for authorized managers.",
};

function DashboardLoading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-black px-5 text-white">
      <p className="text-sm text-zinc-300" role="status">
        Verifying manager access...
      </p>
    </main>
  );
}

const adminSections = [
  {
    title: "Reservations",
    description:
      "Manage guest reservations, review requests, communicate with guests, and track reservation activity.",
    href: "/staff/reservations",
    label: "Open Reservations",
    status: "Available",
  },
  {
    title: "Menu Management",
    description:
      "Manage menu items, pricing, images, visibility, and display order.",
    href: "/admin/menu",
    label: "Manage Menu",
    status: "Available",
  },
  {
    title: "Gallery Management",
    description:
      "Manage gallery images, categories, visibility, and display order.",
    href: "/admin/gallery",
    label: "Manage Gallery",
    status: "Available",
  },
  {
    title: "SPECIALS Management",
    description:
      "Manage daily promotions, special offers, advertised hours, media, and visibility.",
    href: "/admin/specials",
    label: "Manage SPECIALS",
    status: "Testing",
  },
];

async function ProtectedAdminDashboard() {
  await connection();
  await requireManager();

  return (
    <main className="min-h-screen bg-black px-3 py-6 text-white sm:px-8 sm:py-12">
      <div className="mx-auto max-w-6xl">
        <header className="border-b border-white/10 pb-6">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#ea1b24]">
            Fin &amp; Feathers
          </p>

          <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-4xl">
            Admin Dashboard
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
            Manage restaurant operations from one central workspace.
          </p>
        </header>

        <section
          aria-label="Management areas"
          className="grid grid-cols-1 gap-4 py-7 md:grid-cols-2"
        >
          {adminSections.map((section) => (
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
            Manage incoming reservation requests, review guest
            conversations, coordinate staff follow-ups, and communicate
            with guests through the live reservations messaging system.
          </p>
        </section>

        <footer className="mt-10 border-t border-white/10 pt-5">
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

export default function AdminDashboardPage() {
  return (
    <Suspense fallback={<DashboardLoading />}>
      <ProtectedAdminDashboard />
    </Suspense>
  );
}
