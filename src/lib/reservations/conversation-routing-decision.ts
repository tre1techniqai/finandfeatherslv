/**
 * Fin & Feathers LV — pure SMS routing decision policies.
 *
 * These functions do NOT:
 * - Receive or validate Twilio webhooks
 * - Query Supabase
 * - Send or receive SMS
 * - Change conversation state
 * - Stop Twilio Studio executions
 *
 * All database lookups, authentication, and operational
 * readiness checks must occur in trusted server code.
 *
 * The legacy policy is preserved for existing callers.
 * The shared policy is for DEMO-SMS-001.
 */

// ============================================================
// LEGACY ROUTING TYPES
// ============================================================

export type ConversationOwnershipStatus =
  | "automation"
  | "handoff_pending"
  | "staff"
  | "released";

export type OwnershipLookup =
  | {
      kind: "found";
      status: ConversationOwnershipStatus;
    }
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
  staffInboundEnabled: boolean;
  studioHandoffVerified: boolean;
};

// ============================================================
// LEGACY ROUTING POLICY
// ============================================================

/**
 * Preserved for compatibility with:
 *
 * src/app/api/twilio/inbound/route.ts
 *
 * Do not change this policy as part of shared SMS
 * implementation without separately reviewing the
 * inbound webhook and its production configuration.
 */
export function decideConversationRoute(
  ownership: OwnershipLookup,
  readiness: RoutingReadiness,
): RoutingDecision {
  if (ownership.kind === "error") {
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
      return {
        destination: "studio",
        reason: "AUTOMATION_OWNER",
      };

    case "handoff_pending":
      return {
        destination: "studio",
        reason: "HANDOFF_NOT_COMPLETED",
      };

    case "released":
      return {
        destination: "studio",
        reason: "RELEASED_TO_AUTOMATION",
      };

    case "staff":
      if (
        readiness.staffInboundEnabled === true &&
        readiness.studioHandoffVerified === true
      ) {
        return {
          destination: "staff",
          reason: "STAFF_ROUTING_VERIFIED",
        };
      }

      return {
        destination: "blocked",
        reason: "STAFF_ROUTING_NOT_READY",
      };
  }
}

// ============================================================
// SHARED SMS ROUTING TYPES
// ============================================================

export type SharedConversationMode =
  | "automation"
  | "transitioning_to_staff"
  | "staff";

export type SharedConversationLookup =
  | {
      kind: "found";
      mode: SharedConversationMode;
    }
  | { kind: "not_found" }
  | { kind: "error" };

export type SharedRoutingReadiness = {
  /**
   * Shared routing is explicitly enabled by trusted
   * server configuration.
   */
  sharedRoutingEnabled: boolean;

  /**
   * Existing Studio staff routing is verified
   * and enabled.
   */
  staffRoutingEnabled: boolean;

  /**
   * Existing pending-handoff automation fence.
   */
  handoffFenceEnabled: boolean;
};

export type SharedRoutingReason =
  | "LEGACY_AUTOMATION"
  | "LEGACY_PENDING_AUTOMATION"
  | "LEGACY_PENDING_BLOCKED"
  | "LEGACY_STAFF"
  | "LEGACY_STAFF_NOT_READY"
  | "LEGACY_LOOKUP_FAILED"
  | "INVALID_LEGACY_STATUS"
  | "SHARED_ROUTING_DISABLED"
  | "SHARED_LOOKUP_FAILED"
  | "INVALID_SHARED_MODE"
  | "SHARED_TRANSITION_PENDING"
  | "SHARED_STAFF_ACTIVE"
  | "SHARED_STAFF_NOT_READY"
  | "SHARED_LEGACY_CONFLICT";

export type SharedRoutingDecision = {
  route: "automation" | "staff" | "block";
  reason: SharedRoutingReason;
};

// ============================================================
// LEGACY STUDIO ROUTING DECISION
// ============================================================

/**
 * Mirrors the legacy behavior of:
 *
 * /api/twilio/conversation-route
 *
 * This is intentionally different from the historical
 * decideConversationRoute() function above.
 *
 * In particular, a pending handoff can be blocked
 * when the Studio handoff fence is enabled.
 */
