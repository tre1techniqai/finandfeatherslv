"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

const FACEBOOK_URL =
  "https://www.facebook.com/finandfeatherslasvegas";

const INSTAGRAM_URL =
  "https://www.instagram.com/finandfeatherslasvegas/";

const TIKTOK_URL =
  "https://www.tiktok.com/@finandfeatherslasvegas";

const COMMUNITY_URL = "https://finandfeathers.live/checkin";

function FacebookIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-8 w-8"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M13.5 21v-8.2h2.8l.4-3.2h-3.2V7.5c0-.9.3-1.5 1.6-1.5h1.7V3.1c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3v2.3H7.3v3.2h2.8V21h3.4Z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-8 w-8"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle
        cx="17.5"
        cy="6.7"
        r="1"
        fill="currentColor"
        stroke="none"
      />
    </svg>
  );
}

function TikTokIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-8 w-8"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M19.6 7.3a6.7 6.7 0 0 1-4.1-1.4v8.2a6.1 6.1 0 1 1-5.3-6.1v3.4a2.8 2.8 0 1 0 1.9 2.7V2.5h3.4c.2 2.1 1.7 3.8 4.1 4.1v.7Z" />
    </svg>
  );
}

function CommunityIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-8 w-8"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="10" cy="7" r="4" />
      <path d="M20 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function ExternalLinkIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M14 3h7v7" />
      <path d="M21 3 10 14" />
      <path d="M21 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h6" />
    </svg>
  );
}

export default function SocialLinks() {
  const [isCommunityOpen, setIsCommunityOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

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

  const communityModal = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/85 p-3 sm:p-6 landscape:p-1"
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
        className="relative flex h-[88dvh] max-h-full w-full max-w-5xl flex-col overflow-hidden rounded-xl border border-white/20 bg-black shadow-2xl landscape:h-[calc(100dvh-0.5rem)] landscape:rounded-lg"
      >
        <div className="flex shrink-0 items-center justify-between gap-2 border-b border-white/15 bg-black px-3 py-2 sm:px-4 sm:py-3 landscape:py-1">
          <h3 className="min-w-0 truncate text-sm font-semibold text-white sm:text-base">
            Fin &amp; Feathers Community
          </h3>

          <div className="flex shrink-0 items-center gap-2">
            <a
              href={COMMUNITY_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Open Check-In full page in a new tab"
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-white/25 px-3 text-xs font-semibold text-white transition hover:border-[#ea1b24] hover:bg-[#ea1b24]/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white sm:text-sm"
            >
              <ExternalLinkIcon />
              <span>Open Full Page</span>
            </a>

            <button
              type="button"
              onClick={() => setIsCommunityOpen(false)}
              aria-label="Close community"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-3xl leading-none text-white transition hover:bg-[#ea1b24] focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              &times;
            </button>
          </div>
        </div>

        <iframe
          src={COMMUNITY_URL}
          title="Fin & Feathers Community"
          className="block min-h-0 w-full flex-1 border-0 bg-white"
          allow="fullscreen"
          allowFullScreen
        />
      </div>
    </div>
  );

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

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* 1. Check-In */}
          <button
            type="button"
            onClick={() => setIsCommunityOpen(true)}
            className={linkClass}
            aria-label="Open the Fin & Feathers community"
          >
            <span className="text-[#ea1b24] transition group-hover:scale-110">
              <CommunityIcon />
            </span>
            <span className="font-semibold">Check-In</span>
            <span className="text-xs text-white/60">
              Join the conversation
            </span>
          </button>

          {/* 2. Instagram */}
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

          {/* 3. TikTok */}
          <a
            href={TIKTOK_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={linkClass}
            aria-label="Visit Fin & Feathers on TikTok"
          >
            <span className="text-white transition group-hover:scale-110">
              <TikTokIcon />
            </span>
            <span className="font-semibold">TikTok</span>
            <span className="text-xs text-white/60">
              Follow our videos
            </span>
          </a>

          {/* 4. Facebook */}
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
        </div>
      </section>

      {isMounted &&
        isCommunityOpen &&
        createPortal(communityModal, document.body)}
    </>
  );
}