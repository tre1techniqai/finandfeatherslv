import http from "node:http";

const HOST = "127.0.0.1";
const PORT = 4318;

const E164 = /^\+[1-9]\d{7,14}$/;

const MAX_SCENARIO_BYTES = 4096;
const MAX_RPC_BYTES = 4096;
const MAX_TEST_RECORDS = 10;

const ALLOWED_STATUSES = new Set([
  "automation",
  "handoff_pending",
  "staff",
  "released",
]);

const ALLOWED_MODES = new Set([
  "automation",
  "transitioning_to_staff",
  "staff",
]);

const scenarios = new Map();

function respond(res, status, value) {
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Cache-Control": "no-store",
  });

  res.end(JSON.stringify(value));
}

async function readJsonBody(req, maxBytes) {
  let raw = "";
  let byteLength = 0;

  try {
    for await (const chunk of req) {
      byteLength += chunk.length;

      if (byteLength > maxBytes) {
        return {
          success: false,
          status: 413,
        };
      }

      raw += chunk.toString("utf8");
    }

    return {
      success: true,
      value: JSON.parse(raw),
    };
  } catch {
    return {
      success: false,
      status: 400,
    };
  }
}

function isRecord(value) {
  return (
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value)
  );
}

function validStatusList(values) {
  return (
    Array.isArray(values) &&
    values.length <= MAX_TEST_RECORDS &&
    values.every((value) =>
      ALLOWED_STATUSES.has(value)
    )
  );
}

function validModeList(values) {
  return (
    Array.isArray(values) &&
    values.length <= MAX_TEST_RECORDS &&
    values.every((value) =>
      ALLOWED_MODES.has(value)
    )
  );
}

function parseScenario(value) {
  if (!isRecord(value)) {
    return null;
  }

  const {
    guestPhone,
    restaurantPhone,
    legacyStatus,
    sharedMode,
    legacyStatuses,
    sharedModes,
    legacyError,
    sharedError,
  } = value;

  if (
    typeof guestPhone !== "string" ||
    typeof restaurantPhone !== "string" ||
    !E164.test(guestPhone) ||
    !E164.test(restaurantPhone) ||
    guestPhone === restaurantPhone
  ) {
    return null;
  }

  // Accept the original single-status test format
  // to preserve existing integration scenarios.
  //
  // New tests may supply legacyStatuses instead.

  let resolvedLegacyStatuses;

  if (legacyStatuses !== undefined) {
    if (
      legacyStatus !== undefined ||
      !validStatusList(legacyStatuses)
    ) {
      return null;
    }

    resolvedLegacyStatuses = [...legacyStatuses];
  } else {
    if (
      legacyStatus !== null &&
      !ALLOWED_STATUSES.has(legacyStatus)
    ) {
      return null;
    }

    resolvedLegacyStatuses =
      legacyStatus === null
        ? []
        : [legacyStatus];
  }

  // Preserve the original sharedMode format.
  //
  // New tests may supply sharedModes to simulate
  // multiple reservations sharing a phone pair.

  let resolvedSharedModes;

  if (sharedModes !== undefined) {
    if (
      sharedMode !== undefined ||
      !validModeList(sharedModes)
    ) {
      return null;
    }

    resolvedSharedModes = [...sharedModes];
  } else {
    if (
      sharedMode !== null &&
      !ALLOWED_MODES.has(sharedMode)
    ) {
      return null;
    }

    resolvedSharedModes =
      sharedMode === null
        ? []
        : [sharedMode];
  }

  if (
    legacyError !== undefined &&
    typeof legacyError !== "boolean"
  ) {
    return null;
  }

  if (
    sharedError !== undefined &&
    typeof sharedError !== "boolean"
  ) {
    return null;
  }

  return {
    guestPhone,
    restaurantPhone,
    legacyStatuses: resolvedLegacyStatuses,
    sharedModes: resolvedSharedModes,
    legacyError: legacyError === true,
    sharedError: sharedError === true,
  };
}

function getPhoneFilter(value) {
  if (
    typeof value !== "string" ||
    !value.startsWith("eq.")
  ) {
    return null;
  }

  const phone = value.slice(3);

  return E164.test(phone) ? phone : null;
}

function scenarioKey(
  restaurantPhone,
  guestPhone,
) {
  return `${restaurantPhone}:${guestPhone}`;
}

function validRpcParameters(value) {
  if (!isRecord(value)) {
    return false;
  }

  const keys = Object.keys(value);

  return (
    keys.length === 2 &&
    keys.includes("p_restaurant_phone") &&
    keys.includes("p_guest_phone") &&
    typeof value.p_restaurant_phone === "string" &&
    typeof value.p_guest_phone === "string" &&
    E164.test(value.p_restaurant_phone) &&
    E164.test(value.p_guest_phone) &&
    value.p_restaurant_phone !== value.p_guest_phone
  );
}

function getLimit(value) {
  if (value === null) {
    return null;
  }

  if (!/^[1-9]\d*$/.test(value)) {
    return -1;
  }

  const limit = Number(value);

  if (!Number.isSafeInteger(limit)) {
    return -1;
  }

  return limit;
}

