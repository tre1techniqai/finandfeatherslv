
"use client";

import Image from "next/image";
import Link from "next/link";

import {
  useEffect,
  useState,
} from "react";

import { usePathname } from "next/navigation";

import { signOutPortal } from "@/app/portal-actions";

import type { ReservationStaffRole } from "@/lib/auth/require-reservation-staff";

export type PortalSection = "admin" | "staff";

type PortalHeaderProps = {
  section: PortalSection;
  title?: string;
  staffRole?: ReservationStaffRole | null;
  userEmail?: string | null;
};

type NavigationLink = {
  label: string;
  href: string;
};

export default function PortalHeader({
  section,
  title,
  staffRole = null,
  userEmail = null,
}: PortalHeaderProps) {
  const pathname = usePathname();

  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Navigation permissions must come exclusively from
  // the verified role supplied by the server layout.
  // The URL section does not establish authorization.
  const isManager = staffRole === "manager";

  const isReservationAgent =
    staffRole === "reservation_agent";

  const dashboardHref = isManager
    ? "/admin"
    : "/staff";

  const navigation: NavigationLink[] = [
    {
      label: "HOME",
      href: "/",
    },
  ];

  if (isManager || isReservationAgent) {
    navigation.push(
      {
        label: "DASHBOARD",
        href: dashboardHref,
      },
      {
        label: "RESERVATIONS",
        href: "/staff/reservations",
      },
    );
  }

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }

    if (href === dashboardHref) {
      return pathname === href ||
        pathname === `${href}/`;
    }

    return pathname === href ||
      pathname.startsWith(`${href}/`);
  };

  const handleNavigation = () => {
    setMenuOpen(false);
  };

  const linkClass =
    "text-sm font-bold tracking-wide text-white " +
    "transition-colors duration-200 " +
    "hover:text-white/75 " +
    "focus-visible:outline-2 " +
    "focus-visible:outline-offset-4 " +
    "focus-visible:outline-white";

  const destination =
    section === "admin" ? "admin" : "staff";

  return (
    <header
      className={[
        "sticky top-0 z-50 w-full",
        "border-b border-white/10",
        "bg-[rgb(234_27_36_/_40%)]",
        "text-white backdrop-blur-md",
        "md:sticky md:top-0",
      ].join(" ")}
    >
      <div
        className={[
          "mx-auto flex min-h-16 w-full max-w-7xl",
          "items-center justify-between",
          "gap-4 px-4 py-3 sm:px-6 lg:px-8",
        ].join(" ")}
      >
        <Link
          href="/"
          aria-label="Fin & Feathers Home"
          onClick={handleNavigation}
          className="flex min-w-0 shrink-0 items-center"
        >
          <Image
            src="/img/fin-feathers-lv-logo-01-400.png"
            alt="Fin & Feathers Las Vegas"
            width={400}
            height={140}
            sizes="(min-width: 1280px) 180px, 140px"
            className={[
              "h-auto w-[140px] max-w-full",
              "object-contain xl:w-[180px]",
            ].join(" ")}
          />
        </Link>

        {/* Desktop horizontal navigation */}
        <nav
          aria-label="Portal navigation"
          className={[
            "hidden min-w-0 flex-1",
            "items-center justify-center",
            "gap-4 md:flex xl:gap-7",
          ].join(" ")}
        >
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={
                isActive(item.href) ? "page" : undefined
              }
              className={[
                linkClass,
                "whitespace-nowrap",
                isActive(item.href)
                  ? "underline decoration-white/70 underline-offset-8"
                  : "",
              ].join(" ")}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Desktop account controls */}
        <div
          className={[
            "hidden min-w-0 shrink-0",
            "items-center justify-end",
            "gap-3 md:flex xl:gap-5",
          ].join(" ")}
        >
          {userEmail ? (
            <span
              title={userEmail}
              className={[
                "max-w-[145px] truncate",
                "text-xs text-white/85",
                "xl:max-w-[230px]",
              ].join(" ")}
            >
              {userEmail}
            </span>
          ) : null}

          <form action={signOutPortal}>
            <input
              type="hidden"
              name="destination"
              value={destination}
            />

            <button
              type="submit"
              className={[
                linkClass,
                "shrink-0 whitespace-nowrap",
                "normal-case",
              ].join(" ")}
            >
              Log out
            </button>
          </form>
        </div>

        {/* Mobile navigation toggle */}
        <button
          type="button"
          aria-label={
            menuOpen
              ? "Close portal navigation"
              : "Open portal navigation"
          }
          aria-expanded={menuOpen}
          aria-controls="portal-mobile-navigation"
          onClick={() => {
            setMenuOpen((open) => !open);
          }}
          className={[
            "flex h-10 w-10 shrink-0",
            "items-center justify-center",
            "rounded-md border border-white/30",
            "text-white transition",
            "hover:bg-white/10",
            "focus-visible:outline-2",
            "focus-visible:outline-offset-2",
            "focus-visible:outline-white",
            "md:hidden",
          ].join(" ")}
        >
          {menuOpen ? (
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              className="h-6 w-6"
            >
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          ) : (
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              className="h-6 w-6"
            >
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile navigation */}
      {menuOpen ? (
        <nav
          id="portal-mobile-navigation"
          aria-label="Mobile portal navigation"
          className={[
            "border-t border-white/10",
            "bg-[rgb(49_9_11_/_95%)]",
            "px-4 py-3 backdrop-blur-md",
            "md:hidden",
          ].join(" ")}
        >
          <div className="mx-auto flex w-full max-w-7xl flex-col">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={handleNavigation}
                aria-current={
                  isActive(item.href) ? "page" : undefined
                }
                className={[
                  "border-b border-white/10",
                  "px-2 py-4 text-sm font-bold",
                  "tracking-wide text-white",
                  "transition-colors",
                  "hover:bg-white/10",
                ].join(" ")}
              >
                {item.label}
              </Link>
            ))}

            {userEmail ? (
              <p
                className={[
                  "break-all px-2 py-4",
                  "text-xs text-white/75",
                ].join(" ")}
              >
                {userEmail}
              </p>
            ) : null}

            <form action={signOutPortal}>
              <input
                type="hidden"
                name="destination"
                value={destination}
              />

              <button
                type="submit"
                className={[
                  "w-full px-2 py-4 text-left",
                  "text-sm font-bold text-white",
                  "transition-colors",
                  "hover:bg-white/10",
                ].join(" ")}
              >
                Log out
              </button>
            </form>
          </div>
        </nav>
      ) : null}

      <span className="sr-only">
        {title ??
          (section === "admin"
            ? "Admin Dashboard"
            : "Staff Portal")}
      </span>
    </header>
  );
}