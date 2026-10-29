/**
 * Fin & Feathers — reservation-specific inbound SMS attribution.
 * PURE POLICY: no database access, Twilio calls, SMS sends, or side effects.
 * Candidates MUST be supplied by a trusted server-side lookup, not a guest or browser.
 */

export type InboundCandidate = {
  reservationId: string;
  guestPhone: string;
  reference: string | null;
  /** True only when trusted routing evidence identifies an active reservation context. */
  activeContext: boolean;
  /** Current, unresolved YES/NO clarity prompt for this reservation. */
  awaitingClarity: boolean;
};

export type AttributionResult =
  | {
      decision: "attributed";
      reservationId: string;
      basis: "reference" | "active_context" | "active_clarity";
    }
  | {
      decision: "unresolved";
      reason:
        | "NO_VERIFIED_CANDIDATE"
        | "NO_UNIQUE_CONTEXT"
        | "UNKNOWN_REFERENCE"
        | "AMBIGUOUS_REFERENCE"
        | "AMBIGUOUS_CONTEXT"
        | "NO_ACTIVE_CLARITY";
    }
  | {
      decision: "rejected";
      reason: "INVALID_INPUT" | "CONFLICTING_CANDIDATES";
    };

const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const E164 = /^\+[1-9]\d{7,14}$/;
const REF = /^[A-Z]{2}-\d{6}-\d{3,8}$/;
const REF_IN_TEXT = /\b[A-Z]{2}-\d{6}-\d{3,8}\b/g;

export function decideReservationInboundAttribution(input: {
  from: string;
  body: string;
  candidates: readonly InboundCandidate[];
}): AttributionResult {
  if (
    !E164.test(input.from) ||
    typeof input.body !== "string" ||
    input.body.length > 1600 ||
    !Array.isArray(input.candidates)
  ) {
    return { decision: "rejected", reason: "INVALID_INPUT" };
  }

  const candidates = input.candidates;
  const seen = new Map<string, InboundCandidate>();

  for (const candidate of candidates) {
    if (
      !candidate ||
      !UUID.test(candidate.reservationId) ||
      !E164.test(candidate.guestPhone) ||
      (candidate.reference !== null &&
        !REF.test(candidate.reference)) ||
      typeof candidate.activeContext !== "boolean" ||
      typeof candidate.awaitingClarity !== "boolean" ||
      candidate.guestPhone !== input.from
    ) {
      return { decision: "rejected", reason: "INVALID_INPUT" };
    }

    const prior = seen.get(candidate.reservationId);

    if (prior) {
      return {
        decision: "rejected",
        reason: "CONFLICTING_CANDIDATES",
      };
    }

    seen.set(candidate.reservationId, candidate);
  }

  const body = input.body.trim().toUpperCase();
  const yesNo = body === "YES" || body === "NO";

  const mentionedRefs = [
    ...new Set(body.match(REF_IN_TEXT) ?? []),
  ];

  if (mentionedRefs.length > 1) {
    return {
      decision: "unresolved",
      reason: "AMBIGUOUS_REFERENCE",
    };
  }

  if (mentionedRefs.length === 1) {
    const matches = candidates.filter(
      (candidate) => candidate.reference === mentionedRefs[0],
    );

    if (matches.length !== 1) {
      return {
        decision: "unresolved",
        reason: "UNKNOWN_REFERENCE",
      };
    }

    return {
      decision: "attributed",
      reservationId: matches[0].reservationId,
      basis: "reference",
    };
  }

  if (candidates.length === 0) {
    return {
      decision: "unresolved",
      reason: "NO_VERIFIED_CANDIDATE",
    };
  }

  if (yesNo) {
    const prompts = candidates.filter(
      (candidate) => candidate.awaitingClarity,
    );

    if (prompts.length === 1) {
      return {
        decision: "attributed",
        reservationId: prompts[0].reservationId,
        basis: "active_clarity",
      };
    }

    return {
      decision: "unresolved",
      reason:
        prompts.length > 0
          ? "AMBIGUOUS_CONTEXT"
          : "NO_ACTIVE_CLARITY",
    };
  }

  const active = candidates.filter(
    (candidate) => candidate.activeContext,
  );

  if (active.length === 1) {
    return {
      decision: "attributed",
      reservationId: active[0].reservationId,
      basis: "active_context",
    };
  }

  return {
    decision: "unresolved",
    reason:
      active.length > 1
        ? "AMBIGUOUS_CONTEXT"
        : "NO_UNIQUE_CONTEXT",
  };
}