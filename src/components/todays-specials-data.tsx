import { Suspense } from "react";
import { connection } from "next/server";
import { createClient } from "@supabase/supabase-js";

import TodaySpecials, {
  type Special,
} from "@/components/todays-specials";

type DailySpecialRow = {
  day_of_week: string;
  title: string;
  offers: string[];
  start_time: string;
  end_time: string;
  thumbnail_url: string;
  video_url: string;
  description: string;
  details: string;
  fine_print: string;
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
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

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

function mapDailySpecial(row: DailySpecialRow): Special {
  return {
    day: row.day_of_week,
    title: row.title,
    offers: row.offers,
    start: row.start_time,
    end: row.end_time,
    thumbnail: row.thumbnail_url,
    video: row.video_url,
    description: row.description,
    details: row.details,
    finePrint: row.fine_print,
    enabled: row.is_active,
  };
}

async function TodaySpecialsContent() {
  await connection();

  let specials: Special[] = [];

  try {
    const supabase = getSupabaseClient();

    if (!supabase) {
      console.error(
        "SPECIALS loading failed: Public Supabase configuration is missing.",
      );
    } else {
      const { data, error } = await supabase
        .from("daily_specials")
        .select(
          "day_of_week,title,offers,start_time,end_time,thumbnail_url,video_url,description,details,fine_print,is_active",
        )
        .eq("is_active", true);

      if (error) {
        console.error("SPECIALS query failed:", {
          code: error.code,
          message: error.message,
        });
      } else {
        specials = ((data ?? []) as DailySpecialRow[])
          .filter((row) =>
            WEEKDAYS.some(
              (weekday) => weekday === row.day_of_week,
            ),
          )
          .sort(
            (a, b) =>
              WEEKDAYS.indexOf(
                a.day_of_week as (typeof WEEKDAYS)[number],
              ) -
              WEEKDAYS.indexOf(
                b.day_of_week as (typeof WEEKDAYS)[number],
              ),
          )
          .map(mapDailySpecial);
      }
    }
  } catch (error) {
    console.error(
      "SPECIALS loading failed:",
      error instanceof Error
        ? error.message
        : "Unknown error",
    );
  }

  return <TodaySpecials specials={specials} />;
}

function TodaySpecialsLoading() {
  return (
    <div
      role="status"
      aria-label="Loading daily specials"
      className="mx-auto mt-5 w-full max-w-4xl"
    >
      <div className="min-h-28 animate-pulse rounded-xl border border-white/10 bg-[#101010]" />
      <span className="sr-only">
        Loading today's special...
      </span>
    </div>
  );
}

export default function TodaySpecialsData() {
  return (
    <Suspense fallback={<TodaySpecialsLoading />}>
      <TodaySpecialsContent />
    </Suspense>
  );
}