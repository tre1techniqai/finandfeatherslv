"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireManager } from "@/lib/auth/require-manager";

const SPECIALS_ADMIN_PATH = "/admin/specials";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const WEEKDAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

const TIME_PATTERN = /^(1[0-2]|[1-9]):[0-5][0-9] (AM|PM)$/;

function getText(
  formData: FormData,
  key: string,
  maxLength: number,
): string | null {
  const value = formData.get(key);

  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();

  if (trimmed.length > maxLength) {
    return null;
  }

  return trimmed;
}

function isValidWeekday(value: string): boolean {
  return WEEKDAYS.some((day) => day === value);
}

function isValidMediaUrl(
  value: string,
  extensions: string[],
): boolean {
  try {
    const url = new URL(value);

    if (url.protocol !== "https:") {
      return false;
    }

    if (url.username || url.password) {
      return false;
    }

    if (url.search || url.hash) {
      return false;
    }

    if (
      !url.pathname.includes(
        "/storage/v1/object/public/website-media/specials/",
      )
    ) {
      return false;
    }

    const extension = url.pathname
      .split(".")
      .pop()
      ?.toLowerCase();

    return Boolean(
      extension && extensions.includes(extension),
    );
  } catch {
    return false;
  }
}

function getOffers(formData: FormData): string[] | null {
  const value = getText(formData, "offers", 4000);

  if (value === null) {
    return null;
  }

  const offers = value
    .split(/\r?\n/)
    .map((offer) => offer.trim())
    .filter(Boolean);

  if (
    offers.length === 0 ||
    offers.length > 20 ||
    offers.some((offer) => offer.length > 200)
  ) {
    return null;
  }

  return offers;
}

function refreshSpecialsPages() {
  revalidatePath("/");
  revalidatePath(SPECIALS_ADMIN_PATH);
}

export async function saveDailySpecial(
  formData: FormData,
) {
  const { supabase } = await requireManager();

  const idValue = getText(formData, "id", 36);
  const dayOfWeek = getText(formData, "day_of_week", 20);
  const title = getText(formData, "title", 160);
  const offers = getOffers(formData);
  const startTime = getText(formData, "start_time", 20);
  const endTime = getText(formData, "end_time", 20);
  const thumbnailUrl = getText(
    formData,
    "thumbnail_url",
    1000,
  );
  const videoUrl = getText(formData, "video_url", 1000);
  const description = getText(
    formData,
    "description",
    3000,
  );
  const details = getText(formData, "details", 5000);
  const finePrint = getText(
    formData,
    "fine_print",
    3000,
  );

  const menuItemIdValue = getText(
    formData,
    "menu_item_id",
    20,
  );

  if (
    idValue === null ||
    !dayOfWeek ||
    !isValidWeekday(dayOfWeek) ||
    !title ||
    !offers ||
    !startTime ||
    !TIME_PATTERN.test(startTime) ||
    !endTime ||
    !TIME_PATTERN.test(endTime) ||
    !thumbnailUrl ||
    !isValidMediaUrl(thumbnailUrl, [
      "jpg",
      "jpeg",
      "png",
      "webp",
    ]) ||
    !videoUrl ||
    !isValidMediaUrl(videoUrl, ["mp4"]) ||
    description === null ||
    details === null ||
    finePrint === null ||
    menuItemIdValue === null
  ) {
    redirect(`${SPECIALS_ADMIN_PATH}?error=invalid`);
  }

  const id = idValue === "" ? null : idValue;

  if (id !== null && !UUID_PATTERN.test(id)) {
    redirect(`${SPECIALS_ADMIN_PATH}?error=invalid`);
  }

  let menuItemId: number | null = null;

  if (menuItemIdValue !== "") {
    const parsed = Number(menuItemIdValue);

    if (
      !Number.isSafeInteger(parsed) ||
      parsed <= 0
    ) {
      redirect(`${SPECIALS_ADMIN_PATH}?error=invalid`);
    }

    menuItemId = parsed;

    const { data: menuItem, error: menuError } =
      await supabase
        .from("menu_items")
        .select("id")
        .eq("id", menuItemId)
        .maybeSingle();

    if (menuError || !menuItem) {
      redirect(`${SPECIALS_ADMIN_PATH}?error=invalid`);
    }
  }

  const payload = {
    day_of_week: dayOfWeek,
    title,
    offers,
    start_time: startTime,
    end_time: endTime,
    thumbnail_url: thumbnailUrl,
    video_url: videoUrl,
    description,
    details,
    fine_print: finePrint,
    menu_item_id: menuItemId,
    is_active: formData.get("is_active") === "on",
  };

  if (id === null) {
    const { error } = await supabase
      .from("daily_specials")
      .insert(payload)
      .select("id")
      .single();

    if (error) {
      console.error("Daily special insert failed:", {
        code: error.code,
        message: error.message,
      });

      redirect(`${SPECIALS_ADMIN_PATH}?error=save`);
    }
  } else {
    const { data, error } = await supabase
      .from("daily_specials")
      .update(payload)
      .eq("id", id)
      .select("id")
      .maybeSingle();

    if (error || !data) {
      console.error("Daily special update failed:", {
        code: error?.code,
        message: error?.message,
      });

      redirect(`${SPECIALS_ADMIN_PATH}?error=save`);
    }
  }

  refreshSpecialsPages();

  redirect(`${SPECIALS_ADMIN_PATH}?saved=1`);
}

export async function setDailySpecialActive(
  formData: FormData,
) {
  const { supabase } = await requireManager();

  const id = getText(formData, "id", 36);
  const nextActive = getText(
    formData,
    "next_active",
    5,
  );

  if (
    !id ||
    !UUID_PATTERN.test(id) ||
    (nextActive !== "true" &&
      nextActive !== "false")
  ) {
    redirect(`${SPECIALS_ADMIN_PATH}?error=invalid`);
  }

  const { data, error } = await supabase
    .from("daily_specials")
    .update({
      is_active: nextActive === "true",
    })
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error || !data) {
    console.error("Daily special visibility update failed:", {
      code: error?.code,
      message: error?.message,
    });

    redirect(`${SPECIALS_ADMIN_PATH}?error=save`);
  }

  refreshSpecialsPages();

  redirect(`${SPECIALS_ADMIN_PATH}?saved=1`);
}