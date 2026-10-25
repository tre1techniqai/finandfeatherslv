
"use client";

import { useEffect, useRef, useState } from "react";
import MenuImageEditor from "@/components/admin/menu-image-editor";

type Props = {
  initialImageUrl?: string | null;
};

type UploadResult = {
  imageUrl?: string;
  error?: string;
};

export default function SpecialsImagePanel({
  initialImageUrl,
}: Props) {
  const [editing, setEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  const sectionRef = useRef<HTMLElement>(null);
  const busyRef = useRef(false);
  const failedRef = useRef(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    const form = sectionRef.current?.closest("form");
    if (!form) return;

    function guardSubmission(event: Event) {
      if (busyRef.current || failedRef.current) {
        event.preventDefault();
        event.stopPropagation();
      }
    }

    form.addEventListener("submit", guardSubmission, true);

    return () => {
      mountedRef.current = false;
      form.removeEventListener("submit", guardSubmission, true);
    };
  }, []);

  function setSaveState(state: "ready" | "uploading" | "failed") {
    busyRef.current = state === "uploading";
    failedRef.current = state === "failed";

    const form = sectionRef.current?.closest("form");
    if (!form) return;

    form.dataset.specialsImageUpload = state;

    const saveButton = form.querySelector<HTMLButtonElement>(
      'button[type="submit"]',
    );

    if (saveButton) {
      saveButton.disabled = state !== "ready";
    }
  }

  function updateThumbnailField(url: string): boolean {
    const form = sectionRef.current?.closest("form");
    if (!form) return false;

    const field = Array.from(form.elements).find(
      (element) =>
        element instanceof HTMLInputElement &&
        element.name === "thumbnail_url",
    );

    if (!(field instanceof HTMLInputElement)) return false;

    const setter = Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      "value",
    )?.set;

    if (setter) {
      setter.call(field, url);
    } else {
      field.value = url;
    }

    field.dispatchEvent(
      new Event("input", { bubbles: true }),
    );
    field.dispatchEvent(
      new Event("change", { bubbles: true }),
    );

    return true;
  }

  async function uploadImage(file: File) {
    if (busyRef.current) return;

    setPendingFile(file);
    setUploading(true);
    setError("");
    setSaveState("uploading");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(
        "/api/admin/specials-images",
        {
          method: "POST",
          credentials: "same-origin",
          body: formData,
          cache: "no-store",
        },
      );

      let result: UploadResult;

      try {
        result = (await response.json()) as UploadResult;
      } catch {
        throw new Error("Unexpected upload server response.");
      }

      if (!response.ok || !result.imageUrl) {
        throw new Error(
          result.error || "Thumbnail upload failed.",
        );
      }

      if (!updateThumbnailField(result.imageUrl)) {
        throw new Error(
          "Image uploaded, but the thumbnail URL field could not be updated.",
        );
      }

      if (!mountedRef.current) return;

      setUploadedUrl(result.imageUrl);
      setPendingFile(null);
      setError("");
      setEditing(false);
      setSaveState("ready");
    } catch (cause) {
      if (!mountedRef.current) return;

      setError(
        cause instanceof Error
          ? cause.message
          : "Unable to upload thumbnail.",
      );
      setSaveState("failed");
    } finally {
      if (mountedRef.current) {
        setUploading(false);
      }
    }
  }

  const displayUrl = uploadedUrl ?? initialImageUrl;

  return (
    <section ref={sectionRef} className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h4 className="text-sm font-bold uppercase tracking-wider text-zinc-300">
            SPECIALS Thumbnail
          </h4>
          <p className="mt-1 text-xs text-zinc-500">
            4:3 aspect ratio · 1200 × 900 WebP
          </p>
        </div>

        {!editing && (
          <button
            type="button"
            disabled={uploading}
            onClick={() => {
              setError("");
              setEditing(true);
            }}
            className="min-h-11 rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10 disabled:opacity-50"
          >
            {uploading
              ? "Uploading..."
              : displayUrl
                ? "Edit Image"
                : "Add Image"}
          </button>
        )}
      </div>

      {editing ? (
        <MenuImageEditor
          initialImageUrl={displayUrl}
          onSaveCrop={uploadImage}
          onCancel={() => setEditing(false)}
        />
      ) : (
        <div className="max-w-xl overflow-hidden rounded-xl border border-white/10 bg-zinc-900">
          <div className="aspect-[4/3] w-full">
            {displayUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={displayUrl}
                alt="SPECIALS thumbnail preview"
                className="h-full w-full object-contain"
              />
            ) : (
              <div className="flex h-full items-center justify-center p-6 text-sm text-zinc-500">
                No thumbnail selected
              </div>
            )}
          </div>
        </div>
      )}

      {uploading && (
        <p
          role="status"
          className="rounded-lg border border-blue-500/30 bg-blue-500/10 p-3 text-sm text-blue-200"
        >
          Uploading the thumbnail. Saving is temporarily disabled.
        </p>
      )}

      {error && !uploading && (
        <div
          role="alert"
          className="space-y-3 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200"
        >
          <p>{error}</p>
          <p>
            The existing saved thumbnail has not been changed.
          </p>

          <div className="flex flex-wrap gap-2">
            {pendingFile && (
              <button
                type="button"
                onClick={() => void uploadImage(pendingFile)}
                className="min-h-11 rounded-lg bg-[#ea1b24] px-4 py-2 font-semibold text-white"
              >
                Retry Upload
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                setError("");
                setPendingFile(null);
                setSaveState("ready");
              }}
              className="min-h-11 rounded-lg border border-white/20 px-4 py-2 font-semibold text-white"
            >
              Cancel Replacement
            </button>
          </div>
        </div>
      )}

      {uploadedUrl && !uploading && !error && (
        <p
          role="status"
          className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-200"
        >
          Thumbnail uploaded successfully. Click{" "}
          <strong>Save Changes</strong> or{" "}
          <strong>Create Daily Special</strong> to save the
          new thumbnail to the SPECIALS database.
        </p>
      )}
    </section>
  );
}