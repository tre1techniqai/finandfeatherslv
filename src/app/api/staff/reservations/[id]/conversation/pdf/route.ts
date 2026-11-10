
import { NextResponse } from "next/server";
import {
  PDFDocument,
  StandardFonts,
  rgb,
  type PDFFont,
  type PDFPage,
} from "pdf-lib";

import { GET as getScopedHistory } from "../scoped-history/route";

type RouteContext = {
  params: Promise<{ id: string }>;
};

type ConversationMessage = {
  sid: string;
  direction: "inbound" | "outbound";
  body: string;
  status: string;
  dateCreated: string | null;
  dateSent: string | null;
  errorCode: number | null;
  attribution?: "database" | "historical";
};

type ScopedHistoryPage = {
  success: boolean;
  reservationId: string;
  guestName: string | null;
  guestPhone: string;
  messages: ConversationMessage[];
  hasMore: boolean;
  nextCursor: string | null;
  pageSize: number;
  reservationScoped: boolean;
  historicalCoverageComplete: boolean;
  readOnly: boolean;
};

type ConversationData = {
  reservationId: string;
  guestName: string | null;
  guestPhone: string;
  restaurantPhone: string;
  messages: ConversationMessage[];
  historicalCoverageComplete: boolean;
};

const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const MESSAGE_SID = /^SM[0-9a-f]{32}$/i;
const E164 = /^\+[1-9]\d{7,14}$/;

const SCOPED_PAGE_SIZE = 10;
const MAX_EXPORT_PAGES = 100;
const MAX_EXPORT_MESSAGES = 1000;

const PAGE_WIDTH = 612;
const PAGE_HEIGHT = 792;
const MARGIN = 44;
const LINE_HEIGHT = 15;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

const BLACK = rgb(0.13, 0.13, 0.13);
const GRAY = rgb(0.38, 0.38, 0.38);
const RED = rgb(0.918, 0.106, 0.141);

function isRecord(
  value: unknown,
): value is Record<string, unknown> {
  return (
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value)
  );
}

function isConversationMessage(
  value: unknown,
): value is ConversationMessage {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.sid === "string" &&
    MESSAGE_SID.test(value.sid) &&
    (
      value.direction === "inbound" ||
      value.direction === "outbound"
    ) &&
    typeof value.body === "string" &&
    typeof value.status === "string" &&
    (
      value.dateCreated === null ||
      (
        typeof value.dateCreated === "string" &&
        Number.isFinite(Date.parse(value.dateCreated))
      )
    ) &&
    (
      value.dateSent === null ||
      (
        typeof value.dateSent === "string" &&
        Number.isFinite(Date.parse(value.dateSent))
      )
    ) &&
    (
      value.errorCode === null ||
      (
        typeof value.errorCode === "number" &&
        Number.isSafeInteger(value.errorCode)
      )
    ) &&
    (
      value.attribution === undefined ||
      value.attribution === "database" ||
      value.attribution === "historical"
    )
  );
}

function isScopedHistoryPage(
  value: unknown,
): value is ScopedHistoryPage {
  if (!isRecord(value)) {
    return false;
  }

  return (
    value.success === true &&
    typeof value.reservationId === "string" &&
    UUID.test(value.reservationId) &&
    (
      value.guestName === null ||
      typeof value.guestName === "string"
    ) &&
    typeof value.guestPhone === "string" &&
    E164.test(value.guestPhone) &&
    Array.isArray(value.messages) &&
    value.messages.length <= SCOPED_PAGE_SIZE &&
    value.messages.every(isConversationMessage) &&
    typeof value.hasMore === "boolean" &&
    (
      value.nextCursor === null ||
      (
        typeof value.nextCursor === "string" &&
        value.nextCursor.length > 0 &&
        value.nextCursor.length <= 256
      )
    ) &&
    value.pageSize === SCOPED_PAGE_SIZE &&
    value.reservationScoped === true &&
    typeof value.historicalCoverageComplete === "boolean" &&
    value.readOnly === true
  );
}

