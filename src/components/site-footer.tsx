"use client";

import Image from "next/image";

const ORDER_ONLINE_URL = "https://toast.app/r/fin-feathers-las-vegas-1229-s-casino-center-blvd/order?utm_medium=redirect";

function FooterIcon({
  type,
  size = 20,
}: {
  type: "loyalty" | "phone" | "email" | "location";
  size?: number;
}) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true as const,
  };

  switch (type) {
    case "loyalty":
      return (
        <svg {...common}>
          <path d="M12 21s-8-4.5-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 6.5-8 11-8 11Z" />
          <path d="M8 12h8M12 8v8" />
        </svg>
      );

    case "phone":
      return (
        <svg {...common}>
          <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.4 19.4 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.9a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.2-1.3a2 2 0 0 1 2.1-.5c.9.3 1.9.6 2.9.7a2 2 0 0 1 1.8 2.1Z" />
        </svg>
      );

    case "email":
      return (
        <svg {...common}>
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="m3 7 9 6 9-6" />
        </svg>
      );

    case "location":
      return (
        <svg {...common}>
          <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" />
          <circle cx="12" cy="10" r="2.5" />
        </svg>
      );
  }
}

export default function SiteFooter() {
  const currentYear = 2026;

  const linkClass =
    "text-sm text-white/65 transition-colors hover:text-white";

  function openModal(event: React.MouseEvent<HTMLAnchorElement>, name: string) {
    event.preventDefault();
    window.dispatchEvent(new CustomEvent(name));
  }

  return (
    <footer className="border-t border-white/15 bg-black/80 text-white">
      <div className="mx-auto max-w-7xl px-6 py-12 sm:px-8 sm:py-14">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {/* Brand and Loyalty */}
          <div className="lg:col-span-2">
            <a
              href="#loyalty-program"
              className="group inline-flex items-center gap-3"
            >

              <div className="flex items-center gap-2">
                  <Image
                    src="/img/fin-feathers-icon-alpha.png"
                    alt=""
                    aria-hidden="true"
                    width={36}
                    height={36}
                    className="h-9 w-9 shrink-0 object-contain"
                  />

                  <span className="text-lg font-bold tracking-wide">
                    FIN &amp; FEATHERS
                  </span>
              </div>
            </a>

            <p className="mt-5 max-w-md text-sm leading-6 text-white/65">
              Join the F&amp;F Fam Club for exclusive offers, dining specials, insider announcements, and invitations to special events. Get the inside scoop on what&apos;s happening at Fin &amp; Feathers—and never miss a reason to come through.
            </p>

            <a
              href="#loyalty-program"
              className="mt-5 inline-flex items-center gap-2 rounded-lg border border-white/25 px-4 py-3 text-sm font-bold text-white transition-colors hover:border-[#ea1b24] hover:bg-[#ea1b24]"
            >
              <FooterIcon type="loyalty" size={18} />
              JOIN OUR F&F FAM CLUB
            </a>
          </div>

          {/* Quick Links */}
          <div>
            <h2 className="text-sm font-bold tracking-[0.16em] text-white">
              QUICK LINKS
            </h2>

            <nav aria-label="Footer quick links" className="mt-5">
              <ul className="space-y-3">
                <li>
                  <a
                    href="#full-menu"
                    onClick={(event) =>
                      openModal(event, "fin-feathers:open-menu-modal")
                    }
                    className={linkClass}
                  >
                    Full Menu
                  </a>
                </li>

                <li>
                  <a href="/reservations" className={linkClass}>
                    Reservations
                  </a>
                </li>

                <li>
                  <a
                    href={ORDER_ONLINE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={linkClass}
                  >
                    Order Online
                  </a>
                </li>

                <li>
                  <a
                    href="#careers-contact-events"
                    className={linkClass}
                  >
                    Events &amp; Experiences
                  </a>
                </li>

                <li>
                  <a
                    href="#careers-contact-events"
                    className={linkClass}
                  >
                    Careers
                  </a>
                </li>
              </ul>
            </nav>
          </div>

          {/* Contact and Legal */}
          <div>
            <h2 className="text-sm font-bold tracking-[0.16em] text-white">
              CONTACT &amp; INFO
            </h2>

            <div className="mt-5 space-y-4">
              <a
                href="tel:+17252049655"
                className={`flex items-start gap-3 ${linkClass}`}
              >
                <FooterIcon type="phone" />
                <span>(725) 204-9655</span>
              </a>

              <a
                href="mailto:lasvegs@finandfeathersrestaurants.com"
                className={`flex items-start gap-3 break-all ${linkClass}`}
              >
                <FooterIcon type="email" />
                <span>lasvegs@finandfeathersrestaurants.com</span>
              </a>

              <a
                href="https://www.google.com/maps/search/?api=1&query=1229+S+Casino+Center+Blvd%2C+Las+Vegas%2C+NV+89104"
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-start gap-3 leading-5 ${linkClass}`}
              >
                <FooterIcon type="location" />
                <span>
                  1229 S Casino Center Blvd
                  <br />
                  Las Vegas, NV 89104
                </span>
              </a>
            </div>

            <div className="mt-6 border-t border-white/15 pt-5">
              <h3 className="text-xs font-bold tracking-[0.14em] text-white/80">
                LEGAL
              </h3>

              <nav aria-label="Legal links" className="mt-3">
                <ul className="space-y-3">
                  <li>
                    <a href="/privacy-policy" className={linkClass}>
                      Privacy Policy
                    </a>
                  </li>
                  <li>
                    <a href="/terms-of-service" className={linkClass}>
                      Terms &amp; Conditions
                    </a>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-10 border-t border-white/15 pt-6 text-center sm:mt-12 sm:flex sm:items-center sm:justify-between sm:gap-4 sm:text-left">
          <p className="text-xs leading-5 text-white/50">
            © {currentYear ?? "2026"} Fin &amp; Feathers. All rights reserved.
          </p>

          <p className="mt-2 text-xs text-white/50 sm:mt-0">
            Las Vegas, Nevada
          </p>
        </div>
      </div>
    </footer>
  );
}
