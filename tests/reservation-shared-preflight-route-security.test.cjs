const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");

const ROOT = path.resolve(__dirname, "..");

const ROUTE = path.join(
  ROOT,
  "src/app/api/staff/reservations/[id]/conversation/shared-preflight/route.ts"
);

const HELPER = path.join(
  ROOT,
  "src/lib/reservations/shared-studio-execution-reconciliation.ts"
);

const PLANNER = path.join(
  ROOT,
  "src/lib/reservations/shared-staff-handoff-plan.ts"
);

const RESERVATION =
  "11111111-1111-4111-8111-111111111111";

const CONVERSATION =
  "22222222-2222-4222-8222-222222222222";

const MANAGER =
  "33333333-3333-4333-8333-333333333333";

const GUEST = "+17025550123";
const RESTAURANT = "+17255550123";

const ACCOUNT = "AC" + "1".repeat(32);
const FLOW = "FW" + "2".repeat(32);

const EXPECTED_CHECKS = [
  "shared_conversation_association",
  "shared_automation_mode",
  "legacy_ownership_clear",
  "reservation_phone_unambiguous",
  "shared_phone_pair_unambiguous",
  "studio_flow_published",
  "studio_active_execution_scan",
];

// --------------------------------------------------
// 1. Compile TypeScript modules for isolated testing.
// --------------------------------------------------

function compile(file) {
  return ts.transpileModule(
    fs.readFileSync(file, "utf8"),
    {
      fileName: file,
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
        esModuleInterop: true,
      },
    }
  ).outputText;
}

// --------------------------------------------------
// 2. Load a module with controlled dependencies.
//
// No real Supabase or Twilio network access.
// --------------------------------------------------

function loadModule(source, modules, env) {
  const module = { exports: {} };

  const context = {
    module,
    exports: module.exports,
    Request,
    Response,
    URL,
    Buffer,
    AbortSignal,
    Set,
    Map,

    process: {
      env,
    },

    console: {
      log() {},
      info() {},
      warn() {},
      error() {},
    },

    fetch() {
      throw new Error(
        "External HTTP access is forbidden."
      );
    },

    require(name) {
      if (!Object.hasOwn(modules, name)) {
        throw new Error(
          `Unexpected dependency: ${name}`
        );
      }

      return modules[name];
    },
  };

  vm.runInNewContext(source, context, {
    timeout: 3000,
  });

  return module.exports;
}

// --------------------------------------------------
// 3. Synthetic reservation conversation data.
// --------------------------------------------------

function sharedRow(overrides = {}) {
  return {
    conversation_id: CONVERSATION,
    reservation_request_id: RESERVATION,
    guest_phone: GUEST,
    restaurant_phone: RESTAURANT,
    conversation_mode: "automation",
    mode_version: 1,
    matching_conversation_count: 1,
    association_valid: true,
    ...overrides,
  };
}

function execution(character, overrides = {}) {
  return {
    sid: "FN" + character.repeat(32),
    flowSid: FLOW,
    status: "active",
    contactChannelAddress: GUEST,
    ...overrides,
  };
}

// --------------------------------------------------
// 4. Build isolated route execution harness.
// --------------------------------------------------

