import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

import {
  decideSharedConversationRoute,
  type OwnershipLookup,
  type SharedConversationLookup,
  type SharedRoutingDecision,
} from "@/lib/reservations/conversation-routing-decision";

const E164 = /^\+[1-9]\d{7,14}$/;
const MAX_BYTES = 1024;
const CLOCK_SKEW_SECONDS = 300;

type LegacyOwnershipStatus =
  | "automation"
  | "handoff_pending"
  | "staff"
  | "released";

type SharedConversationMode =
  | "automation"
  | "transitioning_to_staff"
  | "staff";

type SharedConversationRouteRow = {
  mode: SharedConversationMode;
};

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

function routeResponse(
  route: "automation" | "staff",
): NextResponse {
  return json({
    success: true,
    route,
  });
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

function sharedRoutingEnabled(): boolean {
  return (
    process.env.RESERVATION_SHARED_SMS_ROUTING_ENABLED ===
    "true"
  );
}

function validLegacyStatus(
  value: unknown,
): value is LegacyOwnershipStatus {
  return (
    value === "automation" ||
    value === "handoff_pending" ||
    value === "staff" ||
    value === "released"
  );
}

function validSharedMode(
  value: unknown,
): value is SharedConversationMode {
  return (
    value === "automation" ||
    value === "transitioning_to_staff" ||
    value === "staff"
  );
}

function decisionResponse(
  decision: SharedRoutingDecision,
): NextResponse {
  if (decision.reason === "LEGACY_PENDING_BLOCKED") {
    console.info("Studio automation blocked for pending handoff.");
  }

  if (decision.reason === "SHARED_LEGACY_CONFLICT") {
    console.error("Shared SMS routing blocked by legacy ownership.");
  }

  if (decision.route === "block") {
    return errorResponse(503);
  }

  return routeResponse(decision.route);
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

  // Exclusively for signed server-to-server
  // Twilio Function requests.
  //
  // Never fall back to automation after a
  // configuration or verification failure.
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
    !Object.prototype.hasOwnProperty.call(
      fields,
      "from",
    ) ||
    !Object.prototype.hasOwnProperty.call(
      fields,
      "to",
    ) ||
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

    // Always read legacy ownership first.
    // This preserves existing safety checks
    // during the shared SMS migration.
    const {
      data: legacyData,
      error: legacyError,
    } = await supabase
      .from("reservation_conversation_ownership")
      .select("ownership_status")
      .eq("guest_phone", fields.from)
      .eq("restaurant_phone", restaurantPhone)
      .maybeSingle();

    if (legacyError) {
      console.error(
        "Studio conversation router ownership lookup failed:",
        {
          code: legacyError.code,
        },
      );

      return errorResponse(503);
    }

    const rawLegacyStatus =
      legacyData?.ownership_status ?? null;

    if (
      rawLegacyStatus !== null &&
      !validLegacyStatus(rawLegacyStatus)
    ) {
      console.error(
        "Studio router encountered unknown legacy ownership status.",
      );

      return errorResponse(503);
    }

    const legacy: OwnershipLookup =
      rawLegacyStatus === null
        ? { kind: "not_found" }
        : {
            kind: "found",
            status: rawLegacyStatus,
          };

    const readiness = {
      sharedRoutingEnabled: sharedRoutingEnabled(),
      staffRoutingEnabled: staffRoutingEnabled(),
      handoffFenceEnabled: handoffFenceEnabled(),
    };

    // Preserve the existing legacy-only behavior.
    // Do not call the shared RPC when its feature flag is off.
    if (!readiness.sharedRoutingEnabled) {
      return decisionResponse(
        decideSharedConversationRoute(
          legacy,
          { kind: "not_found" },
          readiness,
        ),
      );
    }

    // The shared RPC is a narrow, read-only, trusted lookup.
    const {
      data: sharedData,
      error: sharedError,
    } = await supabase
      .rpc(
        "get_reservation_shared_conversation_route",
        {
          p_restaurant_phone: restaurantPhone,
          p_guest_phone: fields.from,
        },
      )
      .maybeSingle();

    if (sharedError) {
      console.error(
        "Studio shared conversation lookup failed:",
        { code: sharedError.code },
      );

      return errorResponse(503);
    }

    let shared: SharedConversationLookup;

    if (!sharedData) {
      shared = { kind: "not_found" };
    } else {
      const rawSharedMode = (
        sharedData as SharedConversationRouteRow
      ).mode;

      if (!validSharedMode(rawSharedMode)) {
        console.error(
          "Studio router encountered unknown shared conversation mode.",
        );

        return errorResponse(503);
      }

      shared = {
        kind: "found",
        mode: rawSharedMode,
      };
    }

    return decisionResponse(
      decideSharedConversationRoute(
        legacy,
        shared,
        readiness,
      ),
    );
  } catch {
    console.error(
      "Studio conversation router request failed.",
    );

    return errorResponse(503);
  }
}