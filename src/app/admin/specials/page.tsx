
import { Suspense } from "react";
import { connection } from "next/server";
import Link from "next/link";

import { requireManager } from "@/lib/auth/require-manager";
import SpecialsImagePanel from "@/components/admin/specials-image-panel";
import {
  saveDailySpecial,
  setDailySpecialActive,
} from "./actions";

export const metadata = {
  title: "SPECIALS Management | Fin & Feathers Las Vegas",
  description:
    "Restricted daily specials management for authorized managers.",
};

type DailySpecial = {
  id: string;
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
  menu_item_id: number | null;
  is_active: boolean;
  updated_at: string;
};

type AdminSpecialsPageProps = {
  searchParams: Promise<{
    saved?: string;
    error?: string;
  }>;
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

const inputClass =
  "min-h-11 w-full min-w-0 rounded-lg border border-white/15 bg-zinc-950 px-3 py-2.5 text-base text-white outline-none transition placeholder:text-zinc-600 focus:border-[#ea1b24] focus:ring-1 focus:ring-[#ea1b24] sm:text-sm";

function DashboardLoading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-black px-5 text-white">
      <p className="text-sm text-zinc-300" role="status">
        Verifying manager access...
      </p>
    </main>
  );
}

function TextField({
  label,
  name,
  defaultValue,
  placeholder,
  required = false,
  type = "text",
}: {
  label: string;
  name: string;
  defaultValue?: string | number | null;
  placeholder?: string;
  required?: boolean;
  type?: string;
}) {
  return (
    <label className="block min-w-0">
      <span className="mb-2 block text-sm font-medium text-zinc-300">
        {label}
      </span>

      <input
        name={name}
        type={type}
        defaultValue={defaultValue ?? ""}
        placeholder={placeholder}
        required={required}
        className={inputClass}
      />
    </label>
  );
}

function TextAreaField({
  label,
  name,
  defaultValue,
  placeholder,
  rows = 3,
  required = false,
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
  placeholder?: string;
  rows?: number;
  required?: boolean;
}) {
  return (
    <label className="block min-w-0">
      <span className="mb-2 block text-sm font-medium text-zinc-300">
        {label}
      </span>

      <textarea
        name={name}
        defaultValue={defaultValue ?? ""}
        placeholder={placeholder}
        rows={rows}
        required={required}
        className={`${inputClass} leading-6`}
      />
    </label>
  );
}

function CheckField({
  label,
  name,
  defaultChecked = false,
}: {
  label: string;
  name: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="flex min-h-12 cursor-pointer items-center gap-3 rounded-lg border border-white/10 bg-black/40 px-3 py-2.5 text-sm text-zinc-200">
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        className="h-4 w-4 shrink-0 accent-[#ea1b24]"
      />

      <span>{label}</span>
    </label>
  );
}

function DayField({
  day,
  missingDays,
}: {
  day?: string;
  missingDays: string[];
}) {
  if (day) {
    return (
      <>
        <input
          type="hidden"
          name="day_of_week"
          value={day}
        />

        <div>
          <span className="mb-2 block text-sm font-medium text-zinc-300">
            Weekday
          </span>

          <p className="flex min-h-11 items-center rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm text-white">
            {day}
          </p>

          <p className="mt-2 text-xs text-zinc-500">
            The weekday is locked for existing promotions.
          </p>
        </div>
      </>
    );
  }

  return (
    <label className="block min-w-0">
      <span className="mb-2 block text-sm font-medium text-zinc-300">
        Weekday
      </span>

      <select
        name="day_of_week"
        defaultValue=""
        required
        className={inputClass}
      >
        <option value="" disabled>
          Select an available weekday
        </option>

        {missingDays.map((missingDay) => (
          <option key={missingDay} value={missingDay}>
            {missingDay}
          </option>
        ))}
      </select>
    </label>
  );
}

