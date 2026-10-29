import http from "node:http";

const HOST = "127.0.0.1";
const PORT = 4319;

const E164 = /^\+[1-9]\d{7,14}$/;
const MESSAGE_SID = /^SM[0-9a-f]{32}$/i;
const MAX_BODY_BYTES = 8192;

// Delays are opt-in and bounded to keep isolated tests deterministic.
// The mock never makes external requests.
const MAX_TEST_DELAY_MS = 10000;

function sleep(ms) {
  return ms > 0
    ? new Promise((resolve) => setTimeout(resolve, ms))
    : Promise.resolve();
}

function validDelay(value) {
  return (
    value === undefined ||
    (Number.isInteger(value) &&
      value >= 0 &&
      value <= MAX_TEST_DELAY_MS)
  );
}


const LEGACY_STATUSES = new Set([
  "automation",
  "handoff_pending",
  "staff",
  "released",
]);

const SHARED_MODES = new Set([
  "automation",
  "transitioning_to_staff",
  "staff",
]);

const CONVERSATION_ID =
  "11111111-1111-4111-8111-111111111111";

const RESERVATION_ID = "33333333-3333-4333-8333-333333333333";
const RESERVATION_REFERENCE = "FF-102826-001";
const EXECUTION_SID = `FN${"e".repeat(32)}`;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const EVENT_ID =
  "22222222-2222-4222-8222-222222222222";

const scenarios = new Map();
const inboundEvents = new Map();

const counters = {
  legacyLookups: 0,
  sharedLookups: 0,
  reservationLookups: 0,
  scopedLookups: 0,
  recordingAttempts: 0,
  successfulInserts: 0,
  duplicateReplays: 0,
};

function respond(res, status, value) {
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Cache-Control": "no-store",
  });

  res.end(JSON.stringify(value));
}

function rpcError(res, status, code, message) {
  return respond(res, status, {
    code,
    message,
    details: null,
    hint: null,
  });
}

function validPhonePair(restaurantPhone, guestPhone) {
  return (
    typeof restaurantPhone === "string" &&
    typeof guestPhone === "string" &&
    E164.test(restaurantPhone) &&
    E164.test(guestPhone) &&
    restaurantPhone !== guestPhone
  );
}

function pairKey(restaurantPhone, guestPhone) {
  return `${restaurantPhone}:${guestPhone}`;
}

async function readJson(req) {
  const chunks = [];
  let size = 0;

  try {
    for await (const chunk of req) {
      size += chunk.length;

      if (size > MAX_BODY_BYTES) {
        return {
          ok: false,
          status: 413,
        };
      }

      chunks.push(chunk);
    }

    return {
      ok: true,
      value: JSON.parse(
        Buffer.concat(chunks).toString("utf8"),
      ),
    };
  } catch {
    return {
      ok: false,
      status: 400,
    };
  }
}

function objectOnly(value) {
  return (
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value)
  );
}

function validScenario(value) {
  if (!objectOnly(value)) {
    return false;
  }

  if (
    !validPhonePair(
      value.restaurantPhone,
      value.guestPhone,
    )
  ) {
    return false;
  }

  if (
    value.legacyStatus !== null &&
    !LEGACY_STATUSES.has(value.legacyStatus)
  ) {
    return false;
  }

  if (
    value.sharedMode !== null &&
    !SHARED_MODES.has(value.sharedMode)
  ) {
    return false;
  }

  for (const field of [
    "legacyError",
    "sharedError",
    "recordingError",
    "staffActivated",
  ]) {
    if (typeof value[field] !== "boolean") {
      return false;
    }
  }

  if (value.reservationReference !== undefined && value.reservationReference !== null && typeof value.reservationReference !== "string") return false;
  if (value.reservationId !== undefined && !UUID.test(value.reservationId)) return false;
  if (value.conversationId !== undefined && !UUID.test(value.conversationId)) return false;
  if (value.extraReservation !== undefined &&
      (!objectOnly(value.extraReservation) ||
       !UUID.test(value.extraReservation.id ?? "") ||
       typeof value.extraReservation.reference !== "string" ||
       !/^[A-Z]{2}-\d{6}-\d{3,8}$/.test(value.extraReservation.reference))) return false;
  if (value.scopedConversationId !== undefined && !UUID.test(value.scopedConversationId)) return false;
  if (value.scopedReservationId !== undefined && !UUID.test(value.scopedReservationId)) return false;

  // Optional delay controls preserve compatibility with all existing
  // scenarios. Delays apply only when explicitly supplied.
  for (const field of [
    "legacyDelayMs",
    "sharedDelayMs",
    "recordingDelayMs",
    "recordingResponseDelayMs",
  ]) {
    if (!validDelay(value[field])) {
      return false;
    }
  }

  return true;
}

