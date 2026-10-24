
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const E164 = /^\+[1-9]\d{7,14}$/;
const MAX_BODY_BYTES = 256;

type RouteContext = {
  params: Promise<{ id: string }>;
};

type OwnershipRow = {
  ownership_id: string;
  ownership_status: string;
  linked_reservation_id: string;
  claimed_by: string | null;
};

type ReleaseRow = {
  ownership_id: string;
  ownership_status: string;
  released_at: string;
};

function respond(
  payload: Record<string, unknown>,
  status = 200,
): NextResponse {
  return NextResponse.json(payload, {
    status,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

function fail(
  message: string,
  status: number,
): NextResponse {
  return respond(
    {
      success: false,
      error: message,
    },
    status,
  );
}

function validOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");

  if (!origin) {
    return false;
  }

  try {
    const source = new URL(origin);
    const destination = new URL(request.url);

    return (
      source.origin === destination.origin &&
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

async function validEmptyBody(
  request: Request,
): Promise<boolean> {
  const contentType =
    request.headers.get("content-type") ?? "";

  if (
    !/^application\/json(?:\s*;|$)/i.test(contentType)
  ) {
    return false;
  }

  const declaredLength =
    request.headers.get("content-length");

  if (declaredLength !== null) {
    if (
      !/^\d+$/.test(declaredLength) ||
      !Number.isSafeInteger(Number(declaredLength)) ||
      Number(declaredLength) > MAX_BODY_BYTES
    ) {
      return false;
    }
  }

  if (!request.body) {
    return false;
  }

  let raw: string;

  try {
    raw = await request.text();
  } catch {
    return false;
  }

  if (
    Buffer.byteLength(raw, "utf8") >
    MAX_BODY_BYTES
  ) {
    return false;
  }

  try {
    const parsed: unknown = JSON.parse(raw);

    return (
      parsed !== null &&
      typeof parsed === "object" &&
      !Array.isArray(parsed) &&
      Object.keys(parsed).length === 0
    );
  } catch {
    return false;
  }
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

function isReleaseRow(
  value: unknown,
): value is ReleaseRow {
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
    row.ownership_status === "released" &&
    typeof row.released_at === "string" &&
    !Number.isNaN(Date.parse(row.released_at))
  );
}

export async function POST(
  request: Request,
  context: RouteContext,
): Promise<NextResponse> {
  // RELEASE IS A RECOVERY OPERATION.
  //
  // Never gate this endpoint on staff takeover or
  // SMS enablement flags.
  //
  // The authenticated manager must still own the
  // exact reservation conversation.
  //
  // The database now also protects release while
  // registered, submitting, or uncertain staff SMS
  // operations remain in the current ownership session.

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

  if (!(await validEmptyBody(request))) {
    return fail(
      "Expected an empty JSON object.",
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

    const managerId =
      claimsData?.claims?.sub;

    if (
      claimsError ||
      typeof managerId !== "string" ||
      !UUID.test(managerId)
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
      .eq("user_id", managerId)
      .eq("is_active", true)
      .maybeSingle();

    if (
      roleError ||
      !role ||
      role.role !== "manager" ||
      role.is_active !== true
    ) {
      return fail(
        "Manager access required.",
        403,
      );
    }

    const restaurantPhone =
      process.env.TWILIO_FROM_NUMBER;

    if (
      !restaurantPhone ||
      !E164.test(restaurantPhone)
    ) {
      return fail(
        "Restaurant SMS number is not configured.",
        503,
      );
    }

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
      guestPhone === restaurantPhone
    ) {
      return fail(
        "Reservation guest phone is invalid.",
        409,
      );
    }

    // The ownership table has RLS enabled.
    // Use the existing manager-authorized RPC.
    const {
      data: ownershipData,
      error: ownershipError,
    } = await supabase.rpc(
      "get_reservation_conversation_handoff",
      {
        p_reservation_id: id,
        p_restaurant_phone: restaurantPhone,
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
        "Conversation release ownership lookup failed:",
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
        "An eligible staff-owned conversation was not found.",
        409,
      );
    }

    const ownership = ownershipData[0];

    if (
      ownership.ownership_status !== "staff" ||
      ownership.linked_reservation_id !== id ||
      ownership.claimed_by !== managerId
    ) {
      return fail(
        "This conversation is not owned by your account.",
        409,
      );
    }

    // The existing release RPC locks the ownership row.
    // The installed database trigger independently rejects
    // release when unresolved staff SMS operations exist.
    const {
      data: releaseData,
      error: releaseError,
    } = await supabase.rpc(
      "release_reservation_conversation_handoff",
      {
        p_reservation_id: id,
        p_restaurant_phone: restaurantPhone,
      },
    );

    if (releaseError) {
      if (releaseError.code === "42501") {
        return fail(
          "Manager authorization failed.",
          403,
        );
      }

      // PostgreSQL object_not_in_prerequisite_state.
      // The new staff SMS guard uses this code when
      // the current ownership session has unresolved
      // SMS operations. A session lifecycle error can
      // also use 55000, so do not treat all 55000
      // errors as verified SMS-specific failures.
      if (releaseError.code === "55000") {
        console.warn(
          "Conversation release blocked by database state:",
          {
            reservationId: id,
            code: releaseError.code,
          },
        );

        return respond(
          {
            success: false,
            error:
              "The conversation cannot be released yet. An SMS operation may need review, or the conversation ownership state may require administrator attention. Refresh the conversation and contact an administrator before retrying.",
            reason: "release_blocked_by_database_state",
            ownershipChanged: false,
            smsSent: false,
          },
          409,
        );
      }

      if (
        releaseError.code === "22023" ||
        releaseError.code === "P0002"
      ) {
        return fail(
          "The conversation is no longer eligible for release.",
          409,
        );
      }

      console.error(
        "Conversation release RPC failed:",
        {
          reservationId: id,
          code: releaseError.code,
        },
      );

      return fail(
        "Unable to release the conversation.",
        500,
      );
    }

    if (
      !Array.isArray(releaseData) ||
      releaseData.length !== 1 ||
      !isReleaseRow(releaseData[0])
    ) {
      return fail(
        "Conversation release could not be confirmed. Refresh ownership before retrying.",
        500,
      );
    }

    const released = releaseData[0];

    if (
      released.ownership_id !== ownership.ownership_id
    ) {
      return fail(
        "The released conversation identity could not be verified.",
        500,
      );
    }

    // Read the committed database state once more.
    // This check remains independent of takeover
    // and messaging feature flags.
    const {
      data: verificationData,
      error: verificationError,
    } = await supabase.rpc(
      "get_reservation_conversation_handoff",
      {
        p_reservation_id: id,
        p_restaurant_phone: restaurantPhone,
      },
    );

    if (
      verificationError ||
      !Array.isArray(verificationData) ||
      verificationData.length !== 1 ||
      !isOwnershipRow(verificationData[0])
    ) {
      return fail(
        "Release was requested, but final ownership could not be verified. Refresh before retrying.",
        502,
      );
    }

    const verified = verificationData[0];

    if (
      verified.ownership_id !== released.ownership_id ||
      verified.ownership_status !== "released" ||
      verified.linked_reservation_id !== id ||
      verified.claimed_by !== null
    ) {
      return fail(
        "The final conversation ownership state could not be confirmed. Refresh before retrying.",
        502,
      );
    }

    return respond({
      success: true,
      reservationId: id,
      ownership: "released",
      ownershipId: released.ownership_id,
      releasedAt: released.released_at,
      claimedByCurrentManager: false,
      automationRoutingExpected: true,
      smsSent: false,
      studioExecutionsChanged: false,
    });
  } catch (caught) {
    console.error(
      "Conversation release endpoint failed:",
      {
        reservationId: id,
        name:
          caught instanceof Error
            ? caught.name
            : "UnknownError",
      },
    );

    return fail(
      "Unable to process the conversation release.",
      500,
    );
  }
}
