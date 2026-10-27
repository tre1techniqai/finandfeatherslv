
import { Suspense } from "react";
import type { Metadata } from "next";
import { connection } from "next/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import twilio from "twilio";

import { requireReservationStaff } from "@/lib/auth/require-reservation-staff";

export const metadata: Metadata = {
  title: "Guest Conversation | Fin & Feathers Las Vegas",
  description: "Read-only guest SMS history for authorized managers.",
};

type PageProps = {
  params: Promise<{ id: string }>;
};

type ConversationMessage = {
  sid: string;
  direction: "inbound" | "outbound";
  body: string;
  status: string;
  dateCreated: string | null;
  dateSent: string | null;
  errorCode: number | null;
};

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const E164_PATTERN = /^\+[1-9]\d{7,14}$/;
const ACCOUNT_SID_PATTERN = /^AC[0-9a-f]{32}$/i;
const MESSAGE_LIMIT_PER_DIRECTION = 100;

function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, "");

  if (digits.length === 11 && digits.startsWith("1")) {
    return `(${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  }

  return value;
}

function formatTimestamp(value: string | null): string {
  if (!value) return "Time unavailable";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Time unavailable";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "America/Los_Angeles",
    timeZoneName: "short",
  }).format(date);
}

function getMessageStatus(message: ConversationMessage): string {
  if (message.direction === "inbound") {
    return "Received";
  }

  switch (message.status) {
    case "delivered":
      return "Delivered";
    case "sent":
      return "Sent";
    case "queued":
    case "accepted":
    case "scheduled":
    case "sending":
      return "Sending";
    case "failed":
    case "undelivered":
      return "Not delivered";
    default:
      return "Status unavailable";
  }
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

async function ProtectedGuestConversation({ params }: PageProps) {
  await connection();

  const { id } = await params;

  if (!UUID_PATTERN.test(id)) {
    notFound();
  }

  const { supabase, role } = await requireReservationStaff();

  const { data: reservation, error: reservationError } = await supabase
    .from("reservation_requests")
    .select("id, customer_name, customer_phone")
    .eq("id", id)
    .maybeSingle();

  if (reservationError) {
    return (
      <main className="flex-1 bg-black px-4 py-10 text-white">
        <div role="alert" className="mx-auto max-w-4xl rounded-xl border border-red-500/30 bg-red-950/20 p-6">
          <h1 className="text-xl font-bold">Guest information unavailable</h1>
          <p className="mt-3 text-sm text-zinc-300">
            The protected reservation lookup failed. No messages were changed.
          </p>
        </div>
      </main>
    );
  }

  if (!reservation) {
    notFound();
  }

  const guestPhone = reservation.customer_phone;

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const restaurantPhone = process.env.TWILIO_FROM_NUMBER;

  let messages: ConversationMessage[] = [];
  let historyMayBeTruncated = false;
  let historyError: string | null = null;

  if (
    typeof guestPhone !== "string" ||
    !E164_PATTERN.test(guestPhone) ||
    !accountSid ||
    !ACCOUNT_SID_PATTERN.test(accountSid) ||
    !authToken ||
    !restaurantPhone ||
    !E164_PATTERN.test(restaurantPhone) ||
    guestPhone === restaurantPhone
  ) {
    historyError = "Guest SMS history is not correctly configured.";
  } else {
    try {
      const client = twilio(accountSid, authToken, {
        autoRetry: false,
      });

      const [inbound, outbound] = await Promise.all([
        client.messages.list({
          from: guestPhone,
          to: restaurantPhone,
          limit: MESSAGE_LIMIT_PER_DIRECTION,
        }),
        client.messages.list({
          from: restaurantPhone,
          to: guestPhone,
          limit: MESSAGE_LIMIT_PER_DIRECTION,
        }),
      ]);

      messages = [
        ...inbound.map((message): ConversationMessage => ({
          sid: message.sid,
          direction: "inbound",
          body: message.body ?? "",
          status: message.status,
          dateCreated: message.dateCreated?.toISOString() ?? null,
          dateSent: message.dateSent?.toISOString() ?? null,
          errorCode: message.errorCode ?? null,
        })),
        ...outbound.map((message): ConversationMessage => ({
          sid: message.sid,
          direction: "outbound",
          body: message.body ?? "",
          status: message.status,
          dateCreated: message.dateCreated?.toISOString() ?? null,
          dateSent: message.dateSent?.toISOString() ?? null,
          errorCode: message.errorCode ?? null,
        })),
      ];

      messages.sort((a, b) => {
        const aTime = a.dateCreated ? Date.parse(a.dateCreated) : 0;
        const bTime = b.dateCreated ? Date.parse(b.dateCreated) : 0;

        return aTime - bTime || a.sid.localeCompare(b.sid);
      });

      historyMayBeTruncated =
        inbound.length === MESSAGE_LIMIT_PER_DIRECTION ||
        outbound.length === MESSAGE_LIMIT_PER_DIRECTION;
    } catch (error) {
      console.error("Read-only guest conversation failed:", {
        category: "STAFF_CONVERSATION_HISTORY_ERROR",
        name: error instanceof Error ? error.name : "UnknownError",
      });

      historyError =
        "Unable to retrieve SMS history from Twilio. Please try again.";
    }
  }

  return (
    <main className="w-full flex-1 bg-black px-3 py-6 text-white sm:px-8 sm:py-12">
      <div className="mx-auto max-w-4xl">
        <nav className="mb-6 flex flex-wrap gap-x-6 gap-y-2 text-sm">
          <Link
            href="/staff/conversations"
            className="text-zinc-300 underline underline-offset-4 hover:text-white"
          >
            ← Conversations
          </Link>

          <Link
            href={`/staff/reservations/${reservation.id}`}
            className="text-zinc-300 underline underline-offset-4 hover:text-white"
          >
            View Reservation Details
          </Link>
        </nav>

        <header className="mb-6 border-b border-white/10 pb-6">
          <p className="text-xs font-bold uppercase tracking-widest text-[#ea1b24]">
            Guest Conversation
          </p>

          <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
            {reservation.customer_name || "Guest name unavailable"}
          </h1>

          <p className="mt-3 text-sm text-zinc-300">
            {formatPhone(guestPhone)}
          </p>

          <p className="mt-2 text-xs text-zinc-500">
            Authorized role: {role.replace(/_/g, " ")}
          </p>
        </header>

        <section className="mb-6 rounded-xl border border-white/15 bg-zinc-950 p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-semibold">SMS Conversation History</h2>

            <span className="rounded-full border border-white/20 px-3 py-1 text-xs text-zinc-300">
              Read Only
            </span>
          </div>

          <p className="mt-2 text-sm leading-6 text-zinc-400">
            This view retrieves messages between the guest phone number
            and the restaurant's configured SMS number. It is not limited
            to messages associated with this reservation.
          </p>

          <p className="mt-2 text-xs text-zinc-500">
            Sending, handoff, and shared-manager controls are not enabled
            in this development stage.
          </p>
        </section>

        {historyError ? (
          <section
            role="alert"
            className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-5"
          >
            <h2 className="font-bold text-amber-100">
              Conversation Unavailable
            </h2>

            <p className="mt-2 text-sm text-amber-200">
              {historyError}
            </p>
          </section>
        ) : (
          <section aria-labelledby="message-history-heading">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2
                id="message-history-heading"
                className="text-lg font-bold"
              >
                Message History
              </h2>

              <span className="text-xs text-zinc-400">
                {messages.length} messages
              </span>
            </div>

            {historyMayBeTruncated && (
              <p className="mb-4 rounded-lg border border-amber-500/30 bg-amber-950/20 p-3 text-xs text-amber-200">
                Older messages may exist outside the history shown here.
              </p>
            )}

            {messages.length === 0 ? (
              <div className="rounded-xl border border-white/10 bg-zinc-950 p-6">
                <p className="font-semibold">No Messages Found</p>

                <p className="mt-2 text-sm text-zinc-400">
                  No SMS messages were returned for this guest and
                  restaurant phone number.
                </p>
              </div>
            ) : (
              <ol
                aria-label="Guest SMS history"
                className="max-h-[650px] space-y-4 overflow-y-auto overscroll-contain rounded-xl border border-white/10 bg-zinc-950/90 p-3 sm:p-5"
              >
                {messages.map((message) => {
                  const incoming = message.direction === "inbound";
                  const failed =
                    !incoming &&
                    (message.status === "failed" ||
                      message.status === "undelivered");

                  return (
                    <li
                      key={message.sid}
                      className={`flex ${
                        incoming ? "justify-end" : "justify-start"
                      }`}
                    >
                      <article
                        className={`min-w-0 max-w-[90%] rounded-xl border p-3 sm:max-w-[80%] sm:p-4 ${
                          incoming
                            ? "border-[#ea1b24]/30 bg-[#ea1b24]/10"
                            : "border-white/10 bg-zinc-900"
                        }`}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <span className="text-xs font-bold">
                            {incoming ? "Guest" : "Fin & Feathers"}
                          </span>

                          <span
                            className={`text-xs ${
                              failed ? "text-amber-300" : "text-zinc-400"
                            }`}
                          >
                            {getMessageStatus(message)}
                          </span>
                        </div>

                        <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-zinc-100">
                          {message.body || "(No text content available)"}
                        </p>

                        <p className="mt-3 text-xs text-zinc-500">
                          {formatTimestamp(
                            message.dateSent ?? message.dateCreated,
                          )}
                        </p>

                        {failed && (
                          <p className="mt-2 text-xs text-amber-200">
                            This message may not have reached the guest.
                            Review its status before sending again.
                          </p>
                        )}
                      </article>
                    </li>
                  );
                })}
              </ol>
            )}
          </section>
        )}

        <nav className="mt-8 border-t border-white/10 pt-5">
          <Link
            href={`/staff/reservations/${reservation.id}`}
            className="inline-flex min-h-11 items-center text-sm font-semibold text-zinc-300 underline underline-offset-4 hover:text-white"
          >
            View Related Reservation →
          </Link>
        </nav>
      </div>
    </main>
  );
}

export default function StaffGuestConversationPage(props: PageProps) {
  return (
    <Suspense fallback={<Loading />}>
      <ProtectedGuestConversation params={props.params} />
    </Suspense>
  );
}
