"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import RecoverConversationButton, {
  type RecoveryStatus,
} from "@/components/staff/recover-conversation-button";

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

type ActiveIntervention = {
  id: string;
  reservation_request_id: string;
  conversation_id: string;
  intervention_type: string;
  status: "draft" | "awaiting_guest" | "staff_review";
  mode_version_at_start: number;
  initiated_by: string;
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
  details: {
    revised_times?: string[];
    draft_saved_at?: string;
    draft_saved_by?: string;
    send_claim?: { client_request_id?: string; claimed_at?: string };
    outbound_message_sid?: string;
    guest_choice?: {
      inbound_message_sid: string;
      option_number: number;
      selected_time: string;
      verified_at: string;
    };
  };
};

type InterventionPanelProps = {
  messages: ConversationMessage[];
  reservationId: string;
  conversationId: string | null | undefined;
  modeVersion: number | null | undefined;
  staffModeVerified: boolean;
  sharedLoading: boolean;
  joining: boolean;
  resuming: boolean;
  onResumeBlockedChange: (blocked: boolean) => void;
};

const PAGE_SIZE = 10;
const MAX_MESSAGE_LENGTH = 1600;
const POLL_INTERVAL_MS = 8000;
const FULL_VERIFICATION_INTERVAL_MS = 60_000;

const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const MESSAGE_SID = /^SM[0-9a-f]{32}$/i;
const FINGERPRINT = /^[0-9a-f]{64}$/;

