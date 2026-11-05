
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isReservationStaffRole } from "@/lib/auth/require-reservation-staff";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const MAX_BODY_BYTES = 2048;

type RouteContext = {
  params: Promise<{ id: string }>;
};

function jsonResponse(
  data: unknown,
  status = 200,
) {
  return NextResponse.json(data, {
    status,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

function jsonError(
  message: string,
  status: number,
) {
  return jsonResponse(
    {
      success: false,
      error: message,
    },
    status,
  );
}

function hasValidOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");

  if (!origin) {
    return false;
  }

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

function createAdminClient() {
  const url =
    process.env.SUPABASE_URL ??
    process.env.NEXT_PUBLIC_SUPABASE_URL;

  const key =
    process.env.SUPABASE_SECRET_KEY ??
    process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Privileged Supabase configuration is missing.",
    );
  }

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

async function readLimitedJson(
  request: Request,
): Promise<
  | { success: true; value: unknown }
  | {
      success: false;
      message: string;
      status: number;
    }
> {
  const declaredLength =
    request.headers.get("content-length");

  if (declaredLength !== null) {
    const length = Number(declaredLength);

    if (
      !Number.isSafeInteger(length) ||
      length < 0
    ) {
      return {
        success: false,
        message: "Invalid Content-Length header.",
        status: 400,
      };
    }

    if (length > MAX_BODY_BYTES) {
      return {
        success: false,
        message: "Request body exceeds 2 KB.",
        status: 413,
      };
    }
  }

  if (!request.body) {
    return {
      success: false,
      message: "JSON request body required.",
      status: 400,
    };
  }

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        break;
      }

      totalBytes += value.byteLength;

      if (totalBytes > MAX_BODY_BYTES) {
        await reader.cancel();

        return {
          success: false,
          message: "Request body exceeds 2 KB.",
          status: 413,
        };
      }

      chunks.push(value);
    }

    const bytes = new Uint8Array(totalBytes);
    let offset = 0;

    for (const chunk of chunks) {
      bytes.set(chunk, offset);
      offset += chunk.byteLength;
    }

    const parsed: unknown = JSON.parse(
      new TextDecoder("utf-8", {
        fatal: true,
      }).decode(bytes),
    );

    return {
      success: true,
      value: parsed,
    };
  } catch {
    return {
      success: false,
      message: "Invalid JSON request.",
      status: 400,
    };
  } finally {
    reader.releaseLock();
  }
}

function parseLastSeenNoteId(
  value: unknown,
): string | null {
  if (
    typeof value !== "object" ||
    value === null ||
    Array.isArray(value)
  ) {
    return null;
  }

  const record = value as Record<string, unknown>;

  if (
    Object.keys(record).length !== 1 ||
    typeof record.lastSeenNoteId !== "string" ||
    !UUID_PATTERN.test(record.lastSeenNoteId)
  ) {
    return null;
  }

  return record.lastSeenNoteId;
}

