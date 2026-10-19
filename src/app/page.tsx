import Image from "next/image";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import RibeyeVideo from "@/components/ribeye-video";
import VirtualTourModal from "@/components/virtual-tour-modal";
import GalleryData from "@/components/gallery-data";
import SocialLinks from "@/components/social-links";
import MerchModal from "@/components/merch-modal";
import ReservationTrigger from "@/components/reservation-trigger";
import LoyaltyProgram from "@/components/loyalty-program";
import CareersContactEvents from "@/components/careers-contact-events";
import ScrollReveal from "@/components/scroll-reveal";
import TodaySpecials from "@/components/todays-specials";

const homeButtons = [
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

const buttonClassName =
  "flex min-h-[64px] w-full items-center justify-center rounded-xl border border-white/30 bg-[rgb(234_27_36_/_60%)] px-3 py-4 text-center text-sm font-bold tracking-wide text-white transition-colors duration-200 hover:bg-[#ea1b24] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:text-base";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-transparent text-white">
      <SiteHeader />

      <main className="flex-1">
        {/* Main two-column homepage layout */}
        <section className="mx-auto w-full max-w-[1500px] px-0 py-6 sm:px-6">
          <div className="grid grid-cols-1 items-start gap-8 xl:grid-cols-[minmax(0,896px)_minmax(0,500px)] xl:justify-between xl:gap-10">
            {/* Left column: logo, links, and hours */}
            <div className="mx-auto w-full min-w-0 max-w-4xl">
              {/* Mobile logo */}
              <Image
                src="/img/fin-feathers-lv-logo-1000.png"
                alt="Fin & Feathers Las Vegas"
                width={500}
                height={174}
                priority
                sizes="100vw"
                className="neon-flicker mb-6 block h-auto w-full object-contain md:hidden"
              />

              {/* Desktop logo */}
              <Image
                src="/img/fin-feathers-lv-logo-1000.png"
                alt="Fin & Feathers Las Vegas"
                width={1000}
                height={348}
                priority
                sizes="(min-width: 1280px) 896px, (min-width: 768px) calc(100vw - 48px), 100vw"
                className="neon-flicker mb-6 hidden h-auto w-full object-contain md:block"
              />

              <div className="px-4 sm:px-0">
                <h1 className="slogan-fade-in max-w-4xl text-center text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
                  ELEVATED DINING MEETS SOUTHERN SOUL
                </h1>

                <p className="slogan-reveal mt-3 max-w-4xl text-center text-lg leading-8 text-slate-400 sm:text-2xl">
                  Every dish crafted with fresh ingredients and genuine
                  hospitality.
                </p>

                {/* Two columns on mobile, four on desktop */}
                <div className="homepage-buttons-reveal mt-8 grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
                  {homeButtons.map((button) => {
                    if (button.label === "FULL MENU") {
                      return (
                        <a
                          key={button.label}
                          href="/menu"
                          className={buttonClassName}
                        >
                          FULL MENU
                        </a>
                      );
                    }

                    if (button.label === "RESERVATIONS") {
                      return (
                        <ReservationTrigger
                          key={button.label}
                          className={buttonClassName}
                        >
                          {button.label}
                        </ReservationTrigger>
                      );
                    }

                    return (
                      <a
                        key={button.label}
                        href={button.href}
                        target={button.external ? "_blank" : undefined}
                        rel={button.external ? "noopener noreferrer" : undefined}
                        className={buttonClassName}
                      >
                        {button.label}
                      </a>
                    );
                  })}
                </div>

                {/* Hours of Operation */}
                <ScrollReveal className="mt-6 w-full min-w-0 px-3">
                  <section
                    aria-label="Hours of operation"
                    className="mx-auto flex w-full min-w-0 flex-col items-center justify-center text-center"
                  >
                    <h2 className="flex items-center justify-center gap-2 text-lg font-semibold text-white">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={1.8}
                        className="h-5 w-5 shrink-0 text-yellow-400"
                        aria-hidden="true"
                      >
                        <circle cx="12" cy="12" r="9" />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 7v5l3 2"
                        />
                      </svg>
                      HOURS OF OPERATION
                    </h2>

                    <div className="mt-2 grid w-full max-w-md grid-cols-2 gap-x-3 gap-y-1 text-sm leading-relaxed text-slate-400 sm:flex sm:max-w-none sm:flex-wrap sm:justify-center sm:gap-x-4">
                      <span>Mon - Thu: 11am - 12am</span>
                      <span>Fri: 11am - 2am</span>
                      <span>Sat: 10am - 2am</span>
                      <span>Sun: 10am - 12am</span>
                    </div>
                  </section>
                </ScrollReveal>
              </div>
            </div>

            {/* Right column: Today's Special, then Ribeye video */}
            <div className="mx-auto w-full min-w-0 max-w-4xl xl:max-w-none">
              <ScrollReveal className="w-full px-[10px] xl:mt-[150px] xl:px-0">
                <TodaySpecials />
              </ScrollReveal>

              <ScrollReveal className="mt-8 w-full px-[10px] xl:mt-[50px] xl:px-0">
                <RibeyeVideo />
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* Virtual Tour and Gallery: side by side on desktop */}
        <section className="mx-auto mt-4 flex w-full max-w-[1500px] flex-col gap-8 border-t border-white/15 bg-transparent px-4 py-8 sm:px-6">
          {/* Image Gallery */}
          <div id="image-gallery" className="w-full min-w-0">
            <ScrollReveal>
              <GalleryData />
            </ScrollReveal>
          </div>

          {/* Virtual Tour */}
          <div id="virtual-tour" className="w-full min-w-0">
            <ScrollReveal>
              <h2 className="mb-5 text-center text-xl font-bold tracking-[0.12em] text-white sm:text-2xl">
                TAKE A VIRTUAL TOUR
              </h2>
              <div className="flex w-full justify-center">
                <VirtualTourModal />
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Social links */}
        <section
          id="follow-us"
          className="mt-8 border-t border-white/15 bg-transparent"
        >
          <ScrollReveal>
            <SocialLinks />
          </ScrollReveal>
        </section>

        {/* Merchandise, loyalty, careers, contact, and events */}
        <section
          id="merch"
          className="mt-8 border-t border-white/15 bg-transparent"
        >
          <ScrollReveal>
            <MerchModal />
          </ScrollReveal>

          <ScrollReveal>
            <LoyaltyProgram />
          </ScrollReveal>

          <ScrollReveal>
            <CareersContactEvents />
          </ScrollReveal>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}