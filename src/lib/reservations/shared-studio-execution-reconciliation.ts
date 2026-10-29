const E164 = /^\+[1-9]\d{7,14}$/;
const FLOW_SID = /^FW[0-9a-f]{32}$/i;
const EXECUTION_SID = /^FN[0-9a-f]{32}$/i;

export const SHARED_STUDIO_EXECUTION_SCAN_LIMIT = 1000;

export type StudioExecutionRecord = {
  sid: string;
  flowSid: string;
  status: string;
  contactChannelAddress: string | null;
};

export type StudioExecutionReconciliation =
  | {
      status: "clear";
      executionCount: 0;
      executionSids: [];
    }
  | {
      status: "active";
      executionCount: number;
      executionSids: string[];
    }
  | {
      status: "incomplete" | "invalid" | "unavailable";
      executionCount: null;
      executionSids: [];
    };

export function reconcileSharedStudioExecutions(
  executions: readonly StudioExecutionRecord[] | null,
  guestPhone: string,
  flowSid: string,
): StudioExecutionReconciliation {
  if (
    !E164.test(guestPhone) ||
    !FLOW_SID.test(flowSid) ||
    !Array.isArray(executions)
  ) {
    return {
      status: "invalid",
      executionCount: null,
      executionSids: [],
    };
  }

  if (
    executions.length >=
    SHARED_STUDIO_EXECUTION_SCAN_LIMIT
  ) {
    return {
      status: "incomplete",
      executionCount: null,
      executionSids: [],
    };
  }

  const matches: string[] = [];
  const seen = new Set<string>();

  for (const execution of executions) {
    if (
      !execution ||
      typeof execution !== "object" ||
      typeof execution.contactChannelAddress !== "string" ||
      !E164.test(execution.contactChannelAddress) ||
      typeof execution.sid !== "string" ||
      !EXECUTION_SID.test(execution.sid) ||
      execution.flowSid !== flowSid ||
      execution.status !== "active"
    ) {
      return {
        status: "invalid",
        executionCount: null,
        executionSids: [],
      };
    }

    if (seen.has(execution.sid)) {
      return {
        status: "invalid",
        executionCount: null,
        executionSids: [],
      };
    }

    seen.add(execution.sid);

    if (execution.contactChannelAddress === guestPhone) {
      matches.push(execution.sid);
    }
  }

  if (matches.length === 0) {
    return {
      status: "clear",
      executionCount: 0,
      executionSids: [],
    };
  }

  return {
    status: "active",
    executionCount: matches.length,
    executionSids: matches,
  };
}

export function unavailableSharedStudioExecutions():
  StudioExecutionReconciliation {
  return {
    status: "unavailable",
    executionCount: null,
    executionSids: [],
  };
}