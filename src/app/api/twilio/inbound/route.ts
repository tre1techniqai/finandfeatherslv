import { NextResponse } from "next/server";
import twilio from "twilio";
import { createClient } from "@supabase/supabase-js";

import {
  decideConversationRoute,
  type OwnershipLookup,
  type ConversationOwnershipStatus,
} from "@/lib/reservations/conversation-routing-decision";

import { buildStudioRedirectTwiml } from "@/lib/reservations/studio-forwarding";

const MAX_BODY_BYTES = 16_384;
const E164_PATTERN = /^\+[1-9]\d{7,14}$/;

const OPT_OUT_TYPES = new Set(["STOP", "START", "HELP"]);

const FALLBACK_KEYWORDS = new Set([
  "STOP",
  "STOPALL",
  "UNSUBSCRIBE",
  "CANCEL",
  "END",
  "QUIT",
  "OPTOUT",
  "REVOKE",
  "START",
  "UNSTOP",
  "HELP",
  "INFO",
]);

const OWNERSHIP_STATUSES = new Set<ConversationOwnershipStatus>([
  "automation",
  "handoff_pending",
  "staff",
  "released",
]);

const EMPTY_TWIML =
  '<?xml version="1.0" encoding="UTF-8"?><Response></Response>';

function twimlResponse(twiml: string): Response {
  return new Response(twiml, {
    status: 200,
    headers: {
      "Content-Type": "text/xml; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

function xmlResponse(): Response {
  return twimlResponse(EMPTY_TWIML);
}

function serviceUnavailable(): Response {
  return NextResponse.json(
    { error: "Service unavailable." },
    { status: 503 },
  );
}

function isConfigured(): boolean {
  const token = process.env.TWILIO_AUTH_TOKEN;
  const webhookUrl = process.env.TWILIO_WEBHOOK_URL;

  if (!token || !webhookUrl) return false;

  try {
    const url = new URL(webhookUrl);

    return (
      url.protocol === "https:" &&
      url.pathname === "/api/twilio/inbound" &&
      !url.username &&
      !url.password &&
      !url.hash
    );
  } catch {
    return false;
  }
}

function diagnosticsEnabled(): boolean {
  return (
    process.env.RESERVATION_INBOUND_ROUTING_DIAGNOSTICS ===
    "true"
  );
}

/**
 * OFF BY DEFAULT.
 *
 * This feature must remain disabled until Studio forwarding
 * has been verified using an isolated integration test.
 *
 * Enabling it does not modify the Twilio phone configuration.
 */
function studioForwardingEnabled(): boolean {
  return (
    process.env.RESERVATION_STUDIO_FORWARDING_ENABLED ===
    "true"
  );
}

/**
 * Server-side ownership lookup.
 *
 * Service credentials never reach the browser.
 * An uncertain result is returned as an error rather than
 * assuming that automation owns the conversation.
 */
async function lookupOwnership(
  guestPhone: string,
  restaurantPhone: string,
): Promise<OwnershipLookup> {
  const url =
    process.env.SUPABASE_URL ??
    process.env.NEXT_PUBLIC_SUPABASE_URL;

  const key =
    process.env.SUPABASE_SECRET_KEY ??
    process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    return { kind: "error" };
  }

  const supabase = createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  const { data, error } = await supabase
    .from("reservation_conversation_ownership")
    .select("ownership_status")
    .eq("guest_phone", guestPhone)
    .eq("restaurant_phone", restaurantPhone)
    .maybeSingle();

  if (error) {
    return { kind: "error" };
  }

  if (!data) {
    return { kind: "not_found" };
  }

  const status = data.ownership_status;

  if (
    typeof status !== "string" ||
    !OWNERSHIP_STATUSES.has(
      status as ConversationOwnershipStatus,
    )
  ) {
    return { kind: "error" };
  }

  return {
    kind: "found",
    status: status as ConversationOwnershipStatus,
  };
}

export async function POST(
  request: Request,
): Promise<Response> {
  try {
    if (!isConfigured()) {
      console.error(
        "Twilio inbound webhook is not configured.",
      );

      return serviceUnavailable();
    }

    const contentType =
      request.headers.get("content-type") ?? "";

    if (
      !contentType
        .toLowerCase()
        .startsWith("application/x-www-form-urlencoded")
    ) {
      return NextResponse.json(
        { error: "Unsupported content type." },
        { status: 415 },
      );
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
      return NextResponse.json(
        { error: "Request too large." },
        { status: 413 },
      );
    }

    const rawBody = await request.text();

    if (
      Buffer.byteLength(rawBody, "utf8") >
      MAX_BODY_BYTES
    ) {
      return NextResponse.json(
        { error: "Request too large." },
        { status: 413 },
      );
    }

    const signature =
      request.headers.get("x-twilio-signature");

    if (!signature) {
      return NextResponse.json(
        { error: "Unauthorized." },
        { status: 401 },
      );
    }

    const params: Record<string, string> = {};

    for (
      const [key, value] of
      new URLSearchParams(rawBody).entries()
    ) {
      if (
        Object.prototype.hasOwnProperty.call(
          params,
          key,
        )
      ) {
        return NextResponse.json(
          { error: "Invalid request." },
          { status: 400 },
        );
      }

      params[key] = value;
    }

    const validSignature = twilio.validateRequest(
      process.env.TWILIO_AUTH_TOKEN!,
      signature,
      process.env.TWILIO_WEBHOOK_URL!,
      params,
    );

    if (!validSignature) {
      return NextResponse.json(
        { error: "Unauthorized." },
        { status: 401 },
      );
    }

    const messageSid =
      params.MessageSid ??
      params.SmsMessageSid;

    const from = params.From;
    const to = params.To;

    if (!messageSid || !from || !to) {
      return NextResponse.json(
        { error: "Invalid message." },
        { status: 400 },
      );
    }

    /**
     * Preserve existing opt-out handling.
     *
     * Twilio Advanced Opt-Out owns acknowledgment messages.
     * We must not generate duplicate SMS responses.
     */
    const optOutType = (
      params.OptOutType ?? ""
    )
      .trim()
      .toUpperCase();

    if (optOutType) {
      if (!OPT_OUT_TYPES.has(optOutType)) {
        return xmlResponse();
      }

      return xmlResponse();
    }

    const body = (params.Body ?? "").trim();

    if (FALLBACK_KEYWORDS.has(body.toUpperCase())) {
      return xmlResponse();
    }

    const forwardingEnabled =
      studioForwardingEnabled();

    const shouldInspectOwnership =
      diagnosticsEnabled() ||
      forwardingEnabled;

    /**
     * Default behavior remains unchanged.
     *
     * No routing, persistence, or SMS sending occurs
     * unless an explicit feature flag enables forwarding.
     */
    if (!shouldInspectOwnership) {
      return xmlResponse();
    }

    const configuredRestaurantPhone =
      process.env.TWILIO_FROM_NUMBER;

    const validPhonePair =
      E164_PATTERN.test(from) &&
      E164_PATTERN.test(to) &&
      configuredRestaurantPhone === to;

    if (!validPhonePair) {
      if (forwardingEnabled) {
        console.error(
          "Studio forwarding blocked: invalid phone pair.",
        );

        return serviceUnavailable();
      }

      return xmlResponse();
    }

    let ownership: OwnershipLookup;

    try {
      ownership = await lookupOwnership(from, to);
    } catch {
      ownership = { kind: "error" };
    }

    /**
     * Staff routing is intentionally unavailable.
     *
     * The router must not treat a pending handoff
     * as a completed staff takeover.
     */
    const decision = decideConversationRoute(
      ownership,
      {
        staffInboundEnabled: false,
        studioHandoffVerified: false,
      },
    );

    if (diagnosticsEnabled()) {
      console.info(
        "Reservation inbound routing diagnostic",
        {
          ownershipKind: ownership.kind,
          ownershipStatus:
            ownership.kind === "found"
              ? ownership.status
              : null,
          proposedDestination: decision.destination,
          reason: decision.reason,
          applied: false,
        },
      );
    }

    /**
     * Do not perform actual routing in diagnostic mode.
     */
    if (!forwardingEnabled) {
      return xmlResponse();
    }

    /**
     * Fail closed when ownership cannot be verified.
     *
     * A database failure must never silently
     * activate a different conversation owner.
     */
    if (ownership.kind === "error") {
      console.error(
        "Studio forwarding blocked: ownership lookup failed.",
      );

      return serviceUnavailable();
    }

    /**
     * Staff routing remains disabled.
     *
     * Never deliver a staff-owned conversation to
     * Studio merely because staff messaging is not ready.
     */
    if (decision.destination !== "studio") {
      console.error(
        "Studio forwarding blocked by routing decision.",
        {
          reason: decision.reason,
        },
      );

      return serviceUnavailable();
    }

    /**
     * Candidate Studio forwarding response.
     *
     * Requires a separately configured official Studio
     * Flow webhook URL.
     *
     * No HTTP request or SMS is initiated here.
     */
    const redirect = buildStudioRedirectTwiml(
      process.env.RESERVATION_STUDIO_WEBHOOK_URL,
    );

    if (!redirect.ok) {
      console.error(
        "Studio forwarding blocked: invalid Studio webhook configuration.",
      );

      return serviceUnavailable();
    }

    console.info(
      "Reservation Studio forwarding TwiML generated.",
      {
        reason: decision.reason,
        ownershipStatus:
          ownership.kind === "found"
            ? ownership.status
            : null,
      },
    );

    return twimlResponse(redirect.twiml);
  } catch {
    console.error(
      "Twilio inbound webhook processing failed.",
    );

    return NextResponse.json(
      { error: "Unable to process message." },
      { status: 500 },
    );
  }
}