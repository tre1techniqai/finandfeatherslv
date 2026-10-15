
"use client";

import { useActionState } from "react";
import { signInManager, type LoginState } from "./actions";

const initialState: LoginState = {};

export default function LoginForm() {
  const [state, formAction, pending] = useActionState(
    signInManager,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-5">
      <div>
        <label
          htmlFor="email"
          className="mb-2 block text-sm font-medium text-zinc-200"
        >
          Email address
        </label>

        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          required
          maxLength={254}
          disabled={pending}
          className="w-full rounded-lg border border-white/15 bg-black px-4 py-3 text-white outline-none transition placeholder:text-zinc-500 focus:border-[#ea1b24] focus:ring-1 focus:ring-[#ea1b24] disabled:opacity-60"
          placeholder="manager@example.com"
        />
      </div>

      <div>
        <label
          htmlFor="password"
          className="mb-2 block text-sm font-medium text-zinc-200"
        >
          Password
        </label>

        <input
          id="password"
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
