
"use client";

import { useEffect, useState } from "react";

const MERCH_URL = "https://finandfeathers.live/merch";

export default function MerchModal() {
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
      <section className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6">
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold uppercase tracking-wide text-white sm:text-3xl">
            Fin &amp; Feathers Merch
          </h2>
          <p className="mt-2 text-sm text-white/70">
            Official Fin & Feathers merchandise. Fresh drops and limited-edition favorites.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label="Open the Fin & Feathers merchandise shop"
          className="group mx-auto block w-full max-w-[500px] overflow-hidden rounded-xl border border-white/15 bg-black/60 shadow-xl transition hover:-translate-y-1 hover:border-[#ea1b24] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ea1b24]"
        >
          <img
            src="/img/fin-feathers-merch-thumb.jpg"
            alt="Shop Fin & Feathers merchandise"
            className="h-auto w-full object-contain transition duration-300 group-hover:scale-[1.02]"
          />
          <span className="block bg-[#ea1b24]/90 px-4 py-3 font-semibold uppercase tracking-wide text-white transition group-hover:bg-[#ea1b24]">
            Shop Merch
          </span>
        </button>
      </section>

      {isOpen && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-black/85 p-3 sm:p-6"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setIsOpen(false);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Fin & Feathers merchandise shop"
            className="relative flex h-[90dvh] w-full max-w-6xl flex-col overflow-hidden rounded-xl border border-white/20 bg-black shadow-2xl"
          >
            <div className="flex shrink-0 items-center justify-between gap-3 border-b border-white/15 px-4 py-3">
              <h3 className="font-semibold text-white">
                Fin &amp; Feathers Merch
              </h3>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Close merch shop"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-3xl leading-none text-white transition hover:bg-[#ea1b24] focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                &times;
              </button>
            </div>

            <iframe
              src={MERCH_URL}
              title="Fin & Feathers merchandise shop"
              className="min-h-0 w-full flex-1 border-0 bg-white"
              allow="fullscreen"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </>
  );
}