const server = http.createServer(
  async (req, res) => {
    const url = new URL(
      req.url,
      `http://${HOST}:${PORT}`,
    );

    // --------------------------------------------------
    // 1. TEST SCENARIO CONFIGURATION
    //
    // Local test server only.
    // No production Supabase connection.
    // --------------------------------------------------

    if (
      req.method === "POST" &&
      url.pathname === "/__test/scenario"
    ) {
      const body = await readJsonBody(
        req,
        MAX_SCENARIO_BYTES,
      );

      if (!body.success) {
        return respond(res, body.status, {
          error:
            body.status === 413
              ? "Scenario too large"
              : "Invalid JSON",
        });
      }

      const parsed = parseScenario(body.value);

      if (!parsed) {
        return respond(res, 400, {
          error: "Invalid test scenario",
        });
      }

      scenarios.set(
        scenarioKey(
          parsed.restaurantPhone,
          parsed.guestPhone,
        ),
        parsed,
      );

      return respond(res, 200, {
        success: true,
      });
    }

    // --------------------------------------------------
    // 2. SHARED CONVERSATION ROUTING RPC
    //
    // Mirrors the deployed RETURNS TABLE(mode text).
    //
    // Multiple shared conversations return multiple
    // rows, even when they share one phone pair.
    // --------------------------------------------------

    if (
      req.method === "POST" &&
      url.pathname ===
        "/rest/v1/rpc/get_reservation_shared_conversation_route"
    ) {
      const body = await readJsonBody(
        req,
        MAX_RPC_BYTES,
      );

      if (!body.success) {
        return respond(res, body.status, {
          code: "PGRST100",
          message: "Invalid RPC request body",
        });
      }

      if (!validRpcParameters(body.value)) {
        return respond(res, 400, {
          code: "22023",
          message:
            "Invalid shared conversation routing parameters",
        });
      }

      const {
        p_restaurant_phone: restaurantPhone,
        p_guest_phone: guestPhone,
      } = body.value;

      const scenario = scenarios.get(
        scenarioKey(
          restaurantPhone,
          guestPhone,
        ),
      );

      if (scenario?.sharedError) {
        return respond(res, 503, {
          code: "PGRST500",
          message: "Simulated database failure",
        });
      }

      if (!scenario) {
        return respond(res, 200, []);
      }

      const rows = scenario.sharedModes.map(
        (mode) => ({
          mode,
        }),
      );

      return respond(res, 200, rows);
    }

    // --------------------------------------------------
    // 3. LEGACY OWNERSHIP REST LOOKUP
    //
    // Updated to match:
    //
    // .select("ownership_status")
    // .eq("guest_phone", ...)
    // .eq("restaurant_phone", ...)
    // .limit(2)
    //
    // A regular PostgREST SELECT returns an array.
    //
    // The revised Next.js router must reject multiple
    // matching legacy ownership records.
    // --------------------------------------------------

    if (
      req.method === "GET" &&
      url.pathname ===
        "/rest/v1/reservation_conversation_ownership"
    ) {
      const guestPhone = getPhoneFilter(
        url.searchParams.get("guest_phone"),
      );

      const restaurantPhone = getPhoneFilter(
        url.searchParams.get("restaurant_phone"),
      );

      if (
        !guestPhone ||
        !restaurantPhone
      ) {
        return respond(res, 400, {
          code: "PGRST100",
          message: "Invalid phone filters",
        });
      }

      const scenario = scenarios.get(
        scenarioKey(
          restaurantPhone,
          guestPhone,
        ),
      );

      if (scenario?.legacyError) {
        return respond(res, 503, {
          code: "PGRST500",
          message: "Simulated database failure",
        });
      }

      const rows = scenario
        ? scenario.legacyStatuses.map(
            (ownership_status) => ({
              ownership_status,
            }),
          )
        : [];

      // Respect the PostgREST limit parameter.
      //
      // The production router requests two records,
      // sufficient to detect an ambiguous lookup.

      const limit = getLimit(
        url.searchParams.get("limit"),
      );

      if (limit === -1) {
        return respond(res, 400, {
          code: "PGRST100",
          message: "Invalid limit",
        });
      }

      const result =
        limit === null
          ? rows
          : rows.slice(0, limit);

      return respond(res, 200, result);
    }

    // --------------------------------------------------
    // 4. SHARED TABLE ACCESS PROTECTION
    //
    // Preserve the existing test behavior:
    // no direct service-role REST SELECT access.
    //
    // The router must use the trusted shared RPC.
    // --------------------------------------------------

    if (
      url.pathname ===
      "/rest/v1/reservation_shared_conversations"
    ) {
      return respond(res, 403, {
        code: "42501",
        message: "Permission denied",
      });
    }

    // --------------------------------------------------
    // 5. UNKNOWN MOCK REQUEST
    // --------------------------------------------------

    return respond(res, 404, {
      code: "PGRST404",
      message: "Mock endpoint not available",
    });
  },
);

server.listen(PORT, HOST, () => {
  console.log(
    `Mock Supabase listening on http://${HOST}:${PORT}`,
  );

  console.log(
    "Test-only database. No production connection.",
  );

  console.log(
    "Legacy multi-row and shared multi-row scenarios supported.",
  );
});