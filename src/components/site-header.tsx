"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

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
        {/* Desktop brand logo */}
        <Link
          href="/"
          aria-label="Fin & Feathers home"
          className="hidden min-w-0 shrink-0 items-center md:flex"
        >
          <Image
            src="/img/fin-feathers-lv-logo-01-400.png"
            alt="Fin & Feathers Las Vegas"
            width={400}
            height={140}
            priority
            sizes="(min-width: 1024px) 240px, 180px"
            className="h-auto w-[180px] max-w-full object-contain lg:w-[240px]"
          />
        </Link>

        {/* Mobile brand logo */}
        <Link
          href="/"
          aria-label="Fin & Feathers home"
          className="flex min-w-0 flex-1 items-center md:hidden"
        >
          <Image
            src="/img/fin-feathers-lv-logo-01-400.png"
            alt="Fin & Feathers Las Vegas"
            width={400}
            height={140}
            priority
            sizes="(max-width: 374px) 180px, 220px"
            className="h-auto w-[180px] max-w-full object-contain min-[375px]:w-[220px]"
          />
        </Link>

        {/* Desktop navigation */}
        <nav
          aria-label="Main navigation"
          className="hidden min-w-0 flex-1 items-center justify-end gap-3 md:flex lg:gap-8"
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