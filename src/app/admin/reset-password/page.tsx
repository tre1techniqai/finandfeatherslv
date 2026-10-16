import { createHmac, timingSafeEqual } from "node:crypto";
import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Set New Password | Fin & Feathers Las Vegas",
  description: "Securely update your Fin & Feathers account password.",
};

const RECOVERY_COOKIE_NAME = "ff_password_recovery";
const RECOVERY_TTL_SECONDS = 15 * 60;

type ResetPasswordPageProps = {
  searchParams: Promise<{
    error?: string;
    updated?: string;
  }>;
};

function verifyRecoveryAuthorization(
  authorization: string | undefined,
  userId: string,
): boolean {
  const secret = process.env.PASSWORD_RECOVERY_SECRET;

  if (!secret || secret.length < 32 || !authorization) {
    return false;
  }

  const parts = authorization.split(".");

  if (parts.length !== 4) {
    return false;
  }

  const [authorizedUserId, expiration, nonce, signature] = parts;

  if (
    authorizedUserId !== userId ||
    !/^\d+$/.test(expiration) ||
    !/^[a-f0-9]{32}$/.test(nonce) ||
    !/^[a-f0-9]{64}$/.test(signature)
  ) {
    return false;
  }

  const expiresAt = Number(expiration);
  const now = Math.floor(Date.now() / 1000);

  if (
    !Number.isSafeInteger(expiresAt) ||
    expiresAt <= now ||
    expiresAt > now + RECOVERY_TTL_SECONDS
  ) {
    return false;
  }

  const payload = `${authorizedUserId}.${expiration}.${nonce}`;

  const expectedSignature = createHmac("sha256", secret)
    .update(payload)
    .digest();

  const providedSignature = Buffer.from(signature, "hex");

  if (expectedSignature.length !== providedSignature.length) {
    return false;
  }

  return timingSafeEqual(expectedSignature, providedSignature);
}

async function hasValidRecoveryAuthorization(
  userId: string,
): Promise<boolean> {
  const cookieStore = await cookies();

  return verifyRecoveryAuthorization(
    cookieStore.get(RECOVERY_COOKIE_NAME)?.value,
    userId,
  );
}

async function updatePassword(formData: FormData) {
  "use server";

  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (
    userError ||
    !user ||
    !(await hasValidRecoveryAuthorization(user.id))
  ) {
    redirect("/admin/reset-password?error=session");
  }

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

  const { error } = await supabase.auth.updateUser({
    password,
  });

  if (error) {
    console.error("Password update failed:", error.code);

    redirect("/admin/reset-password?error=update-failed");
  }

  const cookieStore = await cookies();

  cookieStore.set(RECOVERY_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/admin/reset-password",
    maxAge: 0,
  });

  const { error: signOutError } = await supabase.auth.signOut();

  if (signOutError) {
    console.error(
      "Sign-out after password reset failed:",
      signOutError.code,
    );
  }

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

  const hasRecoveryAuthorization =
    !!user && (await hasValidRecoveryAuthorization(user.id));

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

            {hasRecoveryAuthorization ? (
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
                  No valid recovery authorization was found. Your reset
                  link may have expired, or your recovery session may
                  have ended.
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