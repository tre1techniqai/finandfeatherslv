import type { SupabaseClient } from "@supabase/supabase-js";

import type {
  PromptSnapshot,
  PromptSnapshotReader,
  PromptSnapshotRequest,
} from "@/lib/reservations/reservation-prompt-snapshot";

/**
 * Fin & Feathers — Supabase Prompt Snapshot Reader
 *
 * Step 58D.13.146K
 *
 * Server-side, read-only adapter for:
 *
 * public.get_reservation_clarity_prompt_snapshot(
 *   p_restaurant_phone text,
 *   p_guest_phone text
 * )
 *
 * DEPLOYMENT STATUS:
 *
 * The RPC and its dependent tables are review-only.
 * This adapter must not be enabled until the
 * database implementation and permissions are approved.
 *
 * Does not send SMS, write to Supabase, modify
 * Coordinator state, or change Twilio Studio.
 */

const E164 = /^\+[1-9]\d{7,14}$/;

const MAX_PROMPTS = 100;

export type SupabasePromptReaderOptions = {
  /**
   * Explicit server-side activation control.
   *
   * Defaults to false.
   *
   * Never derive this value from browser input,
   * a guest message, or an untrusted webhook.
   */
  enabled?: boolean;
};

export type SupabasePromptReaderResult =
  | {
      success: true;
      snapshot: PromptSnapshot;
    }
  | {
      success: false;
      error:
        | "DISABLED"
        | "INVALID_PHONE_PAIR"
        | "DATABASE_LOOKUP_FAILED"
        | "INVALID_DATABASE_RESPONSE"
        | "INCOMPLETE_SNAPSHOT";
    };

function validPhonePair(
  request: PromptSnapshotRequest,
): boolean {
  return (
    request !== null &&
    typeof request === "object" &&
    typeof request.restaurantPhone === "string" &&
    typeof request.guestPhone === "string" &&
    E164.test(request.restaurantPhone) &&
    E164.test(request.guestPhone) &&
    request.restaurantPhone !== request.guestPhone
  );
}

function isRecord(
  value: unknown,
): value is Record<string, unknown> {
  return (
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value)
  );
}

/**
 * Execute the protected read-only RPC.
 *
 * SECURITY:
 *
 * - The Supabase client must be created by trusted
 *   server-side code.
 *
 * - The RPC independently verifies service-role
 *   authorization and the exact phone pair.
 *
 * - This adapter does not elevate privileges or
 *   create a service-role client.
 *
 * - A successful RPC response is not proof of SMS
 *   delivery or permission to transition state.
 *
 * - The application must separately authenticate
 *   the inbound Twilio message.
 */
export async function readSupabasePromptSnapshot(
  supabase: SupabaseClient,
  request: PromptSnapshotRequest,
  options: SupabasePromptReaderOptions = {},
): Promise<SupabasePromptReaderResult> {
  // ====================================================
  // 1. Explicit activation requirement.
  // ====================================================

  if (options.enabled !== true) {
    return {
      success: false,
      error: "DISABLED",
    };
  }

  // ====================================================
  // 2. Validate the transport phone pair.
  // ====================================================

  if (!validPhonePair(request)) {
    return {
      success: false,
      error: "INVALID_PHONE_PAIR",
    };
  }

  // ====================================================
  // 3. Invoke the authorized database function.
  // ====================================================

  let data: unknown;

  try {
    const result = await supabase.rpc(
      "get_reservation_clarity_prompt_snapshot",
      {
        p_restaurant_phone: request.restaurantPhone,
        p_guest_phone: request.guestPhone,
      },
    );

    if (result.error) {
      // Do not log phone numbers, message contents,
      // returned records, or raw SQL error messages.
      console.error(
        "Prompt snapshot RPC failed.",
        { code: result.error.code },
      );

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

  // ====================================================
  // 4. Validate the JSON result contract.
  // ====================================================

  // The RPC returns one JSON object, not an array
  // of PostgreSQL rows.
  //
  // Do not use maybeSingle() or interpret null
  // as a valid empty result.

  if (
    !isRecord(data) ||
    typeof data.complete !== "boolean" ||
    !Array.isArray(data.prompts)
  ) {
    return {
      success: false,
      error: "INVALID_DATABASE_RESPONSE",
    };
  }

  if (data.complete !== true) {
    return {
      success: false,
      error: "INCOMPLETE_SNAPSHOT",
    };
  }

  // A full historical snapshot exceeding the
  // supported limit must be rejected.
  //
  // Never truncate to the first 100 records.

  if (data.prompts.length > MAX_PROMPTS) {
    return {
      success: false,
      error: "INCOMPLETE_SNAPSHOT",
    };
  }

  // ====================================================
  // 5. Validate the result's phone-pair boundary.
  // ====================================================

  // The correlation policy performs further checks
  // on UUIDs, SIDs, delivery evidence, timestamps,
  // Coordinator version, and prompt ambiguity.
  //
  // Here, reject a malformed record or an unexpected
  // phone pair before returning it to that policy.

  for (const prompt of data.prompts) {
    if (
      !isRecord(prompt) ||
      prompt.restaurantPhone !==
        request.restaurantPhone ||
      prompt.guestPhone !== request.guestPhone
    ) {
      return {
        success: false,
        error: "INVALID_DATABASE_RESPONSE",
      };
    }
  }

  // ====================================================
  // 6. Return the validated snapshot container.
  // ====================================================

  // This is a read-only snapshot of database evidence.
  // It is not a Coordinator transition decision.

  return {
    success: true,
    snapshot: {
      complete: true,
      prompts: data.prompts,
    },
  };
}

/**
 * Construct the reader expected by:
 *
 * resolveReservationPromptSnapshot()
 *
 * This factory retains the explicit enabled flag.
 * A disabled reader fails closed.
 *
 * Do not create this reader using a browser-facing
 * Supabase client or a user-controlled configuration.
 */
export function createSupabasePromptSnapshotReader(
  supabase: SupabaseClient,
  options: SupabasePromptReaderOptions = {},
): PromptSnapshotReader {
  return async (
    request: PromptSnapshotRequest,
  ): Promise<PromptSnapshot> => {
    const result =
      await readSupabasePromptSnapshot(
        supabase,
        request,
        options,
      );

    if (!result.success) {
      // The higher-level snapshot resolver catches
      // this error and reports lookup_failed.
      //
      // Do not include sensitive request fields.
      throw new Error(
        `PROMPT_SNAPSHOT_${result.error}`,
      );
    }

    return result.snapshot;
  };
}