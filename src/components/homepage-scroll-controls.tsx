
"use client";

import { useEffect, useState } from "react";

function prefersReducedMotion() {
  return window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
}

function scrollToElement(id: string) {
  const element = document.getElementById(id);

  if (!element) return;

  element.scrollIntoView({
    behavior: prefersReducedMotion() ? "instant" : "smooth",
    block: "start",
  });
}

export function HomepageDownChevron() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    function handleScroll() {
      if (window.scrollY > 8) {
        setVisible(false);
      }
    }

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  if (!visible) return null;

  return (
    <button
      type="button"
      aria-label="Scroll down to Hours of Operation"
      onClick={() => {
        setVisible(false);
        scrollToElement("homepage-hours");
      }}
      className="group flex h-16 w-16 items-center justify-center rounded-full border-2 border-white bg-black text-white shadow-[0_0_20px_rgba(255,255,255,0.12)] transition-colors hover:border-[#ea1b24] hover:bg-[#ea1b24]/20 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white xl:hidden"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className="h-9 w-9 motion-safe:animate-[homepageChevronFloat_2.4s_ease-in-out_infinite]"
      >
        <path d="m5 9 7 7 7-7" />
      </svg>

      <style jsx>{`
        @keyframes homepageChevronFloat {
          0%,
          100% {
            transform: translateY(-3px);
          }

          50% {
            transform: translateY(4px);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          svg {
            animation: none !important;
          }
        }
      `}</style>
    </button>
  );
}

export function HomepageBackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function updateVisibility() {
      const documentHeight = Math.max(
        document.documentElement.scrollHeight,
        document.body.scrollHeight,
      );

      const viewportHeight = window.innerHeight;
      const scrollPosition = window.scrollY;

      const hasScrollableContent =
        documentHeight > viewportHeight + 8;

      const atBottom =
        scrollPosition + viewportHeight >=
        documentHeight - 12;

      setVisible(
        hasScrollableContent && atBottom,
      );
    }

    window.addEventListener("scroll", updateVisibility, {
      passive: true,
    });

    window.addEventListener("resize", updateVisibility);

    updateVisibility();

    return () => {
      window.removeEventListener(
        "scroll",
        updateVisibility,
      );

      window.removeEventListener(
        "resize",
        updateVisibility,
      );
    };
  }, []);

  if (!visible) return null;

  return (
    <button
      type="button"
      aria-label="Back to top of page"
      onClick={() => {
        setVisible(false);

        window.scrollTo({
          top: 0,
          behavior: prefersReducedMotion()
            ? "instant"
            : "smooth",
        });
      }}
      className="group flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/80 bg-black px-4 py-3 text-xs font-bold uppercase tracking-wide text-white shadow-[0_0_18px_rgba(255,255,255,0.12)] transition-colors hover:border-[#ea1b24] hover:bg-[#ea1b24]/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white motion-safe:animate-pulse"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className="h-5 w-5"
      >
        <path d="m5 15 7-7 7 7" />
      </svg>

      <span>Back to Top</span>
    </button>
  );
}
