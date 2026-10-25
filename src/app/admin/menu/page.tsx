import { Suspense } from "react";
import { connection } from "next/server";
import Link from "next/link";

import MenuImagePanel from "@/components/admin/menu-image-panel";
import { requireManager } from "@/lib/auth/require-manager";
import { saveMenuItem, setMenuItemActive } from "./actions";

export const metadata = {
  title: "Menu Management | Fin & Feathers Las Vegas",
  description: "Restricted menu management for authorized managers.",
};

type MenuAdminItem = {
  id: number;
  item_name: string;
  description: string | null;
  price: string | null;
  price_options_notes: string | null;
  menu_type: string;
  subcategory: string;
  is_five_dollar_special: boolean;
  tags: string | null;
  image_url: string | null;
  is_active: boolean;
  display_order: number;
};

type AdminMenuPageProps = {
  searchParams: Promise<{ saved?: string; error?: string; type?: string; category?: string; q?: string; specials?: string; visibility?: string }>;
};

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
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
  placeholder?: string;
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
        rows={3}
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

function MenuItemEditor({
  item,
}: {
  item?: MenuAdminItem;
}) {
  const isNew = !item;

  return (
    <details className="group min-w-0 overflow-hidden rounded-xl border border-white/10 bg-zinc-950/90 transition-colors open:border-white/20">
      <summary className="cursor-pointer list-none px-4 py-4 outline-none transition hover:bg-white/[0.04] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#ea1b24] [&::-webkit-details-marker]:hidden sm:px-5">
        <div className="flex min-w-0 items-start gap-3">
          {item ? (
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-white/10 bg-zinc-900 sm:h-24 sm:w-24">
              {item.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.image_url}
                  alt={`${item.item_name} thumbnail`}
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center px-2 text-center text-[10px] text-zinc-500">
                  No image
                </div>
              )}
            </div>
          ) : null}

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <h3 className="min-w-0 break-words text-base font-semibold leading-snug text-white">
                {item?.item_name ?? "Add a menu item"}
              </h3>

              {item?.price ? (
                <span className="shrink-0 text-sm font-semibold text-white/90">
                  {item.price}
                </span>
              ) : null}
            </div>

            <p className="mt-1.5 break-words text-xs leading-5 text-zinc-400">
              {item
                ? `${item.menu_type} · ${item.subcategory}`
                : "Create a new food or drink item"}
              {item && !item.price ? " · No price" : ""}
            </p>

            {item ? (
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span
                  className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
                    item.is_active
                      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                      : "border-zinc-500/30 bg-zinc-500/10 text-zinc-400"
                  }`}
                >
                  {item.is_active ? "Active" : "Inactive"}
                </span>

                {item.is_five_dollar_special ? (
                  <span className="rounded-full border border-[#ea1b24]/40 bg-[#ea1b24]/10 px-2.5 py-1 text-[11px] font-semibold text-red-300">
                    $5 Special
                  </span>
                ) : null}
              </div>
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
        <form
          action={saveMenuItem}
          className="space-y-6"
        >
          <input
            type="hidden"
            name="id"
            value={item ? String(item.id) : ""}
          />

          <fieldset className="space-y-4">
            <legend className="mb-4 text-sm font-bold uppercase tracking-wider text-zinc-300">
              Basic details
            </legend>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <TextField
                label="Item name"
                name="item_name"
                defaultValue={item?.item_name}
                placeholder="e.g. Southern Fried Chicken"
                required
              />

              <TextField
                label="Price"
                name="price"
                defaultValue={item?.price}
                placeholder="e.g. $18 or Market Price"
              />

              <label className="block min-w-0">
                <span className="mb-2 block text-sm font-medium text-zinc-300">
                  Menu type
                </span>

                <select
                  name="menu_type"
                  defaultValue={
                    item?.menu_type.toLowerCase() === "drink"
                      ? "Drink"
                      : "Food"
                  }
                  required
                  className={inputClass}
                >
                  <option value="Food">Food</option>
                  <option value="Drink">Drink</option>
                </select>
              </label>

              <TextField
                label="Category / subcategory"
                name="subcategory"
                defaultValue={item?.subcategory}
                placeholder="e.g. Appetizers"
                required
              />
            </div>

            <TextAreaField
              label="Description"
              name="description"
              defaultValue={item?.description}
              placeholder="Describe the item for guests..."
            />

            <TextAreaField
              label="Price options / additional notes"
              name="price_options_notes"
              defaultValue={item?.price_options_notes}
              placeholder="Optional sizes, choices, or other notes..."
            />
          </fieldset>

          <fieldset className="space-y-4 border-t border-white/10 pt-5">
            <legend className="text-sm font-bold uppercase tracking-wider text-zinc-300">
              Display and organization
            </legend>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <TextField
                label="Display order"
                name="display_order"
                type="number"
                defaultValue={item?.display_order ?? 0}
                placeholder="0"
                required
              />

              <TextField
                label="Tags"
                name="tags"
                defaultValue={item?.tags}
                placeholder="e.g. spicy, vegetarian"
              />
            </div>

            <MenuImagePanel
              initialImageUrl={item?.image_url}
            />

            <TextField
              label="Image URL"
              name="image_url"
              defaultValue={item?.image_url}
              placeholder="Paste an existing public image URL"
            />

            <p className="text-xs leading-5 text-zinc-400">
              Use the image editor to upload a cropped 4:3
              WebP image to Supabase Storage. Once the
              upload succeeds, the Image URL field updates
              automatically. Click Save Changes or Create
              Menu Item to save the image URL to the menu
              database. You can also paste an existing
              public image URL manually.
            </p>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <CheckField
                label="Show as a $5 Special"
                name="is_five_dollar_special"
                defaultChecked={
                  item?.is_five_dollar_special ?? false
                }
              />

              <CheckField
                label="Active on the public menu"
                name="is_active"
                defaultChecked={item?.is_active ?? true}
              />
            </div>
          </fieldset>

          <div className="flex flex-col gap-3 border-t border-white/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs leading-5 text-zinc-500">
              {item
                ? `Editing item #${item.id}. Save to publish your changes.`
                : "New items are saved to the menu database."}
            </p>

            <button
              type="submit"
              className="inline-flex min-h-12 w-full items-center justify-center rounded-lg bg-[#ea1b24] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:w-auto"
            >
              {isNew ? "Create Menu Item" : "Save Changes"}
            </button>
          </div>
        </form>

        {item ? (
          <form
            action={setMenuItemActive}
            className="mt-4 border-t border-white/10 pt-4"
          >
            <input
              type="hidden"
              name="id"
              value={String(item.id)}
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
                ? "Deactivate Item"
                : "Reactivate Item"}
            </button>
          </form>
        ) : null}
      </div>
    </details>
  );
}

