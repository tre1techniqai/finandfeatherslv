

import http from "node:http";

const HOST = "127.0.0.1";
const PORT = 4318;

const E164 = /^\+[1-9]\d{7,14}$/;
const MAX_SCENARIO_BYTES = 4096;
const MAX_RPC_BYTES = 4096;

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

function parseScenario(value) {
  if (
    !value ||
    typeof value !== "object" ||
    Array.isArray(value)
  ) {
    return null;
  }

  const {
    guestPhone,
    restaurantPhone,
    legacyStatus,
    sharedMode,
    legacyError,
    sharedError,
  } = value;

  if (
    !E164.test(guestPhone ?? "") ||
    !E164.test(restaurantPhone ?? "") ||
    guestPhone === restaurantPhone
  ) {
    return null;
  }

  if (
    legacyStatus !== null &&
    !ALLOWED_STATUSES.has(legacyStatus)
  ) {
    return null;
  }

  if (
    sharedMode !== null &&
    !ALLOWED_MODES.has(sharedMode)
  ) {
    return null;
  }

  return {
    guestPhone,
    restaurantPhone,
    legacyStatus,
    sharedMode,
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
  if (
    !value ||
    typeof value !== "object" ||
    Array.isArray(value)
  ) {
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

const server = http.createServer(
  async (req, res) => {
    const url = new URL(
      req.url,
      `http://${HOST}:${PORT}`,
    );

    // Test-only scenario configuration.
    // No production database connection.
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

    // Trusted shared conversation routing RPC.
    //
    // Mirrors the RETURNS TABLE(mode text)
    // PostgreSQL function's JSON response.
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
          message: "Invalid shared conversation routing parameters",
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

      // Zero rows returned by the SQL function.
      if (!scenario || scenario.sharedMode === null) {
        return respond(res, 200, []);
      }

      // RETURNS TABLE(mode text) produces an
      // array of result objects through PostgREST.
      return respond(res, 200, [
        {
          mode: scenario.sharedMode,
        },
      ]);
    }

    // Legacy ownership REST lookup remains intact.
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

      if (!guestPhone || !restaurantPhone) {
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

      if (!scenario) {
        return respond(res, 200, null);
      }

      if (scenario.legacyError) {
        return respond(res, 503, {
          code: "PGRST500",
          message: "Simulated database failure",
        });
      }

      if (scenario.legacyStatus === null) {
        return respond(res, 200, null);
      }

      return respond(res, 200, {
        ownership_status: scenario.legacyStatus,
      });
    }

    // Match the intended production permission
    // contract: no direct service-role SELECT
    // access to the shared conversation table.
    if (
      url.pathname ===
      "/rest/v1/reservation_shared_conversations"
    ) {
      return respond(res, 403, {
        code: "42501",
        message: "Permission denied",
      });
    }

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
});
