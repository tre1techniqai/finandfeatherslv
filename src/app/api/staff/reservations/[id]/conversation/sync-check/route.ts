import { createHash } from "node:crypto";

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

import {
  requireReservationStaff,
} from "@/lib/auth/require-reservation-staff";

const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const MESSAGE_SID = /^SM[0-9a-f]{32}$/i;
const E164 = /^\+[1-9]\d{7,14}$/;
const FINGERPRINT = /^[0-9a-f]{64}$/;

const MAX_ASSOCIATIONS_PER_SOURCE = 1000;

const SOURCES = [
  {
    table: "reservation_notification_events",
    sidColumn: "twilio_message_sid",
  },
  {
    table: "reservation_staff_sms_operations",
    sidColumn: "twilio_message_sid",
  },
  {
    table: "reservation_alternative_offers",
    sidColumn: "inbound_message_sid",
  },
  {
    table: "reservation_guest_assistance_alerts",
    sidColumn: "twilio_message_sid",
  },
  {
    table: "reservation_message_sid_ownership",
    sidColumn: "twilio_message_sid",
  },
  {
    table: "reservation_studio_message_associations",
    sidColumn: "twilio_message_sid",
  },
] as const;

type RouteContext = {
  params: Promise<{ id: string }>;
};

type SharedRow = {
  message_sid: string;
  message_direction: "inbound" | "outbound";
};

function respond(payload: Record<string, unknown>, status = 200) {
  return NextResponse.json(payload, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

function fail(error: string, status: number) {
  return respond({ success: false, error }, status);
}

function validSharedRow(value: unknown): value is SharedRow {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  const row = value as Record<string, unknown>;

  return (
    typeof row.message_sid === "string" &&
    MESSAGE_SID.test(row.message_sid) &&
    (row.message_direction === "inbound" ||
      row.message_direction === "outbound")
  );
}

/**
 * Read-only change detection for reservation-associated Message SIDs.
 *
 * This is an invalidation hint, NOT an ownership authorization or
 * complete history verification. The scoped-history route performs all
 * conflict checks and independent Twilio identity verification before
 * displaying message bodies.
 *
 * A periodic full-history refresh remains necessary for provider status
 * changes and association sources that may not yet have been persisted.
 */
export async function GET(
  request: Request,
  context: RouteContext,
): Promise<NextResponse> {
  try {
    const { id } = await context.params;

    if (!UUID.test(id)) {
      return fail("Invalid reservation.", 400);
    }

    const url = new URL(request.url);
    const fingerprints = url.searchParams.getAll("fingerprint");

    if (
      fingerprints.length > 1 ||
      (fingerprints.length === 1 && !FINGERPRINT.test(fingerprints[0]))
    ) {
      return fail("Invalid synchronization fingerprint.", 400);
    }

    const previousFingerprint = fingerprints[0] ?? null;

    // Apply the same staff-role restrictions as scoped history.
    const { supabase } = await requireReservationStaff();

    const { data: reservation, error: reservationError } =
      await supabase
        .from("reservation_requests")
        .select("id, customer_phone")
        .eq("id", id)
        .maybeSingle();

    if (reservationError) {
      return fail("Reservation lookup failed.", 500);
    }

    if (!reservation) {
      return fail("Reservation not found.", 404);
    }

    const guestPhone = reservation.customer_phone;
    const restaurantPhone = process.env.TWILIO_FROM_NUMBER;
    const supabaseUrl =
      process.env.SUPABASE_URL ??
      process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey =
      process.env.SUPABASE_SECRET_KEY ??
      process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (
      typeof guestPhone !== "string" ||
      !E164.test(guestPhone) ||
      !restaurantPhone ||
      !E164.test(restaurantPhone) ||
      guestPhone === restaurantPhone ||
      !supabaseUrl ||
      !serviceKey
    ) {
      return fail("Conversation service is not configured.", 503);
    }

    const admin = createClient(supabaseUrl, serviceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    // Include the source identity in the signature so a new association
    // in another source is detected even if its SID is already present.
    const entries = new Set<string>();

    for (const source of SOURCES) {
      const { data, error } = await admin
        .from(source.table)
        .select(`reservation_request_id, ${source.sidColumn}`)
        .eq("reservation_request_id", id)
        .not(source.sidColumn, "is", null)
        .limit(MAX_ASSOCIATIONS_PER_SOURCE + 1);

      if (error || !Array.isArray(data)) {
        console.error("Conversation sync association lookup failed.", {
          table: source.table,
          code: error?.code,
        });
        return fail("Unable to check conversation changes.", 503);
      }

      if (data.length > MAX_ASSOCIATIONS_PER_SOURCE) {
        return fail("Conversation association limit exceeded.", 503);
      }

      for (const value of data) {
        const row = value as Record<string, unknown>;
        const sid = row[source.sidColumn];

        if (
          row.reservation_request_id !== id ||
          typeof sid !== "string" ||
          !MESSAGE_SID.test(sid)
        ) {
          return fail("Invalid conversation association.", 503);
        }

        entries.add(`${source.table}:${sid.toLowerCase()}`);
      }
    }

    // Shared inbound and accepted staff outbound associations are
    // accessed ONLY through the existing protected SECURITY DEFINER RPC.
    const { data: sharedData, error: sharedError } = await admin.rpc(
      "get_reservation_shared_sms_history",
      {
        p_reservation_id: id,
        p_restaurant_phone: restaurantPhone,
      },
    );

    if (sharedError) {
      // Legacy reservations may have no shared conversation. This is
      // an existing scoped-history compatibility behavior.
      if (sharedError.code !== "22023") {
        console.error("Conversation sync shared lookup failed.", {
          code: sharedError.code,
        });
        return fail("Unable to check shared conversation changes.", 503);
      }
    } else {
      if (
        !Array.isArray(sharedData) ||
        sharedData.length > MAX_ASSOCIATIONS_PER_SOURCE
      ) {
        return fail("Invalid shared conversation changes.", 503);
      }

      const sharedSids = new Set<string>();

      for (const value of sharedData) {
        if (!validSharedRow(value)) {
          return fail("Invalid shared conversation association.", 503);
        }

        const sid = value.message_sid.toLowerCase();

        // Mirroring scoped-history: duplicate SIDs in protected
        // shared-history results indicate a conflict, not a valid hint.
        if (sharedSids.has(sid)) {
          return fail("Conflicting shared associations.", 503);
        }

        sharedSids.add(sid);
        entries.add(`shared:${sid}:${value.message_direction}`);
      }
    }

    // Sort before hashing: row order must never create false changes.
    // Hash only association metadata; no message bodies or phone numbers.
    const fingerprint = createHash("sha256")
      .update(JSON.stringify([...entries].sort()))
      .digest("hex");

    return respond({
      success: true,
      reservationId: id,
      changed: previousFingerprint !== fingerprint,
      fingerprint,
    });
  } catch (error) {
    console.error("Conversation sync check failed.", {
      category: "CONVERSATION_SYNC_CHECK_ERROR",
      name: error instanceof Error ? error.name : "UnknownError",
    });

    return fail("Unable to check conversation changes.", 502);
  }
}