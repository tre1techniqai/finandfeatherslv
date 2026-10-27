import type { SupabaseClient } from "@supabase/supabase-js";

import {
  decideReservationInboundAttribution,
  type AttributionResult,
  type InboundCandidate,
} from "@/lib/reservations/reservation-inbound-attribution";

import {
  projectCoordinatorInboundState,
  type ProjectedCoordinatorState,
} from "@/lib/reservations/reservation-coordinator-state-projection";

const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const E164 = /^\+[1-9]\d{7,14}$/;

const INVALID_MESSAGE_CHARACTERS =
  /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/;

// This limit is a safety boundary, not a business limit.
// Exceeding it fails closed rather than truncating
// the reservation candidate set.
const MAX_RESERVATION_CANDIDATES = 100;

const VALID_STATUSES = new Set([
  "pending",
  "incomplete",
  "unvalidated",
  "confirmed",
  "closed",
]);

type ReservationRow = {
  id: string;
  customer_phone: string;
  request_status: string;
  twilio_execution_sid: string;
};

/**
 * Optional Coordinator state lookup.
 *
 * This option must be enabled only by a trusted
 * server-side caller after the protected RPC and
 * its database dependencies are deployed.
 *
 * The existing Twilio route does not enable it.
 */
export type ReservationContextOptions = {
  coordinatorStateReadEnabled?: boolean;
};

export type ReservationContextResult =
  | {
      success: true;
      guestPhone: string;
      candidates: InboundCandidate[];
      attribution: AttributionResult;
      candidateCount: number;

      /**
       * Whether the protected Coordinator RPC
       * was requested and successfully validated.
       *
       * "disabled" means no Coordinator state
       * read was attempted.
       */
      coordinatorStateSource: "disabled" | "verified";

      /**
       * Validated Coordinator state projections.
       *
       * Empty when the state lookup is disabled
       * or no state rows exist.
       */
      coordinatorStates: ProjectedCoordinatorState[];
    }
  | {
      success: false;
      error:
        | "INVALID_PHONE"
        | "INVALID_MESSAGE"
        | "DATABASE_LOOKUP_FAILED"
        | "INVALID_RESERVATION_RECORD"
        | "CANDIDATE_LIMIT_EXCEEDED"
        | "COORDINATOR_STATE_LOOKUP_FAILED"
        | "INVALID_COORDINATOR_STATE";
    };

function isReservationRow(
  value: unknown,
): value is ReservationRow {
  if (
    value === null ||
    typeof value !== "object" ||
    Array.isArray(value)
  ) {
    return false;
  }

  const row = value as Record<string, unknown>;

  return (
    typeof row.id === "string" &&
    UUID.test(row.id) &&
    typeof row.customer_phone === "string" &&
    E164.test(row.customer_phone) &&
    typeof row.request_status === "string" &&
    VALID_STATUSES.has(row.request_status) &&
    typeof row.twilio_execution_sid === "string" &&
    /^FN[0-9a-f]{32}$/i.test(row.twilio_execution_sid)
  );
}

/**
 * Resolve reservation candidates for an inbound SMS.
 *
 * SECURITY:
 *
 * 1. Server-side use only.
 *
 * 2. The caller must authenticate and verify the
 *    inbound Twilio message before invoking this
 *    resolver for any persistent operation.
 *
 * 3. The caller supplies a trusted Supabase client.
 *
 * 4. Phone-number equality does not establish
 *    reservation ownership.
 *
 * 5. Coordinator state is never read directly from
 *    the protected tables.
 *
 * 6. The optional Coordinator lookup uses only the
 *    previously validated reservation UUIDs.
 *
 * 7. Phase information is not evidence that a
 *    particular SMS belongs to that reservation.
 *
 * 8. This function never performs database writes,
 *    sends SMS, or changes Studio automation.
 *
 * DEPLOYMENT:
 *
 * The Coordinator RPC is review-only and has not
 * been deployed.
 *
 * The optional lookup remains disabled by default.
 */