function isRecord(
  value: unknown,
): value is Record<string, unknown> {
  return (
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value)
  );
}

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

  const row = value as Record<string, unknown>;

  return (
    typeof row.sid === "string" &&
    MESSAGE_SID.test(row.sid) &&
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
    new Set(result.messages.map(
      (message) => message.sid,
    )).size === result.messages.length &&
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

function sortMessages(
  messages: ConversationMessage[],
): ConversationMessage[] {
  return [...messages].sort((a, b) => {
    const aTime = a.dateCreated
      ? Date.parse(a.dateCreated)
      : 0;

    const bTime = b.dateCreated
      ? Date.parse(b.dateCreated)
      : 0;

    return (
      (Number.isFinite(aTime) ? aTime : 0) -
      (Number.isFinite(bTime) ? bTime : 0) ||
      a.sid.localeCompare(b.sid)
    );
  });
}

function mergeMessages(
  incoming: ConversationMessage[],
  existing: ConversationMessage[],
): ConversationMessage[] {
  const merged = new Map<string, ConversationMessage>();

  for (const message of existing) {
    merged.set(message.sid, message);
  }

  for (const message of incoming) {
    merged.set(message.sid, message);
  }

  return sortMessages([...merged.values()]);
}

function sameMessages(
  a: ConversationMessage[],
  b: ConversationMessage[],
): boolean {
  if (a.length !== b.length) return false;

  return a.every((message, index) => {
    const other = b[index];

    return (
      message.sid === other.sid &&
      message.direction === other.direction &&
      message.body === other.body &&
      message.status === other.status &&
      message.dateCreated === other.dateCreated &&
      message.dateSent === other.dateSent &&
      message.errorCode === other.errorCode
    );
  });
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
      return "Staff Access";
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

/**
 * A separate, reservation-scoped staff intervention entry point.
 * This panel never sends SMS or changes reservation availability.
 * The server and database remain authoritative for ownership.
 */
function StaffInterventionPanel({
  messages,
  reservationId,
  conversationId,
  modeVersion,
  staffModeVerified,
  sharedLoading,
  joining,
  resuming,
  onResumeBlockedChange,
}: InterventionPanelProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  // Unlike a status-load error, an uncertain SMS outcome must survive refreshes.
  const [sendReviewWarning, setSendReviewWarning] = useState("");
  const [message, setMessage] = useState("");
  const [active, setActive] = useState<ActiveIntervention | null>(null);
  const [starting, setStarting] = useState(false);
  const [canceling, setCanceling] = useState(false);
  const [savingTimes, setSavingTimes] = useState(false);
  const [sendingOptions, setSendingOptions] = useState(false);
  const [reconcilingSend, setReconcilingSend] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [applyingSelectedTime, setApplyingSelectedTime] = useState(false);
  const [recordingGuestChoice, setRecordingGuestChoice] = useState(false);
  const selectionGuardRef = useRef(false);
  const resolveGuardRef = useRef(false);
  const applyTimeGuardRef = useRef(false);
  const sendGuardRef = useRef(false);
  const reconcileSendGuardRef = useRef(false);
  const [reservationDate, setReservationDate] = useState("");
  const [revisedTimes, setRevisedTimes] = useState<string[]>(["", "", ""]);
  const saveGuardRef = useRef(false);
  const cancelGuardRef = useRef(false);
  const startGuardRef = useRef(false);
  // Keep a request key across retries, including uncertain network outcomes.
  const pendingRequestKeyRef = useRef<string | null>(null);

  const loadActive = useCallback(async (signal?: AbortSignal) => {
    onResumeBlockedChange(true);
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `/api/staff/reservations/${encodeURIComponent(reservationId)}/interventions/active`,
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
        !payload ||
        typeof payload !== "object" ||
        Array.isArray(payload)
      ) {
        throw new Error(errorDetail(payload, "Unable to check staff interventions."));
      }

      const result = payload as Record<string, unknown>;
      if (
        result.success !== true ||
        result.reservationId !== reservationId ||
        typeof result.hasActiveIntervention !== "boolean"
      ) {
        throw new Error("The intervention status response could not be verified.");
      }

      if (typeof result.reservationDate !== "string" ||
          !/^\d{4}-\d{2}-\d{2}$/.test(result.reservationDate)) {
        throw new Error("The reservation date could not be verified.");
      }
      setReservationDate(result.reservationDate);
      const row = result.intervention;
      if (result.hasActiveIntervention) {
        if (
          !row ||
          typeof row !== "object" ||
          Array.isArray(row)
        ) {
          throw new Error("The active intervention record is invalid.");
        }
        const intervention = row as ActiveIntervention;
        if (
          !UUID.test(intervention.id) ||
          intervention.reservation_request_id !== reservationId ||
          !UUID.test(intervention.conversation_id) ||
          intervention.intervention_type !== "revised_availability" ||
          !["draft", "awaiting_guest", "staff_review"].includes(intervention.status)
        ) {
          throw new Error("Intervention state requires staff review.");
        }
        if (signal?.aborted) return;
        const saved = intervention.details?.revised_times;
        if (saved !== undefined && (!Array.isArray(saved) ||
            saved.length > 3 || !saved.every((t) =>
              typeof t === "string" && /^(1[0-9]|2[0-1]):(00|30)$|^22:00$/.test(t)))) {
          throw new Error("Stored revised-time options require staff review.");
        }
        setRevisedTimes([...(saved ?? []), "", "", ""].slice(0, 3));
        setActive(intervention);
        // An accepted, completed send has been reconciled authoritatively.
        if (intervention.status === "awaiting_guest" || intervention.status === "staff_review") {
          setSendReviewWarning("");
        }
        pendingRequestKeyRef.current = null;
        onResumeBlockedChange(true);
      } else {
        if (row !== null) {
          throw new Error("The intervention lookup returned inconsistent results.");
        }
        if (signal?.aborted) return;
        setActive(null);
        setSendReviewWarning("");
        setRevisedTimes(["", "", ""]);
        // A successful start request awaiting reconciliation must not
        // silently clear the local block on automation handback.
        onResumeBlockedChange(pendingRequestKeyRef.current !== null);
      }
    } catch (caught) {
      if (signal?.aborted) return;
      setError(
        caught instanceof Error
          ? caught.message
          : "Unable to verify staff interventions.",
      );
      onResumeBlockedChange(true);
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, [reservationId, onResumeBlockedChange]);

  useEffect(() => {
    const controller = new AbortController();
    void loadActive(controller.signal);
    return () => {
      controller.abort();
      onResumeBlockedChange(true);
    };
  }, [loadActive, conversationId, modeVersion, onResumeBlockedChange]);

  const canStart =
    !loading &&
    !error &&
    !starting &&
    !joining &&
    !resuming &&
    !sharedLoading &&
    active === null &&
    staffModeVerified &&
    typeof conversationId === "string" &&
    UUID.test(conversationId) &&
    typeof modeVersion === "number" &&
    Number.isSafeInteger(modeVersion) &&
    modeVersion >= 1;

  async function startIntervention() {
    if (!canStart || startGuardRef.current || !conversationId || !modeVersion) {
      return;
    }

    const requestKey = pendingRequestKeyRef.current ?? crypto.randomUUID();
    pendingRequestKeyRef.current = requestKey;
    startGuardRef.current = true;
    onResumeBlockedChange(true);
    setStarting(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch(
        `/api/staff/reservations/${encodeURIComponent(reservationId)}/interventions/start`,
        {
          method: "POST",
          credentials: "same-origin",
          cache: "no-store",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            conversationId,
            expectedModeVersion: modeVersion,
            requestKey,
          }),
        },
      );
      const payload: unknown = await response.json();
      if (
        !response.ok ||
        !payload ||
        typeof payload !== "object" ||
        Array.isArray(payload)
      ) {
        throw new Error(errorDetail(payload, "Unable to start the intervention."));
      }
      const result = payload as Record<string, unknown>;
      if (
        result.success !== true ||
        !UUID.test(String(result.interventionId ?? "")) ||
        result.smsSent !== false
      ) {
        throw new Error("The intervention start could not be verified.");
      }
      setMessage("Staff intervention created. Choose and save revised times below. No SMS has been sent.");
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Start outcome is uncertain. Review the active intervention before retrying.",
      );
    } finally {
      startGuardRef.current = false;
      setStarting(false);
      await loadActive();
    }
  }

  const savedTimes = active?.details?.revised_times ?? [];
  const canEditTimes = Boolean(
    active?.status === "draft" && staffModeVerified && !loading && !starting &&
    !savingTimes && !sendingOptions && !active?.details?.send_claim && !canceling && !joining && !resuming && !sharedLoading &&
    conversationId && active?.conversation_id === conversationId &&
    typeof modeVersion === "number" && modeVersion === active?.mode_version_at_start
  );

  async function saveTimes(times: string[]) {
    if (!canEditTimes || saveGuardRef.current || !active || !conversationId ||
        typeof modeVersion !== "number") return;
    if (times.length > 3 || times.some((t) =>
        !/^(1[0-9]|2[0-1]):(00|30)$|^22:00$/.test(t)) ||
        new Set(times).size !== times.length) {
      setError("Choose up to three unique 30-minute time slots between 10:00 AM and 10:00 PM.");
      return;
    }
    saveGuardRef.current = true;
    setSavingTimes(true);
    setError("");
    setMessage("");
    onResumeBlockedChange(true);
    try {
      const response = await fetch(
        `/api/staff/reservations/${encodeURIComponent(reservationId)}/interventions/save-times`,
        {
          method: "POST", credentials: "same-origin", cache: "no-store",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            interventionId: active.id,
            conversationId,
            expectedModeVersion: modeVersion,
            revisedTimes: times,
          }),
        },
      );
      const payload: unknown = await response.json();
      if (!response.ok || !payload || typeof payload !== "object" || Array.isArray(payload)) {
        throw new Error(errorDetail(payload, "Unable to save revised times."));
      }
      const result = payload as Record<string, unknown>;
      if (result.success !== true || result.timesSaved !== true ||
          result.interventionId !== active.id || result.smsSent !== false ||
          !Array.isArray(result.revisedTimes) ||
          JSON.stringify(result.revisedTimes) !== JSON.stringify(times)) {
        throw new Error("Revised-time save could not be verified. Refresh before retrying.");
      }
      setMessage(times.length
        ? "Revised times saved as a draft. No SMS was sent."
        : "Saved options cleared. You can cancel this unsent draft.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message :
        "Save outcome uncertain. Recheck the draft before retrying.");
    } finally {
      saveGuardRef.current = false;
      setSavingTimes(false);
      await loadActive();
    }
  }

  async function sendRevisedTimes() {
    if (!active || active.status !== "draft" || !conversationId ||
        !canEditTimes || savedTimes.length < 1 ||
        !staffModeVerified || typeof modeVersion !== "number" ||
        sendGuardRef.current || sendingOptions || Boolean(sendReviewWarning) || active.details?.send_claim ||
        JSON.stringify(revisedTimes.filter(Boolean)) !== JSON.stringify(savedTimes)) {
      setError("Save the current time options and verify staff ownership before sending.");
      return;
    }
    if (!window.confirm(
      `Send the ${savedTimes.length} saved revised time option(s) to this guest? ` +
      "This sends a real SMS. Do not press again if the result is uncertain."
    )) return;

    sendGuardRef.current = true;
    setSendingOptions(true);
    setMessage("");
    setError("");
    onResumeBlockedChange(true);
    try {
      const endpoint = `/api/staff/reservations/${encodeURIComponent(reservationId)}`;
      const context = {
        conversationId,
        expectedModeVersion: modeVersion,
        interventionId: active.id,
      };
      const preparedResponse = await fetch(`${endpoint}/interventions/prepare-send`, {
        method: "POST", credentials: "same-origin", cache: "no-store",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(context),
      });
      const prepared: unknown = await preparedResponse.json();
      if (!preparedResponse.ok || !prepared || typeof prepared !== "object" || Array.isArray(prepared)) {
        throw new Error(errorDetail(prepared, "Unable to prepare the message. Do not retry."));
      }
      const claim = prepared as Record<string, unknown>;
      if (claim.success !== true || claim.interventionId !== active.id ||
          claim.prepared !== true || typeof claim.clientRequestId !== "string" ||
          !UUID.test(claim.clientRequestId) || typeof claim.messageBody !== "string") {
        throw new Error("Send claim is uncertain. Do not retry without staff review.");
      }
      // Shared-conversation transport verifies staff mode, reservation association,
      // staff role, request idempotency, and Twilio acceptance. No legacy takeover.
      const sentResponse = await fetch(
        `/api/staff/conversations/${encodeURIComponent(conversationId)}/messages`, {
        method: "POST", credentials: "same-origin", cache: "no-store",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          body: claim.messageBody,
          clientRequestId: claim.clientRequestId,
          reservationId,
        }),
      });
      const sent: unknown = await sentResponse.json();
      if (!sentResponse.ok || !sent || typeof sent !== "object" || Array.isArray(sent)) {
        throw new Error(errorDetail(sent, "SMS outcome uncertain. Do not send again."));
      }
      const result = sent as Record<string, unknown>;
      if (result.success !== true || result.operationStatus !== "accepted" ||
          typeof result.messageSid !== "string" || !MESSAGE_SID.test(result.messageSid)) {
        throw new Error("Twilio acceptance is unverified. Do not resend.");
      }
      const completedResponse = await fetch(`${endpoint}/interventions/complete-send`, {
        method: "POST", credentials: "same-origin", cache: "no-store",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...context, clientRequestId: claim.clientRequestId }),
      });
      const completed: unknown = await completedResponse.json();
      if (!completedResponse.ok || !completed || typeof completed !== "object" || Array.isArray(completed)) {
        throw new Error(errorDetail(completed,
          "SMS accepted but intervention finalization needs staff review. Do not resend."));
      }
      const finish = completed as Record<string, unknown>;
      if (finish.success !== true || finish.status !== "awaiting_guest" ||
          finish.interventionId !== active.id) {
        throw new Error("Intervention completion is uncertain. Do not resend.");
      }
      setSendReviewWarning("");
      setMessage("Revised options accepted by Twilio. Await guest selection; reservation remains unconfirmed.");
    } catch (caught) {
      const detail = caught instanceof Error ? caught.message :
        "Send outcome uncertain. Do not retry or send another offer until reconciled.";
      setError(detail);
      setSendReviewWarning(`${detail} Do not resend. Check the existing send claim and reconcile its ledger status.`);
    } finally {
      sendGuardRef.current = false;
      setSendingOptions(false);
      await loadActive();
    }
  }

  // Completion-only recovery. This never invokes the SMS sending endpoint.
  // The existing RPC enforces the original claiming staff member and requires
  // an accepted ledger operation with the exact claimed body and request key.
  async function reconcileAcceptedSend() {
    const clientRequestId = active?.details?.send_claim?.client_request_id;
    if (!active || active.status !== "draft" || !active.details?.send_claim ||
        !clientRequestId || !UUID.test(clientRequestId) ||
        !conversationId || active.conversation_id !== conversationId ||
        !staffModeVerified || typeof modeVersion !== "number" ||
        !Number.isSafeInteger(modeVersion) || modeVersion < 1 ||
        active.mode_version_at_start !== modeVersion ||
        loading || sharedLoading || joining || resuming || sendingOptions ||
        reconcilingSend || reconcileSendGuardRef.current) return;

    if (!window.confirm(
      "Check the existing SMS ledger and complete this intervention ONLY if Twilio " +
      "acceptance is already recorded? This will NOT send or retry an SMS."
    )) return;

    reconcileSendGuardRef.current = true;
    setReconcilingSend(true);
    setError("");
    setMessage("");
    onResumeBlockedChange(true);
    try {
      const response = await fetch(
        `/api/staff/reservations/${encodeURIComponent(reservationId)}/interventions/complete-send`,
        {
          method: "POST", credentials: "same-origin", cache: "no-store",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            conversationId,
            expectedModeVersion: modeVersion,
            interventionId: active.id,
            clientRequestId,
          }),
        },
      );
      const payload: unknown = await response.json();
      if (!response.ok || !isRecord(payload)) {
        throw new Error(errorDetail(payload,
          "Accepted delivery could not be confirmed from the SMS ledger. Do not resend."));
      }
      if (payload.success !== true || payload.interventionId !== active.id ||
          payload.status !== "awaiting_guest") {
        throw new Error("Completion outcome is uncertain. Do not resend.");
      }
      setSendReviewWarning("");
      setMessage("Existing Twilio-accepted SMS verified and intervention completed. No new message was sent.");
    } catch (caught) {
      const detail = caught instanceof Error ? caught.message :
        "SMS ledger reconciliation failed.";
      setError(detail);
      setSendReviewWarning(`${detail} Do not resend. The original claiming staff member may need to reconcile the ledger.`);
    } finally {
      reconcileSendGuardRef.current = false;
      setReconcilingSend(false);
      await loadActive();
    }
  }

  async function cancelDraft() {
    if (
      cancelGuardRef.current || canceling || starting || loading || savingTimes || sendingOptions ||
      savedTimes.length > 0 || Boolean(active?.details?.send_claim) ||
      !active || active.status !== "draft" ||
      !staffModeVerified || !conversationId ||
      active.conversation_id !== conversationId ||
      typeof modeVersion !== "number" ||
      !Number.isSafeInteger(modeVersion) ||
      modeVersion < 1
    ) {
      return;
    }

    if (!window.confirm(
      "Cancel this unsent REVISE TIME OPTIONS draft? No SMS will be sent."
    )) {
      return;
    }

    cancelGuardRef.current = true;
    setCanceling(true);
    onResumeBlockedChange(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch(
        `/api/staff/reservations/${encodeURIComponent(reservationId)}/interventions/cancel`,
        {
          method: "POST",
          credentials: "same-origin",
          cache: "no-store",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            interventionId: active.id,
            conversationId,
            expectedModeVersion: modeVersion,
          }),
        },
      );
      const payload: unknown = await response.json();
      if (!response.ok || !payload || typeof payload !== "object" || Array.isArray(payload)) {
        throw new Error(errorDetail(payload, "Unable to cancel this intervention draft."));
      }
      const result = payload as Record<string, unknown>;
      if (
        result.success !== true ||
        result.interventionId !== active.id ||
        result.status !== "canceled" ||
        result.smsSent !== false
      ) {
        throw new Error("Draft cancellation could not be verified.");
      }
      setMessage("Draft canceled. No SMS was sent. You may now complete conversation handback.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Cancellation outcome uncertain. Recheck the intervention before trying again.");
    } finally {
      cancelGuardRef.current = false;
      setCanceling(false);
      await loadActive();
    }
  }

  async function applyVerifiedSelectedTime() {
    if (!active || active.status !== "staff_review" ||
        !active.details?.guest_choice || !staffModeVerified ||
        !conversationId || active.conversation_id !== conversationId ||
        typeof modeVersion !== "number" || !Number.isSafeInteger(modeVersion) ||
        modeVersion < 1 || applyTimeGuardRef.current || applyingSelectedTime) return;
    if (!window.confirm(
      "Apply the guest's VERIFIED selected time to this PENDING reservation? " +
      "This updates the reservation through the existing amendment safeguards, " +
      "resets availability review, and sends NO SMS. " +
      "Confirmed reservations and existing prepared alternative offers are not eligible. Continue?"
    )) return;
    applyTimeGuardRef.current = true;
    setApplyingSelectedTime(true);
    setError("");
    setMessage("");
    onResumeBlockedChange(true);
    try {
      const response = await fetch(
        `/api/staff/reservations/${encodeURIComponent(reservationId)}/interventions/apply-selected-time`,
        { method: "POST", credentials: "same-origin", cache: "no-store",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ conversationId, interventionId: active.id,
            expectedModeVersion: modeVersion }) }
      );
      const payload: unknown = await response.json();
      if (!response.ok || !payload || typeof payload !== "object" || Array.isArray(payload)) {
        throw new Error(errorDetail(payload, "Unable to apply selected time."));
      }
      const result = payload as Record<string, unknown>;
      if (result.success !== true || result.interventionId !== active.id ||
          result.smsSent !== false || !isRecord(result.reservation) ||
          result.reservation.reservation_id !== reservationId ||
          result.reservation.workflow_status !== "awaiting_review") {
        throw new Error("Amendment outcome requires reconciliation. Refresh the reservation before another action.");
      }
      setMessage("Selected time applied. Refresh this reservation page, re-approve availability, and complete the existing deposit/Yelp booking actions. No SMS was sent by this action.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message :
        "Amendment outcome uncertain. Refresh the reservation and reconcile before retrying.");
    } finally {
      applyTimeGuardRef.current = false;
      setApplyingSelectedTime(false);
      await loadActive();
    }
  }

  async function resolveAfterBooking() {
    if (!active || active.status !== "staff_review" || !active.details?.guest_choice ||
        !staffModeVerified || !conversationId || active.conversation_id !== conversationId ||
        !Number.isSafeInteger(modeVersion) || !modeVersion ||
        resolveGuardRef.current || resolving) return;

    if (!window.confirm(
      "Only complete this intervention if the guest has agreed to one of the offered times " +
      "and the booking is already CONFIRMED in the reservation system. " +
      "This does not modify the booking or send SMS. Continue?"
    )) return;

    resolveGuardRef.current = true;
    setResolving(true);
    setError("");
    setMessage("");
    onResumeBlockedChange(true);
    try {
      const response = await fetch(
        `/api/staff/reservations/${encodeURIComponent(reservationId)}/interventions/resolve`,
        {
          method: "POST", credentials: "same-origin", cache: "no-store",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            conversationId, interventionId: active.id,
            expectedModeVersion: modeVersion,
            staffVerifiedGuestAcceptance: true,
          }),
        },
      );
      const payload: unknown = await response.json();
      if (!response.ok || !payload || typeof payload !== "object" || Array.isArray(payload)) {
        throw new Error(errorDetail(payload, "Unable to resolve the intervention."));
      }
      const data = payload as Record<string, unknown>;
      if (data.success !== true || data.interventionId !== active.id ||
          data.status !== "resolved" || data.smsSent !== false) {
        throw new Error("Resolution could not be verified. Recheck before taking another action.");
      }
      setMessage("Intervention resolved. Booking was already confirmed. Conversation ownership remains with staff until you explicitly release it.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Resolution outcome uncertain. Recheck status.");
    } finally {
      resolveGuardRef.current = false;
      setResolving(false);
      await loadActive();
    }
  }

  async function recordGuestChoice(inboundMessageSid: string) {
    if (!active || active.status !== "awaiting_guest" ||
        !conversationId || !staffModeVerified ||
        typeof modeVersion !== "number" ||
        !MESSAGE_SID.test(inboundMessageSid) ||
        recordingGuestChoice || selectionGuardRef.current) {
      setError("Verify the active conversation and guest reply before recording a selection.");
      return;
    }
    if (!window.confirm("Record this verified guest SMS as the selected revised time? No booking will be changed.")) return;
    selectionGuardRef.current = true;
    setRecordingGuestChoice(true);
    setMessage("");
    setError("");
    try {
      const response = await fetch(
        `/api/staff/reservations/${encodeURIComponent(reservationId)}/interventions/record-selection`,
        {
          method: "POST", credentials: "same-origin", cache: "no-store",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            conversationId, expectedModeVersion: modeVersion,
            interventionId: active.id, inboundMessageSid,
          }),
        },
      );
      const payload: unknown = await response.json();
      if (!response.ok || !payload || typeof payload !== "object" || Array.isArray(payload)) {
        throw new Error(errorDetail(payload, "Unable to verify the selected guest reply."));
      }
      const result = payload as Record<string, unknown>;
      if (result.success !== true || result.interventionId !== active.id ||
          result.status !== "staff_review" || result.smsSent !== false ||
          result.reservationChanged !== false ||
          typeof result.selectedTime !== "string") {
        throw new Error("Guest selection could not be verified. Refresh before continuing.");
      }
      setMessage(`Guest selected ${result.selectedTime}. Staff must verify availability and complete the booking. No reservation changes or SMS were made.`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Guest selection outcome uncertain; refresh the intervention.");
    } finally {
      selectionGuardRef.current = false;
      setRecordingGuestChoice(false);
      await loadActive();
    }
  }

  // Local history is a convenience display, never proof of eligibility.
  // Use the sent offer's Twilio-created timestamp when it is available;
  // the server and database still verify accepted-ledger chronology.
  const outboundMessage = active?.details?.outbound_message_sid
    ? messages.find((item) => item.direction === "outbound" &&
        item.sid.toLowerCase() === active.details.outbound_message_sid?.toLowerCase())
    : undefined;
  const outboundCreatedMs = outboundMessage?.dateCreated
    ? Date.parse(outboundMessage.dateCreated)
    : Number.NaN;
  const hasOutboundTimestamp = Number.isFinite(outboundCreatedMs);
  const candidateReplies = messages.filter((item) => {
    if (item.direction !== "inbound" || !MESSAGE_SID.test(item.sid) ||
        !/^[1-3]$/.test(item.body.trim()) || !hasOutboundTimestamp ||
        !item.dateCreated) return false;
    const incomingMs = Date.parse(item.dateCreated);
    return Number.isFinite(incomingMs) && incomingMs > outboundCreatedMs;
  }).slice(-10).reverse();

  const statusLabel = active?.status === "draft"
    ? "Draft"
    : active?.status === "awaiting_guest"
      ? "Awaiting Guest"
      : active?.status === "staff_review"
        ? "Staff Review"
        : "";

  return (
    <section
      aria-labelledby="staff-intervention-heading"
      className="rounded-xl border border-white/15 bg-zinc-950 p-4 sm:p-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 id="staff-intervention-heading" className="text-lg font-bold">
            Staff Intervention
          </h3>
          <p className="mt-1 text-sm text-zinc-400">
            Revised availability is handled separately from automated alternate-time offers.
          </p>
        </div>
        {active && (
          <span className="rounded-full border border-amber-500/40 px-3 py-1 text-xs font-semibold text-amber-200">
            {statusLabel}
          </span>
        )}
      </div>

      {loading ? (
        <p role="status" className="mt-4 text-sm text-zinc-300">
          Checking active interventions...
        </p>
      ) : active ? (
        <div className="mt-4 rounded-lg border border-amber-500/30 bg-amber-950/15 p-3 text-sm leading-6 text-amber-100">
          <p className="font-semibold">REVISE TIME OPTIONS intervention is active.</p>
          <p>Automation handback is blocked until this intervention is resolved or canceled.</p>
          <p className="mt-2 text-xs text-amber-200">
            Staff sends revised-time options, verifies the guest's numbered reply, and completes the existing booking steps. Resolve the intervention only after booking confirmation.
          </p>
        </div>
      ) : (
        <p className="mt-4 text-sm text-zinc-300">
          {staffModeVerified
            ? "Start a new staff-managed revised availability intervention. This action does not send SMS."
            : "JOIN CONVERSATION above to verify staff control before revising available times."}
        </p>
      )}

      {!active && (
        <button
          type="button"
          disabled={!canStart}
          aria-disabled={!canStart}
          onClick={() => { void startIntervention(); }}
          className="mt-4 min-h-11 rounded-lg bg-[#ea1b24] px-5 py-3 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-zinc-800 disabled:text-zinc-400"
        >
          {starting ? "STARTING INTERVENTION..." : "REVISE TIME OPTIONS"}
        </button>
      )}

      {active?.status === "draft" && (
        <div className="mt-4 space-y-3 rounded-lg border border-white/15 p-3">
          <p className="text-sm font-semibold text-white">Revised options for {reservationDate}</p>
          <p className="text-xs text-zinc-300">
            Choose up to three different times on this date (10:00 AM–10:00 PM, 30-minute slots).
            Staff must confirm availability. Saving does not send SMS or change the booking.
          </p>
          <div className="grid gap-3 sm:grid-cols-3">
            {revisedTimes.map((time, index) => (
              <label key={index} className="text-xs text-zinc-300">
                Option {index + 1}
                <select
                  value={time}
                  disabled={!canEditTimes}
                  onChange={(event) => setRevisedTimes((previous) =>
                    previous.map((t, i) => i === index ? event.target.value : t))}
                  className="mt-1 block w-full rounded-lg border border-white/20 bg-zinc-900 p-2 text-sm text-white"
                >
                  <option value="">No time selected</option>
                  {Array.from({length: 25}, (_, i) => {
                    const h = 10 + Math.floor(i / 2);
                    const m = i % 2 === 0 ? "00" : "30";
                    const value = `${String(h).padStart(2, "0")}:${m}`;
                    const displayHour = h % 12 || 12;
                    return <option key={value} value={value}>{displayHour}:{m} {h < 12 ? "AM" : "PM"}</option>;
                  })}
                </select>
              </label>
            ))}
          </div>
          <div className="flex flex-wrap gap-3">
            <button type="button" disabled={!canEditTimes || !revisedTimes.some(Boolean)}
              onClick={() => { void saveTimes(revisedTimes.filter(Boolean)); }}
              className="min-h-11 rounded-lg bg-[#ea1b24] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
              {savingTimes ? "SAVING..." : "SAVE REVISED TIMES"}
            </button>
            <button type="button" disabled={!canEditTimes || savedTimes.length === 0}
              onClick={() => { void saveTimes([]); }}
              className="min-h-11 rounded-lg border border-zinc-400 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
              CLEAR SAVED TIMES
            </button>
          </div>
          <p className="text-xs text-zinc-400">Saved options: {savedTimes.length
            ? savedTimes.join(", ") : "None"}.</p>
          {!active.details?.send_claim ? (
            <button type="button" disabled={!canEditTimes || Boolean(sendReviewWarning) || savedTimes.length === 0 ||
              JSON.stringify(revisedTimes.filter(Boolean)) !== JSON.stringify(savedTimes)}
              onClick={() => { void sendRevisedTimes(); }}
              className="min-h-11 rounded-lg bg-emerald-700 px-4 py-2 text-sm font-bold text-white disabled:opacity-50">
              {sendingOptions ? "SENDING..." : "SEND REVISED TIMES"}
            </button>
          ) : (
            <p className="text-sm font-semibold text-amber-200">
              A send has already been claimed. Do not retry or create another offer.
              Only an already-accepted ledger operation may be completed without resending.
              If the ledger is uncertain, request staff reconciliation.
            </p>
          )}
          {active.details?.send_claim && (
            <button type="button" onClick={() => { void reconcileAcceptedSend(); }}
              disabled={reconcilingSend || loading || sharedLoading || joining || resuming ||
                sendingOptions || !staffModeVerified || active.conversation_id !== conversationId ||
                active.mode_version_at_start !== modeVersion ||
                !UUID.test(active.details.send_claim.client_request_id ?? "")}
              className="min-h-11 rounded-lg border border-amber-500 px-4 py-2 text-sm font-semibold text-amber-100 disabled:opacity-50">
              {reconcilingSend ? "VERIFYING EXISTING SMS..." : "VERIFY ACCEPTED SMS & COMPLETE (NO RESEND)"}
            </button>
          )}
        </div>
      )}

      {active?.status === "awaiting_guest" && (
        <div className="mt-4 space-y-3 rounded-lg border border-sky-600/40 p-3">
          <p className="text-sm font-semibold text-sky-100">Verify guest's selected option</p>
          <p className="text-xs leading-5 text-zinc-300">
            Only numbered replies that appear after the loaded outbound offer are
            presented. The server independently verifies Twilio, the accepted SMS ledger,
            and reservation association. This does not change bookings or send SMS.
          </p>
          {!hasOutboundTimestamp && (
            <p className="text-xs text-amber-200">
              The sent offer is not in the loaded message history with a valid timestamp.
              Refresh or load the reservation-specific history before selecting a reply.
              No reply will be preselected by phone number alone.
            </p>
          )}
          {hasOutboundTimestamp && candidateReplies.length === 0 && (
            <p className="text-xs text-amber-200">
              No numbered guest reply after this offer is visible in the loaded history.
              Refresh message history and review the conversation.
            </p>
          )}
          {candidateReplies.map((item) => (
            <div key={item.sid} className="flex flex-wrap items-center justify-between gap-2 rounded border border-white/15 p-2">
              <span className="text-xs text-zinc-300">Guest replied <strong>{item.body.trim()}</strong> · {messageTimestamp(item)}</span>
              <button type="button" onClick={() => { void recordGuestChoice(item.sid); }}
                disabled={recordingGuestChoice || joining || resuming || sharedLoading || !staffModeVerified || active.conversation_id !== conversationId}
                className="min-h-10 rounded border border-sky-500 px-3 py-2 text-xs font-semibold text-sky-100 disabled:opacity-50">
                {recordingGuestChoice ? "VERIFYING..." : "RECORD GUEST CHOICE"}
              </button>
            </div>
          ))}
        </div>
      )}

      {active?.details?.guest_choice && (
        <div className="mt-4 rounded-lg border border-emerald-600/40 p-3 text-sm text-emerald-100">
          Verified guest choice: option {active.details.guest_choice.option_number},
          time {active.details.guest_choice.selected_time}. Complete the booking before resolving.
        </div>
      )}

      {(active?.status === "awaiting_guest" || active?.status === "staff_review") && (
        <div className="mt-4 rounded-lg border border-white/15 p-3 space-y-3">
          <p className="text-sm font-semibold text-white">Staff booking reconciliation</p>
          <p className="text-xs leading-5 text-zinc-300">
            Verify the recorded, reservation-specific guest choice above.
            Complete the existing availability, deposit, and booking process first.
            This action only closes the intervention AFTER the database confirms the
            reservation and its effective booked time matches the verified guest choice.
            Existing accepted-alternative bookings may store that effective time separately
            from the original request time.
            It does not accept an SMS reply or change a reservation time.
          </p>
          {active.status === "staff_review" && active.details?.guest_choice && (
            <div className="space-y-2 rounded-lg border border-sky-500/30 p-3">
              <p className="text-xs leading-5 text-zinc-300">
                For a PENDING reservation without an existing prepared alternative offer,
                apply the verified selected time using the existing date/time amendment rules.
                The booking is NOT confirmed by this step. If an original alternative offer
                is already prepared, the database blocks this amendment: reconcile through
                the original alternative workflow instead. Confirmed bookings require
                the separate verified Yelp update process.
              </p>
              <button type="button" onClick={() => { void applyVerifiedSelectedTime(); }}
                disabled={applyingSelectedTime || resolving || loading || joining || resuming || sharedLoading ||
                  !staffModeVerified || active.conversation_id !== conversationId}
                className="min-h-11 rounded-lg border border-sky-500 px-4 py-2 text-sm font-bold text-sky-100 disabled:opacity-50">
                {applyingSelectedTime ? "APPLYING SELECTED TIME..." : "APPLY SELECTED TIME TO PENDING RESERVATION"}
              </button>
            </div>
          )}
          <button type="button" onClick={() => { void resolveAfterBooking(); }}
            disabled={resolving || loading || joining || resuming || sharedLoading || !staffModeVerified || active.conversation_id !== conversationId || !active.details?.guest_choice}
            className="min-h-11 rounded-lg border border-emerald-600 px-4 py-2 text-sm font-bold text-emerald-200 disabled:opacity-50">
            {resolving ? "VERIFYING BOOKING..." : "VERIFY CONFIRMED BOOKING & CLOSE INTERVENTION"}
          </button>
        </div>
      )}

      {active?.status === "draft" && (
        <button
          type="button"
          disabled={canceling || savingTimes || sendingOptions || starting || loading || joining || resuming || sharedLoading || savedTimes.length > 0 || Boolean(active.details?.send_claim) || !staffModeVerified || active.conversation_id !== conversationId}
          onClick={() => { void cancelDraft(); }}
          className="mt-4 min-h-11 rounded-lg border border-amber-500/50 px-5 py-3 text-sm font-semibold text-amber-100 transition hover:bg-amber-950/40 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {canceling ? "CANCELING DRAFT..." : "CANCEL UNSENT DRAFT"}
        </button>
      )}

      {active?.status === "draft" && savedTimes.length > 0 && (
        <p className="mt-2 text-xs text-amber-200">
          To cancel this unsent draft, first select CLEAR SAVED TIMES.
        </p>
      )}
      {active && (
        <p className="mt-3 text-xs text-zinc-400">
          Intervention ID: <span className="break-all font-mono">{active.id}</span>
        </p>
      )}

      {message && (
        <p role="status" className="mt-3 text-sm text-emerald-200">{message}</p>
      )}
      {sendReviewWarning && (
        <div role="alert" className="mt-3 rounded-lg border border-amber-500/40 bg-amber-950/20 p-3 text-sm text-amber-100">
          <p className="font-semibold">SMS submission requires reconciliation — do not resend.</p>
          <p className="mt-1">{sendReviewWarning}</p>
        </div>
      )}
      {error && (
        <div role="alert" className="mt-3 space-y-2 text-sm text-red-200">
          <p>{error}</p>
          <button
            type="button"
            disabled={starting || loading}
            onClick={() => { void loadActive(); }}
            className="font-semibold underline underline-offset-4 disabled:opacity-50"
          >
            Recheck intervention status
          </button>
        </div>
      )}
      {!error && !loading && !active && pendingRequestKeyRef.current && (
        <p role="status" className="mt-3 text-xs text-amber-200">
          An earlier start attempt may be pending. Automation handback remains blocked locally until reconciled.
        </p>
      )}
    </section>
  );
}

