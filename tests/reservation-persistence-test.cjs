const fs = require("node:fs");
const crypto = require("node:crypto");
const path = require("node:path");

const envPath = path.join(process.cwd(), ".env.local");
const envContents = fs.readFileSync(envPath, "utf8");

const secretLine = envContents
  .split(/\r?\n/)
  .find((line) => line.startsWith("RESERVATION_INGEST_SECRET="));

if (!secretLine) {
  throw new Error("Reservation ingestion secret is missing.");
}

const secret = secretLine
  .slice("RESERVATION_INGEST_SECRET=".length)
  .trim()
  .replace(/^["']|["']$/g, "");

if (!/^[a-f0-9]{64}$/.test(secret)) {
  throw new Error("Reservation ingestion secret is invalid.");
}

const executionSid = `FN${crypto.randomBytes(16).toString("hex").toUpperCase()}`;

const reservation = {
  twilioExecutionSid: executionSid,
  customerPhone: "+15555550199",
  requestStatus: "pending",
  detailsValidated: true,
  customerName: "TEST RESERVATION - DELETE",
  reservationDate: "2026-11-15",
  reservationTime: "19:00:00",
  partySize: 4,
  occasion: "TEST ONLY",
  email: null,
  vipPreference: "NO",
  interruptionReason: null,
  interruptionStage: null,
};

async function main() {
  const body = JSON.stringify(reservation);
  const timestamp = String(Math.floor(Date.now() / 1000));

  const signature = crypto
    .createHmac("sha256", Buffer.from(secret, "hex"))
    .update(`${timestamp}.${body}`)
    .digest("hex");

  console.log("CONTROLLED TEST — ONE FICTIONAL RESERVATION");
  console.log("Execution SID:", executionSid);
  console.log("No SMS messages will be sent by this script.");

  const response = await fetch("http://localhost:3000/api/reservations", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-reservation-timestamp": timestamp,
      "x-reservation-signature": signature,
    },
    body,
  });

  const result = await response.json();

  console.log("HTTP status:", response.status);
  console.log("API response:", JSON.stringify(result, null, 2));

  if (
    response.status !== 200 ||
    result.success !== true ||
    result.persisted !== true ||
    result.reservationCreated !== true ||
    result.notificationCreated !== true
  ) {
    throw new Error("Controlled persistence test did not pass.");
  }

  console.log("PASS: One reservation and one notification event created.");
  console.log("Save the Execution SID for targeted cleanup.");
}

main().catch((error) => {
  console.error("FAIL:", error.message);
  process.exitCode = 1;
});