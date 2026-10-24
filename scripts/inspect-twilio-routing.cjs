"use strict";

// Read-only diagnostic for the Fin & Feathers Twilio SMS routing.
// Run from the Next.js project root with:
// node --env-file=.env.local scripts/inspect-twilio-routing.cjs

const twilio = require("twilio");

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_FROM_NUMBER;

function safeEndpoint(value) {
  if (!value) return "(not configured)";
  try {
    const url = new URL(value);
    // Deliberately omit query strings, which might contain secrets.
    return `${url.origin}${url.pathname}`;
  } catch {
    return "(configured; could not safely display URL)";
  }
}

function displayNumber(value) {
  if (!value) return "(none)";
  return `${value.slice(0, 3)}...${value.slice(-4)}`;
}

async function main() {
  if (!/^AC[0-9a-f]{32}$/i.test(accountSid || "")) {
    throw new Error("TWILIO_ACCOUNT_SID is missing or invalid.");
  }
  if (!authToken) {
    throw new Error("TWILIO_AUTH_TOKEN is missing.");
  }
  if (!/^\+[1-9]\d{7,14}$/.test(fromNumber || "")) {
    throw new Error("TWILIO_FROM_NUMBER is missing or invalid.");
  }

  const client = twilio(accountSid, authToken);
  const numbers = await client.incomingPhoneNumbers.list({ limit: 1000 });
  const match = numbers.find((number) => number.phoneNumber === fromNumber);

  console.log("FIN & FEATHERS — TWILIO SMS ROUTING AUDIT (READ ONLY)");
  console.log("Configured sender:", displayNumber(fromNumber));

  if (!match) {
    console.log("Sender not found among the first 1000 incoming phone numbers.");
    console.log("It may be on another account/subaccount or require a different lookup.");
    return;
  }

  console.log("Phone number SID:", match.sid);
  console.log("SMS method:", match.smsMethod || "(unknown)");
  console.log("Phone SMS webhook:", safeEndpoint(match.smsUrl));
  console.log("Phone SMS application SID:", match.smsApplicationSid || "(none)");
  console.log("Messaging Service SID:", match.messagingServiceSid || "(none)");

  if (match.messagingServiceSid) {
    const service = await client.messaging.v1
      .services(match.messagingServiceSid)
      .fetch();

    console.log("\nMESSAGING SERVICE");
    console.log("Service SID:", service.sid);
    console.log("Inbound webhook:", safeEndpoint(service.inboundRequestUrl));
    console.log("Fallback webhook:", safeEndpoint(service.fallbackUrl));
    console.log(
      "Use number webhook:",
      service.useInboundWebhookOnNumber === undefined
        ? "(not reported)"
        : service.useInboundWebhookOnNumber,
    );
  }

  console.log("\nThis audit did not change Twilio configuration or send messages.");
}

main().catch((error) => {
  console.error("Routing audit failed:", error.message || "Unknown error");
  process.exitCode = 1;
});
