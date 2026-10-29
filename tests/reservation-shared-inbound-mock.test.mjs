import test from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import net from "node:net";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HOST = "127.0.0.1";
const PORT = 4319;
const BASE = `http://${HOST}:${PORT}`;

const RESTAURANT = "+15555550100";
const GUEST = "+15555550101";

const SID = `SM${"a".repeat(32)}`;

const CONVERSATION_ID =
  "11111111-1111-4111-8111-111111111111";

const CREATED_AT = new Date(
  Date.now() - 60000,
).toISOString();

const here = path.dirname(fileURLToPath(import.meta.url));
const mockFile = path.join(
  here,
  "reservation-shared-inbound-mock-services.mjs",
);

let mockProcess;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isPortListening() {
  return new Promise((resolve) => {
    const socket = net.connect({
      host: HOST,
      port: PORT,
    });

    socket.once("connect", () => {
      socket.destroy();
      resolve(true);
    });

    socket.once("error", () => {
      resolve(false);
    });

    socket.setTimeout(500, () => {
      socket.destroy();
      resolve(false);
    });
  });
}

async function request(
  pathname,
  {
    method = "GET",
    body,
  } = {},
) {
  const response = await fetch(
    `${BASE}${pathname}`,
    {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body:
        body === undefined
          ? undefined
          : JSON.stringify(body),
      signal: AbortSignal.timeout(5000),
    },
  );

  return {
    status: response.status,
    data: await response.json(),
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

function recordingArgs(overrides = {}) {
  return {
    p_restaurant_phone: RESTAURANT,
    p_guest_phone: GUEST,
    p_twilio_message_sid: SID,
    p_message_created_at: CREATED_AT,
    ...overrides,
  };
}

async function reset() {
  const response = await request(
    "/__test/reset",
    { method: "POST" },
  );

  assert.equal(response.status, 200);
  assert.equal(response.data.success, true);
}

async function configure(overrides = {}) {
  const response = await request(
    "/__test/scenario",
    {
      method: "POST",
      body: scenario(overrides),
    },
  );

  assert.equal(response.status, 200);
  assert.equal(response.data.success, true);
}

async function record(overrides = {}) {
  return request(
    "/rest/v1/rpc/record_reservation_shared_inbound",
    {
      method: "POST",
      body: recordingArgs(overrides),
    },
  );
}

async function state() {
  const response = await request("/__test/state");

  assert.equal(response.status, 200);

  return response.data;
}

async function startMock() {
  assert.equal(
    await isPortListening(),
    false,
    `Port ${PORT} is occupied; refusing to use an existing service`,
  );

  // Only harmless process settings are inherited.
  // Supabase and Twilio credentials are not passed.
  const env = {
    PATH: process.env.PATH ?? "/usr/bin:/bin",
    NODE_ENV: "test",
    NEXT_TELEMETRY_DISABLED: "1",
  };

  mockProcess = spawn(
    process.execPath,
    [mockFile],
    {
      env,
      stdio: ["ignore", "pipe", "pipe"],
    },
  );

  let output = "";

  mockProcess.stdout.on("data", (chunk) => {
    output += chunk.toString();
  });

  mockProcess.stderr.on("data", (chunk) => {
    output += chunk.toString();
  });

  for (let attempt = 0; attempt < 50; attempt++) {
    if (
      mockProcess.exitCode !== null ||
      mockProcess.signalCode !== null
    ) {
      throw new Error(
        `Mock exited unexpectedly: ${output}`,
      );
    }

    if (
      output.includes("Shared inbound mock listening") &&
      await isPortListening()
    ) {
      return;
    }

    await sleep(100);
  }

  throw new Error(
    `Mock did not become ready: ${output}`,
  );
}

async function stopMock() {
  if (
    mockProcess &&
    mockProcess.exitCode === null &&
    mockProcess.signalCode === null
  ) {
    mockProcess.kill("SIGTERM");

    await Promise.race([
      new Promise((resolve) => {
        mockProcess.once("exit", resolve);
      }),
      sleep(2000),
    ]);

    if (
      mockProcess.exitCode === null &&
      mockProcess.signalCode === null
    ) {
      mockProcess.kill("SIGKILL");
    }
  }
}

// One top-level test owns the mock process.
// Subtests run sequentially to avoid sharing
// mutable mock scenarios concurrently.
test(
  "Shared inbound mock HTTP contract",
  { timeout: 30000 },
  async (t) => {
    await startMock();

    try {
      await t.test(
        "01 - Reset clears all counters",
        async () => {
          await reset();

          const current = await state();

          assert.equal(
            current.recordingAttempts,
            0,
          );
          assert.equal(
            current.successfulInserts,
            0,
          );
          assert.equal(current.eventCount, 0);
        },
      );

      await t.test(
        "02 - Missing conversation cannot record",
        async () => {
          await reset();

          const response = await record();

          assert.equal(response.status, 409);
          assert.equal(
            response.data.code,
            "55000",
          );

          const current = await state();

          assert.equal(
            current.recordingAttempts,
            1,
          );
          assert.equal(current.eventCount, 0);
        },
      );

      await t.test(
        "03 - Automation mode cannot record",
        async () => {
          await reset();
          await configure({
            sharedMode: "automation",
          });

          const response = await record();

          assert.equal(response.status, 409);

          const current = await state();

          assert.equal(current.eventCount, 0);
        },
      );

      await t.test(
        "04 - Transitioning mode cannot record",
        async () => {
          await reset();
          await configure({
            sharedMode: "transitioning_to_staff",
          });

          const response = await record();

          assert.equal(response.status, 409);

          const current = await state();

          assert.equal(current.eventCount, 0);
        },
      );

      await t.test(
        "05 - Staff mode requires activation",
        async () => {
          await reset();
          await configure({
            staffActivated: false,
          });

          const response = await record();

          assert.equal(response.status, 409);

          const current = await state();

          assert.equal(current.eventCount, 0);
        },
      );

      await t.test(
        "06 - Activated staff inserts one event",
        async () => {
          await reset();
          await configure();

          const response = await record();

          assert.equal(response.status, 200);
          assert.equal(response.data.length, 1);

          assert.deepEqual(
            response.data[0],
            {
              conversation_id: CONVERSATION_ID,
              inbound_event_id:
                "22222222-2222-4222-8222-222222222222",
              duplicate: false,
              conversation_mode: "staff",
            },
          );

          const current = await state();

          assert.equal(
            current.recordingAttempts,
            1,
          );
          assert.equal(
            current.successfulInserts,
            1,
          );
          assert.equal(current.eventCount, 1);
          assert.equal(
            current.events[0].messageSid,
            SID,
          );
        },
      );

      await t.test(
        "07 - Duplicate SID does not insert twice",
        async () => {
          await reset();
          await configure();

          const first = await record();
          const second = await record();

          assert.equal(first.status, 200);
          assert.equal(second.status, 200);
          assert.equal(
            second.data[0].duplicate,
            true,
          );

          const current = await state();

          assert.equal(
            current.recordingAttempts,
            2,
          );
          assert.equal(
            current.successfulInserts,
            1,
          );
          assert.equal(
            current.duplicateReplays,
            1,
          );
          assert.equal(current.eventCount, 1);
        },
      );

      await t.test(
        "08 - SID timestamp mismatch is rejected",
        async () => {
          await reset();
          await configure();

          const first = await record();

          assert.equal(first.status, 200);

          const replay = await record({
            p_message_created_at: new Date(
              Date.parse(CREATED_AT) + 1000,
            ).toISOString(),
          });

          assert.equal(replay.status, 400);
          assert.equal(
            replay.data.code,
            "22023",
          );

          const current = await state();

          assert.equal(
            current.successfulInserts,
            1,
          );
          assert.equal(current.eventCount, 1);
        },
      );

      await t.test(
        "09 - Recording failure creates no event",
        async () => {
          await reset();
          await configure({
            recordingError: true,
          });

          const response = await record();

          assert.equal(response.status, 503);

          const current = await state();

          assert.equal(
            current.recordingAttempts,
            1,
          );
          assert.equal(
            current.successfulInserts,
            0,
          );
          assert.equal(current.eventCount, 0);
        },
      );

      await t.test(
        "10 - Legacy lookup failure is simulated",
        async () => {
          await reset();
          await configure({
            legacyError: true,
          });

          const response = await request(
            "/rest/v1/reservation_conversation_ownership" +
            `?guest_phone=eq.${encodeURIComponent(GUEST)}` +
            `&restaurant_phone=eq.${encodeURIComponent(RESTAURANT)}`,
          );

          assert.equal(response.status, 503);
          assert.equal(
            response.data.code,
            "PGRST500",
          );

          const current = await state();

          assert.equal(current.legacyLookups, 1);
          assert.equal(
            current.recordingAttempts,
            0,
          );
        },
      );

      await t.test(
        "11 - Shared lookup failure is simulated",
        async () => {
          await reset();
          await configure({
            sharedError: true,
          });

          const response = await request(
            "/rest/v1/rpc/get_reservation_shared_conversation_route",
            {
              method: "POST",
              body: {
                p_restaurant_phone: RESTAURANT,
                p_guest_phone: GUEST,
              },
            },
          );

          assert.equal(response.status, 503);
          assert.equal(
            response.data.code,
            "PGRST500",
          );

          const current = await state();

          assert.equal(current.sharedLookups, 1);
          assert.equal(
            current.recordingAttempts,
            0,
          );
        },
      );

      await t.test(
        "12 - Direct shared-table access is denied",
        async () => {
          await reset();

          for (const table of [
            "reservation_shared_conversations",
            "reservation_shared_inbound_events",
          ]) {
            const response = await request(
              `/rest/v1/${table}`,
            );

            assert.equal(response.status, 403);
            assert.equal(
              response.data.code,
              "42501",
            );
          }

          const current = await state();

          assert.equal(
            current.recordingAttempts,
            0,
          );
        },
      );

      await t.test(
        "13 - Invalid recording arguments are rejected",
        async () => {
          await reset();
          await configure();

          const response = await record({
            p_twilio_message_sid: "INVALID",
          });

          assert.equal(response.status, 400);
          assert.equal(
            response.data.code,
            "22023",
          );

          const current = await state();

          assert.equal(
            current.recordingAttempts,
            1,
          );
          assert.equal(current.eventCount, 0);
        },
      );

      await t.test(
        "14 - Unknown mock endpoints fail closed",
        async () => {
          await reset();

          const response = await request(
            "/rest/v1/rpc/unknown_operation",
            {
              method: "POST",
              body: {},
            },
          );

          assert.equal(response.status, 404);
          assert.equal(
            response.data.code,
            "PGRST404",
          );
        },
      );
    } finally {
      await stopMock();
    }
  },
);