
import { createHmac, timingSafeEqual } from "node:crypto";

import { NextResponse } from "next/server";
import twilio from "twilio";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isReservationStaffRole } from "@/lib/auth/require-reservation-staff";

const E164_PATTERN = /^\+[1-9]\d{7,14}$/;
const ACCOUNT_SID_PATTERN = /^AC[0-9a-f]{32}$/i;

const PAGE_SIZE = 10;
const TWILIO_PAGE_SIZE = 10;
const MAX_CURSOR_LENGTH = 8192;

type RouteContext = {
  params: Promise<{ phone: string }>;
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

type StreamPosition = {
  token: string | null;
  offset: number;
  done: boolean;
};

type HistoryCursor = {
  version: 1;
  guestPhone: string;
  restaurantPhone: string;
  inbound: StreamPosition;
  outbound: StreamPosition;
};

type StreamState = {
  position: StreamPosition;
  from: string;
  to: string;
  direction: "inbound" | "outbound";
  messages: ConversationMessage[] | null;
  nextToken: string | null;
};

type TwilioClient = ReturnType<typeof twilio>;

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

function validPosition(
  value: unknown,
): value is StreamPosition {
  if (!value || typeof value !== "object") {
    return false;
  }

  const item = value as Record<string, unknown>;

  return (
    (item.token === null ||
      (typeof item.token === "string" &&
        item.token.length > 0 &&
        item.token.length <= 2048)) &&
    typeof item.offset === "number" &&
    Number.isSafeInteger(item.offset) &&
    item.offset >= 0 &&
    item.offset < TWILIO_PAGE_SIZE &&
    typeof item.done === "boolean" &&
    (!item.done ||
      (item.token === null && item.offset === 0))
  );
}

function initialPosition(): StreamPosition {
  return {
    token: null,
    offset: 0,
    done: false,
  };
}

function signCursor(
  payload: string,
  secret: string,
): string {
  return createHmac("sha256", secret)
    .update(payload)
    .digest("base64url");
}

function encodeCursor(
  cursor: HistoryCursor,
  secret: string,
): string {
  const payload = Buffer.from(
    JSON.stringify(cursor),
    "utf8",
  ).toString("base64url");

  const signature = signCursor(payload, secret);

  return `${payload}.${signature}`;
}

function decodeCursor(
  raw: string,
  secret: string,
  guestPhone: string,
  restaurantPhone: string,
): HistoryCursor | null {
  if (
    !raw ||
    raw.length > MAX_CURSOR_LENGTH
  ) {
    return null;
  }

  const parts = raw.split(".");

  if (parts.length !== 2) {
    return null;
  }

  const [payload, providedSignature] = parts;

  if (
    !/^[A-Za-z0-9_-]+$/.test(payload) ||
    !/^[A-Za-z0-9_-]+$/.test(providedSignature)
  ) {
    return null;
  }

  const expectedSignature =
    signCursor(payload, secret);

  const providedBuffer = Buffer.from(
    providedSignature,
    "utf8",
  );

  const expectedBuffer = Buffer.from(
    expectedSignature,
    "utf8",
  );

  if (
    providedBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(
      providedBuffer,
      expectedBuffer,
    )
  ) {
    return null;
  }

  try {
    const decoded = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8"),
    ) as unknown;

    if (
      !decoded ||
      typeof decoded !== "object"
    ) {
      return null;
    }

    const value = decoded as Record<
      string,
      unknown
    >;

    if (
      value.version !== 1 ||
      value.guestPhone !== guestPhone ||
      value.restaurantPhone !== restaurantPhone ||
      !validPosition(value.inbound) ||
      !validPosition(value.outbound)
    ) {
      return null;
    }

    return value as HistoryCursor;
  } catch {
    return null;
  }
}

