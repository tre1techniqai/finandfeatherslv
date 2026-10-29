import { NextResponse } from "next/server";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import twilio from "twilio";

import { requireReservationStaff } from "@/lib/auth/require-reservation-staff";

const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const MESSAGE_SID = /^SM[0-9a-f]{32}$/i;
const E164 = /^\+[1-9]\d{7,14}$/;
const ACCOUNT_SID = /^AC[0-9a-f]{32}$/i;

const PAGE_SIZE = 10;
const MAX_ASSOCIATIONS_PER_SOURCE = 1000;
const SID_LOOKUP_BATCH_SIZE = 100;
const HISTORICAL_PHONE_LIMIT = 100;
const STUDIO_FLOW_SID = "FW84d1aee0abeaa0e4f8f870e974dc2811";
const EXECUTION_SID = /^FN[0-9a-f]{32}$/i;
const MAX_EXECUTION_START_DRIFT_MS = 5_000;
const MAX_HISTORICAL_WINDOW_MS = 30 * 60_000;

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

type Cursor = {
  timestamp: string;
  sid: string;
};

type ConversationMessage = {
  sid: string;
  direction: "inbound" | "outbound";
  body: string;
  status: string;
  dateCreated: string | null;
  dateSent: string | null;
  errorCode: number | null;
  attribution?: "database" | "historical";
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
  // {
  //   table: "reservation_shared_sms_operations",
  //   sidColumn: "twilio_message_sid",
  //   timestampColumn: "created_at",
  // },
  {
    table: "reservation_guest_assistance_alerts",
    sidColumn: "twilio_message_sid",
    timestampColumn: "created_at",
  },
];

