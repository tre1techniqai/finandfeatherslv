import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { requireManager } from "@/lib/auth/require-manager";

const BUCKET = "website-media";
const FOLDER = "menu";
const MAX_FILE_SIZE = 5 * 1024 * 1024;

export async function POST(request: Request) {
  // Authorization must happen before processing the uploaded file.
  const { supabase } = await requireManager();

  let formData: FormData;

  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { error: "Invalid upload request." },
      { status: 400 },
    );
  }

  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: "No image file was provided." },
      { status: 400 },
    );
  }

  if (file.type !== "image/webp") {
    return NextResponse.json(
      { error: "Menu images must be WebP files." },
      { status: 415 },
    );
  }

  if (file.size === 0 || file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: "Image must be smaller than 5 MB." },
      { status: 413 },
    );
  }

  // Verify the WebP file signature rather than trusting MIME alone.
  const header = new Uint8Array(await file.slice(0, 12).arrayBuffer());

  const isWebP =
    header.length === 12 &&
    String.fromCharCode(...header.slice(0, 4)) === "RIFF" &&
    String.fromCharCode(...header.slice(8, 12)) === "WEBP";

  if (!isWebP) {
    return NextResponse.json(
      { error: "Invalid WebP image data." },
      { status: 415 },
    );
  }

  const storagePath = `${FOLDER}/${randomUUID()}.webp`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, file, {
      contentType: "image/webp",
      cacheControl: "3600",
      upsert: false,
    });

  if (uploadError) {
    console.error("Menu image upload failed:", {
      message: uploadError.message,
    });

    return NextResponse.json(
      { error: "Unable to upload menu image." },
      { status: 500 },
    );
  }

  const { data } = supabase.storage
    .from(BUCKET)
    .getPublicUrl(storagePath);

  return NextResponse.json({
    imageUrl: data.publicUrl,
    storagePath,
  });
}