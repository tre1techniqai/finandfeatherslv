

import { Suspense } from "react";
import { connection } from "next/server";
import Link from "next/link";
import { requireManager } from "@/lib/auth/require-manager";
import { signOutManager } from "./actions";


export const metadata = {
  title: "Menu Management | Fin & Feathers Las Vegas",
  description: "Restricted menu management for authorized managers.",
};

function DashboardLoading() {
  return (
    <main className="flex min-h-screen items-center justify-center px-5">
      <p className="text-sm text-zinc-300" role="status">
        Verifying manager access...
      </p>
    </main>
  );
}

async function ProtectedMenuDashboard() {
    await connection();

    await requireManager();

  return (
    <main className="min-h-screen px-5 py-10 text-white sm:px-8 sm:py-14">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-col gap-5 border-b border-white/10 pb-7 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#ea1b24]">
              Fin & Feathers
            </p>

            <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Menu Management
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">
              Manage the restaurant menu from a secure manager workspace.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/menu"
              className="inline-flex items-center justify-center rounded-lg border border-white/15 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white/10"
            >
              View Public Menu
            </Link>

            <form action={signOutManager}>
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-lg bg-[#ea1b24] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
              >
                Sign Out
              </button>
            </form>
          </div>
        </header>

        <section className="py-8">
          <h2 className="text-xl font-semibold">Management Workspace</h2>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-400">
            Your manager-only dashboard foundation is in place. Menu editing,
            item visibility, ordering, and photo management will be connected
            after the database write permissions are secured and tested.
          </p>

          <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <article className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
              <h3 className="font-semibold">Menu Items</h3>
              <p className="mt-2 text-sm leading-6 text-zinc-400">
                Prepare to update names, descriptions, prices, and categories.
              </p>
              <p className="mt-4 text-xs font-medium text-zinc-500">
                Editing not enabled yet
              </p>
            </article>

            <article className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
              <h3 className="font-semibold">Availability & Ordering</h3>
              <p className="mt-2 text-sm leading-6 text-zinc-400">
                Prepare to control item visibility, featured flags, and display
                order.
              </p>
              <p className="mt-4 text-xs font-medium text-zinc-500">
                Editing not enabled yet
              </p>
            </article>

            <article className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
              <h3 className="font-semibold">Menu Photography</h3>
              <p className="mt-2 text-sm leading-6 text-zinc-400">
                Prepare to upload and manage menu photos in a dedicated storage
                location.
              </p>
              <p className="mt-4 text-xs font-medium text-zinc-500">
                Uploads not enabled yet
              </p>
            </article>
          </div>
        </section>

        <footer className="border-t border-white/10 pt-5">
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

export default function AdminMenuPage() {
  return (
    <Suspense fallback={<DashboardLoading />}>
      <ProtectedMenuDashboard />
    </Suspense>
  );
}
