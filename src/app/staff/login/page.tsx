import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import StaffLoginForm from "./login-form";

export const metadata: Metadata = {
  title: "Reservations Staff Sign In | Fin & Feathers Las Vegas",
  description:
    "Secure reservation management access for authorized Fin & Feathers staff.",
};

function LoginFormFallback() {
  return (
    <div
      role="status"
      className="py-8 text-center text-sm text-zinc-400"
    >
      Loading secure sign-in...
    </div>
  );
}

export default function StaffLoginPage() {
  return (
    <main className="flex min-h-screen flex-1 items-center justify-center px-5 py-12">
      <section className="w-full max-w-md rounded-2xl border border-white/10 bg-black/90 p-6 shadow-2xl shadow-black/50 sm:p-9">
        <div className="mb-8 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#ea1b24]">
            Fin &amp; Feathers
          </p>

          <h1 className="mt-3 text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Reservations Staff Sign In
          </h1>

          <p className="mt-3 text-sm leading-6 text-zinc-400">
            Sign in with your authorized staff account to review
            reservation requests and complete guest confirmations.
          </p>
        </div>

        <Suspense fallback={<LoginFormFallback />}>
          <StaffLoginForm />
        </Suspense>

        <div className="mt-7 border-t border-white/10 pt-5 text-center">
          <p className="text-xs leading-5 text-zinc-500">
            Access is restricted to authorized reservation staff and
            managers. Staff accounts must be provisioned by an
            administrator.
          </p>

          <Link
            href="/"
            className="mt-5 inline-block text-sm text-zinc-300 underline decoration-zinc-600 underline-offset-4 transition hover:text-white"
          >
            Return to the website
          </Link>
        </div>
      </section>
    </main>
  );
}