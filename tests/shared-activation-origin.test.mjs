import test from "node:test";
import assert from "node:assert/strict";

import {
  validSharedActivationOrigin,
} from "../src/lib/reservations/shared-activation-origin.ts";

function request(url, origin) {
  const headers = {};

  if (origin !== null) {
    headers.origin = origin;
  }

  return new Request(url, {
    method: "POST",
    headers,
  });
}

test("01 - Same-origin HTTPS is accepted", () => {
  assert.equal(
    validSharedActivationOrigin(
      request(
        "https://finandfeatherslv.live/api/test",
        "https://finandfeatherslv.live"
      )
    ),
    true
  );
});

test("02 - Different origin is rejected", () => {
  assert.equal(
    validSharedActivationOrigin(
      request(
        "https://finandfeatherslv.live/api/test",
        "https://example.com"
      )
    ),
    false
  );
});

test("03 - Missing Origin is rejected", () => {
  assert.equal(
    validSharedActivationOrigin(
      request(
        "https://finandfeatherslv.live/api/test",
        null
      )
    ),
    false
  );
});

test("04 - HTTP is rejected", () => {
  assert.equal(
    validSharedActivationOrigin(
      request(
        "http://localhost:3101/api/test",
        "http://localhost:3101"
      )
    ),
    false
  );
});

test("05 - Mixed HTTPS and HTTP is rejected", () => {
  assert.equal(
    validSharedActivationOrigin(
      request(
        "https://finandfeatherslv.live/api/test",
        "http://finandfeatherslv.live"
      )
    ),
    false
  );
});

test("06 - Invalid Origin is rejected", () => {
  assert.equal(
    validSharedActivationOrigin(
      request(
        "https://finandfeatherslv.live/api/test",
        "not-a-url"
      )
    ),
    false
  );
});

test("07 - Different port is rejected", () => {
  assert.equal(
    validSharedActivationOrigin(
      request(
        "https://finandfeatherslv.live:8443/api/test",
        "https://finandfeatherslv.live"
      )
    ),
    false
  );
});