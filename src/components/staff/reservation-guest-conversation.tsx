"use client";

import {
  useCallback,
  useEffect,
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
  claimedByCurrentManager: boolean;
  canCancel: boolean;
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
  const [messages, setMessages] = useState<
    ConversationMessage[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [loaded, setLoaded] = useState(false);

  const [
    historyMayBeTruncated,
    setHistoryMayBeTruncated,
  ] = useState(false);

  const [handoff, setHandoff] = useState<HandoffState | null>(null);
  const [ownershipLoading, setOwnershipLoading] = useState(true);
  const [ownershipRefreshing, setOwnershipRefreshing] = useState(false);
  const [ownershipError, setOwnershipError] = useState("");
  const [handoffSubmitting, setHandoffSubmitting] = useState(false);
  const [handoffMessage, setHandoffMessage] = useState("");
  const [staffMessagingEnabled, setStaffMessagingEnabled] = useState(false);
  const [draftMessage, setDraftMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");
  const [sendSuccess, setSendSuccess] = useState("");

  const loadConversation = useCallback(
    async (
      signal: AbortSignal,
      initial: boolean,
    ) => {
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

        if (
          !response.ok ||
          result.success !== true
        ) {
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

        if (signal.aborted) return;

        setMessages(result.messages);

        setHistoryMayBeTruncated(
          result.historyMayBeTruncated === true,
        );

        setLoaded(true);
      } catch (caught) {
        if (signal.aborted) return;

        setError(
          caught instanceof Error
            ? caught.message
            : "We couldn't load the guest conversation.",
        );
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
    async (signal: AbortSignal, initial: boolean) => {
      if (initial) {
        setOwnershipLoading(true);
        setHandoff(null);
        setStaffMessagingEnabled(false);
      } else {
        setOwnershipRefreshing(true);
      }
      setOwnershipError("");

      try {
        const response = await fetch(
          `/api/staff/reservations/${encodeURIComponent(reservationId)}/conversation/ownership`,
          { method: "GET", credentials: "same-origin", cache: "no-store", signal },
        );
        const result: OwnershipResponse = await response.json();

        if (!response.ok || result.success !== true || !result.handoff) {
          throw new Error(result.error || "Couldn't verify conversation ownership.");
        }
        if (typeof result.staffMessagingEnabled !== "boolean") {
          throw new Error("Messaging permissions could not be verified.");
        }
        if (signal.aborted) return;
        setHandoff(result.handoff);
        setStaffMessagingEnabled(result.staffMessagingEnabled);
      } catch (caught) {
        if (signal.aborted) return;
        // Do not trust stale ownership after a failed refresh.
        setHandoff(null);
        setStaffMessagingEnabled(false);
        setOwnershipError(
          caught instanceof Error ? caught.message : "Couldn't verify conversation ownership.",
        );
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
    if (loading || refreshing || ownershipLoading || ownershipRefreshing || handoffSubmitting || sending) return;
    const controller = new AbortController();
    await Promise.all([
      loadConversation(controller.signal, false),
      loadOwnership(controller.signal, false),
    ]);
  }

  async function updateHandoff(action: "request" | "cancel") {
    if (handoffSubmitting || ownershipLoading || ownershipRefreshing || !handoff) return;
    setHandoffSubmitting(true);
    setHandoffMessage("");
    setOwnershipError("");
    try {
      const response = await fetch(
        `/api/staff/reservations/${encodeURIComponent(reservationId)}/conversation/handoff`,
        {
          method: "POST",
          credentials: "same-origin",
          cache: "no-store",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action }),
        },
      );
      const result: HandoffActionResponse = await response.json();
      if (!response.ok || result.success !== true) {
        throw new Error(result.error || "Handoff request failed.");
      }
      if (
        result.ownership !== (action === "request" ? "handoff_pending" : "automation") ||
        result.staffMessagingEnabled !== false
      ) {
        throw new Error("Handoff result could not be verified.");
      }

      // Always re-read canonical ownership; do not infer permissions
      // from a POST response or enable an SMS composer.
      const controller = new AbortController();
      await loadOwnership(controller.signal, false);
      setHandoffMessage(
        action === "request"
          ? "Handoff requested. Automated routing remains unchanged; staff replies are not enabled."
          : "Pending handoff canceled. Staff replies remain disabled.",
      );
    } catch (caught) {
      setHandoff(null);
      setOwnershipError(
        caught instanceof Error ? caught.message : "Unable to update the handoff request.",
      );
    } finally {
      setHandoffSubmitting(false);
    }
  }

  const canSend =
    staffMessagingEnabled &&
    handoff?.status === "staff" &&
    handoff.claimedByCurrentManager === true &&
    !ownershipLoading &&
    !ownershipRefreshing &&
    !ownershipError &&
    !handoffSubmitting;

  async function sendGuestMessage() {
    const text = draftMessage.trim();
    if (!canSend || sending || text.length < 1 || text.length > 1600) return;

    setSending(true);
    setSendError("");
    setSendSuccess("");
    try {
      // Re-verify canonical ownership immediately before sending.
      const ownershipResponse = await fetch(
        `/api/staff/reservations/${encodeURIComponent(reservationId)}/conversation/ownership`,
        { method: "GET", credentials: "same-origin", cache: "no-store" },
      );
      const current: OwnershipResponse = await ownershipResponse.json();
      if (
        !ownershipResponse.ok ||
        current.success !== true ||
        current.staffMessagingEnabled !== true ||
        current.handoff?.status !== "staff" ||
        current.handoff.claimedByCurrentManager !== true
      ) {
        setStaffMessagingEnabled(false);
        setHandoff(null);
        throw new Error("Staff ownership could not be verified. No message was sent.");
      }

      // This endpoint is implemented and secured in the next server-side step.
      const response = await fetch(
        `/api/staff/reservations/${encodeURIComponent(reservationId)}/conversation/send`,
        {
          method: "POST",
          credentials: "same-origin",
          cache: "no-store",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ body: text }),
        },
      );
      const result: { success?: boolean; error?: string } = await response.json();
      if (!response.ok || result.success !== true) {
        throw new Error(result.error || "Message was not accepted. Check the conversation before retrying.");
      }
      setDraftMessage("");
      setSendSuccess("Message accepted by Twilio. Check delivery status in the conversation history.");
      await loadConversation(new AbortController().signal, false);
    } catch (caught) {
      setSendError(caught instanceof Error ? caught.message : "Could not send message. Check history before retrying.");
    } finally {
      setSending(false);
    }
  }

  const pending = handoff?.status === "handoff_pending";
  const canCancel = pending && handoff?.canCancel === true;
  const canRequest =
    handoff !== null &&
    (handoff.status === "automation" ||
      handoff.status === "released" ||
      (!handoff.exists && handoff.status === "not_recorded"));
  const actionDisabled =
    ownershipLoading || ownershipRefreshing || handoffSubmitting ||
    Boolean(ownershipError) || (!canRequest && !canCancel);
  const handoffLabel = ownershipLoading
    ? "CHECKING OWNERSHIP..."
    : handoffSubmitting
      ? "UPDATING HANDOFF..."
      : canCancel
        ? "CANCEL HANDOFF"
        : pending
          ? "HANDOFF PENDING"
          : canRequest
            ? "JOIN CONVERSATION"
            : "JOIN UNAVAILABLE";

  return (
    <section
      id="guest-conversation"
      aria-labelledby="guest-conversation-heading"
      className="rounded-xl border border-white/10 bg-zinc-950/90 p-5 sm:p-6"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2
            id="guest-conversation-heading"
            className="text-lg font-bold text-white"
          >
            Guest Conversation
          </h2>

          <p className="mt-2 text-sm leading-6 text-zinc-400">
            Review messages and stay connected
            with your guest.
          </p>
        </div>

        <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-zinc-300">
          {canSend ? "Staff Messaging" : pending ? "Handoff Pending · View Only" : "View Only"}
        </span>
      </div>

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
            No reservation details or messages
            have been changed.
          </p>
        </div>
      )}

      {!loading && loaded && (
        <>
          <div className="mt-5">
            <p className="text-xs font-medium text-zinc-400">
              {messages.length === 1
                ? "1 message"
                : `${messages.length} messages`}
            </p>
          </div>

          {historyMayBeTruncated && (
            <p className="mt-4 rounded-lg border border-amber-500/20 bg-amber-950/10 p-3 text-xs leading-5 text-amber-200">
              Older messages may exist outside
              the history shown here.
            </p>
          )}

          {messages.length === 0 ? (
            <div className="mt-5 rounded-lg border border-white/10 bg-black/40 p-5">
              <p className="text-sm font-semibold text-white">
                No Messages Found
              </p>

              <p className="mt-2 text-sm leading-6 text-zinc-400">
                We couldn't find SMS messages
                between this guest and the
                restaurant's configured number.
              </p>
            </div>
          ) : (
            <ol
              aria-label="Guest SMS history"
              className="mt-5 max-h-[650px] space-y-4 overflow-y-auto rounded-lg border border-white/10 bg-black/40 p-3 sm:p-5"
            >
              {messages.map((message) => {
                const incoming =
                  message.direction === "inbound";

                const deliveryFailed =
                  !incoming &&
                  (message.status === "failed" ||
                    message.status === "undelivered");

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
                          This message may not have
                          reached the guest. Review
                          its status before sending
                          again.
                        </p>
                      )}
                    </article>
                  </li>
                );
              })}
            </ol>
          )}
        </>
      )}

      <div className="mt-6 border-t border-white/10 pt-5">
        <div className="grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={refreshConversation}
            disabled={loading || refreshing || ownershipLoading || ownershipRefreshing || handoffSubmitting || sending}
            className="min-h-11 rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {refreshing
              ? "Refreshing..."
              : "REFRESH MESSAGES"}
          </button>

          <button
            type="button"
            onClick={() => void updateHandoff(canCancel ? "cancel" : "request")}
            disabled={actionDisabled}
            className="min-h-11 rounded-lg bg-[#ea1b24] px-4 py-3 text-sm font-bold text-white transition hover:bg-red-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            {handoffLabel}
          </button>
        </div>

        {ownershipError && (
          <div role="alert" className="mt-4 rounded-lg border border-amber-500/30 bg-amber-950/20 p-4 text-sm text-amber-100">
            {ownershipError} Ownership must be verified before another handoff request.
            <button
              type="button"
              disabled={ownershipLoading || ownershipRefreshing || handoffSubmitting}
              onClick={() => void loadOwnership(new AbortController().signal, false)}
              className="mt-3 block rounded-md border border-amber-400/30 px-3 py-2 font-semibold disabled:opacity-40"
            >
              RETRY OWNERSHIP CHECK
            </button>
          </div>
        )}
        {handoffMessage && !ownershipError && (
          <p role="status" className="mt-4 rounded-lg border border-white/15 bg-white/5 p-4 text-sm text-zinc-200">
            {handoffMessage}
          </p>
        )}
        {pending && !ownershipError && (
          <p className="mt-4 text-sm text-zinc-300">
            {canCancel
              ? "Your handoff request is pending. You can cancel it here."
              : "Another manager has requested this conversation. Only the requesting manager can cancel it."}
          </p>
        )}
        <div className="mt-5 border-t border-white/10 pt-5">
          <label htmlFor="staff-guest-message" className="block text-sm font-semibold text-white">
            Message Guest
          </label>
          <textarea
            id="staff-guest-message"
            rows={4}
            maxLength={1600}
            value={draftMessage}
            onChange={(event) => { setDraftMessage(event.target.value); setSendError(""); setSendSuccess(""); }}
            disabled={!canSend || sending}
            placeholder={canSend ? "Type an SMS reply to your guest..." : "Direct messaging is available after verified staff takeover."}
            className="mt-3 w-full resize-y rounded-lg border border-white/20 bg-black/40 p-3 text-sm text-white placeholder:text-zinc-500 focus-visible:outline-2 focus-visible:outline-[#ea1b24] disabled:cursor-not-allowed disabled:opacity-50"
          />
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs text-zinc-400">{draftMessage.length}/1600 characters</span>
            <button
              type="button"
              onClick={() => void sendGuestMessage()}
              disabled={!canSend || sending || !draftMessage.trim()}
              className="min-h-11 rounded-lg bg-[#ea1b24] px-5 py-3 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {sending ? "SENDING..." : "SEND SMS"}
            </button>
          </div>
          {sendError && <p role="alert" className="mt-3 text-sm text-amber-200">{sendError}</p>}
          {sendSuccess && <p role="status" className="mt-3 text-sm text-emerald-300">{sendSuccess}</p>}
          {!canSend && (
            <p className="mt-3 text-xs leading-5 text-zinc-400">
              Direct SMS remains disabled until staff ownership and server-side messaging are enabled. A pending handoff does not grant sending permission.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}