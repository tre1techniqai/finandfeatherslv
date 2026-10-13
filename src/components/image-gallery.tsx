
"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";

const galleryImages = [
  "/img/gallery-pic-01.jpg",
  "/img/gallery-pic-02.jpg",
  "/img/gallery-pic-03.jpg",
  "/img/gallery-pic-04.jpg",
  "/img/gallery-pic-05.jpg",
  "/img/gallery-pic-06.jpg",
];

function ArrowIcon({ direction }: { direction: "prev" | "next" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-6 w-6"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {direction === "prev" ? (
        <path d="m15 18-6-6 6-6" />
      ) : (
        <path d="m9 18 6-6-6-6" />
      )}
    </svg>
  );
}

export default function ImageGallery() {
  const [isHovered, setIsHovered] = useState(false);

  const totalImages = galleryImages.length;

  const [trackIndex, setTrackIndex] = useState(1);
  const [transitionEnabled, setTransitionEnabled] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  const currentIndex = (trackIndex - 1 + totalImages) % totalImages;

  const previousImage = useCallback(() => {
    setTrackIndex((index) => index - 1);
  }, []);

  const nextImage = useCallback(() => {
    setTrackIndex((index) => index + 1);
  }, []);

  // Automatically advance every 3 seconds.
  // Pause while hovered or while the enlarged image modal is open.
  useEffect(() => {
    if (isHovered || isOpen) return;

    const interval = window.setInterval(() => {
      nextImage();
    }, 3000);

    return () => window.clearInterval(interval);
  }, [isHovered, isOpen, nextImage]);

  // Preserve modal keyboard controls and page scroll locking.
  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setIsOpen(false);
      if (event.key === "ArrowLeft") previousImage();
      if (event.key === "ArrowRight") nextImage();
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, nextImage, previousImage]);

  return (
    <section
      aria-label="Fin & Feathers photo gallery"
      className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="mb-5 text-center">
        <h2 className="text-2xl font-bold uppercase tracking-wide text-white sm:text-3xl">
          Gallery
        </h2>
        <p className="mt-2 text-sm text-white/70">
          Take a closer look at Fin &amp; Feathers.
        </p>
      </div>

      {/* Main slider */}
      <div className="relative overflow-hidden rounded-xl border border-white/15 bg-black/60 shadow-xl">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="block aspect-[4/3] w-full overflow-hidden cursor-zoom-in focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ea1b24]"
          aria-label={`Enlarge gallery image ${currentIndex + 1} of ${totalImages}`}
        >
          <div
            className={`flex h-full ${
              transitionEnabled
                ? "transition-transform duration-500 ease-in-out"
                : ""
            }`}
            style={{
              width: `${(totalImages + 2) * 100}%`,
              transform: `translateX(-${trackIndex * (100 / (totalImages + 2))}%)`,
            }}
            onTransitionEnd={(event) => {
              if (event.target !== event.currentTarget) return;

              if (trackIndex === 0 || trackIndex === totalImages + 1) {
                const resetIndex = trackIndex === 0 ? totalImages : 1;

                setTransitionEnabled(false);
                setTrackIndex(resetIndex);

                window.requestAnimationFrame(() => {
                  window.requestAnimationFrame(() => {
                    setTransitionEnabled(true);
                  });
                });
              }
            }}
          >
            {[
              galleryImages[totalImages - 1],
              ...galleryImages,
              galleryImages[0],
            ].map((image, slideIndex) => {
              const originalIndex =
                (slideIndex - 1 + totalImages) % totalImages;

              return (
                <div
                  key={`${slideIndex}-${image}`}
                  className="relative h-full flex-none"
                  style={{ width: `${100 / (totalImages + 2)}%` }}
                  aria-hidden={slideIndex !== trackIndex}
                >
                  <Image
                    src={image}
                    alt={`Fin & Feathers gallery photo ${originalIndex + 1}`}
                    className="object-cover"
                    fill
                    sizes="(max-width: 768px) 100vw, 896px"
                  />
                </div>
              );
            })}
          </div>
        </button>

        {/* Previous */}
        <button
          type="button"
          onClick={previousImage}
          aria-label="Previous image"
          className="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/65 text-white transition hover:bg-[#ea1b24] focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          <ArrowIcon direction="prev" />
        </button>

        {/* Next */}
        <button
          type="button"
          onClick={nextImage}
          aria-label="Next image"
          className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/65 text-white transition hover:bg-[#ea1b24] focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          <ArrowIcon direction="next" />
        </button>

        {/* Image count */}
        <div className="absolute bottom-3 right-3 rounded-full bg-black/70 px-3 py-1 text-xs font-medium text-white">
          {currentIndex + 1} / {totalImages}
        </div>
      </div>

      {/* Indicator dots */}
      <div
        className="mt-5 flex items-center justify-center gap-3"
        aria-label="Choose gallery image"
      >
        {galleryImages.map((image, index) => (
          <button
            key={image}
            type="button"
            onClick={() => setTrackIndex(index + 1)}
            aria-label={`Show image ${index + 1}`}
            aria-current={currentIndex === index ? "true" : undefined}
            className={`h-3 w-3 rounded-full transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ea1b24] focus-visible:ring-offset-2 focus-visible:ring-offset-black ${
              currentIndex === index
                ? "scale-110 bg-[#ea1b24]"
                : "bg-white/40 hover:bg-white/80"
            }`}
          />
        ))}
      </div>

      {/* Full-size image modal */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center bg-black/95 p-3 sm:p-6"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setIsOpen(false);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`Gallery image ${currentIndex + 1} of ${totalImages}`}
            className="relative flex h-full max-h-[90dvh] w-full max-w-6xl items-center justify-center"
          >
            {/* Close */}
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Close image"
              className="absolute right-0 top-0 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-black/75 text-3xl leading-none text-white transition hover:bg-[#ea1b24] focus:outline-none focus-visible:ring-2 focus-visible:ring-white sm:right-2 sm:top-2"
            >
              &times;
            </button>

            {/* Full image */}
            <Image
              key={currentIndex}
              src={galleryImages[currentIndex]}
              alt={`Fin & Feathers gallery photo ${currentIndex + 1}`}
              className="gallery-slide-left max-h-full max-w-full rounded-md object-contain"
              width={1200}
              height={800}
              sizes="(max-width: 768px) 100vw, 1152px"
            />

            {/* Modal previous */}
            <button
              type="button"
              onClick={previousImage}
              aria-label="Previous image"
              className="absolute left-0 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/75 text-white transition hover:bg-[#ea1b24] focus:outline-none focus-visible:ring-2 focus-visible:ring-white sm:left-2"
            >
              <ArrowIcon direction="prev" />
            </button>

            {/* Modal next */}
            <button
              type="button"
              onClick={nextImage}
              aria-label="Next image"
              className="absolute right-0 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/75 text-white transition hover:bg-[#ea1b24] focus:outline-none focus-visible:ring-2 focus-visible:ring-white sm:right-2"
            >
              <ArrowIcon direction="next" />
            </button>

            {/* Modal image count */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 rounded-full bg-black/75 px-4 py-2 text-sm text-white">
              {currentIndex + 1} / {totalImages}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
