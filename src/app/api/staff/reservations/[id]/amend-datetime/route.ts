
import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

const MAX_BODY_BYTES = 8192;

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const TIME_PATTERN =
  /^(10|11|12|13|14|15|16|17|18|19|20|21):(?:00|30)$|^22:00$/;

type RouteContext = {
  params: Promise<{ id: string }>;
};

type AmendmentRequest = {
  expectedDate: string;
  expectedTime: string;
  newDate: string;
  newTime: string;
  yelpBookingUpdated: boolean;
};

type AmendmentResult = {
  reservation_id: string;
  reservation_date: string;
  reservation_time: string;
  workflow_status: string;
};

const ALLOWED_FIELDS = new Set([
  "expectedDate",
  "expectedTime",
  "newDate",
  "newTime",
  "yelpBookingUpdated",
]);

function jsonError(
  message: string,
  status: number,
) {
  return NextResponse.json(
    {
      success: false,
      error: message,
    },
    {
      status,
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}

function hasValidOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");

  if (!origin) return false;

  try {
    const source = new URL(origin);
    const target = new URL(request.url);

    return (
      source.origin === target.origin &&
      (
        source.protocol === "https:" ||
        source.hostname === "localhost" ||
        source.hostname === "127.0.0.1"
      )
    );
  } catch {
    return false;
  }
}

function isPlainObject(
  value: unknown,
): value is Record<string, unknown> {
  return (
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value)
  );
}

function isValidDate(value: unknown): value is string {
  if (
    typeof value !== "string" ||
    !DATE_PATTERN.test(value)
  ) {
    return false;
  }

  const [year, month, day] = value
    .split("-")
    .map(Number);

  if (
    year < 2000 ||
    year > 9999 ||
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > 31
  ) {
    return false;
  }

  const parsed = new Date(
    Date.UTC(year, month - 1, day),
  );

  return (
    parsed.getUTCFullYear() === year &&
    parsed.getUTCMonth() === month - 1 &&
    parsed.getUTCDate() === day
  );
}

function isValidTime(value: unknown): value is string {
  return (
    typeof value === "string" &&
    TIME_PATTERN.test(value)
  );
}

function validateAmendment(
  value: unknown,
): AmendmentRequest | null {
  if (!isPlainObject(value)) {
    return null;
  }

  const keys = Object.keys(value);

  if (
    keys.length !== ALLOWED_FIELDS.size ||
    keys.some((key) => !ALLOWED_FIELDS.has(key))
  ) {
    return null;
  }

  if (
    !isValidDate(value.expectedDate) ||
    !isValidTime(value.expectedTime) ||
    !isValidDate(value.newDate) ||
    !isValidTime(value.newTime) ||
    typeof value.yelpBookingUpdated !== "boolean"
  ) {
    return null;
  }

  if (
    value.expectedDate === value.newDate &&
    value.expectedTime === value.newTime
  ) {
    return null;
  }

  return {
    expectedDate: value.expectedDate,
    expectedTime: value.expectedTime,
    newDate: value.newDate,
    newTime: value.newTime,
    yelpBookingUpdated: value.yelpBookingUpdated,
  };
}

async function readLimitedJson(
  request: Request,
): Promise<unknown> {
  const declaredLength =
    request.headers.get("content-length");

  if (declaredLength !== null) {
    const length = Number(declaredLength);

    if (
      !Number.isSafeInteger(length) ||
      length < 0 ||
      length > MAX_BODY_BYTES
    ) {
      throw new Error("INVALID_BODY_SIZE");
    }
  }

  if (!request.body) {
    throw new Error("INVALID_BODY");
  }

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();

      if (done) break;

      totalBytes += value.byteLength;

      if (totalBytes > MAX_BODY_BYTES) {
        await reader.cancel();
        throw new Error("INVALID_BODY_SIZE");
      }

      chunks.push(value);
    }

    const bytes = new Uint8Array(totalBytes);
    let offset = 0;

    for (const chunk of chunks) {
      bytes.set(chunk, offset);
      offset += chunk.byteLength;
    }

    const decoded = new TextDecoder("utf-8", {
      fatal: true,
    }).decode(bytes);

    return JSON.parse(decoded) as unknown;
  } finally {
    reader.releaseLock();
  }
}