function respond(
  payload: Record<string, unknown>,
  status = 200,
) {
  return NextResponse.json(payload, {
    status,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

function fail(error: string, status: number) {
  return respond(
    {
      success: false,
      error,
    },
    status,
  );
}

function normalizeTimestamp(value: unknown): string {
  if (
    typeof value === "string" &&
    Number.isFinite(Date.parse(value))
  ) {
    return new Date(value).toISOString();
  }

  return "1970-01-01T00:00:00.000Z";
}

function encodeCursor(value: Cursor): string {
  return Buffer.from(
    JSON.stringify([value.timestamp, value.sid]),
    "utf8",
  ).toString("base64url");
}

function decodeCursor(value: string | null): Cursor | null | false {
  if (value === null) {
    return null;
  }

  if (
    value.length > 256 ||
    !/^[A-Za-z0-9_-]+$/.test(value)
  ) {
    return false;
  }

  try {
    const decoded: unknown = JSON.parse(
      Buffer.from(value, "base64url").toString("utf8"),
    );

    if (
      !Array.isArray(decoded) ||
      decoded.length !== 2 ||
      typeof decoded[0] !== "string" ||
      typeof decoded[1] !== "string" ||
      !MESSAGE_SID.test(decoded[1]) ||
      !Number.isFinite(Date.parse(decoded[0])) ||
      normalizeTimestamp(decoded[0]) !== decoded[0]
    ) {
      return false;
    }

    return {
      timestamp: decoded[0],
      sid: decoded[1],
    };
  } catch {
    return false;
  }
}

function compareAssociations(
  a: Association,
  b: Association,
): number {
  const timeDifference =
    Date.parse(b.timestamp) - Date.parse(a.timestamp);

  return (
    timeDifference ||
    b.sid.localeCompare(a.sid)
  );
}

function isOlderThanCursor(
  association: Association,
  cursor: Cursor,
): boolean {
  return (
    compareAssociations(association, {
      sid: cursor.sid,
      timestamp: cursor.timestamp,
      reservationId: association.reservationId,
    }) > 0
  );
}

function batches<T>(
  values: T[],
  size: number,
): T[][] {
  const result: T[][] = [];

  for (let start = 0; start < values.length; start += size) {
    result.push(values.slice(start, start + size));
  }

  return result;
}


/**
 * Conservative, READ-ONLY recovery of automated reservation history.
 *
 * This does not register SIDs in the database or authenticate a message
 * for routing or sending. The recovered messages are explicitly labeled
 * historical, never "database". If any boundary is ambiguous, return none.
 *
 * The form message is required to contain a first/last-name identity
 * matching this reservation AND coincide with the linked Studio execution.
 * The final boundary must be an existing reservation-confirmation SID.
 * Phone equality, timestamps or matching names alone are insufficient.
 */
async function recoverHistoricalAssociations(input: {
  client: ReturnType<typeof twilio>;
  admin: SupabaseClient<any, "public", "public", any, any>;
  reservationId: string;
  customerName: string | null;
  executionSid: string | null;
  guestPhone: string;
  restaurantPhone: string;
  existing: Map<string, Association>;
}): Promise<Association[]> {
  const {
    client, admin, reservationId, customerName,
    executionSid, guestPhone, restaurantPhone, existing,
  } = input;

  if (!customerName?.trim() || !executionSid ||
      !EXECUTION_SID.test(executionSid)) return [];

  // A final confirmation association, not simply "the most recent text",
  // must be available before we infer a finite reservation window.
  const { data: confirmations, error: confirmationError } = await admin
    .from("reservation_notification_events")
    .select("twilio_message_sid")
    .eq("reservation_request_id", reservationId)
    .eq("notification_type", "reservation_confirmed")
    .not("twilio_message_sid", "is", null)
    .limit(2);

  if (confirmationError || !confirmations || confirmations.length !== 1) {
    return [];
  }
  const confirmationSid = confirmations[0].twilio_message_sid;
  if (typeof confirmationSid !== "string" ||
      !MESSAGE_SID.test(confirmationSid) ||
      !existing.has(confirmationSid)) return [];

  let execution;
  try {
    execution = await client.studio.v2
      .flows(STUDIO_FLOW_SID)
      .executions(executionSid)
      .fetch();
  } catch {
    return [];
  }
  if (execution.status !== "ended" || !execution.dateCreated) return [];
  const executionStart = new Date(execution.dateCreated).getTime();
  if (!Number.isFinite(executionStart)) return [];

  // Twilio Message searches here only gather candidates. They do NOT
  // confer reservation ownership. Fail closed on truncated phone history.
  const [inbound, outbound] = await Promise.all([
    client.messages.list({
      from: guestPhone, to: restaurantPhone,
      limit: HISTORICAL_PHONE_LIMIT,
    }),
    client.messages.list({
      from: restaurantPhone, to: guestPhone,
      limit: HISTORICAL_PHONE_LIMIT,
    }),
  ]);
  if (inbound.length >= HISTORICAL_PHONE_LIMIT ||
      outbound.length >= HISTORICAL_PHONE_LIMIT) return [];

  const all = [
    ...inbound.map((message) => ({ message, direction: "inbound" as const })),
    ...outbound.map((message) => ({ message, direction: "outbound" as const })),
  ].filter(({ message }) => message.dateCreated && MESSAGE_SID.test(message.sid))
    .sort((a, b) =>
      a.message.dateCreated!.getTime() - b.message.dateCreated!.getTime() ||
      a.message.sid.localeCompare(b.message.sid),
    );

  const normalizedName = customerName.trim().replace(/\s+/g, " ").toLowerCase();
  const formMatches = all.filter(({ message, direction }) => {
    if (direction !== "inbound" || !message.dateCreated) return false;
    if (Math.abs(message.dateCreated.getTime() - executionStart) >
        MAX_EXECUTION_START_DRIFT_MS) return false;
    const first = /^First Name:\s*(.+)$/im.exec(message.body ?? "")?.[1]?.trim();
    const last = /^Last Name:\s*(.+)$/im.exec(message.body ?? "")?.[1]?.trim();
    return Boolean(first && last &&
      `${first} ${last}`.replace(/\s+/g, " ").toLowerCase() === normalizedName);
  });
  if (formMatches.length !== 1) return [];

  const first = formMatches[0];
  const final = all.find(({ message }) => message.sid === confirmationSid);
  if (!final || !first.message.dateCreated || !final.message.dateCreated ||
      final.direction !== "outbound") return [];
  const firstAt = first.message.dateCreated.getTime();
  const lastAt = final.message.dateCreated.getTime();
  if (lastAt <= firstAt || lastAt - firstAt > MAX_HISTORICAL_WINDOW_MS) {
    return [];
  }

  const window = all.filter(({ message }) => {
    const timestamp = message.dateCreated!.getTime();
    return timestamp >= firstAt && timestamp <= lastAt;
  });

  // If another reservation form begins inside this interval, the boundary
  // is ambiguous: never make a phone-based assignment across that boundary.
  if (window.some(({ message }) =>
      message.sid !== first.message.sid &&
      /^First Name:\s*.+$/im.test(message.body ?? "") &&
      /^Last Name:\s*.+$/im.test(message.body ?? ""))) {
    return [];
  }

  // Strict expected workflow evidence: the VIP request and answer, followed
  // by the existing DB-associated alternative offer/selection and final SMS.
  const hasVipQuestion = window.some(({ direction, message }) =>
    direction === "outbound" && /VIP/i.test(message.body ?? ""));
  const hasVipAnswer = window.some(({ direction, message }) =>
    direction === "inbound" && /^(YES|NO)$/i.test((message.body ?? "").trim()));
  const existingInWindow = window.filter(({ message }) => existing.has(message.sid));
  if (!hasVipQuestion || !hasVipAnswer || existingInWindow.length < 3) {
    return [];
  }

  return window
    .filter(({ message }) => !existing.has(message.sid))
    .map(({ message }) => ({
      sid: message.sid,
      reservationId,
      timestamp: normalizeTimestamp(message.dateCreated?.toISOString()),
    }));
}

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

    const cursorValues = url.searchParams.getAll("cursor");

    if (cursorValues.length > 1) {
      return fail("Invalid history cursor.", 400);
    }

    const cursor = decodeCursor(cursorValues[0] ?? null);

    if (cursor === false) {
      return fail("Invalid history cursor.", 400);
    }

    const { supabase, role } =
      await requireReservationStaff();

    if (role !== "manager") {
      return fail("Manager access required.", 403);
    }

    const {
      data: reservation,
      error: reservationError,
    } = await supabase
      .from("reservation_requests")
      .select("id, customer_name, customer_phone, twilio_execution_sid")
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
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;

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
      !accountSid ||
      !ACCOUNT_SID.test(accountSid) ||
      !authToken ||
      !supabaseUrl ||
      !serviceKey
    ) {
      return fail(
        "Conversation service is not configured.",
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

    // Read only records explicitly linked to the selected
    // reservation. Never select history by phone number alone.
    for (const source of SOURCES) {
      const {
        data,
        error,
      } = await admin
        .from(source.table)
        .select(
          `reservation_request_id, ${source.sidColumn}, ${source.timestampColumn}`,
        )
        .eq("reservation_request_id", id)
        .not(source.sidColumn, "is", null)
        .order(source.timestampColumn, {
          ascending: false,
          nullsFirst: false,
        })
        .limit(MAX_ASSOCIATIONS_PER_SOURCE + 1);

      if (error) {
        console.error("Scoped history source lookup failed", {
          table: source.table,
          code: error.code,
        });

        return fail(
          "Unable to verify conversation history.",
          503,
        );
      }

      const rows =
        (data ?? []) as unknown as Record<string, unknown>[];

      // Fail closed rather than silently truncate a large
      // reservation's history. A future database-native
      // keyset query can remove this development limit.
      if (rows.length > MAX_ASSOCIATIONS_PER_SOURCE) {
        return fail(
          "Conversation history exceeds the current safe retrieval limit.",
          503,
        );
      }

      for (const row of rows) {
        const sid = row[source.sidColumn];
        const reservationId = row.reservation_request_id;

        if (
          typeof sid !== "string" ||
          !MESSAGE_SID.test(sid) ||
          reservationId !== id
        ) {
          continue;
        }

        const timestamp = normalizeTimestamp(
          row[source.timestampColumn],
        );

        const existing = associations.get(sid);

        if (
          !existing ||
          Date.parse(timestamp) >
            Date.parse(existing.timestamp)
        ) {
          associations.set(sid, {
            sid,
            reservationId: id,
            timestamp,
          });
        }
      }
    }

    // Recover only a strictly bounded historical workflow, if possible.
    // A recovery failure does not hide existing DB-verified messages.
    const historicalSids = new Set<string>();
    const client = twilio(accountSid, authToken, { autoRetry: false });
    try {
      const recovered = await recoverHistoricalAssociations({
        client,
        admin,
        reservationId: id,
        customerName: reservation.customer_name,
        executionSid: reservation.twilio_execution_sid,
        guestPhone,
        restaurantPhone,
        existing: associations,
      });
      for (const association of recovered) {
        if (!associations.has(association.sid)) {
          associations.set(association.sid, association);
          historicalSids.add(association.sid);
        }
      }
    } catch (recoveryError) {
      console.error("Historical reservation recovery unavailable", {
        category: "HISTORICAL_RECOVERY_ERROR",
        name: recoveryError instanceof Error ? recoveryError.name : "UnknownError",
      });
    }

    // Cross-check every candidate SID against every direct reservation
    // association source. Conflicting claims are always excluded.
    const allSids = [...associations.keys()];
    const conflictingSids = new Set<string>();

    for (const source of SOURCES) {
      for (const sidBatch of batches(
        allSids,
        SID_LOOKUP_BATCH_SIZE,
      )) {
        const { data, error } = await admin
          .from(source.table)
          .select(
            `reservation_request_id, ${source.sidColumn}`,
          )
          .in(source.sidColumn, sidBatch);

        if (error) {
          console.error(
            "Scoped history conflict check failed",
            {
              table: source.table,
              code: error.code,
            },
          );

          return fail(
            "Unable to verify message associations.",
            503,
          );
        }

        for (const row of (
          (data ?? []) as unknown as Record<string, unknown>[]
        )) {
          const sid = row[source.sidColumn];
          const linkedReservationId =
            row.reservation_request_id;

          if (
            typeof sid === "string" &&
            associations.has(sid) &&
            linkedReservationId !== id
          ) {
            conflictingSids.add(sid);
          }
        }
      }
    }

    const ordered = [...associations.values()]
      .filter(
        (association) =>
          !conflictingSids.has(association.sid),
      )
      .sort(compareAssociations);

    const candidates = cursor
      ? ordered.filter(
          (association) =>
            isOlderThanCursor(association, cursor),
        )
      : ordered;

    const collected: {
      association: Association;
      message: ConversationMessage;
    }[] = [];

    // Fetch only enough Twilio messages to fill one page
    // and detect whether another verified message exists.
    for (const association of candidates) {
      if (collected.length >= PAGE_SIZE + 1) {
        break;
      }

      let message;

      try {
        message = await client.messages(
          association.sid,
        ).fetch();
      } catch (error) {
        console.error(
          "Reservation-associated Twilio message unavailable",
          {
            category: "SCOPED_HISTORY_TWILIO_ERROR",
            name:
              error instanceof Error
                ? error.name
                : "UnknownError",
          },
        );

        // Do not silently treat an unavailable message as
        // absent or skip over uncertain historical records.
        return fail(
          "Unable to verify all requested SMS history. Please retry.",
          503,
        );
      }

      const inbound =
        message.from === guestPhone &&
        message.to === restaurantPhone &&
        message.direction === "inbound";

      const outbound =
        message.from === restaurantPhone &&
        message.to === guestPhone &&
        message.direction !== "inbound";

      if (!inbound && !outbound) {
        continue;
      }

      collected.push({
        association,
        message: {
          sid: message.sid,
          direction: inbound ? "inbound" : "outbound",
          body: message.body ?? "",
          status: message.status,
          dateCreated:
            message.dateCreated?.toISOString() ?? null,
          dateSent:
            message.dateSent?.toISOString() ?? null,
          errorCode: message.errorCode ?? null,
          attribution: historicalSids.has(message.sid)
            ? "historical"
            : "database",
        },
      });
    }

    const hasMore = collected.length > PAGE_SIZE;
    const page = collected.slice(0, PAGE_SIZE);

    const last = page[page.length - 1];

    const nextCursor =
      hasMore && last
        ? encodeCursor({
            timestamp: last.association.timestamp,
            sid: last.association.sid,
          })
        : null;

    return respond({
      success: true,
      reservationId: id,
      guestName: reservation.customer_name,
      guestPhone,
      messages: page
        .map((item) => item.message)
        .sort((a, b) => {
          const aTime = a.dateCreated
            ? Date.parse(a.dateCreated)
            : 0;

          const bTime = b.dateCreated
            ? Date.parse(b.dateCreated)
            : 0;

          return (
            aTime - bTime ||
            a.sid.localeCompare(b.sid)
          );
        }),
      count: page.length,
      hasMore,
      nextCursor,
      pageSize: PAGE_SIZE,
      reservationScoped: true,
      historicalCoverageComplete: false,
      historicalRecoveredCount: page.filter((item) =>
        historicalSids.has(item.message.sid)).length,
      readOnly: true,
    });
  } catch (error) {
    console.error("Scoped conversation history failed", {
      category: "SCOPED_HISTORY_ERROR",
      name:
        error instanceof Error
          ? error.name
          : "UnknownError",
    });

    return fail(
      "Unable to load conversation history.",
      502,
    );
  }
}
