"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireManager } from "@/lib/auth/require-manager";
import { createSupabaseServerClient } from "@/lib/supabase/server";

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

function refreshMenuPages() {
  revalidatePath("/menu");
  revalidatePath("/admin/menu");
}

export async function signOutManager(_formData: FormData) {
  const supabase = await createSupabaseServerClient();

  await supabase.auth.signOut();

  redirect("/admin/login");
}

export async function saveMenuItem(formData: FormData) {
  const { supabase } = await requireManager();

  const idValue = getText(formData, "id", 30);
  const itemName = getText(formData, "item_name", 160);
  const description = getText(formData, "description", 3000);
  const price = getText(formData, "price", 100);
  const priceNotes = getText(formData, "price_options_notes", 1500);
  const menuType = getText(formData, "menu_type", 20);
  const subcategory = getText(formData, "subcategory", 120);
  const tags = getText(formData, "tags", 500);
  const imageUrl = getText(formData, "image_url", 2048);
  const displayOrderValue = getText(formData, "display_order", 20);

  if (
    idValue === null ||
    itemName === null ||
    !itemName ||
    description === null ||
    price === null ||
    priceNotes === null ||
    (menuType !== "Food" && menuType !== "Drink") ||
    subcategory === null ||
    !subcategory ||
    tags === null ||
    imageUrl === null ||
    displayOrderValue === null
  ) {
    redirect("/admin/menu?error=invalid");
  }

  const displayOrder = Number(displayOrderValue);

  if (
    !Number.isSafeInteger(displayOrder) ||
    displayOrder < 0
  ) {
    redirect("/admin/menu?error=invalid");
  }

  const id = idValue === "" ? null : Number(idValue);

  if (
    id !== null &&
    (!Number.isSafeInteger(id) || id <= 0)
  ) {
    redirect("/admin/menu?error=invalid");
  }

  const payload = {
    item_name: itemName,
    description: optionalText(description),
    price: optionalText(price),
    price_options_notes: optionalText(priceNotes),
    menu_type: menuType,
    subcategory,
    tags: optionalText(tags),
    image_url: optionalText(imageUrl),
    display_order: displayOrder,
    is_five_dollar_special:
      formData.get("is_five_dollar_special") === "on",
    is_active: formData.get("is_active") === "on",
  };

  if (id === null) {
    const { error } = await supabase
      .from("menu_items")
      .insert(payload)
      .select("id")
      .single();

    if (error) {
      console.error("Menu item insert failed:", {
        code: error.code,
        message: error.message,
      });

      redirect("/admin/menu?error=save");
    }
  } else {
    const { data, error } = await supabase
      .from("menu_items")
      .update(payload)
      .eq("id", id)
      .select("id")
      .maybeSingle();

    if (error || !data) {
      console.error("Menu item update failed:", {
        code: error?.code,
        message: error?.message,
      });

      redirect("/admin/menu?error=save");
    }
  }

  refreshMenuPages();

  redirect("/admin/menu?saved=1");
}

export async function setMenuItemActive(formData: FormData) {
  const { supabase } = await requireManager();

  const idValue = getText(formData, "id", 30);
  const nextActiveValue = getText(formData, "next_active", 5);

  if (
    !idValue ||
    !nextActiveValue ||
    !["true", "false"].includes(nextActiveValue)
  ) {
    redirect("/admin/menu?error=invalid");
  }

  const id = Number(idValue);

  if (!Number.isSafeInteger(id) || id <= 0) {
    redirect("/admin/menu?error=invalid");
  }

  const { data, error } = await supabase
    .from("menu_items")
    .update({ is_active: nextActiveValue === "true" })
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error || !data) {
    console.error("Menu item visibility update failed:", {
      code: error?.code,
      message: error?.message,
    });

    redirect("/admin/menu?error=save");
  }

  refreshMenuPages();

  redirect("/admin/menu?saved=1");
}