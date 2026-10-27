import test from "node:test";
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";

const APP_BASE =
  process.env.SMS_TEST_BASE_URL ??
  "http://127.0.0.1:3101";

const MOCK_BASE =
  process.env.SMS_TEST_MOCK_URL ??
  "http://127.0.0.1:4319";

const SECRET =
  process.env.RESERVATION_STUDIO_ROUTER_SECRET;

const RESTAURANT = "+15555550100";
const GUEST = "+15555550101";

// Synthetic SIDs used exclusively by the isolated
// test-only Twilio verification replacement.
//
// The launcher must implement these exact fixtures:
// a = valid inbound
// b = not found
// c = identity mismatch
// d = transport failure

const VALID_SID = `SM${"a".repeat(32)}`;
const NOT_FOUND_SID = `SM${"b".repeat(32)}`;
const MISMATCH_SID = `SM${"c".repeat(32)}`;
const FAILURE_SID = `SM${"d".repeat(32)}`;

const API_PATH =
  "/api/twilio/shared-conversation-inbound";

assert.ok(
  SECRET && Buffer.byteLength(SECRET, "utf8") >= 32,
  "Synthetic router secret is required",
);

function payload(overrides = {}) {
  return {
    from: GUEST,
    to: RESTAURANT,
    messageSid: VALID_SID,
    ...overrides,
  };
}

function scenario(overrides = {}) {
  return {
    restaurantPhone: RESTAURANT,
    guestPhone: GUEST,
    legacyStatus: null,
    sharedMode: "staff",
    legacyError: false,
    sharedError: false,
    recordingError: false,
    staffActivated: true,
    ...overrides,
  };
}

async function mockRequest(pathname, options = {}) {
  const response = await fetch(
    `${MOCK_BASE}${pathname}`,
    {
      method: options.method ?? "GET",
      headers: {
        "content-type": "application/json",
      },
      body:
        options.body === undefined
          ? undefined
          : JSON.stringify(options.body),
      signal: AbortSignal.timeout(8000),
    },
  );

  return {
    status: response.status,
    data: await response.json(),
  };
}

async function reset() {
  const response = await mockRequest(
    "/__test/reset",
    { method: "POST" },
  );

  assert.equal(response.status, 200);
  assert.equal(response.data.success, true);
}

async function configure(overrides = {}) {
  const response = await mockRequest(
    "/__test/scenario",
    {
      method: "POST",
      body: scenario(overrides),
    },
  );

  assert.equal(response.status, 200);
  assert.equal(response.data.success, true);
}

async function state() {
  const response = await mockRequest(
    "/__test/state",
  );

  assert.equal(response.status, 200);

  return response.data;
}

function signature(timestamp, body) {
  return createHmac("sha256", SECRET)
    .update(`${timestamp}.${body}`, "utf8")
    .digest("hex");
}

async function send({
  value = payload(),
  rawBody,
  signed = true,
  timestamp,
  signatureOverride,
  contentType = "application/json",
} = {}) {
  const body = rawBody ?? JSON.stringify(value);

  const actualTimestamp =
    timestamp ??
    String(Math.floor(Date.now() / 1000));

  const headers = {
    "content-type": contentType,
  };

  if (signed) {
    headers["x-ff-timestamp"] = actualTimestamp;
    headers["x-ff-signature"] =
      signatureOverride ??
      signature(actualTimestamp, body);
  }

  const response = await fetch(
    `${APP_BASE}${API_PATH}`,
    {
      method: "POST",
      headers,
      body,
      signal: AbortSignal.timeout(20000),
    },
  );

  return {
    status: response.status,
    data: await response.json(),
  };
}

async function expectNoRecording() {
  const current = await state();

  assert.equal(
    current.recordingAttempts,
    0,
    "Rejected request reached the recording RPC",
  );

  assert.equal(current.successfulInserts, 0);
  assert.equal(current.eventCount, 0);

  return current;
}

// This parent owns sequential subtests.
// Each scenario resets the same in-memory mock.
//
// The isolated launcher starts both servers before
// executing this file.
//
// Do not run these tests against a live deployment.

