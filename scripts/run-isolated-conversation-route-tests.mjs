
import assert from "node:assert/strict";
import { spawn, spawnSync } from "node:child_process";
import {
  cpSync,
  existsSync,
  mkdtempSync,
  rmSync,
  symlinkSync,
} from "node:fs";
import net from "node:net";
import os from "node:os";
import path from "node:path";

// Fin & Feathers LV — Isolated Conversation Router Tests
// Step 58D.11.26
//
// Run from the project root:
//
// node scripts/run-isolated-conversation-route-tests.mjs
//
// No production .env files or credentials are copied.
// No live Twilio messaging is enabled.
// The existing development server on port 3000 is untouched.

const root = process.cwd();
const temp = mkdtempSync(
  path.join(os.tmpdir(), "ff-routing-http-"),
);

const mockPort = 4318;
const appPort = 3100;

const children = [];
let stopping = false;

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function portListening(port, host = "127.0.0.1") {
  return new Promise((resolve) => {
    const socket = net.connect({ port, host });

    socket.once("connect", () => {
      socket.destroy();
      resolve(true);
    });

    socket.once("error", () => resolve(false));

    socket.setTimeout(700, () => {
      socket.destroy();
      resolve(false);
    });
  });
}

async function waitForPort(
  port,
  proc,
  label,
  maxMs = 120000,
) {
  const start = Date.now();

  while (Date.now() - start < maxMs) {
    if (
      proc.exitCode !== null ||
      proc.signalCode !== null
    ) {
      throw new Error(
        `${label} exited before becoming ready`,
      );
    }

    if (await portListening(port)) {
      return;
    }

    await delay(400);
  }

  throw new Error(
    `${label} did not start within ${maxMs / 1000}s`,
  );
}

function start(label, command, args, cwd, env) {
  const child = spawn(command, args, {
    cwd,
    env,
    stdio: "inherit",
    detached: true,
  });

  child.on("error", (err) => {
    console.error(`${label}: ${err.message}`);
  });

  children.push(child);

  return child;
}