export async function POST(
  request: Request,
  context: RouteContext,
) {
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

  const supabase = await createSupabaseServerClient();

  const {
    data: claimsData,
    error: claimsError,
  } = await supabase.auth.getClaims();

  const userId = claimsData?.claims?.sub;

  if (claimsError || !userId) {
    return jsonError(
      "Authentication required.",
      401,
    );
  }

  const {
    data: staffRole,
    error: roleError,
  } = await supabase
    .from("staff_roles")
    .select("role, is_active")
    .eq("user_id", userId)
    .eq("is_active", true)
    .maybeSingle();

  if (
    roleError ||
    !staffRole ||
    staffRole.is_active !== true ||
    !isReservationStaffRole(staffRole.role)
  ) {
    return jsonError(
      "Active reservation staff access required.",
      403,
    );
  }

  const {
    data: reservation,
    error: reservationError,
  } = await supabase
    .from("reservation_requests")
    .select("id")
    .eq("id", id)
    .maybeSingle();

  if (reservationError) {
    console.error(
      "Staff note read reservation lookup failed:",
      {
        code: reservationError.code,
        reservationId: id,
      },
    );

    return jsonError(
      "Unable to verify reservation.",
      500,
    );
  }

  if (!reservation) {
    return jsonError(
      "Reservation not found.",
      404,
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

  const parsed = await readLimitedJson(request);

  if (!parsed.success) {
    return jsonError(
      parsed.message,
      parsed.status,
    );
  }

  const lastSeenNoteId =
    parseLastSeenNoteId(parsed.value);

  if (!lastSeenNoteId) {
    return jsonError(
      "A valid lastSeenNoteId is required.",
      400,
    );
  }

  // Verify that this note exists inside the
  // authorized reservation.
  //
  // The browser cannot supply its own timestamp.
  const {
    data: lastSeenNote,
    error: noteError,
  } = await supabase
    .from("reservation_staff_notes")
    .select("id, created_at")
    .eq("id", lastSeenNoteId)
    .eq("reservation_request_id", id)
    .maybeSingle();

  if (noteError) {
    console.error(
      "Staff note read target lookup failed:",
      {
        code: noteError.code,
        reservationId: id,
      },
    );

    return jsonError(
      "Unable to verify note.",
      500,
    );
  }

  if (!lastSeenNote) {
    return jsonError(
      "Note not found in this reservation.",
      404,
    );
  }

  const acknowledgedAt =
    lastSeenNote.created_at;

  if (
    typeof acknowledgedAt !== "string" ||
    !Number.isFinite(
      Date.parse(acknowledgedAt),
    )
  ) {
    return jsonError(
      "Note timestamp is invalid.",
      500,
    );
  }

  let admin;

  try {
    admin = createAdminClient();
  } catch {
    console.error(
      "Staff note read service is not configured.",
    );

    return jsonError(
      "Staff notes service is unavailable.",
      503,
    );
  }

  // Insert a first-time read position without
  // overwriting an existing staff member's position.
  const {
    error: insertError,
  } = await admin
    .from("reservation_staff_note_reads")
    .upsert(
      {
        reservation_request_id: id,
        user_id: userId,
        last_read_at: acknowledgedAt,
      },
      {
        onConflict: "reservation_request_id,user_id",
        ignoreDuplicates: true,
      },
    );

  if (insertError) {
    console.error(
      "Staff note read initialization failed:",
      {
        code: insertError.code,
        reservationId: id,
      },
    );

    return jsonError(
      "Unable to acknowledge staff note.",
      500,
    );
  }

  // Only advance the read position.
  // Concurrent older acknowledgments cannot move it
  // backward because the comparison occurs in SQL.
  const {
    error: updateError,
  } = await admin
    .from("reservation_staff_note_reads")
    .update({
      last_read_at: acknowledgedAt,
    })
    .eq("reservation_request_id", id)
    .eq("user_id", userId)
    .or(
      `last_read_at.is.null,last_read_at.lt.${acknowledgedAt}`,
    );

  if (updateError) {
    console.error(
      "Staff note read update failed:",
      {
        code: updateError.code,
        reservationId: id,
      },
    );

    return jsonError(
      "Unable to update staff note read status.",
      500,
    );
  }

  const {
    data: readPosition,
    error: readError,
  } = await admin
    .from("reservation_staff_note_reads")
    .select("last_read_at")
    .eq("reservation_request_id", id)
    .eq("user_id", userId)
    .single();

  if (readError || !readPosition) {
    console.error(
      "Staff note read verification failed:",
      {
        code: readError?.code ?? null,
        reservationId: id,
      },
    );

    return jsonError(
      "Unable to verify staff note read status.",
      500,
    );
  }

  return jsonResponse({
    success: true,
    reservationId: id,
    lastReadAt: readPosition.last_read_at,
  });
}