function nextPageToken(
  nextPageUrl: string | null,
): string | null {
  if (!nextPageUrl) {
    return null;
  }

  const url = new URL(
    nextPageUrl,
    "https://api.twilio.com",
  );

  if (
    url.protocol !== "https:" ||
    url.hostname !== "api.twilio.com" ||
    url.username ||
    url.password
  ) {
    throw new Error(
      "Unexpected Twilio pagination URL.",
    );
  }

  const token =
    url.searchParams.get("PageToken") ??
    url.searchParams.get("pageToken");

  if (
    !token ||
    token.length > 2048
  ) {
    throw new Error(
      "Twilio pagination token unavailable.",
    );
  }

  return token;
}

function createStream(
  position: StreamPosition,
  from: string,
  to: string,
  direction: "inbound" | "outbound",
): StreamState {
  return {
    position: { ...position },
    from,
    to,
    direction,
    messages: null,
    nextToken: null,
  };
}

async function peekMessage(
  client: TwilioClient,
  stream: StreamState,
): Promise<ConversationMessage | null> {
  while (!stream.position.done) {
    if (stream.messages === null) {
      const page = await client.messages.page({
        from: stream.from,
        to: stream.to,
        pageSize: TWILIO_PAGE_SIZE,
        ...(stream.position.token
          ? { pageToken: stream.position.token }
          : {}),
      });

      stream.messages = page.instances.map(
        (message): ConversationMessage => ({
          sid: message.sid,
          direction: stream.direction,
          from: message.from,
          to: message.to,
          body: message.body ?? "",
          status: message.status,
          dateCreated:
            message.dateCreated?.toISOString() ?? null,
          dateSent:
            message.dateSent?.toISOString() ?? null,
          errorCode: message.errorCode ?? null,
        }),
      );

      
        stream.nextToken = nextPageToken(
        page.nextPageUrl ?? null,
        );

    }

    if (
      stream.position.offset <
      stream.messages.length
    ) {
      return stream.messages[
        stream.position.offset
      ];
    }

    if (stream.nextToken === null) {
      stream.position = {
        token: null,
        offset: 0,
        done: true,
      };

      stream.messages = null;

      return null;
    }

    stream.position = {
      token: stream.nextToken,
      offset: 0,
      done: false,
    };

    stream.messages = null;
    stream.nextToken = null;
  }

  return null;
}

function consumeMessage(
  stream: StreamState,
): void {
  if (
    !stream.messages ||
    stream.position.done
  ) {
    throw new Error(
      "Cannot consume an unavailable message.",
    );
  }

  stream.position.offset += 1;

  if (
    stream.position.offset <
    stream.messages.length
  ) {
    return;
  }

  if (stream.nextToken === null) {
    stream.position = {
      token: null,
      offset: 0,
      done: true,
    };
  } else {
    stream.position = {
      token: stream.nextToken,
      offset: 0,
      done: false,
    };
  }

  stream.messages = null;
  stream.nextToken = null;
}

function messageTimestamp(
  message: ConversationMessage,
): number {
  const value =
    message.dateCreated ??
    message.dateSent;

  if (!value) {
    return 0;
  }

  const timestamp = Date.parse(value);

  return Number.isFinite(timestamp)
    ? timestamp
    : 0;
}

function compareNewestFirst(
  a: ConversationMessage,
  b: ConversationMessage,
): number {
  const timeDifference =
    messageTimestamp(b) -
    messageTimestamp(a);

  return (
    timeDifference ||
    b.sid.localeCompare(a.sid)
  );
}