function stopAll() {
  if (stopping) {
    return;
  }

  stopping = true;

  for (const child of children.reverse()) {
    if (child.pid && child.exitCode === null) {
      try {
        process.kill(-child.pid, "SIGTERM");
      } catch {
        // Process already exited.
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

function isolatedEnv() {
  const sandboxUrl = `http://127.0.0.1:${mockPort}`;

  const localTestSecret =
    "local-test-router-signing-key-not-for-production-2026";

  // Explicit environment allowlist.
  // Production Supabase, Twilio, and reservation
  // environment variables are never inherited.

  return {
    PATH: process.env.PATH ?? "/usr/bin:/bin",
    HOME: temp,
    TMPDIR: os.tmpdir(),
    NODE_ENV: "development",
    CI: "1",
    NEXT_TELEMETRY_DISABLED: "1",

    SUPABASE_URL: sandboxUrl,
    NEXT_PUBLIC_SUPABASE_URL: sandboxUrl,

    NEXT_PUBLIC_SUPABASE_ANON_KEY:
      "test-anon-key-local-only",

    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
      "sb_publishable_local_test_only",

    SUPABASE_SECRET_KEY:
      "sb_secret_local_test_only",

    SUPABASE_SERVICE_ROLE_KEY:
      "test-service-role-key-local-only",

    RESERVATION_STUDIO_ROUTER_SECRET:
      localTestSecret,

    TWILIO_FROM_NUMBER: "+15555550100",

    SMS_TEST_BASE_URL:
      `http://127.0.0.1:${appPort}`,

    // Routing scenarios are enabled for testing.
    RESERVATION_SHARED_SMS_ROUTING_ENABLED:
      "true",

    RESERVATION_STUDIO_STAFF_ROUTING_ENABLED:
      "true",

    RESERVATION_STUDIO_HANDOFF_FENCE_ENABLED:
      "true",

    // All live sends, writes, forwarding, and
    // activation operations remain disabled.
    RESERVATION_SHARED_SMS_SEND_ENABLED:
      "false",

    RESERVATION_SHARED_SMS_ACTIVATION_VERIFIED:
      "false",

    RESERVATION_STAFF_INBOUND_ROUTING_VERIFIED:
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
  };
}

try {
  assert.ok(
    existsSync(path.join(root, "package.json")),
    "Run from the project root",
  );

  const requiredFiles = [
    "tests/reservation-conversation-mock-db.mjs",
    "tests/reservation-conversation-route-integration.test.mjs",
    "tests/reservation-conversation-route-http.test.mjs",
    "node_modules/next/dist/bin/next",
  ];

  for (const file of requiredFiles) {
    assert.ok(
      existsSync(path.join(root, file)),
      `Required file missing: ${file}`,
    );
  }

  for (const port of [mockPort, appPort]) {
    assert.equal(
      await portListening(port),
      false,
      `Port ${port} is occupied; stop that test service first`,
    );
  }

  console.log(
    `Creating isolated test workspace: ${temp}`,
  );

  // Copy only permitted application and test files.
  // Do not copy .env*, Git metadata, credentials,
  // migrations, audit outputs, or old build artifacts.

  const permittedTopLevel = new Set([
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

  cpSync(root, temp, {
    recursive: true,

    filter: (source) => {
      const relative = path.relative(root, source);

      if (!relative) {
        return true;
      }

      const parts = relative.split(path.sep);

      if (!permittedTopLevel.has(parts[0])) {
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
    "Production environment file must not be copied",
  );

  const env = isolatedEnv();

  // --------------------------------------------------------
  // Start mock Supabase
  // --------------------------------------------------------

  const mock = start(
    "Mock Supabase",
    process.execPath,
    ["tests/reservation-conversation-mock-db.mjs"],
    temp,
    env,
  );

  await waitForPort(
    mockPort,
    mock,
    "Mock Supabase",
    15000,
  );

  console.log(
    "Mock Supabase ready on 127.0.0.1:4318",
  );

  // --------------------------------------------------------
  // Start isolated Next.js using WEBPACK.
  //
  // The --webpack flag avoids Turbopack rejecting
  // the external node_modules symbolic-link target.
  //
  // This does not affect the main Next.js server.
  // --------------------------------------------------------

  const next = start(
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
      String(appPort),
      "-H",
      "127.0.0.1",
    ],
    temp,
    env,
  );

  await waitForPort(
    appPort,
    next,
    "Isolated Next.js",
  );

  // Wait for the router itself to become ready.
  // An unsigned request must fail authentication
  // before contacting the mock database.

  let ready = false;

  for (let attempt = 0; attempt < 60; attempt++) {
    if (
      next.exitCode !== null ||
      next.signalCode !== null
    ) {
      throw new Error(
        "Isolated Next.js exited during router readiness",
      );
    }

    try {
      const response = await fetch(
        `http://127.0.0.1:${appPort}/api/twilio/conversation-route`,
        {
          method: "POST",
          body: "{}",
          headers: {
            "content-type": "application/json",
          },
          signal: AbortSignal.timeout(5000),
        },
      );

      if (response.status === 401) {
        ready = true;
        break;
      }
    } catch {
      // Router may still be compiling.
    }

    await delay(1000);
  }

  assert.ok(
    ready,
    "Isolated router did not become ready with HTTP 401",
  );

  console.log("Isolated HTTP router ready");

  // --------------------------------------------------------
  // Run existing HTTP integration and security tests.
  // --------------------------------------------------------

  const suites = [
    "tests/reservation-conversation-route-integration.test.mjs",
    "tests/reservation-conversation-route-http.test.mjs",
  ];

  for (const file of suites) {
    console.log(`\n=== Running ${file} ===`);

    const result = spawnSync(
      process.execPath,
      ["--test", file],
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
      `${file} failed`,
    );
  }

  console.log(
    "\nPASS: Isolated HTTP integration and security suites completed",
  );
} catch (err) {
  console.error(
    "\nTEST LAUNCHER FAILED:",
    err.message,
  );

  process.exitCode = 1;
} finally {
  stopAll();

  // Allow test services to terminate before
  // removing their temporary project files.

  await delay(1000);

  try {
    rmSync(temp, {
      recursive: true,
      force: true,
    });
  } catch (err) {
    console.warn(
      `Remove temporary workspace manually: ${temp} (${err.message})`,
    );
  }
}
