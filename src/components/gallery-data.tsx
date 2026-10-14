import { Suspense } from "react";
import { createClient } from "@supabase/supabase-js";
import ImageGallery, { type GalleryImage } from "@/components/image-gallery";

type GalleryRow = {
  id: string;
  title: string;
  alt_text: string;
  category: string;
  storage_path: string;
  display_order: number;
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

async function GalleryContent() {
  let images: GalleryImage[] = [];
  let loadError = false;

  try {
    const supabase = getSupabaseClient();

    if (!supabase) {
      loadError = true;
    } else {
      const { data, error } = await supabase
        .from("gallery_images")
        .select("id,title,alt_text,category,storage_path,display_order")
        .eq("is_active", true)
        .order("display_order", { ascending: true });

      if (error) {
        console.error("Gallery query failed:", {
          code: error.code,
          message: error.message,
        });

        loadError = true;
      } else {
        images = ((data ?? []) as GalleryRow[]).map((row) => ({
          ...row,
          src: supabase.storage
            .from("gallery-images")
            .getPublicUrl(row.storage_path).data.publicUrl,
        }));
      }
    }
  } catch (error) {
    console.error(
      "Gallery loading failed:",
      error instanceof Error ? error.message : "Unknown error",
    );

    loadError = true;
  }

  return <ImageGallery images={images} loadError={loadError} />;
}

function GalleryLoading() {
  return (
    <section
      aria-label="Fin & Feathers photo gallery"
      className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6"
      role="status"
    >
      <div className="mb-5 text-center">
        <h2 className="text-2xl font-bold uppercase tracking-wide text-white sm:text-3xl">
          Gallery
        </h2>
        <p className="mt-2 text-sm text-white/70">
          Loading our gallery...
        </p>
      </div>
    </section>
  );
}

export default function GalleryData() {
  return (
    <Suspense fallback={<GalleryLoading />}>
      <GalleryContent />
    </Suspense>
  );
}