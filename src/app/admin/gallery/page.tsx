import { Suspense } from "react";
import { connection } from "next/server";
import Link from "next/link";
import GalleryImagePanel from "@/components/admin/gallery-image-panel";
import { requireManager } from "@/lib/auth/require-manager";
import { signOutManager } from "@/app/admin/menu/actions";
import {
  saveGalleryImage,
  setGalleryImageActive,
} from "./actions";

export const metadata = {
  title: "Gallery Management | Fin & Feathers Las Vegas",
  description: "Restricted gallery management for authorized managers.",
};

type GalleryAdminImage = {
  id: string;
  title: string;
  description: string | null;
  alt_text: string;
  category: string;
  storage_path: string;
  display_order: number;
  is_active: boolean;
};

type AdminGalleryPageProps = {
  searchParams: Promise<{
    saved?: string;
    error?: string;
  }>;
};

const BUCKET = "gallery-images";

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

function GalleryImageEditor({
  item,
  imageUrl,
}: {
  item?: GalleryAdminImage;
  imageUrl?: string | null;
}) {
  const isNew = !item;

  return (
    <details className="group min-w-0 overflow-hidden rounded-xl border border-white/10 bg-zinc-950/90 transition-colors open:border-white/20">
      <summary className="cursor-pointer list-none px-4 py-4 outline-none transition hover:bg-white/[0.04] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#ea1b24] [&::-webkit-details-marker]:hidden sm:px-5">
        <div className="flex min-w-0 items-start gap-3">
          {item ? (
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-white/10 bg-zinc-900 sm:h-24 sm:w-24">
              {imageUrl ? (
                // Gallery URLs are supplied by Supabase Storage.
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={imageUrl}
                  alt={item.alt_text}
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center px-2 text-center text-xs text-zinc-500">
                  No image
                </div>
              )}
            </div>
          ) : null}

          <div className="min-w-0 flex-1">
            <h3 className="break-words text-base font-semibold leading-snug text-white">
              {item?.title ?? "Add a gallery image"}
            </h3>

            <p className="mt-1.5 break-words text-xs leading-5 text-zinc-400">
              {item
                ? `${item.category} · Display order ${item.display_order}`
                : "Upload and publish a new gallery image"}
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
        <form action={saveGalleryImage} className="space-y-6">
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
              <TextField
                label="Image title"
                name="title"
                defaultValue={item?.title}
                placeholder="e.g. Restaurant Interior"
                required
              />

              <TextField
                label="Category"
                name="category"
                defaultValue={item?.category ?? "Other"}
                placeholder="e.g. Food, Dining, Restaurant"
                required
              />
            </div>

            <TextAreaField
              label="Description"
              name="description"
              defaultValue={item?.description}
              placeholder="Optional description of the image..."
            />

            <TextField
              label="Alternative text"
              name="alt_text"
              defaultValue={item?.alt_text}
              placeholder="Describe what appears in the image"
              required
            />

            <p className="text-xs leading-5 text-zinc-500">
              Alternative text helps visitors using screen readers
              understand the image.
            </p>
          </fieldset>

          <fieldset className="space-y-4 border-t border-white/10 pt-5">
            <legend className="text-sm font-bold uppercase tracking-wider text-zinc-300">
              Image and display settings
            </legend>

            <GalleryImagePanel initialImageUrl={imageUrl} />

            <TextField
              label="Storage path"
              name="storage_path"
              defaultValue={item?.storage_path}
              placeholder="Upload an image to generate a Storage path"
              required
            />

            <p className="text-xs leading-5 text-zinc-400">
              The image editor uploads a cropped 4:3 WebP image
              to the Gallery Storage bucket. After uploading,
              the Storage path field is updated automatically.
              Click Save Changes or Create Gallery Image to
              save the database record.
            </p>

            <TextField
              label="Display order"
              name="display_order"
              type="number"
              defaultValue={item?.display_order ?? 0}
              placeholder="0"
              required
            />

            <CheckField
              label="Active on the public Gallery"
              name="is_active"
              defaultChecked={item?.is_active ?? true}
            />
          </fieldset>

          <div className="flex flex-col gap-3 border-t border-white/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs leading-5 text-zinc-500">
              {item
                ? "Save changes to update this gallery record."
                : "New images are saved to the Gallery database."}
            </p>

            <button
              type="submit"
              className="inline-flex min-h-12 w-full items-center justify-center rounded-lg bg-[#ea1b24] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:w-auto"
            >
              {isNew
                ? "Create Gallery Image"
                : "Save Changes"}
            </button>
          </div>
        </form>

        {item ? (
          <form
            action={setGalleryImageActive}
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
                ? "Deactivate Image"
                : "Reactivate Image"}
            </button>
          </form>
        ) : null}
      </div>
    </details>
  );
}

