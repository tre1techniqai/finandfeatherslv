
"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const crypto = require("node:crypto");

const {
  handler,
} = require(
  "../twilio/functions/send-reservation-deposit-decision.js"
);

const SECRET = "ab".repeat(32);

const EVENT_KEY =
  "reservation_deposit_decision:" +
  "11111111-2222-4333-8444-555555555555";

const RECIPIENT = "+17025550123";
const SENDER = "+17025550999";
const SID = `SM${"a".repeat(32)}`;

function signedEvent(overrides = {}) {
  const event = {
    timestamp: String(Math.floor(Date.now() / 1000)),
    eventKey: EVENT_KEY,
    to: RECIPIENT,
    body:
      "Fin & Feathers: deposit required for reference " +
      "FF-261105-001",
    ...overrides,
  };

  event.signature = crypto
    .createHmac("sha256", Buffer.from(SECRET, "hex"))
    .update(
      `${event.timestamp}.` +
        JSON.stringify({
          eventKey: event.eventKey,
          to: event.to,
          body: event.body,
        })
    )
    .digest("hex");

  return event;
}

async function invoke(
  event,
  { create, secret = SECRET } = {}
) {
  let sends = 0;

  const context = {
    RESERVATION_CONFIRMATION_SECRET: secret,
    TWILIO_FROM_NUMBER: SENDER,
    getTwilioClient: () => ({
      messages: {
        create: async (params) => {
          sends++;

          assert.equal(params.from, SENDER);

          if (create) {
            return create(params);
          }

          return {
            sid: SID,
            status: "queued",
          };
        },
      },
    }),
  };

  const response = await new Promise(
    (resolve, reject) => {
      Promise.resolve(
        handler(context, event, (error, value) => {
          if (error) reject(error);
          else resolve(value);
        })
      ).catch(reject);
    }
  );

  return { response, sends };
}

test(
  "valid authenticated request sends exactly one message",
  async () => {
    const { response, sends } =
      await invoke(signedEvent());

    assert.equal(sends, 1);

    assert.deepEqual(response, {
      success: true,
      accepted: true,
      eventKey: EVENT_KEY,
      messageSid: SID,
      messageStatus: "queued",
    });
  }
);

test(
  "tampered body fails authentication without sending",
  async () => {
    const event = signedEvent();
    event.body = "tampered";

    const { response, sends } = await invoke(event);

    assert.equal(sends, 0);
    assert.equal(
      response.error,
      "AUTHENTICATION_FAILED"
    );
  }
);

test(
  "expired signed request is rejected without sending",
  async () => {
    const oldTimestamp = String(
      Math.floor(Date.now() / 1000) - 301
    );

    const { response, sends } = await invoke(
      signedEvent({ timestamp: oldTimestamp })
    );

    assert.equal(sends, 0);
    assert.equal(
      response.error,
      "REQUEST_TIMESTAMP_EXPIRED"
    );
  }
);

test(
  "missing configured secret fails closed",
  async () => {
    const { response, sends } = await invoke(
      signedEvent(),
      { secret: "" }
    );

    assert.equal(sends, 0);
    assert.equal(
      response.error,
      "SECRET_NOT_CONFIGURED"
    );
  }
);

test(
  "invalid recipient fails without sending",
  async () => {
    const { response, sends } = await invoke(
      signedEvent({ to: "555-1234" })
    );

    assert.equal(sends, 0);
    assert.equal(
      response.error,
      "INVALID_RECIPIENT"
    );
  }
);

test(
  "overlong SMS fails without sending",
  async () => {
    const { response, sends } = await invoke(
      signedEvent({ body: "x".repeat(1001) })
    );

    assert.equal(sends, 0);
    assert.equal(
      response.error,
      "INVALID_MESSAGE"
    );
  }
);

test(
  "Twilio API error reports failure without accepted SID",
  async () => {
    const { response, sends } = await invoke(
      signedEvent(),
      {
        create: async () => {
          throw Object.assign(
            new Error("network error"),
            { code: 20003 }
          );
        },
      }
    );

    assert.equal(sends, 1);
    assert.equal(response.accepted, false);
    assert.equal(
      response.error,
      "TWILIO_SEND_FAILED"
    );
    assert.equal(response.messageSid, undefined);
  }
);

test(
  "missing Twilio SID is not treated as accepted",
  async () => {
    const { response, sends } = await invoke(
      signedEvent(),
      {
        create: async () => ({
          status: "queued",
        }),
      }
    );

    assert.equal(sends, 1);
    assert.equal(response.accepted, false);
    assert.equal(
      response.error,
      "MESSAGE_SID_MISSING"
    );
  }
);