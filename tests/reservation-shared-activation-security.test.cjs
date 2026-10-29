const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");

const ROOT = path.resolve(__dirname, "..");

const ROUTE = path.join(
  ROOT,
  "src/app/api/staff/reservations/[id]/conversation/shared-activate/route.ts"
);

const ORIGIN_HELPER = path.join(
  ROOT,
  "src/lib/reservations/shared-activation-origin.ts"
);

const RESERVATION =
  "11111111-1111-4111-8111-111111111111";

const CONVERSATION =
  "22222222-2222-4222-8222-222222222222";

const MANAGER =
  "33333333-3333-4333-8333-333333333333";

const RESTAURANT = "+15555550100";
const GUEST = "+15555550101";

const BASE =
  "https://finandfeatherslv.live";

const ENDPOINT =
  `${BASE}/api/staff/reservations/${RESERVATION}/conversation/shared-activate`;

const READ_RPC =
  "get_reservation_shared_transition_preflight";

const FLAGS = [
  "RESERVATION_SHARED_SMS_ROUTING_ENABLED",
  "RESERVATION_STUDIO_STAFF_ROUTING_ENABLED",
  "RESERVATION_STUDIO_HANDOFF_FENCE_ENABLED",
  "RESERVATION_STAFF_INBOUND_ROUTING_VERIFIED",
  "RESERVATION_SHARED_SMS_INBOUND_RECORDING_ENABLED",
  "RESERVATION_STUDIO_STAFF_INBOUND_BRIDGE_ENABLED",
  "RESERVATION_SHARED_SMS_ACTIVATION_VERIFIED",
];

function compile(file) {
  const source = fs.readFileSync(file, "utf8");

  return ts.transpileModule(source, {
    fileName: file,
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      esModuleInterop: true,
    },
  }).outputText;
}

const routeSource = compile(ROUTE);
const originSource = compile(ORIGIN_HELPER);

