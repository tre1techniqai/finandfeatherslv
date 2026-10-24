
import { NextResponse } from "next/server";
import twilio from "twilio";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const E164 = /^\+[1-9]\d{7,14}$/;
const ACCOUNT_SID = /^AC[0-9a-f]{32}$/i;

const MAX_REQUEST_BYTES = 4096;
const MAX_MESSAGE_CHARS = 1600;

type RouteContext = {
  params: Promise<{ id: string }>;
};

type OwnershipRow = {
  ownership_id: string;
  ownership_status: string;
  linked_reservation_id: string;
  claimed_by: string | null;
};

function respond(
  payload: Record<string, unknown>,
  status = 200,
): Response {
  return NextResponse.json(payload, {
    status,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

function fail(
  error: string,
  status: number,
): Response {
  return respond(
    {
      success: false,
      error,
    },
    status,
  );
}

function validOrigin(request: Request): boolean {
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

function staffMessagingConfigured(): boolean {
  return (
    process.env.RESERVATION_STAFF_SMS_ENABLED === "true" &&
    process.env.RESERVATION_STAFF_INBOUND_ROUTING_VERIFIED ===
      "true" &&
    process.env.RESERVATION_STUDIO_STAFF_ROUTING_ENABLED ===
      "true" &&
    process.env.RESERVATION_STAFF_HANDOFF_COMPLETION_ENABLED ===
      "true"
  );
}

function isOwnershipRow(
  value: unknown,
): value is OwnershipRow {
  if (
    value === null ||
    typeof value !== "object" ||
    Array.isArray(value)
  ) {
    return false;
  }

  const row = value as Record<string, unknown>;

  return (
    typeof row.ownership_id === "string" &&
    UUID.test(row.ownership_id) &&
    typeof row.ownership_status === "string" &&
    typeof row.linked_reservation_id === "string" &&
    UUID.test(row.linked_reservation_id) &&
    (
      row.claimed_by === null ||
      (
        typeof row.claimed_by === "string" &&
        UUID.test(row.claimed_by)
      )
    )
  );
}

async function readMessage(
  request: Request,
): Promise<
  | { ok: true; body: string }
  | { ok: false; status: number; error: string }
> {
  if (
    !/^application\/json(?:\s*;|$)/i.test(
      request.headers.get("content-type") ?? "",
    )
  ) {
    return {
      ok: false,
      status: 415,
      error: "JSON request required.",
    };
  }

  const declared = request.headers.get("content-length");

  if (declared !== null) {
    if (
      !/^\d+$/.test(declared) ||
      !Number.isSafeInteger(Number(declared))
    ) {
      return {
        ok: false,
        status: 400,
        error: "Invalid request length.",
      };
    }

    if (Number(declared) > MAX_REQUEST_BYTES) {
      return {
        ok: false,
        status: 413,
        error: "Request too large.",
      };
    }
  }

  if (!request.body) {
    return {
      ok: false,
      status: 400,
      error: "Message is required.",
    };
  }

  let raw = "";

  const reader = request.body.getReader();

  const decoder = new TextDecoder(
    "utf-8",
    { fatal: true },
  );

  let bytes = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();

      if (done) break;

      bytes += value.byteLength;

      if (bytes > MAX_REQUEST_BYTES) {
        await reader.cancel();

        return {
          ok: false,
          status: 413,
          error: "Request too large.",
        };
      }

      raw += decoder.decode(
        value,
        { stream: true },
      );
    }

    raw += decoder.decode();
  } catch {
    return {
      ok: false,
      status: 400,
      error: "Invalid JSON request.",
    };
  } finally {
    reader.releaseLock();
  }

  let parsed: unknown;

  try {
    parsed = JSON.parse(raw);
  } catch {
    return {
      ok: false,
      status: 400,
      error: "Invalid JSON request.",
    };
  }

  if (
    !parsed ||
    typeof parsed !== "object" ||
    Array.isArray(parsed)
  ) {
    return {
      ok: false,
      status: 400,
      error: "Invalid message request.",
    };
  }

  const fields =
    parsed as Record<string, unknown>;

  if (
    Object.keys(fields).length !== 1 ||
    typeof fields.body !== "string"
  ) {
    return {
      ok: false,
      status: 400,
      error: "Invalid message request.",
    };
  }

  const body = fields.body.trim();

  if (
    !body ||
    body.length > MAX_MESSAGE_CHARS ||
    /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(body)
  ) {
    return {
      ok: false,
      status: 400,
      error: "Message must contain 1–1600 valid characters.",
    };
  }

  return {
    ok: true,
    body,
  };
}

export async function POST(
  request: Request,
  context: RouteContext,
): Promise<Response> {
  // All four switches are required.
  // Keep this endpoint disabled until staff-owned
  // inbound routing and takeover have passed testing.
  if (!staffMessagingConfigured()) {
    return fail(
      "Staff SMS is not enabled until inbound routing and takeover are verified.",
      503,
    );
  }

  if (!validOrigin(request)) {
    return fail(
      "Request origin is not authorized.",
      403,
    );
  }

  const { id } = await context.params;

  if (!UUID.test(id)) {
    return fail(
      "Invalid reservation ID.",
      400,
    );
  }

  try {
    const supabase =
      await createSupabaseServerClient();

    const {
      data: claimsData,
      error: claimsError,
    } = await supabase.auth.getClaims();

    const userId =
      claimsData?.claims?.sub;

    if (
      claimsError ||
      typeof userId !== "string" ||
      !UUID.test(userId)
    ) {
      return fail(
        "Authentication required.",
        401,
      );
    }

    const {
      data: role,
      error: roleError,
    } = await supabase
      .from("staff_roles")
      .select("role, is_active")
      .eq("user_id", userId)
      .eq("is_active", true)
      .maybeSingle();

    if (
      roleError ||
      role?.is_active !== true ||
      role.role !== "manager"
    ) {
      return fail(
        "Manager access required.",
        403,
      );
    }

    const parsed =
      await readMessage(request);

    if (!parsed.ok) {
      return fail(
        parsed.error,
        parsed.status,
      );
    }

    const from =
      process.env.TWILIO_FROM_NUMBER;

    const accountSid =
      process.env.TWILIO_ACCOUNT_SID;

    const authToken =
      process.env.TWILIO_AUTH_TOKEN;

    if (
      !from ||
      !E164.test(from) ||
      !accountSid ||
      !ACCOUNT_SID.test(accountSid) ||
      !authToken
    ) {
      return fail(
        "Restaurant SMS is not configured.",
        503,
      );
    }

    // Resolve the guest's phone number from
    // the reservation, never from browser input.
    const {
      data: reservation,
      error: reservationError,
    } = await supabase
      .from("reservation_requests")
      .select("id, customer_phone")
      .eq("id", id)
      .maybeSingle();

    if (reservationError) {
      return fail(
        "Reservation could not be verified.",
        503,
      );
    }

    if (!reservation) {
      return fail(
        "Reservation not found.",
        404,
      );
    }

    const guestPhone =
      reservation.customer_phone;

    if (
      typeof guestPhone !== "string" ||
      !E164.test(guestPhone) ||
      guestPhone === from
    ) {
      return fail(
        "Reservation guest phone is invalid.",
        409,
      );
    }

    // IMPORTANT:
    // The ownership table has RLS enabled with no
    // direct authenticated-user SELECT policy.
    //
    // Use the existing manager-authorized SECURITY
    // DEFINER RPC instead of reading the table.
    const {
      data: ownershipData,
      error: ownershipError,
    } = await supabase.rpc(
      "get_reservation_conversation_handoff",
      {
        p_reservation_id: id,
        p_restaurant_phone: from,
      },
    );

    if (ownershipError) {
      if (ownershipError.code === "42501") {
        return fail(
          "Manager authorization failed.",
          403,
        );
      }

      console.error(
        "Staff SMS ownership verification failed:",
        {
          reservationId: id,
          code: ownershipError.code,
        },
      );

      return fail(
        "Conversation ownership could not be verified.",
        503,
      );
    }

    if (
      !Array.isArray(ownershipData) ||
      ownershipData.length !== 1 ||
      !isOwnershipRow(ownershipData[0])
    ) {
      return fail(
        "Verified staff ownership is required before sending SMS.",
        409,
      );
    }

    const owner = ownershipData[0];

    // Three independent ownership conditions:
    // 1. Actual staff-owned state.
    // 2. The manager making this request owns it.
    // 3. Ownership is linked to this exact reservation.
    //
    // A pending handoff never permits texting.
    if (
      owner.ownership_status !== "staff" ||
      owner.claimed_by !== userId ||
      owner.linked_reservation_id !== id
    ) {
      return fail(
        "Verified staff ownership is required before sending SMS.",
        409,
      );
    }

    // Ownership has now been verified at the time
    // of this lookup. This is not a transaction lock
    // extending through the external Twilio API call.
    //
    // Do not enable live SMS until concurrent release/
    // send behavior is independently addressed.

    // Twilio's Messages.create endpoint does not
    // provide an application idempotency key.
    // Never automatically retry an uncertain send.
    let message;

    try {
      const client = twilio(
        accountSid,
        authToken,
      );

      message = await client.messages.create({
        from,
        to: guestPhone,
        body: parsed.body,
      });
    } catch (error) {
      console.error(
        "Staff SMS result uncertain or rejected:",
        {
          reservationId: id,
          name:
            error instanceof Error
              ? error.name
              : "UnknownError",
        },
      );

      return fail(
        "Message was not confirmed. Refresh conversation history before attempting another send.",
        502,
      );
    }

    return respond({
      success: true,
      reservationId: id,
      messageSid: message.sid,
      status: message.status,
    });
  } catch (error) {
    console.error(
      "Staff SMS endpoint failed:",
      {
        reservationId: id,
        name:
          error instanceof Error
            ? error.name
            : "UnknownError",
      },
    );

    return fail(
      "Unable to process the message request.",
      500,
    );
  }
}
