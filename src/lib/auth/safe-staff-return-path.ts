
const DEFAULT_STAFF_RETURN_PATH = "/staff/reservations";

const UUID_PATTERN =
  "[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}";

const STAFF_DETAIL_PATH_PATTERN = new RegExp(
  `^/staff/(?:reservations|conversations)/${UUID_PATTERN}$`,
  "i",
);

const STAFF_GUEST_CONVERSATION_PATTERN = new RegExp(
  `^/staff/conversations/guest/${UUID_PATTERN}$`,
  "i",
);

const STAFF_INDEX_PATHS = new Set([
  "/staff/reservations",
  "/staff/conversations",
]);

export function safeStaffReturnPath(
  value: unknown,
): string {
  if (typeof value !== "string") {
    return DEFAULT_STAFF_RETURN_PATH;
  }

  if (STAFF_INDEX_PATHS.has(value)) {
    return value;
  }

  if (STAFF_DETAIL_PATH_PATTERN.test(value)) {
    return value;
  }

  if (STAFF_GUEST_CONVERSATION_PATTERN.test(value)) {
    return value;
  }

  return DEFAULT_STAFF_RETURN_PATH;
}
