const assert = require("node:assert/strict");
const fs = require("node:fs");
const ts = require("typescript");

const source = fs.readFileSync(
  "src/app/api/reservations/route.ts",
  "utf8"
);

const startMarker = "const result: unknown = data[0];";
const endMarker = "return result as IngestionResult;";

const start = source.indexOf(startMarker);
const end = source.indexOf(endMarker, start);

assert.ok(
  start !== -1 && end > start,
  "API database-result validation block not found."
);

const validation = source.slice(
  start,
  end + endMarker.length
);

const testSource = `
  type IngestionResult = {
    reservation_id: string;
    resulting_status: string;
    reservation_created: boolean;
    notification_created: boolean;
    notification_event_key: string;
  };

  function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" &&
      value !== null && !Array.isArray(value);
  }

  function validate(data: unknown[]) {
    ${validation}
  }

  module.exports = { validate };
`;

const compiled = ts.transpileModule(testSource, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2022
  },
  reportDiagnostics: true
});

assert.equal(
  compiled.diagnostics?.length ?? 0,
  0,
  "TypeScript compilation failed."
);

const moduleMock = { exports: {} };

new Function("module", "exports", compiled.outputText)(
  moduleMock,
  moduleMock.exports
);

const { validate } = moduleMock.exports;

const valid = {
  reservation_id: "a486c8b8-19a6-4731-8519-c0acb5fcde1d",
  resulting_status: "pending",
  reservation_created: true,
  notification_created: true,
  notification_event_key: "TEST:new_reservation:NONE"
};

assert.deepEqual(validate([valid]), valid);
console.log("PASS: Valid database response accepted.");

const invalid = [
  { ...valid, reservation_id: null },
  { ...valid, reservation_id: "invalid" },
  { ...valid, resulting_status: "unknown" },
  { ...valid, reservation_created: "true" },
  { ...valid, notification_created: null },
  { ...valid, notification_event_key: "" },
  null,
  []
];

for (const value of invalid) {
  assert.throws(
    () => validate([value]),
    /Invalid reservation ingestion result/
  );
}

console.log(
  `PASS: ${invalid.length}/${invalid.length} malformed responses rejected.`
);
console.log("PASS: Actual API validation block tested.");
console.log("Database connections: NONE");
console.log("Twilio activity: NONE");