function jsonError(
  message: string,
  status: number,
): NextResponse {
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

async function loadScopedConversation(
  request: Request,
  context: RouteContext,
): Promise<
  | { ok: true; conversation: ConversationData }
  | { ok: false; response: NextResponse }
> {
  const { id } = await context.params;

  if (!UUID.test(id)) {
    return {
      ok: false,
      response: jsonError(
        "Invalid reservation.",
        400,
      ),
    };
  }

  const restaurantPhone =
    process.env.TWILIO_FROM_NUMBER;

  if (
    !restaurantPhone ||
    !E164.test(restaurantPhone)
  ) {
    return {
      ok: false,
      response: jsonError(
        "Restaurant messaging is not configured.",
        503,
      ),
    };
  }

  const messages: ConversationMessage[] = [];
  const seenSids = new Set<string>();
  const seenCursors = new Set<string>();

  let cursor: string | null = null;
  let guestName: string | null = null;
  let guestPhone: string | null = null;
  let historicalCoverageComplete = true;
  let completed = false;

  const scopedUrl = new URL(request.url);

  scopedUrl.pathname = scopedUrl.pathname.replace(
    /\/pdf\/?$/,
    "/scoped-history",
  );

  scopedUrl.search = "";

  for (
    let pageNumber = 0;
    pageNumber < MAX_EXPORT_PAGES;
    pageNumber++
  ) {
    const pageUrl = new URL(scopedUrl);

    if (cursor !== null) {
      pageUrl.searchParams.set(
        "cursor",
        cursor,
      );
    }

    // Reuse the original authenticated request headers.
    // Each page is independently authorized by
    // requireReservationStaff() inside scoped history.
    const pageRequest = new Request(
      pageUrl.toString(),
      {
        method: "GET",
        headers: request.headers,
      },
    );

    const response = await getScopedHistory(
      pageRequest,
      context,
    );

    if (!response.ok) {
      return {
        ok: false,
        response,
      };
    }

    let rawPage: unknown;

    try {
      rawPage = await response.json();
    } catch {
      return {
        ok: false,
        response: jsonError(
          "Conversation history response is invalid.",
          502,
        ),
      };
    }

    if (!isScopedHistoryPage(rawPage)) {
      return {
        ok: false,
        response: jsonError(
          "Verified conversation history is unavailable.",
          502,
        ),
      };
    }

    const page = rawPage;

    if (
      page.reservationId.toLowerCase() !==
      id.toLowerCase()
    ) {
      return {
        ok: false,
        response: jsonError(
          "Conversation reservation identity mismatch.",
          502,
        ),
      };
    }

    if (pageNumber === 0) {
      guestName = page.guestName;
      guestPhone = page.guestPhone;
    } else if (
      page.guestName !== guestName ||
      page.guestPhone !== guestPhone
    ) {
      return {
        ok: false,
        response: jsonError(
          "Conversation guest identity changed during export.",
          409,
        ),
      };
    }

    if (
      page.messages.length === 0 &&
      page.hasMore
    ) {
      return {
        ok: false,
        response: jsonError(
          "Conversation pagination returned an empty continuation.",
          502,
        ),
      };
    }

    for (const message of page.messages) {
      const sidKey = message.sid.toLowerCase();

      if (seenSids.has(sidKey)) {
        return {
          ok: false,
          response: jsonError(
            "Duplicate message association detected during export.",
            502,
          ),
        };
      }

      seenSids.add(sidKey);
      messages.push(message);
    }

    if (
      messages.length > MAX_EXPORT_MESSAGES
    ) {
      return {
        ok: false,
        response: jsonError(
          "Conversation exceeds the safe PDF export limit.",
          413,
        ),
      };
    }

    historicalCoverageComplete =
      historicalCoverageComplete &&
      page.historicalCoverageComplete;

    if (!page.hasMore) {
      if (page.nextCursor !== null) {
        return {
          ok: false,
          response: jsonError(
            "Conversation pagination state is inconsistent.",
            502,
          ),
        };
      }

      completed = true;
      break;
    }

    if (
      !page.nextCursor ||
      seenCursors.has(page.nextCursor)
    ) {
      return {
        ok: false,
        response: jsonError(
          "Conversation pagination cursor is invalid or repeated.",
          502,
        ),
      };
    }

    seenCursors.add(page.nextCursor);
    cursor = page.nextCursor;
  }

  if (!completed) {
    return {
      ok: false,
      response: jsonError(
        "Conversation exceeds the safe PDF export limit. No partial PDF was generated.",
        413,
      ),
    };
  }

  if (!guestPhone) {
    return {
      ok: false,
      response: jsonError(
        "Verified guest phone is unavailable.",
        502,
      ),
    };
  }

  messages.sort((a, b) => {
    const aTime = Date.parse(
      a.dateCreated ?? a.dateSent ?? "",
    );

    const bTime = Date.parse(
      b.dateCreated ?? b.dateSent ?? "",
    );

    const safeA = Number.isFinite(aTime)
      ? aTime
      : 0;

    const safeB = Number.isFinite(bTime)
      ? bTime
      : 0;

    return (
      safeA - safeB ||
      a.sid.localeCompare(b.sid)
    );
  });

  return {
    ok: true,
    conversation: {
      reservationId: id,
      guestName,
      guestPhone,
      restaurantPhone,
      messages,
      historicalCoverageComplete,
    },
  };
}

// Standard PDF fonts do not support all Unicode glyphs.
// Preserve common punctuation and substitute unsupported
// characters rather than crashing the export.
function safePdfText(value: string): string {
  const normalized = value
    .replace(/\r\n?/g, "\n")
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/\u2026/g, "...")
    .replace(/\u00A0/g, " ");

  return Array.from(normalized)
    .map((character) => {
      const code = character.codePointAt(0) ?? 0;

      if (
        character === "\n" ||
        character === "\t"
      ) {
        return character;
      }

      return code >= 32 && code <= 126
        ? character
        : "?";
    })
    .join("");
}

