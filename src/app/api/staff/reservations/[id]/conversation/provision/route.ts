import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

import { createSupabaseServerClient } from "@/lib/supabase/server";

const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const E164 = /^\+[1-9]\d{7,14}$/;

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

type ProvisioningRow = {
  conversation_id: string;
  reservation_request_id: string;
  conversation_mode: string;
  mode_version: number;
};

const ALLOWED_MODES = new Set([
  "automation",
  "transitioning_to_staff",
  "staff",
]);

function respond(
  data: Record<string, unknown>,
  status = 200,
): NextResponse {
  return NextResponse.json(data, {
    status,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

function fail(
  error: string,
  status: number,
): NextResponse {
  return respond(
    {
      success: false,
      error,
    },
    status,
  );
}

function isRecord(
  value: unknown,
): value is Record<string, unknown> {
  return (
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value)
  );
}

function validOrigin(
  request: Request,
): boolean {
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

function provisioningEnabled(): boolean {
  return (
    process.env
      .RESERVATION_SHARED_SMS_PROVISIONING_ENABLED ===
    "true"
  );
}

function isProvisioningRow(
  value: unknown,
): value is ProvisioningRow {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.conversation_id === "string" &&
    UUID.test(value.conversation_id) &&
    typeof value.reservation_request_id === "string" &&
    UUID.test(value.reservation_request_id) &&
    typeof value.conversation_mode === "string" &&
    ALLOWED_MODES.has(value.conversation_mode) &&
    typeof value.mode_version === "number" &&
    Number.isSafeInteger(value.mode_version) &&
    value.mode_version > 0
  );
}

function oneProvisioningRow(
  data: unknown,
): ProvisioningRow | null {
  if (
    !Array.isArray(data) ||
    data.length !== 1
  ) {
    return null;
  }

  const row = data[0];

  return isProvisioningRow(row)
    ? row
    : null;
}

export async function POST(
  request: Request,
  context: RouteContext,
): Promise<NextResponse> {
  try {
    // --------------------------------------------------
    // 1. Validate the reservation identifier.
    // --------------------------------------------------

    const { id } = await context.params;

    if (
      typeof id !== "string" ||
      !UUID.test(id)
    ) {
      return fail(
        "Invalid reservation.",
        400,
      );
    }

    // --------------------------------------------------
    // 2. Verify request origin.
    //
    // Prevent cross-origin requests from creating
    // conversation records using staff cookies.
    // --------------------------------------------------

    if (!validOrigin(request)) {
      return fail(
        "Invalid request origin.",
        403,
      );
    }

    // This endpoint accepts no client-provided body.
    // The only identifier is the URL reservation UUID.

    const declaredLength =
      request.headers.get("content-length");

    if (
      declaredLength !== null &&
      (
        !/^\d+$/.test(declaredLength) ||
        !Number.isSafeInteger(
          Number(declaredLength),
        ) ||
        Number(declaredLength) !== 0
      )
    ) {
      return fail(
        "Request body is not supported.",
        400,
      );
    }

    const body = await request.text();

    if (body.length !== 0) {
      return fail(
        "Request body is not supported.",
        400,
      );
    }

    // --------------------------------------------------
    // 3. Authenticate the signed-in user.
    // --------------------------------------------------

    const supabase =
      await createSupabaseServerClient();

    const {
      data: claimsData,
      error: claimsError,
    } = await supabase.auth.getClaims();

    const userId = claimsData?.claims?.sub;

    if (
      claimsError ||
      typeof userId !== "string" ||
      !UUID.test(userId)
    ) {
      return fail(
        "Please sign in to continue.",
        401,
      );
    }

    // --------------------------------------------------
    // 4. Verify active manager authorization.
    //
    // No exclusive reservation ownership required.
    // --------------------------------------------------

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
      staffRole.role !== "manager" ||
      staffRole.is_active !== true
    ) {
      return fail(
        "Active manager access required.",
        403,
      );
    }

    // --------------------------------------------------
    // 5. Verify feature readiness.
    //
    // OFF by default.
    //
    // Provisioning is separate from Studio activation
    // and outbound SMS authorization.
    // --------------------------------------------------

    if (!provisioningEnabled()) {
      return fail(
        "Shared conversation provisioning is not enabled.",
        503,
      );
    }

    // --------------------------------------------------
    // 6. Validate trusted server configuration.
    //
    // Never accept the restaurant or guest phone
    // number from the browser.
    // --------------------------------------------------

    const supabaseUrl =
      process.env.SUPABASE_URL ??
      process.env.NEXT_PUBLIC_SUPABASE_URL;

    const serviceKey =
      process.env.SUPABASE_SECRET_KEY ??
      process.env.SUPABASE_SERVICE_ROLE_KEY;

    const restaurantPhone =
      process.env.TWILIO_FROM_NUMBER;

    if (
      !supabaseUrl ||
      !serviceKey ||
      !restaurantPhone ||
      !E164.test(restaurantPhone)
    ) {
      console.error(
        "Shared conversation provisioning configuration is incomplete.",
      );

      return fail(
        "Conversation provisioning is unavailable.",
        503,
      );
    }

    // --------------------------------------------------
    // 7. Create trusted service-role database client.
    //
    // Credentials remain exclusively server-side.
    // --------------------------------------------------

    const serviceSupabase = createClient(
      supabaseUrl,
      serviceKey,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      },
    );

    // --------------------------------------------------
    // 8. Invoke the deployed provisioning RPC.
    //
    // Database function verifies the reservation
    // and derives the guest phone from its record.
    //
    // PostgreSQL enforces reservation uniqueness.
    // --------------------------------------------------

    const {
      data,
      error,
    } = await serviceSupabase.rpc(
      "provision_reservation_shared_conversation",
      {
        p_reservation_id: id,
        p_restaurant_phone: restaurantPhone,
      },
    );

    if (error) {
      console.error(
        "Shared conversation provisioning RPC failed:",
        {
          code: error.code,
        },
      );

      if (error.code === "P0002") {
        return fail(
          "Reservation not found.",
          404,
        );
      }

      if (
        error.code === "22023" ||
        error.code === "55000"
      ) {
        return fail(
          "Reservation conversation cannot be provisioned safely.",
          409,
        );
      }

      return fail(
        "Conversation provisioning failed.",
        503,
      );
    }

    // --------------------------------------------------
    // 9. Verify the trusted RPC response.
    //
    // Require exactly one valid conversation record.
    // --------------------------------------------------

    const row = oneProvisioningRow(data);

    if (
      !row ||
      row.reservation_request_id.toLowerCase() !==
        id.toLowerCase()
    ) {
      console.error(
        "Shared conversation provisioning returned an invalid association.",
      );

      return fail(
        "Conversation provisioning response was invalid.",
        503,
      );
    }

    // --------------------------------------------------
    // 10. Return safe reservation conversation metadata.
    //
    // No Twilio call.
    // No message creation.
    // No Studio activation.
    // No ownership claim.
    // --------------------------------------------------

    return respond({
      success: true,
      reservationId: row.reservation_request_id,
      conversationId: row.conversation_id,
      mode: row.conversation_mode,
      modeVersion: row.mode_version,
      staffMessagingEnabled: false,
    });
  } catch {
    console.error(
      "Unexpected shared conversation provisioning error.",
    );

    return fail(
      "Conversation provisioning is unavailable.",
      503,
    );
  }
}