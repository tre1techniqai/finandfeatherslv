
"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, type MouseEvent } from "react";

const OPEN_RESERVATION_EVENT = "fin-feathers:open-reservation-modal";
const OPEN_MENU_EVENT = "fin-feathers:open-menu-modal";

const navigationLinks = [
  { label: "FULL MENU", href: "#full-menu" },
  { label: "RESERVATIONS", href: "#reservations" },
  {
    label: "ORDER ONLINE",
    href: "https://toast.app/r/fin-feathers-las-vegas-1229-s-casino-center-blvd/order?utm_medium=redirect",
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

  const handleNavigation = (
    event: MouseEvent<HTMLAnchorElement>,
    label: string,
  ) => {
    if (label !== "FULL MENU" && label !== "RESERVATIONS") return;

    event.preventDefault();
    setMenuOpen(false);

    if (label === "FULL MENU") {
      window.dispatchEvent(new Event(OPEN_MENU_EVENT));
    } else {
      window.dispatchEvent(new Event(OPEN_RESERVATION_EVENT));
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/30 bg-[rgb(234_27_36_/_60%)] text-white shadow-lg backdrop-blur-sm">
      <div className="mx-auto flex min-h-20 w-full max-w-[1600px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-10">
        <Link
          href="/"
          aria-label="Fin & Feathers home"
          className="flex min-w-0 flex-1 items-center md:flex-none"
          onClick={() => setMenuOpen(false)}
        >
          <Image
            src="/img/fin-feathers-icon-blk-alpha.png"
            alt="Fin & Feathers"
            width={70}
            height={70}
            priority
            className="h-14 w-14 shrink-0 object-contain sm:h-14 sm:w-14 md:block"
          />

          <span className="ml-3 block max-w-full text-3xl font-light leading-tight tracking-[0.08em] text-yellow-400 sm:text-2xl md:text-3xl lg:text-3xl">
            Fin & Feathers
          </span>
        </Link>

        <nav
          aria-label="Main navigation"
          className="hidden items-center justify-end gap-5 md:flex lg:gap-8"
        >
          {navigationLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target={link.external ? "_blank" : undefined}
              rel={link.external ? "noopener noreferrer" : undefined}
              onClick={(event) => handleNavigation(event, link.label)}
              className="whitespace-nowrap text-xs font-semibold tracking-[0.1em] text-white transition-colors hover:text-white/70 lg:text-sm"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <button
          type="button"
          aria-label={
            menuOpen ? "Close navigation menu" : "Open navigation menu"
          }
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

      {menuOpen && (
        <nav
          id="mobile-navigation"
          aria-label="Mobile navigation"
          className="border-t border-white/20 bg-[rgb(190_20_29_/_40%)] px-5 py-3 md:hidden"
        >
          {navigationLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target={link.external ? "_blank" : undefined}
              rel={link.external ? "noopener noreferrer" : undefined}
              onClick={(event) => handleNavigation(event, link.label)}
              className="block border-b border-white/15 py-4 text-sm font-semibold tracking-[0.1em] text-white last:border-b-0 hover:bg-white/5"
            >
              {link.label}
            </a>
          ))}
        </nav>
      )}
    </header>
  );
}