function validRouteRpc(value) {
  return (
    objectOnly(value) &&
    Object.keys(value).length === 2 &&
    validPhonePair(
      value.p_restaurant_phone,
      value.p_guest_phone,
    )
  );
}

function validRecordingRpc(value) {
  if (
    !objectOnly(value) ||
    Object.keys(value).length !== 6 ||
    !UUID.test(value.p_reservation_id ?? "") ||
    !UUID.test(value.p_conversation_id ?? "") ||
    !validPhonePair(
      value.p_restaurant_phone,
      value.p_guest_phone,
    ) ||
    typeof value.p_twilio_message_sid !== "string" ||
    !MESSAGE_SID.test(value.p_twilio_message_sid) ||
    typeof value.p_message_created_at !== "string"
  ) {
    return false;
  }

  const date = new Date(value.p_message_created_at);

  return (
    Number.isFinite(date.getTime()) &&
    date.toISOString() === value.p_message_created_at &&
    date.getTime() <= Date.now() + 300000
  );
}

function phoneFilter(raw) {
  if (
    typeof raw !== "string" ||
    !raw.startsWith("eq.")
  ) {
    return null;
  }

  const phone = raw.slice(3);

  return E164.test(phone) ? phone : null;
}

function getScenario(restaurantPhone, guestPhone) {
  return scenarios.get(
    pairKey(restaurantPhone, guestPhone),
  );
}

function resetState() {
  scenarios.clear();
  inboundEvents.clear();

  for (const key of Object.keys(counters)) {
    counters[key] = 0;
  }
}

