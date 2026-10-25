
import { NextResponse } from "next/server";
import {
  PDFDocument,
  StandardFonts,
  rgb,
  type PDFFont,
  type PDFPage,
} from "pdf-lib";
import { GET as getConversation } from "../route";

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
};

type ConversationData = {
  success: boolean;
  reservationId?: string;
  guestName?: string | null;
  guestPhone?: string;
  restaurantPhone?: string;
  messages?: ConversationMessage[];
  historyMayBeTruncated?: boolean;
  error?: string;
};

const PAGE_WIDTH = 612;
const PAGE_HEIGHT = 792;
const MARGIN = 44;
const LINE_HEIGHT = 15;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

const BLACK = rgb(0.13, 0.13, 0.13);
const GRAY = rgb(0.38, 0.38, 0.38);
const RED = rgb(0.918, 0.106, 0.141);

// Standard PDF fonts do not support all Unicode glyphs.
// Preserve common punctuation and clearly substitute
// unsupported characters instead of crashing the export.
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

      if (character === "\n" || character === "\t") {
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

  for (const paragraph of safePdfText(text).split("\n")) {
    if (!paragraph) {
      result.push("");
      continue;
    }

    let line = "";

    for (const word of paragraph.split(/\s+/)) {
      let remaining = word;

      while (
        remaining &&
        font.widthOfTextAtSize(remaining, size) > maxWidth
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

        result.push(remaining.slice(0, index));
        remaining = remaining.slice(index);
      }

      if (!remaining) continue;

      const candidate = line
        ? `${line} ${remaining}`
        : remaining;

      if (
        font.widthOfTextAtSize(candidate, size) <= maxWidth
      ) {
        line = candidate;
      } else {
        if (line) result.push(line);
        line = remaining;
      }
    }

    if (line) result.push(line);
  }

  return result;
}

function formattedDate(value: string | null): string {
  if (!value) return "Time unavailable";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Time unavailable";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "America/Los_Angeles",
    timeZoneName: "short",
  }).format(date);
}

function jsonError(message: string, status: number) {
  return NextResponse.json(
    { success: false, error: message },
    {
      status,
      headers: { "Cache-Control": "no-store" },
    },
  );
}

export async function GET(
  request: Request,
  context: RouteContext,
): Promise<NextResponse> {
  // Reuse the existing authenticated conversation
  // handler. It performs manager checks and obtains
  // the guest phone from the reservation database.
  const response = await getConversation(request, context);

  if (!response.ok) {
    return response;
  }

  try {
    const conversation =
      (await response.json()) as ConversationData;

    if (
      !conversation.success ||
      !conversation.reservationId ||
      !Array.isArray(conversation.messages)
    ) {
      return jsonError(
        "Conversation history is unavailable.",
        502,
      );
    }

    const pdf = await PDFDocument.create();
    const regular = await pdf.embedFont(
      StandardFonts.Helvetica,
    );
    const bold = await pdf.embedFont(
      StandardFonts.HelveticaBold,
    );

    pdf.setTitle("Fin & Feathers Guest Conversation");
    pdf.setAuthor("Fin & Feathers Las Vegas");
    pdf.setSubject("Reservation SMS conversation export");

    let page: PDFPage = pdf.addPage([
      PAGE_WIDTH,
      PAGE_HEIGHT,
    ]);

    let cursorY = PAGE_HEIGHT - MARGIN;

    function newPage() {
      page = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
      cursorY = PAGE_HEIGHT - MARGIN;
    }

    function ensureSpace(height: number) {
      if (cursorY - height < MARGIN + 25) {
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
      const size = options.size ?? 10;
      const font = options.font ?? regular;
      const indent = options.indent ?? 0;
      const color = options.color ?? BLACK;

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

    function spacer(height = 12) {
      ensureSpace(height);
      cursorY -= height;
    }

    function divider() {
      ensureSpace(15);
      page.drawLine({
        start: { x: MARGIN, y: cursorY },
        end: {
          x: PAGE_WIDTH - MARGIN,
          y: cursorY,
        },
        thickness: 0.7,
        color: rgb(0.83, 0.83, 0.83),
      });
      cursorY -= 15;
    }

    writeLine("FIN & FEATHERS LAS VEGAS", {
      font: bold,
      size: 16,
      color: RED,
    });

    spacer(5);

    writeLine("Guest SMS Conversation", {
      font: bold,
      size: 13,
    });

    spacer(8);

    writeLine(
      `Guest: ${conversation.guestName || "Not provided"}`,
    );
    writeLine(
      `Guest phone: ${conversation.guestPhone || "Unavailable"}`,
    );
    writeLine(
      `Restaurant phone: ${conversation.restaurantPhone || "Unavailable"}`,
    );
    writeLine(
      `Reservation ID: ${conversation.reservationId}`,
      { size: 9 },
    );
    writeLine(
      `Exported: ${formattedDate(new Date().toISOString())}`,
      { size: 9, color: GRAY },
    );
    writeLine(
      `Messages retrieved: ${conversation.messages.length}`,
      { size: 9, color: GRAY },
    );

    spacer(8);

    if (conversation.historyMayBeTruncated) {
      writeLine(
        "IMPORTANT: This export may omit older messages because the conversation API has a retrieval limit.",
        {
          font: bold,
          size: 9,
          color: RED,
        },
      );
      spacer(8);
    }

    writeLine(
      "Times shown in Pacific Time. This document is an export of the messages returned by the conversation service.",
      { size: 9, color: GRAY },
    );

    spacer(8);
    divider();

    const messages = [...conversation.messages].sort(
      (a, b) =>
        Date.parse(a.dateCreated ?? "") -
          Date.parse(b.dateCreated ?? "") ||
        a.sid.localeCompare(b.sid),
    );

    if (messages.length === 0) {
      writeLine("No messages found.");
    }

    for (const message of messages) {
      ensureSpace(62);

      const label =
        message.direction === "inbound"
          ? "GUEST"
          : "FIN & FEATHERS";

      const timestamp = formattedDate(
        message.dateCreated ?? message.dateSent,
      );

      writeLine(
        `${label} | ${timestamp}`,
        { font: bold, size: 10 },
      );

      writeLine(
        `From: ${message.from}  To: ${message.to}`,
        { size: 8, color: GRAY },
      );

      writeLine(
        `Status: ${message.status || "Unavailable"}`,
        { size: 8, color: GRAY },
      );

      spacer(4);

      writeLine(message.body || "(Empty message)", {
        size: 10,
      });

      spacer(7);
      divider();
    }

    const pages = pdf.getPages();

    pages.forEach((pdfPage, index) => {
      const footer = `Fin & Feathers | Page ${index + 1} of ${pages.length}`;

      pdfPage.drawText(footer, {
        x: MARGIN,
        y: 22,
        size: 8,
        font: regular,
        color: GRAY,
      });
    });

    const pdfBytes = await pdf.save();

    const filename =
      `fin-feathers-conversation-${conversation.reservationId}.pdf`;

    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition":
          `attachment; filename="${filename}"`,
        "Cache-Control": "private, no-store, max-age=0",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("Conversation PDF export failed:", {
      name:
        error instanceof Error
          ? error.name
          : "UnknownError",
    });

    return jsonError(
      "Unable to generate the conversation PDF.",
      500,
    );
  }
}