function wrapText(
  text: string,
  font: PDFFont,
  size: number,
  maxWidth: number,
): string[] {
  const result: string[] = [];

  for (
    const paragraph of safePdfText(text).split("\n")
  ) {
    if (!paragraph) {
      result.push("");
      continue;
    }

    let line = "";

    for (const word of paragraph.split(/\s+/)) {
      let remaining = word;

      while (
        remaining &&
        font.widthOfTextAtSize(
          remaining,
          size,
        ) > maxWidth
      ) {
        let index = 1;

        while (
          index < remaining.length &&
          font.widthOfTextAtSize(
            remaining.slice(0, index + 1),
            size,
          ) <= maxWidth
        ) {
          index++;
        }

        if (line) {
          result.push(line);
          line = "";
        }

        result.push(
          remaining.slice(0, index),
        );

        remaining =
          remaining.slice(index);
      }

      if (!remaining) {
        continue;
      }

      const candidate = line
        ? `${line} ${remaining}`
        : remaining;

      if (
        font.widthOfTextAtSize(
          candidate,
          size,
        ) <= maxWidth
      ) {
        line = candidate;
      } else {
        if (line) {
          result.push(line);
        }

        line = remaining;
      }
    }

    if (line) {
      result.push(line);
    }
  }

  return result;
}

function formattedDate(
  value: string | null,
): string {
  if (!value) {
    return "Time unavailable";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Time unavailable";
  }

  return new Intl.DateTimeFormat(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      timeZone:
        "America/Los_Angeles",
      timeZoneName: "short",
    },
  ).format(date);
}

