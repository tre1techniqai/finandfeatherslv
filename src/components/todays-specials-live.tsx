
import { Suspense } from "react";
import { connection } from "next/server";
import { createClient } from "@supabase/supabase-js";

import TodaySpecialsData, {
  type Special,
} from "@/components/todays-specials-data";

type DailySpecialRecord = {
  day_of_week: string;
  title: string;
  offers: string[] | null;
  start_time: string;
  end_time: string;
  thumbnail_url: string;
  video_url: string;
  description: string | null;
  details: string | null;
  fine_print: string | null;
  is_active: boolean;
};

const WEEKDAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;

  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return null;
  }

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

function mapDailySpecial(
  record: DailySpecialRecord,
): Special {
  return {
    day: record.day_of_week,
    title: record.title,
    offers: Array.isArray(record.offers)
      ? record.offers.filter(
          (offer): offer is string =>
            typeof offer === "string",
        )
      : [],
    start: record.start_time,
    end: record.end_time,
    thumbnail: record.thumbnail_url,
    video: record.video_url,
    description: record.description ?? "",
    details: record.details ?? "",
    finePrint: record.fine_print ?? "",
    enabled: record.is_active,
  };
}

async function LiveSpecialsContent() {
  // Database access must occur during an actual
  // request rather than during static prerendering.
  await connection();

  const supabase = getSupabaseClient();

  if (!supabase) {
    console.error(
      "Public SPECIALS: Supabase configuration unavailable.",
    );
    return null;
  }

  const { data, error } = await supabase
    .from("daily_specials")
    .select(
      "day_of_week,title,offers,start_time,end_time,thumbnail_url,video_url,description,details,fine_print,is_active",
    );

  if (error) {
    console.error("Public SPECIALS query failed:", {
      code: error.code,
      message: error.message,
    });

    return null;
  }

  const records = (data ?? []) as DailySpecialRecord[];

  if (records.length === 0) {
    return null;
  }

  const specials = records
    .filter((record) =>
      WEEKDAYS.some(
        (day) => day === record.day_of_week,
      ),
    )
    .map(mapDailySpecial)
    .sort(
      (a, b) =>
        WEEKDAYS.indexOf(
          a.day as (typeof WEEKDAYS)[number],
        ) -
        WEEKDAYS.indexOf(
          b.day as (typeof WEEKDAYS)[number],
        ),
    );

  if (specials.length === 0) {
    return null;
  }

  return <TodaySpecialsData specials={specials} />;
}

export default function TodaySpecialsLive() {
  return (
    <Suspense fallback={null}>
      <LiveSpecialsContent />
    </Suspense>
  );
}
