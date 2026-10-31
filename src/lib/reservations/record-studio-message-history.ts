
import twilio from "twilio";
import { createClient } from "@supabase/supabase-js";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const EXECUTION_SID_PATTERN = /^FN[0-9a-f]{32}$/i;
const FLOW_SID_PATTERN = /^FW[0-9a-f]{32}$/i;
const MESSAGE_SID_PATTERN = /^SM[0-9a-f]{32}$/i;
const E164_PATTERN = /^\+[1-9]\d{7,14}$/;
const WIDGET_PATTERN = /^[A-Za-z][A-Za-z0-9_]{0,127}$/;

const MAX_STEPS = 100;
const MAX_CONTEXT_ATTEMPTS = 5;
const MAX_MESSAGES = 100;

type Direction = "inbound" | "outbound";

type MessageCandidate = {
  sid: string;
  direction: Direction;
  widget: string;
};

type VerifiedMessage = {
  sid: string;
  direction: Direction;
  widget: string;
  createdAt: string;
};

type StudioState = {
  name?: unknown;
  type?: unknown;
};

type RecorderInput = {
  reservationId: string;
  executionSid: string;
};

type ExistingOwnership = {
  twilio_message_sid: string;
  reservation_request_id: string;
};

type ExistingAssociation = {
  id: string;
  reservation_request_id: string;
  conversation_id: string;
  twilio_execution_sid: string;
  twilio_message_sid: string;
  message_direction: string;
  message_created_at: string;
  studio_widget: string;
};

export type StudioRecordingResult = {
  reservationId: string;
  executionSid: string;
  discovered: number;
  verified: number;
  recorded: number;
  duplicates: number;
  excluded: number;
};

function fail(message: string): never {
  throw new Error(
    `Studio message recording failed: ${message}`,
  );
}

function isRecord(
  value: unknown,
): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function sidEqual(
  first: string,
  second: string,
): boolean {
  return first.toLowerCase() === second.toLowerCase();
}

function validDate(value: unknown): value is Date {
  return (
    value instanceof Date &&
    Number.isFinite(value.getTime())
  );
}

function sameTimestamp(
  first: string,
  second: string,
): boolean {
  const a = new Date(first).getTime();
  const b = new Date(second).getTime();

  return (
    Number.isFinite(a) &&
    Number.isFinite(b) &&
    a === b
  );
}

function getAdminClient() {
  const url =
    process.env.SUPABASE_URL ??
    process.env.NEXT_PUBLIC_SUPABASE_URL;

  const key =
    process.env.SUPABASE_SECRET_KEY ??
    process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    fail("Supabase configuration is missing.");
  }

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

function getTwilioClient() {
  const accountSid =
    process.env.TWILIO_ACCOUNT_SID;

  const authToken =
    process.env.TWILIO_AUTH_TOKEN;

  if (!accountSid || !authToken) {
    fail("Twilio configuration is missing.");
  }

  return twilio(accountSid, authToken);
}

function getFlowSid(): string {
  const sid =
    process.env.TWILIO_STUDIO_FLOW_SID;

  if (!sid || !FLOW_SID_PATTERN.test(sid)) {
    fail("Configured Studio Flow SID is invalid.");
  }

  return sid;
}

function extractCandidates(
  context: unknown,
  allowedWidgets: Map<string, string>,
): MessageCandidate[] {
  if (!isRecord(context)) {
    fail("Invalid Studio step context.");
  }

  const candidates: MessageCandidate[] = [];

  const trigger = context.trigger;

  if (isRecord(trigger)) {
    const message = trigger.message;

    if (isRecord(message)) {
      const sid = message.MessageSid;

      if (
        typeof sid === "string" &&
        MESSAGE_SID_PATTERN.test(sid)
      ) {
        candidates.push({
          sid,
          direction: "inbound",
          widget: "Trigger",
        });
      }
    }
  }

  const widgets = context.widgets;

  if (!isRecord(widgets)) {
    return candidates;
  }

  for (const [widgetName, widgetValue] of
    Object.entries(widgets)) {
    if (
      !WIDGET_PATTERN.test(widgetName) ||
      !isRecord(widgetValue)
    ) {
      continue;
    }

    const widgetType =
      allowedWidgets.get(widgetName);

    if (!widgetType) {
      continue;
    }

    const supportsInbound =
      widgetType === "send-and-wait-for-reply";

    const supportsOutbound =
      widgetType === "send-and-wait-for-reply" ||
      widgetType === "send-message";

    if (supportsInbound) {
      const inbound = widgetValue.inbound;

      if (isRecord(inbound)) {
        const sid = inbound.MessageSid;

        if (
          typeof sid === "string" &&
          MESSAGE_SID_PATTERN.test(sid)
        ) {
          candidates.push({
            sid,
            direction: "inbound",
            widget: widgetName,
          });
        }
      }
    }

    if (supportsOutbound) {
      const outbound = widgetValue.outbound;

      if (isRecord(outbound)) {
        const sid = outbound.Sid;

        if (
          typeof sid === "string" &&
          MESSAGE_SID_PATTERN.test(sid)
        ) {
          candidates.push({
            sid,
            direction: "outbound",
            widget: widgetName,
          });
        }
      }
    }
  }

  return candidates;
}