const server = http.createServer(
  async (req, res) => {
    const url = new URL(
      req.url ?? "/",
      `http://${HOST}:${PORT}`,
    );

    // ====================================================
    // TEST CONTROL: RESET
    // ====================================================

    if (
      req.method === "POST" &&
      url.pathname === "/__test/reset"
    ) {
      resetState();

      return respond(res, 200, {
        success: true,
      });
    }

    // ====================================================
    // TEST CONTROL: CONFIGURE SCENARIO
    // ====================================================

    if (
      req.method === "POST" &&
      url.pathname === "/__test/scenario"
    ) {
      const body = await readJson(req);

      if (!body.ok) {
        return rpcError(
          res,
          body.status,
          "TEST_INPUT",
          "Invalid test body",
        );
      }

      if (!validScenario(body.value)) {
        return rpcError(
          res,
          400,
          "TEST_SCENARIO",
          "Invalid test scenario",
        );
      }

      const scenario = {
        ...body.value,
      };

      scenarios.set(
        pairKey(
          scenario.restaurantPhone,
          scenario.guestPhone,
        ),
        scenario,
      );

      return respond(res, 200, {
        success: true,
      });
    }

    // ====================================================
    // TEST CONTROL: COUNTERS
    // ====================================================

    if (
      req.method === "GET" &&
      url.pathname === "/__test/state"
    ) {
      return respond(res, 200, {
        ...counters,
        eventCount: inboundEvents.size,
        events: [...inboundEvents.values()],
      });
    }

    // ====================================================
    // LEGACY OWNERSHIP LOOKUP
    // ====================================================

    if (
      req.method === "GET" &&
      url.pathname ===
        "/rest/v1/reservation_conversation_ownership"
    ) {
      counters.legacyLookups++;

      const restaurantPhone = phoneFilter(
        url.searchParams.get("restaurant_phone"),
      );

      const guestPhone = phoneFilter(
        url.searchParams.get("guest_phone"),
      );

      if (
        !restaurantPhone ||
        !guestPhone ||
        restaurantPhone === guestPhone
      ) {
        return rpcError(
          res,
          400,
          "PGRST100",
          "Invalid phone filters",
        );
      }

      const scenario = getScenario(
        restaurantPhone,
        guestPhone,
      );

      // Delay before the ownership response; cancellation must
      // prevent the caller from proceeding to later operations.
      await sleep(scenario?.legacyDelayMs ?? 0);

      if (scenario?.legacyError) {
        return rpcError(
          res,
          503,
          "PGRST500",
          "Simulated legacy lookup failure",
        );
      }

      if (
        !scenario ||
        scenario.legacyStatus === null
      ) {
        return respond(res, 200, null);
      }

      return respond(res, 200, {
        ownership_status: scenario.legacyStatus,
      });
    }

    // ====================================================
    // SHARED CONVERSATION ROUTING LOOKUP
    // ====================================================

    if (
      req.method === "POST" &&
      url.pathname ===
        "/rest/v1/rpc/get_reservation_shared_conversation_route"
    ) {
      counters.sharedLookups++;

      const body = await readJson(req);

      if (!body.ok || !validRouteRpc(body.value)) {
        return rpcError(
          res,
          400,
          "22023",
          "Invalid shared route lookup",
        );
      }

      const scenario = getScenario(
        body.value.p_restaurant_phone,
        body.value.p_guest_phone,
      );

      await sleep(scenario?.sharedDelayMs ?? 0);

      if (scenario?.sharedError) {
        return rpcError(
          res,
          503,
          "PGRST500",
          "Simulated shared lookup failure",
        );
      }

      if (
        !scenario ||
        scenario.sharedMode === null
      ) {
        return respond(res, 200, []);
      }

      return respond(res, 200, [
        {
          mode: scenario.sharedMode,
        },
      ]);
    }

    // ====================================================
    // RESERVATION CANDIDATES — trusted phone-filtered lookup
    // ====================================================
    if (req.method === "GET" && url.pathname === "/rest/v1/reservation_requests") {
      counters.reservationLookups++;
      const guestPhone = phoneFilter(url.searchParams.get("customer_phone"));
      if (!guestPhone) return rpcError(res, 400, "PGRST100", "Invalid guest phone filter");
      const matching = [...scenarios.values()].filter(s => s.guestPhone === guestPhone);
      if (matching.length === 0) return respond(res, 200, []);
      const scenario = matching[0];
      if (scenario.reservationError) return rpcError(res, 503, "PGRST500", "Reservation lookup unavailable");
      const reservationId = scenario.reservationId ?? RESERVATION_ID;
      const reference = scenario.reservationReference === undefined ? RESERVATION_REFERENCE : scenario.reservationReference;
      const rows = [{
        id: reservationId, customer_phone: guestPhone,
        request_status: "pending", twilio_execution_sid: EXECUTION_SID,
        reservation_reference: reference,
      }];
      if (scenario.extraReservation) {
        rows.push({
          id: scenario.extraReservation.id,
          customer_phone: guestPhone,
          request_status: "pending",
          twilio_execution_sid: `FN${"f".repeat(32)}`,
          reservation_reference: scenario.extraReservation.reference,
        });
      }
      return respond(res, 200, rows);
    }

    // ====================================================
    // RESERVATION-SCOPED READ-ONLY LOOKUP
    // ====================================================
    if (req.method === "POST" && url.pathname === "/rest/v1/rpc/get_reservation_shared_conversation_for_inbound") {
      counters.scopedLookups++;
      const body = await readJson(req);
      if (!body.ok || !objectOnly(body.value) || Object.keys(body.value).length !== 3 ||
          !UUID.test(body.value.p_reservation_id ?? "") ||
          !validPhonePair(body.value.p_restaurant_phone, body.value.p_guest_phone)) {
        return rpcError(res, 400, "22023", "Invalid scoped lookup");
      }
      const scenario = getScenario(body.value.p_restaurant_phone, body.value.p_guest_phone);
      if (!scenario || body.value.p_reservation_id !== (scenario.reservationId ?? RESERVATION_ID)) return respond(res, 200, []);
      if (scenario.scopedError) return rpcError(res, 503, "PGRST500", "Scoped lookup unavailable");
      if (scenario.sharedMode === null) return respond(res, 200, []);
      return respond(res, 200, [{
        conversation_id: scenario.scopedConversationId ?? scenario.conversationId ?? CONVERSATION_ID,
        reservation_id: scenario.scopedReservationId ?? scenario.reservationId ?? RESERVATION_ID,
        conversation_mode: scenario.sharedMode,
        staff_activated: scenario.staffActivated,
      }]);
    }

    // ====================================================
    // STAFF-ONLY INBOUND RECORDING RPC
    // ====================================================

    if (
      req.method === "POST" &&
      url.pathname ===
        "/rest/v1/rpc/record_reservation_shared_inbound"
    ) {
      // Increment before validation so that rejected
      // requests are distinguishable from requests
      // that never reached the recording RPC.

      counters.recordingAttempts++;

      const body = await readJson(req);

      if (!body.ok || !validRecordingRpc(body.value)) {
        return rpcError(
          res,
          400,
          "22023",
          "Invalid inbound recording arguments",
        );
      }

      const {
        p_restaurant_phone: restaurantPhone,
        p_guest_phone: guestPhone,
        p_twilio_message_sid: messageSid,
        p_message_created_at: createdAt,
        p_reservation_id: reservationId,
        p_conversation_id: conversationId,
      } = body.value;

      const scenario = getScenario(
        restaurantPhone,
        guestPhone,
      );

      // Simulate an RPC that has not yet committed. Whether a
      // real PostgreSQL request is cancelled is not established
      // by this in-memory mock.
      await sleep(scenario?.recordingDelayMs ?? 0);

      if (scenario?.recordingError) {
        return rpcError(
          res,
          503,
          "PGRST500",
          "Simulated recording failure",
        );
      }

      // Match the review-only RPC's staff-mode
      // authorization contract.
      //
      // This is a simulation, not proof of real
      // PostgreSQL locking or permissions.

      if (
        !scenario ||
        scenario.sharedMode !== "staff" ||
        !scenario.staffActivated ||
        reservationId !== (scenario.reservationId ?? RESERVATION_ID) ||
        conversationId !== (scenario.conversationId ?? CONVERSATION_ID)
      ) {
        return rpcError(
          res,
          409,
          "55000",
          "Verified staff conversation required",
        );
      }

      const previous = inboundEvents.get(messageSid);

      if (previous) {
        if (
          previous.restaurantPhone !== restaurantPhone ||
          previous.guestPhone !== guestPhone ||
          previous.messageCreatedAt !== createdAt ||
          previous.reservationId !== reservationId ||
          previous.conversationId !== conversationId
        ) {
          return rpcError(
            res,
            400,
            "22023",
            "Inbound SID replay mismatch",
          );
        }

        counters.duplicateReplays++;

        await sleep(scenario?.recordingResponseDelayMs ?? 0);

        return respond(res, 200, [
          {
            conversation_id: previous.conversationId,
            inbound_event_id: previous.eventId,
            duplicate: true,
            conversation_mode: "staff",
          },
        ]);
      }

      const eventId = inboundEvents.size === 0
        ? EVENT_ID
        : `22222222-2222-4222-8222-${String(
            inboundEvents.size + 1,
          ).padStart(12, "0")}`;

      const event = {
        conversationId,
        reservationId,
        eventId,
        restaurantPhone,
        guestPhone,
        messageSid,
        messageCreatedAt: createdAt,
      };

      inboundEvents.set(messageSid, event);
      counters.successfulInserts++;

      // Delay only the response AFTER the simulated commit.
      // This deliberately models an ambiguous client timeout:
      // the caller may stop waiting while the event persists.
      await sleep(scenario?.recordingResponseDelayMs ?? 0);

      return respond(res, 200, [
        {
          conversation_id: conversationId,
          inbound_event_id: eventId,
          duplicate: false,
          conversation_mode: "staff",
        },
      ]);
    }

    // ====================================================
    // DENY DIRECT SHARED TABLE ACCESS
    // ====================================================

    if (
      url.pathname ===
        "/rest/v1/reservation_shared_conversations" ||
      url.pathname ===
        "/rest/v1/reservation_shared_inbound_events"
    ) {
      return rpcError(
        res,
        403,
        "42501",
        "Permission denied",
      );
    }

    // Never silently accept unknown requests.

    return rpcError(
      res,
      404,
      "PGRST404",
      "Mock endpoint not available",
    );
  },
);

server.listen(PORT, HOST, () => {
  console.log(
    `Shared inbound mock listening on http://${HOST}:${PORT}`,
  );

  console.log(
    "In-memory test-only service. No production database.",
  );
});