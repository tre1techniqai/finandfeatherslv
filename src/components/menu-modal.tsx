
"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";

const OPEN_MENU_EVENT = "fin-feathers:open-menu-modal";
const MENU_URL = "https://finandfeathers.live/menu";

type MenuTriggerProps = {
  children: ReactNode;
  className: string;
};

export function MenuTrigger({ children, className }: MenuTriggerProps) {
  return (
    <a
      href="#full-menu"
      className={className}
      onClick={(event) => {
        event.preventDefault();
        window.dispatchEvent(new Event(OPEN_MENU_EVENT));
      }}
    >
      {children}
    </a>
  );
}

export default function MenuModal() {
  const [isOpen, setIsOpen] = useState(false);

  const closeModal = useCallback(() => {
    setIsOpen(false);
  }, []);

  useEffect(() => {
    const openModal = () => setIsOpen(true);

    window.addEventListener(OPEN_MENU_EVENT, openModal);
    return () => window.removeEventListener(OPEN_MENU_EVENT, openModal);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeModal();
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, closeModal]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-end justify-center bg-black/85 p-0 backdrop-blur-sm sm:items-center sm:p-4">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="menu-dialog-title"
        className="flex max-h-[96dvh] w-full max-w-6xl flex-col overflow-hidden rounded-t-2xl border border-white/20 bg-[#101010] text-white shadow-2xl sm:max-h-[92dvh] sm:rounded-2xl"
      >
        <div className="flex items-center justify-between gap-4 border-b border-white/15 bg-[rgb(234_27_36_/_60%)] px-4 py-4 sm:px-6">
          <div>
            <p className="text-xs font-bold tracking-[0.2em] text-red-100">
              FIN & FEATHERS · LAS VEGAS
            </p>
            <h2
              id="menu-dialog-title"
              className="mt-1 text-xl font-bold tracking-wide sm:text-2xl"
            >
              FULL MENU
            </h2>
          </div>

          <button
            type="button"
            onClick={closeModal}
            aria-label="Close full menu"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/30 text-2xl leading-none hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            ×
          </button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col">
          <iframe
            src={MENU_URL}
            title="Fin & Feathers full menu"
            className="min-h-[55dvh] w-full flex-1 border-0 bg-white sm:min-h-[65dvh]"
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
          />

          <div className="flex flex-col gap-3 border-t border-white/15 bg-[#101010] p-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <p className="text-sm leading-5 text-white/70">
              If the menu does not appear above, open it separately.
            </p>
            <a
              href={MENU_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center justify-center rounded-lg bg-[#ea1b24] px-5 py-3 text-center text-sm font-bold tracking-wide text-white hover:bg-red-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              OPEN MENU IN NEW TAB
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
