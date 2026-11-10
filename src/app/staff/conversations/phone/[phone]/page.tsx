
import { Suspense } from "react";
import type { Metadata } from "next";
import { connection } from "next/server";
import { notFound } from "next/navigation";
import Link from "next/link";

import { requireReservationStaff } from "@/lib/auth/require-reservation-staff";
import PhoneConversationWorkspace from "@/components/staff/phone-conversation-workspace";

export const metadata: Metadata = {
  title: "Phone Conversation | Fin & Feathers Las Vegas",
  description: "Read-only guest phone SMS conversation.",
};

type PageProps = {
  params: Promise<{ phone: string }>;
};

const E164_PATTERN = /^\+[1-9]\d{7,14}$/;

function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, "");

  if (
    digits.length === 11 &&
    digits.startsWith("1")
  ) {
    return `(${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  }

  return value;
}

function Loading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-black px-5 text-white">
      <p role="status" className="text-sm text-zinc-300">
        Verifying staff access and loading conversation...
      </p>
    </main>
  );
}

async function ProtectedPhoneConversation({
  params,
}: PageProps) {
  await connection();

  const { phone: rawPhone } = await params;

    let phone = rawPhone;

    if (!E164_PATTERN.test(phone)) {
    try {
        phone = decodeURIComponent(rawPhone);
    } catch {
        notFound();
    }
    }

    if (!E164_PATTERN.test(phone)) {
    notFound();
    }

  // Staff authorization occurs before any conversation
  // information is displayed or retrieved.
  await requireReservationStaff();

  return (
    <main className="w-full flex-1 bg-black px-3 py-6 text-white sm:px-8 sm:py-12">
      <div className="mx-auto max-w-4xl">
        <nav
          aria-label="Conversation navigation"
          className="mb-6"
        >
          <Link
            href="/staff/conversations"
            className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-zinc-300 underline underline-offset-4 transition hover:text-white"
          >
            <span aria-hidden="true">←</span>
            Return to Guest Conversations
          </Link>
        </nav>

        <header className="mb-6 border-b border-white/10 pb-6">
          <p className="text-xs font-bold uppercase tracking-widest text-[#ea1b24]">
            Fin &amp; Feathers Las Vegas
          </p>

          <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
            Phone Conversation
          </h1>

          <p className="mt-3 text-lg font-semibold text-zinc-200">
            {formatPhone(phone)}
          </p>

          <p className="mt-3 text-sm leading-6 text-zinc-400">
            Review incoming and outgoing SMS messages for
            this phone number. Individual reservations
            retain their own verified conversation histories.
          </p>
        </header>

        <PhoneConversationWorkspace guestPhone={phone} />
      </div>
    </main>
  );
}

export default function StaffPhoneConversationPage(
  props: PageProps,
) {
  return (
    <Suspense fallback={<Loading />}>
      <ProtectedPhoneConversation
        params={props.params}
      />
    </Suspense>
  );
}