import assert from "node:assert/strict";
import { spawn, spawnSync } from "node:child_process";
import {
  cpSync,
  existsSync,
  mkdtempSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import net from "node:net";
import os from "node:os";
import path from "node:path";

// FIN & FEATHERS LV
// Step 58D.13.33
//
// Isolated Shared Inbound HTTP Test Launcher
//
// Run from project root:
//
// node scripts/run-isolated-shared-inbound-tests.mjs
//
// This launcher:
// - Never copies .env files.
// - Never inherits production credentials.
// - Uses mock Supabase exclusively.
// - Substitutes Twilio verification only in /tmp.
// - Disables every live SMS sending feature.
// - Does not edit original project files.
// - Does not apply database migrations.
// - Does not modify Twilio Studio.

const root = process.cwd();

const MOCK_HOST = "127.0.0.1";
const MOCK_PORT = 4319;
const APP_PORT = 3101;

const MOCK_URL =
  `http://${MOCK_HOST}:${MOCK_PORT}`;

const APP_URL =
  `http://${MOCK_HOST}:${APP_PORT}`;

const SYNTHETIC_SECRET =
  "ff-isolated-shared-inbound-test-signing-secret-2026";

const RESTAURANT_PHONE = "+15555550100";

const temp = mkdtempSync(
  path.join(os.tmpdir(), "ff-shared-inbound-http-"),
);

const children = [];

let stopping = false;

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function portListening(port) {
  return new Promise((resolve) => {
    const socket = net.connect({
      host: MOCK_HOST,
      port,
    });

    let settled = false;

    function finish(value) {
      if (settled) {
        return;
      }

      settled = true;
      socket.destroy();
      resolve(value);
    }

    socket.once("connect", () => finish(true));
    socket.once("error", () => finish(false));

    socket.setTimeout(700, () => finish(false));
  });
}

async function waitForPort(
  port,
  child,
  label,
  timeoutMs = 120000,
) {
  const started = Date.now();

  while (Date.now() - started < timeoutMs) {
    if (
      child.exitCode !== null ||
      child.signalCode !== null
    ) {
      throw new Error(
        `${label} exited before becoming ready`,
      );
    }

    if (await portListening(port)) {
      return;
    }

    await sleep(400);
  }

  throw new Error(
    `${label} did not become ready`,
  );
}

function startProcess(
  label,
  command,
  args,
  cwd,
  env,
) {
  const child = spawn(command, args, {
    cwd,
    env,
    stdio: "inherit",
    detached: true,
  });

  child.on("error", (error) => {
    console.error(
      `${label} process error: ${error.message}`,
    );
  });

  children.push(child);

  return child;
}

function stopAll() {
  if (stopping) {
    return;
  }

  stopping = true;

  for (const child of [...children].reverse()) {
    if (
      child.pid &&
      child.exitCode === null &&
      child.signalCode === null
    ) {
      try {
        process.kill(-child.pid, "SIGTERM");
      } catch {
        // The process may have exited already.
      }
    }
  }
}

process.once("SIGINT", () => {
  stopAll();
  process.exitCode = 130;
});

process.once("SIGTERM", () => {
  stopAll();
  process.exitCode = 143;
});

function isolatedEnvironment() {
  // Explicit allowlist.
  //
  // Do not spread process.env into this object.
  // The real Supabase and Twilio credentials must
  // never be inherited by the isolated processes.

  return {
    PATH: process.env.PATH ?? "/usr/bin:/bin",
    HOME: temp,
    TMPDIR: os.tmpdir(),

    NODE_ENV: "development",
    CI: "1",
    NEXT_TELEMETRY_DISABLED: "1",

    SUPABASE_URL: MOCK_URL,
    NEXT_PUBLIC_SUPABASE_URL: MOCK_URL,

    NEXT_PUBLIC_SUPABASE_ANON_KEY:
      "test-anon-key-local-only",

    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
      "sb_publishable_local_test_only",

    SUPABASE_SECRET_KEY:
      "sb_secret_local_test_only",

    SUPABASE_SERVICE_ROLE_KEY:
      "test-service-role-key-local-only",

    RESERVATION_STUDIO_ROUTER_SECRET:
      SYNTHETIC_SECRET,

    TWILIO_FROM_NUMBER:
      RESTAURANT_PHONE,

    // Synthetic test values only.
    //
    // The test helper does not construct or call
    // a real Twilio SDK client.

    TWILIO_ACCOUNT_SID:
      `AC${"1".repeat(32)}`,

    TWILIO_AUTH_TOKEN:
      "synthetic-test-token-no-live-access",

    SMS_TEST_BASE_URL:
      APP_URL,

    SMS_TEST_MOCK_URL:
      MOCK_URL,

    // Enable only the inbound recording path
    // inside this isolated test process.
    //
    // These values never modify .env.local,
    // Vercel, Supabase or Twilio configuration.

    RESERVATION_SHARED_SMS_INBOUND_RECORDING_ENABLED:
      "true",

    RESERVATION_SHARED_SMS_ROUTING_ENABLED:
      "true",

    RESERVATION_STUDIO_STAFF_ROUTING_ENABLED:
      "true",

    RESERVATION_STUDIO_HANDOFF_FENCE_ENABLED:
      "true",

    RESERVATION_STAFF_INBOUND_ROUTING_VERIFIED:
      "true",

    // Explicitly disable live sends and unrelated
    // reservation actions.

    RESERVATION_SHARED_SMS_SEND_ENABLED:
      "false",

    RESERVATION_SHARED_SMS_ACTIVATION_VERIFIED:
      "false",

    RESERVATION_STUDIO_FORWARDING_ENABLED:
      "false",

    RESERVATION_INGEST_WRITES_ENABLED:
      "false",

    RESERVATION_CONFIRMATION_SEND_ENABLED:
      "false",

    RESERVATION_ALTERNATIVES_SEND_ENABLED:
      "false",

    RESERVATION_STAFF_SMS_ENABLED:
      "false",

    RESERVATION_STAFF_ACTIONS_ENABLED:
      "false",

    RESERVATION_MANAGER_ACTIONS_ENABLED:
      "false",

    RESERVATION_HANDOFF_REQUESTS_ENABLED:
      "false",

    RESERVATION_STAFF_HANDOFF_COMPLETION_ENABLED:
      "false",

    RESERVATION_SHARED_SMS_OUTBOUND_ENABLED:
      "false",
  };
}

/**
 * Synthetic verifier source.
 *
 * Written ONLY into the temporary workspace.
 *
 * Message SID fixtures:
 *
 * a = verified inbound
 * b = message not found
 * c = identity mismatch
 * d = transport failure
 *
 * No Twilio SDK import or network call occurs.
 *
 * The fixed historical timestamp ensures
 * duplicate requests use exactly the same
 * message creation time across requests.
 */
const syntheticVerifier = String.raw`
const SID = /^SM[0-9a-f]{32}$/i;
const E164 = /^\+[1-9]\d{7,14}$/;

const VERIFIED_TIMESTAMP =
  "2026-10-25T12:00:00.000Z";

export async function verifyInboundTwilioMessage(input) {
  if (
    !input ||
    typeof input !== "object" ||
    typeof input.messageSid !== "string" ||
    !SID.test(input.messageSid) ||
    typeof input.guestPhone !== "string" ||
    !E164.test(input.guestPhone) ||
    typeof input.restaurantPhone !== "string" ||
    !E164.test(input.restaurantPhone) ||
    input.guestPhone === input.restaurantPhone
  ) {
    return {
      verified: false,
      reason: "INVALID_INPUT",
    };
  }

  const fixture = input.messageSid.slice(2).toLowerCase();

  if (fixture === "b".repeat(32)) {
    return {
      verified: false,
      reason: "MESSAGE_NOT_FOUND",
    };
  }

  if (fixture === "c".repeat(32)) {
    return {
      verified: false,
      reason: "MESSAGE_IDENTITY_MISMATCH",
    };
  }

  if (fixture === "d".repeat(32)) {
    return {
      verified: false,
      reason: "MESSAGE_LOOKUP_FAILED",
    };
  }

  const BODY_FIXTURES = {
    ["a".repeat(32)]: "My reservation is FF-102826-001",
    ["e".repeat(32)]: "FF-102826-001 and FF-102826-002",
    ["f".repeat(32)]: "YES",
    ["1".repeat(32)]: "NO",
  };

  if (!Object.hasOwn(BODY_FIXTURES, fixture)) {
    return {
      verified: false,
      reason: "MESSAGE_NOT_FOUND",
    };
  }

  return {
    verified: true,
    message: {
      messageSid: input.messageSid,
      guestPhone: input.guestPhone,
      restaurantPhone: input.restaurantPhone,
      messageCreatedAt: VERIFIED_TIMESTAMP,
      messageBody: BODY_FIXTURES[fixture],
    },
  };
}
`;

function installSyntheticVerifier() {
  const relativePath =
    "src/lib/reservations/verified-inbound-twilio-message.ts";

  const original = path.join(root, relativePath);
  const destination = path.join(temp, relativePath);

  assert.ok(
    existsSync(original),
    "Original Twilio helper must exist",
  );

  assert.ok(
    existsSync(destination),
    "Copied Twilio helper must exist",
  );

  assert.notEqual(
    original,
    destination,
    "Synthetic verifier must not replace the source helper",
  );

  writeFileSync(
    destination,
    syntheticVerifier,
    "utf8",
  );

  console.log(
    "Synthetic Twilio verifier installed in temporary workspace only.",
  );
}

async function waitForInboundRoute(next) {
  // An unsigned request must fail authentication
  // before contacting either mock database or Twilio.
  //
  // Wait for the actual route to compile rather than
  // relying solely on the TCP port being available.

  const endpoint =
    `${APP_URL}/api/twilio/shared-conversation-inbound`;

  for (let attempt = 0; attempt < 60; attempt++) {
    if (
      next.exitCode !== null ||
      next.signalCode !== null
    ) {
      throw new Error(
        "Isolated Next.js exited during inbound readiness",
      );
    }

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: "{}",
        signal: AbortSignal.timeout(5000),
      });

      if (response.status === 401) {
        return;
      }
    } catch {
      // Next.js may still be compiling.
    }

    await sleep(1000);
  }

  throw new Error(
    "Isolated inbound API did not become ready with HTTP 401",
  );
}