function createHarness(options = {}) {
  const activity = {
    authCalls: 0,
    tables: [],
    rpcCalls: [],
    flowFetches: 0,
    executionScans: 0,
    forbidden: [],
  };

  const env = {
    SUPABASE_URL: "http://127.0.0.1:1",
    NEXT_PUBLIC_SUPABASE_URL:
      "http://127.0.0.1:1",
    SUPABASE_SECRET_KEY:
      "synthetic-service-key",
    TWILIO_FROM_NUMBER: RESTAURANT,
    TWILIO_ACCOUNT_SID: ACCOUNT,
    TWILIO_AUTH_TOKEN:
      "synthetic-twilio-token",
    TWILIO_STUDIO_FLOW_SID: FLOW,
  };

  // --------------------------------------------------
  // Manager-authenticated Supabase client.
  // --------------------------------------------------

  const authClient = {
    auth: {
      async getClaims() {
        activity.authCalls++;

        if (options.unauthenticated) {
          return {
            data: null,
            error: null,
          };
        }

        return {
          data: {
            claims: {
              sub: MANAGER,
            },
          },
          error: null,
        };
      },
    },

    from(table) {
      if (table !== "staff_roles") {
        activity.forbidden.push(table);

        throw new Error(
          "Unexpected authentication table."
        );
      }

      const query = {
        select() {
          return query;
        },

        eq() {
          return query;
        },

        async maybeSingle() {
          return {
            data: {
              role: options.role ?? "manager",
              is_active:
                options.inactive !== true,
            },
            error: null,
          };
        },
      };

      return query;
    },
  };

  // --------------------------------------------------
  // Synthetic service-role Supabase client.
  //
  // Only expected read-only tables and RPCs
  // are permitted.
  // --------------------------------------------------

  const adminClient = {
    from(table) {
      activity.tables.push(table);

      const allowed = [
        "reservation_requests",
        "reservation_conversation_ownership",
      ];

      if (!allowed.includes(table)) {
        activity.forbidden.push(table);

        throw new Error(
          `Unauthorized database table: ${table}`
        );
      }

      const filters = {};

      const query = {
        select() {
          return query;
        },

        eq(field, value) {
          filters[field] = value;
          return query;
        },

        async maybeSingle() {
          if (
            table !== "reservation_requests" ||
            filters.id !== RESERVATION
          ) {
            activity.forbidden.push(
              `maybeSingle:${table}`
            );

            throw new Error(
              "Unexpected reservation query."
            );
          }

          if (options.reservationMissing) {
            return {
              data: null,
              error: null,
            };
          }

          return {
            data: {
              id: RESERVATION,
              customer_phone: GUEST,
            },
            error: null,
          };
        },

        async limit(value) {
          assert.equal(value, 2);

          if (
            table ===
            "reservation_conversation_ownership"
          ) {
            return {
              data:
                options.legacyRows ?? [],
              error: null,
            };
          }

          if (
            table === "reservation_requests" &&
            filters.customer_phone === GUEST
          ) {
            return {
              data:
                options.matchingReservations ??
                [{ id: RESERVATION }],
              error: null,
            };
          }

          activity.forbidden.push(
            `limit:${table}`
          );

          throw new Error(
            "Unexpected database list query."
          );
        },
      };

      return query;
    },

    async rpc(name, args) {
      activity.rpcCalls.push({
        name,
        args,
      });

      if (
        name !==
        "get_reservation_shared_transition_preflight"
      ) {
        activity.forbidden.push(name);

        throw new Error(
          "State-changing RPC is forbidden."
        );
      }

      if (options.rpcError) {
        return {
          data: null,
          error: {
            code: "SYNTHETIC_RPC_ERROR",
          },
        };
      }

      return {
        data:
          options.rpcData ??
          [sharedRow(options.sharedOverrides)],
        error: null,
      };
    },
  };

  // --------------------------------------------------
  // Synthetic Twilio SDK.
  //
  // Supports only:
  // - Flow fetch
  // - Active execution list
  //
  // No SMS or execution mutation methods.
  // --------------------------------------------------

  function twilioMock(accountSid, authToken) {
    assert.equal(accountSid, ACCOUNT);

    assert.equal(
      authToken,
      env.TWILIO_AUTH_TOKEN
    );

    return {
      studio: {
        v2: {
          flows(sid) {
            assert.equal(sid, FLOW);

            return {
              async fetch() {
                activity.flowFetches++;

                return {
                  sid: FLOW,
                  status:
                    options.published === false
                      ? "draft"
                      : "published",
                };
              },

              executions: {
                async list(argumentsObject) {
                  activity.executionScans++;

                  assert.equal(
                    argumentsObject.status,
                    "active"
                  );

                  assert.equal(
                    argumentsObject.limit,
                    1000
                  );

                  return options.executions ?? [];
                },
              },
            };
          },
        },
      },
    };
  }

  // --------------------------------------------------
  // 5. Register mocked application dependencies.
  // --------------------------------------------------

  const modules = {
    "next/server": {
      NextResponse: {
        json(payload, config = {}) {
          return Response.json(
            payload,
            config
          );
        },
      },
    },

    "@supabase/supabase-js": {
      createClient() {
        return adminClient;
      },
    },

    "@/lib/supabase/server": {
      async createSupabaseServerClient() {
        return authClient;
      },
    },

    twilio: twilioMock,
  };

  // --------------------------------------------------
  // Load the centralized Studio reconciliation helper.
  // --------------------------------------------------

  const helper = loadModule(
    compile(HELPER),
    modules,
    env
  );

  modules[
    "@/lib/reservations/shared-studio-execution-reconciliation"
  ] = helper;

  // --------------------------------------------------
  // Load the pure read-only handoff planner.
  // --------------------------------------------------

  const planner = loadModule(
    compile(PLANNER),
    modules,
    env
  );

  modules[
    "@/lib/reservations/shared-staff-handoff-plan"
  ] = planner;

  // --------------------------------------------------
  // Load the actual Next.js preflight route.
  // --------------------------------------------------

  const route = loadModule(
    compile(ROUTE),
    modules,
    env
  );

  assert.equal(
    typeof route.GET,
    "function",
    "Shared preflight must export a GET handler."
  );

  // --------------------------------------------------
  // 6. Execute the real route using synthetic inputs.
  // --------------------------------------------------

  async function execute(
    reservationId = RESERVATION
  ) {
    const request = new Request(
      `https://finandfeatherslv.live/api/staff/reservations/${reservationId}/conversation/shared-preflight`
    );

    const response = await route.GET(
      request,
      {
        params: Promise.resolve({
          id: reservationId,
        }),
      }
    );

    return {
      status: response.status,
      data: await response.json(),
    };
  }

  // --------------------------------------------------
  // 7. Assert no state-changing operations occurred.
  // --------------------------------------------------

  function assertReadOnly() {
    assert.equal(
      activity.forbidden.length,
      0,
      "No forbidden operations may occur."
    );

    for (const call of activity.rpcCalls) {
      assert.equal(
        call.name,
        "get_reservation_shared_transition_preflight"
      );
    }
  }

  // --------------------------------------------------
  // 8. Validate successful diagnostic responses.
  //
  // IMPORTANT:
  // The result argument belongs to this function.
  // These assertions must not execute during
  // createHarness() initialization.
  // --------------------------------------------------

  function assertSafeResponse(result) {
    assert.equal(
      result.status,
      200
    );

    assert.equal(
      result.data.success,
      true
    );

    // Existing read-only response flags.

    assert.equal(
      result.data.activationAuthorized,
      false
    );

    assert.equal(
      result.data.smsSent,
      false
    );

    assert.equal(
      result.data.studioExecutionsChanged,
      false
    );

    assert.equal(
      result.data.databaseChanged,
      false
    );

    // New handoff planner response object.

    assert.ok(
      result.data.handoffPlan,
      "Handoff plan must be present."
    );

    assert.equal(
      result.data.handoffPlan.eligible,
      false
    );

    assert.equal(
      result.data.handoffPlan.activationAuthorized,
      false
    );

    assert.equal(
      result.data.handoffPlan.databaseChanged,
      false
    );

    assert.equal(
      result.data.handoffPlan.studioExecutionsChanged,
      false
    );

    assert.equal(
      result.data.handoffPlan.smsSent,
      false
    );

    assert.equal(
      result.data.handoffPlan.requiresOutboundMessageReconciliation,
      true
    );

    assert.equal(
      result.data.handoffPlan.requiresRoutingFenceVerification,
      true
    );

    // Exactly seven existing diagnostic checks.

    assert.equal(
      result.data.checks.length,
      7
    );

    assert.deepEqual(
      result.data.checks.map(
        (check) => check.name
      ),
      EXPECTED_CHECKS
    );

    // No duplicate Studio execution scans.

    assert.equal(
      activity.executionScans <= 1,
      true
    );

    assertReadOnly();
  }

  // --------------------------------------------------
  // 9. Expose the harness to individual test cases.
  // --------------------------------------------------

  return {
    execute,
    activity,
    assertSafeResponse,
    assertReadOnly,
  };
}

