import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import twilio from "twilio";

import { requireReservationStaff } from "@/lib/auth/require-reservation-staff";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const MESSAGE_SID = /^SM[0-9a-f]{32}$/i;
const E164 = /^\+[1-9]\d{7,14}$/;
const ACCOUNT_SID = /^AC[0-9a-f]{32}$/i;

const PAGE_SIZE = 10;

type RouteContext = {
  params: Promise<{ id: string }>;
};

type Association = {
  sid: string;
  reservationId: string;
  timestamp: string;
};

type Source = {
  table: string;
  sidColumn: string;
  timestampColumn: string;
};

const SOURCES: Source[] = [
  {
    table: "reservation_notification_events",
    sidColumn: "twilio_message_sid",
    timestampColumn: "created_at",
  },
  {
    table: "reservation_staff_sms_operations",
    sidColumn: "twilio_message_sid",
    timestampColumn: "created_at",
  },
  {
    table: "reservation_alternative_offers",
    sidColumn: "inbound_message_sid",
    timestampColumn: "accepted_at",
  },
];

function respond(
  data: Record<string, unknown>,
  status = 200,
) {
  return NextResponse.json(data, {
    status,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

function validCursor(value: string | null): number | null {
  if (value === null) return 0;

  if (!/^(0|[1-9]\d{0,8})$/.test(value)) {
    return null;
  }

  const offset = Number(value);

  return Number.isSafeInteger(offset) ? offset : null;
}

export async function GET(
  request: Request,
  context: RouteContext,
) {
  try {
    const { id } = await context.params;

    if (!UUID.test(id)) {
      return respond(
        { success: false, error: "Invalid reservation." },
        400,
      );
    }

    const url = new URL(request.url);
    const offset = validCursor(url.searchParams.get("cursor"));

    if (offset === null) {
      return respond(
        { success: false, error: "Invalid history cursor." },
        400,
      );
    }

    const { supabase, role } = await requireReservationStaff();

    if (role !== "manager") {
      return respond(
        { success: false, error: "Manager access required." },
        403,
      );
    }

    const { data: reservation, error: reservationError } =
      await supabase
        .from("reservation_requests")
        .select("id, customer_name, customer_phone")
        .eq("id", id)
        .maybeSingle();

    if (reservationError) {
      return respond(
        { success: false, error: "Reservation lookup failed." },
        500,
      );
    }

    if (!reservation) {
      return respond(
        { success: false, error: "Reservation not found." },
        404,
      );
    }

    const guestPhone = reservation.customer_phone;
    const restaurantPhone = process.env.TWILIO_FROM_NUMBER;
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;

    const supabaseUrl =
      process.env.SUPABASE_URL ??
      process.env.NEXT_PUBLIC_SUPABASE_URL;

    const serviceKey =
      process.env.SUPABASE_SECRET_KEY ??
      process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (
      !E164.test(guestPhone) ||
      !restaurantPhone ||
      !E164.test(restaurantPhone) ||
      guestPhone === restaurantPhone ||
      !accountSid ||
      !ACCOUNT_SID.test(accountSid) ||
      !authToken ||
      !supabaseUrl ||
      !serviceKey
    ) {
      return respond(
        {
          success: false,
          error: "Conversation service is not configured.",
        },
        503,
      );
    }

    const admin = createClient(supabaseUrl, serviceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    const associations = new Map<string, Association>();
    const conflicting = new Set<string>();

    // Collect associations across ALL reservations so a SID linked
    // to multiple reservations is never assigned to either thread.
    for (const source of SOURCES) {
      const batchSize = 1000;
      let start = 0;

      while (true) {
        const { data, error } = await admin
          .from(source.table)
          .select(
            `reservation_request_id, ${source.sidColumn}, ${source.timestampColumn}`,
          )
          .order("reservation_request_id", { ascending: true })
          .range(start, start + batchSize - 1);

        if (error) {
          console.error("Scoped history association lookup failed", {
            table: source.table,
            code: error.code,
          });

          return respond(
            {
              success: false,
              error: "Unable to verify conversation history.",
            },
            503,
          );
        }

        const rows = (data ?? []) as unknown as Record<string, unknown>[];

        for (const row of rows) {
          const sid = row[source.sidColumn];
          const reservationId = row.reservation_request_id;
          const timestamp = row[source.timestampColumn];

          if (
            typeof sid !== "string" ||
            !MESSAGE_SID.test(sid) ||
            typeof reservationId !== "string" ||
            !UUID.test(reservationId)
          ) {
            continue;
          }

          const existing = associations.get(sid);

          if (existing && existing.reservationId !== reservationId) {
            conflicting.add(sid);
            continue;
          }

          if (!existing) {
            associations.set(sid, {
              sid,
              reservationId,
              timestamp:
                typeof timestamp === "string" &&
                Number.isFinite(Date.parse(timestamp))
                  ? timestamp
                  : "1970-01-01T00:00:00.000Z",
            });
          }
        }

        if (rows.length < batchSize) break;
        start += batchSize;
      }
    }

    const candidates = [...associations.values()]
      .filter(
        (entry) =>
          entry.reservationId === id &&
          !conflicting.has(entry.sid),
      )
      .sort(
        (a, b) =>
          Date.parse(b.timestamp) - Date.parse(a.timestamp) ||
          b.sid.localeCompare(a.sid),
      );

    const client = twilio(accountSid, authToken, {
      autoRetry: false,
    });

    const verified: {
      sid: string;
      direction: "inbound" | "outbound";
      body: string;
      status: string;
      dateCreated: string | null;
      dateSent: string | null;
      errorCode: number | null;
    }[] = [];

    // Verify the phone pair and direction using Twilio.
    // Do not return unrelated or unverified message content.
    for (const entry of candidates) {
      const message = await client.messages(entry.sid).fetch();

      const inbound =
        message.from === guestPhone &&
        message.to === restaurantPhone;

      const outbound =
        message.from === restaurantPhone &&
        message.to === guestPhone;

      if (!inbound && !outbound) continue;

      verified.push({
        sid: message.sid,
        direction: inbound ? "inbound" : "outbound",
        body: message.body ?? "",
        status: message.status,
        dateCreated: message.dateCreated?.toISOString() ?? null,
        dateSent: message.dateSent?.toISOString() ?? null,
        errorCode: message.errorCode ?? null,
      });
    }

    verified.sort((a, b) => {
      const aTime = a.dateCreated
        ? Date.parse(a.dateCreated)
        : 0;

      const bTime = b.dateCreated
        ? Date.parse(b.dateCreated)
        : 0;

      return bTime - aTime || b.sid.localeCompare(a.sid);
    });

    const page = verified.slice(offset, offset + PAGE_SIZE);
    const nextOffset = offset + page.length;

    return respond({
      success: true,
      reservationId: id,
      guestName: reservation.customer_name,
      guestPhone,
      messages: page.reverse(),
      count: page.length,
      hasMore: nextOffset < verified.length,
      nextCursor:
        nextOffset < verified.length
          ? String(nextOffset)
          : null,
      pageSize: PAGE_SIZE,
      reservationScoped: true,
      historicalCoverageComplete: false,
      readOnly: true,
    });
  } catch (error) {
    console.error("Scoped conversation history failed", {
      name: error instanceof Error ? error.name : "UnknownError",
    });

    return respond(
      {
        success: false,
        error: "Unable to load conversation history.",
      },
      502,
    );
  }
}