async function ProtectedMenuDashboard({
  searchParams,
}: AdminMenuPageProps) {
  await connection();

  const { supabase } = await requireManager();
  const params = await searchParams;

  const { data, error } = await supabase
    .from("menu_items")
    .select(
      "id,item_name,description,price,price_options_notes,menu_type,subcategory,is_five_dollar_special,tags,image_url,is_active,display_order",
    )
    .order("display_order", { ascending: true })
    .order("item_name", { ascending: true });

  const items = (data ?? []) as MenuAdminItem[];

  const activeCount = items.filter((item) => item.is_active).length;
  const inactiveCount = items.length - activeCount;

  const menuType = params.type?.toLowerCase() === "drink" ? "Drink" : "Food";
  const search = (params.q ?? "").trim().slice(0, 100);
  const specialsOnly = params.specials === "1";
  const visibility =
    params.visibility === "active" || params.visibility === "inactive"
      ? params.visibility
      : "all";

  const categories = Array.from(
    new Set(
      items
        .filter((item) => item.menu_type.toLowerCase() === menuType.toLowerCase())
        .map((item) => item.subcategory),
    ),
  );
  const category = categories.includes(params.category ?? "")
    ? params.category!
    : "All";

  const browseHref = (changes: {
    type?: "Food" | "Drink";
    category?: string;
    reset?: boolean;
  }) => {
    const query = new URLSearchParams();
    const nextType = changes.type ?? menuType;
    const nextCategory = changes.reset ? "All" : changes.category ?? category;
    if (nextType === "Drink") query.set("type", "Drink");
    if (nextCategory !== "All") query.set("category", nextCategory);
    if (!changes.reset && search) query.set("q", search);
    if (!changes.reset && specialsOnly) query.set("specials", "1");
    if (!changes.reset && visibility !== "all") query.set("visibility", visibility);
    const qs = query.toString();
    return `/admin/menu${qs ? `?${qs}` : ""}#menu-browser`;
  };

  const visibleItems = items.filter((item) => {
    if (item.menu_type.toLowerCase() !== menuType.toLowerCase()) return false;
    if (category !== "All" && item.subcategory !== category) return false;
    if (specialsOnly && !item.is_five_dollar_special) return false;
    if (visibility === "active" && !item.is_active) return false;
    if (visibility === "inactive" && item.is_active) return false;
    if (!search) return true;
    const text = [
      item.item_name, item.description, item.price, item.price_options_notes,
      item.menu_type, item.subcategory, item.tags,
    ].filter(Boolean).join(" ").toLowerCase();
    return text.includes(search.toLowerCase());
  });

  const groupedItems = new Map<string, MenuAdminItem[]>();
  for (const item of visibleItems) {
    const group = groupedItems.get(item.subcategory) ?? [];
    group.push(item);
    groupedItems.set(item.subcategory, group);
  }

  return (
    <main className="w-full flex-1 bg-black px-3 py-6 text-white sm:px-8 sm:py-12">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-3 border-b border-white/10 pb-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm leading-6 text-zinc-400">
            Manage menu items, visibility, and display order.
          </p>
          <Link
            href="/menu"
            className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-lg border border-white/15 px-4 py-2.5 text-center text-sm font-medium text-white transition hover:bg-white/10"
          >
            View Public Menu
          </Link>
        </div>

        {params.saved === "1" && (
          <div role="status" className="mt-5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
            Menu changes saved successfully.
          </div>
        )}
        {params.error === "invalid" && (
          <div role="alert" className="mt-5 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            Some fields are missing or invalid. Review the form and try again.
          </div>
        )}
        {(params.error === "save" || error) && (
          <div role="alert" className="mt-5 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            The menu could not be loaded or saved. Confirm the manager database policies and try again.
          </div>
        )}

        {error ? (
          <section className="mt-6 rounded-xl border border-white/10 bg-white/[0.03] p-5">
            <h2 className="font-semibold">Menu records unavailable</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-400">
              The manager session was verified, but Supabase did not return the menu records.
              Check the database policies and schema before editing.
            </p>
          </section>
        ) : (
          <>
            <section aria-label="Menu inventory statistics" className="grid grid-cols-3 gap-2 py-5 sm:gap-4 sm:py-7">
              {[
                { label: "Total items", value: items.length, tone: "text-white" },
                { label: "Active", value: activeCount, tone: "text-emerald-300" },
                { label: "Inactive", value: inactiveCount, tone: "text-zinc-300" },
              ].map((stat) => (
                <div key={stat.label} className="min-w-0 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-3 sm:p-5">
                  <p className="text-xs text-zinc-400 sm:text-sm">{stat.label}</p>
                  <p className={`mt-1 text-xl font-bold tabular-nums sm:mt-2 sm:text-3xl ${stat.tone}`}>
                    {stat.value}
                  </p>
                </div>
              ))}
            </section>

            <section aria-labelledby="add-menu-item-title" className="space-y-3">
              <div>
                <h2 id="add-menu-item-title" className="text-lg font-semibold sm:text-xl">Add a menu item</h2>
                <p className="mt-1 text-sm text-zinc-400">Expand to create a new item.</p>
              </div>
              <MenuItemEditor />
            </section>

            <section id="menu-browser" aria-labelledby="existing-menu-items-title" className="mt-9 space-y-5 sm:mt-12">
              <div className="flex flex-wrap items-end justify-between gap-2">
                <div>
                  <h2 id="existing-menu-items-title" className="text-lg font-semibold sm:text-xl">
                    Existing menu items
                  </h2>
                  <p className="mt-1 text-sm text-zinc-400">
                    Browse by menu type and category, then expand an item to edit it.
                  </p>
                </div>
                <span className="text-xs text-zinc-400">{visibleItems.length} of {items.length} items</span>
              </div>

              <div className="flex justify-center">
                <div className="inline-flex rounded-full border border-white/15 bg-[#111111] p-1" aria-label="Choose menu type">
                  {(["Food", "Drink"] as const).map((type) => (
                    <Link key={type} href={browseHref({ type, category: "All", reset: true })}
                      aria-current={menuType === type ? "page" : undefined}
                      className={`min-w-28 rounded-full px-6 py-3 text-center text-sm font-extrabold uppercase tracking-wider transition ${
                        menuType === type ? "bg-[#ea1b24] text-white" : "text-white/60 hover:text-white"
                      }`}
                    >
                      {type === "Drink" ? "Drinks" : "Food"}
                    </Link>
                  ))}
                </div>
              </div>

              <nav aria-label="Filter by category" className="flex gap-2 overflow-x-auto pb-3">
                {["All", ...categories].map((name) => (
                  <Link key={name} href={browseHref({ category: name })}
                    aria-current={category === name ? "page" : undefined}
                    className={`shrink-0 rounded-full border px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition ${
                      category === name
                        ? "border-[#ea1b24] bg-[#ea1b24] text-white"
                        : "border-white/15 bg-white/5 text-white/65 hover:border-white/30 hover:text-white"
                    }`}
                  >
                    {name.toLowerCase() === "cocktails" ? "SIGNATURE COCKTAILS" : name}
                  </Link>
                ))}
              </nav>

              <form action="/admin/menu" method="get" className="grid grid-cols-1 items-end gap-3 rounded-xl border border-white/10 bg-zinc-950/90 p-4 sm:grid-cols-[minmax(0,1fr)_auto_auto_auto]">
                <input type="hidden" name="type" value={menuType} />
                {category !== "All" && <input type="hidden" name="category" value={category} />}
                <label className="block min-w-0 text-xs font-semibold text-zinc-300">
                  Search menu
                  <input name="q" type="search" maxLength={100} defaultValue={search}
                    placeholder="Name, description, price, tags..."
                    className={`${inputClass} mt-2`} />
                </label>
                <label className="block text-xs font-semibold text-zinc-300">
                  Visibility
                  <select name="visibility" defaultValue={visibility} className={`${inputClass} mt-2`}>
                    <option value="all">All items</option>
                    <option value="active">Active only</option>
                    <option value="inactive">Inactive only</option>
                  </select>
                </label>
                <label className="flex min-h-11 items-center gap-2 text-sm text-zinc-300">
                  <input name="specials" type="checkbox" value="1" defaultChecked={specialsOnly}
                    className="h-4 w-4 accent-[#ea1b24]" />
                  $5 Specials only
                </label>
                <button type="submit" className="min-h-11 rounded-lg bg-[#ea1b24] px-5 py-2 text-sm font-bold text-white hover:bg-red-700">
                  Apply filters
                </button>
              </form>

              <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-4 text-sm text-zinc-400">
                <span>{visibleItems.length} {visibleItems.length === 1 ? "item" : "items"} found</span>
                <Link href={browseHref({ reset: true })} className="text-xs font-bold uppercase tracking-wider text-[#ff4a51] hover:text-white">
                  Clear Filters
                </Link>
              </div>

              {visibleItems.length === 0 ? (
                <div className="rounded-xl border border-white/10 bg-zinc-950/90 p-6 text-sm text-zinc-400">
                  No matching menu items. Try another category or clear the filters.
                </div>
              ) : (
                <div className="space-y-9">
                  {Array.from(groupedItems.entries()).map(([name, group]) => (
                    <section key={name} className="space-y-4" aria-label={`${name} menu items`}>
                      <div className="flex flex-wrap items-end justify-between gap-2 border-b border-white/15 pb-3">
                        <h3 className="text-xl font-black uppercase tracking-widest text-white sm:text-2xl">
                          {name.toLowerCase() === "cocktails" ? "SIGNATURE COCKTAILS" : name}
                        </h3>
                        <span className="text-xs text-zinc-500">{group.length} items · Sorted by display order</span>
                      </div>
                      <div className="grid grid-cols-1 items-start gap-3 lg:grid-cols-3 lg:gap-4">
                        {group.map((item) => <MenuItemEditor key={item.id} item={item} />)}
                      </div>
                    </section>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </main>
  );
}

export default function AdminMenuPage(
  props: AdminMenuPageProps,
) {
  return (
    <Suspense fallback={<DashboardLoading />}>
      <ProtectedMenuDashboard
        searchParams={props.searchParams}
      />
    </Suspense>
  );
}