export async function GET(
  request: Request,
  context: RouteContext,
): Promise<NextResponse> {
  const result = await loadScopedConversation(
    request,
    context,
  );

  if (!result.ok) {
    return result.response;
  }

  const { conversation } = result;

  try {
    const pdf = await PDFDocument.create();

    const regular = await pdf.embedFont(
      StandardFonts.Helvetica,
    );

    const bold = await pdf.embedFont(
      StandardFonts.HelveticaBold,
    );

    pdf.setTitle(
      "Fin & Feathers Guest Conversation",
    );

    pdf.setAuthor(
      "Fin & Feathers Las Vegas",
    );

    pdf.setSubject(
      "Reservation-scoped SMS conversation export",
    );

    let page: PDFPage = pdf.addPage([
      PAGE_WIDTH,
      PAGE_HEIGHT,
    ]);

    let cursorY =
      PAGE_HEIGHT - MARGIN;

    function newPage() {
      page = pdf.addPage([
        PAGE_WIDTH,
        PAGE_HEIGHT,
      ]);

      cursorY =
        PAGE_HEIGHT - MARGIN;
    }

    function ensureSpace(
      height: number,
    ) {
      if (
        cursorY - height <
        MARGIN + 25
      ) {
        newPage();
      }
    }

    function writeLine(
      value: string,
      options: {
        size?: number;
        font?: PDFFont;
        color?: ReturnType<typeof rgb>;
        indent?: number;
      } = {},
    ) {
      const size =
        options.size ?? 10;

      const font =
        options.font ?? regular;

      const indent =
        options.indent ?? 0;

      const color =
        options.color ?? BLACK;

      const lines = wrapText(
        value,
        font,
        size,
        CONTENT_WIDTH - indent,
      );

      for (const line of lines) {
        ensureSpace(LINE_HEIGHT);

        if (line) {
          page.drawText(line, {
            x: MARGIN + indent,
            y: cursorY,
            size,
            font,
            color,
          });
        }

        cursorY -= LINE_HEIGHT;
      }
    }

    function spacer(
      height = 12,
    ) {
      ensureSpace(height);
      cursorY -= height;
    }

    function divider() {
      ensureSpace(15);

      page.drawLine({
        start: {
          x: MARGIN,
          y: cursorY,
        },
        end: {
          x: PAGE_WIDTH - MARGIN,
          y: cursorY,
        },
        thickness: 0.7,
        color: rgb(
          0.83,
          0.83,
          0.83,
        ),
      });

      cursorY -= 15;
    }

    writeLine(
      "FIN & FEATHERS LAS VEGAS",
      {
        font: bold,
        size: 16,
        color: RED,
      },
    );

    spacer(5);

    writeLine(
      "Guest SMS Conversation",
      {
        font: bold,
        size: 13,
      },
    );

    spacer(8);

    writeLine(
      `Guest: ${
        conversation.guestName ||
        "Not provided"
      }`,
    );

    writeLine(
      `Guest phone: ${
        conversation.guestPhone
      }`,
    );

    writeLine(
      `Restaurant phone: ${
        conversation.restaurantPhone
      }`,
    );

    writeLine(
      `Reservation ID: ${
        conversation.reservationId
      }`,
      {
        size: 9,
      },
    );

    writeLine(
      `Exported: ${
        formattedDate(
          new Date().toISOString(),
        )
      }`,
      {
        size: 9,
        color: GRAY,
      },
    );

    writeLine(
      `Verified messages retrieved: ${
        conversation.messages.length
      }`,
      {
        size: 9,
        color: GRAY,
      },
    );

    spacer(8);

    writeLine(
      "This export includes only messages associated with the selected reservation and verified against Twilio.",
      {
        size: 9,
        color: GRAY,
      },
    );

    spacer(8);

    if (
      !conversation.historicalCoverageComplete
    ) {
      writeLine(
        "IMPORTANT: Historical coverage is not guaranteed to be complete. Older or unassociated messages may not appear in this export.",
        {
          font: bold,
          size: 9,
          color: RED,
        },
      );

      spacer(8);
    }

    writeLine(
      "Times shown in Pacific Time. Messages are ordered chronologically.",
      {
        size: 9,
        color: GRAY,
      },
    );

    spacer(8);
    divider();

    if (
      conversation.messages.length === 0
    ) {
      writeLine(
        "No verified messages found for this reservation.",
      );
    }

    for (
      const message of
      conversation.messages
    ) {
      ensureSpace(62);

      const inbound =
        message.direction === "inbound";

      const label = inbound
        ? "GUEST"
        : "FIN & FEATHERS";

      const from = inbound
        ? conversation.guestPhone
        : conversation.restaurantPhone;

      const to = inbound
        ? conversation.restaurantPhone
        : conversation.guestPhone;

      const timestamp =
        formattedDate(
          message.dateCreated ??
          message.dateSent,
        );

      writeLine(
        `${label} | ${timestamp}`,
        {
          font: bold,
          size: 10,
        },
      );

      writeLine(
        `From: ${from}  To: ${to}`,
        {
          size: 8,
          color: GRAY,
        },
      );

      writeLine(
        `Status: ${
          message.status ||
          "Unavailable"
        }`,
        {
          size: 8,
          color: GRAY,
        },
      );

      spacer(4);

      writeLine(
        message.body ||
        "(Empty message)",
        {
          size: 10,
        },
      );

      spacer(7);
      divider();
    }

    const pages =
      pdf.getPages();

    pages.forEach(
      (pdfPage, index) => {
        const footer =
          `Fin & Feathers | Page ${
            index + 1
          } of ${pages.length}`;

        pdfPage.drawText(
          footer,
          {
            x: MARGIN,
            y: 22,
            size: 8,
            font: regular,
            color: GRAY,
          },
        );
      },
    );

    const pdfBytes =
      await pdf.save();

    const filename =
      `fin-feathers-conversation-${
        conversation.reservationId
      }.pdf`;

    return new NextResponse(
      Buffer.from(pdfBytes),
      {
        status: 200,
        headers: {
          "Content-Type":
            "application/pdf",
          "Content-Disposition":
            `attachment; filename="${filename}"`,
          "Cache-Control":
            "private, no-store, max-age=0",
          "X-Content-Type-Options":
            "nosniff",
        },
      },
    );
  } catch (error) {
    console.error(
      "Conversation PDF export failed:",
      {
        name:
          error instanceof Error
            ? error.name
            : "UnknownError",
      },
    );

    return jsonError(
      "Unable to generate the conversation PDF.",
      500,
    );
  }
}
