
"use client";

import {
  Suspense,
  type ReactNode,
} from "react";

import { usePathname } from "next/navigation";

import PortalShell from "@/components/portal/portal-shell";

import type { PortalSection } from "@/components/portal/portal-header";

type Props = {
  section: PortalSection;
  children: ReactNode;
};

const PUBLIC_AUTH_SEGMENTS = new Set([
  "login",
  "forgot-password",
  "reset-password",
  "accept-invite",
]);

function isAuthRoute(
  pathname: string,
  section: PortalSection,
): boolean {
  const prefix = `/${section}/`;

  if (!pathname.startsWith(prefix)) {
    return false;
  }

  const firstSegment = pathname
    .slice(prefix.length)
    .split("/")[0];

  return PUBLIC_AUTH_SEGMENTS.has(firstSegment);
}

function getPageTitle(pathname: string): string {
  if (
    pathname === "/admin" ||
    pathname === "/admin/"
  ) {
    return "Admin Dashboard";
  }

  if (pathname.startsWith("/admin/menu")) {
    return "Menu Management";
  }

  if (pathname.startsWith("/admin/specials")) {
    return "SPECIALS Management";
  }

  if (pathname.startsWith("/admin/gallery")) {
    return "Gallery Management";
  }

  if (pathname.startsWith("/admin/reservations")) {
    return "Reservations Management";
  }

  if (
    /^\/staff\/conversations\/guest\/[^/]+\/?$/.test(
      pathname,
    )
  ) {
    return "Guest Conversation";
  }

  if (pathname.startsWith("/staff/conversations")) {
    return "Conversations";
  }

  if (
    /^\/staff\/reservations\/[^/]+\/?$/.test(
      pathname,
    )
  ) {
    return "Reservation Details";
  }

  if (pathname.startsWith("/staff/reservations")) {
    return "Reservations";
  }

  return "Staff Management Portal";
}

function PortalRouteContent({
  section,
  children,
}: Props) {
  const pathname = usePathname();

  if (isAuthRoute(pathname, section)) {
    return <>{children}</>;
  }

  return (
    <PortalShell
      section={section}
      title={getPageTitle(pathname)}
    >
      {children}
    </PortalShell>
  );
}

export default function PortalRouteLayout({
  section,
  children,
}: Props) {
  return (
    <Suspense fallback={<>{children}</>}>
      <PortalRouteContent section={section}>
        {children}
      </PortalRouteContent>
    </Suspense>
  );
}
