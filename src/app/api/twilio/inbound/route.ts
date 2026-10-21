
import { NextResponse } from "next/server";
import twilio from "twilio";

const MAX_BODY_BYTES = 16_384;

const OPT_OUT_TYPES = new Set(["STOP", "START", "HELP"]);

const TWIML_RESPONSE =
  '<?xml version="1.0" encoding="UTF-8"?><Response></Response>';

function xmlResponse(): Response {
  return new Response(TWIML_RESPONSE, {
    status: 200,
    headers: {
      "Content-Type": "text/xml; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

function isConfigured(): boolean {
  const token = process.env.TWILIO_AUTH_TOKEN;
  const webhookUrl = process.env.TWILIO_WEBHOOK_URL;

  if (!token || !webhookUrl) {
    return false;
  }

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

export async function POST(request: Request): Promise<Response> {
  try {
    if (!isConfigured()) {
      const authTokenPresent = Boolean(
        process.env.TWILIO_AUTH_TOKEN?.trim()
      );

      const webhookUrlPresent = Boolean(
        process.env.TWILIO_WEBHOOK_URL?.trim()
      );

      let webhookUrlValid = false;

      if (webhookUrlPresent) {
        try {
          const url = new URL(
            process.env.TWILIO_WEBHOOK_URL!
          );

          webhookUrlValid =
            url.protocol === "https:" &&
            url.pathname === "/api/twilio/inbound" &&
            !url.username &&
            !url.password &&
            !url.hash;
        } catch {
          webhookUrlValid = false;
        }
      }

      // Temporary production configuration diagnostic.
      // Log booleans only. Never log secrets or token values.
      console.error(
        "Twilio inbound configuration diagnostic:",
        {
          authTokenPresent,
          webhookUrlPresent,
          webhookUrlValid,
        }
      );

      return NextResponse.json(
        { error: "Service unavailable." },
        { status: 503 }
      );
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
        { status: 415 }
      );
    }

    const declaredLength =
      request.headers.get("content-length");

    if (
      declaredLength !== null &&
      (!/^\d+$/.test(declaredLength) ||
        Number(declaredLength) > MAX_BODY_BYTES)
    ) {
      return NextResponse.json(
        { error: "Request too large." },
        { status: 413 }
      );
    }

    const rawBody = await request.text();

    if (
      Buffer.byteLength(rawBody, "utf8") >
      MAX_BODY_BYTES
    ) {
      return NextResponse.json(
        { error: "Request too large." },
        { status: 413 }
      );
    }

    const signature = request.headers.get(
      "x-twilio-signature"
    );

    if (!signature) {
      return NextResponse.json(
        { error: "Unauthorized." },
        { status: 401 }
      );
    }

    const form = new URLSearchParams(rawBody);

    const params: Record<string, string> = {};

    for (const [key, value] of form.entries()) {
      // Reject ambiguous repeated parameters.
      if (
        Object.prototype.hasOwnProperty.call(
          params,
          key
        )
      ) {
        return NextResponse.json(
          { error: "Invalid request." },
          { status: 400 }
        );
      }

      params[key] = value;
    }

    const authenticated = twilio.validateRequest(
      process.env.TWILIO_AUTH_TOKEN!,
      signature,
      process.env.TWILIO_WEBHOOK_URL!,
      params
    );

    if (!authenticated) {
      return NextResponse.json(
        { error: "Unauthorized." },
        { status: 401 }
      );
    }

    const messageSid =
      params.MessageSid ?? params.SmsMessageSid;

    const from = params.From;
    const to = params.To;

    if (!messageSid || !from || !to) {
      return NextResponse.json(
        { error: "Invalid message." },
        { status: 400 }
      );
    }

    const optOutType = (
      params.OptOutType ?? ""
    )
      .trim()
      .toUpperCase();

    if (optOutType) {
      if (!OPT_OUT_TYPES.has(optOutType)) {
        return xmlResponse();
      }

      // Twilio Advanced Opt-Out handles the
      // STOP, START, and HELP acknowledgments.
      //
      // Never send a duplicate acknowledgment.
      //
      // Application-level preference synchronization
      // will be added before outbound SMS is enabled.

      return xmlResponse();
    }

    const body = (
      params.Body ?? ""
    ).trim();

    const keyword = body.toUpperCase();

    // Defensive fallback for keyword messages
    // received without an OptOutType parameter.
    //
    // Do not generate duplicate automatic replies.

    if (
      [
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
      ].includes(keyword)
    ) {
      return xmlResponse();
    }

    // SAFETY PHASE
    //
    // Do not persist inbound messages.
    // Do not create reservation records.
    // Do not trigger staff notifications.
    // Do not send outbound SMS.
    //
    // Reservation processing will be connected
    // only after successful production validation.

    return xmlResponse();
  } catch {
    console.error(
      "Twilio inbound webhook processing failed."
    );

    return NextResponse.json(
      { error: "Unable to process message." },
      { status: 500 }
    );
  }
}