// --------------------------------------------------
// 10. Studio diagnostic lookup.
// --------------------------------------------------

function studioCheck(result) {
  return result.data.checks.find(
    (check) =>
      check.name ===
      "studio_active_execution_scan"
  );
}

// ==================================================
// ENDPOINT-LEVEL REGRESSION TESTS
// ==================================================

test(
  "01 - Published Flow with no executions passes",
  async () => {
    const h = createHarness();

    const result = await h.execute();

    h.assertSafeResponse(result);

    assert.equal(
      result.data.checksPassed,
      true
    );

    assert.equal(
      result.data.activeStudioExecutions,
      0
    );

    assert.equal(
      studioCheck(result).passed,
      true
    );

    assert.equal(
      h.activity.executionScans,
      1
    );
  }
);

test(
  "02 - Active guest execution fails preflight",
  async () => {
    const h = createHarness({
      executions: [
        execution("a"),
      ],
    });

    const result = await h.execute();

    h.assertSafeResponse(result);

    assert.equal(
      result.data.checksPassed,
      false
    );

    assert.equal(
      result.data.activeStudioExecutions,
      1
    );

    assert.equal(
      studioCheck(result).passed,
      false
    );
  }
);

test(
  "03 - Unrelated execution is excluded",
  async () => {
    const h = createHarness({
      executions: [
        execution("a", {
          contactChannelAddress:
            "+17025550999",
        }),
      ],
    });

    const result = await h.execute();

    h.assertSafeResponse(result);

    assert.equal(
      result.data.checksPassed,
      true
    );

    assert.equal(
      result.data.activeStudioExecutions,
      0
    );
  }
);

