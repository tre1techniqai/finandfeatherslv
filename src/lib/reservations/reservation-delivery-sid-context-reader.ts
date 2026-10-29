import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * FIN & FEATHERS
 * Step 58D.13.147E.3
 *
 * Exact outbound Message SID context reader.
 *
 * READ ONLY / DISABLED BY DEFAULT.
 *
 * Depends on the review-only RPC:
 * public.get_reservation_delivery_sid_context()
 *
 * This reader does not:
 * - authenticate Twilio callbacks
 * - verify Twilio delivery
 * - create database records
 * - activate Coordinator deadlines
 * - send SMS
 *
 * The supplied Supabase client must be a trusted
 * server-side client with the appropriate privileges.
 */

const MESSAGE_SID = /^SM[0-9a-fA-F]{32}$/;
const E164 = /^\+[1-9][0-9]{7,14}$/;

const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type DeliverySidContextRequest = {
  messageSid: string;
  restaurantPhone: string;
  guestPhone: string;
};

export type DeliverySidContext = {
  promptId: string;
  reservationId: string;
  followupId: string;
  stateVersion: number;
};

export type DeliverySidContextReaderOptions = {
  enabled?: boolean;
};

export type DeliverySidContextReaderResult =
  | {
      success: true;
      outcome: "matched";
      context: DeliverySidContext;
    }
  | {
      success: true;
      outcome: "no_match" | "not_eligible";
    }
  | {
      success: false;
      error:
        | "DISABLED"
        | "INVALID_REQUEST"
        | "DATABASE_LOOKUP_FAILED"
        | "INVALID_DATABASE_RESPONSE";
    };

function isRecord(
  value: unknown,
): value is Record<string, unknown> {
  return (
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value)
  );
}

function validRequest(
  input: unknown,
): input is DeliverySidContextRequest {
  if (!isRecord(input)) {
    return false;
  }

  return (
    typeof input.messageSid === "string" &&
    MESSAGE_SID.test(input.messageSid) &&
    typeof input.restaurantPhone === "string" &&
    E164.test(input.restaurantPhone) &&
    typeof input.guestPhone === "string" &&
    E164.test(input.guestPhone) &&
    input.restaurantPhone !== input.guestPhone
  );
}

function isUuid(value: unknown): value is string {
  return (
    typeof value === "string" &&
    UUID.test(value)
  );
}

function validMatchedResponse(
  data: Record<string, unknown>,
): data is Record<string, unknown> & {
  prompt_id: string;
  reservation_id: string;
  followup_id: string;
  state_version: number;
} {
  return (
    isUuid(data.prompt_id) &&
    isUuid(data.reservation_id) &&
    isUuid(data.followup_id) &&
    typeof data.state_version === "number" &&
    Number.isSafeInteger(data.state_version) &&
    data.state_version >= 1
  );
}

/**
 * Execute the exact-SID correlation RPC.
 *
 * A matched result is advisory database context.
 * It does not authorize recording a delivery event
 * or activating a Coordinator deadline.
 */
export async function readReservationDeliverySidContext(
  supabase: SupabaseClient,
  request: DeliverySidContextRequest,
  options: DeliverySidContextReaderOptions = {},
): Promise<DeliverySidContextReaderResult> {
  // 1. Explicit activation control.

  if (options.enabled !== true) {
    return {
      success: false,
      error: "DISABLED",
    };
  }

  // 2. Validate the outgoing transport identity.

  if (!validRequest(request)) {
    return {
      success: false,
      error: "INVALID_REQUEST",
    };
  }

  // 3. Invoke the protected read-only RPC.
  //
  // Never derive reservation or follow-up IDs from
  // webhook fields or a phone-pair-only lookup.

  let data: unknown;

  try {
    const result = await supabase.rpc(
      "get_reservation_delivery_sid_context",
      {
        p_outbound_message_sid: request.messageSid,
        p_restaurant_phone: request.restaurantPhone,
        p_guest_phone: request.guestPhone,
      },
    );

    if (result.error) {
      // Avoid logging phone numbers, UUIDs, SIDs,
      // raw database errors, or provider messages.
      return {
        success: false,
        error: "DATABASE_LOOKUP_FAILED",
      };
    }

    data = result.data;
  } catch {
    return {
      success: false,
      error: "DATABASE_LOOKUP_FAILED",
    };
  }

  // 4. Reject missing, array, or malformed results.

  if (
    !isRecord(data) ||
    typeof data.outcome !== "string"
  ) {
    return {
      success: false,
      error: "INVALID_DATABASE_RESPONSE",
    };
  }

  // 5. Known negative outcomes are not matches.

  if (
    data.outcome === "no_match" ||
    data.outcome === "not_eligible"
  ) {
    // The SQL contract returns only the outcome
    // for these two states.
    if (Object.keys(data).length !== 1) {
      return {
        success: false,
        error: "INVALID_DATABASE_RESPONSE",
      };
    }

    return {
      success: true,
      outcome: data.outcome,
    };
  }

  // 6. Validate the complete matched contract.

  if (
    data.outcome !== "matched" ||
    !validMatchedResponse(data)
  ) {
    return {
      success: false,
      error: "INVALID_DATABASE_RESPONSE",
    };
  }

  return {
    success: true,
    outcome: "matched",
    context: {
      promptId: data.prompt_id,
      reservationId: data.reservation_id,
      followupId: data.followup_id,
      stateVersion: data.state_version,
    },
  };
}
