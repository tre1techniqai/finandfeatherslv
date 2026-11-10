import { createHmac, timingSafeEqual } from "node:crypto";

import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

import { processReservationDepositPaymentReply } from "@/lib/reservations/process-reservation-deposit-payment-reply";

// Protected Twilio Functions -> Next.js ingress. The request supplies only
// Twilio identity; the processor independently fetches the actual message.
// Never invoke this endpoint from a browser or accept a supplied SMS body.
const MAX_BODY_BYTES = 2048;
const MAX_CLOCK_SKEW_SECONDS = 300;
const MESSAGE_SID = /^SM[0-9a-f]{32}$/i;
const E164 = /^\+[1-9]\d{7,14}$/;
const HEX_64 = /^[0-9a-f]{64}$/i;
const TIMESTAMP = /^\d{10}$/;

type InboundPayload = {
  messageSid: string;
  guestPhone: string;
  restaurantPhone: string;
};

function respond(data: Record<string, unknown>, status = 200): NextResponse {
  return NextResponse.json(data, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

function reject(status: number, code: string): NextResponse {
  return respond({ success: false, code }, status);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function validatePayload(value: unknown): InboundPayload | null {
  if (!isRecord(value)) return null;
  const keys = Object.keys(value);
  if (
    keys.length !== 3 ||
    !keys.includes("messageSid") ||
    !keys.includes("guestPhone") ||
    !keys.includes("restaurantPhone") ||
    typeof value.messageSid !== "string" ||
    !MESSAGE_SID.test(value.messageSid) ||
    typeof value.guestPhone !== "string" ||
    !E164.test(value.guestPhone) ||
    typeof value.restaurantPhone !== "string" ||
    !E164.test(value.restaurantPhone) ||
    value.guestPhone === value.restaurantPhone
  ) {
    return null;
  }
  return {
    messageSid: value.messageSid,
    guestPhone: value.guestPhone,
    restaurantPhone: value.restaurantPhone,
  };
}

function verifySignature(
  timestamp: string,
  signature: string,
  rawBody: string,
  secret: string,
): boolean {
  if (
    !TIMESTAMP.test(timestamp) ||
    !HEX_64.test(signature) ||
    !HEX_64.test(secret)
  ) {
    return false;
  }

  const now = Math.floor(Date.now() / 1000);
  const time = Number(timestamp);
  if (
    !Number.isSafeInteger(time) ||
    Math.abs(now - time) > MAX_CLOCK_SKEW_SECONDS
  ) {
    return false;
  }

  const expected = createHmac("sha256", Buffer.from(secret, "hex"))
    .update(`${timestamp}.${rawBody}`)
    .digest();
  const supplied = Buffer.from(signature, "hex");
  return supplied.length === expected.length && timingSafeEqual(supplied, expected);
}

function createTrustedClient() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  try {
    const parsed = new URL(url);
    const localHttp = parsed.protocol === "http:" &&
      ["localhost", "127.0.0.1"].includes(parsed.hostname);
    if (
      (parsed.protocol !== "https:" && !localHttp) ||
      parsed.username || parsed.password || parsed.search || parsed.hash
    ) {
      return null;
    }
    return createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  } catch {
    return null;
  }
}

export async function POST(request: Request): Promise<NextResponse> {
  if (process.env.RESERVATION_DEPOSIT_PAYMENT_REPLY_INGRESS_ENABLED !== "true") {
    return reject(503, "FEATURE_DISABLED");
  }

  const secret = process.env.RESERVATION_DEPOSIT_PAYMENT_INGRESS_SECRET;
  if (!secret || !HEX_64.test(secret)) {
    return reject(503, "INGRESS_NOT_CONFIGURED");
  }

  const contentType = request.headers.get("content-type") ?? "";
  if (!/^application\/json(?:\s*;|$)/i.test(contentType)) {
    return reject(415, "UNSUPPORTED_CONTENT_TYPE");
  }

  const declaredLength = request.headers.get("content-length");
  if (
    declaredLength !== null &&
    (!/^\d+$/.test(declaredLength) ||
      !Number.isSafeInteger(Number(declaredLength)) ||
      Number(declaredLength) > MAX_BODY_BYTES)
  ) {
    return reject(413, "REQUEST_TOO_LARGE");
  }

  let rawBody: string;
  try {
    rawBody = await request.text();
  } catch {
    return reject(400, "INVALID_REQUEST_BODY");
  }
  if (Buffer.byteLength(rawBody, "utf8") > MAX_BODY_BYTES) {
    return reject(413, "REQUEST_TOO_LARGE");
  }

  if (!verifySignature(
    request.headers.get("x-deposit-payment-timestamp") ?? "",
    request.headers.get("x-deposit-payment-signature") ?? "",
    rawBody,
    secret,
  )) {
    return reject(401, "UNAUTHORIZED");
  }

  let data: unknown;
  try {
    data = JSON.parse(rawBody);
  } catch {
    return reject(400, "INVALID_JSON");
  }
  const input = validatePayload(data);
  if (!input) return reject(400, "INVALID_MESSAGE_IDENTITY");

  if (!process.env.TWILIO_FROM_NUMBER ||
      input.restaurantPhone !== process.env.TWILIO_FROM_NUMBER) {
    return reject(409, "RESTAURANT_PHONE_MISMATCH");
  }

  const db = createTrustedClient();
  if (!db) return reject(503, "DATABASE_NOT_CONFIGURED");

  try {
    const result = await processReservationDepositPaymentReply(db, input);

    if (result.status === "recorded" || result.status === "duplicate") {
      // "recorded" means persisted, NOT that staff received the alert or
      // that the guest received an assistance SMS. Follow-ups are tracked
      // independently by their durable claims and finalization statuses.
      return respond({
        success: true,
        status: result.status,
        reservationId: result.reservationId,
        messageSid: result.messageSid,
        followUp: result.followUp,
      });
    }
    if (result.status === "not_applicable") {
      // A verified inbound SMS with no deposit-invoice context is NOT
      // consumed. Studio must continue the existing guest-message routing.
      return respond({
        success: true,
        status: "not_applicable",
      });
    }
    if (result.status === "review") {
      return respond({ success: false, status: "review", reason: result.reason });
    }
    if (result.status === "blocked") {
      return respond({ success: false, status: "blocked", reason: result.reason }, 409);
    }
    if (result.status === "error") {
      console.error("Deposit payment reply processing unavailable", { reason: result.reason });
      return reject(503, "PROCESSING_UNAVAILABLE");
    }
    return reject(503, "UNEXPECTED_PROCESSING_RESULT");
  } catch {
    console.error("Unexpected deposit payment ingress failure");
    return reject(503, "PROCESSING_UNAVAILABLE");
  }
}