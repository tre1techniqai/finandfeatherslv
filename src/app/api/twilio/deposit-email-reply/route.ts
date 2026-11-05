
import {
  createHmac,
  timingSafeEqual,
} from "node:crypto";

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

import {
  processReservationDepositEmailReply,
} from "@/lib/reservations/process-reservation-deposit-email-reply";

const MAX_BODY_BYTES = 2048;
const MAX_CLOCK_SKEW_SECONDS = 300;

const UUID_SID = /^SM[0-9a-f]{32}$/i;
const E164 = /^\+[1-9]\d{7,14}$/;
const HEX_64 = /^[0-9a-f]{64}$/i;
const TIMESTAMP = /^\d{10}$/;

type InboundPayload = {
  messageSid: string;
  guestPhone: string;
  restaurantPhone: string;
};

function respond(
  data: Record<string, unknown>,
  status = 200,
): NextResponse {
  return NextResponse.json(data, {
    status,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

function reject(
  status: number,
  code: string,
): NextResponse {
  return respond(
    {
      success: false,
      code,
    },
    status,
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

function validatePayload(
  value: unknown,
): InboundPayload | null {
  if (!isRecord(value)) return null;

  if (
    Object.keys(value).length !== 3 ||
    !UUID_SID.test(
      typeof value.messageSid === "string"
        ? value.messageSid
        : "",
    ) ||
    !E164.test(
      typeof value.guestPhone === "string"
        ? value.guestPhone
        : "",
    ) ||
    !E164.test(
      typeof value.restaurantPhone === "string"
        ? value.restaurantPhone
        : "",
    ) ||
    value.guestPhone === value.restaurantPhone
  ) {
    return null;
  }

  return {
    messageSid: value.messageSid as string,
    guestPhone: value.guestPhone as string,
    restaurantPhone: value.restaurantPhone as string,
  };
}

function verifySignature(
  timestamp: string,
  signature: string,
  body: string,
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
  const suppliedTime = Number(timestamp);

  if (
    !Number.isSafeInteger(suppliedTime) ||
    Math.abs(now - suppliedTime) >
      MAX_CLOCK_SKEW_SECONDS
  ) {
    return false;
  }

  const expected = createHmac(
    "sha256",
    Buffer.from(secret, "hex"),
  )
    .update(`${timestamp}.${body}`)
    .digest();

  const received = Buffer.from(
    signature,
    "hex",
  );

  return (
    received.length === expected.length &&
    timingSafeEqual(received, expected)
  );
}

function createTrustedClient() {
  const url =
    process.env.SUPABASE_URL ??
    process.env.NEXT_PUBLIC_SUPABASE_URL;

  const key =
    process.env.SUPABASE_SECRET_KEY ??
    process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) return null;

  try {
    const parsed = new URL(url);

    if (
      parsed.username ||
      parsed.password ||
      parsed.search ||
      parsed.hash ||
      (
        parsed.protocol !== "https:" &&
        !(
          parsed.protocol === "http:" &&
          ["localhost", "127.0.0.1"].includes(
            parsed.hostname,
          )
        )
      )
    ) {
      return null;
    }

    return createClient(url, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  } catch {
    return null;
  }
}

export async function POST(
  request: Request,
): Promise<NextResponse> {
  if (
    process.env.RESERVATION_DEPOSIT_EMAIL_INGRESS_ENABLED !==
    "true"
  ) {
    return reject(503, "FEATURE_DISABLED");
  }

  const secret =
    process.env.RESERVATION_DEPOSIT_EMAIL_INGRESS_SECRET;

  if (!secret || !HEX_64.test(secret)) {
    return reject(503, "INGRESS_NOT_CONFIGURED");
  }

  const contentType =
    request.headers.get("content-type") ?? "";

  if (
    !/^application\/json(?:\s*;|$)/i.test(
      contentType,
    )
  ) {
    return reject(415, "UNSUPPORTED_CONTENT_TYPE");
  }

  const declaredLength =
    request.headers.get("content-length");

  if (
    declaredLength !== null &&
    (
      !/^\d+$/.test(declaredLength) ||
      Number(declaredLength) > MAX_BODY_BYTES
    )
  ) {
    return reject(413, "REQUEST_TOO_LARGE");
  }

  let rawBody: string;

  try {
    rawBody = await request.text();
  } catch {
    return reject(400, "INVALID_REQUEST_BODY");
  }

  if (
    Buffer.byteLength(rawBody, "utf8") >
    MAX_BODY_BYTES
  ) {
    return reject(413, "REQUEST_TOO_LARGE");
  }

  const timestamp =
    request.headers.get("x-deposit-timestamp") ?? "";

  const signature =
    request.headers.get("x-deposit-signature") ?? "";

  if (
    !verifySignature(
      timestamp,
      signature,
      rawBody,
      secret,
    )
  ) {
    return reject(401, "UNAUTHORIZED");
  }

  let payload: unknown;

  try {
    payload = JSON.parse(rawBody);
  } catch {
    return reject(400, "INVALID_JSON");
  }

  const input = validatePayload(payload);

  if (!input) {
    return reject(400, "INVALID_MESSAGE_IDENTITY");
  }

  const configuredNumber =
    process.env.TWILIO_FROM_NUMBER;

  if (
    !configuredNumber ||
    input.restaurantPhone !== configuredNumber
  ) {
    return reject(409, "RESTAURANT_PHONE_MISMATCH");
  }

  const supabase = createTrustedClient();

  if (!supabase) {
    return reject(503, "DATABASE_NOT_CONFIGURED");
  }

  try {
    const result =
      await processReservationDepositEmailReply(
        supabase,
        input,
        {
          enabled: true,
        },
      );

    if (
      result.status === "saved" ||
      result.status === "duplicate"
    ) {
      return respond({
        success: true,
        status: result.status,
        reservationId: result.reservationId,
        messageSid: result.messageSid,
      });
    }

    if (result.status === "review") {
      return respond({
        success: false,
        status: "review",
        reason: result.reason,
      });
    }

    if (result.status === "blocked") {
      return respond(
        {
          success: false,
          status: "blocked",
          reason: result.reason,
        },
        409,
      );
    }

    if (result.status === "error") {
      console.error(
        "Deposit email processing failed.",
        { reason: result.reason },
      );

      return reject(503, "PROCESSING_UNAVAILABLE");
    }

    return reject(503, "UNEXPECTED_PROCESSING_RESULT");

    return reject(503, "PROCESSING_UNAVAILABLE");
  } catch {
    console.error(
      "Unexpected deposit email ingress failure.",
    );

    return reject(503, "PROCESSING_UNAVAILABLE");
  }
}