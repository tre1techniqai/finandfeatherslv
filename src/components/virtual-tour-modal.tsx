
"use client";

import { useEffect, useState } from "react";

const TOUR_URL = "https://www.360mall.shop/FIN_and_Feathers/";

export default function VirtualTourModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label="Open the Fin & Feathers virtual tour"
        className="mx-auto block w-1/2 max-w-[300px] cursor-pointer"
      >
        <img
          src="/img/fin-feathers-virtual-tour-v2.png"
          alt="Take a virtual tour of Fin & Feathers"
          className="h-auto w-full object-contain"
        />
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-3 sm:p-6"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setIsOpen(false);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Fin & Feathers virtual tour"
            className="relative flex h-[min(90dvh,800px)] aspect-[9/16] max-w-[95vw] flex-col overflow-hidden rounded-xl border border-white/20 bg-black shadow-2xl"
          >
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Close virtual tour"
              className="absolute right-2 top-2 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/75 text-3xl leading-none text-white hover:bg-[#ea1b24] focus:outline-none focus:ring-2 focus:ring-white"
            >
              &times;
            </button>

            <iframe
              src={TOUR_URL}
              title="Fin & Feathers 360-degree virtual tour"
              className="h-full w-full border-0"
              allow="fullscreen; gyroscope; accelerometer"
              allowFullScreen
              loading="eager"
            />
          </div>
        </div>
      )}
    </>
  );
}
