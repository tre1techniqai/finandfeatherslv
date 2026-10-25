
import Image from "next/image";
import Link from "next/link";
import { signOutPortal } from "@/app/portal-actions";

export type PortalSection = "admin" | "staff";

type PortalHeaderProps = {
  section: PortalSection;
  title?: string;
};

const navigation = [
  { label: "Home", href: "/" },
  { label: "Admin Dashboard", href: "/admin" },
  { label: "Reservations", href: "/staff/reservations" },
  { label: "Menu Management", href: "/admin/menu" },
  { label: "Gallery Management", href: "/admin/gallery" },
  { label: "SPECIALS Management", href: "/admin/specials" },
];

export default function PortalHeader({
  section,
  title,
}: PortalHeaderProps) {
  const heading =
    title ??
    (section === "admin"
      ? "Admin Dashboard"
      : "Reservations");

  return (
    <header className="relative z-40 w-full border-b border-white/10 bg-[#ea1b24]/40 text-white">
      <div className="mx-auto grid min-h-20 w-full max-w-7xl grid-cols-[48px_minmax(0,1fr)_48px] items-center gap-3 px-3 py-3 sm:px-6">
        <Link
          href="/"
          aria-label="Fin & Feathers Home"
          className="flex h-12 w-12 items-center justify-center rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          <Image
            src="/img/fin-feathers-icon-blk-alpha.png"
            alt="Fin & Feathers"
            width={44}
            height={44}
            className="h-11 w-11 object-contain"
          />
        </Link>

        <div className="min-w-0 text-center">
          <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-white/75 sm:text-[10px]">
            Fin &amp; Feathers Las Vegas
          </p>

          <p className="mt-1 truncate text-lg font-bold tracking-tight text-white sm:text-2xl">
            {heading}
          </p>
        </div>

        <details className="group relative">
          <summary
            aria-label="Open portal navigation"
            className="flex h-12 w-12 cursor-pointer list-none items-center justify-center rounded-lg border border-white/20 bg-black/10 text-white transition hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white [&::-webkit-details-marker]:hidden"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              className="h-6 w-6"
            >
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </summary>

          <nav
            aria-label="Portal navigation"
            className="absolute right-0 top-14 z-50 w-64 overflow-hidden rounded-xl border border-white/20 bg-[#31090b]/95 p-2 shadow-2xl backdrop-blur-xl"
          >
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex min-h-11 items-center rounded-lg px-3 text-sm font-medium text-white/85 transition hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-[#ea1b24]"
              >
                {item.label}
              </Link>
            ))}

            <div className="my-2 border-t border-white/15" />

            <form action={signOutPortal}>
              <input
                type="hidden"
                name="destination"
                value={section}
              />

              <button
                type="submit"
                className="flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-left text-sm font-bold text-red-200 transition hover:bg-[#ea1b24]/25 hover:text-white focus-visible:outline-2 focus-visible:outline-white"
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                >
                  <path d="M10 17l5-5-5-5M15 12H3" />
                  <path d="M12 3h6a3 3 0 013 3v12a3 3 0 01-3 3h-6" />
                </svg>

                Sign Out
              </button>
            </form>
          </nav>
        </details>
      </div>
    </header>
  );
}
