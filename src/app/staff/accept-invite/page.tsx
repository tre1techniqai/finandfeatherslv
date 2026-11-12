import { createHmac, timingSafeEqual } from "node:crypto";
import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Staff Account Setup | Fin & Feathers Las Vegas",
  description: "Create a password for your Fin & Feathers staff account.",
};

const INVITE_COOKIE_NAME = "ff_staff_invite_setup";
const INVITE_TTL_SECONDS = 30 * 60;
const INVITE_PURPOSE = "staff-invite-setup";

function validInviteAuthorization(
  value: string | undefined,
  userId: string,
): boolean {
  const secret = process.env.PASSWORD_RECOVERY_SECRET;
  if (!secret || secret.length < 32 || !value) return false;

  const parts = value.split(".");
  if (parts.length !== 5) return false;

  const [purpose, authorizedUserId, expiration, nonce, signature] = parts;
  if (
    purpose !== INVITE_PURPOSE ||
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
    expiresAt > now + INVITE_TTL_SECONDS
  ) {
    return false;
  }

  const payload = `${purpose}.${authorizedUserId}.${expiration}.${nonce}`;
  const expected = createHmac("sha256", secret).update(payload).digest();
  const provided = Buffer.from(signature, "hex");

  return expected.length === provided.length && timingSafeEqual(expected, provided);
}

async function requireInvitedAgent() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) redirect("/staff/login");

  const { data: staffRole, error: roleError } = await supabase
    .from("staff_roles")
    .select("role, is_active")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .maybeSingle();

  if (
    roleError ||
    staffRole?.is_active !== true ||
    staffRole.role !== "reservation_agent"
  ) {
    redirect("/staff/login?error=unauthorized");
  }

  const cookieStore = await cookies();
  if (
    !validInviteAuthorization(
      cookieStore.get(INVITE_COOKIE_NAME)?.value,
      user.id,
    )
  ) {
    redirect("/staff/login?error=invalid-invite");
  }

  return { supabase };
}

async function setupStaffPassword(formData: FormData) {
  "use server";

  const { supabase } = await requireInvitedAgent();
  const password = formData.get("password");
  const confirmation = formData.get("confirmPassword");

  if (
    typeof password !== "string" ||
    password.length < 12 ||
    password.length > 128
  ) {
    redirect("/staff/accept-invite?error=invalid-password");
  }

  if (password !== confirmation) {
    redirect("/staff/accept-invite?error=mismatch");
  }

  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    console.error("Staff password setup failed:", error.code);
    redirect("/staff/accept-invite?error=update-failed");
  }

  const cookieStore = await cookies();
  cookieStore.set(INVITE_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/staff/accept-invite",
    maxAge: 0,
  });

  const { error: signOutError } = await supabase.auth.signOut();
  if (signOutError) {
    console.error("Staff setup sign-out failed:", signOutError.code);
  }

  redirect("/staff/login");
}

type PageProps = {
  searchParams: Promise<{ error?: string }>;
};

const errorMessages: Record<string, string> = {
  "invalid-password": "Your password must contain between 12 and 128 characters.",
  mismatch: "The passwords do not match.",
  "update-failed": "Unable to set your password. Please try again.",
};

async function SetupContent({ searchParams }: PageProps) {
  await connection();
  await requireInvitedAgent();
  const params = await searchParams;
  const message = params.error ? errorMessages[params.error] : undefined;

  return (
    <main className="flex min-h-screen flex-1 items-center justify-center px-5 py-12">
      <section className="w-full max-w-md rounded-2xl border border-white/10 bg-black/90 p-6 shadow-2xl shadow-black/50 sm:p-9">
        <div className="mb-8 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#ea1b24]">
            Fin &amp; Feathers
          </p>
          <h1 className="mt-3 text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Set Staff Password
          </h1>
          <p className="mt-3 text-sm leading-6 text-zinc-400">
            Create your password to complete your reservation staff account setup.
          </p>
        </div>

        {message && (
          <p role="alert" className="mb-5 rounded-lg border border-red-500/30 bg-red-950/40 px-4 py-3 text-sm leading-6 text-red-200">
            {message}
          </p>
        )}

        <form action={setupStaffPassword} className="space-y-5">
          <div>
            <label htmlFor="password" className="mb-2 block text-sm font-medium text-zinc-200">
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
              className="w-full rounded-lg border border-white/15 bg-black px-4 py-3 text-white outline-none transition focus:border-[#ea1b24]"
            />
          </div>
          <div>
            <label htmlFor="confirmPassword" className="mb-2 block text-sm font-medium text-zinc-200">
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
              className="w-full rounded-lg border border-white/15 bg-black px-4 py-3 text-white outline-none transition focus:border-[#ea1b24]"
            />
          </div>
          <p className="text-xs text-zinc-400">
            Use a unique password containing 12–128 characters.
          </p>
          <button
            type="submit"
            className="w-full rounded-lg bg-[#ea1b24] px-5 py-3 font-semibold text-white transition hover:bg-red-700"
          >
            SAVE STAFF PASSWORD
          </button>
        </form>

        <div className="mt-7 border-t border-white/10 pt-5 text-center">
          <Link href="/staff/login" className="text-sm text-zinc-300 underline decoration-zinc-600 underline-offset-4 hover:text-white">
            Back to Staff Sign In
          </Link>
        </div>
      </section>
    </main>
  );
}

export default function StaffAcceptInvitePage(props: PageProps) {
  return (
    <Suspense fallback={<main className="p-8 text-center text-sm text-zinc-300">Checking staff invitation...</main>}>
      <SetupContent {...props} />
    </Suspense>
  );
}