export default function GuestConversationWorkspace({
  reservationId,
}: Props) {
  const [messages, setMessages] =
    useState<ConversationMessage[]>([]);

  const [recoveryStatus, setRecoveryStatus] =
    useState<RecoveryStatus>(null);

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

  const [syncError, setSyncError] =
    useState("");

  const scrollRef =
    useRef<HTMLOListElement>(null);

  const loadOlderGuardRef =
    useRef(false);

  const initialScrollRef =
    useRef(false);

  const activeRequestRef =
    useRef<AbortController | null>(null);

  const pollRequestRef =
    useRef<AbortController | null>(null);

  const pollGuardRef =
    useRef(false);

  const syncFingerprintRef =
    useRef<string | null>(null);

  const lastFullVerificationRef =
    useRef(0);

  const mountedRef =
    useRef(false);

  const loadingRef =
    useRef(true);

  const loadingOlderRef =
    useRef(false);

  const joiningRef =
    useRef(false);

  const sendingRef =
    useRef(false);

  const shouldStickToBottomRef =
    useRef(false);

  const [interventionResumeBlocked, setInterventionResumeBlocked] =
    useState(true);

  const handleInterventionResumeBlocked = useCallback(
    (blocked: boolean) => setInterventionResumeBlocked(blocked),
    [],
  );

  const [sharedLoading, setSharedLoading] =
    useState(true);

  const [sharedError, setSharedError] =
    useState("");

  const [sharedState, setSharedState] =
    useState<SharedPreflightResponse | null>(null);

  const [joining, setJoining] =
    useState(false);

  const [joinResult, setJoinResult] =
    useState("");

  const [joinError, setJoinError] =
    useState("");

  const joinGuardRef =
    useRef(false);

  const [resuming, setResuming] =
    useState(false);

  const [resumeError, setResumeError] =
    useState("");

  const [resumeResult, setResumeResult] =
    useState("");

  const resumeGuardRef =
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

  useEffect(() => {
    loadingRef.current = loading;
  }, [loading]);

  useEffect(() => {
    loadingOlderRef.current = loadingOlder;
  }, [loadingOlder]);

  useEffect(() => {
    joiningRef.current = joining;
  }, [joining]);

  useEffect(() => {
    sendingRef.current = sending;
  }, [sending]);

  const sharedUrl =
    `/api/staff/reservations/` +
    `${encodeURIComponent(reservationId)}` +
    `/conversation/shared-preflight`;

  const loadSharedState = useCallback(
    async (signal?: AbortSignal) => {
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
          !validPreflight(payload, reservationId)
        ) {
          throw new Error(
            errorDetail(
              payload,
              "Unable to verify shared conversation state.",
            ),
          );
        }

        if (signal?.aborted) return;

        setSharedState(payload);
      } catch (caught) {
        if (signal?.aborted) return;

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
    const controller = new AbortController();

    void loadSharedState(controller.signal);

    return () => controller.abort();
  }, [loadSharedState]);

  const historyUrl = useCallback(
    (cursor: string | null, sync = false) => {
      const base =
        `/api/staff/reservations/` +
        `${encodeURIComponent(reservationId)}` +
        `/conversation/scoped-history`;

      if (cursor) {
        return (
          `${base}?cursor=` +
          encodeURIComponent(cursor)
        );
      }

      return sync ? `${base}?sync=1` : base;
    },
    [reservationId],
  );

  const fetchHistory = useCallback(
    async (
      cursor: string | null,
      signal: AbortSignal,
      sync = false,
    ) => {
      const response = await fetch(
        historyUrl(cursor, sync),
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
        !validHistory(payload, reservationId)
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

  // This endpoint is an invalidation hint, not an ownership proof.
  // Only scoped-history is allowed to supply displayable SMS bodies.
  const checkForChanges = useCallback(
    async (signal: AbortSignal) => {
      const base =
        `/api/staff/reservations/` +
        `${encodeURIComponent(reservationId)}` +
        `/conversation/sync-check`;

      const fingerprint = syncFingerprintRef.current;
      const url = fingerprint
        ? `${base}?fingerprint=${fingerprint}`
        : base;

      const response = await fetch(url, {
        method: "GET",
        credentials: "same-origin",
        cache: "no-store",
        signal,
      });

      const payload: unknown = await response.json();

      if (
        !response.ok ||
        !payload ||
        typeof payload !== "object" ||
        Array.isArray(payload)
      ) {
        throw new Error(
          errorDetail(payload, "Unable to check for message updates."),
        );
      }

      const result = payload as Record<string, unknown>;
      if (
        result.success !== true ||
        result.reservationId !== reservationId ||
        typeof result.changed !== "boolean" ||
        typeof result.fingerprint !== "string" ||
        !FINGERPRINT.test(result.fingerprint)
      ) {
        throw new Error("Message synchronization response was invalid.");
      }

      return {
        changed: result.changed,
        fingerprint: result.fingerprint,
      };
    },
    [reservationId],
  );

  const loadInitial = useCallback(async () => {
    pollRequestRef.current?.abort();
    syncFingerprintRef.current = null;
    lastFullVerificationRef.current = 0;
    activeRequestRef.current?.abort();

    const controller = new AbortController();

    activeRequestRef.current = controller;

    loadingRef.current = true;
    setLoading(true);
    setError("");
    setOlderError("");
    setSyncError("");
    setMessages([]);
    setHasMore(false);
    setNextCursor(null);

    initialScrollRef.current = false;

    try {
      const payload = await fetchHistory(
        null,
        controller.signal,
      );

      if (controller.signal.aborted) return;

      setMessages(sortMessages(payload.messages));
      setHasMore(payload.hasMore);
      setNextCursor(payload.nextCursor);
      lastFullVerificationRef.current = Date.now();

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
        loadingRef.current = false;
        setLoading(false);
      }
    }
  }, [fetchHistory]);

  useEffect(() => {
    mountedRef.current = true;

    const controller = new AbortController();

    async function initializeConversation() {
      try {
        const response = await fetch(
          `/api/staff/reservations/${encodeURIComponent(
            reservationId,
          )}/conversation/recover`,
          {
            method: "POST",
            credentials: "same-origin",
            cache: "no-store",
            headers: {
              "Content-Type": "application/json",
            },
            body: "{}",
            signal: controller.signal,
          },
        );

        if (!response.ok) {
          console.warn(
            "Automatic Studio recovery was unavailable.",
            {
              reservationId,
              status: response.status,
            },
          );
        }
      } catch (caught) {
        if (controller.signal.aborted) {
          return;
        }

        console.warn(
          "Automatic Studio recovery failed.",
          {
            reservationId,
            error:
              caught instanceof Error
                ? caught.message
                : "Unknown error",
          },
        );
      } finally {
        if (
          !controller.signal.aborted &&
          mountedRef.current
        ) {
          await loadInitial();
        }
      }
    }

    void initializeConversation();

    return () => {
      controller.abort();
      mountedRef.current = false;
      activeRequestRef.current?.abort();
      pollRequestRef.current?.abort();
    };
  }, [loadInitial, reservationId]);

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

  useEffect(() => {
    if (
      !shouldStickToBottomRef.current ||
      !scrollRef.current
    ) {
      return;
    }

    scrollRef.current.scrollTop =
      scrollRef.current.scrollHeight;

    shouldStickToBottomRef.current = false;
  }, [messages]);

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
    loadingOlderRef.current = true;

    pollRequestRef.current?.abort();

    setLoadingOlder(true);
    setOlderError("");

    const previousHeight =
      container.scrollHeight;

    const previousTop =
      container.scrollTop;

    const controller = new AbortController();

    activeRequestRef.current = controller;

    try {
      const payload = await fetchHistory(
        nextCursor,
        controller.signal,
      );

      if (controller.signal.aborted) return;

      setMessages((existing) =>
        mergeMessages(
          payload.messages,
          existing,
        ),
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
      loadingOlderRef.current = false;

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

  const sharedMode = resolveMode(
    sharedState?.sharedMode,
  );

  const checks =
    sharedState?.checks ?? [];

  const validSharedAssociation =
    sharedState?.success === true &&
    sharedState.reservationId === reservationId &&
    typeof sharedState.conversationId === "string" &&
    UUID.test(sharedState.conversationId) &&
    sharedState.matchingConversationCount === 1 &&
    typeof sharedState.modeVersion === "number" &&
    Number.isSafeInteger(sharedState.modeVersion) &&
    sharedState.modeVersion >= 1;

  // A live Studio execution is not, by itself, a reason
  // to prevent a verified staff handoff. The activation
  // endpoint owns the routing fence, execution shutdown,
  // and final verification.
  //
  // All OTHER preflight checks must still pass.
  const activeStudioExecutionWarningOnly =
    sharedState?.checksPassed === false &&
    Array.isArray(sharedState.checks) &&
    sharedState.checks.length > 0 &&
    sharedState.checks.filter(
      (check) => !check.passed
    ).length === 1 &&
    sharedState.checks.some(
      (check) =>
        !check.passed &&
        check.detail.trim() ===
          "One or more active Studio executions were observed for this guest."
    );

  const canJoin =
    validSharedAssociation &&
    sharedMode === "automation" &&
    !sharedLoading &&
    !joining &&
    !sending &&
    !resuming &&
    (
      sharedState?.checksPassed === true ||
      activeStudioExecutionWarningOnly
    );

  const canResume =
    validSharedAssociation &&
    sharedMode === "staff" &&
    !sharedLoading &&
    !joining &&
    !sending &&
    !resuming &&
    !sendReviewRequired &&
    !interventionResumeBlocked;

  // ===================================================
  // Automatic reservation-scoped message synchronization.
  //
  // Only active while the component is mounted,
  // the tab is visible, and staff mode is verified.
  //
  // Refreshes never send SMS or change conversation mode.
  //
  // Recent messages replace their matching SIDs.
  // Older loaded messages are preserved.
  //
  // The older-history cursor is intentionally unchanged.
  // ===================================================

  const refreshRecent = useCallback(async (
    sync = true,
    allowDuringSend = false,
  ) => {
    if (
      !mountedRef.current ||
      document.visibilityState !== "visible" ||
      loadingRef.current ||
      loadingOlderRef.current ||
      joiningRef.current ||
      (sendingRef.current && !allowDuringSend) ||
      pollGuardRef.current
    ) {
      return;
    }

    pollGuardRef.current = true;

    const controller = new AbortController();
    pollRequestRef.current = controller;

    const container = scrollRef.current;

    const nearBottom = container
      ? (
          container.scrollHeight -
          container.scrollTop -
          container.clientHeight
        ) < 100
      : false;

    try {
      // A complete Twilio refresh is still required periodically because
      // message delivery statuses are not currently recorded by the
      // read-only delivery callback.
      let fullVerification =
        !sync ||
        Date.now() - lastFullVerificationRef.current >=
          FULL_VERIFICATION_INTERVAL_MS;

      let nextFingerprint: string | null = null;

      if (!fullVerification) {
        try {
          const check = await checkForChanges(controller.signal);
          nextFingerprint = check.fingerprint;
          if (
            controller.signal.aborted ||
            !mountedRef.current
          ) {
            return;
          }

          // No changed associations: skip all Twilio message fetches.
          // The periodic full refresh still checks delivery statuses.
          if (!check.changed) {
            setSyncError("");
            return;
          }
        } catch (checkError) {
          if (controller.signal.aborted) return;
          // Fail open to the existing verified history retrieval: a broken
          // hint must never cause silent message loss.
          console.warn("Conversation sync hint unavailable; verifying history.", {
            reservationId,
            name: checkError instanceof Error
              ? checkError.name
              : "UnknownError",
          });
          nextFingerprint = null;
          fullVerification = true;
        }
      }

      const payload = await fetchHistory(
        null,
        controller.signal,
        !fullVerification,
      );

      if (
        controller.signal.aborted ||
        !mountedRef.current ||
        loadingRef.current ||
        loadingOlderRef.current
      ) {
        return;
      }

      if (nearBottom) {
        shouldStickToBottomRef.current = true;
      }

      setMessages((existing) => {
        const merged = mergeMessages(payload.messages, existing);
        return sameMessages(existing, merged)
          ? existing
          : merged;
      });

      if (fullVerification) {
        lastFullVerificationRef.current = Date.now();
        // Take a new baseline on the next poll after a full refresh.
        // Association changes during the full fetch must not be missed.
        syncFingerprintRef.current = null;
      } else {
        // The fingerprint is only accepted after verified history succeeds.
        syncFingerprintRef.current = nextFingerprint;
      }

      // Keep the older-history cursor untouched.
      setSyncError("");
    } catch (caught) {
      if (
        controller.signal.aborted ||
        !mountedRef.current
      ) {
        return;
      }

      // Force the next poll to rebuild a verified baseline.
      syncFingerprintRef.current = null;
      setSyncError(
        caught instanceof Error
          ? caught.message
          : "Automatic message synchronization failed.",
      );
    } finally {
      if (pollRequestRef.current === controller) {
        pollRequestRef.current = null;
      }
      pollGuardRef.current = false;
    }
  }, [checkForChanges, fetchHistory, reservationId]);

  useEffect(() => {
    if (
      !validSharedAssociation ||
      sharedMode !== "staff"
    ) {
      pollRequestRef.current?.abort();
      return;
    }

    const interval = window.setInterval(() => {
      void refreshRecent();
    }, POLL_INTERVAL_MS);

    function handleVisibilityChange() {
      if (document.visibilityState === "hidden") {
        pollRequestRef.current?.abort();
        return;
      }

      void refreshRecent();
    }

    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange,
    );

    return () => {
      window.clearInterval(interval);

      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange,
      );

      pollRequestRef.current?.abort();
    };
  }, [
    validSharedAssociation,
    sharedMode,
    refreshRecent,
  ]);

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
    joiningRef.current = true;

    pollRequestRef.current?.abort();

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

      setSharedState((current) =>
        current
          ? {
              ...current,
              sharedMode: "staff",
              modeVersion: result.modeVersion as number,
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

      await loadSharedState();
    } finally {
      joinGuardRef.current = false;
      joiningRef.current = false;
      setJoining(false);
    }
  }

  async function resumeAutomation() {
    if (!canResume || resumeGuardRef.current) {
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

    const confirmed = window.confirm(
      "Resume automated guest messaging?\\n\\n" +
      "Staff will stop controlling this conversation. " +
      "Future incoming guest messages may be handled " +
      "automatically. Existing messages will remain " +
      "in the conversation history."
    );

    if (!confirmed) {
      return;
    }

    resumeGuardRef.current = true;

    pollRequestRef.current?.abort();

    setResuming(true);
    setResumeError("");
    setResumeResult("");
    setJoinError("");
    setJoinResult("");
    setSendError("");
    setSendSuccess("");

    try {
      const response = await fetch(
        `/api/staff/reservations/` +
          `${encodeURIComponent(reservationId)}` +
          `/conversation/shared-resume`,
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
          "Automation handback response could not be verified."
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
            "Unable to resume automation."
          )
        );
      }

      if (
        result.reservationId !== reservationId ||
        result.conversationId !== conversationId ||
        result.conversationMode !== "automation" ||
        result.operationalVerificationComplete !== true ||
        result.databaseChanged !== true ||
        result.smsSent !== false ||
        result.studioExecutionsChanged !== false ||
        typeof result.modeVersion !== "number" ||
        !Number.isSafeInteger(result.modeVersion) ||
        result.modeVersion !== expectedModeVersion + 1
      ) {
        throw new Error(
          "Automation handback could not be confirmed. " +
          "Reload and verify the conversation state."
        );
      }

      setSharedState((current) =>
        current
          ? {
              ...current,
              sharedMode: "automation",
              modeVersion:
                result.modeVersion as number,
            }
          : current
      );

      setResumeResult(
        "Automation resumed for future guest messages."
      );

    } catch (caught) {
      setResumeError(
        caught instanceof Error
          ? caught.message
          : "Automation handback could not be verified."
      );
    } finally {
      await loadSharedState();

      resumeGuardRef.current = false;
      setResuming(false);
    }
  }

  const canSend =
    validSharedAssociation &&
    !sharedLoading &&
    !joining &&
    !resuming &&
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
    sendingRef.current = true;

    pollRequestRef.current?.abort();

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
        typeof result.messageSid === "string" &&
        MESSAGE_SID.test(result.messageSid)
      ) {
        setMessageDraft("");

        setSendSuccess(
          "Twilio accepted the SMS. Delivery status may update later.",
        );

        // Post-send refresh retains full historical verification.
        await refreshRecent(false, true);
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
      sendingRef.current = false;
      setSending(false);
    }
  }

  return (
    <div className="space-y-5">
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
              Guest Conversation
            </h3>

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

        {syncError && (
          <p
            role="status"
            className="mt-4 rounded-lg border border-amber-500/25 bg-amber-950/15 p-3 text-xs text-amber-200"
          >
            Automatic message updates are temporarily
            unavailable.
          </p>
        )}

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
                ? (
                    <span className="inline-flex items-center gap-2">
                      <svg
                        aria-hidden="true"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4 shrink-0"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <path d="m8 12 2.5 2.5L16 9" />
                      </svg>
                      STAFF MODE ACTIVE
                    </span>
                  )
                : sharedMode === "transitioning_to_staff"
                  ? "Transition Pending"
                  : "JOIN CONVERSATION"}
          </button>

          {sharedMode === "staff" && (
            <button
              type="button"
              disabled={!canResume}
              aria-disabled={!canResume}
              onClick={() => {
                void resumeAutomation();
              }}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-sky-500/40 bg-sky-950/20 px-5 py-3 text-sm font-bold text-sky-100 transition hover:bg-sky-900/40 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4 shrink-0"
              >
                <path d="M3 11a9 9 0 0 1 15.36-6.36L21 7" />
                <path d="M21 3v4h-4" />
                <path d="M21 13a9 9 0 0 1-15.36 6.36L3 17" />
                <path d="M3 21v-4h4" />
              </svg>
              {resuming
                ? "Resuming Automation..."
                : "RESUME AUTOMATION"}
            </button>
          )}
        </div>

        {sharedMode === "staff" && interventionResumeBlocked && (
          <p role="status" className="mt-3 text-xs text-amber-200">
            Automation handback is unavailable while staff intervention status is being verified or an intervention remains active.
          </p>
        )}

        {resumeResult && (
          <p
            role="status"
            className="mt-4 rounded-lg border border-emerald-500/30 bg-emerald-950/20 p-3 text-sm text-emerald-200"
          >
            {resumeResult}
          </p>
        )}

        {resumeError && (
          <p
            role="alert"
            className="mt-4 rounded-lg border border-red-500/30 bg-red-950/20 p-3 text-sm text-red-200"
          >
            {resumeError}
          </p>
        )}

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

        {recoveryStatus && (
          <div className="mt-4 flex justify-end">
            <p
              role={
                recoveryStatus.type === "error"
                  ? "alert"
                  : "status"
              }
              className={`max-w-full text-right text-xs leading-5 ${
                recoveryStatus.type === "success"
                  ? "text-emerald-300"
                  : "text-red-300"
              }`}
            >
              {recoveryStatus.message}
            </p>
          </div>
        )}
      </section>

      <StaffInterventionPanel
        messages={messages}
        reservationId={reservationId}
        conversationId={sharedState?.conversationId}
        modeVersion={sharedState?.modeVersion}
        staffModeVerified={validSharedAssociation && sharedMode === "staff" && !sharedLoading && !sharedError}
        sharedLoading={sharedLoading}
        joining={joining}
        resuming={resuming}
        onResumeBlockedChange={handleInterventionResumeBlocked}
      />

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

          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs text-zinc-400">
              {messages.length} loaded
            </span>

            <RecoverConversationButton
              reservationId={reservationId}
              disabled={loading || loadingOlder}
              onRecovered={loadInitial}
              onStatusChange={setRecoveryStatus}
            />
          </div>
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
            setMessageDraft(event.target.value)
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
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#ea1b24] px-6 py-3 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-300 disabled:opacity-70"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4 shrink-0"
            >
              <path d="m22 2-7 20-4-9-9-4Z" />
              <path d="M22 2 11 13" />
            </svg>
            {sending
              ? "SENDING..."
              : "SEND MESSAGE"}
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