function deduplicateCandidates(
  candidates: MessageCandidate[],
): MessageCandidate[] {
  const unique =
    new Map<string, MessageCandidate>();

  for (const candidate of candidates) {
    const key = candidate.sid.toLowerCase();
    const existing = unique.get(key);

    if (!existing) {
      unique.set(key, candidate);
      continue;
    }

    if (
      existing.direction !== candidate.direction ||
      existing.widget !== candidate.widget
    ) {
      fail(
        "Conflicting Studio provenance for a Message SID.",
      );
    }
  }

  return [...unique.values()];
}

function verifyExistingAssociation(
  existing: ExistingAssociation,
  item: VerifiedMessage,
  reservationId: string,
  conversationId: string,
  executionSid: string,
): void {
  if (
    existing.reservation_request_id !== reservationId ||
    existing.conversation_id !== conversationId ||
    !sidEqual(
      existing.twilio_execution_sid,
      executionSid,
    ) ||
    !sidEqual(
      existing.twilio_message_sid,
      item.sid,
    ) ||
    existing.message_direction !== item.direction ||
    existing.studio_widget !== item.widget ||
    !sameTimestamp(
      existing.message_created_at,
      item.createdAt,
    )
  ) {
    fail(
      "Conflicting existing Studio association.",
    );
  }
}

