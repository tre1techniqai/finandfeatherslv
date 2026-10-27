import assert from "node:assert/strict";
import test from "node:test";

function decideRoute({
  ownershipStatus,
  fenceEnabled,
  staffRoutingEnabled,
}) {
  if (
    ownershipStatus === null ||
    ownershipStatus === "automation" ||
    ownershipStatus === "released"
  ) {
    return "automation";
  }

  if (ownershipStatus === "handoff_pending") {
    return fenceEnabled ? "block" : "automation";
  }

  if (ownershipStatus === "staff") {
    return staffRoutingEnabled ? "staff" : "block";
  }

  return "block";
}

const cases = [
  {
    name: "Automation-owned conversation",
    ownershipStatus: "automation",
    fenceEnabled: true,
    staffRoutingEnabled: true,
    expected: "automation",
  },
  {
    name: "Pending handoff with fence enabled",
    ownershipStatus: "handoff_pending",
    fenceEnabled: true,
    staffRoutingEnabled: true,
    expected: "block",
  },
  {
    name: "Staff-owned conversation with routing enabled",
    ownershipStatus: "staff",
    fenceEnabled: true,
    staffRoutingEnabled: true,
    expected: "staff",
  },
  {
    name: "Staff-owned conversation with routing disabled",
    ownershipStatus: "staff",
    fenceEnabled: true,
    staffRoutingEnabled: false,
    expected: "block",
  },
  {
    name: "Unknown ownership status",
    ownershipStatus: "unexpected",
    fenceEnabled: true,
    staffRoutingEnabled: true,
    expected: "block",
  },
];

for (const scenario of cases) {
  test(scenario.name, () => {
    const actual = decideRoute(scenario);

    assert.equal(
      actual,
      scenario.expected,
      `Expected ${scenario.expected}, received ${actual}`,
    );
  });
}