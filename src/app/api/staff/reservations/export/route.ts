
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { connection } from "next/server";

type ReservationRecord = {
  id: string;
  customer_name: string | null;
  customer_phone: string;
  email: string | null;
  reservation_date: string | null;
  reservation_time: string | null;
  party_size: number | null;
  occasion: string | null;
  vip_preference: string | null;
  request_status: string;
  details_validated: boolean;
  deposit_amount: number | null;
  deposit_status: string;
  interruption_reason: string | null;
  interruption_stage: string | null;
  staff_notes: string | null;
  confirmed_at: string | null;
  closed_at: string | null;
  created_at: string;
  updated_at: string;
};

const BATCH_SIZE = 500;

const EXPORT_COLUMNS =
  "id,customer_name,customer_phone,email,reservation_date,reservation_time,party_size,occasion,vip_preference,request_status,details_validated,deposit_amount,deposit_status,interruption_reason,interruption_stage,staff_notes,confirmed_at,closed_at,created_at,updated_at";

const HEADERS = [
  "Reservation ID",
  "Guest Name",
  "Phone",
  "Email",
  "Reservation Date",
  "Reservation Time",
  "Party Size",
  "Occasion",
  "VIP Preference",
  "Request Status",
  "Details Validated",
  "Deposit Amount",
  "Deposit Status",
  "Interruption Reason",
  "Interruption Stage",
  "Staff Notes",
  "Confirmed At",
  "Closed At",
  "Created At",
  "Updated At",
];

function errorResponse(
  message: string,
  status: number,
) {
  return NextResponse.json(
    { success: false, error: message },
    {
      status,
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}

function escapeCsvValue(
  value: string | number | boolean | null | undefined,
): string {
  if (value === null || value === undefined) {
    return "";
  }

  let text = String(value);

  // Prevent spreadsheet applications from interpreting
  // guest-controlled fields as executable formulas.
  if (/^[\s\u0000-\u001f]*[=+\-@]/u.test(text)) {
    text = `'${text}`;
  }

  return `"${text.replace(/"/g, '""')}"`;
}

function toCsvRow(
  values: Array<string | number | boolean | null | undefined>,
) {
  return values.map(escapeCsvValue).join(",");
}

function getEffectiveStatus(
  record: ReservationRecord,
) {
  if (
    (record.request_status === "incomplete" ||
      record.request_status === "unvalidated") &&
    !record.details_validated
  ) {
    return "unvalidated";
  }

  return record.request_status;
}

function recordToRow(record: ReservationRecord) {
  return toCsvRow([
    record.id,
    record.customer_name,
    record.customer_phone,
    record.email,
    record.reservation_date,
    record.reservation_time,
    record.party_size,
    record.occasion,
    record.vip_preference,
    getEffectiveStatus(record),
    record.details_validated,
    record.deposit_amount,
    record.deposit_status,
    record.interruption_reason,
    record.interruption_stage,
    record.staff_notes,
    record.confirmed_at,
    record.closed_at,
    record.created_at,
    record.updated_at,
  ]);
}

export async function GET(
  request: Request,
): Promise<NextResponse> {
  await connection();

  try {
    const supabase =
      await createSupabaseServerClient();

    // Authenticate using the existing staff session.
    const { data: claimsData, error: claimsError } =
      await supabase.auth.getClaims();

    const userId = claimsData?.claims?.sub;

    if (claimsError || !userId) {
      return errorResponse(
        "Please sign in to continue.",
        401,
      );
    }

    // Match the staff portal's manager-only access.
    const { data: role, error: roleError } =
      await supabase
        .from("staff_roles")
        .select("role, is_active")
        .eq("user_id", userId)
        .eq("is_active", true)
        .maybeSingle();

    if (
      roleError ||
      !role ||
      role.is_active !== true ||
      role.role !== "manager"
    ) {
      return errorResponse(
        "Manager access required.",
        403,
      );
    }

    const url = new URL(request.url);

    const search = (
      url.searchParams.get("q") ?? ""
    ).trim().slice(0, 100);

    const status = url.searchParams.get("status") ?? "all";

    const allowedStatuses = new Set([
      "all",
      "pending",
      "incomplete",
      "unvalidated",
      "confirmed",
      "closed",
    ]);

    if (!allowedStatuses.has(status)) {
      return errorResponse(
        "Invalid reservation status filter.",
        400,
      );
    }

    const sort =
      url.searchParams.get("sort") === "oldest"
        ? "oldest"
        : "newest";

    const ascending = sort === "oldest";

    // Keep search and status behavior aligned with
    // the production reservation queue.
    const makeQuery = () => {
      let query = supabase
        .from("reservation_requests")
        .select(EXPORT_COLUMNS);

      if (search) {
        const safeSearch = search
          .replace(/[,%()]/g, " ")
          .trim();

        if (safeSearch) {
          const digits = safeSearch.replace(/\D/g, "");
          const pattern = `%${safeSearch}%`;

          query =
            digits.length >= 3
              ? query.or(
                  `customer_name.ilike.${pattern},customer_phone.ilike.%${digits}%`,
                )
              : query.ilike(
                  "customer_name",
                  pattern,
                );
        }
      }

      if (status === "unvalidated") {
        query = query.or(
          "request_status.eq.unvalidated,and(request_status.eq.incomplete,details_validated.eq.false)",
        );
      } else if (status === "incomplete") {
        query = query
          .eq("request_status", "incomplete")
          .eq("details_validated", true);
      } else if (status !== "all") {
        query = query.eq("request_status", status);
      }

      return query
        .order("created_at", { ascending })
        .order("id", { ascending });
    };

    const csvLines: string[] = [
      toCsvRow(HEADERS),
    ];

    let offset = 0;

    // Fetch every matching page in controlled batches.
    // The normal queue's 10/20/50/100 pagination does
    // not limit this export.
    while (true) {
      const { data, error } = await makeQuery().range(
        offset,
        offset + BATCH_SIZE - 1,
      );

      if (error) {
        console.error("Reservation CSV export failed:", {
          code: error.code,
        });

        return errorResponse(
          "Unable to export reservations.",
          500,
        );
      }

      const batch = (data ?? []) as ReservationRecord[];

      for (const record of batch) {
        csvLines.push(recordToRow(record));
      }

      if (batch.length < BATCH_SIZE) {
        break;
      }

      offset += BATCH_SIZE;
    }

    const date = new Date()
      .toISOString()
      .slice(0, 10);

    const filename =
      `fin-feathers-reservations-${date}.csv`;

    // UTF-8 BOM helps Excel recognize international
    // guest names and other Unicode characters.
    const csv = `\uFEFF${csvLines.join("\r\n")}\r\n`;

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition":
          `attachment; filename="${filename}"`,
        "Cache-Control":
          "private, no-store, max-age=0",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("Reservation CSV export failed:", {
      name:
        error instanceof Error
          ? error.name
          : "UnknownError",
    });

    return errorResponse(
      "Unable to export reservations.",
      500,
    );
  }
}
