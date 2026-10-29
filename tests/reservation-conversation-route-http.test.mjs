import test from "node:test";
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";

const BASE_URL =
  process.env.SMS_TEST_BASE_URL ??
  "http://127.0.0.1:3000";

const ENDPOINT =
  `${BASE_URL}/api/twilio/conversation-route`;

const SECRET =
  process.env.RESERVATION_STUDIO_ROUTER_SECRET;

const RESTAURANT_PHONE =
  process.env.TWILIO_FROM_NUMBER;

const E164 = /^\+[1-9]\d{7,14}$/;

function signedHeaders(body) {
  const timestamp = String(
    Math.floor(Date.now() / 1000),
  );

  const signature = createHmac(
    "sha256",
    SECRET,
  )
    .update(`${timestamp}.${body}`, "utf8")
    .digest("hex");

  return {
    "Content-Type": "application/json",
    "X-FF-Timestamp": timestamp,
    "X-FF-Signature": signature,
  };
}

async function post(body, headers) {
  const response = await fetch(ENDPOINT, {
    method: "POST",
    headers,
    body,
    signal: AbortSignal.timeout(10000),
  });

  const payload = await response.json();

  return {
    status: response.status,
    payload,
  };
}

function assertBlocked(result, expectedStatus) {
  assert.equal(
    result.status,
    expectedStatus,
  );

  assert.equal(
    result.payload.success,
    false,
  );

  assert.equal(
    result.payload.route,
    "block",
  );
}

if (
  typeof SECRET !== "string" ||
  Buffer.byteLength(SECRET, "utf8") < 32 ||
  !E164.test(RESTAURANT_PHONE ?? "")
) {
  throw new Error(
    "Local router signing configuration is missing.",
  );
}

// ============================================================
// HTTP SECURITY TESTS
//
// These cases are rejected during request validation.
// No test submits a valid guest/restaurant request
// that could reach the Supabase conversation lookup.
// ============================================================

test(
  "Rejects an invalid HMAC signature",
  async () => {
    const body = JSON.stringify({
      from: "+15550000000",
      to: RESTAURANT_PHONE,
    });

    const headers = signedHeaders(body);

    headers["X-FF-Signature"] =
      "0".repeat(64);

    const result = await post(
      body,
      headers,
    );

    assertBlocked(result, 401);
  },
);

test(
  "Rejects an unsupported content type",
  async () => {
    const body = "invalid";

    const result = await post(
      body,
      {
        "Content-Type": "text/plain",
      },
    );

    assertBlocked(result, 415);
  },
);

test(
  "Rejects oversized request bodies",
  async () => {
    const body = "x".repeat(1100);

    const result = await post(
      body,
      {
        "Content-Type": "application/json",
      },
    );

    assertBlocked(result, 413);
  },
);

test(
  "Rejects malformed signed JSON",
  async () => {
    const body = '{"from":';

    const result = await post(
      body,
      signedHeaders(body),
    );

    assertBlocked(result, 400);
  },
);

test(
  "Rejects a signed request with an invalid phone pair",
  async () => {
    const body = JSON.stringify({
      from: RESTAURANT_PHONE,
      to: RESTAURANT_PHONE,
    });

    const result = await post(
      body,
      signedHeaders(body),
    );

    assertBlocked(result, 400);
  },
);