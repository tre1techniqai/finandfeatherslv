"use client";

import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  signInReservationStaff,
  type StaffLoginState,
} from "./actions";

const initialState: StaffLoginState = {};

function safeStaffRedirect(value: string | null): string {
  if (value === "/staff/reservations") {
    return value;
  }

  if (
    value &&
    /^\/staff\/reservations\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      value,
    )
  ) {
    return value;
  }

  return "/staff/reservations";
}

export default function StaffLoginForm() {
  const searchParams = useSearchParams();
  const nextPath = safeStaffRedirect(searchParams.get("next"));

  const [state, formAction, pending] = useActionState(
    signInReservationStaff,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="next" value={nextPath} />

      <div>
        <label
          htmlFor="staff-email"
          className="mb-2 block text-sm font-medium text-zinc-200"
        >
          Email address
        </label>

        <input
          id="staff-email"
          name="email"
          type="email"
          autoComplete="username"
          required
          maxLength={254}
          disabled={pending}
          className="w-full rounded-lg border border-white/15 bg-black px-4 py-3 text-white outline-none transition placeholder:text-zinc-500 focus:border-[#ea1b24] focus:ring-1 focus:ring-[#ea1b24] disabled:opacity-60"
          placeholder="staff@example.com"
        />
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between gap-3">
          <label
            htmlFor="staff-password"
            className="block text-sm font-medium text-zinc-200"
          >
            Password
          </label>

          <Link
            href="/admin/forgot-password"
            className="text-xs font-medium text-red-400 underline-offset-4 transition hover:text-red-300 hover:underline"
          >
            Forgot Password?
          </Link>
        </div>

        <input
          id="staff-password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          maxLength={128}
          disabled={pending}
          className="w-full rounded-lg border border-white/15 bg-black px-4 py-3 text-white outline-none transition placeholder:text-zinc-500 focus:border-[#ea1b24] focus:ring-1 focus:ring-[#ea1b24] disabled:opacity-60"
          placeholder="Enter your password"
        />
      </div>

      {state.error && (
        <p
          role="alert"
          aria-live="polite"
          className="rounded-lg border border-red-500/30 bg-red-950/40 px-4 py-3 text-sm text-red-200"
        >
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-[#ea1b24] px-5 py-3 font-semibold text-white transition hover:bg-red-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ea1b24] disabled:cursor-wait disabled:opacity-60"
      >
        {pending ? "VERIFYING ACCESS..." : "SIGN IN"}
      </button>
    </form>
  );
}