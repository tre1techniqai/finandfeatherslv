
import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Reset Manager Password | Fin & Feathers Las Vegas",
  description: "Request a password reset for your manager account.",
};

async function requestPasswordReset(formData: FormData) {
  "use server";

  const emailValue = formData.get("email");

  if (
    typeof emailValue !== "string" ||
    !emailValue.trim() ||
    emailValue.length > 254
  ) {
    redirect("/admin/forgot-password?error=invalid-email");
  }

  const requestHeaders = await headers();
  const host = requestHeaders.get("host");

  const recoveryRedirectUrl =
    host === "localhost:3000"
      ? "http://localhost:3000/auth/recovery"
      : "https://finandfeatherslv.live/auth/recovery";

  const supabase = await createSupabaseServerClient();

  const { error } = await supabase.auth.resetPasswordForEmail(
    emailValue.trim(),
    {
      redirectTo: recoveryRedirectUrl,
    },
  );

  if (error) {
    console.error("Manager password reset request failed:", error.code);

    redirect("/admin/forgot-password?error=request-failed");
  }

  redirect("/admin/forgot-password?sent=1");
}

type ForgotPasswordPageProps = {
  searchParams: Promise<{
    sent?: string;
    error?: string;
  }>;
};

function ForgotPasswordLoading() {
  return (
    <main className="flex min-h-screen flex-1 items-center justify-center px-5 py-12">
      <p className="text-sm text-zinc-300" role="status">
        Loading password recovery...
      </p>
    </main>
  );
}

async function ForgotPasswordContent({
  searchParams,
}: ForgotPasswordPageProps) {
  const params = await searchParams;

  const sent = params.sent === "1";
  const error = params.error;

  return (
    <main className="flex min-h-screen flex-1 items-center justify-center px-5 py-12">
      <section className="w-full max-w-md rounded-2xl border border-white/10 bg-black/90 p-6 shadow-2xl shadow-black/50 sm:p-9">
        <div className="mb-8 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#ea1b24]">
            Fin & Feathers
          </p>

          <h1 className="mt-3 text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Reset Password
          </h1>

          <p className="mt-3 text-sm leading-6 text-zinc-400">
            Enter the email address associated with your manager account.
            We&apos;ll send you instructions to reset your password.
          </p>
        </div>

        {sent ? (
          <div
            role="status"
            className="rounded-lg border border-green-500/30 bg-green-950/30 px-4 py-5 text-sm leading-6 text-green-200"
          >
            If an account exists for that email address, password reset
            instructions will be sent. Please check your inbox and spam
            folder.
          </div>
        ) : (
          <form action={requestPasswordReset} className="space-y-5">
            {error && (
              <p
                role="alert"
                className="rounded-lg border border-red-500/30 bg-red-950/40 px-4 py-3 text-sm text-red-200"
              >
                {error === "invalid-email"
                  ? "Enter a valid email address."
                  : "Unable to process your request right now. Please try again later or contact your administrator."}
              </p>
            )}

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
                autoComplete="email"
                required
                maxLength={254}
                className="w-full rounded-lg border border-white/15 bg-black px-4 py-3 text-white outline-none transition placeholder:text-zinc-500 focus:border-[#ea1b24] focus:ring-1 focus:ring-[#ea1b24]"
                placeholder="manager@example.com"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-lg bg-[#ea1b24] px-5 py-3 font-semibold text-white transition hover:bg-red-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ea1b24]"
            >
              SEND RESET INSTRUCTIONS
            </button>
          </form>
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

export default function ForgotPasswordPage({
  searchParams,
}: ForgotPasswordPageProps) {
  return (
    <Suspense fallback={<ForgotPasswordLoading />}>
      <ForgotPasswordContent searchParams={searchParams} />
    </Suspense>
  );
}
