
"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

const navigationLinks = [
  { label: "FULL MENU", href: "#full-menu" },
  { label: "MAKE A RESERVATION", href: "#reservations" },
  { label: "ORDER ONLINE", href: "#order-online" },
  { label: "GET DIRECTIONS", href: "#directions" },
];

export default function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[rgb(234_27_36_/_40%)] text-white shadow-lg backdrop-blur-sm">
      <div className="mx-auto flex min-h-20 w-full max-w-[1600px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-10">
        
        {/* Mobile slogan; desktop logo */}
        <Link
        href="/"
        aria-label="Fin & Feathers home"
        className="flex min-w-0 flex-1 items-center md:flex-none"
        onClick={() => setMenuOpen(false)}
        >
            <Image
                src="/img/fin-feathers-icon.png"
                alt="Fin & Feathers"
                width={65}
                height={65}
                priority
                className="hidden h-14 w-14 shrink-0 object-contain sm:h-14 sm:w-14 md:block"
            />

            <span className="block max-w-full text-[clamp(12px,3.4vw,19px)] font-bold leading-tight tracking-[0.08em] text-white md:hidden">
                ELEVATED DINING MEETS SOUTHERN SOUL
            </span>
        </Link>


        {/* Desktop navigation */}
        <nav
          aria-label="Main navigation"
          className="hidden items-center justify-end gap-5 lg:gap-8 md:flex"
        >
          {navigationLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="whitespace-nowrap text-xs font-semibold tracking-[0.1em] text-white transition-colors hover:text-white/70 lg:text-sm"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Mobile menu toggle */}
        <button
          type="button"
          aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={menuOpen}
          aria-controls="mobile-navigation"
          onClick={() => setMenuOpen((open) => !open)}
          className="flex h-11 w-11 shrink-0 flex-col items-center justify-center gap-[5px] rounded-md border border-white/40 transition-colors hover:bg-white/10 md:hidden"
        >
          <span
            className={`block h-0.5 w-5 bg-white transition-transform ${
              menuOpen ? "translate-y-[7px] rotate-45" : ""
            }`}
          />
          <span
            className={`block h-0.5 w-5 bg-white transition-opacity ${
              menuOpen ? "opacity-0" : "opacity-100"
            }`}
          />
          <span
            className={`block h-0.5 w-5 bg-white transition-transform ${
              menuOpen ? "-translate-y-[7px] -rotate-45" : ""
            }`}
          />
        </button>
      </div>

      {/* Mobile dropdown navigation */}
      {menuOpen && (
        <nav
          id="mobile-navigation"
          aria-label="Mobile navigation"
          className="border-t border-white/20 bg-[rgb(190_20_29_/_40%)] px-5 py-3 md:hidden"
        >
          {navigationLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="block border-b border-white/15 py-4 text-sm font-semibold tracking-[0.1em] text-white last:border-b-0 hover:bg-white/5"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
