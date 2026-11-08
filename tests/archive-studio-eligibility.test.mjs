import test from "node:test";
import assert from "node:assert/strict";

import {
  decideArchiveStudioEligibility,
} from "../src/lib/reservations/archive-studio-eligibility.ts";

const SID = "FN" + "a".repeat(32);
const OTHER_SID = "FN" + "b".repeat(32);

const FLOW = "FW" + "1".repeat(32);
const OTHER_FLOW = "FW" + "2".repeat(32);

const PHONE = "+17025550123";
const OTHER_PHONE = "+17025550999";

function decide(overrides = {}, expected = {}) {
  return decideArchiveStudioEligibility({
    expectedExecutionSid: SID,
    expectedFlowSid: FLOW,
    expectedGuestPhone: PHONE,
    execution: {
      sid: SID,
      flowSid: FLOW,
      contactChannelAddress: PHONE,
      status: "ended",
      ...overrides,
    },
    ...expected,
  });
}

test("01 - Exact ended execution permits preflight", () => {
  assert.deepEqual(decide(), {
    eligible: true,
    reason: "ENDED_VERIFIED",
  });
});

test("02 - Active execution blocks preflight", () => {
  assert.deepEqual(
    decide({ status: "active" }),
    {
      eligible: false,
      reason: "EXECUTION_NOT_ENDED",
    },
  );
});

test("03 - Unexpected execution status blocks preflight", () => {
  assert.equal(
    decide({ status: "unexpected" }).eligible,
    false,
  );
});

test("04 - Wrong execution SID blocks preflight", () => {
  assert.deepEqual(
    decide({ sid: OTHER_SID }),
    {
      eligible: false,
      reason: "EXECUTION_IDENTITY_MISMATCH",
    },
  );
});

test("05 - Wrong Flow SID blocks preflight", () => {
  assert.equal(
    decide({ flowSid: OTHER_FLOW }).eligible,
    false,
  );
});

test("06 - Wrong guest phone blocks preflight", () => {
  assert.equal(
    decide({
      contactChannelAddress: OTHER_PHONE,
    }).eligible,
    false,
  );
});

test("07 - Missing Studio execution blocks preflight", () => {
  assert.deepEqual(
    decide({}, { execution: null }),
    {
      eligible: false,
      reason: "EXECUTION_UNAVAILABLE",
    },
  );
});

test("08 - Invalid reservation execution identity blocks preflight", () => {
  assert.deepEqual(
    decide(
      {},
      { expectedExecutionSid: "not-an-sid" },
    ),
    {
      eligible: false,
      reason: "INVALID_EXPECTED_IDENTITY",
    },
  );
});

test("09 - Same-phone, other-reservation execution cannot substitute", () => {
  assert.deepEqual(
    decide({
      sid: OTHER_SID,
      contactChannelAddress: PHONE,
    }),
    {
      eligible: false,
      reason: "EXECUTION_IDENTITY_MISMATCH",
    },
  );
});

test("10 - SID capitalization is treated consistently", () => {
  assert.equal(
    decide({
      sid: SID.toLowerCase(),
    }).eligible,
    true,
  );
});

test("11 - Missing execution status blocks preflight", () => {
  assert.equal(
    decide({ status: undefined }).eligible,
    false,
  );
});

test("12 - Missing guest address blocks preflight", () => {
  assert.equal(
    decide({
      contactChannelAddress: null,
    }).eligible,
    false,
  );
});