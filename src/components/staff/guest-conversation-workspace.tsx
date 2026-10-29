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

type SharedMode =
  | "automation"
  | "transitioning_to_staff"
  | "staff"
  | "unknown";

type PreflightCheck = {
  name: string;
  passed: boolean;
  detail: string;
};

type SharedPreflightResponse = {
  success?: boolean;
  reservationId?: string;
  conversationId?: string | null;
  sharedMode?: string | null;
  modeVersion?: number | null;
  matchingConversationCount?: number | null;
  legacyStatus?: string | null;
  activeStudioExecutions?: number | null;
  checksPassed?: boolean;
  activationAuthorized?: boolean;
  checks?: PreflightCheck[];
  error?: string;
};

type Props = {
  reservationId: string;
};

const PAGE_SIZE = 10;
const MAX_MESSAGE_LENGTH = 1600;

const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function messageTimestamp(
  message: ConversationMessage,
): string {
  const value =
    message.dateSent ?? message.dateCreated;

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

function messageStatus(
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

function validMessage(
  value: unknown,
): value is ConversationMessage {
  if (
    !value ||
    typeof value !== "object" ||
    Array.isArray(value)
  ) {
    return false;
  }

  const row =
    value as Record<string, unknown>;

  return (
    typeof row.sid === "string" &&
    (
      row.direction === "inbound" ||
      row.direction === "outbound"
    ) &&
    typeof row.body === "string" &&
    typeof row.status === "string" &&
    (
      row.dateCreated === null ||
      typeof row.dateCreated === "string"
    ) &&
    (
      row.dateSent === null ||
      typeof row.dateSent === "string"
    ) &&
    (
      row.errorCode === null ||
      typeof row.errorCode === "number"
    )
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
  if (
    !value ||
    typeof value !== "object" ||
    Array.isArray(value)
  ) {
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
    (
      result.nextCursor === null ||
      typeof result.nextCursor === "string"
    ) &&
    (
      !result.hasMore ||
      (
        typeof result.nextCursor === "string" &&
        result.nextCursor.length > 0
      )
    )
  );
}

function mergeMessages(
  older: ConversationMessage[],
  existing: ConversationMessage[],
): ConversationMessage[] {
  const seen = new Set<string>();
  const merged: ConversationMessage[] = [];

  for (const message of [
    ...older,
    ...existing,
  ]) {
    if (seen.has(message.sid)) {
      continue;
    }

    seen.add(message.sid);
    merged.push(message);
  }

  return merged;
}

function resolveMode(
  value: unknown,
): SharedMode {
  switch (value) {
    case "automation":
    case "transitioning_to_staff":
    case "staff":
      return value;
    default:
      return "unknown";
  }
}

function modeLabel(
  mode: SharedMode,
): string {
  switch (mode) {
    case "automation":
      return "Automation";
    case "transitioning_to_staff":
      return "Transitioning to Staff";
    case "staff":
      return "Shared Staff";
    default:
      return "Unverified";
  }
}

function validPreflight(
  value: unknown,
  reservationId: string,
): value is SharedPreflightResponse & {
  success: true;
  reservationId: string;
  checks: PreflightCheck[];
} {
  if (
    !value ||
    typeof value !== "object" ||
    Array.isArray(value)
  ) {
    return false;
  }

  const result =
    value as SharedPreflightResponse;

  return (
    result.success === true &&
    result.reservationId === reservationId &&
    Array.isArray(result.checks) &&
    result.checks.every(
      (check) =>
        check !== null &&
        typeof check === "object" &&
        typeof check.name === "string" &&
        typeof check.passed === "boolean" &&
        typeof check.detail === "string",
    ) &&
    typeof result.checksPassed === "boolean" &&
    typeof result.activationAuthorized === "boolean"
  );
}

function errorDetail(
  value: unknown,
  fallback: string,
): string {
  if (
    value &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    "error" in value &&
    typeof value.error === "string"
  ) {
    return value.error;
  }

  return fallback;
}

export default function GuestConversationWorkspace({
  reservationId,
}: Props) {
  const [messages, setMessages] =
    useState<ConversationMessage[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [loadingOlder, setLoadingOlder] =
    useState(false);

  const [error, setError] =
    useState("");

  const [olderError, setOlderError] =
    useState("");

  const [hasMore, setHasMore] =
    useState(false);

  const [nextCursor, setNextCursor] =
    useState<string | null>(null);

  const [coverageComplete, setCoverageComplete] =
    useState(false);

  const scrollRef =
    useRef<HTMLOListElement>(null);

  const loadOlderGuardRef =
    useRef(false);

  const initialScrollRef =
    useRef(false);

  const activeRequestRef =
    useRef<AbortController | null>(null);

  const [sharedLoading, setSharedLoading] =
    useState(true);

  const [sharedError, setSharedError] =
    useState("");

  const [sharedState, setSharedState] =
    useState<SharedPreflightResponse | null>(
      null,
    );

  const [joining, setJoining] =
    useState(false);

  const [joinResult, setJoinResult] =
    useState("");

  const [joinError, setJoinError] =
    useState("");

  const joinGuardRef =
    useRef(false);

  const [messageDraft, setMessageDraft] =
    useState("");

  const [sending, setSending] =
    useState(false);

  const [sendError, setSendError] =
    useState("");

  const [sendSuccess, setSendSuccess] =
    useState("");

  const [sendReviewRequired, setSendReviewRequired] =
    useState(false);

  const sendGuardRef =
    useRef(false);

  const sharedUrl =
    `/api/staff/reservations/` +
    `${encodeURIComponent(reservationId)}` +
    `/conversation/shared-preflight`;

  const loadSharedState = useCallback(
    async (
      signal?: AbortSignal,
    ) => {
      setSharedLoading(true);
      setSharedError("");

      try {
        const response = await fetch(
          sharedUrl,
          {
            method: "GET",
            credentials: "same-origin",
            cache: "no-store",
            signal,
          },
        );

        const payload: unknown =
          await response.json();

        if (
          !response.ok ||
          !validPreflight(
            payload,
            reservationId,
          )
        ) {
          throw new Error(
            errorDetail(
              payload,
              "Unable to verify shared conversation state.",
            ),
          );
        }

        if (signal?.aborted) {
          return;
        }

        setSharedState(payload);
      } catch (caught) {
        if (signal?.aborted) {
          return;
        }

        setSharedState(null);

        setSharedError(
          caught instanceof Error
            ? caught.message
            : "Shared conversation verification failed.",
        );
      } finally {
        if (!signal?.aborted) {
          setSharedLoading(false);
        }
      }
    },
    [reservationId, sharedUrl],
  );

  useEffect(() => {
    const controller =
      new AbortController();

    void loadSharedState(
      controller.signal,
    );

    return () =>
      controller.abort();
  }, [loadSharedState]);

  const historyUrl = useCallback(
    (cursor?: string | null) => {
      const base =
        `/api/staff/reservations/` +
        `${encodeURIComponent(reservationId)}` +
        `/conversation/scoped-history`;

      if (!cursor) {
        return base;
      }

      return (
        `${base}?cursor=` +
        encodeURIComponent(cursor)
      );
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

      const payload: unknown =
        await response.json();

      if (
        !response.ok ||
        !validHistory(
          payload,
          reservationId,
        )
      ) {
        throw new Error(
          errorDetail(
            payload,
            "Unable to load this reservation's messages.",
          ),
        );
      }

      return payload;
    },
    [historyUrl, reservationId],
  );

  const loadInitial =
    useCallback(async () => {
      activeRequestRef.current?.abort();

      const controller =
        new AbortController();

      activeRequestRef.current =
        controller;

      setLoading(true);
      setError("");
      setOlderError("");
      setMessages([]);
      setHasMore(false);
      setNextCursor(null);
      setCoverageComplete(false);

      initialScrollRef.current = false;

      try {
        const payload =
          await fetchHistory(
            null,
            controller.signal,
          );

        if (controller.signal.aborted) {
          return;
        }

        setMessages(payload.messages);
        setHasMore(payload.hasMore);
        setNextCursor(payload.nextCursor);

        setCoverageComplete(
          payload.historicalCoverageComplete ===
            true,
        );

        initialScrollRef.current = true;
      } catch (caught) {
        if (controller.signal.aborted) {
          return;
        }

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

    container.scrollTop =
      container.scrollHeight;

    initialScrollRef.current = false;
  }, [loading, messages]);

  const loadOlder =
    useCallback(async () => {
      if (
        loading ||
        loadingOlder ||
        loadOlderGuardRef.current ||
        !hasMore ||
        !nextCursor
      ) {
        return;
      }

      const container =
        scrollRef.current;

      if (!container) {
        return;
      }

      loadOlderGuardRef.current = true;

      setLoadingOlder(true);
      setOlderError("");

      const previousHeight =
        container.scrollHeight;

      const previousTop =
        container.scrollTop;

      const controller =
        new AbortController();

      activeRequestRef.current =
        controller;

      try {
        const payload =
          await fetchHistory(
            nextCursor,
            controller.signal,
          );

        if (controller.signal.aborted) {
          return;
        }

        setMessages(
          (existing) =>
            mergeMessages(
              payload.messages,
              existing,
            ),
        );

        setHasMore(payload.hasMore);
        setNextCursor(payload.nextCursor);

        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            if (!scrollRef.current) {
              return;
            }

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
    const container =
      scrollRef.current;

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

  const sharedMode = resolveMode(
    sharedState?.sharedMode,
  );

  const checks =
    sharedState?.checks ?? [];

  const passedChecks =
    checks.filter(
      (check) => check.passed,
    ).length;

  const validSharedAssociation =
    sharedState?.success === true &&
    sharedState.reservationId === reservationId &&
    typeof sharedState.conversationId === "string" &&
    UUID.test(sharedState.conversationId) &&
    sharedState.matchingConversationCount === 1 &&
    typeof sharedState.modeVersion === "number" &&
    Number.isSafeInteger(sharedState.modeVersion) &&
    sharedState.modeVersion >= 1;

  const canJoin =
    validSharedAssociation &&
    sharedMode === "automation" &&
    !sharedLoading &&
    !joining &&
    !sending &&
    sharedState?.checksPassed === true;

  async function joinConversation() {
    if (!canJoin || joinGuardRef.current) {
      return;
    }

    const conversationId =
      sharedState?.conversationId;

    const expectedModeVersion =
      sharedState?.modeVersion;

    if (
      typeof conversationId !== "string" ||
      !UUID.test(conversationId) ||
      typeof expectedModeVersion !== "number" ||
      !Number.isSafeInteger(expectedModeVersion) ||
      expectedModeVersion < 1
    ) {
      return;
    }

    joinGuardRef.current = true;

    setJoining(true);
    setJoinError("");
    setJoinResult("");
    setSendError("");
    setSendSuccess("");

    try {
      const response = await fetch(
        `/api/staff/reservations/` +
          `${encodeURIComponent(reservationId)}` +
          `/conversation/shared-activate`,
        {
          method: "POST",
          credentials: "same-origin",
          cache: "no-store",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            conversationId,
            expectedModeVersion,
          }),
        },
      );

      const payload: unknown =
        await response.json();

      if (
        !payload ||
        typeof payload !== "object" ||
        Array.isArray(payload)
      ) {
        throw new Error(
          "The conversation activation response was invalid.",
        );
      }

      const result =
        payload as Record<string, unknown>;

      if (
        !response.ok ||
        result.success !== true
      ) {
        throw new Error(
          errorDetail(
            payload,
            "Unable to join this conversation.",
          ),
        );
      }

      if (
        result.reservationId !== reservationId ||
        result.conversationId !== conversationId ||
        result.conversationMode !== "staff" ||
        result.activationAuthorized !== true ||
        result.operationalVerificationComplete !== true ||
        result.databaseChanged !== true ||
        result.smsSent !== false ||
        typeof result.modeVersion !== "number" ||
        !Number.isSafeInteger(result.modeVersion) ||
        result.modeVersion <= expectedModeVersion
      ) {
        throw new Error(
          "Conversation activation could not be confirmed. Refresh before sending.",
        );
      }

      // Reflect the confirmed server response immediately.
      // A fresh preflight remains authoritative.

      setSharedState((current) =>
        current
          ? {
              ...current,
              sharedMode: "staff",
              modeVersion:
                result.modeVersion as number,
              activationAuthorized: true,
            }
          : current,
      );

      setJoinResult(
        "You joined this conversation. Staff messaging is active.",
      );

      await loadSharedState();
      void loadInitial();
    } catch (caught) {
      setJoinError(
        caught instanceof Error
          ? caught.message
          : "Unable to join this conversation.",
      );

      // The server may have changed mode even if its
      // response was interrupted. Refresh instead of
      // automatically retrying a mode-changing request.

      await loadSharedState();
    } finally {
      joinGuardRef.current = false;
      setJoining(false);
    }
  }

  // Staff mode and reservation association determine
  // whether the composer can be offered. The protected
  // SMS endpoint independently enforces all send gates.
  //
  // Automation readiness checks are intentionally NOT
  // required here: they may be false once automation ends.

  const canSend =
    validSharedAssociation &&
    !sharedLoading &&
    !joining &&
    sharedMode === "staff" &&
    !sending &&
    !sendReviewRequired &&
    messageDraft.trim().length > 0 &&
    messageDraft.trim().length <= MAX_MESSAGE_LENGTH;

  async function sendMessage() {
    if (!canSend || sendGuardRef.current) {
      return;
    }

    const conversationId =
      sharedState?.conversationId;

    if (
      !conversationId ||
      !UUID.test(conversationId)
    ) {
      return;
    }

    sendGuardRef.current = true;

    setSending(true);
    setSendError("");
    setSendSuccess("");

    try {
      const response = await fetch(
        `/api/staff/conversations/` +
          `${encodeURIComponent(conversationId)}` +
          `/messages`,
        {
          method: "POST",
          credentials: "same-origin",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            body: messageDraft.trim(),
            clientRequestId: crypto.randomUUID(),
            reservationId,
          }),
        },
      );

      const payload: unknown =
        await response.json();

      if (
        !payload ||
        typeof payload !== "object" ||
        Array.isArray(payload)
      ) {
        throw new Error(
          "The SMS response could not be verified.",
        );
      }

      const result =
        payload as Record<string, unknown>;

      if (
        response.ok &&
        result.success === true &&
        result.conversationId === conversationId &&
        result.operationStatus === "accepted" &&
        typeof result.messageSid === "string"
      ) {
        setMessageDraft("");

        setSendSuccess(
          "Twilio accepted the SMS. Delivery status may update later.",
        );

        void loadInitial();
        void loadSharedState();

        return;
      }

      if (
        response.status >= 500 ||
        result.operationId ||
        result.duplicate === true
      ) {
        setSendReviewRequired(true);
      }

      setSendError(
        errorDetail(
          payload,
          "SMS was not accepted. Verify the conversation before trying again.",
        ),
      );
    } catch {
      setSendReviewRequired(true);

      setSendError(
        "SMS outcome is unknown. Do not resend; ask an administrator to reconcile it.",
      );
    } finally {
      sendGuardRef.current = false;
      setSending(false);
    }
  }

  function refreshWorkspace() {
    setJoinError("");
    setJoinResult("");

    void loadInitial();
    void loadSharedState();
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
              Reservation-specific SMS history
              and shared manager communication.
            </p>
          </div>

          <button
            type="button"
            onClick={refreshWorkspace}
            disabled={
              loading ||
              loadingOlder ||
              sharedLoading ||
              joining ||
              sending
            }
            className="min-h-11 rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading || sharedLoading
              ? "Refreshing..."
              : "Refresh"}
          </button>
        </div>

        {!coverageComplete &&
          !loading &&
          !error && (
            <p className="mt-4 rounded-lg border border-amber-500/25 bg-amber-950/15 p-3 text-xs leading-5 text-amber-200">
              Historical coverage is incomplete.
              Only messages with a verified
              reservation association are shown.
              Messages from other reservations
              are excluded.
            </p>
          )}
      </section>

      <section
        aria-labelledby="shared-conversation-state"
        className="rounded-xl border border-white/15 bg-zinc-950 p-4 sm:p-5"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3
              id="shared-conversation-state"
              className="text-lg font-bold"
            >
              Shared Conversation
            </h3>

            <p className="mt-1 text-sm text-zinc-400">
              Staff members share this reservation
              conversation.
            </p>
          </div>

          <span
            className={`rounded-full border px-3 py-1 text-xs font-semibold ${
              sharedMode === "staff"
                ? "border-emerald-500/40 bg-emerald-950/30 text-emerald-200"
                : sharedMode === "automation"
                  ? "border-sky-500/40 bg-sky-950/30 text-sky-200"
                  : sharedMode === "transitioning_to_staff"
                    ? "border-amber-500/40 bg-amber-950/30 text-amber-200"
                    : "border-white/20 bg-white/5 text-zinc-300"
            }`}
          >
            {sharedLoading
              ? "Verifying..."
              : modeLabel(sharedMode)}
          </span>
        </div>

        {sharedError && (
          <p
            role="alert"
            className="mt-4 rounded-lg border border-red-500/30 bg-red-950/20 p-3 text-sm text-red-200"
          >
            {sharedError}
          </p>
        )}

        {!sharedError &&
          !sharedLoading &&
          sharedState && (
            <div className="mt-5 space-y-4">
              <dl className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-3">
                <div>
                  <dt className="text-xs text-zinc-400">
                    Mode
                  </dt>

                  <dd className="mt-1 font-semibold text-white">
                    {modeLabel(sharedMode)}
                  </dd>
                </div>

                <div>
                  <dt className="text-xs text-zinc-400">
                    Mode Version
                  </dt>

                  <dd className="mt-1 font-semibold text-white">
                    {sharedState.modeVersion ??
                      "Unverified"}
                  </dd>
                </div>

                <div>
                  <dt className="text-xs text-zinc-400">
                    Readiness Checks
                  </dt>

                  <dd className="mt-1 font-semibold text-white">
                    {passedChecks}/{checks.length} passed
                  </dd>
                </div>
              </dl>

              <p className="rounded-lg border border-white/10 bg-black/40 p-3 text-xs leading-5 text-zinc-300">
                {sharedMode === "staff"
                  ? "Staff conversation is active. You can compose and send SMS messages below."
                  : joining
                    ? "Connecting staff to this conversation..."
                    : sharedMode === "transitioning_to_staff"
                      ? "Staff handoff is in progress. Messaging will become available when the transition completes."
                      : sharedMode === "automation"
                        ? "Click JOIN CONVERSATION to take over guest messaging."
                        : "Conversation status could not be verified."}
              </p>

              {checks.some(
                (check) => !check.passed,
              ) &&
                sharedMode !== "staff" && (
                  <div className="rounded-lg border border-amber-500/25 bg-amber-950/15 p-3">
                    <p className="text-xs font-semibold text-amber-100">
                      Checks requiring attention
                    </p>

                    <ul className="mt-2 space-y-2">
                      {checks
                        .filter(
                          (check) =>
                            !check.passed,
                        )
                        .map((check) => (
                          <li
                            key={check.name}
                            className="text-xs leading-5 text-amber-200"
                          >
                            {check.detail}
                          </li>
                        ))}
                    </ul>
                  </div>
                )}
            </div>
          )}

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button
            type="button"
            disabled={!canJoin}
            aria-disabled={!canJoin}
            onClick={() => {
              void joinConversation();
            }}
            className={`min-h-11 rounded-lg px-5 py-3 text-sm font-bold transition disabled:cursor-not-allowed ${
              canJoin
                ? "bg-[#ea1b24] text-white hover:bg-red-700"
                : sharedMode === "staff"
                  ? "border border-emerald-500/30 bg-emerald-950/30 text-emerald-200"
                  : "border border-white/20 bg-zinc-800 text-zinc-400 opacity-70"
            }`}
          >
            {joining
              ? "Joining Conversation..."
              : sharedMode === "staff"
                ? "Staff Mode Active"
                : sharedMode === "transitioning_to_staff"
                  ? "Transition Pending"
                  : "JOIN CONVERSATION"}
          </button>
        </div>

        {joinResult && (
          <p
            role="status"
            className="mt-4 rounded-lg border border-emerald-500/30 bg-emerald-950/20 p-3 text-sm leading-6 text-emerald-200"
          >
            {joinResult}
          </p>
        )}

        {joinError && (
          <p
            role="alert"
            className="mt-4 rounded-lg border border-red-500/30 bg-red-950/20 p-3 text-sm leading-6 text-red-200"
          >
            {joinError}
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
            Loading this reservation&apos;s
            messages...
          </div>
        ) : error ? null : (
          <>
            {hasMore && (
              <p className="mb-3 text-center text-xs text-zinc-400">
                Scroll upward to load 10
                older messages.
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
                  onClick={() =>
                    void loadOlder()
                  }
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

              {!hasMore &&
                messages.length > 0 && (
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
                    This reservation has no messages
                    with verified associations in
                    the current history sources.
                  </p>
                </li>
              )}

              {messages.map((message) => {
                const incoming =
                  message.direction === "inbound";

                const failed =
                  !incoming &&
                  (
                    message.status === "failed" ||
                    message.status === "undelivered"
                  );

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
                          This message may not
                          have reached the guest.
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
            Send an SMS directly to the guest
            after joining the conversation.
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
            setMessageDraft(
              event.target.value,
            )
          }
          placeholder="Type your message to the guest..."
          className="w-full resize-y rounded-lg border border-white/20 bg-black px-4 py-3 text-sm leading-6 text-white outline-none placeholder:text-zinc-500 focus:border-[#ea1b24]"
        />

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs text-zinc-400">
            {messageDraft.length}/
            {MAX_MESSAGE_LENGTH} characters
          </span>

          <button
            type="button"
            disabled={!canSend}
            aria-disabled={!canSend}
            onClick={() => {
              void sendMessage();
            }}
            className="min-h-11 rounded-lg bg-[#ea1b24] px-6 py-3 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-300 disabled:opacity-70"
          >
            {sending
              ? "Sending..."
              : "Send Message"}
          </button>
        </div>

        <p
          role="status"
          className="mt-4 rounded-lg border border-white/10 bg-black/40 p-3 text-xs leading-5 text-zinc-400"
        >
          {joining
            ? "Connecting staff to the conversation..."
            : sharedLoading
              ? "Verifying conversation status..."
              : sharedError
                ? "Conversation status is unavailable. Sending is disabled."
                : sharedMode === "staff"
                  ? "Staff messaging is active. Messages are sent through the protected SMS service."
                  : sharedMode === "automation"
                    ? "Click JOIN CONVERSATION above to enable staff messaging."
                    : sharedMode === "transitioning_to_staff"
                      ? "Staff handoff is pending. Sending is unavailable."
                      : "Conversation status is unverified. Sending is disabled."}
        </p>

        {sendSuccess && (
          <p
            role="status"
            className="mt-3 rounded-lg border border-emerald-500/30 bg-emerald-950/20 p-3 text-sm text-emerald-200"
          >
            {sendSuccess}
          </p>
        )}

        {sendError && (
          <p
            role="alert"
            className="mt-3 rounded-lg border border-red-500/30 bg-red-950/20 p-3 text-sm text-red-200"
          >
            {sendError}
          </p>
        )}

        {sendReviewRequired && (
          <p
            role="alert"
            className="mt-3 rounded-lg border border-amber-500/30 p-3 text-sm text-amber-200"
          >
            An unresolved SMS attempt requires
            administrative review. Do not resend
            until the operation is reconciled.
          </p>
        )}
      </section>
    </div>
  );
}