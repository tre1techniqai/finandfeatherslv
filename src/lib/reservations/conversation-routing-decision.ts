/**
 * Fin & Feathers LV — pure inbound SMS routing decision policy.
 *
 * This module does NOT receive webhooks, query Supabase, forward SMS,
 * send SMS, end Studio executions, or change Twilio configuration.
 *
 * Only the trusted server-side router should call this after:
 *  1) validating the signed Twilio webhook;
 *  2) confirming the restaurant/guest phone pair;
 *  3) looking up durable ownership using an authorized server-side method.
 *
 * A pending handoff does not redirect messages away from Studio.
 * A staff ownership row alone is insufficient to activate manual routing.
 */

export type ConversationOwnershipStatus =
  | "automation"
  | "handoff_pending"
  | "staff"
  | "released";

export type OwnershipLookup =
  | { kind: "found"; status: ConversationOwnershipStatus }
  | { kind: "not_found" }
  | { kind: "error" };

export type RoutingDecision = {
  destination: "studio" | "staff" | "blocked";
  reason:
    | "AUTOMATION_OWNER"
    | "HANDOFF_NOT_COMPLETED"
    | "RELEASED_TO_AUTOMATION"
    | "NO_OWNERSHIP_RECORD"
    | "STAFF_ROUTING_VERIFIED"
    | "STAFF_ROUTING_NOT_READY"
    | "OWNERSHIP_LOOKUP_FAILED";
};

export type RoutingReadiness = {
  /** Explicitly true only after the complete, independently tested
   * staff ingress/storage infrastructure is deployed. Never read
   * this boolean from user-controlled webhook input. */
  staffInboundEnabled: boolean;
  /** Explicitly true only when the route has verified that the
   * corresponding Studio execution has been handled safely. */
  studioHandoffVerified: boolean;
};

/**
 * Returns a *decision*, not a TwiML redirect or operational handoff.
 * The caller must not substitute this for signature validation,
 * opt-out handling, deduplication, or a verified downstream handler.
 */
export function decideConversationRoute(
  ownership: OwnershipLookup,
  readiness: RoutingReadiness,
): RoutingDecision {
  if (ownership.kind === "error") {
    // Never guess Studio or staff ownership after a database failure.
    // The future webhook should safely fail/retry rather than auto-route.
    return {
      destination: "blocked",
      reason: "OWNERSHIP_LOOKUP_FAILED",
    };
  }

  if (ownership.kind === "not_found") {
    return {
      destination: "studio",
      reason: "NO_OWNERSHIP_RECORD",
    };
  }

  switch (ownership.status) {
    case "automation":
      return { destination: "studio", reason: "AUTOMATION_OWNER" };
    case "handoff_pending":
      return { destination: "studio", reason: "HANDOFF_NOT_COMPLETED" };
    case "released":
      // Released means no staff takeover; it does NOT resume an old
      // Studio execution. A new inbound event follows standard routing.
      return { destination: "studio", reason: "RELEASED_TO_AUTOMATION" };
    case "staff":
      if (
        readiness.staffInboundEnabled === true &&
        readiness.studioHandoffVerified === true
      ) {
        return { destination: "staff", reason: "STAFF_ROUTING_VERIFIED" };
      }
      // A stale or incomplete staff claim cannot reach an unready inbox,
      // and must not accidentally restart the reservation bot.
      return { destination: "blocked", reason: "STAFF_ROUTING_NOT_READY" };
  }
}
