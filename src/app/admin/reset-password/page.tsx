import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Set New Password | Fin & Feathers Las Vegas",
  description: "Securely update your Fin & Feathers account password.",
};

type ResetPasswordPageProps = {
  searchParams: Promise<{
    error?: string;
    updated?: string;
  }>;
};

async function updatePassword(formData: FormData) {
  "use server";

  const password = formData.get("password");
  const confirmPassword = formData.get("confirmPassword");

  if (
    typeof password !== "string" ||
    typeof confirmPassword !== "string" ||
    password.length < 12 ||
    password.length > 128
  ) {
    redirect("/admin/reset-password?error=invalid-password");
  }

  if (password !== confirmPassword) {
    redirect("/admin/reset-password?error=mismatch");
  }

  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/admin/reset-password?error=session");
  }

  const { error } = await supabase.auth.updateUser({
    password,
  });

  if (error) {
    console.error("Password update failed:", error.code);

    redirect("/admin/reset-password?error=update-failed");
  }

  await supabase.auth.signOut();

  redirect("/admin/reset-password?updated=1");
}

function ResetPasswordLoading() {
  return (
    <main className="flex min-h-screen flex-1 items-center justify-center px-5 py-12">
      <p className="text-sm text-zinc-300" role="status">
        Checking password recovery...
      </p>
    </main>
  );
}

async function ResetPasswordContent({
  searchParams,
}: ResetPasswordPageProps) {
  await connection();

  const params = await searchParams;
  const updated = params.updated === "1";

  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const hasSession = Boolean(user);

  const errorMessages: Record<string, string> = {
    "invalid-link":
      "This recovery link is invalid or has expired. Request a new password reset.",
    "invalid-password":
      "Your password must contain between 12 and 128 characters.",
    mismatch: "The passwords do not match.",
    session:
      "Your recovery session is missing or expired. Request a new password reset.",
    "update-failed":
      "Unable to update your password. Please try again or contact your administrator.",
  };

  const errorMessage = params.error
    ? errorMessages[params.error]
    : undefined;

  return (
    <main className="flex min-h-screen flex-1 items-center justify-center px-5 py-12">
      <section className="w-full max-w-md rounded-2xl border border-white/10 bg-black/90 p-6 shadow-2xl shadow-black/50 sm:p-9">
        <div className="mb-8 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#ea1b24]">
            Fin & Feathers
          </p>

          <h1 className="mt-3 text-2xl font-bold tracking-tight text-white sm:text-3xl">
            {updated ? "Password Updated" : "Set New Password"}
          </h1>

          <p className="mt-3 text-sm leading-6 text-zinc-400">
            {updated
              ? "Your password has been updated. Sign in using your new credentials."
              : "Choose a new password for your account."}
          </p>
        </div>

        {updated ? (
          <Link
            href="/admin/login"
            className="block rounded-lg bg-[#ea1b24] px-5 py-3 text-center font-semibold text-white transition hover:bg-red-700"
          >
            RETURN TO MANAGER SIGN IN
          </Link>
        ) : (
          <>
            {errorMessage && (
              <p
                role="alert"
                className="mb-5 rounded-lg border border-red-500/30 bg-red-950/40 px-4 py-3 text-sm leading-6 text-red-200"
              >
                {errorMessage}
              </p>
            )}

            {hasSession ? (
              <form action={updatePassword} className="space-y-5">
                <div>
                  <label
                    htmlFor="password"
                    className="mb-2 block text-sm font-medium text-zinc-200"
                  >
                    New password
                  </label>

                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    minLength={12}
                    maxLength={128}
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
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    minLength={12}
                    maxLength={128}
                    className="w-full rounded-lg border border-white/15 bg-black px-4 py-3 text-white outline-none transition focus:border-[#ea1b24] focus:ring-1 focus:ring-[#ea1b24]"
                  />
                </div>

                <p className="text-xs leading-5 text-zinc-400">
                  Use at least 12 characters. A unique password is recommended.
                </p>

                <button
                  type="submit"
                  className="w-full rounded-lg bg-[#ea1b24] px-5 py-3 font-semibold text-white transition hover:bg-red-700"
                >
                  UPDATE PASSWORD
                </button>
              </form>
            ) : (
              <div className="space-y-5">
                <p className="rounded-lg border border-white/15 bg-white/5 px-4 py-4 text-sm leading-6 text-zinc-300">
                  No verified recovery session was found. Please request
                  a new password-reset email to continue.
                </p>

                <Link
                  href="/admin/forgot-password"
                  className="block rounded-lg bg-[#ea1b24] px-5 py-3 text-center font-semibold text-white transition hover:bg-red-700"
                >
                  REQUEST NEW RESET LINK
                </Link>
              </div>
            )}
          </>
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

export default function ResetPasswordPage({
  searchParams,
}: ResetPasswordPageProps) {
  return (
    <Suspense fallback={<ResetPasswordLoading />}>
      <ResetPasswordContent searchParams={searchParams} />
    </Suspense>
  );
}