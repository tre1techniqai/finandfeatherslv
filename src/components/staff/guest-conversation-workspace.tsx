"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

type ConversationMessage = {
  sid: string;
  direction: "inbound" | "outbound";
  body: string;
  status: string;
  dateCreated: string | null;
  dateSent: string | null;
  errorCode: number | null;
};

type HistoryResponse = {
  success: boolean;
  reservationId?: string;
  messages?: ConversationMessage[];
  count?: number;
  hasMore?: boolean;
  nextCursor?: string | null;
  historicalCoverageComplete?: boolean;
  error?: string;
};

type Props = {
  reservationId: string;
};

const PAGE_SIZE = 10;
const MAX_MESSAGE_LENGTH = 1600;

function messageTimestamp(message: ConversationMessage) {
  const value = message.dateSent ?? message.dateCreated;

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

function messageStatus(message: ConversationMessage) {
  if (message.direction === "inbound") {
    return "Received";
  }

  switch (message.status) {
    case "delivered":
      return "Delivered";
    case "sent":
      return "Sent";
    case "accepted":
    case "queued":
    case "sending":
    case "scheduled":
      return "Sending";
    case "failed":
    case "undelivered":
      return "Not delivered";
    default:
      return "Status unavailable";
  }
}

function validMessage(value: unknown): value is ConversationMessage {
  if (
    !value ||
    typeof value !== "object" ||
    Array.isArray(value)
  ) {
    return false;
  }

  const row = value as Record<string, unknown>;

  return (
    typeof row.sid === "string" &&
    (row.direction === "inbound" ||
      row.direction === "outbound") &&
    typeof row.body === "string" &&
    typeof row.status === "string" &&
    (row.dateCreated === null ||
      typeof row.dateCreated === "string") &&
    (row.dateSent === null ||
      typeof row.dateSent === "string") &&
    (row.errorCode === null ||
      typeof row.errorCode === "number")
  );
}

function validHistory(
  value: unknown,
  reservationId: string,
): value is HistoryResponse & {
  success: true;
  messages: ConversationMessage[];
  hasMore: boolean;
  nextCursor: string | null;
} {
  if (!value || typeof value !== "object") {
    return false;
  }

  const result = value as HistoryResponse;

  return (
    result.success === true &&
    result.reservationId === reservationId &&
    Array.isArray(result.messages) &&
    result.messages.length <= PAGE_SIZE &&
    result.messages.every(validMessage) &&
    typeof result.hasMore === "boolean" &&
    (result.nextCursor === null ||
      typeof result.nextCursor === "string") &&
    (!result.hasMore ||
      (typeof result.nextCursor === "string" &&
        result.nextCursor.length > 0))
  );
}

function mergeMessages(
  older: ConversationMessage[],
  existing: ConversationMessage[],
) {
  const seen = new Set<string>();
  const merged: ConversationMessage[] = [];

  for (const message of [...older, ...existing]) {
    if (seen.has(message.sid)) continue;

    seen.add(message.sid);
    merged.push(message);
  }

  return merged;
}

export default function GuestConversationWorkspace({
  reservationId,
}: Props) {
  const [messages, setMessages] = useState<
    ConversationMessage[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [error, setError] = useState("");
  const [olderError, setOlderError] = useState("");

  const [hasMore, setHasMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<
    string | null
  >(null);

  const [messageDraft, setMessageDraft] = useState("");

  const [coverageComplete, setCoverageComplete] =
    useState(false);

  const scrollRef = useRef<HTMLOListElement>(null);
  const loadOlderGuardRef = useRef(false);
  const initialScrollRef = useRef(false);
  const activeRequestRef = useRef<AbortController | null>(null);

  const historyUrl = useCallback(
    (cursor?: string | null) => {
      const base =
        `/api/staff/reservations/` +
        `${encodeURIComponent(reservationId)}` +
        `/conversation/scoped-history`;

      if (!cursor) return base;

      return `${base}?cursor=${encodeURIComponent(cursor)}`;
    },
    [reservationId],
  );

  const fetchHistory = useCallback(
    async (
      cursor: string | null,
      signal: AbortSignal,
    ) => {
      const response = await fetch(
        historyUrl(cursor),
        {
          method: "GET",
          credentials: "same-origin",
          cache: "no-store",
          signal,
        },
      );

      const payload: unknown = await response.json();

      if (
        !response.ok ||
        !validHistory(payload, reservationId)
      ) {
        const detail =
          typeof payload === "object" &&
          payload !== null &&
          "error" in payload &&
          typeof payload.error === "string"
            ? payload.error
            : "Unable to load this reservation's messages.";

        throw new Error(detail);
      }

      return payload;
    },
    [historyUrl, reservationId],
  );

  const loadInitial = useCallback(async () => {
    activeRequestRef.current?.abort();

    const controller = new AbortController();
    activeRequestRef.current = controller;

    setLoading(true);
    setError("");
    setOlderError("");
    setMessages([]);
    setHasMore(false);
    setNextCursor(null);
    setCoverageComplete(false);
    initialScrollRef.current = false;

    try {
      const payload = await fetchHistory(
        null,
        controller.signal,
      );

      if (controller.signal.aborted) return;

      setMessages(payload.messages);
      setHasMore(payload.hasMore);
      setNextCursor(payload.nextCursor);
      setCoverageComplete(
        payload.historicalCoverageComplete === true,
      );

      initialScrollRef.current = true;
    } catch (caught) {
      if (controller.signal.aborted) return;

      setError(
        caught instanceof Error
          ? caught.message
          : "Conversation history is unavailable.",
      );
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
      }
    }
  }, [fetchHistory]);

  useEffect(() => {
    void loadInitial();

    return () => {
      activeRequestRef.current?.abort();
    };
  }, [loadInitial]);

  useEffect(() => {
    if (
      loading ||
      !initialScrollRef.current ||
      !scrollRef.current
    ) {
      return;
    }

    const container = scrollRef.current;
    container.scrollTop = container.scrollHeight;

    initialScrollRef.current = false;
  }, [loading, messages]);

  const loadOlder = useCallback(async () => {
    if (
      loading ||
      loadingOlder ||
      loadOlderGuardRef.current ||
      !hasMore ||
      !nextCursor
    ) {
      return;
    }

    const container = scrollRef.current;

    if (!container) return;

    loadOlderGuardRef.current = true;
    setLoadingOlder(true);
    setOlderError("");

    const previousHeight = container.scrollHeight;
    const previousTop = container.scrollTop;

    const controller = new AbortController();
    activeRequestRef.current = controller;

    try {
      const payload = await fetchHistory(
        nextCursor,
        controller.signal,
      );

      if (controller.signal.aborted) return;

      setMessages((existing) =>
        mergeMessages(payload.messages, existing),
      );

      setHasMore(payload.hasMore);
      setNextCursor(payload.nextCursor);

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (!scrollRef.current) return;

          scrollRef.current.scrollTop =
            previousTop +
            scrollRef.current.scrollHeight -
            previousHeight;
        });
      });
    } catch (caught) {
      if (!controller.signal.aborted) {
        setOlderError(
          caught instanceof Error
            ? caught.message
            : "Unable to load older messages.",
        );
      }
    } finally {
      loadOlderGuardRef.current = false;

      if (!controller.signal.aborted) {
        setLoadingOlder(false);
      }
    }
  }, [
    loading,
    loadingOlder,
    hasMore,
    nextCursor,
    fetchHistory,
  ]);

  function onHistoryScroll() {
    const container = scrollRef.current;

    if (
      !container ||
      container.scrollTop > 90 ||
      loading ||
      loadingOlder ||
      !hasMore
    ) {
      return;
    }

    void loadOlder();
  }

  return (
    <div className="space-y-5">
      <section className="rounded-xl border border-white/15 bg-zinc-950 p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold">
              Guest Conversation
            </h2>

            <p className="mt-1 text-sm text-zinc-400">
              Messages associated with this reservation.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void loadInitial()}
            disabled={loading || loadingOlder}
            className="min-h-11 rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Loading..." : "Refresh Messages"}
          </button>
        </div>

        {!coverageComplete && !loading && !error && (
          <p className="mt-4 rounded-lg border border-amber-500/25 bg-amber-950/15 p-3 text-xs leading-5 text-amber-200">
            Historical coverage is incomplete. Only messages
            with a verified reservation association are shown.
            Messages from other reservations are excluded.
          </p>
        )}
      </section>

      <section
        aria-labelledby="guest-message-history-heading"
        className="rounded-xl border border-white/15 bg-zinc-950 p-3 sm:p-5"
      >
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h3
            id="guest-message-history-heading"
            className="font-semibold"
          >
            Message History
          </h3>

          <span className="text-xs text-zinc-400">
            {messages.length} loaded
          </span>
        </div>

        {error && (
          <div
            role="alert"
            className="mb-4 rounded-lg border border-red-500/30 bg-red-950/20 p-4 text-sm text-red-200"
          >
            {error}
          </div>
        )}

        {loading ? (
          <div
            role="status"
            className="py-14 text-center text-sm text-zinc-400"
          >
            Loading this reservation&apos;s messages...
          </div>
        ) : error ? null : (
          <>
            {hasMore && (
              <p className="mb-3 text-center text-xs text-zinc-400">
                Scroll upward to load 10 older messages.
              </p>
            )}

            {olderError && (
              <div
                role="alert"
                className="mb-3 rounded-lg border border-amber-500/30 p-3 text-sm text-amber-200"
              >
                <p>{olderError}</p>

                <button
                  type="button"
                  onClick={() => void loadOlder()}
                  className="mt-2 font-semibold underline underline-offset-4"
                >
                  Retry loading older messages
                </button>
              </div>
            )}

            <ol
              ref={scrollRef}
              onScroll={onHistoryScroll}
              aria-label="Reservation SMS messages"
              className="h-[520px] space-y-4 overflow-y-auto overscroll-contain rounded-lg border border-white/10 bg-black/40 p-3 sm:h-[600px] sm:p-4"
            >
              {loadingOlder && (
                <li
                  role="status"
                  className="text-center text-xs text-zinc-400"
                >
                  Loading older messages...
                </li>
              )}

              {!hasMore && messages.length > 0 && (
                <li className="pb-2 text-center text-xs text-zinc-500">
                  Beginning of verified history
                </li>
              )}

              {messages.length === 0 && (
                <li className="py-20 text-center">
                  <p className="font-semibold text-white">
                    No verified messages found
                  </p>

                  <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-zinc-400">
                    This reservation has no messages with
                    verified associations in the current
                    history sources.
                  </p>
                </li>
              )}

              {messages.map((message) => {
                const incoming =
                  message.direction === "inbound";

                const failed =
                  !incoming &&
                  (message.status === "failed" ||
                    message.status === "undelivered");

                return (
                  <li
                    key={message.sid}
                    className={`flex ${
                      incoming
                        ? "justify-start"
                        : "justify-end"
                    }`}
                  >
                    <article
                      className={`min-w-0 max-w-[90%] rounded-xl border p-3 sm:max-w-[80%] sm:p-4 ${
                        incoming
                          ? "border-white/15 bg-zinc-900"
                          : "border-[#ea1b24]/35 bg-[#ea1b24]/10"
                      }`}
                    >
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
                        <span className="font-bold text-white">
                          {incoming
                            ? "Guest"
                            : "Fin & Feathers"}
                        </span>

                        <span
                          className={
                            failed
                              ? "text-amber-300"
                              : "text-zinc-400"
                          }
                        >
                          {messageStatus(message)}
                        </span>
                      </div>

                      <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-zinc-100">
                        {message.body ||
                          "(No text content available)"}
                      </p>

                      <p className="mt-3 text-xs text-zinc-500">
                        {messageTimestamp(message)}
                      </p>

                      {failed && (
                        <p className="mt-2 text-xs text-amber-200">
                          This message may not have reached
                          the guest.
                        </p>
                      )}
                    </article>
                  </li>
                );
              })}
            </ol>
          </>
        )}
      </section>

      <section className="rounded-xl border border-white/15 bg-zinc-950 p-4 sm:p-5">
        <div className="mb-4">
          <h3 className="text-lg font-bold">
            Message Guest
          </h3>

          <p className="mt-1 text-sm text-zinc-400">
            Compose a reservation-specific SMS message.
          </p>
        </div>

        <label
          htmlFor="guest-message-draft"
          className="mb-2 block text-sm font-medium text-zinc-200"
        >
          Your message
        </label>

        <textarea
          id="guest-message-draft"
          rows={4}
          maxLength={MAX_MESSAGE_LENGTH}
          value={messageDraft}
          onChange={(event) =>
            setMessageDraft(event.target.value)
          }
          placeholder="Type your message to the guest..."
          className="w-full resize-y rounded-lg border border-white/20 bg-black px-4 py-3 text-sm leading-6 text-white outline-none placeholder:text-zinc-500 focus:border-[#ea1b24]"
        />

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs text-zinc-400">
            {messageDraft.length}/{MAX_MESSAGE_LENGTH} characters
          </span>

          <button
            type="button"
            disabled
            aria-disabled="true"
            className="min-h-11 cursor-not-allowed rounded-lg bg-zinc-700 px-6 py-3 text-sm font-bold text-zinc-300 opacity-70"
          >
            Send Message
          </button>
        </div>

        <p
          role="status"
          className="mt-4 rounded-lg border border-white/10 bg-black/40 p-3 text-xs leading-5 text-zinc-400"
        >
          Sending is not yet enabled in this development
          workspace. No SMS will be submitted while the
          shared-conversation backend is being connected.
        </p>
      </section>
    </div>
  );
}