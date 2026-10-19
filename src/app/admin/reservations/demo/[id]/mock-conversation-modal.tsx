
"use client";

import { useEffect, useRef, useState } from "react";
import type { DemoMessage } from "@/lib/reservations/demo-data";

type MockConversationModalProps = {
  reservationId: string;
  customerName: string;
  messages: DemoMessage[];
};

const senderStyles = {
  guest: {
    container: "border-blue-500/25 bg-blue-500/10",
    heading: "text-blue-300",
    label: "Customer",
  },
  chatbot: {
    container: "border-[#ea1b24]/30 bg-[#ea1b24]/10",
    heading: "text-red-300",
    label: "Chatbot",
  },
  staff: {
    container: "border-amber-500/25 bg-amber-500/10",
    heading: "text-amber-300",
    label: "Staff Notification / Action",
  },
};

export default function MockConversationModal({
  reservationId,
  customerName,
  messages,
}: MockConversationModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const triggerButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    closeButtonRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      triggerButtonRef.current?.focus();
    };
  }, [isOpen]);

  return (
    <>
      <button
        ref={triggerButtonRef}
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center justify-center rounded-lg bg-[#ea1b24] px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
      >
        View Mock Conversation
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-3 sm:p-6"
          role="presentation"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="mock-conversation-title"
            aria-describedby="mock-conversation-description"
            className="flex max-h-[90dvh] w-full max-w-3xl flex-col overflow-hidden rounded-xl border border-white/15 bg-zinc-950 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4 border-b border-white/10 p-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#ea1b24]">
                  Fictional SMS Demonstration
                </p>

                <h2
                  id="mock-conversation-title"
                  className="mt-2 text-xl font-bold text-white"
                >
                  {customerName}
                </h2>

                <p
                  id="mock-conversation-description"
                  className="mt-1 text-sm text-zinc-400"
                >
                  {reservationId} · {messages.length} conversation entries
                </p>
              </div>

              <button
                ref={closeButtonRef}
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Close mock conversation"
                className="rounded-lg border border-white/15 px-3 py-2 text-sm font-semibold text-zinc-300 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
              >
                Close ✕
              </button>
            </div>

            <div className="overflow-y-auto overscroll-contain p-4 sm:p-6">
              <div className="mb-5 rounded-lg border border-white/10 bg-black/40 p-4 text-xs leading-5 text-zinc-400">
                <strong className="text-white">
                  Demonstration only.
                </strong>{" "}
                Studio templates represent the reviewed automation.
                Customer replies and staff actions are illustrative.
                No SMS messages are sent from this interface.
              </div>

              <ol className="space-y-4">
                {messages.map((message, index) => {
                  const style = senderStyles[message.sender];

                  return (
                    <li
                      key={`${reservationId}-${index}`}
                      className={`rounded-xl border p-4 ${style.container}`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <p
                            className={`text-xs font-bold uppercase tracking-wide ${style.heading}`}
                          >
                            {message.label}
                          </p>

                          <p className="mt-1 text-xs text-zinc-400">
                            {style.label}
                          </p>
                        </div>

                        <span className="rounded-full border border-white/10 bg-black/30 px-2.5 py-1 text-[11px] font-medium text-zinc-300">
                          {message.source === "studio"
                            ? "Studio Template"
                            : "Illustrative"}
                        </span>
                      </div>

                      <div className="mt-4 whitespace-pre-wrap break-words text-sm leading-6 text-white">
                        {message.text}
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>

            <div className="flex justify-end border-t border-white/10 p-4">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-lg border border-white/20 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
              >
                Close Conversation
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