export async function POST(
  request: Request,
  context: RouteContext,
) {
  // Fail closed until database concurrency safeguards
  // and authenticated functional tests are complete.
  if (
    process.env.RESERVATION_DATETIME_AMENDMENTS_ENABLED !==
    "true"
  ) {
    return jsonError(
      "Reservation date/time editing is not enabled.",
      503,
    );
  }

  if (!hasValidOrigin(request)) {
    return jsonError(
      "Request origin is not authorized.",
      403,
    );
  }

  const { id } = await context.params;

  if (!UUID_PATTERN.test(id)) {
    return jsonError(
      "Invalid reservation ID.",
      400,
    );
  }

  const supabase =
    await createSupabaseServerClient();

  const { data: claimsData, error: claimsError } =
    await supabase.auth.getClaims();

  const userId = claimsData?.claims?.sub;

  if (claimsError || !userId) {
    return jsonError(
      "Authentication required.",
      401,
    );
  }

  const { data: staffRole, error: roleError } =
    await supabase
      .from("staff_roles")
      .select("role, is_active")
      .eq("user_id", userId)
      .eq("is_active", true)
      .maybeSingle();

  if (
    roleError ||
    !staffRole ||
    staffRole.is_active !== true ||
    !["manager", "reservation_agent"].includes(staffRole.role)
  ) {
    return jsonError(
      "Active reservation staff authorization required.",
      403,
    );
  }

  const contentType =
    request.headers.get("content-type") ?? "";

  if (
    !/^application\/json(?:\s*;|$)/i.test(
      contentType,
    )
  ) {
    return jsonError(
      "JSON request body required.",
      415,
    );
  }

  let parsed: unknown;

  try {
    parsed = await readLimitedJson(request);
  } catch (error) {
    return jsonError(
      error instanceof Error &&
        error.message === "INVALID_BODY_SIZE"
        ? "Request body exceeds the allowed size."
        : "Invalid JSON request.",
      error instanceof Error &&
        error.message === "INVALID_BODY_SIZE"
        ? 413
        : 400,
    );
  }

  const amendment = validateAmendment(parsed);

  if (!amendment) {
    return jsonError(
      "Invalid reservation date/time amendment.",
      400,
    );
  }

  const { data, error } = await supabase.rpc(
    "amend_reservation_datetime",
    {
      p_reservation_id: id,
      p_expected_date: amendment.expectedDate,
      p_expected_time: amendment.expectedTime,
      p_new_date: amendment.newDate,
      p_new_time: amendment.newTime,
      p_yelp_booking_updated:
        amendment.yelpBookingUpdated,
    },
  );

  if (error) {
    if (error.code === "42501") {
      return jsonError(
        "Active reservation staff authorization required.",
        403,
      );
    }

    if (error.code === "P0002") {
      return jsonError(
        "Reservation not found.",
        404,
      );
    }

    if (error.code === "22023") {
      return jsonError(
        "The amendment could not be completed. Refresh the reservation and review its status, date/time, and any existing alternative offers.",
        409,
      );
    }

    if (error.code === "54000") {
      return jsonError(
        "Reservation activity limit reached. Contact an administrator.",
        409,
      );
    }

    console.error(
      "Reservation date/time amendment failed:",
      {
        reservationId: id,
        errorCode: error.code,
      },
    );

    return jsonError(
      "Unable to update reservation date/time.",
      500,
    );
  }

  const result: unknown =
    Array.isArray(data) ? data[0] : data;

  if (
    !isPlainObject(result) ||
    result.reservation_id !== id ||
    typeof result.reservation_date !== "string" ||
    typeof result.reservation_time !== "string" ||
    typeof result.workflow_status !== "string"
  ) {
    return jsonError(
      "Reservation amendment result could not be verified. Refresh the reservation before attempting another change.",
      500,
    );
  }

  const verifiedResult =
    result as AmendmentResult;

  return NextResponse.json(
    {
      success: true,
      reservation: verifiedResult,
      message:
        "Reservation date/time updated. No SMS was sent.",
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}