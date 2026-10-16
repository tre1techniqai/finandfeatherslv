"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type MenuImageEditorProps = {
  initialImageUrl?: string | null;
  onSaveCrop: (file: File) => Promise<void> | void;
  onCancel?: () => void;
};

const OUTPUT_WIDTH = 1200;
const OUTPUT_HEIGHT = 900;
const MAX_FILE_SIZE = 15 * 1024 * 1024;

export default function MenuImageEditor({
  initialImageUrl,
  onSaveCrop,
  onCancel,
}: MenuImageEditorProps) {
  const [source, setSource] = useState(initialImageUrl ?? "");
  const [urlInput, setUrlInput] = useState(initialImageUrl ?? "");
  const [imageSize, setImageSize] = useState<{ width: number; height: number } | null>(null);
  const [zoom, setZoom] = useState(1);
  const [frameWidth, setFrameWidth] = useState(400);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [showGuides, setShowGuides] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const imageRef = useRef<HTMLImageElement | null>(null);
  const frameRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<{ x: number; y: number; originX: number; originY: number } | null>(null);
  const objectUrlRef = useRef<string | null>(null);

  const clearObjectUrl = useCallback(() => {
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    objectUrlRef.current = null;
  }, []);

  useEffect(() => () => clearObjectUrl(), [clearObjectUrl]);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;

    const updateFrameWidth = () => {
      const width = frame.getBoundingClientRect().width;
      if (width > 0) setFrameWidth(width);
    };

    updateFrameWidth();
    const observer = new ResizeObserver(updateFrameWidth);
    observer.observe(frame);
    return () => observer.disconnect();
  }, []);

  const frameHeight = frameWidth * 0.75;
  const baseScale = imageSize
    ? Math.max(frameWidth / imageSize.width, frameHeight / imageSize.height)
    : 1;
  const renderedWidth = imageSize ? imageSize.width * baseScale * zoom : 0;
  const renderedHeight = imageSize ? imageSize.height * baseScale * zoom : 0;
  const maxX = Math.max(0, (renderedWidth - frameWidth) / 2);
  const maxY = Math.max(0, (renderedHeight - frameHeight) / 2);
  const clampedX = Math.max(-maxX, Math.min(maxX, position.x));
  const clampedY = Math.max(-maxY, Math.min(maxY, position.y));

  function chooseFile(file?: File) {
    if (!file) return;
    if (!file.type.startsWith("image/") || file.type === "image/svg+xml") {
      setError("Choose a supported raster image (JPEG, PNG, WebP, etc.).");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setError("The image must be 15 MB or smaller.");
      return;
    }
    clearObjectUrl();
    const next = URL.createObjectURL(file);
    objectUrlRef.current = next;
    setSource(next);
    setUrlInput("");
    setImageSize(null);
    setZoom(1);
    setPosition({ x: 0, y: 0 });
    setError("");
    setNotice("");
  }

  function loadUrl() {
    try {
      const parsed = new URL(urlInput.trim());
      if (parsed.protocol !== "https:") throw new Error("HTTPS required");
      clearObjectUrl();
      setSource(parsed.toString());
      setImageSize(null);
      setZoom(1);
      setPosition({ x: 0, y: 0 });
      setError("");
      setNotice("");
    } catch {
      setError("Enter a valid HTTPS image URL.");
    }
  }

  function onPointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (!imageSize) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      x: event.clientX,
      y: event.clientY,
      originX: clampedX,
      originY: clampedY,
    };
  }

  function onPointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    if (!drag) return;
    setPosition({
      x: Math.max(-maxX, Math.min(maxX, drag.originX + event.clientX - drag.x)),
      y: Math.max(-maxY, Math.min(maxY, drag.originY + event.clientY - drag.y)),
    });
  }

  async function saveCrop() {
    const image = imageRef.current;
    if (!image || !imageSize || busy) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const canvas = document.createElement("canvas");
      canvas.width = OUTPUT_WIDTH;
      canvas.height = OUTPUT_HEIGHT;
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Canvas is unavailable in this browser.");
      const outputScale = OUTPUT_WIDTH / frameWidth;
      context.drawImage(
        image,
        (frameWidth / 2 - renderedWidth / 2 + clampedX) * outputScale,
        (frameHeight / 2 - renderedHeight / 2 + clampedY) * outputScale,
        renderedWidth * outputScale,
        renderedHeight * outputScale,
      );
      const blob = await new Promise<Blob | null>((resolve, reject) => {
        try {
          canvas.toBlob(resolve, "image/webp", 0.9);
        } catch (cause) {
          reject(cause);
        }
      });
      if (!blob || blob.type !== "image/webp") {
        throw new Error("Your browser could not export a WebP image.");
      }
      await onSaveCrop(new File([blob], `menu-image-${Date.now()}.webp`, { type: "image/webp" }));
      setNotice("Cropped image prepared successfully.");
    } catch (cause) {
      setError(
        cause instanceof DOMException && cause.name === "SecurityError"
          ? "This image host blocks browser cropping (CORS). Download the image and upload the file instead."
          : cause instanceof Error
            ? cause.message
            : "Unable to prepare the cropped image.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="space-y-4 rounded-xl border border-white/15 bg-zinc-950 p-4 text-white sm:p-5" aria-label="Menu image crop editor">
      <div>
        <h3 className="text-base font-semibold">Edit menu image</h3>
        <p className="mt-1 text-xs text-zinc-400">Drag to position the image inside the 4:3 crop. Export size: 1200 × 900 WebP.</p>
      </div>

      <label className="block text-sm text-zinc-300">
        <span className="mb-2 block font-medium">Upload an image</span>
        <input type="file" accept="image/jpeg,image/png,image/webp,image/avif,image/gif" onChange={(event) => chooseFile(event.target.files?.[0])} className="block w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-[#ea1b24] file:px-4 file:py-2.5 file:font-semibold file:text-white" />
      </label>

      <div className="space-y-2">
        <label htmlFor="menu-image-url" className="block text-sm font-medium text-zinc-300">Or paste an image URL</label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input id="menu-image-url" type="url" value={urlInput} onChange={(event) => setUrlInput(event.target.value)} placeholder="https://..." className="min-h-11 min-w-0 flex-1 rounded-lg border border-white/20 bg-black px-3 text-base text-white outline-none focus:border-[#ea1b24] sm:text-sm" />
          <button type="button" onClick={loadUrl} className="min-h-11 rounded-lg border border-white/20 px-4 text-sm font-semibold hover:bg-white/10">Load URL</button>
        </div>
      </div>

      <div
        ref={frameRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={() => { dragRef.current = null; }}
        onPointerCancel={() => { dragRef.current = null; }}
        className="relative aspect-[4/3] w-full cursor-grab touch-none overflow-hidden rounded-lg border-2 border-[#ea1b24] bg-black active:cursor-grabbing"
        aria-label="Drag image to reposition within the 4 by 3 crop"
      >
        {source ? (
          // The source may be a temporary blob URL or a user-provided remote URL.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            ref={imageRef}
            src={source}
            alt="Image being cropped"
            crossOrigin="anonymous"
            draggable={false}
            onLoad={(event) => {
              setImageSize({ width: event.currentTarget.naturalWidth, height: event.currentTarget.naturalHeight });
              setError("");
            }}
            onError={() => {
              setImageSize(null);
              setError("Unable to load this image. Try uploading it from your device.");
            }}
            style={imageSize ? {
              position: "absolute",
              width: `${(renderedWidth / frameWidth) * 100}%`,
              height: `${(renderedHeight / frameHeight) * 100}%`,
              maxWidth: "none",
              left: "50%",
              top: "50%",
              transform: `translate(calc(-50% + ${clampedX}px), calc(-50% + ${clampedY}px))`,
              userSelect: "none",
              pointerEvents: "none",
            } : { opacity: 0 }}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center px-5 text-center text-sm text-zinc-500">Upload an image or load a URL to begin</div>
        )}
        {showGuides && imageSize ? (
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 grid grid-cols-3 grid-rows-3">
            {Array.from({ length: 9 }, (_, index) => <div key={index} className="border border-white/30" />)}
          </div>
        ) : null}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm text-zinc-300">
          <label htmlFor="menu-image-zoom">Zoom</label>
          <span className="tabular-nums">{Math.round(zoom * 100)}%</span>
        </div>
        <input id="menu-image-zoom" type="range" min="1" max="3" step="0.01" value={zoom} disabled={!imageSize} onChange={(event) => setZoom(Number(event.target.value))} className="w-full accent-[#ea1b24]" />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <label className="flex items-center gap-2 text-sm text-zinc-300">
            <input type="checkbox" checked={showGuides} onChange={(event) => setShowGuides(event.target.checked)} className="accent-[#ea1b24]" />
            Show crop guides
          </label>
          <button type="button" onClick={() => { setZoom(1); setPosition({ x: 0, y: 0 }); }} className="min-h-10 rounded-lg border border-white/20 px-3 text-sm hover:bg-white/10">Reset crop</button>
        </div>
      </div>

      {error ? <p role="alert" className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">{error}</p> : null}
      {notice ? <p role="status" className="text-sm text-emerald-300">{notice}</p> : null}

      <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
        {onCancel ? <button type="button" onClick={onCancel} className="min-h-11 rounded-lg border border-white/20 px-5 text-sm font-semibold">Cancel</button> : null}
        <button type="button" onClick={saveCrop} disabled={!imageSize || busy} className="min-h-11 rounded-lg bg-[#ea1b24] px-5 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-50">
          {busy ? "Preparing image..." : "Use cropped image"}
        </button>
      </div>
    </section>
  );
}
