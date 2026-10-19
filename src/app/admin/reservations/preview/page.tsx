import { Suspense } from "react";
import { connection } from "next/server";

import { requireManager } from "@/lib/auth/require-manager";
import ReservationActions from "@/components/admin/reservation-actions";
import ReservationHydrationTest from "@/components/admin/reservation-hydration-test";

async function ProtectedReservationActionsPreview() {
  await connection();

  // Never expose this temporary preview in production.

  // Verify the authenticated user's active manager role.
  await requireManager();

  return (
    <main className="min-h-screen bg-black px-4 py-10 text-white sm:px-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-amber-300">
            Development Only
          </p>

          <h1 className="mt-3 text-3xl font-bold">
            Reservation Actions Preview
          </h1>

          <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-400">
            This page uses sample reservation statuses to test the
            manager interface. It does not load or modify reservation
            records, submit API requests, or send notifications.
          </p>
        </div>

        <ReservationHydrationTest />

        <ReservationActions
          requestStatus="pending"
          depositStatus="pending"
          detailsValidated={true}
        />
      </div>
    </main>
  );
}

export default function ReservationActionsPreviewPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-black px-4 py-10 text-white sm:px-6">
          <div className="mx-auto max-w-5xl">
            <p role="status" className="text-sm text-zinc-400">
              Verifying manager access and loading preview...
            </p>
          </div>
        </main>
      }
    >
      <ProtectedReservationActionsPreview />
    </Suspense>
  );
}