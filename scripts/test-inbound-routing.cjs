// Local-only, read-only simulated Twilio inbound SMS tests.
// Run: node --env-file=.env.local scripts/test-inbound-routing.cjs
// Optional: TEST_INBOUND_GUEST_PHONE=+15551234567 ... (existing test phone pair)
const twilio = require("twilio");

const token = process.env.TWILIO_AUTH_TOKEN;
const signedUrl = process.env.TWILIO_WEBHOOK_URL;
const restaurantPhone = process.env.TWILIO_FROM_NUMBER;
const guestPhone = process.env.TEST_INBOUND_GUEST_PHONE || "+13134339175";
const target = process.env.TEST_INBOUND_LOCAL_URL || "http://localhost:3000/api/twilio/inbound";
const e164 = /^\+[1-9]\d{7,14}$/;

function stop(message) {
  console.error(`SETUP ERROR: ${message}`);
  process.exit(1);
}

if (!token || !signedUrl || !restaurantPhone) {
  stop("TWILIO_AUTH_TOKEN, TWILIO_WEBHOOK_URL, and TWILIO_FROM_NUMBER are required.");
}
if (!e164.test(restaurantPhone) || !e164.test(guestPhone)) {
  stop("Restaurant and guest phones must have E.164 format.");
}
let localUrl, webhookUrl;
try {
  localUrl = new URL(target);
  webhookUrl = new URL(signedUrl);
} catch {
  stop("The configured webhook URLs must be valid URLs.");
}
if (
  !["localhost", "127.0.0.1"].includes(localUrl.hostname) ||
  localUrl.protocol !== "http:" ||
  localUrl.pathname !== "/api/twilio/inbound" ||
  localUrl.username || localUrl.password || localUrl.search || localUrl.hash
) {
  stop("Test target must be a plain HTTP localhost /api/twilio/inbound URL.");
}
if (webhookUrl.protocol !== "https:" || webhookUrl.pathname !== "/api/twilio/inbound") {
  stop("TWILIO_WEBHOOK_URL must be the configured HTTPS inbound webhook URL.");
}

const EMPTY_TWIML = '<?xml version="1.0" encoding="UTF-8"?><Response></Response>';
const msgSid = "SM" + "1".repeat(32);

async function sendTest(name, overrides, expectedStatus, expectedXml, signatureMode = "correct") {
  const params = {
    MessageSid: msgSid,
    From: guestPhone,
    To: restaurantPhone,
    Body: "LOCAL ROUTING DIAGNOSTIC - NO SMS SENT",
    ...overrides,
  };
  const body = new URLSearchParams(params).toString();
  const headers = { "content-type": "application/x-www-form-urlencoded" };
  if (signatureMode !== "missing") {
    headers["x-twilio-signature"] = signatureMode === "invalid"
      ? "invalid-signature"
      : twilio.getExpectedTwilioSignature(token, signedUrl, params);
  }
  const response = await fetch(target, { method: "POST", headers, body, redirect: "manual", signal: AbortSignal.timeout(10000) });
  const text = await response.text();
  const correct = response.status === expectedStatus && (!expectedXml || text === EMPTY_TWIML);
  console.log(`${correct ? "PASS" : "FAIL"} ${name}: HTTP ${response.status}${expectedXml ? ", empty TwiML " + (text === EMPTY_TWIML ? "yes" : "NO") : ""}`);
  return correct;
}

(async () => {
  console.log("FIN & FEATHERS — LOCAL SIGNED INBOUND WEBHOOK TESTS");
  console.log("Target: localhost only. These tests do not send SMS or modify ownership.");
  console.log("Check the Next.js server console for diagnostic routing decisions.\n");
  let passed = 0;
  const tests = [
    ["Signed standard inbound", {}, 200, true, "correct"],
    ["Signed STOP", { Body: "STOP", OptOutType: "STOP" }, 200, true, "correct"],
    ["Signed HELP", { Body: "HELP", OptOutType: "HELP" }, 200, true, "correct"],
    ["Signed fallback START", { Body: "START" }, 200, true, "correct"],
    ["Invalid signature", {}, 401, false, "invalid"],
    ["Missing signature", {}, 401, false, "missing"],
  ];
  for (const [name, params, status, xml, signatureMode] of tests) {
    if (await sendTest(name, params, status, xml, signatureMode)) passed++;
  }
  console.log(`\nResult: ${passed}/${tests.length} passed.`);
  if (passed !== tests.length) process.exitCode = 1;
})().catch((error) => {
  console.error("LOCAL TEST ERROR:", error?.message || "Unknown error");
  process.exitCode = 1;
});
