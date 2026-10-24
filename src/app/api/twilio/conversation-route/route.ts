import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const E164 = /^\+[1-9]\d{7,14}$/;
const MAX_BYTES = 1024;
const CLOCK_SKEW_SECONDS = 300;

// This endpoint is called server-to-server by a Twilio Function, not by Studio
// directly. Only the Twilio Function knows the signing key.
function json(data: Record<string, unknown>, status = 200): NextResponse {
  return NextResponse.json(data, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

function errorResponse(status: number): NextResponse {
  return json({ success: false, route: "block" }, status);
}

function validSignature(
  signature: string | null,
  timestamp: string | null,
  rawBody: string,
  secret: string,
): boolean {
  if (!signature || !timestamp || !/^\d{10}$/.test(timestamp)) return false;
  if (!/^[0-9a-f]{64}$/i.test(signature)) return false;

  const seconds = Number(timestamp);
  if (!Number.isSafeInteger(seconds)) return false;
  if (Math.abs(Math.floor(Date.now() / 1000) - seconds) > CLOCK_SKEW_SECONDS) {
    return false;
  }

  const expected = createHmac("sha256", secret)
    .update(`${timestamp}.${rawBody}`, "utf8")
    .digest();
  const received = Buffer.from(signature, "hex");
  return received.length === expected.length && timingSafeEqual(received, expected);
}

export async function POST(request: Request): Promise<NextResponse> {
  const secret = process.env.RESERVATION_STUDIO_ROUTER_SECRET;
  const supabaseUrl =
    process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
  const restaurantPhone = process.env.TWILIO_FROM_NUMBER;

  // No default secret, public access, or fallback routing on misconfiguration.
  if (
    !secret ||
    Buffer.byteLength(secret, "utf8") < 32 ||
    !supabaseUrl ||
    !supabaseKey ||
    !restaurantPhone ||
    !E164.test(restaurantPhone)
  ) {
    console.error("Studio conversation router is not configured.");
    return errorResponse(503);
  }

  if (!/^application\/json(?:\s*;|$)/i.test(request.headers.get("content-type") ?? "")) {
    return errorResponse(415);
  }

  const declaredLength = request.headers.get("content-length");
  if (
    declaredLength !== null &&
    (!/^\d+$/.test(declaredLength) || Number(declaredLength) > MAX_BYTES)
  ) {
    return errorResponse(413);
  }

  let rawBody: string;
  try {
    rawBody = await request.text();
  } catch {
    return errorResponse(400);
  }
  if (Buffer.byteLength(rawBody, "utf8") > MAX_BYTES) return errorResponse(413);

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
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return errorResponse(400);
  }
  const fields = payload as Record<string, unknown>;
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
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data, error } = await supabase
      .from("reservation_conversation_ownership")
      .select("ownership_status")
      .eq("guest_phone", fields.from)
      .eq("restaurant_phone", restaurantPhone)
      .maybeSingle();

    if (error) {
      console.error("Studio conversation router ownership lookup failed:", {
        code: error.code,
      });
      return errorResponse(503);
    }

    if (!data || data.ownership_status === "automation" || data.ownership_status === "released") {
      return json({ success: true, route: "automation" });
    }

    // A handoff request does not transfer ownership or stop active Studio waits.
    if (data.ownership_status === "handoff_pending") {
      return json({ success: true, route: "automation" });
    }

    if (data.ownership_status === "staff") {
      // Staff routing cannot be used before the Studio branch is published,
      // the active-execution handoff is verified, and inbound handling is ready.
      if (process.env.RESERVATION_STUDIO_STAFF_ROUTING_ENABLED !== "true") {
        return errorResponse(503);
      }
      return json({ success: true, route: "staff" });
    }

    return errorResponse(503);
  } catch {
    console.error("Studio conversation router request failed.");
    return errorResponse(503);
  }
}
