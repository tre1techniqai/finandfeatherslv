import type { Metadata } from "next";
import { Suspense } from "react";
import { createClient } from "@supabase/supabase-js";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import MenuBrowser, { type MenuItem } from "./menu-browser";

export const metadata: Metadata = {
  title: "Menu | Fin & Feathers Las Vegas",
  description:
    "Explore the Fin & Feathers menu, including Southern-inspired food, brunch, drinks, and $5 specials.",
};

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

async function MenuContent() {
  let items: MenuItem[] = [];
  let loadError = false;

  try {
    const supabase = getSupabaseClient();

    if (!supabase) {
      loadError = true;
    } else {
      const { data, error } = await supabase
        .from("menu_items")
        .select(
          "id,item_name,description,price,price_options_notes,menu_type,subcategory,is_five_dollar_special,tags,image_url,is_active,display_order",
        )
        .eq("is_active", true)
        .order("display_order", { ascending: true });

      if (error) {
        console.error("Menu query failed:", {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
        });

        loadError = true;
      } else {
        items = (data ?? []) as MenuItem[];
      }
    }
  } catch (error) {
    console.error(
      "Menu loading failed:",
      error instanceof Error ? error.message : "Unknown error",
    );

    loadError = true;
  }

  return <MenuBrowser items={items} loadError={loadError} />;
}

function MenuLoading() {
  return (
    <div
      className="mx-auto w-full max-w-7xl px-4 py-20 text-center sm:px-6"
      role="status"
      aria-live="polite"
    >
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#ea1b24]">
        Fin &amp; Feathers Las Vegas
      </p>

      <h1 className="mt-4 text-4xl font-black uppercase tracking-tight text-white">
        Our Menu
      </h1>

      <p className="mt-4 text-white/60">Loading our menu...</p>
    </div>
  );
}

export default function MenuPage() {
  return (
    <div className="flex min-h-screen flex-col bg-black text-white">
      <SiteHeader />

      <main className="flex-1">
        <Suspense fallback={<MenuLoading />}>
          <MenuContent />
        </Suspense>
      </main>

      <SiteFooter />
    </div>
  );
}