function decideLegacyStudioRoute(
  ownership: OwnershipLookup,
  readiness: SharedRoutingReadiness,
): SharedRoutingDecision {
  if (ownership.kind === "error") {
    return {
      route: "block",
      reason: "LEGACY_LOOKUP_FAILED",
    };
  }

  if (ownership.kind === "not_found") {
    return {
      route: "automation",
      reason: "LEGACY_AUTOMATION",
    };
  }

  switch (ownership.status) {
    case "automation":
    case "released":
      return {
        route: "automation",
        reason: "LEGACY_AUTOMATION",
      };

    case "handoff_pending":
      if (readiness.handoffFenceEnabled) {
        return {
          route: "block",
          reason: "LEGACY_PENDING_BLOCKED",
        };
      }

      return {
        route: "automation",
        reason: "LEGACY_PENDING_AUTOMATION",
      };

    case "staff":
      if (!readiness.staffRoutingEnabled) {
        return {
          route: "block",
          reason: "LEGACY_STAFF_NOT_READY",
        };
      }

      return {
        route: "staff",
        reason: "LEGACY_STAFF",
      };

    default:
      return {
        route: "block",
        reason: "INVALID_LEGACY_STATUS",
      };
  }
}

// ============================================================
// SHARED SMS ROUTING POLICY
// ============================================================

/**
 * DEMO-SMS-001
 *
 * Determines whether a conversation should be handled
 * by Studio automation, shared staff messaging, or
 * fail-closed blocking.
 *
 * No manager ownership or manager-count restriction
 * exists in this decision policy.
 *
 * Authorization to SEND must be checked separately
 * by the authenticated SMS endpoint and database
 * operation functions.
 *
 * IMPORTANT:
 * This decision does not establish whether existing
 * Studio executions have safely completed.
 */
export function decideSharedConversationRoute(
  legacy: OwnershipLookup,
  shared: SharedConversationLookup,
  readiness: SharedRoutingReadiness,
): SharedRoutingDecision {
  // Always honor failed legacy verification.
  if (legacy.kind === "error") {
    return {
      route: "block",
      reason: "LEGACY_LOOKUP_FAILED",
    };
  }

  // Preserve the old router when shared routing
  // has not been explicitly enabled.
  if (!readiness.sharedRoutingEnabled) {
    return decideLegacyStudioRoute(
      legacy,
      readiness,
    );
  }

  // Never guess the conversation mode after
  // an unsuccessful shared database lookup.
  if (shared.kind === "error") {
    return {
      route: "block",
      reason: "SHARED_LOOKUP_FAILED",
    };
  }

  // Existing guests without a shared conversation
  // continue through the legacy router.
  if (shared.kind === "not_found") {
    return decideLegacyStudioRoute(
      legacy,
      readiness,
    );
  }

  switch (shared.mode) {
    case "transitioning_to_staff":
      // Neither Studio automation nor outgoing
      // staff SMS is authorized during activation.
      return {
        route: "block",
        reason: "SHARED_TRANSITION_PENDING",
      };

    case "staff":
      // A shared conversation must never override
      // an unresolved legacy staff claim or handoff.
      if (
        legacy.kind === "found" &&
        (
          legacy.status === "staff" ||
          legacy.status === "handoff_pending"
        )
      ) {
        return {
          route: "block",
          reason: "SHARED_LEGACY_CONFLICT",
        };
      }

      if (!readiness.staffRoutingEnabled) {
        return {
          route: "block",
          reason: "SHARED_STAFF_NOT_READY",
        };
      }

      return {
        route: "staff",
        reason: "SHARED_STAFF_ACTIVE",
      };

    case "automation":
      // The shared conversation must not override
      // protections in the existing legacy router.
      return decideLegacyStudioRoute(
        legacy,
        readiness,
      );

    default:
      return {
        route: "block",
        reason: "INVALID_SHARED_MODE",
      };
  }
}