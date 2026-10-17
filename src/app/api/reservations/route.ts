
import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const MAX_BODY_BYTES = 8192;
const MAX_TIMESTAMP_AGE_SECONDS = 300;

type ReservationStatus = "pending" | "incomplete" | "unvalidated";

type ReservationRequest = {
  twilioExecutionSid: string;
  customerPhone: string;
  requestStatus: ReservationStatus;
  detailsValidated: boolean;
  customerName: string | null;
  reservationDate: string | null;
  reservationTime: string | null;
  partySize: number | null;
  occasion: string | null;
  email: string | null;
  vipPreference: string | null;
  interruptionReason: string | null;
  interruptionStage: string | null;
};

type IngestionResult = {
  reservation_id: string;
  resulting_status: string;
  reservation_created: boolean;
  notification_created: boolean;
  notification_event_key: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function optionalString(
  value: unknown,
  maxLength: number,
): string | null | undefined {
  if (value === null || value === undefined) return null;
  if (typeof value !== "string") return undefined;

  const trimmed = value.trim();

  if (trimmed.length > maxLength) return undefined;

  return trimmed || null;
}

function verifySignature(
  timestamp: string | null,
  signature: string | null,
  body: string,
): boolean {
  const secret = process.env.RESERVATION_INGEST_SECRET;

  if (!secret || !/^[a-f0-9]{64}$/.test(secret)) {
    return false;
  }

  if (!timestamp || !/^\d{10}$/.test(timestamp)) {
    return false;
  }

  if (!signature || !/^[a-f0-9]{64}$/i.test(signature)) {
    return false;
  }

  const requestTime = Number(timestamp);
  const currentTime = Math.floor(Date.now() / 1000);

  if (
    !Number.isSafeInteger(requestTime) ||
    Math.abs(currentTime - requestTime) > MAX_TIMESTAMP_AGE_SECONDS
  ) {
    return false;
  }

  const expected = createHmac(
    "sha256",
    Buffer.from(secret, "hex"),
  )
    .update(`${timestamp}.${body}`)
    .digest();

  const received = Buffer.from(signature, "hex");

  return (
    expected.length === received.length &&
    timingSafeEqual(expected, received)
  );
}

function isValidDate(value: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

  if (!match) return false;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  if (year < 2000 || year > 9999) return false;

  const parsedDate = new Date(Date.UTC(year, month - 1, day));

  return (
    parsedDate.getUTCFullYear() === year &&
    parsedDate.getUTCMonth() === month - 1 &&
    parsedDate.getUTCDate() === day
  );
}

function isValidTime(value: string): boolean {
  const match = /^(\d{2}):(\d{2})(?::(\d{2}))?$/.exec(value);

  if (!match) return false;

  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  const seconds = Number(match[3] ?? "0");

  return hours <= 23 && minutes <= 59 && seconds <= 59;
}

function validateReservation(
  input: unknown,
): ReservationRequest | null {
  if (!isRecord(input)) return null;

  const allowedFields = new Set([
    "twilioExecutionSid",
    "customerPhone",
    "requestStatus",
    "detailsValidated",
    "customerName",
    "reservationDate",
    "reservationTime",
    "partySize",
    "occasion",
    "email",
    "vipPreference",
    "interruptionReason",
    "interruptionStage",
  ]);

  if (Object.keys(input).some((key) => !allowedFields.has(key))) {
    return null;
  }

  const {
    twilioExecutionSid,
    customerPhone,
    requestStatus,
    detailsValidated,
  } = input;

  if (
    typeof twilioExecutionSid !== "string" ||
    !/^FN[0-9a-f]{32}$/i.test(twilioExecutionSid)
  ) {
    return null;
  }

  if (
    typeof customerPhone !== "string" ||
    !/^\+[1-9]\d{7,14}$/.test(customerPhone)
  ) {
    return null;
  }

  if (
    typeof customerPhone !== "string" ||
    !/^\+[1-9]\d{7,14}$/.test(customerPhone)
  ) {
    return null;
  }

  if (
    requestStatus !== "pending" &&
    requestStatus !== "incomplete" &&
    requestStatus !== "unvalidated"
  ) {
    return null;
  }

  if (typeof detailsValidated !== "boolean") {
    return null;
  }

  if (requestStatus === "pending" && !detailsValidated) {
    return null;
  }

  if (requestStatus === "unvalidated" && detailsValidated) {
    return null;
  }

  const customerName = optionalString(input.customerName, 120);
  const reservationDate = optionalString(input.reservationDate, 10);
  const reservationTime = optionalString(input.reservationTime, 8);
  const occasion = optionalString(input.occasion, 120);
  const email = optionalString(input.email, 254);
  const vipPreference = optionalString(input.vipPreference, 30);
  const interruptionReason = optionalString(
    input.interruptionReason,
    120,
  );
  const interruptionStage = optionalString(
    input.interruptionStage,
    120,
  );

  if (
    customerName === undefined ||
    reservationDate === undefined ||
    reservationTime === undefined ||
    occasion === undefined ||
    email === undefined ||
    vipPreference === undefined ||
    interruptionReason === undefined ||
    interruptionStage === undefined
  ) {
    return null;
  }

  const partySize =
    input.partySize === null || input.partySize === undefined
      ? null
      : input.partySize;

  if (
    partySize !== null &&
    (typeof partySize !== "number" ||
      !Number.isInteger(partySize) ||
      partySize < 1 ||
      partySize > 20)
  ) {
    return null;
  }

  if (
    typeof vipPreference === "string" &&
    !["YES", "NO", "NEEDS STAFF FOLLOW-UP"].includes(vipPreference)
  ) {
    return null;
  }

  if (
    typeof email === "string" &&
    email !== "NOT REQUIRED" &&
    email !== "NEEDS STAFF FOLLOW-UP" &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  ) {
    return null;
  }

  if (
    typeof reservationDate === "string" &&
    !isValidDate(reservationDate)
  ) {
    return null;
  }

  if (
    typeof reservationTime === "string" &&
    !isValidTime(reservationTime)
  ) {
    return null;
  }

  if (detailsValidated) {
    if (
      !customerName ||
      !reservationDate ||
      !reservationTime ||
      partySize === null
    ) {
      return null;
    }
  } else if (
    customerName !== null ||
    reservationDate !== null ||
    reservationTime !== null ||
    partySize !== null ||
    occasion !== null ||
    email !== null ||
    vipPreference !== null
  ) {
    return null;
  }

  if (requestStatus === "pending") {
    if (
      interruptionReason !== null ||
      interruptionStage !== null
    ) {
      return null;
    }
  } else {
    if (!interruptionReason || !interruptionStage) {
      return null;
    }

    if (
      interruptionReason !== "CUSTOMER TIMEOUT" &&
      interruptionReason !== "MESSAGE DELIVERY FAILURE"
    ) {
      return null;
    }
  }

  return {
    twilioExecutionSid: twilioExecutionSid.toUpperCase(),
    customerPhone,
    requestStatus,
    detailsValidated,
    customerName: customerName ?? null,
    reservationDate: reservationDate ?? null,
    reservationTime: reservationTime ?? null,
    partySize: partySize as number | null,
    occasion: occasion ?? null,
    email: email ?? null,
    vipPreference: vipPreference ?? null,
    interruptionReason: interruptionReason ?? null,
    interruptionStage: interruptionStage ?? null,
  };
}

function getSupabaseClient() {
  const url =
    process.env.SUPABASE_URL ??
    process.env.NEXT_PUBLIC_SUPABASE_URL;

  const key =
    process.env.SUPABASE_SECRET_KEY ??
    process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error("Reservation database configuration is missing.");
  }

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

async function persistReservation(
  reservation: ReservationRequest,
): Promise<IngestionResult> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase.rpc(
    "ingest_reservation_request",
    {
      p_twilio_execution_sid: reservation.twilioExecutionSid,
      p_customer_phone: reservation.customerPhone,
      p_request_status: reservation.requestStatus,
      p_details_validated: reservation.detailsValidated,
      p_customer_name: reservation.customerName,
      p_reservation_date: reservation.reservationDate,
      p_reservation_time: reservation.reservationTime,
      p_party_size: reservation.partySize,
      p_occasion: reservation.occasion,
      p_email: reservation.email,
      p_vip_preference: reservation.vipPreference,
      p_interruption_reason: reservation.interruptionReason,
      p_interruption_stage: reservation.interruptionStage,
    },
  );

  if (error) {
    throw new Error("Reservation ingestion failed.");
  }

  if (!Array.isArray(data) || data.length !== 1) {
    throw new Error("Unexpected reservation ingestion result.");
  }

  const result: unknown = data[0];

  if (!isRecord(result)) {
    throw new Error("Invalid reservation ingestion result.");
  }

  const validReservationId =
    typeof result.reservation_id === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      result.reservation_id,
    );

  const validStatus =
    result.resulting_status === "pending" ||
    result.resulting_status === "incomplete" ||
    result.resulting_status === "unvalidated" ||
    result.resulting_status === "confirmed" ||
    result.resulting_status === "closed";

  if (
    !validReservationId ||
    !validStatus ||
    typeof result.reservation_created !== "boolean" ||
    typeof result.notification_created !== "boolean" ||
    typeof result.notification_event_key !== "string" ||
    result.notification_event_key.trim().length === 0
  ) {
    throw new Error("Invalid reservation ingestion result.");
  }

  return result as IngestionResult;
}

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type");

    if (!contentType?.toLowerCase().startsWith("application/json")) {
      return NextResponse.json(
        { error: "Unsupported content type." },
        { status: 415 },
      );
    }

    const declaredLength = request.headers.get("content-length");

    if (
      declaredLength !== null &&
      Number(declaredLength) > MAX_BODY_BYTES
    ) {
      return NextResponse.json(
        { error: "Request too large." },
        { status: 413 },
      );
    }

    const rawBody = await request.text();

    if (Buffer.byteLength(rawBody, "utf8") > MAX_BODY_BYTES) {
      return NextResponse.json(
        { error: "Request too large." },
        { status: 413 },
      );
    }

    const authenticated = verifySignature(
      request.headers.get("x-reservation-timestamp"),
      request.headers.get("x-reservation-signature"),
      rawBody,
    );

    if (!authenticated) {
      return NextResponse.json(
        { error: "Unauthorized." },
        { status: 401 },
      );
    }

    let parsed: unknown;

    try {
      parsed = JSON.parse(rawBody);
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON." },
        { status: 400 },
      );
    }

    const reservation = validateReservation(parsed);

    if (!reservation) {
      return NextResponse.json(
        { error: "Invalid reservation request." },
        { status: 400 },
      );
    }

    // Database writes remain disabled until explicitly authorized.
    if (process.env.RESERVATION_INGEST_WRITES_ENABLED !== "true") {
      return NextResponse.json({
        success: true,
        authenticated: true,
        validated: true,
        persisted: false,
      });
    }

    const result = await persistReservation(reservation);

    return NextResponse.json({
      success: true,
      authenticated: true,
      validated: true,
      persisted: true,
      reservationId: result.reservation_id,
      reservationStatus: result.resulting_status,
      reservationCreated: result.reservation_created,
      notificationCreated: result.notification_created,
      notificationEventKey: result.notification_event_key,
    });
  } catch {
    return NextResponse.json(
      { error: "Unable to process reservation request." },
      { status: 500 },
    );
  }
}
