/**
 * Fin & Feathers — Coordinator state projection.
 *
 * PURE MODULE:
 * No Supabase queries, SMS operations, state transitions,
 * environment variables, or database writes.
 *
 * Input must come from a trusted, authorized server-side
 * source. Never supply database state from a browser.
 */

import type {
  InboundCandidate,
} from "@/lib/reservations/reservation-inbound-attribution";

const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const COORDINATOR_PHASES = [
  "automation_active",
  "staff_followup_pending",
  "staff_reply_submitting",
  "awaiting_guest_clarity",
  "followup_unresolved",
] as const;

export type CoordinatorPhase =
  (typeof COORDINATOR_PHASES)[number];

export type CoordinatorStateRow = {
  reservation_request_id: string;
  phase: CoordinatorPhase;
  state_version: number;
  active_followup_id: string | null;
  manager_deadline_at: string | null;
  guest_deadline_at: string | null;
  patience_queued: boolean;
};

export type ProjectedCoordinatorState = {
  reservationId: string;
  phase: CoordinatorPhase;
  stateVersion: number;
  followupId: string | null;

  /**
   * Whether the database state identifies a currently
   * valid clarification window.
   *
   * This does NOT prove the guest received the prompt
   * or that an inbound message belongs to this window.
   */
  clarityWindowOpen: boolean;

  /**
   * Whether a staff follow-up deadline is still active.
   * This is informational, not authority to send SMS.
   */
  managerWindowOpen: boolean;

  /**
   * Whether automation may be considered for resumption.
   * Actual resumption requires a state transition and
   * current Studio/phone-level routing verification.
   */
  automationPhase: boolean;

  patienceQueued: boolean;
};

export type CoordinatorProjectionResult =
  | {
      success: true;
      states: ProjectedCoordinatorState[];
      candidates: InboundCandidate[];
    }
  | {
      success: false;
      error:
        | "INVALID_SNAPSHOT"
        | "INVALID_STATE_ROW"
        | "DUPLICATE_STATE"
        | "UNKNOWN_RESERVATION_STATE";
    };

function validTimestamp(
  value: unknown,
): value is string {
  return (
    typeof value === "string" &&
    value.length > 0 &&
    Number.isFinite(Date.parse(value)) &&
    /(?:Z|[+-]\d{2}:\d{2})$/i.test(value)
  );
}

function validStateRow(
  value: unknown,
): value is CoordinatorStateRow {
  if (
    value === null ||
    typeof value !== "object" ||
    Array.isArray(value)
  ) {
    return false;
  }

  const row = value as Record<string, unknown>;

  if (
    typeof row.reservation_request_id !== "string" ||
    !UUID.test(row.reservation_request_id) ||
    !COORDINATOR_PHASES.some(
      (phase) => phase === row.phase,
    ) ||
    !Number.isSafeInteger(row.state_version) ||
    (row.state_version as number) < 0 ||
    typeof row.patience_queued !== "boolean"
  ) {
    return false;
  }

  const followup = row.active_followup_id;

  if (
    followup !== null &&
    (typeof followup !== "string" ||
      !UUID.test(followup))
  ) {
    return false;
  }

  if (
    row.phase !== "automation_active" &&
    followup === null
  ) {
    return false;
  }

  if (
    row.manager_deadline_at !== null &&
    (row.phase !== "staff_followup_pending" ||
      !validTimestamp(row.manager_deadline_at))
  ) {
    return false;
  }

  if (
    row.guest_deadline_at !== null &&
    (row.phase !== "awaiting_guest_clarity" ||
      !validTimestamp(row.guest_deadline_at))
  ) {
    return false;
  }

  return true;
}

/**
 * Project trusted Coordinator rows onto existing
 * reservation candidates.
 *
 * IMPORTANT:
 * A complete authoritative snapshot is required.
 * Missing state rows are accepted: legacy reservations
 * may have no initialized Coordinator state.
 *
 * No state row may reference a reservation absent from
 * the supplied candidate set.
 *
 * Attribution stays disabled until independently verified
 * active prompt evidence is introduced.
 */
export function projectCoordinatorInboundState(input: {
  candidates: readonly InboundCandidate[];
  stateRows: readonly unknown[];
  now?: number;
}): CoordinatorProjectionResult {
  if (
    !input ||
    !Array.isArray(input.candidates) ||
    !Array.isArray(input.stateRows)
  ) {
    return {
      success: false,
      error: "INVALID_SNAPSHOT",
    };
  }

  const now = input.now ?? Date.now();

  if (!Number.isFinite(now)) {
    return {
      success: false,
      error: "INVALID_SNAPSHOT",
    };
  }

  const candidateIds = new Set<string>();

  for (const candidate of input.candidates) {
    if (
      !candidate ||
      typeof candidate.reservationId !== "string" ||
      !UUID.test(candidate.reservationId) ||
      candidateIds.has(candidate.reservationId.toLowerCase())
    ) {
      return {
        success: false,
        error: "INVALID_SNAPSHOT",
      };
    }

    candidateIds.add(candidate.reservationId.toLowerCase());
  }

  const states: ProjectedCoordinatorState[] = [];
  const seen = new Set<string>();

  for (const raw of input.stateRows) {
    if (!validStateRow(raw)) {
      return {
        success: false,
        error: "INVALID_STATE_ROW",
      };
    }

    const reservationId =
      raw.reservation_request_id.toLowerCase();

    if (!candidateIds.has(reservationId)) {
      return {
        success: false,
        error: "UNKNOWN_RESERVATION_STATE",
      };
    }

    if (seen.has(reservationId)) {
      return {
        success: false,
        error: "DUPLICATE_STATE",
      };
    }

    seen.add(reservationId);

    const clarityWindowOpen =
      raw.phase === "awaiting_guest_clarity" &&
      raw.active_followup_id !== null &&
      raw.guest_deadline_at !== null &&
      Date.parse(raw.guest_deadline_at) > now;

    const managerWindowOpen =
      raw.phase === "staff_followup_pending" &&
      raw.active_followup_id !== null &&
      raw.manager_deadline_at !== null &&
      Date.parse(raw.manager_deadline_at) > now;

    states.push({
      reservationId,
      phase: raw.phase,
      stateVersion: raw.state_version,
      followupId: raw.active_followup_id,
      clarityWindowOpen,
      managerWindowOpen,
      automationPhase:
        raw.phase === "automation_active",
      patienceQueued: raw.patience_queued,
    });
  }

  /*
   * Do not promote a state-row match to activeContext
   * or awaitingClarity.
   *
   * A state row indicates workflow phase, not confirmed
   * delivery of a particular guest-facing prompt.
   *
   * Both flags remain false until a future trusted
   * resolver provides unique prompt correlation.
   */
  const candidates = input.candidates.map(
    (candidate): InboundCandidate => ({
      ...candidate,
      activeContext: false,
      awaitingClarity: false,
    }),
  );

  return {
    success: true,
    states,
    candidates,
  };
}