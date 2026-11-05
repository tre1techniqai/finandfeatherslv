"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

const { handler } = require(
  "../twilio/functions/process-alternative-reply.js"
);

const MESSAGE_SID = `SM${"a".repeat(32)}`;
const FROM = "+17025550123";
const REFERENCE = "FF-261105-001";
const EMAIL_REPLY = `guest@example.com ${REFERENCE}`;

const context = {
  SUPABASE_URL: "https://example.supabase.co",
  SUPABASE_SERVICE_ROLE_KEY: "local-test-key",
};

async function invoke(body, outcome = "no_active_offer", extra = {}) {
  const originalFetch = global.fetch;
  let rpcCalls = 0;

  global.fetch = async (url, options) => {
    rpcCalls++;

    assert.equal(
      url,
      "https://example.supabase.co/rest/v1/rpc/record_reservation_alternative_reply"
    );

    assert.equal(options.method, "POST");

    const payload = JSON.parse(options.body);

    assert.equal(payload.p_customer_phone, FROM);
    assert.equal(payload.p_inbound_message_sid, MESSAGE_SID);
    assert.equal(payload.p_reply, body.slice(0, 100));

    return {
      ok: true,
      status: 200,
      json: async () => [{
        outcome,
        ...extra,
      }],
    };
  };

  try {
    const result = await new Promise((resolve, reject) => {
      Promise.resolve(
        handler(
          context,
          {
            From: FROM,
            Body: body,
            MessageSid: MESSAGE_SID,
          },
          (error, value) => {
            if (error) reject(error);
            else resolve(value);
          }
        )
      ).catch(reject);
    });

    assert.equal(rpcCalls, 1);
    return result;
  } finally {
    global.fetch = originalFetch;
  }
}

test("email and reference recognized without active offer", async () => {
  const result = await invoke(EMAIL_REPLY);

  assert.equal(result.route, "handled");
  assert.equal(result.outcome, "DEPOSIT_EMAIL_CANDIDATE");
  assert.equal(result.previousOutcome, "no_active_offer");
});

test("email recognized after recently accepted alternative", async () => {
  const result = await invoke(EMAIL_REPLY, "recently_accepted");

  assert.equal(result.route, "handled");
  assert.equal(result.outcome, "DEPOSIT_EMAIL_CANDIDATE");
  assert.equal(result.previousOutcome, "recently_accepted");
});

test("bare email is not a deposit email candidate", async () => {
  const result = await invoke("guest@example.com");

  assert.notEqual(result.outcome, "DEPOSIT_EMAIL_CANDIDATE");
});

test("bare reservation reference is not a deposit email candidate", async () => {
  const result = await invoke(REFERENCE);

  assert.notEqual(result.outcome, "DEPOSIT_EMAIL_CANDIDATE");
});

test("structured reservation remains in reservation intake", async () => {
  const body = [
    "First Name: Guest",
    "Last Name: Test",
    "Mobile Phone: +17025550123",
    "Date: 2026-11-20",
    "Time: 18:00",
    "Guests: 4",
    "Occasion: JUST DINING",
  ].join("\n");

  const result = await invoke(body);

  assert.equal(result.route, "reservation");
  assert.notEqual(result.outcome, "DEPOSIT_EMAIL_CANDIDATE");
});

test("guest assistance remains guest assistance", async () => {
  const result = await invoke(
    "Can you accommodate a food allergy?"
  );

  assert.equal(result.route, "assistance");
  assert.equal(result.outcome, "GUEST_ASSISTANCE_REQUIRED");
});

test("STOP remains a messaging-control command", async () => {
  const result = await invoke("STOP");

  assert.equal(result.route, "handled");
  assert.equal(result.outcome, "MESSAGING_CONTROL_COMMAND");
});

test("active alternative acceptance is preserved", async () => {
  const result = await invoke("1", "accepted", {
    reservation_id: "11111111-2222-4333-8444-555555555555",
    accepted_time: "18:30:00",
  });

  assert.equal(result.route, "handled");
  assert.equal(result.outcome, "accepted");
  assert.equal(result.acceptedTimeFormatted, "6:30 PM");
});

test("orphaned numeric reply does not become deposit email", async () => {
  const result = await invoke("2");

  assert.equal(result.route, "handled");
  assert.notEqual(result.outcome, "DEPOSIT_EMAIL_CANDIDATE");
});

test("general message does not become deposit email", async () => {
  const result = await invoke("Thank you very much");

  assert.notEqual(result.outcome, "DEPOSIT_EMAIL_CANDIDATE");
  assert.notEqual(result.route, "error");
});
