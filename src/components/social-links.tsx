
"use client";

import { useEffect, useState } from "react";

const FACEBOOK_URL =
  "https://www.facebook.com/finandfeathersrestaurants";

const INSTAGRAM_URL =
  "https://www.instagram.com/finandfeathers/";

const COMMUNITY_URL = "https://finandfeathers.live/checkin";

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-8 w-8" fill="currentColor" aria-hidden="true">
      <path d="M13.5 21v-8.2h2.8l.4-3.2h-3.2V7.5c0-.9.3-1.5 1.6-1.5h1.7V3.1c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3v2.3H7.3v3.2h2.8V21h3.4Z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.7" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function CommunityIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="10" cy="7" r="4" />
      <path d="M20 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

export default function SocialLinks() {
  const [isCommunityOpen, setIsCommunityOpen] = useState(false);

  useEffect(() => {
    if (!isCommunityOpen) return;

    const previousOverflow = document.body.style.overflow;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsCommunityOpen(false);
      }
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isCommunityOpen]);

  const linkClass =
    "group flex min-h-36 flex-col items-center justify-center gap-3 rounded-xl border border-white/15 bg-black/50 p-5 text-center text-white transition hover:-translate-y-1 hover:border-[#ea1b24] hover:bg-[#ea1b24]/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ea1b24]";

  return (
    <>
      <section
        aria-labelledby="social-links-heading"
        className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6"
      >
        <div className="mb-6 text-center">
          <h2
            id="social-links-heading"
            className="text-2xl font-bold uppercase tracking-wide text-white sm:text-3xl"
          >
            Follow Us
          </h2>
          <p className="mt-2 text-sm text-white/70">
            Stay connected with Fin &amp; Feathers.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <a
            href={FACEBOOK_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={linkClass}
            aria-label="Visit Fin & Feathers on Facebook"
          >
            <span className="text-[#1877F2] transition group-hover:scale-110">
              <FacebookIcon />
            </span>
            <span className="font-semibold">Facebook</span>
            <span className="text-xs text-white/60">
              Follow our page
            </span>
          </a>

          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={linkClass}
            aria-label="Visit Fin & Feathers on Instagram"
          >
            <span className="text-[#E4405F] transition group-hover:scale-110">
              <InstagramIcon />
            </span>
            <span className="font-semibold">Instagram</span>
            <span className="text-xs text-white/60">
              See what&apos;s happening
            </span>
          </a>

          <button
            type="button"
            onClick={() => setIsCommunityOpen(true)}
            className={linkClass}
            aria-label="Open the Fin & Feathers community"
          >
            <span className="text-[#ea1b24] transition group-hover:scale-110">
              <CommunityIcon />
            </span>
            <span className="font-semibold">Our Community</span>
            <span className="text-xs text-white/60">
              Join the conversation
            </span>
          </button>
        </div>
      </section>

      {isCommunityOpen && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-black/85 p-3 sm:p-6"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setIsCommunityOpen(false);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Fin & Feathers community"
            className="relative flex h-[88dvh] w-full max-w-5xl flex-col overflow-hidden rounded-xl border border-white/20 bg-black shadow-2xl"
          >
            <div className="flex shrink-0 items-center justify-between gap-3 border-b border-white/15 bg-black px-4 py-3">
              <h3 className="font-semibold text-white">
                Fin &amp; Feathers Community
              </h3>

              <button
                type="button"
                onClick={() => setIsCommunityOpen(false)}
                aria-label="Close community"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-3xl leading-none text-white transition hover:bg-[#ea1b24] focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                &times;
              </button>
            </div>

            <iframe
              src={COMMUNITY_URL}
              title="Fin & Feathers Community"
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
