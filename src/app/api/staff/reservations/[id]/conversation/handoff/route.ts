import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const E164 = /^\+[1-9]\d{7,14}$/;
const MAX_BYTES = 1024;

type RouteContext = { params: Promise<{ id: string }> };
type Action = "request" | "cancel";

function respond(payload: Record<string, unknown>, status = 200) {
  return NextResponse.json(payload, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

function fail(error: string, status: number) {
  return respond({ success: false, error }, status);
}

function isValidOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    const source = new URL(origin);
    const target = new URL(request.url);
    return source.origin === target.origin &&
      (source.protocol === "https:" ||
        source.hostname === "localhost" ||
        source.hostname === "127.0.0.1");
  } catch {
    return false;
  }
}

async function parseAction(request: Request): Promise<
  | { ok: true; action: Action }
  | { ok: false; status: number; message: string }
> {
  const contentType = request.headers.get("content-type") ?? "";
  if (!/^application\/json(?:\s*;|$)/i.test(contentType)) {
    return { ok: false, status: 415, message: "JSON request required." };
  }

  const lengthHeader = request.headers.get("content-length");
  if (lengthHeader !== null) {
    const length = Number(lengthHeader);
    if (!/^\d+$/.test(lengthHeader) || !Number.isSafeInteger(length)) {
      return { ok: false, status: 400, message: "Invalid request length." };
    }
    if (length > MAX_BYTES) {
      return { ok: false, status: 413, message: "Request too large." };
    }
  }

  if (!request.body) {
    return { ok: false, status: 400, message: "JSON request required." };
  }

  let input: unknown;
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > MAX_BYTES) {
        await reader.cancel();
        return { ok: false, status: 413, message: "Request too large." };
      }
      chunks.push(value);
    }
    const bytes = new Uint8Array(total);
    let offset = 0;
    for (const chunk of chunks) {
      bytes.set(chunk, offset);
      offset += chunk.byteLength;
    }
    input = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes));
  } catch {
    return { ok: false, status: 400, message: "Invalid JSON request." };
  } finally {
    reader.releaseLock();
  }

  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return { ok: false, status: 400, message: "Invalid request." };
  }
  const body = input as Record<string, unknown>;
  if (Object.keys(body).length !== 1 ||
      (body.action !== "request" && body.action !== "cancel")) {
    return { ok: false, status: 400, message: "Invalid handoff action." };
  }
  return { ok: true, action: body.action };
}

export async function POST(request: Request, context: RouteContext) {
  // Independent, opt-in flag. A pending handoff never authorizes texting.
  if (process.env.RESERVATION_HANDOFF_REQUESTS_ENABLED !== "true") {
    return fail("Conversation handoff requests are not enabled.", 503);
  }
  if (!isValidOrigin(request)) {
    return fail("Request origin is not authorized.", 403);
  }
  const { id } = await context.params;
  if (!UUID.test(id)) return fail("Invalid reservation ID.", 400);

  try {
    const supabase = await createSupabaseServerClient();
    const { data: claimsData, error: claimsError } =
      await supabase.auth.getClaims();
    const userId = claimsData?.claims?.sub;
    if (claimsError || !userId) return fail("Authentication required.", 401);

    const { data: staffRole, error: roleError } = await supabase
      .from("staff_roles")
      .select("role, is_active")
      .eq("user_id", userId)
      .eq("is_active", true)
      .maybeSingle();
    if (roleError || !staffRole || staffRole.role !== "manager" ||
        staffRole.is_active !== true) {
      return fail("Manager access required.", 403);
    }

    const parsed = await parseAction(request);
    if (!parsed.ok) return fail(parsed.message, parsed.status);

    const restaurantPhone = process.env.TWILIO_FROM_NUMBER;
    if (!restaurantPhone || !E164.test(restaurantPhone)) {
      return fail("Restaurant SMS number is not configured.", 503);
    }

    // Use the user's own authenticated session so auth.uid() is the manager.
    const functionName = parsed.action === "request"
      ? "request_reservation_conversation_handoff"
      : "cancel_reservation_conversation_handoff";
    const { data, error } = await supabase.rpc(functionName, {
      p_reservation_id: id,
      p_restaurant_phone: restaurantPhone,
    });

    if (error) {
      if (error.code === "42501") return fail("Manager access required.", 403);
      if (error.code === "22023" || error.code === "23505") {
        return fail(
          parsed.action === "request"
            ? "Conversation cannot be requested right now. It may already be assigned to another manager."
            : "There is no pending handoff for this reservation owned by your account.",
          409,
        );
      }
      if (error.code === "P0002") return fail("Reservation or handoff not found.", 404);
      console.error("Conversation handoff RPC failed:", {
        reservationId: id,
        action: parsed.action,
        code: error.code,
      });
      return fail("Unable to update the handoff request.", 500);
    }

    const result: unknown = Array.isArray(data) ? data[0] : data;
    if (!result || typeof result !== "object" || Array.isArray(result)) {
      return fail("Handoff operation returned no result.", 500);
    }
    const row = result as Record<string, unknown>;
    const expected = parsed.action === "request" ? "handoff_pending" : "automation";
    if (row.ownership_status !== expected ||
        typeof row.ownership_id !== "string" || !UUID.test(row.ownership_id) ||
        (parsed.action === "request" && row.claimed_by !== userId)) {
      return fail("Handoff state could not be verified.", 500);
    }

    return respond({
      success: true,
      reservationId: id,
      action: parsed.action,
      ownership: row.ownership_status,
      ownershipId: row.ownership_id,
      staffMessagingEnabled: false,
      studioExecutionChanged: false,
      inboundRoutingChanged: false,
    });
  } catch (error) {
    console.error("Conversation handoff request failed:", {
      reservationId: id,
      name: error instanceof Error ? error.name : "UnknownError",
    });
    return fail("Unable to process the handoff request.", 500);
  }
}