async function ProtectedGalleryDashboard({
  searchParams,
}: AdminGalleryPageProps) {
  await connection();

  const { supabase } = await requireManager();
  const params = await searchParams;

  const { data, error } = await supabase
    .from("gallery_images")
    .select(
      "id,title,description,alt_text,category,storage_path,display_order,is_active",
    )
    .order("display_order", { ascending: true })
    .order("title", { ascending: true });

  const images = (data ?? []) as GalleryAdminImage[];

  const activeCount = images.filter(
    (image) => image.is_active,
  ).length;

  const inactiveCount = images.length - activeCount;

  const galleryImages = images.map((item) => ({
    item,
    imageUrl: supabase.storage
      .from(BUCKET)
      .getPublicUrl(item.storage_path).data.publicUrl,
  }));

  return (
    <main className="min-h-screen bg-black px-3 py-6 text-white sm:px-8 sm:py-12">
      <div className="mx-auto max-w-6xl">
        <header className="border-b border-white/10 pb-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#ea1b24]">
                Fin &amp; Feathers
              </p>

              <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-4xl">
                Gallery Management
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
                Manage gallery images, visibility, and display order.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:gap-3">
              <Link
                href="/"
                className="inline-flex min-h-11 items-center justify-center rounded-lg border border-white/15 px-3 py-2.5 text-center text-sm font-medium text-white transition hover:bg-white/10 sm:px-4"
              >
                View Public Gallery
              </Link>

              <form
                action={signOutManager}
                className="min-w-0"
              >
                <button
                  type="submit"
                  className="inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-[#ea1b24] px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 sm:px-4"
                >
                  Sign Out
                </button>
              </form>
            </div>
          </div>
        </header>

        {params.saved === "1" ? (
          <div
            role="status"
            className="mt-5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200"
          >
            Gallery changes saved successfully.
          </div>
        ) : null}

        {params.error === "invalid" ? (
          <div
            role="alert"
            className="mt-5 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200"
          >
            Some fields are missing or invalid. Review the form
            and try again.
          </div>
        ) : null}

        {params.error === "save" || error ? (
          <div
            role="alert"
            className="mt-5 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200"
          >
            The Gallery could not be loaded or saved.
            Confirm the manager database policies and try again.
          </div>
        ) : null}

        {error ? (
          <section className="mt-6 rounded-xl border border-white/10 bg-white/[0.03] p-5">
            <h2 className="font-semibold">
              Gallery records unavailable
            </h2>

            <p className="mt-2 text-sm leading-6 text-zinc-400">
              The manager session was verified, but Supabase
              did not return the Gallery records. Check the
              database policies before editing.
            </p>
          </section>
        ) : (
          <>
            <section
              aria-label="Gallery inventory statistics"
              className="grid grid-cols-3 gap-2 py-5 sm:gap-4 sm:py-7"
            >
              <div className="min-w-0 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-3 sm:p-5">
                <p className="text-xs text-zinc-400 sm:text-sm">
                  Total images
                </p>
                <p className="mt-1 text-xl font-bold tabular-nums sm:mt-2 sm:text-3xl">
                  {images.length}
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

            <section
              aria-labelledby="add-gallery-image-title"
              className="space-y-3"
            >
              <div>
                <h2
                  id="add-gallery-image-title"
                  className="text-lg font-semibold sm:text-xl"
                >
                  Add a gallery image
                </h2>

                <p className="mt-1 text-sm text-zinc-400">
                  Expand to upload and create a new image.
                </p>
              </div>

              <GalleryImageEditor />
            </section>

            <section
              aria-labelledby="existing-gallery-images-title"
              className="mt-9 space-y-4 sm:mt-12"
            >
              <div className="flex flex-wrap items-end justify-between gap-2">
                <div>
                  <h2
                    id="existing-gallery-images-title"
                    className="text-lg font-semibold sm:text-xl"
                  >
                    Existing gallery images
                  </h2>

                  <p className="mt-1 text-sm text-zinc-400">
                    Expand a card to edit image details,
                    display order, or publishing status.
                  </p>
                </div>

                <p className="text-xs text-zinc-500">
                  Sorted by display order
                </p>
              </div>

              {galleryImages.length === 0 ? (
                <p className="rounded-xl border border-white/10 p-5 text-sm text-zinc-400">
                  No gallery images were returned.
                </p>
              ) : (
                <div className="grid grid-cols-1 items-start gap-3 lg:grid-cols-3 lg:gap-4">
                  {galleryImages.map(({ item, imageUrl }) => (
                    <GalleryImageEditor
                      key={item.id}
                      item={item}
                      imageUrl={imageUrl}
                    />
                  ))}
                </div>
              )}
            </section>
          </>
        )}

        <footer className="mt-10 border-t border-white/10 pt-5">
          <Link
            href="/admin"
            className="text-sm text-zinc-400 underline decoration-zinc-700 underline-offset-4 transition hover:text-white"
          >
            Return to Admin Dashboard
          </Link>
        </footer>
      </div>
    </main>
  );
}

export default function AdminGalleryPage(
  props: AdminGalleryPageProps,
) {
  return (
    <Suspense fallback={<DashboardLoading />}>
      <ProtectedGalleryDashboard
        searchParams={props.searchParams}
      />
    </Suspense>
  );
}