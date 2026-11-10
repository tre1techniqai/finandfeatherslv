
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
  from: string;
  to: string;
  body: string;
  status: string;
  dateCreated: string | null;
  dateSent: string | null;
  errorCode: number | null;
};

type HistoryResponse = {
  success: true;
  scope: "phone";
  guestPhone: string;
  restaurantPhone: string;
  messages: ConversationMessage[];
  count: number;
  pageSize: number;
  hasMore: boolean;
  nextCursor: string | null;
  readOnly: true;
  reservationScoped: false;
};

type Props = {
  guestPhone: string;
};

const PAGE_SIZE = 10;
const E164 = /^\+[1-9]\d{7,14}$/;
const MESSAGE_SID = /^SM[0-9a-f]{32}$/i;

function formatTimestamp(
  message: ConversationMessage,
): string {
  const value =
    message.dateCreated ?? message.dateSent;

  if (!value) {
    return "Time unavailable";
  }

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

function formatStatus(
  message: ConversationMessage,
): string {
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

function isMessage(
  value: unknown,
): value is ConversationMessage {
  if (
    !value ||
    typeof value !== "object" ||
    Array.isArray(value)
  ) {
    return false;
  }

  const item = value as Record<string, unknown>;

  return (
    typeof item.sid === "string" &&
    MESSAGE_SID.test(item.sid) &&
    (item.direction === "inbound" ||
      item.direction === "outbound") &&
    typeof item.from === "string" &&
    E164.test(item.from) &&
    typeof item.to === "string" &&
    E164.test(item.to) &&
    typeof item.body === "string" &&
    typeof item.status === "string" &&
    (item.dateCreated === null ||
      typeof item.dateCreated === "string") &&
    (item.dateSent === null ||
      typeof item.dateSent === "string") &&
    (item.errorCode === null ||
      typeof item.errorCode === "number")
  );
}

function isHistory(
  value: unknown,
  guestPhone: string,
): value is HistoryResponse {
  if (
    !value ||
    typeof value !== "object" ||
    Array.isArray(value)
  ) {
    return false;
  }

  const item = value as Record<string, unknown>;

  return (
    item.success === true &&
    item.scope === "phone" &&
    item.guestPhone === guestPhone &&
    typeof item.restaurantPhone === "string" &&
    E164.test(item.restaurantPhone) &&
    Array.isArray(item.messages) &&
    item.messages.length <= PAGE_SIZE &&
    item.messages.every(isMessage) &&
    item.messages.every(
      (message: ConversationMessage) =>
        (message.direction === "inbound" &&
          message.from === guestPhone &&
          message.to === item.restaurantPhone) ||
        (message.direction === "outbound" &&
          message.from === item.restaurantPhone &&
          message.to === guestPhone),
    ) &&
    item.count === item.messages.length &&
    item.pageSize === PAGE_SIZE &&
    typeof item.hasMore === "boolean" &&
    (item.nextCursor === null ||
      (typeof item.nextCursor === "string" &&
        item.nextCursor.length > 0)) &&
    (!item.hasMore ||
      typeof item.nextCursor === "string") &&
    item.readOnly === true &&
    item.reservationScoped === false
  );
}

function messageError(
  payload: unknown,
): string {
  if (
    payload &&
    typeof payload === "object" &&
    "error" in payload &&
    typeof payload.error === "string"
  ) {
    return payload.error;
  }

  return "Unable to load the conversation.";
}

function mergeMessages(
  existing: ConversationMessage[],
  older: ConversationMessage[],
): ConversationMessage[] {
  const known = new Map<
    string,
    ConversationMessage
  >();

  for (const message of older) {
    known.set(message.sid.toLowerCase(), message);
  }

  for (const message of existing) {
    known.set(message.sid.toLowerCase(), message);
  }

  return [...known.values()].sort((a, b) => {
    const aTime = Date.parse(
      a.dateCreated ?? a.dateSent ?? "",
    );

    const bTime = Date.parse(
      b.dateCreated ?? b.dateSent ?? "",
    );

    const difference =
      (Number.isFinite(aTime) ? aTime : 0) -
      (Number.isFinite(bTime) ? bTime : 0);

    return difference || a.sid.localeCompare(b.sid);
  });
}

export default function PhoneConversationWorkspace({
  guestPhone,
}: Props) {
  const [messages, setMessages] = useState<
    ConversationMessage[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [loadingOlder, setLoadingOlder] =
    useState(false);

  const [error, setError] = useState<string | null>(
    null,
  );

  const [olderError, setOlderError] = useState<
    string | null
  >(null);

  const [nextCursor, setNextCursor] = useState<
    string | null
  >(null);

  const [hasMore, setHasMore] = useState(false);

  const requestRef = useRef<AbortController | null>(
    null,
  );

  const olderRequestRef =
    useRef<AbortController | null>(null);

  const olderPendingRef = useRef(false);

  const historyUrl =
    `/api/staff/conversations/phone/` +
    `${encodeURIComponent(guestPhone)}/messages`;

  const fetchPage = useCallback(
    async (
      cursor: string | null,
      signal: AbortSignal,
    ): Promise<HistoryResponse> => {
      const url = cursor
        ? `${historyUrl}?cursor=${encodeURIComponent(cursor)}`
        : historyUrl;

      const response = await fetch(url, {
        method: "GET",
        cache: "no-store",
        signal,
      });

      const payload: unknown = await response.json();

      if (!response.ok) {
        throw new Error(messageError(payload));
      }

      if (!isHistory(payload, guestPhone)) {
        throw new Error(
          "Conversation history returned an invalid response.",
        );
      }

      return payload;
    },
    [historyUrl, guestPhone],
  );

  useEffect(() => {
    const controller = new AbortController();

    requestRef.current = controller;
    olderRequestRef.current?.abort();
    olderPendingRef.current = false;

    setMessages([]);
    setNextCursor(null);
    setHasMore(false);
    setError(null);
    setOlderError(null);
    setLoading(true);
    setLoadingOlder(false);

    void (async () => {
      try {
        const result = await fetchPage(
          null,
          controller.signal,
        );

        if (controller.signal.aborted) return;

        setMessages(result.messages);
        setNextCursor(result.nextCursor);
        setHasMore(result.hasMore);
      } catch (caught) {
        if (controller.signal.aborted) return;

        setError(
          caught instanceof Error
            ? caught.message
            : "Unable to load the conversation.",
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    })();

    return () => {
      controller.abort();
      olderRequestRef.current?.abort();
    };
  }, [fetchPage]);

  const loadOlder = useCallback(async () => {
    if (
      loading ||
      olderPendingRef.current ||
      !hasMore ||
      !nextCursor
    ) {
      return;
    }

    olderPendingRef.current = true;

    const controller = new AbortController();
    olderRequestRef.current = controller;

    setLoadingOlder(true);
    setOlderError(null);

    try {
      const result = await fetchPage(
        nextCursor,
        controller.signal,
      );

      if (controller.signal.aborted) return;

      setMessages((current) =>
        mergeMessages(current, result.messages),
      );

      setNextCursor(result.nextCursor);
      setHasMore(result.hasMore);
    } catch (caught) {
      if (controller.signal.aborted) return;

      setOlderError(
        caught instanceof Error
          ? caught.message
          : "Unable to load older messages.",
      );
    } finally {
      olderPendingRef.current = false;

      if (!controller.signal.aborted) {
        setLoadingOlder(false);
      }
    }
  }, [
    fetchPage,
    hasMore,
    loading,
    nextCursor,
  ]);

  if (!E164.test(guestPhone)) {
    return (
      <p role="alert" className="text-red-200">
        Invalid guest phone number.
      </p>
    );
  }

  return (
    <section
      aria-labelledby="phone-conversation-heading"
      className="rounded-xl border border-white/15 bg-zinc-950 p-4 text-white sm:p-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2
          id="phone-conversation-heading"
          className="text-lg font-bold"
        >
          Guest Phone Conversation
        </h2>

        <span className="rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs font-semibold text-zinc-300">
          Read Only
        </span>
      </div>

      <p className="mt-3 text-sm leading-6 text-zinc-400">
        Continuous SMS history for this guest phone number.
        Messages shown here are not automatically assigned
        to a particular reservation.
      </p>

      {loading && (
        <p role="status" className="mt-6 text-sm text-zinc-300">
          Loading recent messages...
        </p>
      )}

      {error && (
        <p
          role="alert"
          className="mt-5 rounded-lg border border-red-500/30 bg-red-950/20 p-3 text-sm text-red-200"
        >
          {error}
        </p>
      )}

      {!loading && !error && (
        <div className="mt-6 space-y-5">
          {hasMore && (
            <div className="flex flex-col items-center gap-2">
              <button
                type="button"
                disabled={loadingOlder}
                onClick={() => {
                  void loadOlder();
                }}
                className="min-h-11 rounded-lg border border-white/20 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loadingOlder
                  ? "Loading Older Messages..."
                  : "LOAD OLDER MESSAGES"}
              </button>

              {olderError && (
                <p
                  role="alert"
                  className="text-sm text-red-200"
                >
                  {olderError}
                </p>
              )}
            </div>
          )}

          {messages.length === 0 ? (
            <p className="rounded-lg border border-white/10 bg-black/30 p-5 text-sm text-zinc-400">
              No SMS messages found for this phone pair.
            </p>
          ) : (
            <div
              role="log"
              aria-label="Phone SMS history"
              aria-live="off"
              className="space-y-4"
            >
              {messages.map((message) => {
                const outbound =
                  message.direction === "outbound";

                return (
                  <article
                    key={message.sid}
                    className={`flex ${
                      outbound
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[92%] rounded-xl border p-4 sm:max-w-[80%] ${
                        outbound
                          ? "border-red-500/30 bg-red-950/30"
                          : "border-white/15 bg-black/40"
                      }`}
                    >
                      <p className="text-xs font-bold uppercase tracking-wide text-zinc-400">
                        {outbound
                          ? "Fin & Feathers"
                          : "Guest"}
                      </p>

                      <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-white">
                        {message.body || "(Empty message)"}
                      </p>

                      <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs text-zinc-400">
                        <span>
                          {formatTimestamp(message)}
                        </span>

                        <span>
                          {formatStatus(message)}
                        </span>
                      </div>

                      {outbound &&
                        message.errorCode !== null && (
                          <p className="mt-2 text-xs text-amber-200">
                            Delivery error:{" "}
                            {message.errorCode}
                          </p>
                        )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          <p className="border-t border-white/10 pt-4 text-xs text-zinc-500">
            Showing {messages.length} messages.
            Phone-level history does not change
            reservation ownership or booking status.
          </p>
        </div>
      )}
    </section>
  );
}