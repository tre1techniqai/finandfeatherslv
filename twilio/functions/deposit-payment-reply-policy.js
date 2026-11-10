
"use strict";

// Fin & Feathers Las Vegas — deposit invoice reply policy.
// This policy is PURE. The caller MUST first verify an outstanding deposit
// invoice notification associated with the exact reservation conversation.
// It does not send SMS, update deposit status, or create staff alerts.

const DEFAULT_ASSISTANCE_REPLY =
  "Questions or concerns? No worries, a member of our staff will contact you directly to assist.";

const CONTROL_COMMAND =
  /^(?:STOP|STOPALL|UNSUBSCRIBE|CANCEL|END|QUIT|START|UNSTOP|HELP|INFO)\s*[.!]?$/i;

const PAID_WORD = /\bpaid\b/i;

// A statement denying completion must never be treated as proof of payment.
// Keep ambiguity on the staff-assistance path rather than assuming payment.
const NEGATED_PAID = [
  /\b(?:not|never|no|haven['’]?t|hasn['’]?t|hadn['’]?t|didn['’]?t|wasn['’]?t|isn['’]?t|aren['’]?t)\b[\s\S]{0,60}\bpaid\b/i,
  /\b(?:unpaid|not\s+yet\s+paid)\b/i,
  /\bpaid\b[\s\S]{0,25}\b(?:not\s+yet|no|never)\b/i,
];

function classifyDepositPaymentReply(body) {
  if (typeof body !== "string" || body.length === 0 || body.length > 4000) {
    return { kind: "ignore", reason: "INVALID_BODY" };
  }

  const normalized = body.trim();

  if (!normalized) {
    return { kind: "ignore", reason: "EMPTY_BODY" };
  }

  if (CONTROL_COMMAND.test(normalized)) {
    return { kind: "ignore", reason: "MESSAGING_CONTROL" };
  }

  if (
    PAID_WORD.test(normalized) &&
    !NEGATED_PAID.some((pattern) => pattern.test(normalized))
  ) {
    return {
      kind: "payment_claim",
      reason: "PAID_RECOGNIZED",
    };
  }

  return {
    kind: "assistance",
    reason: "NO_COMPLETED_PAYMENT_CLAIM",
    reply: DEFAULT_ASSISTANCE_REPLY,
  };
}

module.exports = {
  DEFAULT_ASSISTANCE_REPLY,
  classifyDepositPaymentReply,
};