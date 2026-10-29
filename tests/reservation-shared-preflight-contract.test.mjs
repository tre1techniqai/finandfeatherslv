import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

import {
  reconcileSharedStudioExecutions,
  SHARED_STUDIO_EXECUTION_SCAN_LIMIT,
} from "../src/lib/reservations/shared-studio-execution-reconciliation.ts";

const routePath =
  "src/app/api/staff/reservations/[id]/conversation/shared-preflight/route.ts";

const source = fs.readFileSync(routePath, "utf8");

const FLOW = "FW" + "1".repeat(32);
const GUEST = "+17025550123";
const OTHER = "+17025550999";

function execution(character, phone = GUEST, overrides = {}) {
  return {
    sid: "FN" + character.repeat(32),
    flowSid: FLOW,
    status: "active",
    contactChannelAddress: phone,
    ...overrides,
  };
}

// Mirrors the established diagnostic mapping.
// This does not execute the Next.js route itself.

function studioDiagnostic(published, executions) {
  if (!published) {
    return {
      passed: false,
      count: null,
      detail:
        "Execution scan was not performed because the configured Flow was not verified.",
    };
  }

  const reconciliation =
    reconcileSharedStudioExecutions(
      executions,
      GUEST,
      FLOW,
    );

  const count =
    reconciliation.status === "clear" ||
    reconciliation.status === "active"
      ? reconciliation.executionCount
      : null;

  const detail =
    reconciliation.status === "incomplete"
      ? "Studio execution scan reached its limit and cannot be considered complete."
      : reconciliation.status === "invalid"
        ? "Studio execution identity was inconsistent."
        : reconciliation.status === "unavailable"
          ? "Studio execution scan was unavailable."
          : reconciliation.status === "clear"
            ? "No active execution was observed for this guest during this scan."
            : "One or more active Studio executions were observed for this guest.";

  return {
    passed: reconciliation.status === "clear",
    count,
    detail,
  };
}

test("01 - Published Flow with no executions passes", () => {
  const result = studioDiagnostic(true, []);

  assert.equal(result.passed, true);
  assert.equal(result.count, 0);
});

test("02 - Active guest execution fails", () => {
  const result = studioDiagnostic(
    true,
    [execution("a")],
  );

  assert.equal(result.passed, false);
  assert.equal(result.count, 1);
});

test("03 - Unrelated active execution is excluded", () => {
  const result = studioDiagnostic(
    true,
    [execution("a", OTHER)],
  );

  assert.equal(result.passed, true);
  assert.equal(result.count, 0);
});

test("04 - Incomplete scan fails closed", () => {
  const records = Array.from(
    { length: SHARED_STUDIO_EXECUTION_SCAN_LIMIT },
    (_, index) => execution(
      (index % 10).toString(),
      OTHER,
    ),
  );

  const result = studioDiagnostic(true, records);

  assert.equal(result.passed, false);
  assert.equal(result.count, null);
  assert.match(result.detail, /limit/);
});

test("05 - Invalid execution identity fails closed", () => {
  const result = studioDiagnostic(
    true,
    [
      execution("a", GUEST, {
        flowSid: "FW" + "2".repeat(32),
      }),
    ],
  );

  assert.equal(result.passed, false);
  assert.equal(result.count, null);
  assert.match(result.detail, /inconsistent/);
});

test("06 - Unpublished Flow fails closed", () => {
  const result = studioDiagnostic(
    false,
    [],
  );

  assert.equal(result.passed, false);
  assert.equal(result.count, null);
  assert.match(result.detail, /not performed/);
});

test("07 - Exactly one Studio execution scan remains", () => {
  const occurrences = [
    ...source.matchAll(/\.executions\.list\s*\(/g),
  ];

  assert.equal(
    occurrences.length,
    1,
    "Preflight must perform exactly one execution scan.",
  );
});

test("08 - Centralized reconciliation is used once", () => {
  const calls = [
    ...source.matchAll(
      /reconcileSharedStudioExecutions\s*\(/g,
    ),
  ];

  assert.equal(calls.length, 1);

  assert.match(
    source,
    /SHARED_STUDIO_EXECUTION_SCAN_LIMIT/,
  );
});

test("09 - Seven unique diagnostic checks remain", () => {
  const names = [
    ...source.matchAll(
      /checks\.push\s*\(\s*\{\s*name:\s*"([^"]+)"/g,
    ),
  ].map((match) => match[1]);

  const unique = new Set(names);

  assert.equal(
    unique.size,
    7,
    `Expected seven unique checks; found: ${[...unique].join(", ")}`,
  );

  assert.equal(
    names.filter(
      (name) => name === "studio_active_execution_scan",
    ).length,
    2,
    "Published and unpublished branches must each contain one Studio check.",
  );
});

test("10 - Activation remains explicitly disabled", () => {
  assert.match(
    source,
    /activationAuthorized:\s*false/,
  );

  assert.match(
    source,
    /smsSent:\s*false/,
  );

  assert.match(
    source,
    /studioExecutionsChanged:\s*false/,
  );

  assert.match(
    source,
    /databaseChanged:\s*false/,
  );
});

test("11 - Existing response fields are preserved", () => {
  const requiredFields = [
    "reservationId",
    "conversationId",
    "sharedMode",
    "modeVersion",
    "matchingConversationCount",
    "legacyStatus",
    "activeStudioExecutions",
    "checksPassed",
    "checks",
  ];

  for (const field of requiredFields) {
    assert.match(
      source,
      new RegExp(`\\b${field}\\s*[:,]`),
      `Missing response field: ${field}`,
    );
  }
});

test("12 - Preflight contains no transition RPC calls", () => {
  const forbidden = [
    "request_reservation_shared_staff_mode",
    "complete_reservation_shared_staff_mode",
    "cancel_reservation_shared_staff_transition",
    "resume_reservation_shared_automation",
  ];

  for (const functionName of forbidden) {
    assert.equal(
      source.includes(`admin.rpc("${functionName}"`),
      false,
      `Preflight must not invoke ${functionName}`,
    );
  }
});