test(
  "04 - Incomplete scan fails closed",
  async () => {
    const h = createHarness({
      executions: Array.from(
        { length: 1000 },
        (_, index) =>
          execution("a", {
            contactChannelAddress:
              "+17025550999",
            sid:
              "FN" +
              index
                .toString(16)
                .padStart(32, "0"),
          })
      ),
    });

    const result = await h.execute();

    h.assertSafeResponse(result);

    assert.equal(
      result.data.checksPassed,
      false
    );

    assert.equal(
      result.data.activeStudioExecutions,
      null
    );

    assert.equal(
      studioCheck(result).passed,
      false
    );
  }
);

test(
  "05 - Invalid execution identity fails closed",
  async () => {
    const h = createHarness({
      executions: [
        execution("a", {
          flowSid:
            "FW" + "3".repeat(32),
        }),
      ],
    });

    const result = await h.execute();

    h.assertSafeResponse(result);

    assert.equal(
      result.data.checksPassed,
      false
    );

    assert.equal(
      result.data.activeStudioExecutions,
      null
    );
  }
);

test(
  "06 - Unpublished Flow fails closed",
  async () => {
    const h = createHarness({
      published: false,
    });

    const result = await h.execute();

    h.assertSafeResponse(result);

    assert.equal(
      result.data.checksPassed,
      false
    );

    assert.equal(
      result.data.activeStudioExecutions,
      null
    );

    assert.equal(
      h.activity.executionScans,
      0
    );

    assert.equal(
      result.data.handoffPlan.reason,
      "STUDIO_FLOW_NOT_VERIFIED"
    );
  }
);

test(
  "07 - Missing shared association fails",
  async () => {
    const h = createHarness({
      sharedOverrides: {
        association_valid: false,
      },
    });

    const result = await h.execute();

    h.assertSafeResponse(result);

    assert.equal(
      result.data.checksPassed,
      false
    );

    assert.equal(
      result.data.handoffPlan.reason,
      "RESERVATION_OR_OWNERSHIP_BLOCKED"
    );
  }
);

test(
  "08 - Legacy ownership conflict fails",
  async () => {
    const h = createHarness({
      legacyRows: [
        {
          id:
            "44444444-4444-4444-8444-444444444444",
          reservation_request_id:
            RESERVATION,
          ownership_status: "staff",
        },
      ],
    });

    const result = await h.execute();

    h.assertSafeResponse(result);

    assert.equal(
      result.data.checksPassed,
      false
    );

    assert.equal(
      result.data.handoffPlan.reason,
      "RESERVATION_OR_OWNERSHIP_BLOCKED"
    );
  }
);

test(
  "09 - Reservation ambiguity fails",
  async () => {
    const h = createHarness({
      matchingReservations: [
        { id: RESERVATION },
        {
          id:
            "55555555-5555-4555-8555-555555555555",
        },
      ],
    });

    const result = await h.execute();

    h.assertSafeResponse(result);

    assert.equal(
      result.data.checksPassed,
      false
    );

    assert.equal(
      result.data.handoffPlan.reason,
      "RESERVATION_OR_OWNERSHIP_BLOCKED"
    );
  }
);

