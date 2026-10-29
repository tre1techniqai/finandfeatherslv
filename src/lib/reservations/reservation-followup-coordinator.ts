/**
 * Fin & Feathers — pure reservation follow-up state machine.
 * No database access, Twilio calls, timers, or side effects.
 * Persist state and execute emitted actions in separate, transactional infrastructure.
 */
export type ReservationStatus =
  | "pending"
  | "incomplete"
  | "unvalidated"
  | "confirmed"
  | "closed";

export type FollowupPhase =
  | "automation_active"
  | "staff_followup_pending"
  | "staff_reply_submitting"
  | "awaiting_guest_clarity"
  | "followup_unresolved";

export type FollowupState = {
  reservationId: string;
  reservationReference: string | null;
  phase: FollowupPhase;
  version: number;
  followupId: string | null;
  managerDeadline: string | null;
  guestDeadline: string | null;
  patienceQueued: boolean;
  processedEventIds: string[];
};

export type CoordinatorEvent =
  | { type: "NO_MATCH"; eventId: string; followupId: string; at: string }
  | { type: "MANAGER_SEND_STARTED"; eventId: string; followupId: string; at: string }
  | { type: "MANAGER_SEND_ACCEPTED"; eventId: string; followupId: string; at: string }
  | { type: "MANAGER_SEND_UNCERTAIN"; eventId: string; followupId: string; at: string }
  | { type: "GUEST_CLARITY_YES"; eventId: string; followupId: string; at: string }
  | { type: "GUEST_CLARITY_NO"; eventId: string; followupId: string; at: string }
  | { type: "MANAGER_DEADLINE"; eventId: string; followupId: string; at: string }
  | { type: "GUEST_DEADLINE"; eventId: string; followupId: string; at: string };

export type CoordinatorAction =
  | { type: "ALERT_MANAGER"; followupId: string }
  | { type: "ACKNOWLEDGE_INQUIRY"; followupId: string }
  | { type: "QUEUE_PATIENCE_SMS"; followupId: string }
  | { type: "AWAIT_GUEST_YES_NO"; followupId: string }
  | { type: "ALERT_MANAGER_CLARIFICATION"; followupId: string }
  | { type: "RECAP_CONFIRMED_RESERVATION"; followupId: string }
  | { type: "PROMPT_MISSING_RESERVATION_DETAILS"; followupId: string }
  | { type: "REQUEST_MANAGER_REVIEW"; followupId: string };

export type CoordinatorResult = {
  state: FollowupState;
  actions: CoordinatorAction[];
  accepted: boolean;
  reason?: "duplicate" | "stale_followup" | "invalid_transition" | "deadline_not_due";
};

const FIVE_MINUTES_MS = 5 * 60 * 1000;

function isoTime(value: string): number {
  const parsed = Date.parse(value);
  if (!Number.isFinite(parsed) || new Date(parsed).toISOString() !== value) {
    throw new Error("Event timestamps must be canonical UTC ISO strings.");
  }
  return parsed;
}

function plusFiveMinutes(at: string): string {
  return new Date(isoTime(at) + FIVE_MINUTES_MS).toISOString();
}

export function initialFollowupState(
  reservationId: string,
  reservationReference: string | null = null,
): FollowupState {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(reservationId)) {
    throw new Error("Valid reservation UUID required.");
  }
  return {
    reservationId,
    reservationReference,
    phase: "automation_active",
    version: 0,
    followupId: null,
    managerDeadline: null,
    guestDeadline: null,
    patienceQueued: false,
    processedEventIds: [],
  };
}

/**
 * Pure transition: call only after trusted message attribution and authorization.
 * Each event ID must be globally unique within its reservation; persistence must
 * enforce idempotency and compare-and-swap on `version` atomically.
 */