try {
  assert.ok(
    existsSync(path.join(root, "package.json")),
    "Run from the project root",
  );

  const requiredFiles = [
    "tests/reservation-shared-inbound-mock-services.mjs",
    "tests/reservation-shared-inbound-route-http.test.mjs",
    "src/app/api/twilio/shared-conversation-inbound/route.ts",
    "src/lib/reservations/verified-inbound-twilio-message.ts",
    "src/lib/reservations/shared-inbound-recording-policy.ts",
    "src/lib/reservations/conversation-routing-decision.ts",
    "node_modules/next/dist/bin/next",
  ];

  for (const file of requiredFiles) {
    assert.ok(
      existsSync(path.join(root, file)),
      `Required file missing: ${file}`,
    );
  }

  // Do not connect to an existing service.
  // This also protects against accidental use of
  // an unrelated local application or mock process.

  for (const port of [MOCK_PORT, APP_PORT]) {
    assert.equal(
      await portListening(port),
      false,
      `Port ${port} is occupied; stop that service first`,
    );
  }

  console.log(
    `Creating isolated workspace: ${temp}`,
  );

  const allowedTopLevel = new Set([
    "src",
    "public",
    "tests",
    "package.json",
    "package-lock.json",
    "next.config.ts",
    "next.config.js",
    "next.config.mjs",
    "tsconfig.json",
    "next-env.d.ts",
    "postcss.config.mjs",
    "postcss.config.js",
    "tailwind.config.ts",
    "components.json",
  ]);

  // Copy the current application into the isolated
  // workspace without copying credentials, Git
  // metadata, migrations, or build artifacts.

  cpSync(root, temp, {
    recursive: true,

    filter: (source) => {
      const relative = path.relative(root, source);

      if (!relative) {
        return true;
      }

      const parts = relative.split(path.sep);

      if (!allowedTopLevel.has(parts[0])) {
        return false;
      }

      if (
        parts.some(
          (part) =>
            part === ".env" ||
            part.startsWith(".env."),
        )
      ) {
        return false;
      }

      if (
        parts.some(
          (part) =>
            part === ".next" ||
            part === "node_modules",
        )
      ) {
        return false;
      }

      return true;
    },
  });

  // Reuse installed dependencies without copying
  // or modifying the original node_modules.

  symlinkSync(
    path.join(root, "node_modules"),
    path.join(temp, "node_modules"),
    "dir",
  );

  assert.equal(
    existsSync(path.join(temp, ".env.local")),
    false,
    "Production .env.local must not be copied",
  );

  installSyntheticVerifier();

  const env = isolatedEnvironment();

  // ======================================================
  // 1. Start isolated mock Supabase.
  // ======================================================

  const mock = startProcess(
    "Shared inbound mock",
    process.execPath,
    [
      "tests/reservation-shared-inbound-mock-services.mjs",
    ],
    temp,
    env,
  );

  await waitForPort(
    MOCK_PORT,
    mock,
    "Shared inbound mock",
    15000,
  );

  console.log(
    `Mock Supabase ready at ${MOCK_URL}`,
  );

  // ======================================================
  // 2. Start isolated Next.js.
  // ======================================================

  // Webpack mode follows our established isolated
  // routing test launcher and avoids the Turbopack
  // symlink resolution issue.

  const next = startProcess(
    "Isolated Next.js",
    process.execPath,
    [
      path.join(
        root,
        "node_modules/next/dist/bin/next",
      ),
      "dev",
      "--webpack",
      "-p",
      String(APP_PORT),
      "-H",
      MOCK_HOST,
    ],
    temp,
    env,
  );

  await waitForPort(
    APP_PORT,
    next,
    "Isolated Next.js",
  );

  await waitForInboundRoute(next);

  console.log(
    "Isolated inbound API ready.",
  );

  // ======================================================
  // 3. Execute the HTTP security suite.
  // ======================================================

  console.log(
    "\n=== SHARED INBOUND NEXT.JS HTTP TESTS ===",
  );

  const result = spawnSync(
    process.execPath,
    [
      "--test",
      "tests/reservation-shared-inbound-route-http.test.mjs",
    ],
    {
      cwd: temp,
      env,
      stdio: "inherit",
      timeout: 180000,
    },
  );

  if (result.error) {
    throw result.error;
  }

  assert.equal(
    result.status,
    0,
    "Shared inbound HTTP security suite failed",
  );

  console.log(
    "\nPASS: Shared inbound isolated HTTP tests completed.",
  );
} catch (error) {
  console.error(
    "\nSHARED INBOUND TEST LAUNCHER FAILED:",
    error instanceof Error
      ? error.message
      : String(error),
  );

  process.exitCode = 1;
} finally {
  stopAll();

  // Allow the application and mock processes to
  // release their files before deleting /tmp.

  await sleep(1000);

  try {
    rmSync(temp, {
      recursive: true,
      force: true,
    });
  } catch (error) {
    console.warn(
      "Temporary workspace cleanup failed:",
      temp,
      error instanceof Error
        ? error.message
        : String(error),
    );
  }
}