function preflight(overrides = {}) {
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

function loadModule(source, mocks) {
  const module = { exports: {} };

  const sandbox = {
    module,
    exports: module.exports,
    Request,
    Response,
    URL,
    Buffer,
    AbortSignal,
    process: {
      env: mocks.env,
    },
    console: {
      error() {},
      warn() {},
      info() {},
      log() {},
    },
    fetch() {
      throw new Error(
        "External network access is forbidden in this test."
      );
    },
    require(name) {
      if (!Object.hasOwn(mocks.modules, name)) {
        throw new Error(
          `Unexpected module dependency: ${name}`
        );
      }

      return mocks.modules[name];
    },
  };

  vm.runInNewContext(source, sandbox, {
    timeout: 3000,
  });

  return module.exports;
}

function createHarness(options = {}) {
  const activity = {
    authCalls: 0,
    roleCalls: 0,
    rpcCalls: [],
    forbiddenCalls: [],
  };

  const env = {
    SUPABASE_URL: "http://127.0.0.1:1",
    NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:1",
    SUPABASE_SECRET_KEY: "synthetic-only",
    TWILIO_FROM_NUMBER: RESTAURANT,
  };

  for (const flag of FLAGS) {
    env[flag] =
      options.allFlags === true ? "true" : "false";
  }

  const authClient = {
    auth: {
      async getClaims() {
        activity.authCalls++;

        if (options.authError) {
          return {
            data: null,
            error: new Error("Synthetic auth failure"),
          };
        }

        if (options.unauthenticated) {
          return {
            data: { claims: null },
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
      activity.roleCalls++;

      if (table !== "staff_roles") {
        activity.forbiddenCalls.push(table);
        throw new Error(
          `Unexpected table: ${table}`
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
          if (options.roleError) {
            return {
              data: null,
              error: new Error("Synthetic role failure"),
            };
          }

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

  const adminClient = {
    async rpc(name, args) {
      activity.rpcCalls.push({ name, args });

      if (name !== READ_RPC) {
        activity.forbiddenCalls.push(name);

        throw new Error(
          `State-changing or unexpected RPC: ${name}`
        );
      }

      if (options.rpcError) {
        return {
          data: null,
          error: {
            code: "TEST_RPC_ERROR",
          },
        };
      }

      return {
        data:
          options.preflightData !== undefined
            ? options.preflightData
            : [preflight(options.preflightOverrides)],
        error: null,
      };
    },

    from(table) {
      activity.forbiddenCalls.push(
        `admin.from:${table}`
      );

      throw new Error(
        "Direct administrative table access is forbidden."
      );
    },
  };

  const modules = {
    "next/server": {
      NextResponse: {
        json(data, config = {}) {
          return Response.json(data, config);
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
  };

  const originModule = loadModule(
    originSource,
    { env, modules }
  );

  modules[
    "@/lib/reservations/shared-activation-origin"
  ] = originModule;

  const route = loadModule(
    routeSource,
    { env, modules }
  );

  assert.equal(
    typeof route.POST,
    "function",
    "The route must export POST."
  );

  async function execute({
    url = ENDPOINT,
    origin = BASE,
    reservationId = RESERVATION,
    body = {
      conversationId: CONVERSATION,
      expectedModeVersion: 1,
    },
    contentType = "application/json",
  } = {}) {
    const headers = {};

    if (origin !== null) {
      headers.origin = origin;
    }

    if (contentType !== null) {
      headers["content-type"] = contentType;
    }

    const request = new Request(url, {
      method: "POST",
      headers,
      body:
        typeof body === "string"
          ? body
          : JSON.stringify(body),
    });

    const response = await route.POST(
      request,
      {
        params: Promise.resolve({
          id: reservationId,
        }),
      }
    );

    const data = await response.json();

    return {
      status: response.status,
      data,
    };
  }

  function assertNoMutations() {
    assert.deepEqual(
      activity.forbiddenCalls,
      [],
      "No forbidden database operation may occur."
    );

    for (const call of activity.rpcCalls) {
      assert.equal(
        call.name,
        READ_RPC,
        "Only the protected read-only preflight RPC is permitted."
      );
    }
  }

  return {
    execute,
    activity,
    assertNoMutations,
  };
}

test("01 - Missing Origin is rejected", async () => {
  const h = createHarness();

  const result = await h.execute({
    origin: null,
  });

  assert.equal(result.status, 403);
  assert.equal(result.data.activationAuthorized, false);
  assert.equal(h.activity.authCalls, 0);

  h.assertNoMutations();
});

test("02 - Cross-origin request is rejected", async () => {
  const h = createHarness();

  const result = await h.execute({
    origin: "https://example.com",
  });

  assert.equal(result.status, 403);
  assert.equal(h.activity.authCalls, 0);

  h.assertNoMutations();
});

test("03 - Unauthenticated request is rejected", async () => {
  const h = createHarness({
    unauthenticated: true,
  });

  const result = await h.execute();

  assert.equal(result.status, 401);
  assert.equal(result.data.activationAuthorized, false);
  assert.equal(h.activity.rpcCalls.length, 0);

  h.assertNoMutations();
});

test("04 - Authentication failure is rejected", async () => {
  const h = createHarness({
    authError: true,
  });

  const result = await h.execute();

  assert.equal(result.status, 401);

  h.assertNoMutations();
});

test("05 - Non-manager is rejected", async () => {
  const h = createHarness({
    role: "staff",
  });

  const result = await h.execute();

  assert.equal(result.status, 403);
  assert.equal(h.activity.rpcCalls.length, 0);

  h.assertNoMutations();
});

test("06 - Inactive staff account is rejected", async () => {
  const h = createHarness({
    inactive: true,
  });

  const result = await h.execute();

  assert.equal(result.status, 403);

  h.assertNoMutations();
});

test("07 - Invalid reservation ID is rejected", async () => {
  const h = createHarness();

  const result = await h.execute({
    reservationId: "not-a-uuid",
  });

  assert.equal(result.status, 400);
  assert.equal(h.activity.authCalls, 0);

  h.assertNoMutations();
});

test("08 - Malformed JSON is rejected", async () => {
  const h = createHarness();

  const result = await h.execute({
    body: "{bad-json",
  });

  assert.equal(result.status, 400);
  assert.equal(h.activity.rpcCalls.length, 0);

  h.assertNoMutations();
});

test("09 - Extra request fields are rejected", async () => {
  const h = createHarness();

  const result = await h.execute({
    body: {
      conversationId: CONVERSATION,
      expectedModeVersion: 1,
      activate: true,
    },
  });

  assert.equal(result.status, 400);

  h.assertNoMutations();
});

test("10 - Incorrect conversation association is rejected", async () => {
  const h = createHarness({
    preflightOverrides: {
      conversation_id:
        "44444444-4444-4444-8444-444444444444",
    },
  });

  const result = await h.execute();

  assert.equal(result.status, 409);

  h.assertNoMutations();
});

test("11 - Stale mode version is rejected", async () => {
  const h = createHarness({
    preflightOverrides: {
      mode_version: 2,
    },
  });

  const result = await h.execute();

  assert.equal(result.status, 409);

  h.assertNoMutations();
});

test("12 - Ambiguous association is rejected", async () => {
  const h = createHarness({
    preflightOverrides: {
      matching_conversation_count: 2,
    },
  });

  const result = await h.execute();

  assert.equal(result.status, 409);

  h.assertNoMutations();
});

test("13 - Protected RPC failure is rejected", async () => {
  const h = createHarness({
    rpcError: true,
  });

  const result = await h.execute();

  assert.equal(result.status, 503);

  h.assertNoMutations();
});

test("14 - Missing preflight result is rejected", async () => {
  const h = createHarness({
    preflightData: [],
  });

  const result = await h.execute();

  assert.equal(result.status, 409);

  h.assertNoMutations();
});

test("15 - Valid manager request remains read-only", async () => {
  const h = createHarness();

  const result = await h.execute();

  assert.equal(result.status, 200);
  assert.equal(result.data.success, true);

  assert.equal(result.data.activationAuthorized, false);
  assert.equal(result.data.databaseChanged, false);
  assert.equal(result.data.studioExecutionsChanged, false);
  assert.equal(result.data.smsSent, false);

  assert.equal(result.data.configurationReady, false);

  assert.equal(h.activity.rpcCalls.length, 1);

  h.assertNoMutations();
});

test("16 - All flags enabled still cannot activate", async () => {
  const h = createHarness({
    allFlags: true,
  });

  const result = await h.execute();

  assert.equal(result.status, 200);
  assert.equal(result.data.configurationReady, true);

  assert.equal(
    result.data.operationalVerificationComplete,
    false
  );

  assert.equal(result.data.activationAuthorized, false);
  assert.equal(result.data.databaseChanged, false);
  assert.equal(result.data.studioExecutionsChanged, false);
  assert.equal(result.data.smsSent, false);

  assert.equal(h.activity.rpcCalls.length, 1);

  h.assertNoMutations();
});

test("17 - Unsupported content type is rejected", async () => {
  const h = createHarness();

  const result = await h.execute({
    contentType: "text/plain",
  });

  assert.equal(result.status, 415);

  h.assertNoMutations();
});

test("18 - Non-automation mode is rejected", async () => {
  const h = createHarness({
    preflightOverrides: {
      conversation_mode: "staff",
    },
  });

  const result = await h.execute();

  assert.equal(result.status, 409);

  h.assertNoMutations();
});