"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireManager } from "@/lib/auth/require-manager";

const GALLERY_ADMIN_PATH = "/admin/gallery";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

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

function optionalText(value: string | null): string | null {
  return value || null;
}

function isValidStoragePath(value: string): boolean {
  if (!value || value.length > 500) {
    return false;
  }

  if (
    value.startsWith("/") ||
    value.includes("\\") ||
    value.includes("..") ||
    value.includes("?") ||
    value.includes("#") ||
    value.includes("://")
  ) {
    return false;
  }

  return /^[a-zA-Z0-9/_-]+\.(jpg|jpeg|png|webp)$/i.test(value);
}

function refreshGalleryPages() {
  revalidatePath("/");
  revalidatePath(GALLERY_ADMIN_PATH);
}

export async function saveGalleryImage(formData: FormData) {
  const { supabase } = await requireManager();

  const idValue = getText(formData, "id", 36);
  const title = getText(formData, "title", 160);
  const description = getText(formData, "description", 3000);
  const altText = getText(formData, "alt_text", 300);
  const category = getText(formData, "category", 120);
  const storagePath = getText(formData, "storage_path", 500);
  const displayOrderValue = getText(
    formData,
    "display_order",
    20,
  );

  if (
    idValue === null ||
    title === null ||
    !title ||
    description === null ||
    altText === null ||
    !altText ||
    category === null ||
    !category ||
    storagePath === null ||
    !isValidStoragePath(storagePath) ||
    displayOrderValue === null
  ) {
    redirect(`${GALLERY_ADMIN_PATH}?error=invalid`);
  }

  const displayOrder = Number(displayOrderValue);

  if (
    !Number.isSafeInteger(displayOrder) ||
    displayOrder < 0
  ) {
    redirect(`${GALLERY_ADMIN_PATH}?error=invalid`);
  }

  const id = idValue === "" ? null : idValue;

  if (id !== null && !UUID_PATTERN.test(id)) {
    redirect(`${GALLERY_ADMIN_PATH}?error=invalid`);
  }

  const payload = {
    title,
    description: optionalText(description),
    alt_text: altText,
    category,
    storage_path: storagePath,
    display_order: displayOrder,
    is_active: formData.get("is_active") === "on",
  };

  if (id === null) {
    const { error } = await supabase
      .from("gallery_images")
      .insert(payload)
      .select("id")
      .single();

    if (error) {
      console.error("Gallery image insert failed:", {
        code: error.code,
        message: error.message,
      });

      redirect(`${GALLERY_ADMIN_PATH}?error=save`);
    }
  } else {
    const { data, error } = await supabase
      .from("gallery_images")
      .update(payload)
      .eq("id", id)
      .select("id")
      .maybeSingle();

    if (error || !data) {
      console.error("Gallery image update failed:", {
        code: error?.code,
        message: error?.message,
      });

      redirect(`${GALLERY_ADMIN_PATH}?error=save`);
    }
  }

  refreshGalleryPages();

  redirect(`${GALLERY_ADMIN_PATH}?saved=1`);
}

export async function setGalleryImageActive(
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
    (nextActive !== "true" && nextActive !== "false")
  ) {
    redirect(`${GALLERY_ADMIN_PATH}?error=invalid`);
  }

  const { data, error } = await supabase
    .from("gallery_images")
    .update({
      is_active: nextActive === "true",
    })
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error || !data) {
    console.error("Gallery visibility update failed:", {
      code: error?.code,
      message: error?.message,
    });

    redirect(`${GALLERY_ADMIN_PATH}?error=save`);
  }

  refreshGalleryPages();

  redirect(`${GALLERY_ADMIN_PATH}?saved=1`);
}