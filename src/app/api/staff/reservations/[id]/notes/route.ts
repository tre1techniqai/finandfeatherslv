
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isReservationStaffRole } from "@/lib/auth/require-reservation-staff";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const MAX_BODY_BYTES = 8192;
const MAX_NOTE_LENGTH = 4000;
const PAGE_SIZE = 50;
const MAX_OFFSET = 10000;

const UNSUPPORTED_CONTROLS =
  /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/u;

type RouteContext = {
  params: Promise<{ id: string }>;
};

type JsonObject = Record<string, unknown>;

type NoteInput = {
  body: string;
  parentNoteId: string | null;
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

function isPlainObject(
  value: unknown,
): value is JsonObject {
  return (
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value)
  );
}

function hasValidOrigin(request: Request) {
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

async function authorizeReservation(
  reservationId: string,
) {
  const supabase = await createSupabaseServerClient();

  const {
    data: claimsData,
    error: claimsError,
  } = await supabase.auth.getClaims();

  const userId = claimsData?.claims?.sub;

  if (claimsError || !userId) {
    return {
      success: false as const,
      response: jsonError(
        "Authentication required.",
        401,
      ),
    };
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
    return {
      success: false as const,
      response: jsonError(
        "Active reservation staff access required.",
        403,
      ),
    };
  }

  const {
    data: reservation,
    error: reservationError,
  } = await supabase
    .from("reservation_requests")
    .select("id")
    .eq("id", reservationId)
    .maybeSingle();

  if (reservationError) {
    console.error(
      "Staff notes reservation lookup failed:",
      {
        code: reservationError.code,
        reservationId,
      },
    );

    return {
      success: false as const,
      response: jsonError(
        "Unable to verify reservation.",
        500,
      ),
    };
  }

  if (!reservation) {
    return {
      success: false as const,
      response: jsonError(
        "Reservation not found.",
        404,
      ),
    };
  }

  return {
    success: true as const,
    supabase,
    userId,
  };
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
        message: "Note request exceeds 8 KB.",
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
          message: "Note request exceeds 8 KB.",
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

    const text = new TextDecoder("utf-8", {
      fatal: true,
    }).decode(bytes);

    return {
      success: true,
      value: JSON.parse(text) as unknown,
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

function validateNoteInput(
  value: unknown,
): NoteInput | null {
  if (!isPlainObject(value)) {
    return null;
  }

  const keys = Object.keys(value);

  if (
    keys.length < 1 ||
    keys.length > 2 ||
    keys.some(
      (key) =>
        key !== "body" &&
        key !== "parentNoteId",
    )
  ) {
    return null;
  }

  if (typeof value.body !== "string") {
    return null;
  }

  const body = value.body.trim();

  if (
    body.length < 1 ||
    body.length > MAX_NOTE_LENGTH ||
    UNSUPPORTED_CONTROLS.test(body)
  ) {
    return null;
  }

  let parentNoteId: string | null = null;

  if (
    value.parentNoteId !== undefined &&
    value.parentNoteId !== null
  ) {
    if (
      typeof value.parentNoteId !== "string" ||
      !UUID_PATTERN.test(value.parentNoteId)
    ) {
      return null;
    }

    parentNoteId = value.parentNoteId;
  }

  return {
    body,
    parentNoteId,
  };
}

export async function GET(
  request: Request,
  context: RouteContext,
) {
  const { id } = await context.params;

  if (!UUID_PATTERN.test(id)) {
    return jsonError(
      "Invalid reservation ID.",
      400,
    );
  }

  const authorization =
    await authorizeReservation(id);

  if (!authorization.success) {
    return authorization.response;
  }

  const { supabase, userId } = authorization;

  const url = new URL(request.url);
  const rawOffset = url.searchParams.get("offset");

  const offset =
    rawOffset === null ? 0 : Number(rawOffset);

  if (
    !Number.isSafeInteger(offset) ||
    offset < 0 ||
    offset > MAX_OFFSET
  ) {
    return jsonError(
      "Invalid notes page offset.",
      400,
    );
  }

  const {
    data: notes,
    count,
    error: notesError,
  } = await supabase
    .from("reservation_staff_notes")
    .select(
      "id,reservation_request_id,parent_note_id,author_user_id,author_email,body,created_at",
      { count: "exact" },
    )
    .eq("reservation_request_id", id)
    .order("created_at", {
      ascending: false,
    })
    .order("id", {
      ascending: false,
    })
    .range(
      offset,
      offset + PAGE_SIZE - 1,
    );

  if (notesError) {
    console.error(
      "Staff notes retrieval failed:",
      {
        code: notesError.code,
        reservationId: id,
      },
    );

    return jsonError(
      "Unable to retrieve staff notes.",
      500,
    );
  }

  const {
    data: readPosition,
    error: readError,
  } = await supabase
    .from("reservation_staff_note_reads")
    .select("last_read_at")
    .eq("reservation_request_id", id)
    .eq("user_id", userId)
    .maybeSingle();

  if (readError) {
    console.error(
      "Staff note read-position lookup failed:",
      {
        code: readError.code,
        reservationId: id,
      },
    );

    return jsonError(
      "Unable to retrieve note read status.",
      500,
    );
  }

  let unreadQuery = supabase
    .from("reservation_staff_notes")
    .select("id", {
      count: "exact",
      head: true,
    })
    .eq("reservation_request_id", id)
    .neq("author_user_id", userId);

  if (readPosition?.last_read_at) {
    unreadQuery = unreadQuery.gt(
      "created_at",
      readPosition.last_read_at,
    );
  }

  const {
    count: unreadCount,
    error: unreadError,
  } = await unreadQuery;

  if (unreadError) {
    console.error(
      "Staff notes unread count failed:",
      {
        code: unreadError.code,
        reservationId: id,
      },
    );

    return jsonError(
      "Unable to retrieve unread note count.",
      500,
    );
  }

  const totalCount = count ?? 0;

  return jsonResponse({
    success: true,
    reservationId: id,
    notes: notes ?? [],
    totalCount,
    unreadCount: unreadCount ?? 0,
    lastReadAt:
      readPosition?.last_read_at ?? null,
    offset,
    pageSize: PAGE_SIZE,
    hasMore:
      offset + (notes?.length ?? 0) <
      totalCount,
  });
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

  const authorization =
    await authorizeReservation(id);

  if (!authorization.success) {
    return authorization.response;
  }

  const { supabase, userId } = authorization;

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

  const noteInput =
    validateNoteInput(parsed.value);

  if (!noteInput) {
    return jsonError(
      "Invalid note. Provide 1–4000 characters and an optional valid parent note ID.",
      400,
    );
  }

  // Obtain the author's verified login email
  // from Supabase Auth, not from browser input.
  const {
    data: userData,
    error: userError,
  } = await supabase.auth.getUser();

  const author = userData.user;
  const authorEmail = author?.email?.trim();

  if (
    userError ||
    !author ||
    author.id !== userId ||
    !authorEmail ||
    authorEmail.length > 254
  ) {
    return jsonError(
      "Unable to verify staff identity.",
      401,
    );
  }

  // Confirm that a reply targets a note
  // belonging to this exact reservation.
  if (noteInput.parentNoteId) {
    const {
      data: parent,
      error: parentError,
    } = await supabase
      .from("reservation_staff_notes")
      .select("id")
      .eq("id", noteInput.parentNoteId)
      .eq("reservation_request_id", id)
      .maybeSingle();

    if (parentError) {
      console.error(
        "Staff note parent lookup failed:",
        {
          code: parentError.code,
          reservationId: id,
        },
      );

      return jsonError(
        "Unable to verify parent note.",
        500,
      );
    }

    if (!parent) {
      return jsonError(
        "Parent note not found in this reservation.",
        404,
      );
    }
  }

  // The authenticated session has been verified.
  // Privileged credentials are used only server-side.
  let admin;

  try {
    admin = createAdminClient();
  } catch {
    console.error(
      "Staff notes privileged client is not configured.",
    );

    return jsonError(
      "Staff notes service is unavailable.",
      503,
    );
  }

  const {
    data: createdNote,
    error: insertError,
  } = await admin
    .from("reservation_staff_notes")
    .insert({
      reservation_request_id: id,
      parent_note_id: noteInput.parentNoteId,
      author_user_id: userId,
      author_email: authorEmail,
      body: noteInput.body,
    })
    .select(
      "id,reservation_request_id,parent_note_id,author_user_id,author_email,body,created_at",
    )
    .single();

  if (insertError) {
    if (insertError.code === "23503") {
      return jsonError(
        "Reservation or parent note no longer exists.",
        409,
      );
    }

    if (
      insertError.code === "23514" ||
      insertError.code === "22001"
    ) {
      return jsonError(
        "Note does not meet storage requirements.",
        400,
      );
    }

    console.error(
      "Staff note creation failed:",
      {
        code: insertError.code,
        reservationId: id,
      },
    );

    return jsonError(
      "Unable to save staff note.",
      500,
    );
  }

  return jsonResponse(
    {
      success: true,
      note: createdNote,
    },
    201,
  );
}