export async function GET(
  request: Request,
  context: RouteContext,
): Promise<NextResponse> {
  try {
    const { phone } = await context.params;
    const guestPhone = phone.trim();

    if (!E164_PATTERN.test(guestPhone)) {
      return fail(
        "Invalid guest phone number.",
        400,
      );
    }

    const supabase =
      await createSupabaseServerClient();

    const { data: claimsData, error: claimsError } =
      await supabase.auth.getClaims();

    const userId = claimsData?.claims?.sub;

    if (claimsError || !userId) {
      return fail(
        "Please sign in to continue.",
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
      !isReservationStaffRole(staffRole.role)
    ) {
      return fail(
        "Reservation staff access required.",
        403,
      );
    }

    // Initial scope: known reservation contacts.
    // This lookup does not establish reservation
    // ownership of any individual SMS.

    const { data: contact, error: contactError } =
      await supabase
        .from("reservation_requests")
        .select("id, customer_phone")
        .eq("customer_phone", guestPhone)
        .limit(1)
        .maybeSingle();

    if (contactError) {
      return fail(
        "Unable to verify the guest contact.",
        503,
      );
    }

    if (
      !contact ||
      contact.customer_phone !== guestPhone
    ) {
      return fail(
        "Guest conversation not found.",
        404,
      );
    }

    const accountSid =
      process.env.TWILIO_ACCOUNT_SID;

    const authToken =
      process.env.TWILIO_AUTH_TOKEN;

    const restaurantPhone =
      process.env.TWILIO_FROM_NUMBER;

    if (
      !accountSid ||
      !ACCOUNT_SID_PATTERN.test(accountSid) ||
      !authToken ||
      !restaurantPhone ||
      !E164_PATTERN.test(restaurantPhone) ||
      guestPhone === restaurantPhone
    ) {
      return fail(
        "Guest conversation history is not configured.",
        503,
      );
    }

    const url = new URL(request.url);
    const cursorValues =
      url.searchParams.getAll("cursor");

    if (cursorValues.length > 1) {
      return fail(
        "Invalid history cursor.",
        400,
      );
    }

    const rawCursor = cursorValues[0];

    const parsedCursor = rawCursor
      ? decodeCursor(
          rawCursor,
          authToken,
          guestPhone,
          restaurantPhone,
        )
      : null;

    if (rawCursor && !parsedCursor) {
      return fail(
        "Invalid history cursor.",
        400,
      );
    }

    const position = parsedCursor ?? {
      version: 1 as const,
      guestPhone,
      restaurantPhone,
      inbound: initialPosition(),
      outbound: initialPosition(),
    };

    const inbound = createStream(
      position.inbound,
      guestPhone,
      restaurantPhone,
      "inbound",
    );

    const outbound = createStream(
      position.outbound,
      restaurantPhone,
      guestPhone,
      "outbound",
    );

    const client = twilio(
      accountSid,
      authToken,
    );

    const selected: ConversationMessage[] = [];

    // Maintain independent continuation positions
    // for each Twilio message direction.
    //
    // Fetch pages lazily and take the newest available
    // message across the two streams until 10 are selected.

    while (selected.length < PAGE_SIZE) {
      const [incomingMessage, outgoingMessage] =
        await Promise.all([
          peekMessage(client, inbound),
          peekMessage(client, outbound),
        ]);

      if (
        !incomingMessage &&
        !outgoingMessage
      ) {
        break;
      }

      if (
        incomingMessage &&
        (!outgoingMessage ||
          compareNewestFirst(
            incomingMessage,
            outgoingMessage,
          ) <= 0)
      ) {
        selected.push(incomingMessage);
        consumeMessage(inbound);
      } else if (outgoingMessage) {
        selected.push(outgoingMessage);
        consumeMessage(outbound);
      }
    }

    // Check whether another page exists without
    // consuming the first message of that page.

    const [moreInbound, moreOutbound] =
      await Promise.all([
        peekMessage(client, inbound),
        peekMessage(client, outbound),
      ]);

    const hasMore = Boolean(
      moreInbound || moreOutbound,
    );

    const nextCursor = hasMore
      ? encodeCursor(
          {
            version: 1,
            guestPhone,
            restaurantPhone,
            inbound: inbound.position,
            outbound: outbound.position,
          },
          authToken,
        )
      : null;

    // Display the returned page oldest to newest.

    selected.reverse();

    return respond({
      success: true,
      scope: "phone",
      guestPhone,
      restaurantPhone,
      messages: selected,
      count: selected.length,
      pageSize: PAGE_SIZE,
      hasMore,
      nextCursor,
      readOnly: true,
      reservationScoped: false,
    });
  } catch (error) {
    console.error(
      "Phone conversation lookup failed:",
      {
        category:
          "PHONE_CONVERSATION_LOOKUP_ERROR",
        name:
          error instanceof Error
            ? error.name
            : "UnknownError",
      },
    );

    return fail(
      "We couldn't load the phone conversation. Please try again.",
      502,
    );
  }
}