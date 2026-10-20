import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { requireManager } from "@/lib/auth/require-manager";

export const metadata: Metadata = {
  title: "Manager Account Setup | Fin & Feathers Las Vegas",
  description:
    "Securely establish your Fin & Feathers Las Vegas manager account password.",
};

type AcceptInvitePageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

const errorMessages: Record<string, string> = {
  "invalid-password":
    "Your password must contain between 12 and 128 characters.",
  mismatch: "The passwords do not match.",
  "update-failed":
    "Unable to set your password. Please try again or contact your administrator.",
};

async function setupManagerPassword(formData: FormData) {
  "use server";

  // Verify authentication and active manager authorization.
  const { supabase, userId } = await requireManager();

  // Independently verify the current authenticated user.
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user || user.id !== userId) {
    redirect("/admin/login");
  }

  const password = formData.get("password");
  const confirmPassword = formData.get("confirmPassword");

  if (
    typeof password !== "string" ||
    typeof confirmPassword !== "string" ||
    password.length < 12 ||
    password.length > 128
  ) {
    redirect("/admin/accept-invite?error=invalid-password");
  }

  if (password !== confirmPassword) {
    redirect("/admin/accept-invite?error=mismatch");
  }

  // Supabase updates only the authenticated user's password.
  const { error: updateError } = await supabase.auth.updateUser({
    password,
  });

  if (updateError) {
    console.error(
      "Manager account password setup failed:",
      updateError.code,
    );

    redirect("/admin/accept-invite?error=update-failed");
  }

  // End the setup session after successfully updating the password.
  const { error: signOutError } = await supabase.auth.signOut();

  if (signOutError) {
    console.error(
      "Manager sign-out after password setup failed:",
      signOutError.code,
    );
  }

  // Return to the existing manager authentication workflow.
  // No query parameter is used to claim setup success.
  redirect("/admin/login");
}

function AcceptInviteLoading() {
  return (
    <main className="flex min-h-screen flex-1 items-center justify-center px-5 py-12">
      <p className="text-sm text-zinc-300" role="status">
        Checking manager account...
      </p>
    </main>
  );
}

async function AcceptInviteContent({
  searchParams,
}: AcceptInvitePageProps) {
  await connection();

  const params = await searchParams;

  // An authenticated user with active manager authorization
  // can establish or update their own account password.
  const { supabase, userId } = await requireManager();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user || user.id !== userId) {
    redirect("/admin/login");
  }

  const errorMessage = params.error
    ? errorMessages[params.error]
    : undefined;

  return (
    <main className="flex min-h-screen flex-1 items-center justify-center px-5 py-12">
      <section className="w-full max-w-md rounded-2xl border border-white/10 bg-black/90 p-6 shadow-2xl shadow-black/50 sm:p-9">
        <div className="mb-8 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#ea1b24]">
            Fin &amp; Feathers
          </p>

          <h1 className="mt-3 text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Set Manager Password
          </h1>

          <p className="mt-3 text-sm leading-6 text-zinc-400">
            Welcome to the Fin &amp; Feathers management team.
            Create a secure password to complete your account
            setup and access the manager dashboard.
          </p>
        </div>

        {errorMessage && (
          <p
            role="alert"
            className="mb-5 rounded-lg border border-red-500/30 bg-red-950/40 px-4 py-3 text-sm leading-6 text-red-200"
          >
            {errorMessage}
          </p>
        )}

        <form
          action={setupManagerPassword}
          className="space-y-5"
        >
          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-zinc-200"
            >
              Create password
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
              placeholder="Create a secure password"
            />
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="mb-2 block text-sm font-medium text-zinc-200"
            >
              Confirm password
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
              placeholder="Confirm your password"
            />
          </div>

          <div className="rounded-lg border border-white/10 bg-white/5 px-4 py-3">
            <p className="text-xs leading-5 text-zinc-400">
              Password requirements:
            </p>

            <ul className="mt-2 list-disc space-y-1 pl-5 text-xs leading-5 text-zinc-400">
              <li>At least 12 characters</li>
              <li>Maximum 128 characters</li>
              <li>Use a unique password for this account</li>
            </ul>
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-[#ea1b24] px-5 py-3 font-semibold text-white transition hover:bg-red-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ea1b24]"
          >
            SAVE MANAGER PASSWORD
          </button>
        </form>

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

export default function AcceptInvitePage({
  searchParams,
}: AcceptInvitePageProps) {
  return (
    <Suspense fallback={<AcceptInviteLoading />}>
      <AcceptInviteContent searchParams={searchParams} />
    </Suspense>
  );
}