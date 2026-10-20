"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const VIDEO_URL =
  "https://ikxruiemlczfritxrjqr.supabase.co/storage/v1/object/public/website-media/fin-feathers-ribeye.mp4";

const POSTER_URL = "/img/ribeye-video-thumb.png";

export default function RibeyeVideo() {
  const [isOpen, setIsOpen] = useState(false);
  const [portalReady, setPortalReady] = useState(false);

  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setPortalReady(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }

      if (event.key === "Tab") {
        const modal = document.querySelector(
          '[data-ribeye-modal="true"]',
        );

        if (!modal) return;

        const focusableElements =
          modal.querySelectorAll<HTMLElement>(
            'button:not([disabled]), video[controls], [tabindex]:not([tabindex="-1"])',
          );

        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement =
          focusableElements[focusableElements.length - 1];

        if (
          event.shiftKey &&
          document.activeElement === firstElement
        ) {
          event.preventDefault();
          lastElement.focus();
        } else if (
          !event.shiftKey &&
          document.activeElement === lastElement
        ) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    const focusTimer = window.setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 0);

    return () => {
      window.clearTimeout(focusTimer);
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
      triggerRef.current?.focus();
    };
  }, [isOpen]);

  return (
    <>
      {/* Approved Ribeye promotional graphic */}
      <div className="mx-auto w-full max-w-[420px]">
        <button
          ref={triggerRef}
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label="Play the Fin & Feathers ribeye video"
          aria-haspopup="dialog"
          className="group grid w-full grid-cols-[120px_minmax(0,1fr)] items-center gap-4 text-left sm:grid-cols-[132px_minmax(0,1fr)] sm:gap-5"
        >
          <div
            className="relative aspect-square w-full overflow-hidden rounded-full border-[3px] border-white bg-cover bg-center bg-no-repeat shadow-[0_10px_28px_rgba(0,0,0,0.38)]"
            style={{ backgroundImage: `url("${POSTER_URL}")` }}
          >
            <span className="absolute inset-0 bg-black/20 transition-colors duration-300 group-hover:bg-black/28" />

            <span className="absolute inset-0 flex items-center justify-center">
              <svg
                viewBox="0 0 48 48"
                aria-hidden="true"
                className="h-[88px] w-[88px] opacity-50 drop-shadow-[0_2px_6px_rgba(0,0,0,0.45)] transition-transform duration-300 group-hover:scale-110"
              >
                <path
                  d="M16 11.5C16 9.9 17.8 8.95 19.15 9.85L35.2 20.55C36.42 21.36 36.42 23.14 35.2 23.95L19.15 34.65C17.8 35.55 16 34.6 16 33V11.5Z"
                  fill="white"
                  stroke="white"
                  strokeWidth="1.4"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </div>

          <div className="flex w-full min-w-0 flex-col items-center justify-center p-0 text-center">
            <svg
              viewBox="0 0 300 112"
              xmlns="http://www.w3.org/2000/svg"
              role="img"
              aria-label="HAND-CUT USDA RIBEYE. MARINATED AND GRILLED TO PERFECTION."
              className="block h-auto w-full"
            >
              <text
                x="150"
                y="35"
                textAnchor="middle"
                textLength="98"
                lengthAdjust="spacingAndGlyphs"
                fill="#facc15"
                fontFamily="Arial, Helvetica, sans-serif"
                fontWeight="300"
                fontSize="22"
              >
                HAND-CUT
              </text>

              <text
                x="150"
                y="69"
                textAnchor="middle"
                textLength="296"
                lengthAdjust="spacingAndGlyphs"
                fill="#facc15"
                fontFamily="Arial, Helvetica, sans-serif"
                fontWeight="900"
                fontSize="32"
              >
                USDA RIBEYE
              </text>

              <text
                x="150"
                y="91"
                textAnchor="middle"
                textLength="296"
                lengthAdjust="spacingAndGlyphs"
                fill="#ffffff"
                fontFamily="Arial, Helvetica, sans-serif"
                fontWeight="700"
                fontSize="16"
              >
                MARINATED &amp; GRILLED
              </text>

              <text
                x="150"
                y="109"
                textAnchor="middle"
                fill="#ffffff"
                fontFamily="Arial, Helvetica, sans-serif"
                fontWeight="700"
                fontSize="16"
              >
                TO PERFECTION
              </text>
            </svg>
          </div>
        </button>
      </div>

      {/* Modal video player */}
      {isOpen &&
        portalReady &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto bg-black/90 p-3 backdrop-blur-sm sm:p-6"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) {
                setIsOpen(false);
              }
            }}
          >
            <section
              data-ribeye-modal="true"
              role="dialog"
              aria-modal="true"
              aria-labelledby="ribeye-modal-title"
              className="relative my-auto w-full max-w-4xl overflow-hidden rounded-2xl border border-white/15 bg-[#101010] shadow-2xl"
            >
              <header className="flex items-center justify-between gap-4 border-b border-white/10 px-4 py-3 sm:px-6">
                <h2
                  id="ribeye-modal-title"
                  className="text-base font-black uppercase tracking-wider text-yellow-400 sm:text-lg"
                >
                  Hand-Cut USDA Ribeye
                </h2>

                <button
                  ref={closeButtonRef}
                  type="button"
                  onClick={() => setIsOpen(false)}
                  aria-label="Close ribeye video"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-3xl text-white transition-colors hover:bg-[#ea1b24] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  &times;
                </button>
              </header>

              <div className="bg-black">
                <video
                  controls
                  autoPlay
                  playsInline
                  preload="metadata"
                  poster={POSTER_URL}
                  aria-label="Fin & Feathers ribeye steak video"
                  className="block max-h-[75dvh] w-full bg-black object-contain"
                >
                  <source src={VIDEO_URL} type="video/mp4" />
                  Your browser does not support video playback.
                </video>
              </div>
            </section>
          </div>,
          document.body,
        )}
    </>
  );
}