function SpecialEditor({
  item,
  missingDays = [],
}: {
  item?: DailySpecial;
  missingDays?: string[];
}) {
  const isNew = !item;
  const offersText = item?.offers.join("\n") ?? "";

  return (
    <details className="group min-w-0 overflow-hidden rounded-xl border border-white/10 bg-zinc-950/90 transition-colors open:border-white/20">
      <summary className="cursor-pointer list-none px-4 py-4 outline-none transition hover:bg-white/[0.04] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#ea1b24] [&::-webkit-details-marker]:hidden sm:px-5">
        <div className="flex min-w-0 items-start gap-3">
          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-white/10 bg-zinc-900 sm:h-24 sm:w-24">
            {item?.thumbnail_url ? (
              // Existing image URLs come from Supabase Storage.
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.thumbnail_url}
                alt={`${item.title} promotional thumbnail`}
                loading="lazy"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center px-2 text-center text-xs text-zinc-500">
                No image
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#ea1b24]">
              {item?.day_of_week ?? "New promotion"}
            </p>

            <h3 className="mt-1 break-words text-base font-semibold leading-snug text-white">
              {item?.title ?? "Add a daily special"}
            </h3>

            <p className="mt-1.5 text-xs leading-5 text-zinc-400">
              {item
                ? `${item.start_time} – ${item.end_time}`
                : "Create a promotion for a missing weekday"}
            </p>

            {item ? (
              <>
                <p className="mt-1 text-xs text-zinc-400">
                  {item.offers.length}{" "}
                  {item.offers.length === 1
                    ? "offer"
                    : "offers"}
                </p>

                <span
                  className={`mt-2 inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
                    item.is_active
                      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                      : "border-zinc-500/30 bg-zinc-500/10 text-zinc-400"
                  }`}
                >
                  {item.is_active ? "Active" : "Inactive"}
                </span>
              </>
            ) : null}
          </div>

          <span className="flex shrink-0 items-center gap-1.5 pt-0.5 text-xs font-semibold text-zinc-400 group-open:text-white">
            <span className="group-open:hidden">
              {isNew ? "Add" : "Edit"}
            </span>

            <span className="hidden group-open:inline">
              Close
            </span>

            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="h-4 w-4 transition-transform group-open:rotate-180"
            >
              <path
                d="m6 9 6 6 6-6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </div>
      </summary>

      <div className="border-t border-white/10 p-4 sm:p-5">
        <form action={saveDailySpecial} className="space-y-6">
          <input
            type="hidden"
            name="id"
            value={item?.id ?? ""}
          />

          <fieldset className="space-y-4">
            <legend className="mb-4 text-sm font-bold uppercase tracking-wider text-zinc-300">
              Basic details
            </legend>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <DayField
                day={item?.day_of_week}
                missingDays={missingDays}
              />

              <TextField
                label="Promotion title"
                name="title"
                defaultValue={item?.title}
                placeholder="e.g. Margarita Monday"
                required
              />
            </div>

            <TextAreaField
              label="Promotional offers"
              name="offers"
              defaultValue={offersText}
              placeholder={"$5 Margaritas\n$5 Chicken Tacos"}
              rows={5}
              required
            />

            <p className="text-xs leading-5 text-zinc-500">
              Enter one offer per line. Each line becomes a
              separate promotional offer on the public website.
              These offers do not change regular MENU prices.
            </p>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <TextField
                label="Advertised start time"
                name="start_time"
                defaultValue={item?.start_time ?? "11:00 AM"}
                placeholder="11:00 AM"
                required
              />

              <TextField
                label="Advertised end time"
                name="end_time"
                defaultValue={item?.end_time ?? "12:00 AM"}
                placeholder="12:00 AM"
                required
              />
            </div>

            <p className="text-xs leading-5 text-zinc-500">
              Use the format 11:00 AM or 8:30 PM.
              These times describe the promotion but do not
              automatically control its public visibility.
            </p>

            <TextAreaField
              label="Description"
              name="description"
              defaultValue={item?.description}
              placeholder="Optional promotional description..."
            />

            <TextAreaField
              label="Additional details"
              name="details"
              defaultValue={item?.details}
              placeholder="Optional offer details..."
            />

            <TextAreaField
              label="Fine print"
              name="fine_print"
              defaultValue={item?.fine_print}
              placeholder="Optional approved restrictions or conditions..."
            />
          </fieldset>

          <fieldset className="space-y-4 border-t border-white/10 pt-5">
            <legend className="text-sm font-bold uppercase tracking-wider text-zinc-300">
              Promotional media
            </legend>

            <SpecialsImagePanel
              initialImageUrl={item?.thumbnail_url}
            />

            <TextField
              label="Thumbnail image URL"
              name="thumbnail_url"
              defaultValue={item?.thumbnail_url}
              placeholder="https://.../website-media/specials/image.jpg"
              type="url"
              required
            />

            {item?.video_url ? (
              <video
                controls
                preload="none"
                playsInline
                className="w-full max-w-md rounded-lg border border-white/10 bg-black"
              >
                <source
                  src={item.video_url}
                  type="video/mp4"
                />
                Your browser does not support video playback.
              </video>
            ) : null}

            <TextField
              label="Promotional video URL"
              name="video_url"
              defaultValue={item?.video_url}
              placeholder="https://.../website-media/specials/video.mp4"
              type="url"
              required
            />

            <p className="text-xs leading-5 text-zinc-400">
              Use the thumbnail editor to upload and crop a 4:3
              WebP image to Supabase Storage. After the upload
              succeeds, the Thumbnail Image URL field updates
              automatically. Click Save Changes or Create Daily
              Special to publish the replacement thumbnail.

              Promotional videos continue to use their existing
              public Supabase Storage URLs.
            </p>
          </fieldset>

          <fieldset className="space-y-4 border-t border-white/10 pt-5">
            <legend className="text-sm font-bold uppercase tracking-wider text-zinc-300">
              Menu association and publication
            </legend>

            <TextField
              label="Linked MENU item ID (optional)"
              name="menu_item_id"
              type="number"
              defaultValue={item?.menu_item_id}
              placeholder="Leave blank for standalone promotions"
            />

            <p className="text-xs leading-5 text-zinc-500">
              An existing MENU item may be linked for future
              integration. This does not change its price,
              description, availability, or image.
            </p>

            <CheckField
              label="Active on the public SPECIALS section"
              name="is_active"
              defaultChecked={item?.is_active ?? true}
            />
          </fieldset>

          <div className="flex flex-col gap-3 border-t border-white/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs leading-5 text-zinc-500">
              {item
                ? "Save changes to update this daily promotion."
                : "Create the missing weekday promotion."}
            </p>

            <button
              type="submit"
              className="inline-flex min-h-12 w-full items-center justify-center rounded-lg bg-[#ea1b24] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:w-auto"
            >
              {isNew
                ? "Create Daily Special"
                : "Save Changes"}
            </button>
          </div>
        </form>

        {item ? (
          <form
            action={setDailySpecialActive}
            className="mt-4 border-t border-white/10 pt-4"
          >
            <input
              type="hidden"
              name="id"
              value={item.id}
            />

            <input
              type="hidden"
              name="next_active"
              value={item.is_active ? "false" : "true"}
            />

            <button
              type="submit"
              className="inline-flex min-h-11 w-full items-center justify-center rounded-lg border border-white/15 px-4 py-2 text-sm font-semibold text-zinc-200 transition hover:border-white/30 hover:bg-white/5 sm:w-auto"
            >
              {item.is_active
                ? "Deactivate Special"
                : "Reactivate Special"}
            </button>
          </form>
        ) : null}
      </div>
    </details>
  );
}

async function ProtectedSpecialsDashboard({
  searchParams,
}: AdminSpecialsPageProps) {
  await connection();

  const { supabase } = await requireManager();
  const params = await searchParams;

  const { data, error } = await supabase
    .from("daily_specials")
    .select(
      "id,day_of_week,title,offers,start_time,end_time,thumbnail_url,video_url,description,details,fine_print,menu_item_id,is_active,updated_at",
    );

  const specials = ((data ?? []) as DailySpecial[]).sort(
    (a, b) =>
      WEEKDAYS.indexOf(
        a.day_of_week as (typeof WEEKDAYS)[number],
      ) -
      WEEKDAYS.indexOf(
        b.day_of_week as (typeof WEEKDAYS)[number],
      ),
  );

  const activeCount = specials.filter(
    (special) => special.is_active,
  ).length;

  const inactiveCount = specials.length - activeCount;

  const occupiedDays = new Set(
    specials.map((special) => special.day_of_week),
  );

  const missingDays = WEEKDAYS.filter(
    (day) => !occupiedDays.has(day),
  );

  return (
    <main className="w-full flex-1 bg-black px-3 py-6 text-white sm:px-8 sm:py-12">
      <div className="mx-auto max-w-6xl">
        {/*
          Page-specific action.
          Navigation and Sign Out are supplied
          by the shared Admin Portal header.
        */}
        <div className="flex flex-col gap-3 border-b border-white/10 pb-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-2xl text-sm leading-6 text-zinc-400">
            Manage weekday promotions, advertised hours,
            promotional content, and publication status.
          </p>

          <Link
            href="/"
            className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-lg border border-white/15 px-4 py-2.5 text-center text-sm font-medium text-white transition hover:bg-white/10"
          >
            View Public SPECIALS
          </Link>
        </div>

        {params.saved === "1" ? (
          <div
            role="status"
            className="mt-5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200"
          >
            SPECIALS changes saved successfully.
          </div>
        ) : null}

        {params.error === "invalid" ? (
          <div
            role="alert"
            className="mt-5 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200"
          >
            Some fields are missing or invalid.
            Review the form and try again.
          </div>
        ) : null}

        {params.error === "save" || error ? (
          <div
            role="alert"
            className="mt-5 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200"
          >
            The SPECIALS records could not be loaded or saved.
            Confirm the manager database policies and try again.
          </div>
        ) : null}

        {error ? (
          <section className="mt-6 rounded-xl border border-white/10 bg-white/[0.03] p-5">
            <h2 className="font-semibold">
              SPECIALS records unavailable
            </h2>

            <p className="mt-2 text-sm leading-6 text-zinc-400">
              The manager session was verified, but Supabase
              did not return the SPECIALS records.
              Check the database policies before editing.
            </p>
          </section>
        ) : (
          <>
            <section
              aria-label="SPECIALS inventory statistics"
              className="grid grid-cols-3 gap-2 py-5 sm:gap-4 sm:py-7"
            >
              <div className="min-w-0 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-3 sm:p-5">
                <p className="text-xs text-zinc-400 sm:text-sm">
                  Total specials
                </p>
                <p className="mt-1 text-xl font-bold tabular-nums sm:mt-2 sm:text-3xl">
                  {specials.length}
                </p>
              </div>

              <div className="min-w-0 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-3 sm:p-5">
                <p className="text-xs text-zinc-400 sm:text-sm">
                  Active
                </p>
                <p className="mt-1 text-xl font-bold tabular-nums text-emerald-300 sm:mt-2 sm:text-3xl">
                  {activeCount}
                </p>
              </div>

              <div className="min-w-0 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-3 sm:p-5">
                <p className="text-xs text-zinc-400 sm:text-sm">
                  Inactive
                </p>
                <p className="mt-1 text-xl font-bold tabular-nums text-zinc-300 sm:mt-2 sm:text-3xl">
                  {inactiveCount}
                </p>
              </div>
            </section>

            {missingDays.length > 0 ? (
              <section className="mb-9 space-y-3">
                <div>
                  <h2 className="text-lg font-semibold sm:text-xl">
                    Add a daily special
                  </h2>

                  <p className="mt-1 text-sm text-zinc-400">
                    Create promotions for weekdays that do
                    not already have a SPECIALS record.
                  </p>
                </div>

                <SpecialEditor missingDays={missingDays} />
              </section>
            ) : null}

            <section
              aria-labelledby="existing-specials-title"
              className="space-y-4 sm:mt-4"
            >
              <div className="flex flex-wrap items-end justify-between gap-2">
                <div>
                  <h2
                    id="existing-specials-title"
                    className="text-lg font-semibold sm:text-xl"
                  >
                    Weekly SPECIALS
                  </h2>

                  <p className="mt-1 text-sm text-zinc-400">
                    Expand a weekday card to edit its offers,
                    hours, descriptions, media references,
                    or publication status.
                  </p>
                </div>

                <p className="text-xs text-zinc-500">
                  Monday through Sunday
                </p>
              </div>

              {specials.length === 0 ? (
                <p className="rounded-xl border border-white/10 p-5 text-sm text-zinc-400">
                  No daily SPECIALS records were returned.
                </p>
              ) : (
                <div className="grid grid-cols-1 items-start gap-3 lg:grid-cols-3 lg:gap-4">
                  {specials.map((item) => (
                    <SpecialEditor
                      key={item.id}
                      item={item}
                    />
                  ))}
                </div>
              )}
            </section>

            <section className="mt-8 rounded-xl border border-white/10 bg-white/[0.03] p-4 sm:p-5">
              <h2 className="text-sm font-semibold text-white">
                Phase 1 publishing behavior
              </h2>

              <p className="mt-2 text-sm leading-6 text-zinc-400">
                This editor manages database records.
                The public SPECIALS component currently
                uses its original hardcoded promotions.
                Database edits will not appear on the
                homepage until the public component is
                connected in a later development step.
              </p>
            </section>
          </>
        )}
      </div>
    </main>
  );
}

export default function AdminSpecialsPage(
  props: AdminSpecialsPageProps,
) {
  return (
    <Suspense fallback={<DashboardLoading />}>
      <ProtectedSpecialsDashboard
        searchParams={props.searchParams}
      />
    </Suspense>
  );
}
