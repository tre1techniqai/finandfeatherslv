
import { NextResponse } from "next/server";
import twilio from "twilio";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const E164_PATTERN = /^\+[1-9]\d{7,14}$/;
const ACCOUNT_SID_PATTERN = /^AC[0-9a-f]{32}$/i;

const MESSAGE_LIMIT_PER_DIRECTION = 100;

type RouteContext = {
  params: Promise<{ id: string }>;
};

type ConversationMessage = {
  sid: string;
  direction: "inbound" | "outbound";
  from: string;
  to: string;
  body: string;
  status: string;
  dateCreated: string | null;
  dateSent: string | null;
  errorCode: number | null;
};

function jsonResponse(
  data: Record<string, unknown>,
  status = 200,
) {
  return NextResponse.json(data, {
    status,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

function jsonError(message: string, status: number) {
  return jsonResponse(
    {
      success: false,
      error: message,
    },
    status,
  );
}

export async function GET(
  _request: Request,
  context: RouteContext,
): Promise<NextResponse> {
  try {
    const { id } = await context.params;

    if (!UUID_PATTERN.test(id)) {
      return jsonError("Invalid reservation.", 400);
    }

    // Verify the signed-in user.
    const supabase = await createSupabaseServerClient();

    const { data: claimsData, error: claimsError } =
      await supabase.auth.getClaims();

    const userId = claimsData?.claims?.sub;

    if (claimsError || !userId) {
      return jsonError("Please sign in to continue.", 401);
    }

    // Preserve existing manager-only portal access.
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
      staffRole.role !== "manager"
    ) {
      return jsonError("Staff access required.", 403);
    }

    // Obtain the phone number from the protected
    // reservation record, never from query parameters.
    const { data: reservation, error: reservationError } =
      await supabase
        .from("reservation_requests")
        .select("id, customer_name, customer_phone, created_at")
        .eq("id", id)
        .maybeSingle();

    if (reservationError) {
      return jsonError(
        "Unable to load the reservation.",
        500,
      );
    }

    if (!reservation) {
      return jsonError("Reservation not found.", 404);
    }

    const guestPhone = reservation.customer_phone;

    if (
      typeof guestPhone !== "string" ||
      !E164_PATTERN.test(guestPhone)
    ) {
      return jsonError(
        "This reservation has no valid SMS phone number.",
        409,
      );
    }

    // Twilio credentials remain server-side.
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const restaurantPhone = process.env.TWILIO_FROM_NUMBER;

    if (
      !accountSid ||
      !ACCOUNT_SID_PATTERN.test(accountSid) ||
      !authToken ||
      !restaurantPhone ||
      !E164_PATTERN.test(restaurantPhone)
    ) {
      return jsonError(
        "Guest conversation history is not configured.",
        503,
      );
    }

    const client = twilio(accountSid, authToken);

    // Retrieve both directions of the conversation.
    // Limits prevent unbounded Twilio API requests.
    const [inbound, outbound] = await Promise.all([
      client.messages.list({
        from: guestPhone,
        to: restaurantPhone,
        limit: MESSAGE_LIMIT_PER_DIRECTION,
      }),
      client.messages.list({
        from: restaurantPhone,
        to: guestPhone,
        limit: MESSAGE_LIMIT_PER_DIRECTION,
      }),
    ]);

    const messages: ConversationMessage[] = [
      ...inbound.map((message) => ({
        sid: message.sid,
        direction: "inbound" as const,
        from: message.from,
        to: message.to,
        body: message.body ?? "",
        status: message.status,
        dateCreated:
          message.dateCreated?.toISOString() ?? null,
        dateSent:
          message.dateSent?.toISOString() ?? null,
        errorCode: message.errorCode ?? null,
      })),
      ...outbound.map((message) => ({
        sid: message.sid,
        direction: "outbound" as const,
        from: message.from,
        to: message.to,
        body: message.body ?? "",
        status: message.status,
        dateCreated:
          message.dateCreated?.toISOString() ?? null,
        dateSent:
          message.dateSent?.toISOString() ?? null,
        errorCode: message.errorCode ?? null,
      })),
    ];

    // Sort oldest to newest.
    messages.sort((a, b) => {
      const aTime = a.dateCreated
        ? Date.parse(a.dateCreated)
        : 0;

      const bTime = b.dateCreated
        ? Date.parse(b.dateCreated)
        : 0;

      return aTime - bTime || a.sid.localeCompare(b.sid);
    });

    return jsonResponse({
      success: true,
      reservationId: reservation.id,
      guestName: reservation.customer_name,
      guestPhone,
      restaurantPhone,
      messages,
      count: messages.length,
      historyMayBeTruncated:
        inbound.length === MESSAGE_LIMIT_PER_DIRECTION ||
        outbound.length === MESSAGE_LIMIT_PER_DIRECTION,
      readOnly: true,
    });
  } catch (error) {
    console.error("Guest conversation lookup failed:", {
      category: "CONVERSATION_LOOKUP_ERROR",
      name:
        error instanceof Error
          ? error.name
          : "UnknownError",
    });

    return jsonError(
      "We couldn't load the guest conversation. Please try again.",
      502,
    );
  }
}
