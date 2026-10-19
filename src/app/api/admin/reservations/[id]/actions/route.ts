import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const ACTIONS_ENABLED =
  process.env.RESERVATION_MANAGER_ACTIONS_ENABLED === "true";

const MAX_BODY_BYTES = 8192;
const MAX_NOTE_CHARACTERS = 2000;

const ALLOWED_ACTIONS = new Set([
  "verify_deposit",
  "confirm",
  "update_notes",
  "close",
  "cancel",
  "complete",
]);

const NOTE_REQUIRED_ACTIONS = new Set([
  "update_notes",
  "close",
  "cancel",
]);

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const UNSUPPORTED_NOTE_CONTROLS =
  /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/u;

type RouteContext = {
  params: Promise<{ id: string }>;
};

type ActionBody = {
  action?: unknown;
  note?: unknown;
};

function jsonError(message: string, status: number) {
  return NextResponse.json(
    { error: message },
    {
      status,
      headers: { "Cache-Control": "no-store" },
    },
  );
}

function hasValidOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");

  if (!origin) {
    return false;
  }

  try {
    const requestOrigin = new URL(origin);
    const targetOrigin = new URL(request.url);

    return (
      requestOrigin.origin === targetOrigin.origin &&
      (requestOrigin.protocol === "https:" ||
        requestOrigin.hostname === "localhost" ||
        requestOrigin.hostname === "127.0.0.1")
    );
  } catch {
    return false;
  }
}

async function readLimitedJson(
  request: Request,
): Promise<
  | { success: true; body: ActionBody }
  | { success: false; status: number; message: string }
> {
  const declaredLength = request.headers.get("content-length");

  if (declaredLength !== null) {
    const length = Number(declaredLength);

    if (
      !Number.isSafeInteger(length) ||
      length < 0
    ) {
      return {
        success: false,
        status: 400,
        message: "Invalid Content-Length header.",
      };
    }

    if (length > MAX_BODY_BYTES) {
      return {
        success: false,
        status: 413,
        message: "Request body exceeds 8 KB.",
      };
    }
  }

  if (!request.body) {
    return {
      success: false,
      status: 400,
      message: "JSON request body required.",
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
          status: 413,
          message: "Request body exceeds 8 KB.",
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

    const parsed: unknown = JSON.parse(text);

    if (
      parsed === null ||
      typeof parsed !== "object" ||
      Array.isArray(parsed)
    ) {
      return {
        success: false,
        status: 400,
        message: "Invalid request body.",
      };
    }

    return {
      success: true,
      body: parsed as ActionBody,
    };
  } catch {
    return {
      success: false,
      status: 400,
      message: "Invalid JSON request.",
    };
  } finally {
    reader.releaseLock();
  }
}

export async function POST(
  request: Request,
  context: RouteContext,
) {
  // All manager writes remain disabled unless explicitly enabled.
  if (!ACTIONS_ENABLED) {
    return jsonError(
      "Reservation manager actions are not enabled.",
      503,
    );
  }

  // Require a browser request from this application's origin.
  if (!hasValidOrigin(request)) {
    return jsonError(
      "Request origin is not authorized.",
      403,
    );
  }

  const supabase = await createSupabaseServerClient();

  const {
    data: claimsData,
    error: claimsError,
  } = await supabase.auth.getClaims();

  const userId = claimsData?.claims?.sub;

  if (claimsError || !userId) {
    return jsonError("Authentication required.", 401);
  }

  const { data: staffRole, error: roleError } = await supabase
    .from("staff_roles")
    .select("user_id, role, is_active")
    .eq("user_id", userId)
    .eq("is_active", true)
    .maybeSingle();

  if (
    roleError ||
    !staffRole ||
    staffRole.role !== "manager" ||
    !staffRole.is_active
  ) {
    return jsonError("Manager access required.", 403);
  }

  const { id } = await context.params;

  if (!UUID_PATTERN.test(id)) {
    return jsonError("Invalid reservation ID.", 400);
  }

  const contentType = request.headers.get("content-type") ?? "";

  if (!/^application\/json(?:\s*;|$)/i.test(contentType)) {
    return jsonError("JSON request body required.", 415);
  }

  const parsedRequest = await readLimitedJson(request);

  if (!parsedRequest.success) {
    return jsonError(
      parsedRequest.message,
      parsedRequest.status,
    );
  }

  const body = parsedRequest.body;

  if (
    typeof body.action !== "string" ||
    !ALLOWED_ACTIONS.has(body.action)
  ) {
    return jsonError("Unsupported reservation action.", 400);
  }

  const action = body.action;

  if (
    body.note !== undefined &&
    body.note !== null &&
    typeof body.note !== "string"
  ) {
    return jsonError("Note must be text.", 400);
  }

  const note = body.note ?? null;

  if (typeof note === "string") {
    if (
      Array.from(note).length > MAX_NOTE_CHARACTERS
    ) {
      return jsonError(
        "Note exceeds 2000 characters.",
        400,
      );
    }

    if (UNSUPPORTED_NOTE_CONTROLS.test(note)) {
      return jsonError(
        "Note contains unsupported control characters.",
        400,
      );
    }
  }

  if (
    NOTE_REQUIRED_ACTIONS.has(action) &&
    (typeof note !== "string" || !note.trim())
  ) {
    return jsonError(
      "A reason or note is required.",
      400,
    );
  }

  if (
    !NOTE_REQUIRED_ACTIONS.has(action) &&
    note !== null
  ) {
    return jsonError(
      "This action does not accept a note.",
      400,
    );
  }

  // PostgreSQL independently verifies manager authorization
  // and enforces reservation state transitions.
  const { data, error } = await supabase.rpc(
    "manage_reservation_request",
    {
      p_reservation_id: id,
      p_action: action,
      p_note: note,
    },
  );

  if (error) {
    if (error.code === "42501") {
      return jsonError("Manager access required.", 403);
    }

    if (error.code === "P0002") {
      return jsonError("Reservation not found.", 404);
    }

    if (error.code === "22023") {
      return jsonError(
        "Reservation action rejected. Check its current status and requirements.",
        409,
      );
    }

    console.error("Reservation manager action failed:", {
      code: error.code,
      message: error.message,
      action,
      reservationId: id,
    });

    return jsonError(
      "Unable to process reservation action.",
      500,
    );
  }

  const result = Array.isArray(data) ? data[0] : data;

  return NextResponse.json(
    {
      success: true,
      reservation: result,
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}