export function transitionFollowup(
  current: FollowupState,
  event: CoordinatorEvent,
  reservationStatus: ReservationStatus,
): CoordinatorResult {
  const timestamp = isoTime(event.at);
  if (!event.eventId.trim() || !event.followupId.trim()) {
    throw new Error("Event and follow-up IDs are required.");
  }
  if (current.processedEventIds.includes(event.eventId)) {
    return { state: current, actions: [], accepted: false, reason: "duplicate" };
  }
  if (event.type !== "NO_MATCH" && current.followupId !== event.followupId) {
    return { state: current, actions: [], accepted: false, reason: "stale_followup" };
  }
  const reject = (reason: CoordinatorResult["reason"]): CoordinatorResult => ({
    state: current, actions: [], accepted: false, reason,
  });
  const accept = (
    patch: Partial<FollowupState>,
    actions: CoordinatorAction[] = [],
  ): CoordinatorResult => ({
    accepted: true,
    actions,
    state: {
      ...current,
      ...patch,
      version: current.version + 1,
      processedEventIds: [...current.processedEventIds, event.eventId],
    },
  });
  const action = (type: CoordinatorAction["type"]): CoordinatorAction => ({
    type, followupId: event.followupId,
  });

  switch (event.type) {
    case "NO_MATCH":
      if (current.phase !== "automation_active" || current.followupId !== null) {
        return reject("invalid_transition");
      }
      return accept({
        phase: "staff_followup_pending",
        followupId: event.followupId,
        managerDeadline: plusFiveMinutes(event.at),
        guestDeadline: null,
        patienceQueued: false,
      }, [action("ACKNOWLEDGE_INQUIRY"), action("ALERT_MANAGER")]);

    case "MANAGER_SEND_STARTED":
      if (current.phase !== "staff_followup_pending" && current.phase !== "followup_unresolved") {
        return reject("invalid_transition");
      }
      return accept({
        phase: "staff_reply_submitting",
        managerDeadline: null,
        guestDeadline: null,
      });

    case "MANAGER_SEND_ACCEPTED":
      if (current.phase !== "staff_reply_submitting") {
        return reject("invalid_transition");
      }
      return accept({
        phase: "awaiting_guest_clarity",
        guestDeadline: plusFiveMinutes(event.at),
      }, [action("AWAIT_GUEST_YES_NO")]);

    case "MANAGER_SEND_UNCERTAIN":
      if (current.phase !== "staff_reply_submitting") {
        return reject("invalid_transition");
      }
      return accept({ phase: "followup_unresolved" }, [action("REQUEST_MANAGER_REVIEW")]);

    case "GUEST_CLARITY_NO":
      if (current.phase !== "awaiting_guest_clarity") {
        return reject("invalid_transition");
      }
      return accept({
        phase: "followup_unresolved",
        guestDeadline: null,
      }, [action("ALERT_MANAGER_CLARIFICATION")]);

    case "GUEST_CLARITY_YES": {
      if (current.phase !== "awaiting_guest_clarity") {
        return reject("invalid_transition");
      }
      if (reservationStatus === "closed") {
        return accept({
          phase: "followup_unresolved",
          guestDeadline: null,
        }, [action("REQUEST_MANAGER_REVIEW")]);
      }
      const nextAction = reservationStatus === "confirmed"
        ? "RECAP_CONFIRMED_RESERVATION"
        : "PROMPT_MISSING_RESERVATION_DETAILS";
      return accept({
        phase: "automation_active",
        followupId: null,
        managerDeadline: null,
        guestDeadline: null,
        patienceQueued: false,
      }, [action(nextAction)]);
    }

    case "MANAGER_DEADLINE":
      if (current.phase !== "staff_followup_pending" || !current.managerDeadline || current.patienceQueued) {
        return reject("invalid_transition");
      }
      if (timestamp < isoTime(current.managerDeadline)) {
        return reject("deadline_not_due");
      }
      return accept({ patienceQueued: true, managerDeadline: null }, [action("QUEUE_PATIENCE_SMS")]);

    case "GUEST_DEADLINE":
      if (current.phase !== "awaiting_guest_clarity" || !current.guestDeadline) {
        return reject("invalid_transition");
      }
      if (timestamp < isoTime(current.guestDeadline)) {
        return reject("deadline_not_due");
      }
      return accept({
        phase: "followup_unresolved",
        guestDeadline: null,
      });
  }
}
