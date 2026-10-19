
"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type RecoveryStatus =
  | "checking"
  | "ready"
  | "saving"
  | "success"
  | "invalid";

export default function RecoveryPage() {
  const [status, setStatus] = useState<RecoveryStatus>("checking");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const recoveryAuthorized = useRef(false);
  const processing = useRef(false);

  useEffect(() => {
    let mounted = true;

    const url = new URL(window.location.href);
    const fragment = new URLSearchParams(url.hash.slice(1));

    const hasPkceCode = Boolean(url.searchParams.get("code"));

    const hasRecoveryFragment =
      fragment.get("type") === "recovery" &&
      Boolean(fragment.get("access_token"));

    const hasAuthError =
      url.searchParams.has("error") ||
      fragment.has("error");

    if (
      hasAuthError ||
      (!hasPkceCode && !hasRecoveryFragment)
    ) {
      setStatus("invalid");
      return;
    }

    const supabase = createSupabaseBrowserClient();

    // A signed-in user is not sufficient authorization.
    // Only the recovery-specific authentication event may
    // enable the password update form.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;

      if (event === "PASSWORD_RECOVERY" && session?.user) {
        recoveryAuthorized.current = true;
        setStatus("ready");
      }

      if (
        event === "SIGNED_OUT" &&
        !processing.current &&
        !recoveryAuthorized.current
      ) {
        setStatus("invalid");
      }
    });

    // The SSR browser client initializes automatically.
    // Allow its authentication URL processing to complete.
    // Never authorize recovery from an existing session.
    const verificationTimeout = window.setTimeout(() => {
      if (mounted && !recoveryAuthorized.current) {
        setStatus("invalid");
      }
    }, 20000);

    return () => {
      mounted = false;
      window.clearTimeout(verificationTimeout);
      subscription.unsubscribe();
    };
  }, []);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!recoveryAuthorized.current || processing.current) {
      setErrorMessage("Your recovery session is not authorized.");
      return;
    }

    if (password.length < 12 || password.length > 128) {
      setErrorMessage(
        "Your password must contain between 12 and 128 characters.",
      );
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("The passwords do not match.");
      return;
    }

    processing.current = true;
    setStatus("saving");
    setErrorMessage("");

    try {
      const supabase = createSupabaseBrowserClient();

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        recoveryAuthorized.current = false;
        processing.current = false;
        setStatus("invalid");
        return;
      }

      const { error: updateError } =
        await supabase.auth.updateUser({
          password,
        });

      if (updateError) {
        processing.current = false;
        setStatus("ready");
        setErrorMessage(
          "Unable to update your password. Please try again.",
        );
        return;
      }

      recoveryAuthorized.current = false;

      setPassword("");
      setConfirmPassword("");

      const { error: signOutError } =
        await supabase.auth.signOut();

      processing.current = false;
      setStatus("success");

      if (signOutError) {
        setErrorMessage(
          "Your password was updated, but your session could not be closed automatically. Please sign out before using a shared device.",
        );
      }
    } catch {
      processing.current = false;

      if (recoveryAuthorized.current) {
        setStatus("ready");
        setErrorMessage(
          "Unable to complete the request. Please try again.",
        );
      } else {
        setStatus("invalid");
      }
    }
  }

  return (
    <main className="flex min-h-screen flex-1 items-center justify-center px-5 py-12">
      <section className="w-full max-w-md rounded-2xl border border-white/10 bg-black/90 p-6 shadow-2xl shadow-black/50 sm:p-9">
        <div className="mb-8 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#ea1b24]">
            Fin & Feathers
          </p>

          <h1 className="mt-3 text-2xl font-bold tracking-tight text-white sm:text-3xl">
            {status === "success"
              ? "Password Updated"
              : "Set New Password"}
          </h1>

          <p className="mt-3 text-sm leading-6 text-zinc-400">
            {status === "success"
              ? "Your password has been updated. Sign in using your new credentials."
              : "Choose a new password for your manager account."}
          </p>
        </div>

        {status === "checking" && (
          <p
            className="text-center text-sm text-zinc-300"
            role="status"
          >
            Verifying your recovery link...
          </p>
        )}

        {status === "invalid" && (
          <div className="space-y-5">
            <p
              role="alert"
              className="rounded-lg border border-red-500/30 bg-red-950/40 px-4 py-4 text-sm text-red-200"
            >
              This recovery link is invalid or has expired.
              Please request a new password reset.
            </p>

            <Link
              href="/admin/forgot-password"
              className="block rounded-lg bg-[#ea1b24] px-5 py-3 text-center font-semibold text-white"
            >
              REQUEST NEW RESET LINK
            </Link>
          </div>
        )}

        {(status === "ready" || status === "saving") && (
          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            {errorMessage && (
              <p
                role="alert"
                className="rounded-lg border border-red-500/30 bg-red-950/40 px-4 py-3 text-sm text-red-200"
              >
                {errorMessage}
              </p>
            )}

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-zinc-200"
              >
                New password
              </label>

              <input
                id="password"
                type="password"
                autoComplete="new-password"
                required
                minLength={12}
                maxLength={128}
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                disabled={status === "saving"}
                className="w-full rounded-lg border border-white/15 bg-black px-4 py-3 text-white outline-none transition focus:border-[#ea1b24] focus:ring-1 focus:ring-[#ea1b24]"
              />
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-2 block text-sm font-medium text-zinc-200"
              >
                Confirm new password
              </label>

              <input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                minLength={12}
                maxLength={128}
                value={confirmPassword}
                onChange={(event) =>
                  setConfirmPassword(event.target.value)
                }
                disabled={status === "saving"}
                className="w-full rounded-lg border border-white/15 bg-black px-4 py-3 text-white outline-none transition focus:border-[#ea1b24] focus:ring-1 focus:ring-[#ea1b24]"
              />
            </div>

            <p className="text-xs leading-5 text-zinc-400">
              Use at least 12 characters. A unique password is recommended.
            </p>

            <button
              type="submit"
              disabled={status === "saving"}
              className="w-full rounded-lg bg-[#ea1b24] px-5 py-3 font-semibold text-white transition hover:bg-red-700 disabled:cursor-wait disabled:opacity-60"
            >
              {status === "saving"
                ? "UPDATING PASSWORD..."
                : "UPDATE PASSWORD"}
            </button>
          </form>
        )}

        {status === "success" && (
          <div className="space-y-5">
            {errorMessage && (
              <p
                role="alert"
                className="rounded-lg border border-amber-500/30 bg-amber-950/30 px-4 py-3 text-sm text-amber-200"
              >
                {errorMessage}
              </p>
            )}

            <Link
              href="/admin/login"
              className="block rounded-lg bg-[#ea1b24] px-5 py-3 text-center font-semibold text-white"
            >
              RETURN TO MANAGER SIGN IN
            </Link>
          </div>
        )}

        <div className="mt-7 border-t border-white/10 pt-5 text-center">
          <Link
            href="/admin/login"
            className="text-sm text-zinc-300 underline decoration-zinc-600 underline-offset-4 transition hover:text-white"
          >
            Back to Manager Sign In
          </Link>
        </div>
      </section>
    </main>
  );
}