test(
  "Shared inbound Next.js HTTP security",
  { timeout: 180000 },
  async (t) => {
    await t.test(
      "01 - Unsigned requests are rejected",
      async () => {
        await reset();

        const response = await send({
          signed: false,
        });

        assert.equal(response.status, 401);
        await expectNoRecording();

        const current = await state();
        assert.equal(current.legacyLookups, 0);
        assert.equal(current.sharedLookups, 0);
      },
    );

    await t.test(
      "02 - Incorrect HMAC is rejected",
      async () => {
        await reset();

        const response = await send({
          signatureOverride: "0".repeat(64),
        });

        assert.equal(response.status, 401);
        await expectNoRecording();
      },
    );

    await t.test(
      "03 - Expired HMAC timestamp is rejected",
      async () => {
        await reset();

        const timestamp = String(
          Math.floor(Date.now() / 1000) - 600,
        );

        const response = await send({
          timestamp,
        });

        assert.equal(response.status, 401);
        await expectNoRecording();
      },
    );

    await t.test(
      "04 - Unsupported content type is rejected",
      async () => {
        await reset();

        const response = await send({
          contentType: "text/plain",
        });

        assert.equal(response.status, 415);
        await expectNoRecording();
      },
    );

    await t.test(
      "05 - Malformed signed JSON is rejected",
      async () => {
        await reset();

        const response = await send({
          rawBody: "{invalid-json",
        });

        assert.equal(response.status, 400);
        await expectNoRecording();
      },
    );

    await t.test(
      "06 - Incorrect restaurant recipient is rejected",
      async () => {
        await reset();

        const response = await send({
          value: payload({
            to: "+15555550199",
          }),
        });

        assert.equal(response.status, 400);
        await expectNoRecording();
      },
    );

    await t.test(
      "07 - Invalid Message SID is rejected",
      async () => {
        await reset();

        const response = await send({
          value: payload({
            messageSid: "INVALID",
          }),
        });

        assert.equal(response.status, 400);
        await expectNoRecording();
      },
    );

    await t.test(
      "08 - Legacy lookup failure blocks recording",
      async () => {
        await reset();
        await configure({
          legacyError: true,
        });

        const response = await send();

        assert.equal(response.status, 503);

        const current = await expectNoRecording();

        assert.equal(current.legacyLookups, 1);
        assert.equal(current.sharedLookups, 0);
      },
    );

    await t.test(
      "09 - Legacy staff ownership conflicts",
      async () => {
        await reset();
        await configure({
          legacyStatus: "staff",
        });

        const response = await send();

        assert.equal(response.status, 409);
        await expectNoRecording();
      },
    );

    await t.test(
      "10 - Released legacy ownership is rejected",
      async () => {
        await reset();
        await configure({
          legacyStatus: "released",
        });

        const response = await send();

        assert.equal(response.status, 503);
        await expectNoRecording();
      },
    );

    await t.test(
      "11 - Shared lookup failure blocks recording",
      async () => {
        await reset();
        await configure({
          sharedError: true,
        });

        const response = await send();

        assert.equal(response.status, 503);

        const current = await expectNoRecording();

        assert.equal(current.legacyLookups, 1);
        assert.equal(current.sharedLookups, 1);
      },
    );

    await t.test(
      "12 - Missing conversation cannot be provisioned",
      async () => {
        await reset();
        await configure({
          sharedMode: null,
        });

        const response = await send();

        assert.equal(response.status, 409);
        await expectNoRecording();
      },
    );

    await t.test(
      "13 - Transitioning conversation cannot record",
      async () => {
        await reset();
        await configure({
          sharedMode: "transitioning_to_staff",
        });

        const response = await send();

        assert.equal(response.status, 409);
        await expectNoRecording();
      },
    );

    await t.test(
      "14 - Automation conversation is skipped",
      async () => {
        await reset();
        await configure({
          sharedMode: "automation",
        });

        const response = await send();

        assert.equal(response.status, 200);
        assert.equal(response.data.recorded, false);
        assert.equal(response.data.skipped, true);

        await expectNoRecording();
      },
    );

    await t.test(
      "15 - Twilio message not found cannot record",
      async () => {
        await reset();
        await configure();

        const response = await send({
          value: payload({
            messageSid: NOT_FOUND_SID,
          }),
        });

        assert.equal(response.status, 404);
        await expectNoRecording();
      },
    );

    await t.test(
      "16 - Twilio identity mismatch cannot record",
      async () => {
        await reset();
        await configure();

        const response = await send({
          value: payload({
            messageSid: MISMATCH_SID,
          }),
        });

        assert.equal(response.status, 409);
        await expectNoRecording();
      },
    );

    await t.test(
      "17 - Twilio verification failure cannot record",
      async () => {
        await reset();
        await configure();

        const response = await send({
          value: payload({
            messageSid: FAILURE_SID,
          }),
        });

        assert.equal(response.status, 502);
        await expectNoRecording();
      },
    );

    await t.test(
      "18 - Verified staff message records once",
      async () => {
        await reset();
        await configure();

        const response = await send();

        assert.equal(response.status, 201);
        assert.equal(response.data.success, true);
        assert.equal(response.data.recorded, true);
        assert.equal(response.data.duplicate, false);
        assert.equal(
          response.data.conversationMode,
          "staff",
        );

        const current = await state();

        assert.equal(current.recordingAttempts, 1);
        assert.equal(current.successfulInserts, 1);
        assert.equal(current.eventCount, 1);

        assert.equal(
          current.events[0].messageSid,
          VALID_SID,
        );

        assert.equal(
          current.events[0].guestPhone,
          GUEST,
        );

        assert.equal(
          current.events[0].restaurantPhone,
          RESTAURANT,
        );

        assert.ok(
          Number.isFinite(
            Date.parse(
              current.events[0].messageCreatedAt,
            ),
          ),
        );
      },
    );

    await t.test(
      "19 - Replayed message does not insert twice",
      async () => {
        await reset();
        await configure();

        const first = await send();
        const second = await send();

        assert.equal(first.status, 201);
        assert.equal(second.status, 200);
        assert.equal(second.data.duplicate, true);

        const current = await state();

        assert.equal(current.recordingAttempts, 2);
        assert.equal(current.successfulInserts, 1);
        assert.equal(current.duplicateReplays, 1);
        assert.equal(current.eventCount, 1);
      },
    );

    await t.test(
      "20 - Recording RPC failure fails closed",
      async () => {
        await reset();
        await configure({
          recordingError: true,
        });

        const response = await send();

        assert.equal(response.status, 503);

        const current = await state();

        assert.equal(current.recordingAttempts, 1);
        assert.equal(current.successfulInserts, 0);
        assert.equal(current.eventCount, 0);
      },
    );

    await t.test(
      "21 - Database denies unactivated staff recording",
      async () => {
        await reset();
        await configure({
          staffActivated: false,
        });

        const response = await send();

        assert.equal(response.status, 503);

        const current = await state();

        // Application routing mode is staff, but
        // the recording RPC independently refuses
        // an unactivated conversation.

        assert.equal(current.recordingAttempts, 1);
        assert.equal(current.successfulInserts, 0);
        assert.equal(current.eventCount, 0);
      },
    );

    // ======================================================
    // REQUEST DEADLINE / UNCERTAIN WRITE OUTCOME
    // ======================================================

    await t.test(
      "22 - Delayed legacy lookup fails closed",
      async () => {
        await reset();
        await configure({ legacyDelayMs: 6500 });

        const started = performance.now();
        const response = await send();
        const elapsed = performance.now() - started;

        assert.ok([502, 503].includes(response.status));
        assert.equal(response.data.recorded, false);
        assert.ok(
          elapsed >= 3500 && elapsed < 10000,
          `Legacy timeout exceeded bounds: ${elapsed}ms`,
        );

        const current = await expectNoRecording();
        assert.equal(current.legacyLookups, 1);
        assert.equal(current.sharedLookups, 0);
      },
    );

    await t.test(
      "23 - Delayed shared lookup blocks recording",
      async () => {
        await reset();
        await configure({ sharedDelayMs: 6500 });

        const started = performance.now();
        const response = await send();
        const elapsed = performance.now() - started;

        assert.ok([502, 503].includes(response.status));
        assert.equal(response.data.recorded, false);
        assert.ok(
          elapsed >= 3500 && elapsed < 10000,
          `Shared timeout exceeded bounds: ${elapsed}ms`,
        );

        const current = await expectNoRecording();
        assert.equal(current.legacyLookups, 1);
        assert.equal(current.sharedLookups, 1);
      },
    );

    await t.test(
      "24 - Delayed recording has no automatic retry",
      async () => {
        await reset();
        await configure({ recordingDelayMs: 6500 });

        const started = performance.now();
        const response = await send();
        const elapsed = performance.now() - started;

        assert.ok([502, 503].includes(response.status));
        assert.equal(response.data.recorded, false);
        assert.ok(
          elapsed >= 3500 && elapsed < 10000,
          `Recording timeout exceeded bounds: ${elapsed}ms`,
        );

        const current = await state();
        assert.equal(current.recordingAttempts, 1);
        assert.ok(current.successfulInserts <= 1);
        assert.ok(current.eventCount <= 1);

        // Allow the simulated in-flight database operation
        // to finish before the next scenario resets state.
        await new Promise((resolve) => setTimeout(resolve, 2000));

        const settled = await state();
        assert.equal(settled.recordingAttempts, 1);
        assert.ok(settled.successfulInserts <= 1);
        assert.ok(settled.eventCount <= 1);
      },
    );

    await t.test(
      "25 - Post-commit timeout preserves deduplication",
      async () => {
        await reset();
        await configure({
          recordingResponseDelayMs: 6500,
        });

        const started = performance.now();
        const first = await send();
        const elapsed = performance.now() - started;

        assert.ok([502, 503].includes(first.status));
        assert.equal(first.data.recorded, false);
        assert.ok(
          elapsed >= 3500 && elapsed < 10000,
          `Post-commit timeout exceeded bounds: ${elapsed}ms`,
        );

        const afterFirst = await state();
        assert.equal(afterFirst.recordingAttempts, 1);
        assert.equal(afterFirst.successfulInserts, 1);
        assert.equal(afterFirst.eventCount, 1);
        assert.equal(
          afterFirst.events[0].messageSid,
          VALID_SID,
        );

        // Remove the delay without clearing the
        // previously committed inbound event.
        await configure();

        const replay = await send();

        assert.equal(replay.status, 200);
        assert.equal(replay.data.success, true);
        assert.equal(replay.data.recorded, true);
        assert.equal(replay.data.duplicate, true);

        const afterReplay = await state();
        assert.equal(afterReplay.recordingAttempts, 2);
        assert.equal(afterReplay.successfulInserts, 1);
        assert.equal(afterReplay.duplicateReplays, 1);
        assert.equal(afterReplay.eventCount, 1);
      },
    );
  },
);