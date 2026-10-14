
"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, type MouseEvent } from "react";

const navigationLinks = [
  { label: "FULL MENU", href: "/menu" },
  { label: "RESERVATIONS", href: "/reservations" },
  {
    label: "ORDER ONLINE",
    href: "https://toast.app/r/fin-feathers-las-vegas-1229-s-casino-center-blvd/order?utm_medium=redirect&utm_source=fin-feathers-website",
    external: true,
  },
  {
    label: "LEAVE A REVIEW",
    href: "https://www.google.com/maps/place/Fin+%26+Feathers+Restaurants/@36.156238,-115.1522077,17z/data=!4m8!3m7!1s0x80c8c3c535db0607:0xeec4559c4d00dbbe!8m2!3d36.156238!4d-115.1522077!9m1!1b1!16s%2Fg%2F11vm377z6q?entry=ttu&g_ep=EgoyMDI2MTAwNy4wIKXMDSoASAFQAw%3D%3D",
    external: true,
  },
];

export default function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  
  const handleNavigation = () => {
    setMenuOpen(false);
  };


  const linkClass =
    "text-sm font-bold tracking-wide text-white transition-colors duration-200 hover:text-white/75";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[rgb(234_27_36_/_40%)] backdrop-blur-md">
      <div className="mx-auto flex min-h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        {/* Desktop brand */}
        <Link
          href="/"
          aria-label="Fin & Feathers home"
          className="hidden shrink-0 items-center md:flex"
        >
          <Image
            src="/img/fin-feathers-icon-blk-alpha.png"
            alt="Fin & Feathers"
            width={54}
            height={54}
            priority
            className="h-12 w-12 object-contain"
          />

          <span className="ml-3 block max-w-full text-3xl font-light leading-tight tracking-[0.08em] text-yellow-400 sm:text-2xl md:text-3xl lg:text-3xl">
            Fin & Feathers
          </span>
        </Link>

        {/* Mobile slogan */}
        <Link
          href="/"
          aria-label="Fin & Feathers home"
          className="min-w-0 flex-1 flex items-center gap-3 md:hidden"
        >
          <Image
            src="/img/fin-feathers-icon-blk-alpha.png"
            alt=""
            width={54}
            height={54}
            priority
            className="h-12 w-12 shrink-0 object-contain"
          />

          <span className="min-w-0 max-w-full text-2xl font-light leading-tight tracking-[0.08em] text-yellow-400">
            Fin & Feathers
          </span>
        </Link>

        {/* Desktop navigation */}
        <nav
          aria-label="Main navigation"
          className="hidden flex-1 items-center justify-end gap-5 lg:gap-8 md:flex"
        >
          {navigationLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className={linkClass}
              onClick={handleNavigation}
              {...("external" in link && link.external
                ? { target: "_blank", rel: "noopener noreferrer" }
                : {})}
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Mobile menu toggle */}
        <button
          type="button"
          aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={menuOpen}
          aria-controls="mobile-navigation"
          onClick={() => setMenuOpen((open) => !open)}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-white/30 text-white transition hover:bg-white/10 md:hidden"
        >
          {menuOpen ? (
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              className="h-6 w-6"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
            >
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          ) : (
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              className="h-6 w-6"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
            >
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile navigation */}
      {menuOpen && (
        <nav
          id="mobile-navigation"
          aria-label="Mobile navigation"
          className="border-t border-white/10 bg-[rgb(234_27_36_/_40%)] px-4 py-3 backdrop-blur-md md:hidden"
        >
          <div className="mx-auto flex w-full max-w-7xl flex-col">
            {navigationLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="border-b border-white/10 px-2 py-4 text-sm font-bold tracking-wide text-white transition-colors hover:bg-white/10 last:border-b-0"
                onClick={handleNavigation}
                {...("external" in link && link.external
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
              >
                {link.label}
              </a>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
