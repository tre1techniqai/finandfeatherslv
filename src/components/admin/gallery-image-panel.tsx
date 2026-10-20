"use client";

import { useEffect, useRef, useState } from "react";
import GalleryImageEditor from "./gallery-image-editor";

type GalleryImagePanelProps = {
  initialImageUrl?: string | null;
};

type UploadResponse = {
  imageUrl?: string;
  storagePath?: string;
  error?: string;
};

export default function GalleryImagePanel({
  initialImageUrl,
}: GalleryImagePanelProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  const sectionRef = useRef<HTMLElement | null>(null);
  const previewUrlRef = useRef<string | null>(null);
  const uploadInProgressRef = useRef(false);
  const uploadFailedRef = useRef(false);
  const uploadSequenceRef = useRef(0);

  useEffect(() => {
    const form = sectionRef.current?.closest("form");

    if (!form) return;

    function preventUnsafeSubmission(event: Event) {
      if (uploadInProgressRef.current || uploadFailedRef.current) {
        event.preventDefault();
        event.stopPropagation();
      }
    }

    form.addEventListener("submit", preventUnsafeSubmission, true);

    return () => {
      form.removeEventListener("submit", preventUnsafeSubmission, true);
    };
  }, []);

  useEffect(() => {
    return () => {
      uploadSequenceRef.current += 1;

      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
      }
    };
  }, []);

  function setFormUploadState(state: "uploading" | "failed" | "ready") {
    const form = sectionRef.current?.closest("form");

    uploadInProgressRef.current = state === "uploading";
    uploadFailedRef.current = state === "failed";

    if (!form) return;

    form.dataset.galleryImageUpload = state;

    const saveButton = form.querySelector<HTMLButtonElement>(
      'button[type="submit"]',
    );

    if (saveButton) {
      saveButton.disabled = state !== "ready";
      saveButton.classList.toggle("opacity-50", state !== "ready");
      saveButton.classList.toggle("cursor-not-allowed", state !== "ready");
    }
  }

  function updateStoragePathField(path: string): boolean {
    const form = sectionRef.current?.closest("form");

    if (!form) return false;

    const field = Array.from(form.elements).find(
      (element) =>
        element instanceof HTMLInputElement &&
        element.name === "storage_path",
    );

    if (!(field instanceof HTMLInputElement)) {
      return false;
    }

    const nativeSetter = Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      "value",
    )?.set;

    if (nativeSetter) {
      nativeSetter.call(field, path);
    } else {
      field.value = path;
    }

    field.dispatchEvent(new Event("input", { bubbles: true }));
    field.dispatchEvent(new Event("change", { bubbles: true }));

    return true;
  }

  async function uploadImage(file: File): Promise<void> {
    if (uploadInProgressRef.current) return;

    const sequence = ++uploadSequenceRef.current;

    setUploadError(null);
    setIsUploading(true);
    setFormUploadState("uploading");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/admin/gallery-images", {
        method: "POST",
        body: formData,
        credentials: "same-origin",
      });

      let result: UploadResponse;

      try {
        result = (await response.json()) as UploadResponse;
      } catch {
        throw new Error(
          "The upload server returned an unexpected response.",
        );
      }

      if (!response.ok || !result.imageUrl || !result.storagePath) {
        throw new Error(result.error || "Gallery image upload failed.");
      }

      if (sequence !== uploadSequenceRef.current) return;

      if (!updateStoragePathField(result.storagePath)) {
        throw new Error(
          "Image uploaded, but the Storage Path field could not be updated.",
        );
      }

      setUploadedUrl(result.imageUrl);
      setPendingFile(null);
      setPreviewUrl(null);
      setUploadError(null);
      setFormUploadState("ready");

      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
        previewUrlRef.current = null;
      }
    } catch (error) {
      if (sequence !== uploadSequenceRef.current) return;

      setUploadError(
        error instanceof Error
          ? error.message
          : "Unable to upload the gallery image.",
      );

      setFormUploadState("failed");
    } finally {
      if (sequence === uploadSequenceRef.current) {
        setIsUploading(false);
      }
    }
  }

  async function handleSaveCrop(file: File): Promise<void> {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
    }

    const localPreviewUrl = URL.createObjectURL(file);

    previewUrlRef.current = localPreviewUrl;

    setPreviewUrl(localPreviewUrl);
    setPendingFile(file);
    setUploadedUrl(null);
    setUploadError(null);
    setIsEditing(false);

    await uploadImage(file);
  }

  function handleCancelPendingImage() {
    if (uploadInProgressRef.current) return;

    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }

    setPreviewUrl(null);
    setPendingFile(null);
    setUploadError(null);
    setFormUploadState("ready");
  }

  const displayUrl = previewUrl ?? uploadedUrl ?? initialImageUrl;

  return (
    <section ref={sectionRef} className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h4 className="text-sm font-bold uppercase tracking-wider text-zinc-300">
            Gallery Image
          </h4>
          <p className="mt-1 text-xs text-zinc-500">
            Standard aspect ratio: 4:3
          </p>
        </div>

        {!isEditing && (
          <button
            type="button"
            disabled={isUploading}
            onClick={() => {
              setUploadError(null);
              setIsEditing(true);
            }}
            className="min-h-11 rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isUploading
              ? "Uploading..."
              : displayUrl
                ? "Edit Image"
                : "Add Image"}
          </button>
        )}
      </div>

      {isEditing ? (
        <GalleryImageEditor
          initialImageUrl={uploadedUrl ?? initialImageUrl}
          onSaveCrop={handleSaveCrop}
          onCancel={() => setIsEditing(false)}
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-white/10 bg-zinc-900">
          <div className="relative aspect-[4/3] w-full">
            {displayUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={displayUrl}
                alt="Gallery image preview"
                className="h-full w-full object-contain"
              />
            ) : (
              <div className="flex h-full items-center justify-center px-4 text-center text-sm text-zinc-500">
                No gallery image selected
              </div>
            )}
          </div>
        </div>
      )}

      {isUploading && (
        <div
          role="status"
          aria-live="polite"
          className="rounded-lg border border-blue-500/30 bg-blue-500/10 px-4 py-3 text-sm leading-6 text-blue-200"
        >
          Uploading image to Supabase Storage. Saving this gallery item is
          temporarily disabled.
        </div>
      )}

      {uploadError && !isUploading && (
        <div
          role="alert"
          className="space-y-3 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm leading-6 text-red-200"
        >
          <p className="font-semibold">Gallery image upload failed</p>
          <p>{uploadError}</p>

          <p>The existing gallery image has not been replaced.</p>

          <div className="flex flex-wrap gap-2">
            {pendingFile && (
              <button
                type="button"
                onClick={() => void uploadImage(pendingFile)}
                className="min-h-11 rounded-lg bg-[#ea1b24] px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
              >
                Retry Upload
              </button>
            )}

            <button
              type="button"
              onClick={handleCancelPendingImage}
              className="min-h-11 rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Cancel Replacement
            </button>
          </div>
        </div>
      )}

      {uploadedUrl && !isUploading && !uploadError && (
        <div
          role="status"
          className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm leading-6 text-emerald-200"
        >
          Image uploaded successfully. Click{" "}
          <strong>Save Changes</strong> or{" "}
          <strong>Create Gallery Image</strong> to save the new Storage path
          to the Gallery database.
        </div>
      )}
    </section>
  );
}