export async function resolveReservationInboundContext(
  supabase: SupabaseClient,
  input: {
    from: string;
    body: string;
  },
  options: ReservationContextOptions = {},
): Promise<ReservationContextResult> {
  // ====================================================
  // 1. Validate the trusted inbound request.
  // ====================================================

  if (
    typeof input.from !== "string" ||
    !E164.test(input.from)
  ) {
    return {
      success: false,
      error: "INVALID_PHONE",
    };
  }

  if (
    typeof input.body !== "string" ||
    input.body.length > 1600 ||
    INVALID_MESSAGE_CHARACTERS.test(input.body)
  ) {
    return {
      success: false,
      error: "INVALID_MESSAGE",
    };
  }

  // ====================================================
  // 2. Retrieve candidate reservations.
  // ====================================================

  let rows: unknown;

  try {
    const { data, error } = await supabase
      .from("reservation_requests")
      .select(
        "id, customer_phone, request_status, twilio_execution_sid",
      )
      .eq("customer_phone", input.from)
      .order("created_at", {
        ascending: false,
      })
      .limit(MAX_RESERVATION_CANDIDATES + 1);

    if (error) {
      console.error(
        "Reservation inbound context lookup failed.",
        { code: error.code },
      );

      return {
        success: false,
        error: "DATABASE_LOOKUP_FAILED",
      };
    }

    rows = data;
  } catch {
    return {
      success: false,
      error: "DATABASE_LOOKUP_FAILED",
    };
  }

  if (!Array.isArray(rows)) {
    return {
      success: false,
      error: "DATABASE_LOOKUP_FAILED",
    };
  }

  if (rows.length > MAX_RESERVATION_CANDIDATES) {
    return {
      success: false,
      error: "CANDIDATE_LIMIT_EXCEEDED",
    };
  }

  // ====================================================
  // 3. Validate reservation candidate records.
  // ====================================================

  let candidates: InboundCandidate[] = [];

  const reservationIds = new Set<string>();
  const executionSids = new Set<string>();

  for (const row of rows) {
    if (
      !isReservationRow(row) ||
      row.customer_phone !== input.from
    ) {
      return {
        success: false,
        error: "INVALID_RESERVATION_RECORD",
      };
    }

    const reservationId = row.id.toLowerCase();

    const executionSid =
      row.twilio_execution_sid.toUpperCase();

    if (
      reservationIds.has(reservationId) ||
      executionSids.has(executionSid)
    ) {
      return {
        success: false,
        error: "INVALID_RESERVATION_RECORD",
      };
    }

    reservationIds.add(reservationId);
    executionSids.add(executionSid);

    candidates.push({
      reservationId: row.id,
      guestPhone: row.customer_phone,

      // Reservation reference generation has
      // not yet been deployed.
      reference: null,

      // A matching phone number does not establish
      // unique active reservation context.
      activeContext: false,

      // Requires verified prompt correlation.
      awaitingClarity: false,
    });
  }

  // ====================================================
  // 4. Optionally retrieve Coordinator state.
  // ====================================================

  let coordinatorStateSource:
    | "disabled"
    | "verified" = "disabled";

  let coordinatorStates: ProjectedCoordinatorState[] = [];

  if (options.coordinatorStateReadEnabled === true) {
    // An empty candidate set requires no RPC lookup.
    // It must never result in a query for all state rows.

    if (candidates.length === 0) {
      coordinatorStateSource = "verified";
    } else {
      const candidateIds = candidates.map(
        (candidate) => candidate.reservationId,
      );

      let stateRows: unknown;

      try {
        const { data, error } = await supabase.rpc(
          "get_reservation_coordinator_states",
          {
            p_guest_phone: input.from,
            p_reservation_ids: candidateIds,
          },
        );

        if (error) {
          console.error(
            "Coordinator state RPC lookup failed.",
            { code: error.code },
          );

          return {
            success: false,
            error: "COORDINATOR_STATE_LOOKUP_FAILED",
          };
        }

        stateRows = data;
      } catch {
        return {
          success: false,
          error: "COORDINATOR_STATE_LOOKUP_FAILED",
        };
      }

      // The RPC must return a collection, even if
      // no Coordinator state has been initialized.
      //
      // Null and malformed results are not accepted.

      if (!Array.isArray(stateRows)) {
        return {
          success: false,
          error: "INVALID_COORDINATOR_STATE",
        };
      }

      // There can be no more than one state row
      // per candidate reservation.

      if (stateRows.length > candidates.length) {
        return {
          success: false,
          error: "INVALID_COORDINATOR_STATE",
        };
      }

      // ==================================================
      // 5. Validate and project Coordinator state.
      // ==================================================

      const projection =
        projectCoordinatorInboundState({
          candidates,
          stateRows,
        });

      if (!projection.success) {
        console.error(
          "Coordinator state projection rejected the snapshot.",
          { reason: projection.error },
        );

        return {
          success: false,
          error: "INVALID_COORDINATOR_STATE",
        };
      }

      coordinatorStates = projection.states;

      candidates = projection.candidates;

      coordinatorStateSource = "verified";
    }
  }

  // ====================================================
  // 6. Apply reservation-specific attribution policy.
  // ====================================================

  // Coordinator state phases cannot independently
  // establish which reservation owns an incoming SMS.
  //
  // Even when a state row reports an open clarity
  // window, awaitingClarity remains false until
  // trusted prompt correlation is implemented.
  //
  // No reservation attribution is manufactured.

  const attribution =
    decideReservationInboundAttribution({
      from: input.from,
      body: input.body,
      candidates,
    });

  // ====================================================
  // 7. Return the read-only context.
  // ====================================================

  return {
    success: true,
    guestPhone: input.from,
    candidates,
    attribution,
    candidateCount: candidates.length,
    coordinatorStateSource,
    coordinatorStates,
  };
}