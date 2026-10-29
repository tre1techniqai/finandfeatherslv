import test from "node:test";
import assert from "node:assert/strict";

import {
  reconcileSharedStudioExecutions,
  unavailableSharedStudioExecutions,
} from "../src/lib/reservations/shared-studio-execution-reconciliation.ts";

const FLOW = "FW" + "1".repeat(32);
const GUEST = "+17025550123";
const OTHER = "+17025550999";

function execution(
  character,
  phone = GUEST,
  overrides = {},
) {
  return {
    sid: "FN" + character.repeat(32),
    flowSid: FLOW,
    status: "active",
    contactChannelAddress: phone,
    ...overrides,
  };
}

test("01 - Empty scan is clear", () => {
  const result = reconcileSharedStudioExecutions(
    [],
    GUEST,
    FLOW,
  );

  assert.equal(result.status, "clear");
  assert.equal(result.executionCount, 0);
});

test("02 - Active guest execution is detected", () => {
  const result = reconcileSharedStudioExecutions(
    [execution("a")],
    GUEST,
    FLOW,
  );

  assert.equal(result.status, "active");
  assert.equal(result.executionCount, 1);
  assert.equal(result.executionSids.length, 1);
});

test("03 - Multiple guest executions are detected", () => {
  const result = reconcileSharedStudioExecutions(
    [execution("a"), execution("b")],
    GUEST,
    FLOW,
  );

  assert.equal(result.status, "active");
  assert.equal(result.executionCount, 2);
});

test("04 - Unrelated guest executions are excluded", () => {
  const result = reconcileSharedStudioExecutions(
    [execution("a", OTHER)],
    GUEST,
    FLOW,
  );

  assert.equal(result.status, "clear");
});

test("05 - Guest and unrelated executions are separated", () => {
  const result = reconcileSharedStudioExecutions(
    [
      execution("a", OTHER),
      execution("b", GUEST),
    ],
    GUEST,
    FLOW,
  );

  assert.equal(result.status, "active");
  assert.equal(result.executionCount, 1);
});

test("06 - Scan at limit is incomplete", () => {
  const records = Array.from(
    { length: 1000 },
    (_, index) =>
      execution(
        (index % 10).toString(),
        OTHER,
      ),
  );

  const result = reconcileSharedStudioExecutions(
    records,
    GUEST,
    FLOW,
  );

  assert.equal(result.status, "incomplete");
});

test("07 - Invalid Flow SID is rejected", () => {
  const result = reconcileSharedStudioExecutions(
    [],
    GUEST,
    "invalid",
  );

  assert.equal(result.status, "invalid");
});

test("08 - Invalid guest phone is rejected", () => {
  const result = reconcileSharedStudioExecutions(
    [],
    "invalid",
    FLOW,
  );

  assert.equal(result.status, "invalid");
});

test("09 - Wrong execution Flow is rejected", () => {
  const result = reconcileSharedStudioExecutions(
    [
      execution("a", GUEST, {
        flowSid: "FW" + "2".repeat(32),
      }),
    ],
    GUEST,
    FLOW,
  );

  assert.equal(result.status, "invalid");
});

test("10 - Non-active execution is rejected", () => {
  const result = reconcileSharedStudioExecutions(
    [
      execution("a", GUEST, {
        status: "ended",
      }),
    ],
    GUEST,
    FLOW,
  );

  assert.equal(result.status, "invalid");
});

test("11 - Duplicate execution SID is rejected", () => {
  const record = execution("a");

  const result = reconcileSharedStudioExecutions(
    [record, record],
    GUEST,
    FLOW,
  );

  assert.equal(result.status, "invalid");
});

test("12 - Missing contact address is rejected", () => {
  const result = reconcileSharedStudioExecutions(
    [
      execution("a", GUEST, {
        contactChannelAddress: null,
      }),
    ],
    GUEST,
    FLOW,
  );

  assert.equal(result.status, "invalid");
});

test("13 - Invalid execution SID is rejected", () => {
  const result = reconcileSharedStudioExecutions(
    [
      execution("a", GUEST, {
        sid: "INVALID",
      }),
    ],
    GUEST,
    FLOW,
  );

  assert.equal(result.status, "invalid");
});

test("14 - Unavailable result fails closed", () => {
  const result =
    unavailableSharedStudioExecutions();

  assert.equal(result.status, "unavailable");
  assert.equal(result.executionCount, null);
});

test("15 - Null scan is rejected", () => {
  const result = reconcileSharedStudioExecutions(
    null,
    GUEST,
    FLOW,
  );

  assert.equal(result.status, "invalid");
});