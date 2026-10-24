
"use client";

import { useEffect, useMemo, useState } from "react";
import TodaySpecials from "@/components/todays-specials";

export type MenuItem = {
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

type MenuBrowserProps = {
  items: MenuItem[];
  loadError: boolean;
};

type MenuTag = {
  key: string;
  label: string;
  className: string;
};

const TOAST_ORDER_URL =
  "https://toast.app/r/fin-feathers-las-vegas-1229-s-casino-center-blvd/order?utm_medium=redirect&utm_source=fin-feathers-website";

const MENU_TAG_STYLES: Record<string, string> = {
  vegetarian: "bg-green-600 text-white border-green-500",
  spicy: "bg-red-600 text-white border-red-500",
  "chef's special": "bg-yellow-400 text-black border-yellow-300",
  "sweet & spicy": "bg-purple-600 text-white border-purple-500",
  vegan: "bg-white text-black border-white",
};

const MENU_TAG_LABELS: Record<string, string> = {
  vegetarian: "Vegetarian",
  spicy: "Spicy",
  "chef's special": "Chef's Special",
  "sweet & spicy": "Sweet & Spicy",
  vegan: "Vegan",
};

function getMenuTags(
  tags: string | null | undefined,
): MenuTag[] {
  if (!tags) return [];

  const normalizedTags = tags
    .split(/[,;|]/)
    .map((tag) => tag.trim().toLowerCase())
    .filter((tag) => tag in MENU_TAG_STYLES);

  return Array.from(new Set(normalizedTags)).map(
    (tag) => ({
      key: tag,
      label: MENU_TAG_LABELS[tag],
      className: MENU_TAG_STYLES[tag],
    }),
  );
}

function getCategoryId(subcategory: string): string {
  return `menu-category-${subcategory
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")}`;
}

function isCocktailsCategory(
  subcategory: string,
): boolean {
  return (
    subcategory.trim().toLowerCase() === "cocktails"
  );
}

function getDisplayCategoryName(
  subcategory: string,
): string {
  return isCocktailsCategory(subcategory)
    ? "SIGNATURE COCKTAILS"
    : subcategory;
}

export default function MenuBrowser({
  items,
  loadError,
}: MenuBrowserProps) {
  const [menuType, setMenuType] =
    useState<"Food" | "Drink">("Food");

  const [selectedCategory, setSelectedCategory] =
    useState("All");

  const [search, setSearch] = useState("");
  const [specialsOnly, setSpecialsOnly] =
    useState(false);

  const [selectedItem, setSelectedItem] =
    useState<MenuItem | null>(null);

  const categories = useMemo(() => {
    const matchingItems = items.filter(
      (item) =>
        item.menu_type.toLowerCase() ===
        menuType.toLowerCase(),
    );

    return [
      "All",
      ...Array.from(
        new Set(
          matchingItems.map(
            (item) => item.subcategory,
          ),
        ),
      ),
    ];
  }, [items, menuType]);

  const filteredItems = useMemo(() => {
    const normalizedSearch =
      search.trim().toLowerCase();

    return items.filter((item) => {
      const matchesMenuType =
        item.menu_type.toLowerCase() ===
        menuType.toLowerCase();

      const matchesCategory =
        selectedCategory === "All" ||
        item.subcategory === selectedCategory;

      const matchesSpecials =
        !specialsOnly ||
        item.is_five_dollar_special;

      const searchableText = [
        item.item_name,
        item.description ?? "",
        item.price ?? "",
        item.price_options_notes ?? "",
        item.menu_type,
        item.subcategory,
        item.tags ?? "",
      ]
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !normalizedSearch ||
        searchableText.includes(normalizedSearch);

      return (
        matchesMenuType &&
        matchesCategory &&
        matchesSpecials &&
        matchesSearch
      );
    });
  }, [
    items,
    menuType,
    selectedCategory,
    specialsOnly,
    search,
  ]);

  const groupedItems = useMemo(() => {
    const groups = new Map<
      string,
      MenuItem[]
    >();

    for (const item of filteredItems) {
      const existingItems =
        groups.get(item.subcategory) ?? [];

      existingItems.push(item);

      groups.set(
        item.subcategory,
        existingItems,
      );
    }

    return Array.from(groups.entries());
  }, [filteredItems]);

  useEffect(() => {
    if (
      !categories.includes(selectedCategory)
    ) {
      setSelectedCategory("All");
    }
  }, [categories, selectedCategory]);

  useEffect(() => {
    if (!selectedItem) return;

    function handleKeyDown(
      event: KeyboardEvent,
    ) {
      if (event.key === "Escape") {
        setSelectedItem(null);
      }
    }

    window.addEventListener(
      "keydown",
      handleKeyDown,
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown,
      );
    };
  }, [selectedItem]);

  function changeMenuType(
    type: "Food" | "Drink",
  ) {
    setMenuType(type);
    setSelectedCategory("All");
    setSearch("");
    setSpecialsOnly(false);
  }

  return (
    <div className="w-full">
      <div className="mx-auto w-full max-w-7xl px-4 pb-16 pt-10 sm:px-6 lg:px-8">

        {/* Menu heading and logo */}
        <header className="text-center">
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-[#ea1b24]">
            Fin &amp; Feathers Las Vegas
          </p>

          <div className="mt-5 flex w-full justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/img/fin-feathers-lv-logo-500.png"
              alt="Fin & Feathers Las Vegas"
              width={500}
              height={250}
              fetchPriority="high"
              className="neon-flicker h-auto w-full max-w-[360px] object-contain"
            />
          </div>

          <h1 className="mt-6 text-4xl font-black uppercase tracking-tight text-white sm:text-5xl">
            Our Menu
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-white/60 sm:text-base">
            Southern soul, elevated dining,
            and something delicious for
            every occasion.
          </p>

          {/* Hours of Operation */}
          <section
            aria-label="Hours of operation"
            className="mx-auto mt-6 flex w-full min-w-0 flex-col items-center justify-center text-center"
          >
            <h2 className="flex items-center justify-center gap-2 text-lg font-semibold text-white">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.8}
                className="h-5 w-5 shrink-0 text-yellow-400"
                aria-hidden="true"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="9"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 7v5l3 2"
                />
              </svg>

              HOURS OF OPERATION
            </h2>

            <div className="mt-2 grid w-full max-w-md grid-cols-2 gap-x-3 gap-y-1 text-sm leading-relaxed text-slate-400 sm:flex sm:max-w-none sm:flex-wrap sm:justify-center sm:gap-x-4">
              <span>
                Mon - Thu: 11am - 12am
              </span>
              <span>
                Fri: 11am - 2am
              </span>
              <span>
                Sat: 10am - 2am
              </span>
              <span>
                Sun: 10am - 12am
              </span>
            </div>
          </section>

          <TodaySpecials />

          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <a
              href="/reservations"
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#ea1b24] px-6 py-3 text-sm font-extrabold uppercase tracking-wider text-white transition hover:bg-[#ff3039] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              Make a Reservation
            </a>

            <a
              href={TOAST_ORDER_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/25 bg-white/5 px-6 py-3 text-sm font-extrabold uppercase tracking-wider text-white transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              Order Online
            </a>
          </div>
        </header>

        {/* Food and Drink selector */}
        <div className="mt-10 flex justify-center">
          <div
            className="inline-flex rounded-full border border-white/15 bg-[#111111] p-1"
            aria-label="Choose menu type"
          >
            <button
              type="button"
              aria-pressed={
                menuType === "Food"
              }
              onClick={() =>
                changeMenuType("Food")
              }
              className={`min-w-28 rounded-full px-6 py-3 text-sm font-extrabold uppercase tracking-wider transition ${
                menuType === "Food"
                  ? "bg-[#ea1b24] text-white"
                  : "text-white/60 hover:text-white"
              }`}
            >
              Food
            </button>

            <button
              type="button"
              aria-pressed={
                menuType === "Drink"
              }
              onClick={() =>
                changeMenuType("Drink")
              }
              className={`min-w-28 rounded-full px-6 py-3 text-sm font-extrabold uppercase tracking-wider transition ${
                menuType === "Drink"
                  ? "bg-[#ea1b24] text-white"
                  : "text-white/60 hover:text-white"
              }`}
            >
              Drinks
            </button>
          </div>
        </div>

        {/* Back to Home */}
        <div className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center">
          <a
            href="/"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-white/20 bg-black/40 px-4 py-2.5 text-sm font-semibold text-white transition hover:border-white/40 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-red-400"
          >
            <span aria-hidden="true">
              ←
            </span>
            Back to Home
          </a>
        </div>

        {/* Subcategory filters */}
        <div
          className="mt-5 flex gap-2 overflow-x-auto pb-3"
          aria-label="Filter by category"
        >
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              aria-pressed={
                selectedCategory === category
              }
              onClick={() =>
                setSelectedCategory(category)
              }
              className={`shrink-0 rounded-full border px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition ${
                selectedCategory === category
                  ? "border-[#ea1b24] bg-[#ea1b24] text-white"
                  : "border-white/15 bg-white/5 text-white/65 hover:border-white/30 hover:text-white"
              }`}
            >
              {getDisplayCategoryName(
                category,
              )}
            </button>
          ))}
        </div>

        {/* Results count */}
        <div className="mt-4 flex items-center justify-between border-b border-white/10 pb-4">
          <p className="text-sm text-white/50">
            {filteredItems.length}{" "}
            {filteredItems.length === 1
              ? "item"
              : "items"}

            {search.trim()
              ? " found"
              : ""}
          </p>

          {(search ||
            specialsOnly ||
            selectedCategory !== "All") && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setSpecialsOnly(false);
                setSelectedCategory("All");
              }}
              className="text-xs font-bold uppercase tracking-wider text-[#ff4a51] hover:text-white"
            >
              Clear Filters
            </button>
          )}
        </div>

        {/* Menu results */}
        {loadError ? (
          <div
            className="mt-10 rounded-2xl border border-white/10 bg-[#111111] px-6 py-12 text-center"
            role="alert"
          >
            <h2 className="text-xl font-bold text-white">
              Menu Temporarily Unavailable
            </h2>

            <p className="mt-3 text-sm leading-6 text-white/60">
              We&apos;re having trouble
              loading our menu right now.
              Please try again shortly.
            </p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-white/10 bg-[#111111] px-6 py-12 text-center">
            <h2 className="text-xl font-bold text-white">
              No Menu Items Found
            </h2>

            <p className="mt-3 text-sm text-white/60">
              Try another search or choose
              a different category.
            </p>

            <button
              type="button"
              onClick={() => {
                setSearch("");
                setSpecialsOnly(false);
                setSelectedCategory("All");
              }}
              className="mt-5 rounded-full bg-[#ea1b24] px-5 py-3 text-xs font-extrabold uppercase tracking-wider text-white transition hover:bg-[#ff3039]"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="mt-8 space-y-10">
            {groupedItems.map(
              ([subcategory, categoryItems]) => {
                const isCocktails =
                  isCocktailsCategory(
                    subcategory,
                  );

                return (
                  <section
                    key={subcategory}
                    aria-labelledby={
                      getCategoryId(
                        subcategory,
                      )
                    }
                    className="w-full"
                  >
                    {/*
                      CATEGORY HEADING

                      No image is displayed beside
                      SIGNATURE COCKTAILS.

                      All category headings share
                      the same consistent styling.
                    */}
                    <div className="mb-5 border-b border-white/15 pb-3">
                      <h2
                        id={getCategoryId(
                          subcategory,
                        )}
                        className="text-xl font-black uppercase tracking-widest text-white sm:text-2xl"
                      >
                        {getDisplayCategoryName(
                          subcategory,
                        )}
                      </h2>
                    </div>

                    {/*
                      MENU GRID

                      Mobile: 1 column.

                      Tablet: 2 columns.

                      Desktop:
                        Cocktails = 2 columns.
                        Other items = 3 columns.
                    */}
                    <div
                      className={`grid grid-cols-1 gap-5 sm:grid-cols-2 ${
                        isCocktails
                          ? "lg:grid-cols-2"
                          : "lg:grid-cols-3"
                      }`}
                    >
                      {categoryItems.map(
                        (item) => {
                          const isFood =
                            item.menu_type.toLowerCase() ===
                            "food";

                          const isSignatureCocktail =
                            isCocktailsCategory(
                              item.subcategory,
                            );

                          const imageUrl =
                            (isFood ||
                              isSignatureCocktail) &&
                            item.image_url?.trim()
                              ? item.image_url.trim()
                              : null;

                          const itemTags =
                            getMenuTags(
                              item.tags,
                            );

                          return (
                            <article
                              key={item.id}
                              className={`flex min-w-0 overflow-hidden rounded-2xl border border-white/10 bg-[#111111] transition-colors duration-300 hover:border-white/25 ${
                                isSignatureCocktail
                                  ? "flex-row items-stretch"
                                  : "flex-col"
                              }`}
                            >
                              {/*
                                ITEM IMAGE

                                Cocktail:
                                Small square on left.

                                Food:
                                Full-width image above.

                                Other drinks:
                                No image.
                              */}
                              {imageUrl ? (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setSelectedItem(
                                      item,
                                    )
                                  }
                                  aria-label={`View ${item.item_name} details`}
                                  className={`group relative shrink-0 overflow-hidden bg-white/5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ea1b24] focus-visible:ring-inset ${
                                    isSignatureCocktail
                                      ? "m-3 h-20 w-20 self-start rounded-lg sm:h-24 sm:w-24"
                                      : "block aspect-[16/10] w-full"
                                  }`}
                                >
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img
                                    src={
                                      imageUrl
                                    }
                                    alt={
                                      item.item_name
                                    }
                                    loading="lazy"
                                    decoding="async"
                                    className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-110 group-focus-visible:scale-110 motion-reduce:transition-none"
                                  />

                                  <span
                                    aria-hidden="true"
                                    className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors duration-300 group-hover:bg-black/30 group-focus-visible:bg-black/30"
                                  >
                                    <span className="flex h-10 w-10 scale-90 items-center justify-center rounded-full border border-white/80 bg-black/65 text-3xl font-light leading-none text-white opacity-0 shadow-lg transition-all duration-300 group-hover:scale-100 group-hover:opacity-100 group-focus-visible:scale-100 group-focus-visible:opacity-100">
                                      +
                                    </span>
                                  </span>
                                </button>
                              ) : null}

                              {/*
                                ITEM CONTENT

                                Cocktail:
                                Compact right-side text.

                                Other items:
                                Existing full padding.
                              */}
                              <div
                                className={`flex min-w-0 flex-1 flex-col ${
                                  isSignatureCocktail
                                    ? "py-3 pl-1 pr-3"
                                    : "p-5"
                                }`}
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <h3 className="min-w-0 text-lg font-extrabold uppercase leading-snug tracking-wide text-white">
                                    {
                                      item.item_name
                                    }
                                  </h3>

                                  {item.price ? (
                                    <p className="shrink-0 text-base font-bold tabular-nums text-white">
                                      {
                                        item.price
                                      }
                                    </p>
                                  ) : null}
                                </div>

                                {/* Menu tags */}
                                {itemTags.length >
                                  0 ||
                                item.is_five_dollar_special ? (
                                  <div className="mt-3 flex flex-wrap gap-2">
                                    {itemTags.map(
                                      (tag) => (
                                        <span
                                          key={
                                            tag.key
                                          }
                                          className={`inline-flex items-center rounded-full border px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider ${tag.className}`}
                                        >
                                          {
                                            tag.label
                                          }
                                        </span>
                                      ),
                                    )}

                                    {item.is_five_dollar_special ? (
                                      <span className="inline-flex items-center rounded-full border border-[#ea1b24]/60 bg-[#ea1b24]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                                        $5 Special
                                      </span>
                                    ) : null}
                                  </div>
                                ) : null}

                                {item.description ? (
                                  <p className="mt-3 text-sm leading-6 text-white/65">
                                    {
                                      item.description
                                    }
                                  </p>
                                ) : null}

                                {item.price_options_notes ? (
                                  <p className="mt-3 text-sm leading-5 text-white/50">
                                    {
                                      item.price_options_notes
                                    }
                                  </p>
                                ) : null}
                              </div>
                            </article>
                          );
                        },
                      )}
                    </div>
                  </section>
                );
              },
            )}
          </div>
        )}

        {/* Food allergy disclaimer */}
        <div className="mt-12 border-t border-white/15 pt-6">
          <p className="mx-auto max-w-4xl text-left text-xs leading-6 text-white/50 sm:text-sm">
            Allergen information:
            Allergens are marked with an *.
            Some food items may contain raw
            or undercooked ingredients
            and/or dairy. Consuming raw
            or undercooked meats, poultry,
            seafood, shellfish, or eggs
            could heighten the risk of
            foodborne illness, particularly
            for individuals with specific
            medical conditions. If you
            have food allergies or dietary
            restrictions, kindly notify
            one of our team members prior
            to ordering.
          </p>
        </div>
      </div>

      {/* Item detail modal */}
      {selectedItem ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/85 p-3 backdrop-blur-sm sm:p-6"
          onClick={() =>
            setSelectedItem(null)
          }
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="menu-item-modal-title"
            className="relative my-auto w-full max-w-3xl overflow-hidden rounded-2xl border border-white/15 bg-[#111111] shadow-2xl"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <button
              type="button"
              onClick={() =>
                setSelectedItem(null)
              }
              aria-label="Close item details"
              className="absolute right-3 top-3 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-white/40 bg-black/85 text-3xl leading-none text-white shadow-lg transition hover:border-white hover:bg-[#ea1b24] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <span aria-hidden="true">
                ×
              </span>
            </button>

            {selectedItem.image_url?.trim() ? (
              <div className="flex max-h-[55vh] items-center justify-center overflow-hidden bg-black">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={
                    selectedItem.image_url.trim()
                  }
                  alt={
                    selectedItem.item_name
                  }
                  className="max-h-[55vh] w-full object-contain"
                />
              </div>
            ) : null}

            <div className="max-h-[45vh] overflow-y-auto p-5 sm:p-7">
              <div className="flex items-start justify-between gap-4 pr-8">
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#ea1b24]">
                    {
                      selectedItem.subcategory
                    }
                  </p>

                  <h2
                    id="menu-item-modal-title"
                    className="mt-2 text-2xl font-black uppercase leading-tight tracking-wide text-white sm:text-3xl"
                  >
                    {
                      selectedItem.item_name
                    }
                  </h2>
                </div>

                {selectedItem.price ? (
                  <p className="shrink-0 pt-1 text-lg font-bold tabular-nums text-white sm:text-xl">
                    {
                      selectedItem.price
                    }
                  </p>
                ) : null}
              </div>

              {getMenuTags(
                selectedItem.tags,
              ).length > 0 ||
              selectedItem.is_five_dollar_special ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {getMenuTags(
                    selectedItem.tags,
                  ).map((tag) => (
                    <span
                      key={
                        tag.key
                      }
                      className={`inline-flex items-center rounded-full border px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider ${tag.className}`}
                    >
                      {
                        tag.label
                      }
                    </span>
                  ))}

                  {selectedItem.is_five_dollar_special ? (
                    <span className="inline-flex items-center rounded-full border border-[#ea1b24]/60 bg-[#ea1b24]/10 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-white">
                      $5 Special
                    </span>
                  ) : null}
                </div>
              ) : null}

              {selectedItem.description ? (
                <p className="mt-5 text-base leading-7 text-white/75">
                  {
                    selectedItem.description
                  }
                </p>
              ) : null}

              {selectedItem.price_options_notes ? (
                <div className="mt-4 border-t border-white/10 pt-4">
                  <p className="text-sm leading-6 text-white/60">
                    {
                      selectedItem.price_options_notes
                    }
                  </p>
                </div>
              ) : null}

              <div className="mt-5 border-t border-white/10 pt-4">
                <p className="text-xs font-semibold uppercase tracking-widest text-white/40">
                  {
                    selectedItem.menu_type
                  }{" "}
                  ·{" "}
                  {
                    selectedItem.subcategory
                  }
                </p>
              </div>
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}
