
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

type ConversationResponse = {
  success: boolean;
  guestName?: string | null;
  messages?: ConversationMessage[];
  count?: number;
  historyMayBeTruncated?: boolean;
  readOnly?: boolean;
  error?: string;
};

type HandoffState = {
  exists: boolean;
  status: string;
  reservationId?: string | null;
  claimedByCurrentManager: boolean;
  canCancel: boolean;
  canComplete: boolean;
  canRelease: boolean;
};

type OwnershipResponse = {
  success: boolean;
  handoff?: HandoffState;
  staffMessagingEnabled?: boolean;
  error?: string;
};

type HandoffActionResponse = {
  success: boolean;
  ownership?: string;
  staffMessagingEnabled?: boolean;
  error?: string;
};

type OwnershipActionResponse = {
  success: boolean;
  ownership?: string;
  claimedByCurrentManager?: boolean;
  smsSent?: boolean;
  error?: string;
};

type TakeoverPreflightResponse = {
  success: boolean;
  preflight?: string;
  activeExecutionCount?: number;
  ownershipChanged?: boolean;
  takeoverReady?: boolean;
  error?: string;
};

type Props = {
  reservationId: string;
};

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

function getMessageStatus(
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

export default function ReservationGuestConversation({
  reservationId,
}: Props) {
  const [messages, setMessages] =
    useState<ConversationMessage[]>([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const [
    historyMayBeTruncated,
    setHistoryMayBeTruncated,
  ] = useState(false);

  const [handoff, setHandoff] =
    useState<HandoffState | null>(null);

  const [ownershipLoading, setOwnershipLoading] =
    useState(true);

  const [ownershipRefreshing, setOwnershipRefreshing] =
    useState(false);

  const [ownershipError, setOwnershipError] = useState("");
  const [handoffSubmitting, setHandoffSubmitting] =
    useState(false);

  const [handoffMessage, setHandoffMessage] = useState("");
  const [staffMessagingEnabled, setStaffMessagingEnabled] =
    useState(false);

  const [draftMessage, setDraftMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");
  const [sendSuccess, setSendSuccess] = useState("");
  // A transport error is not proof Twilio rejected a message.
  // Keep the attempted request ID for diagnosis; never submit it again.
  const [sendReviewRequired, setSendReviewRequired] = useState(false);
  const sendingGuardRef = useRef(false);
  const attemptedRequestRef = useRef<{
    clientRequestId: string;
    body: string;
  } | null>(null);

  const messageListRef =
    useRef<HTMLOListElement | null>(null);

  const lastScrollTopRef = useRef(0);

  const scrollHideTimerRef =
    useRef<ReturnType<typeof setTimeout> | null>(null);

  const didInitialScrollRef = useRef(false);
  const followLatestRef = useRef(true);

  const [scrollDirection, setScrollDirection] =
    useState<"up" | "down" | null>(null);

  const [canScrollUp, setCanScrollUp] = useState(false);
  const [canScrollDown, setCanScrollDown] = useState(false);

  const clearScrollHideTimer = useCallback(() => {
    if (scrollHideTimerRef.current !== null) {
      clearTimeout(scrollHideTimerRef.current);
      scrollHideTimerRef.current = null;
    }
  }, []);

  const updateScrollBounds = useCallback(() => {
    const list = messageListRef.current;

    if (!list) {
      setCanScrollUp(false);
      setCanScrollDown(false);
      return;
    }

    const remaining =
      list.scrollHeight - list.clientHeight - list.scrollTop;

    setCanScrollUp(list.scrollTop > 3);
    setCanScrollDown(remaining > 3);
  }, []);

  const handleMessageScroll = useCallback(() => {
    const list = messageListRef.current;
    if (!list) return;

    const position = list.scrollTop;
    const movement =
      position - lastScrollTopRef.current;

    lastScrollTopRef.current = position;

    followLatestRef.current =
      list.scrollHeight - list.clientHeight - position <= 48;

    updateScrollBounds();

    if (Math.abs(movement) <= 1) return;

    const nextDirection =
      movement < 0 ? "up" : "down";

    const canContinue =
      movement < 0
        ? position > 3
        : list.scrollHeight -
            list.clientHeight -
            position > 3;

    setScrollDirection(
      canContinue ? nextDirection : null,
    );

    clearScrollHideTimer();

    if (canContinue) {
      scrollHideTimerRef.current = setTimeout(() => {
        setScrollDirection(null);
        scrollHideTimerRef.current = null;
      }, 1100);
    }
  }, [clearScrollHideTimer, updateScrollBounds]);

  const jumpTo = useCallback(
    (edge: "top" | "bottom") => {
      const list = messageListRef.current;
      if (!list) return;

      clearScrollHideTimer();
      setScrollDirection(null);

      list.scrollTo({
        top: edge === "top" ? 0 : list.scrollHeight,
        behavior: "smooth",
      });
    },
    [clearScrollHideTimer],
  );

  useEffect(
    () => () => clearScrollHideTimer(),
    [clearScrollHideTimer],
  );

  useEffect(() => {
    didInitialScrollRef.current = false;
    setExpanded(false);
    followLatestRef.current = true;
    lastScrollTopRef.current = 0;

    clearScrollHideTimer();
    setScrollDirection(null);

    setHandoff(null);
    setStaffMessagingEnabled(false);
    setHandoffMessage("");
    setOwnershipError("");
    setDraftMessage("");
    setSendError("");
    setSendSuccess("");
    setSendReviewRequired(false);
    sendingGuardRef.current = false;
    attemptedRequestRef.current = null;
  }, [reservationId, clearScrollHideTimer]);

  useEffect(() => {
    if (!expanded || !loaded || messages.length === 0) {
      return;
    }

    const list = messageListRef.current;
    if (!list) return;

    if (
      !didInitialScrollRef.current ||
      followLatestRef.current
    ) {
      list.scrollTop = list.scrollHeight;
    }

    didInitialScrollRef.current = true;
    lastScrollTopRef.current = list.scrollTop;

    updateScrollBounds();
  }, [expanded, loaded, messages, updateScrollBounds]);

  const loadConversation = useCallback(
    async (
      signal: AbortSignal,
      initial: boolean,
    ): Promise<boolean> => {
      if (initial) {
        setLoading(true);
        setLoaded(false);
      } else {
        setRefreshing(true);
      }

      setError("");

      try {
        const response = await fetch(
          `/api/staff/reservations/${encodeURIComponent(
            reservationId,
          )}/conversation`,
          {
            method: "GET",
            credentials: "same-origin",
            cache: "no-store",
            signal,
          },
        );

        const result: ConversationResponse =
          await response.json();

        if (!response.ok || result.success !== true) {
          throw new Error(
            result.error ||
              "We couldn't load the guest conversation.",
          );
        }

        if (!Array.isArray(result.messages)) {
          throw new Error(
            "The conversation response was incomplete.",
          );
        }

        if (signal.aborted) return false;

        if (initial) {
          didInitialScrollRef.current = false;
          followLatestRef.current = true;
        } else {
          const list = messageListRef.current;

          if (list) {
            followLatestRef.current =
              list.scrollHeight -
                list.clientHeight -
                list.scrollTop <=
              48;
          }
        }

        setMessages(result.messages);
        setHistoryMayBeTruncated(
          result.historyMayBeTruncated === true,
        );
        setLoaded(true);

        return true;
      } catch (caught) {
        if (signal.aborted) return false;

        setError(
          caught instanceof Error
            ? caught.message
            : "We couldn't load the guest conversation.",
        );

        return false;
      } finally {
        if (!signal.aborted) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    },
    [reservationId],
  );

  const loadOwnership = useCallback(
    async (
      signal: AbortSignal,
      initial: boolean,
    ): Promise<boolean> => {
      // Fail closed while ownership is being verified.
      setStaffMessagingEnabled(false);

      if (initial) {
        setOwnershipLoading(true);
        setHandoff(null);
      } else {
        setOwnershipRefreshing(true);
      }

      setOwnershipError("");

      try {
        const response = await fetch(
          `/api/staff/reservations/${encodeURIComponent(
            reservationId,
          )}/conversation/ownership`,
          {
            method: "GET",
            credentials: "same-origin",
            cache: "no-store",
            signal,
          },
        );

        const result: OwnershipResponse =
          await response.json();

        if (
          !response.ok ||
          result.success !== true ||
          !result.handoff
        ) {
          throw new Error(
            result.error ||
              "Couldn't verify conversation ownership.",
          );
        }

        if (
          typeof result.staffMessagingEnabled !== "boolean" ||
          typeof result.handoff.canCancel !== "boolean" ||
          typeof result.handoff.canComplete !== "boolean" ||
          typeof result.handoff.canRelease !== "boolean"
        ) {
          throw new Error(
            "Conversation permissions could not be verified.",
          );
        }

        if (signal.aborted) return false;

        setHandoff(result.handoff);
        setStaffMessagingEnabled(
          result.staffMessagingEnabled,
        );

        return true;
      } catch (caught) {
        if (signal.aborted) return false;

        setHandoff(null);
        setStaffMessagingEnabled(false);

        setOwnershipError(
          caught instanceof Error
            ? caught.message
            : "Couldn't verify conversation ownership.",
        );

        return false;
      } finally {
        if (!signal.aborted) {
          setOwnershipLoading(false);
          setOwnershipRefreshing(false);
        }
      }
    },
    [reservationId],
  );

  useEffect(() => {
    const controller = new AbortController();

    void loadConversation(controller.signal, true);
    void loadOwnership(controller.signal, true);

    return () => controller.abort();
  }, [loadConversation, loadOwnership]);

  async function refreshConversation() {
    if (
      loading ||
      refreshing ||
      ownershipLoading ||
      ownershipRefreshing ||
      handoffSubmitting ||
      sending
    ) {
      return;
    }

    const controller = new AbortController();

    await Promise.all([
      loadConversation(controller.signal, false),
      loadOwnership(controller.signal, false),
    ]);
  }

  async function updateHandoff(
    action: "request" | "cancel",
  ) {
    if (
      handoffSubmitting ||
      ownershipLoading ||
      ownershipRefreshing ||
      sending ||
      !handoff
    ) {
      return;
    }

    const requesting =
      action === "request";

    const allowed =
      requesting
        ? handoff.status === "automation" ||
          handoff.status === "released" ||
          (!handoff.exists &&
            handoff.status === "not_recorded")
        : handoff.status === "handoff_pending" &&
          handoff.canCancel;

    if (!allowed) return;

    setHandoffSubmitting(true);
    setHandoffMessage("");
    setOwnershipError("");
    setStaffMessagingEnabled(false);

    try {
      const response = await fetch(
        `/api/staff/reservations/${encodeURIComponent(
          reservationId,
        )}/conversation/handoff`,
        {
          method: "POST",
          credentials: "same-origin",
          cache: "no-store",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ action }),
        },
      );

      const result: HandoffActionResponse =
        await response.json();

      if (!response.ok || result.success !== true) {
        throw new Error(
          result.error || "Handoff request failed.",
        );
      }

      if (
        result.ownership !==
          (requesting
            ? "handoff_pending"
            : "automation") ||
        result.staffMessagingEnabled !== false
      ) {
        throw new Error(
          "Handoff result could not be verified.",
        );
      }

      const verified = await loadOwnership(
        new AbortController().signal,
        false,
      );

      if (!verified) {
        throw new Error(
          "Handoff changed, but ownership could not be reverified. Refresh before continuing.",
        );
      }

      setHandoffMessage(
        requesting
          ? "Handoff requested. Automation remains active until takeover is completed."
          : "Pending handoff canceled. Automation remains active.",
      );
    } catch (caught) {
      setHandoff(null);
      setStaffMessagingEnabled(false);

      setOwnershipError(
        caught instanceof Error
          ? caught.message
          : "Unable to update the handoff request.",
      );
    } finally {
      setHandoffSubmitting(false);
    }
  }

  async function updateStaffOwnership(
    action: "complete" | "release",
  ) {
    if (
      handoffSubmitting ||
      ownershipLoading ||
      ownershipRefreshing ||
      sending ||
      ownershipError ||
      !handoff
    ) {
      return;
    }

    const eligible =
      handoff.reservationId === reservationId &&
      handoff.claimedByCurrentManager === true &&
      (action === "complete"
        ? handoff.status === "handoff_pending" &&
          handoff.canComplete === true
        : handoff.status === "staff" &&
          handoff.canRelease === true);

    if (!eligible) return;

    setHandoffSubmitting(true);
    setHandoffMessage("");
    setOwnershipError("");
    setStaffMessagingEnabled(false);

    try {
      const endpointBase =
        `/api/staff/reservations/${encodeURIComponent(
          reservationId,
        )}/conversation`;

      if (action === "complete") {
        // The existing preflight is read-only. The
        // completion API will independently repeat
        // active-execution verification.
        const preflightResponse = await fetch(
          `${endpointBase}/takeover`,
          {
            method: "POST",
            credentials: "same-origin",
            cache: "no-store",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({}),
          },
        );

        const preflight: TakeoverPreflightResponse =
          await preflightResponse.json();

        if (
          !preflightResponse.ok ||
          preflight.success !== true ||
          preflight.preflight !==
            "verified_pending_claim" ||
          preflight.ownershipChanged !== false ||
          typeof preflight.activeExecutionCount !==
            "number" ||
          preflight.activeExecutionCount !== 0
        ) {
          throw new Error(
            preflight.error ||
              "Takeover preflight could not confirm a safe handoff.",
          );
        }
      }

      const response = await fetch(
        `${endpointBase}/${action}`,
        {
          method: "POST",
          credentials: "same-origin",
          cache: "no-store",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({}),
        },
      );

      const result: OwnershipActionResponse =
        await response.json();

      if (!response.ok || result.success !== true) {
        throw new Error(
          result.error ||
            "Conversation ownership could not be updated. Refresh before retrying.",
        );
      }

      const expectedStatus =
        action === "complete" ? "staff" : "released";

      if (
        result.ownership !== expectedStatus ||
        result.smsSent !== false ||
        (action === "complete" &&
          result.claimedByCurrentManager !== true) ||
        (action === "release" &&
          result.claimedByCurrentManager !== false)
      ) {
        throw new Error(
          "The ownership result was unexpected. Refresh before continuing.",
        );
      }

      const verified = await loadOwnership(
        new AbortController().signal,
        false,
      );

      if (!verified) {
        throw new Error(
          "Ownership changed, but the new state could not be reverified. Refresh before continuing.",
        );
      }

      setHandoffMessage(
        action === "complete"
          ? "Staff takeover completed. Messaging remains subject to separate server authorization."
          : "Conversation released. New guest messages return to automation.",
      );
    } catch (caught) {
      // A server-side update may have succeeded even if
      // its response failed. Require a fresh ownership
      // lookup rather than assuming the old state.
      setHandoff(null);
      setStaffMessagingEnabled(false);

      setOwnershipError(
        caught instanceof Error
          ? caught.message
          : "Unable to update conversation ownership.",
      );
    } finally {
      setHandoffSubmitting(false);
    }
  }

  const pending =
    handoff?.status === "handoff_pending";

  const staffOwned =
    handoff?.status === "staff";

  const ownsConversation =
    handoff?.claimedByCurrentManager === true &&
    handoff?.reservationId === reservationId;

  const canCancel =
    pending && handoff?.canCancel === true;

  const canRequest =
    handoff !== null &&
    (
      handoff.status === "automation" ||
      handoff.status === "released" ||
      (!handoff.exists &&
        handoff.status === "not_recorded")
    );

  const canComplete =
    pending &&
    ownsConversation &&
    handoff?.canComplete === true;

  const canRelease =
    staffOwned &&
    ownsConversation &&
    handoff?.canRelease === true;

  const actionBusy =
    ownershipLoading ||
    ownershipRefreshing ||
    handoffSubmitting ||
    sending ||
    Boolean(ownershipError);

  const canSend =
    staffMessagingEnabled &&
    staffOwned &&
    ownsConversation &&
    !actionBusy;

  async function sendGuestMessage() {
    const text = draftMessage.trim();

    if (
      !canSend ||
      sending ||
      sendingGuardRef.current ||
      sendReviewRequired ||
      attemptedRequestRef.current !== null ||
      text.length < 1 ||
      text.length > 1600
    ) {
      return;
    }

    // Prevent repeat-clicks synchronously, even before React rerenders.
    sendingGuardRef.current = true;
    setSending(true);
    setSendError("");
    setSendSuccess("");

    let submitted = false;
    try {
      // The read-only preflight is not the security boundary.
      // The send endpoint independently performs atomic authorization.
      const ownershipResponse = await fetch(
        `/api/staff/reservations/${encodeURIComponent(
          reservationId,
        )}/conversation/ownership`,
        {
          method: "GET",
          credentials: "same-origin",
          cache: "no-store",
        },
      );

      const current: OwnershipResponse =
        await ownershipResponse.json();

      if (
        !ownershipResponse.ok ||
        current.success !== true ||
        current.staffMessagingEnabled !== true ||
        current.handoff?.status !== "staff" ||
        current.handoff.claimedByCurrentManager !== true ||
        current.handoff.reservationId !== reservationId
      ) {
        setStaffMessagingEnabled(false);
        setHandoff(null);
        throw new Error(
          "Staff ownership could not be verified. No submission was attempted.",
        );
      }

      // A new UUID identifies a single message attempt. Never create a
      // second operation ID to retry an ambiguous submission.
      const clientRequestId = crypto.randomUUID();
      attemptedRequestRef.current = { clientRequestId, body: text };
      submitted = true;

      const response = await fetch(
        `/api/staff/reservations/${encodeURIComponent(
          reservationId,
        )}/conversation/send`,
        {
          method: "POST",
          credentials: "same-origin",
          cache: "no-store",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ body: text, clientRequestId }),
        },
      );

      const result: {
        success?: boolean;
        error?: string;
        operationStatus?: string;
        operationId?: string;
        messageSid?: string;
        duplicate?: boolean;
      } = await response.json();

      if (
        !response.ok ||
        result.success !== true ||
        result.operationStatus !== "accepted" ||
        typeof result.messageSid !== "string" ||
        !/^SM[0-9a-f]{32}$/i.test(result.messageSid)
      ) {
        throw new Error(
          result.error ||
            "SMS acceptance could not be confirmed. Do not resend this request; contact an administrator.",
        );
      }

      attemptedRequestRef.current = null;
      setSendReviewRequired(false);
      setDraftMessage("");
      setSendSuccess(
        "Twilio accepted the SMS. Check the conversation history for its delivery status.",
      );

      await loadConversation(
        new AbortController().signal,
        false,
      );
    } catch (caught) {
      // Once POST was attempted, network failures and error responses
      // cannot safely be interpreted as a definitively rejected send.
      if (submitted) setSendReviewRequired(true);
      setSendError(
        (caught instanceof Error ? caught.message : "SMS result unavailable.") +
          (submitted
            ? " Do not submit another copy of this message. Have an administrator review the SMS operation and Twilio records."
            : ""),
      );
    } finally {
      sendingGuardRef.current = false;
      setSending(false);
    }
  }

  const handoffLabel =
    ownershipLoading
      ? "CHECKING OWNERSHIP..."
      : handoffSubmitting
        ? "UPDATING CONVERSATION..."
        : canCancel
          ? "CANCEL HANDOFF"
          : pending
            ? "HANDOFF PENDING"
            : staffOwned
              ? "STAFF MANAGED"
              : canRequest
                ? "JOIN CONVERSATION"
                : "JOIN UNAVAILABLE";

  const statusLabel =
    canSend
      ? "Staff Messaging"
      : staffOwned
        ? ownsConversation
          ? "Staff Owned · Messaging Disabled"
          : "Staff Managed · View Only"
        : pending
          ? "Handoff Pending · View Only"
          : "View Only";

  return (
    <section
      id="guest-conversation"
      aria-labelledby="guest-conversation-heading"
      className="rounded-xl border border-white/10 bg-zinc-950/90 p-5 sm:p-6"
    >
      <button
        type="button"
        onClick={() => {
          if (!expanded) {
            didInitialScrollRef.current = false;
            followLatestRef.current = true;
          } else {
            clearScrollHideTimer();
            setScrollDirection(null);
          }

          setExpanded((current) => !current);
        }}
        aria-expanded={expanded}
        aria-controls="guest-conversation-content"
        className="flex w-full min-h-11 items-start justify-between gap-3 rounded-lg text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ea1b24]"
      >
        <div className="min-w-0 flex-1">
          <h2
            id="guest-conversation-heading"
            className="text-lg font-bold text-white"
          >
            Guest Conversation
          </h2>

          <p className="mt-2 text-sm leading-6 text-zinc-400">
            Review messages and stay connected with your guest.
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-3">
            <span
              className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-zinc-300"
            >
              {statusLabel}
            </span>

            <span
              className="inline-flex items-center gap-2 text-xs font-medium text-zinc-300"
              aria-live="polite"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
              >
                <path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5 9 9 0 0 1-4-.9L3 21l1.9-5.5a9 9 0 0 1-.9-4A8.5 8.5 0 0 1 12.5 3H13a8 8 0 0 1 8 8v.5Z" />
              </svg>

              {loading && !loaded
                ? "Loading messages..."
                : loaded
                  ? `${messages.length} ${
                      messages.length === 1
                        ? "message"
                        : "messages"
                    }`
                  : "Messages unavailable"}
            </span>
          </div>
        </div>

        <span
          aria-hidden="true"
          className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/15 bg-white/5 text-zinc-200"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`h-5 w-5 transition-transform ${
              expanded ? "rotate-180" : ""
            }`}
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </span>
      </button>

      {expanded && (
        <div id="guest-conversation-content">
          {loading && (
            <div
              role="status"
              className="mt-6 rounded-lg border border-white/10 bg-black/40 p-5 text-sm text-zinc-300"
            >
              Loading guest conversation...
            </div>
          )}

          {error && (
            <div
              role="alert"
              className="mt-6 rounded-lg border border-amber-500/30 bg-amber-950/20 p-4"
            >
              <p className="text-sm font-semibold text-amber-200">
                Conversation Unavailable
              </p>

              <p className="mt-2 text-sm leading-6 text-amber-100">
                {error}
              </p>

              <p className="mt-2 text-xs leading-5 text-amber-200/80">
                No reservation details or messages have been changed.
              </p>
            </div>
          )}

          {!loading && loaded && (
            <>
              {historyMayBeTruncated && (
                <p className="mt-4 rounded-lg border border-amber-500/20 bg-amber-950/10 p-3 text-xs leading-5 text-amber-200">
                  Older messages may exist outside the history shown here.
                </p>
              )}

              {messages.length === 0 ? (
                <div className="mt-5 rounded-lg border border-white/10 bg-black/40 p-5">
                  <p className="text-sm font-semibold text-white">
                    No Messages Found
                  </p>

                  <p className="mt-2 text-sm leading-6 text-zinc-400">
                    We couldn't find SMS messages between this guest
                    and the restaurant's configured number.
                  </p>
                </div>
              ) : (
                <div className="relative mt-5">
                  <ol
                    ref={messageListRef}
                    onScroll={handleMessageScroll}
                    aria-label="Guest SMS history"
                    className="max-h-[650px] space-y-4 overflow-y-auto overscroll-contain rounded-lg border border-white/10 bg-black/40 p-3 sm:p-5"
                  >
                    {messages.map((message) => {
                      const incoming =
                        message.direction === "inbound";

                      const deliveryFailed =
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
                              ? "justify-end"
                              : "justify-start"
                          }`}
                        >
                          <article
                            className={`min-w-0 max-w-[90%] rounded-xl border p-3 sm:max-w-[80%] sm:p-4 ${
                              incoming
                                ? "border-[#ea1b24]/30 bg-[#ea1b24]/10"
                                : "border-white/10 bg-zinc-900"
                            }`}
                          >
                            <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                              <p className="text-xs font-bold text-white">
                                {incoming
                                  ? "Guest"
                                  : "Fin & Feathers"}
                              </p>

                              <span
                                className={`text-xs ${
                                  deliveryFailed
                                    ? "text-amber-300"
                                    : "text-zinc-400"
                                }`}
                              >
                                {getMessageStatus(message)}
                              </span>
                            </div>

                            <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-zinc-100">
                              {message.body ||
                                "(No text content available)"}
                            </p>

                            <p className="mt-3 text-xs text-zinc-500">
                              {formatTimestamp(
                                message.dateSent ??
                                  message.dateCreated,
                              )}
                            </p>

                            {deliveryFailed && (
                              <p className="mt-2 text-xs font-medium text-amber-200">
                                This message may not have reached the guest.
                                Review its status before sending again.
                              </p>
                            )}
                          </article>
                        </li>
                      );
                    })}
                  </ol>

                  {scrollDirection === "up" && canScrollUp && (
                    <button
                      type="button"
                      onClick={() => jumpTo("top")}
                      aria-label="Scroll to oldest message"
                      title="Scroll to oldest message"
                      className="absolute left-1/2 top-3 z-10 flex h-11 w-11 -translate-x-1/2 items-center justify-center rounded-full border border-white/25 bg-zinc-800/95 text-white shadow-lg transition hover:bg-zinc-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                    >
                      <svg
                        aria-hidden="true"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-5 w-5"
                      >
                        <path d="m6 15 6-6 6 6" />
                        <path d="M12 9v11" />
                        <path d="M5 4h14" />
                      </svg>
                    </button>
                  )}

                  {scrollDirection === "down" && canScrollDown && (
                    <button
                      type="button"
                      onClick={() => jumpTo("bottom")}
                      aria-label="Scroll to newest message"
                      title="Scroll to newest message"
                      className="absolute bottom-3 left-1/2 z-10 flex h-11 w-11 -translate-x-1/2 items-center justify-center rounded-full border border-white/25 bg-zinc-800/95 text-white shadow-lg transition hover:bg-zinc-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                    >
                      <svg
                        aria-hidden="true"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-5 w-5"
                      >
                        <path d="m6 9 6 6 6-6" />
                        <path d="M12 4v11" />
                        <path d="M5 20h14" />
                      </svg>
                    </button>
                  )}
                </div>
              )}
            </>
          )}

          <div className="mt-6 border-t border-white/10 pt-5">
            <div className="grid gap-3 sm:grid-cols-3">
              <button
                type="button"
                onClick={() => void refreshConversation()}
                disabled={
                  loading ||
                  refreshing ||
                  ownershipLoading ||
                  ownershipRefreshing ||
                  handoffSubmitting ||
                  sending
                }
                className="min-h-11 rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {refreshing
                  ? "Refreshing..."
                  : "REFRESH MESSAGES"}
              </button>

              <a
                href={`/api/staff/reservations/${encodeURIComponent(
                  reservationId,
                )}/conversation/pdf`}
                download
                aria-disabled={!loaded || loading || !!error}
                onClick={(event) => {
                  if (!loaded || loading || !!error) {
                    event.preventDefault();
                  }
                }}
                className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10 ${
                  !loaded || loading || !!error
                    ? "cursor-not-allowed opacity-40"
                    : ""
                }`}
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                >
                  <path d="M12 3v12m0 0 4-4m-4 4-4-4M5 17v3h14v-3" />
                </svg>
                SAVE AS PDF
              </a>

              <button
                type="button"
                onClick={() =>
                  void updateHandoff(
                    canCancel ? "cancel" : "request",
                  )
                }
                disabled={
                  actionBusy ||
                  (!canRequest && !canCancel)
                }
                className="min-h-11 rounded-lg bg-[#ea1b24] px-4 py-3 text-sm font-bold text-white transition hover:bg-red-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                {handoffLabel}
              </button>
            </div>

            {(pending || staffOwned) && (
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {pending && ownsConversation && (
                  <button
                    type="button"
                    onClick={() =>
                      void updateStaffOwnership("complete")
                    }
                    disabled={actionBusy || !canComplete}
                    className="min-h-11 rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-sm font-bold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {handoffSubmitting
                      ? "VERIFYING TAKEOVER..."
                      : "COMPLETE HANDOFF"}
                  </button>
                )}

                {staffOwned && ownsConversation && (
                  <button
                    type="button"
                    onClick={() =>
                      void updateStaffOwnership("release")
                    }
                    disabled={actionBusy || !canRelease}
                    className="min-h-11 rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-sm font-bold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {handoffSubmitting
                      ? "RELEASING..."
                      : "LEAVE CONVERSATION"}
                  </button>
                )}
              </div>
            )}

            {ownershipError && (
              <div
                role="alert"
                className="mt-4 rounded-lg border border-amber-500/30 bg-amber-950/20 p-4 text-sm text-amber-100"
              >
                {ownershipError} Refresh ownership before
                attempting another action.

                <button
                  type="button"
                  disabled={
                    ownershipLoading ||
                    ownershipRefreshing ||
                    handoffSubmitting
                  }
                  onClick={() =>
                    void loadOwnership(
                      new AbortController().signal,
                      false,
                    )
                  }
                  className="mt-3 block rounded-md border border-amber-400/30 px-3 py-2 font-semibold disabled:opacity-40"
                >
                  RETRY OWNERSHIP CHECK
                </button>
              </div>
            )}

            {handoffMessage && !ownershipError && (
              <p
                role="status"
                className="mt-4 rounded-lg border border-white/15 bg-white/5 p-4 text-sm text-zinc-200"
              >
                {handoffMessage}
              </p>
            )}

            {pending && !ownershipError && (
              <p className="mt-4 text-sm text-zinc-300">
                {canCancel
                  ? "Your handoff request is pending. You can cancel it here."
                  : "Another manager has requested this conversation. Only the requesting manager can cancel it."}
                {!canComplete && ownsConversation && (
                  <span className="mt-2 block text-xs text-zinc-400">
                    Completing takeover remains unavailable until
                    inbound routing is verified.
                  </span>
                )}
              </p>
            )}

            {staffOwned && !ownershipError && (
              <p className="mt-4 text-sm text-zinc-300">
                {ownsConversation
                  ? "You own this conversation. Direct replies require separate messaging authorization."
                  : "This conversation is managed by another staff member."}
              </p>
            )}

            <div className="mt-5 border-t border-white/10 pt-5">
              <label
                htmlFor="staff-guest-message"
                className="block text-sm font-semibold text-white"
              >
                Message Guest
              </label>

              <textarea
                id="staff-guest-message"
                rows={4}
                maxLength={1600}
                value={draftMessage}
                onChange={(event) => {
                  setDraftMessage(event.target.value);
                  setSendError("");
                  setSendSuccess("");
                }}
                disabled={!canSend || sending || sendReviewRequired}
                placeholder={
                  canSend
                    ? "Type an SMS reply to your guest..."
                    : "Direct messaging is available after verified staff takeover."
                }
                className="mt-3 w-full resize-y rounded-lg border border-white/20 bg-black/40 p-3 text-sm text-white placeholder:text-zinc-500 focus-visible:outline-2 focus-visible:outline-[#ea1b24] disabled:cursor-not-allowed disabled:opacity-50"
              />

              <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs text-zinc-400">
                  {draftMessage.length}/1600 characters
                </span>

                <button
                  type="button"
                  onClick={() => void sendGuestMessage()}
                  disabled={
                    !canSend ||
                    sending ||
                    sendReviewRequired ||
                    !draftMessage.trim()
                  }
                  className="min-h-11 rounded-lg bg-[#ea1b24] px-5 py-3 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {sending
                    ? "SENDING..."
                    : sendReviewRequired
                      ? "REVIEW REQUIRED"
                      : "SEND SMS"}
                </button>
              </div>

              {sendError && (
                <p
                  role="alert"
                  className="mt-3 text-sm text-amber-200"
                >
                  {sendError}
                </p>
              )}

              {sendSuccess && (
                <p
                  role="status"
                  className="mt-3 text-sm text-emerald-300"
                >
                  {sendSuccess}
                </p>
              )}

              {!canSend && (
                <p className="mt-3 text-xs leading-5 text-zinc-400">
                  Direct SMS remains disabled until staff
                  ownership and server-side messaging are
                  enabled. A pending handoff does not grant
                  sending permission.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
