const fs = require("node:fs");
const { createHmac } = require("node:crypto");

const env = fs.readFileSync(".env.local", "utf8");
const secret = env.match(
  /^RESERVATION_INGEST_SECRET=([a-f0-9]{64})$/m
)?.[1];

if (!secret) {
  console.error("Reservation ingestion secret not found.");
  process.exit(1);
}

const base = {
  twilioExecutionSid: "FN" + "d".repeat(32),
  customerPhone: "+15555550100",
  requestStatus: "pending",
  detailsValidated: true,
  customerName: "Test Guest",
  reservationDate: "2026-10-20",
  reservationTime: "19:00",
  partySize: 4,
  occasion: "BIRTHDAY",
  email: null,
  vipPreference: "NO",
  interruptionReason: null,
  interruptionStage: null,
};

async function test(label, changes, expectedStatus) {
  const body = JSON.stringify({ ...base, ...changes });
  const timestamp = String(Math.floor(Date.now() / 1000));

  const signature = createHmac(
    "sha256",
    Buffer.from(secret, "hex")
  )
    .update(`${timestamp}.${body}`)
    .digest("hex");

  const response = await fetch(
    "http://localhost:3000/api/reservations",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-reservation-timestamp": timestamp,
        "x-reservation-signature": signature,
      },
      body,
    }
  );

  const passed = response.status === expectedStatus;

  console.log(
    `${passed ? "PASS" : "FAIL"} | ${label} | Expected: ${expectedStatus} | Actual: ${response.status}`
  );

  return passed;
}

async function main() {
  const results = [];

  results.push(
    await test("Valid pending reservation", {}, 200)
  );

  results.push(
    await test(
      "Incomplete without interruption reason",
      {
        requestStatus: "incomplete",
        interruptionStage: "VIP FIRST ATTEMPT",
      },
      400
    )
  );

  results.push(
    await test(
      "Valid incomplete reservation",
      {
        requestStatus: "incomplete",
        interruptionReason: "CUSTOMER TIMEOUT",
        interruptionStage: "VIP FIRST ATTEMPT",
      },
      200
    )
  );

  results.push(
    await test(
      "Unvalidated with email",
      {
        requestStatus: "unvalidated",
        detailsValidated: false,
        customerName: null,
        reservationDate: null,
        reservationTime: null,
        partySize: null,
        occasion: null,
        email: "test@example.com",
        vipPreference: null,
        interruptionReason: "CUSTOMER TIMEOUT",
        interruptionStage: "RESERVATION CORRECTION",
      },
      400
    )
  );

  results.push(
    await test(
      "Valid unvalidated interruption",
      {
        requestStatus: "unvalidated",
        detailsValidated: false,
        customerName: null,
        reservationDate: null,
        reservationTime: null,
        partySize: null,
        occasion: null,
        email: null,
        vipPreference: null,
        interruptionReason: "MESSAGE DELIVERY FAILURE",
        interruptionStage: "RESERVATION CORRECTION",
      },
      200
    )
  );

  const passed = results.filter(Boolean).length;

  console.log(`\nResults: ${passed}/${results.length} passed`);

  if (passed !== results.length) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error("Test failed:", error.message);
  process.exitCode = 1;
});