export async function recordStudioMessageHistory(
  input: RecorderInput,
): Promise<StudioRecordingResult> {
  const { reservationId, executionSid } = input;

  if (!UUID_PATTERN.test(reservationId)) {
    fail("Invalid reservation UUID.");
  }

  if (!EXECUTION_SID_PATTERN.test(executionSid)) {
    fail("Invalid Studio execution SID.");
  }

  const admin = getAdminClient();
  const client = getTwilioClient();
  const flowSid = getFlowSid();

  // ================================================
  // 1. VERIFY THE AUTHORITATIVE RESERVATION
  // ================================================

  const {
    data: reservation,
    error: reservationError,
  } = await admin
    .from("reservation_requests")
    .select(
      "id, customer_phone, twilio_execution_sid",
    )
    .eq("id", reservationId)
    .single();

  if (reservationError || !reservation) {
    fail("Reservation lookup failed.");
  }

  if (
    typeof reservation.twilio_execution_sid !==
      "string" ||
    !sidEqual(
      reservation.twilio_execution_sid,
      executionSid,
    )
  ) {
    fail("Reservation execution mismatch.");
  }

  const guestPhone = reservation.customer_phone;

  const restaurantPhone =
    process.env.TWILIO_FROM_NUMBER;

  if (
    typeof guestPhone !== "string" ||
    !E164_PATTERN.test(guestPhone) ||
    !restaurantPhone ||
    !E164_PATTERN.test(restaurantPhone) ||
    guestPhone === restaurantPhone
  ) {
    fail("Invalid reservation phone pair.");
  }

  // ================================================
  // 2. VERIFY THE SHARED CONVERSATION
  // ================================================

  const {
    data: conversation,
    error: conversationError,
  } = await admin
    .from("reservation_shared_conversations")
    .select("id, reservation_request_id")
    .eq("reservation_request_id", reservationId)
    .single();

  if (
    conversationError ||
    !conversation ||
    conversation.reservation_request_id !==
      reservationId ||
    !UUID_PATTERN.test(conversation.id)
  ) {
    fail("Shared conversation verification failed.");
  }

  // ================================================
  // 3. VERIFY THE STUDIO FLOW DEFINITION
  // ================================================

  const flow = await client.studio.v2
    .flows(flowSid)
    .fetch();

  if (flow.status !== "published") {
    fail("Configured Studio Flow is not published.");
  }

  const definition: unknown = flow.definition;

  if (!isRecord(definition)) {
    fail("Studio Flow definition is unavailable.");
  }

  const states = definition.states;

  if (!Array.isArray(states)) {
    fail("Studio Flow states are unavailable.");
  }

  const allowedWidgets = new Map<string, string>();

  for (const state of states as StudioState[]) {
    if (
      typeof state.name === "string" &&
      WIDGET_PATTERN.test(state.name) &&
      typeof state.type === "string"
    ) {
      allowedWidgets.set(
        state.name,
        state.type,
      );
    }
  }

  if (allowedWidgets.size === 0) {
    fail("No verified Studio widgets found.");
  }

  // ================================================
  // 4. VERIFY THE EXACT STUDIO EXECUTION
  // ================================================

  const execution = await client.studio.v2
    .flows(flowSid)
    .executions(executionSid)
    .fetch();

  if (!sidEqual(execution.sid, executionSid)) {
    fail("Twilio execution identity mismatch.");
  }

  if (!validDate(execution.dateCreated)) {
    fail("Invalid Studio execution creation time.");
  }

  const executionStarted =
    execution.dateCreated.getTime();

  // ================================================
  // 5. RETRIEVE STUDIO STEP CONTEXT
  // ================================================

  const steps = await client.studio.v2
    .flows(flowSid)
    .executions(executionSid)
    .steps
    .list({ limit: MAX_STEPS + 1 });

  if (
    steps.length === 0 ||
    steps.length > MAX_STEPS
  ) {
    fail("Studio execution step count requires review.");
  }

  const sortedSteps = [...steps].sort(
    (a, b) =>
      new Date(b.dateCreated).getTime() -
      new Date(a.dateCreated).getTime(),
  );

  const accumulated = new Map<
    string,
    MessageCandidate
  >();

  let validContexts = 0;

  for (const step of sortedSteps.slice(
    0,
    MAX_CONTEXT_ATTEMPTS,
  )) {
    try {
      const response = await client.studio.v2
        .flows(flowSid)
        .executions(executionSid)
        .steps(step.sid)
        .stepContext()
        .fetch();

      if (
        response.executionSid &&
        !sidEqual(
          response.executionSid,
          executionSid,
        )
      ) {
        fail("Studio step execution mismatch.");
      }

      if (
        response.flowSid &&
        !sidEqual(response.flowSid, flowSid)
      ) {
        fail("Studio step Flow mismatch.");
      }

      const extracted = extractCandidates(
        response.context,
        allowedWidgets,
      );

      validContexts++;

      for (const candidate of extracted) {
        const key = candidate.sid.toLowerCase();

        const existing = accumulated.get(key);

        if (
          existing &&
          (
            existing.widget !== candidate.widget ||
            existing.direction !== candidate.direction
          )
        ) {
          fail(
            "Conflicting message provenance across Studio contexts.",
          );
        }

        accumulated.set(key, candidate);
      }
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.startsWith(
          "Studio message recording failed:",
        )
      ) {
        throw error;
      }

      // A different recent step may have usable
      // context. No registration occurs here.
    }
  }

  if (
    validContexts === 0 ||
    accumulated.size === 0
  ) {
    fail("No usable Studio message context found.");
  }

  const unique = deduplicateCandidates(
    [...accumulated.values()],
  );

  if (unique.length > MAX_MESSAGES) {
    fail("Message count exceeds recording limit.");
  }

  // ================================================
  // 6. VERIFY ALL MESSAGES BEFORE WRITING
  // ================================================

  const verified: VerifiedMessage[] = [];

  let excluded = 0;

  for (const candidate of unique) {
    const message = await client
      .messages(candidate.sid)
      .fetch();

    if (
      !sidEqual(message.sid, candidate.sid) ||
      !validDate(message.dateCreated)
    ) {
      fail("Twilio Message SID or date mismatch.");
    }

    const inbound =
      message.direction === "inbound" &&
      message.from === guestPhone &&
      message.to === restaurantPhone;

    const outbound =
      typeof message.direction === "string" &&
      message.direction.startsWith("outbound") &&
      message.from === restaurantPhone &&
      message.to === guestPhone;

    if (!inbound && !outbound) {
      excluded++;
      continue;
    }

    const actualDirection: Direction =
      inbound ? "inbound" : "outbound";

    if (
      actualDirection !== candidate.direction
    ) {
      fail("Studio widget direction mismatch.");
    }

    const createdAt =
      message.dateCreated.getTime();

    if (
      createdAt < executionStarted - 5000
    ) {
      fail(
        "Message predates the verified Studio execution.",
      );
    }

    verified.push({
      sid: message.sid,
      direction: actualDirection,
      widget: candidate.widget,
      createdAt: message.dateCreated.toISOString(),
    });
  }

  if (verified.length === 0) {
    fail("No guest conversation messages verified.");
  }

  // ================================================
  // 7. RESOLVE EXISTING OWNERSHIP AND ASSOCIATIONS
  //
  // All checks complete before new registrations.
  // ================================================

  const resolved: VerifiedMessage[] = [];

  const existingStudioSids =
    new Set<string>();

  for (const item of verified) {
    // Find ownership regardless of hexadecimal
    // capitalization.

    const {
      data: ownershipRows,
      error: ownershipError,
    } = await admin
      .from("reservation_message_sid_ownership")
      .select(
        "twilio_message_sid, reservation_request_id",
      )
      .ilike("twilio_message_sid", item.sid)
      .limit(2);

    if (
      ownershipError ||
      !ownershipRows
    ) {
      fail("Existing SID ownership lookup failed.");
    }

    if (ownershipRows.length > 1) {
      fail(
        "Ambiguous case-variant SID ownership.",
      );
    }

    const ownership =
      ownershipRows.length === 1
        ? ownershipRows[0] as ExistingOwnership
        : null;

    if (
      ownership &&
      ownership.reservation_request_id !==
        reservationId
    ) {
      fail(
        "Message SID belongs to another reservation.",
      );
    }

    // Reuse the existing registry key when present.
    // Never create a second case-variant SID key.

    const registrySid =
      ownership?.twilio_message_sid ??
      item.sid;

    const resolvedItem: VerifiedMessage = {
      ...item,
      sid: registrySid,
    };

    // Check the Studio association separately.
    // Registry ownership does not imply that a
    // Studio association already exists.

    const {
      data: associationRows,
      error: associationError,
    } = await admin
      .from("reservation_studio_message_associations")
      .select(
        "id, reservation_request_id, conversation_id, twilio_execution_sid, twilio_message_sid, message_direction, message_created_at, studio_widget",
      )
      .ilike("twilio_message_sid", item.sid)
      .limit(2);

    if (
      associationError ||
      !associationRows
    ) {
      fail(
        "Existing Studio association lookup failed.",
      );
    }

    if (associationRows.length > 1) {
      fail(
        "Ambiguous case-variant Studio associations.",
      );
    }

    if (associationRows.length === 1) {
      const existing =
        associationRows[0] as ExistingAssociation;

      verifyExistingAssociation(
        existing,
        resolvedItem,
        reservationId,
        conversation.id,
        reservation.twilio_execution_sid,
      );

      // The association and central ownership must
      // agree on the exact stored SID representation.
      // An existing association without registered
      // ownership requires review rather than being
      // silently accepted.

      if (
        !ownership ||
        existing.twilio_message_sid !==
          registrySid
      ) {
        fail(
          "Studio association and registry ownership are inconsistent.",
        );
      }

      existingStudioSids.add(
        registrySid.toLowerCase(),
      );
    }

    resolved.push(resolvedItem);
  }

  // ================================================
  // 8. VERIFY CROSS-TABLE OWNERSHIP CONFLICTS
  // ================================================

  const {
    data: conflicts,
    error: conflictError,
  } = await admin.rpc(
    "check_reservation_message_sid_conflicts",
    {
      p_reservation_id: reservationId,
      p_message_sids: resolved.map(
        item => item.sid,
      ),
    },
  );

  if (conflictError) {
    fail("Message ownership conflict check failed.");
  }

  const conflictResult =
    Array.isArray(conflicts)
      ? conflicts[0]
      : conflicts;

  if (
    !conflictResult ||
    Number(conflictResult.checked_count) !==
      resolved.length ||
    Number(conflictResult.conflicting_count) !== 0 ||
    conflictResult.conflict_free !== true
  ) {
    fail(
      "Existing Message SID ownership conflict.",
    );
  }

  // ================================================
  // 9. REGISTER MISSING STUDIO ASSOCIATIONS
  //
  // Existing ownership is reused.
  // Existing verified associations are skipped.
  //
  // The database RPC performs the final ownership
  // verification and atomic per-message recording.
  // ================================================

  let recorded = 0;
  let duplicates = 0;

  for (const item of resolved) {
    if (
      existingStudioSids.has(
        item.sid.toLowerCase(),
      )
    ) {
      duplicates++;
      continue;
    }

    const {
      data,
      error,
    } = await admin.rpc(
      "record_reservation_studio_message",
      {
        p_reservation_id: reservationId,
        p_conversation_id: conversation.id,
        p_twilio_execution_sid:
          reservation.twilio_execution_sid,
        p_twilio_message_sid: item.sid,
        p_message_direction: item.direction,
        p_message_created_at: item.createdAt,
        p_studio_widget: item.widget,
      },
    );

    if (error) {
      fail(
        `Studio association registration failed for ${item.sid}.`,
      );
    }

    const result =
      Array.isArray(data)
        ? data[0]
        : data;

    if (
      !result ||
      typeof result.association_id !== "string" ||
      !UUID_PATTERN.test(
        result.association_id,
      )
    ) {
      fail(
        "Invalid Studio association response.",
      );
    }

    if (result.outcome === "recorded") {
      recorded++;
    } else if (
      result.outcome === "duplicate"
    ) {
      duplicates++;
    } else {
      fail(
        "Unexpected Studio recording outcome.",
      );
    }
  }

  // ================================================
  // 10. RETURN SAFE SUMMARY
  // ================================================

  return {
    reservationId,
    executionSid,
    discovered: unique.length,
    verified: verified.length,
    recorded,
    duplicates,
    excluded,
  };
}
