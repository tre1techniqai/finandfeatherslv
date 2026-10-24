import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const E164 = /^\+[1-9]\d{7,14}$/;
const MAX_BYTES = 1024;
const CLOCK_SKEW_SECONDS = 300;

function json(
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

function errorResponse(status: number): NextResponse {
  return json(
    {
      success: false,
      route: "block",
    },
    status,
  );
}

function validSignature(
  signature: string | null,
  timestamp: string | null,
  rawBody: string,
  secret: string,
): boolean {
  if (
    !signature ||
    !timestamp ||
    !/^\d{10}$/.test(timestamp)
  ) {
    return false;
  }

  if (!/^[0-9a-f]{64}$/i.test(signature)) {
    return false;
  }

  const seconds = Number(timestamp);

  if (!Number.isSafeInteger(seconds)) {
    return false;
  }

  if (
    Math.abs(Math.floor(Date.now() / 1000) - seconds) >
    CLOCK_SKEW_SECONDS
  ) {
    return false;
  }

  const expected = createHmac("sha256", secret)
    .update(`${timestamp}.${rawBody}`, "utf8")
    .digest();

  const received = Buffer.from(signature, "hex");

  return (
    received.length === expected.length &&
    timingSafeEqual(received, expected)
  );
}

function handoffFenceEnabled(): boolean {
  return (
    process.env.RESERVATION_STUDIO_HANDOFF_FENCE_ENABLED ===
    "true"
  );
}

function staffRoutingEnabled(): boolean {
  return (
    process.env.RESERVATION_STUDIO_STAFF_ROUTING_ENABLED ===
    "true"
  );
}

export async function POST(
  request: Request,
): Promise<NextResponse> {
  const secret =
    process.env.RESERVATION_STUDIO_ROUTER_SECRET;

  const supabaseUrl =
    process.env.SUPABASE_URL ??
    process.env.NEXT_PUBLIC_SUPABASE_URL;

  const supabaseKey =
    process.env.SUPABASE_SECRET_KEY ??
    process.env.SUPABASE_SERVICE_ROLE_KEY;

  const restaurantPhone =
    process.env.TWILIO_FROM_NUMBER;

  // This endpoint is exclusively for signed
  // server-to-server Twilio Function requests.
  //
  // Never fall back to automation when configuration
  // or ownership verification fails.
  if (
    !secret ||
    Buffer.byteLength(secret, "utf8") < 32 ||
    !supabaseUrl ||
    !supabaseKey ||
    !restaurantPhone ||
    !E164.test(restaurantPhone)
  ) {
    console.error(
      "Studio conversation router is not configured.",
    );

    return errorResponse(503);
  }

  if (
    !/^application\/json(?:\s*;|$)/i.test(
      request.headers.get("content-type") ?? "",
    )
  ) {
    return errorResponse(415);
  }

  const declaredLength =
    request.headers.get("content-length");

  if (
    declaredLength !== null &&
    (
      !/^\d+$/.test(declaredLength) ||
      !Number.isSafeInteger(Number(declaredLength)) ||
      Number(declaredLength) > MAX_BYTES
    )
  ) {
    return errorResponse(413);
  }

  let rawBody: string;

  try {
    rawBody = await request.text();
  } catch {
    return errorResponse(400);
  }

  if (
    Buffer.byteLength(rawBody, "utf8") > MAX_BYTES
  ) {
    return errorResponse(413);
  }

  if (
    !validSignature(
      request.headers.get("x-ff-signature"),
      request.headers.get("x-ff-timestamp"),
      rawBody,
      secret,
    )
  ) {
    return errorResponse(401);
  }

  let payload: unknown;

  try {
    payload = JSON.parse(rawBody);
  } catch {
    return errorResponse(400);
  }

  if (
    !payload ||
    typeof payload !== "object" ||
    Array.isArray(payload)
  ) {
    return errorResponse(400);
  }

  const fields =
    payload as Record<string, unknown>;

  if (
    Object.keys(fields).length !== 2 ||
    !Object.prototype.hasOwnProperty.call(fields, "from") ||
    !Object.prototype.hasOwnProperty.call(fields, "to") ||
    typeof fields.from !== "string" ||
    typeof fields.to !== "string" ||
    !E164.test(fields.from) ||
    fields.to !== restaurantPhone ||
    fields.from === restaurantPhone
  ) {
    return errorResponse(400);
  }

  try {
    const supabase = createClient(
      supabaseUrl,
      supabaseKey,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      },
    );

    const {
      data,
      error,
    } = await supabase
      .from("reservation_conversation_ownership")
      .select("ownership_status")
      .eq("guest_phone", fields.from)
      .eq("restaurant_phone", restaurantPhone)
      .maybeSingle();

    if (error) {
      console.error(
        "Studio conversation router ownership lookup failed:",
        {
          code: error.code,
        },
      );

      return errorResponse(503);
    }

    const status =
      data?.ownership_status;

    // Existing behavior:
    // Conversations with no ownership record,
    // or conversations returned to automation,
    // continue through Studio normally.
    if (
      !data ||
      status === "automation" ||
      status === "released"
    ) {
      return json({
        success: true,
        route: "automation",
      });
    }

    if (status === "handoff_pending") {
      // A pending handoff is not a completed
      // manager takeover.
      //
      // When the fence is enabled, do not authorize
      // new automation executions for this guest.
      //
      // The protected Twilio Function currently
      // maps a non-2xx router response to "block",
      // and the published Studio branch terminates
      // that execution without an automated reply.
      //
      // Existing Studio executions are NOT stopped
      // by this change and require separate checks.
      if (handoffFenceEnabled()) {
        console.info(
          "Studio automation blocked for pending handoff.",
        );

        return errorResponse(503);
      }

      // Preserve existing production behavior
      // until the complete handoff procedure is ready.
      return json({
        success: true,
        route: "automation",
      });
    }

    if (status === "staff") {
      // Staff routing remains independently gated.
      // Do not accidentally route staff-owned
      // conversations to automation when disabled.
      if (!staffRoutingEnabled()) {
        return errorResponse(503);
      }

      return json({
        success: true,
        route: "staff",
      });
    }

    // Unknown ownership states must never
    // default to automation.
    return errorResponse(503);
  } catch {
    console.error(
      "Studio conversation router request failed.",
    );

    return errorResponse(503);
  }
}