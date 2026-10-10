
import Link from "next/link";

export default function SiteHeader() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-5">
        <Link
          href="/"
          className="text-xl font-semibold tracking-tight text-slate-900"
        >
          Fin & Feathers
        </Link>

        <nav
          aria-label="Main navigation"
          className="flex items-center gap-6 text-sm text-slate-600"
        >
          <Link href="/#about" className="hover:text-slate-950">
            About
          </Link>
          <Link href="/#contact" className="hover:text-slate-950">
            Contact
          </Link>
        </nav>
      </div>
    </header>
  );
}
