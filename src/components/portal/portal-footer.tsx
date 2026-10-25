
import Link from "next/link";

export default function PortalFooter() {
  const links = [
    { label: "Home", href: "/" },
    { label: "Admin Dashboard", href: "/admin" },
    { label: "Reservations", href: "/staff/reservations" },
  ];

  return (
    <footer className="mt-auto w-full border-t border-white/10 bg-black text-white">
      <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-4 px-4 py-6 text-center sm:flex-row sm:px-6 sm:text-left">
        <div>
          <p className="text-sm font-semibold text-white/85">
            Fin &amp; Feathers Las Vegas
          </p>

          <p className="mt-1 text-xs text-white/45">
            Staff Management Portal
          </p>
        </div>

        <nav
          aria-label="Portal footer navigation"
          className="flex flex-wrap items-center justify-center gap-x-5 gap-y-3"
        >
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-xs font-medium text-white/60 underline-offset-4 transition hover:text-white hover:underline focus-visible:outline-2 focus-visible:outline-[#ea1b24]"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