test(
  "10 - Protected RPC failure returns 503",
  async () => {
    const h = createHarness({
      rpcError: true,
    });

    const result = await h.execute();

    assert.equal(
      result.status,
      503
    );

    h.assertReadOnly();

    assert.equal(
      h.activity.executionScans,
      0
    );
  }
);

test(
  "11 - Non-manager cannot access preflight",
  async () => {
    const h = createHarness({
      role: "staff",
    });

    const result = await h.execute();

    assert.equal(
      result.status,
      403
    );

    assert.equal(
      h.activity.rpcCalls.length,
      0
    );

    assert.equal(
      h.activity.flowFetches,
      0
    );

    h.assertReadOnly();
  }
);

test(
  "12 - Unauthenticated request is rejected",
  async () => {
    const h = createHarness({
      unauthenticated: true,
    });

    const result = await h.execute();

    assert.equal(
      result.status,
      401
    );

    assert.equal(
      h.activity.rpcCalls.length,
      0
    );

    h.assertReadOnly();
  }
);

test(
  "13 - Invalid reservation ID is rejected",
  async () => {
    const h = createHarness();

    const result = await h.execute(
      "invalid"
    );

    assert.equal(
      result.status,
      400
    );

    assert.equal(
      h.activity.authCalls,
      0
    );

    h.assertReadOnly();
  }
);

test(
  "14 - Missing reservation returns 404",
  async () => {
    const h = createHarness({
      reservationMissing: true,
    });

    const result = await h.execute();

    assert.equal(
      result.status,
      404
    );

    assert.equal(
      h.activity.rpcCalls.length,
      0
    );

    h.assertReadOnly();
  }
);

test(
  "15 - Valid preflight never authorizes activation",
  async () => {
    const h = createHarness();

    const result = await h.execute();

    h.assertSafeResponse(result);

    assert.equal(
      result.data.checksPassed,
      true
    );

    assert.equal(
      result.data.activationAuthorized,
      false
    );

    assert.equal(
      h.activity.rpcCalls.length,
      1
    );

    assert.equal(
      h.activity.flowFetches,
      1
    );

    assert.equal(
      h.activity.executionScans,
      1
    );
  }
);

// ==================================================
// NEW HANDOFF PLANNER INTEGRATION TESTS
// ==================================================

test(
  "16 - Clear preflight returns operational fence plan",
  async () => {
    const h = createHarness();

    const result = await h.execute();

    h.assertSafeResponse(result);

    assert.equal(
      result.data.checksPassed,
      true
    );

    assert.equal(
      result.data.handoffPlan.preflightReady,
      true
    );

    assert.equal(
      result.data.handoffPlan.stage,
      "operational_fence_required"
    );

    assert.equal(
      result.data.handoffPlan.reason,
      "OPERATIONAL_FENCE_NOT_VERIFIED"
    );

    assert.equal(
      result.data.handoffPlan.activeExecutionCount,
      0
    );

    assert.equal(
      result.data.handoffPlan.requiresExecutionCancellation,
      false
    );

    assert.equal(
      h.activity.executionScans,
      1
    );
  }
);

test(
  "17 - Active execution produces reconciliation plan",
  async () => {
    const h = createHarness({
      executions: [
        execution("a"),
      ],
    });

    const result = await h.execute();

    h.assertSafeResponse(result);

    assert.equal(
      result.data.handoffPlan.preflightReady,
      false
    );

    assert.equal(
      result.data.handoffPlan.stage,
      "studio_execution_reconciliation"
    );

    assert.equal(
      result.data.handoffPlan.reason,
      "ACTIVE_EXECUTIONS_PRESENT"
    );

    assert.equal(
      result.data.handoffPlan.requiresExecutionCancellation,
      true
    );

    assert.equal(
      result.data.handoffPlan.activeExecutionCount,
      1
    );

    assert.deepEqual(
      result.data.handoffPlan.executionSids,
      ["FN" + "a".repeat(32)]
    );

    assert.equal(
      h.activity.executionScans,
      1
    );
  }
);
