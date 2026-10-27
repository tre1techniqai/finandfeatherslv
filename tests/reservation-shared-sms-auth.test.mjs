import test from "node:test";
import assert from "node:assert/strict";

const BASE =
  "http://localhost:3100/api/staff/conversations";

const VALID_ID = "00000000-0000-4000-8000-000000000001";

const VALID_BODY = {
  body: "Synthetic authentication test",
  clientRequestId:
    "00000000-0000-4000-8000-000000000002",
  reservationId: null,
};

async function submit(conversationId, options = {}) {
  const response = await fetch(
    `${BASE}/${conversationId}/messages`,
    {
      method: "POST",
      headers: {
        Origin:
          options.origin ??
          "http://localhost:3100",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(VALID_BODY),
      signal: AbortSignal.timeout(15000),
    },
  );

  return {
    status: response.status,
    data: await response.json(),
  };
}

test("Rejects cross-origin requests", async () => {
  const result = await submit(VALID_ID, {
    origin: "https://example.com",
  });

  assert.equal(result.status, 403);
  assert.equal(result.data.success, false);
  assert.equal(
    result.data.error,
    "Request origin is not authorized.",
  );
});

test("Rejects invalid conversation IDs", async () => {
  const result = await submit("not-a-uuid");

  assert.equal(result.status, 400);
  assert.equal(result.data.success, false);
  assert.equal(
    result.data.error,
    "Invalid conversation ID.",
  );
});

test("Rejects unauthenticated SMS submission", async () => {
  const result = await submit(VALID_ID);

  assert.equal(result.status, 401);
  assert.equal(result.data.success, false);
  assert.equal(
    result.data.error,
    "Authentication required.",
  );
});