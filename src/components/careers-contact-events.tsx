
"use client";

import { useEffect, useState } from "react";

type ModalType = "careers" | "events" | null;

function SectionIcon({
  type,
  size = 24,
}: {
  type: "careers" | "events" | "phone" | "email" | "location";
  size?: number;
}) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true as const,
  };

  switch (type) {
    case "careers":
      return (
        <svg {...common}>
          <rect x="3" y="7" width="18" height="13" rx="2" />
          <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          <path d="M3 12h18M10 12v2h4v-2" />
        </svg>
      );

    case "events":
      return (
        <svg {...common}>
          <rect x="3" y="5" width="18" height="16" rx="2" />
          <path d="M16 3v4M8 3v4M3 10h18" />
          <path d="m10 14 2 2 4-4" />
        </svg>
      );

    case "phone":
      return (
        <svg {...common}>
          <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.4 19.4 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.9a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.2-1.3a2 2 0 0 1 2.1-.5c.9.3 1.9.6 2.9.7a2 2 0 0 1 1.8 2.1Z" />
        </svg>
      );

    case "email":
      return (
        <svg {...common}>
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="m3 7 9 6 9-6" />
        </svg>
      );

    case "location":
      return (
        <svg {...common}>
          <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" />
          <circle cx="12" cy="10" r="2.5" />
        </svg>
      );
  }
}

export default function CareersContactEvents() {
  const [activeModal, setActiveModal] = useState<ModalType>(null);

  useEffect(() => {
    if (!activeModal) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setActiveModal(null);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeModal]);

  const modalDetails = {
    careers: {
      title: "Careers at Fin & Feathers",
      url: "https://finandfeathers.live/careers",
    },
    events: {
      title: "Events & Experiences at Fin & Feathers",
      url: "https://finandfeathers.live/events",
    },
  };

  const cardClass =
    "flex h-full flex-col items-center justify-center rounded-2xl border border-white/15 bg-black/55 p-6 text-center transition duration-200 hover:border-[#ea1b24]/70 hover:bg-white/[0.04] sm:p-8";

  return (
    <>
      <section
        id="careers-contact-events"
        className="mt-8 border-t border-white/15 px-4 py-12 sm:px-6 sm:py-16"
      >
        <div className="mx-auto max-w-[1500px]">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {/* Careers */}
            <button
              type="button"
              onClick={() => setActiveModal("careers")}
              className={`${cardClass} group w-full`}
              aria-label="Open Careers at Fin & Feathers"
            >
              <span className="mb-4 text-[#ea1b24] transition-transform group-hover:scale-110">
                <SectionIcon type="careers" size={46} />
              </span>

              <h2 className="text-xl font-bold tracking-wide text-white">
                CAREERS
              </h2>

              <p className="mt-3 max-w-sm text-sm leading-6 text-white/75">
                Join our team. Multiple Locations across Georgia &amp; Las
                Vegas. We are hiring now!
              </p>

              <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#ea1b24]">
                EXPLORE CAREERS
                <span aria-hidden="true">↗</span>
              </span>
            </button>

            {/* Contact Us */}
            <div className={cardClass}>
              <h2 className="text-xl font-bold tracking-wide text-white">
                CONTACT US
              </h2>

              <div className="mt-6 w-full space-y-5 text-left">
                <a
                  href="tel:+17252049655"
                  className="flex items-start gap-3 text-sm text-white/85 transition hover:text-[#ea1b24]"
                >
                  <span className="mt-0.5 shrink-0 text-[#ea1b24]">
                    <SectionIcon type="phone" />
                  </span>
                  <span>(725) 204-9655</span>
                </a>

                <a
                  href="mailto:info@finandfeathersrestaurants.com"
                  className="flex items-start gap-3 break-words text-sm text-white/85 transition hover:text-[#ea1b24]"
                >
                  <span className="mt-0.5 shrink-0 text-[#ea1b24]">
                    <SectionIcon type="email" />
                  </span>
                  <span className="break-all">
                    info@finandfeathersrestaurants.com
                  </span>
                </a>

                <a
                  href="https://www.google.com/maps/search/?api=1&query=1229+S+Casino+Center+Blvd%2C+Las+Vegas%2C+NV+89104"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-3 text-sm leading-6 text-white/85 transition hover:text-[#ea1b24]"
                >
                  <span className="mt-0.5 shrink-0 text-[#ea1b24]">
                    <SectionIcon type="location" />
                  </span>
                  <span>
                    1229 S Casino Center Blvd,
                    <br />
                    Las Vegas, NV 89104
                  </span>
                </a>
              </div>
            </div>

            {/* Events */}
            <button
              type="button"
              onClick={() => setActiveModal("events")}
              className={`${cardClass} group w-full`}
              aria-label="Open Events and Experiences"
            >
              <span className="mb-4 text-[#ea1b24] transition-transform group-hover:scale-110">
                <SectionIcon type="events" size={46} />
              </span>

              <h2 className="text-xl font-bold tracking-wide text-white">
                EVENTS &amp; EXPERIENCES
              </h2>

              <p className="mt-3 max-w-sm text-sm leading-6 text-white/75">
                From live music to exclusive tastings, discover unforgettable
                experiences at Fin &amp; Feathers.
              </p>

              <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#ea1b24]">
                DISCOVER EVENTS
                <span aria-hidden="true">↗</span>
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* Careers and Events modal */}
      {activeModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-3 backdrop-blur-sm sm:p-6"
          onClick={() => setActiveModal(null)}
          role="presentation"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="careers-events-modal-title"
            className="flex h-[90dvh] max-h-[900px] w-full max-w-6xl flex-col overflow-hidden rounded-xl border border-white/20 bg-[#111] shadow-2xl sm:h-[88dvh]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex min-h-16 items-center justify-between gap-4 border-b border-white/15 px-4 py-3 sm:px-6">
              <h2
                id="careers-events-modal-title"
                className="text-base font-bold text-white sm:text-lg"
              >
                {modalDetails[activeModal].title}
              </h2>

              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/20 text-2xl leading-none text-white transition hover:border-[#ea1b24] hover:bg-[#ea1b24]"
                aria-label="Close modal"
              >
                ×
              </button>
            </div>

            <div className="min-h-0 flex-1 bg-white">
              <iframe
                key={activeModal}
                src={modalDetails[activeModal].url}
                title={modalDetails[activeModal].title}
                className="h-full w-full border-0"
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/15 bg-[#111] px-4 py-3">
              <p className="text-xs text-white/60">
                Having trouble viewing this page?
              </p>

              <a
                href={modalDetails[activeModal].url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-semibold text-white underline underline-offset-4 transition hover:text-[#ea1b24]"
              >
                Open in a new tab
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
