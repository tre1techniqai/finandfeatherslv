
import Image from "next/image";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import RibeyeVideo from "@/components/ribeye-video";
import VirtualTourModal from "@/components/virtual-tour-modal";
import ImageGallery from "@/components/image-gallery";
import SocialLinks from "@/components/social-links";
import MerchModal from "@/components/merch-modal";
import ReservationModal from "@/components/reservation-modal";
import ReservationTrigger from "@/components/reservation-trigger";
import MenuModal, { MenuTrigger } from "@/components/menu-modal";
import LoyaltyProgram from "@/components/loyalty-program";
import CareersContactEvents from "@/components/careers-contact-events";

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
    href: "https://www.google.com/maps/place/Fin+%26+Feathers+Restaurants/@36.156238,-115.1522077,17z/data=!3m1!4b1!4m6!3m5!1s0x80c8c3c535db0607:0xeec4559c4d00dbbe!8m2!3d36.156238!4d-115.1522077!16s%2Fg%2F11vm377z6q?entry=ttu&g_ep=EgoyMDI2MTAwNy4wIKXMDSoASAFQAw%3D%3D",
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
        <section className="mx-auto w-full max-w-[1500px] px-0 py-6 sm:px-6">
          <div className="grid grid-cols-1 items-center gap-8 xl:grid-cols-[minmax(0,896px)_minmax(0,500px)] xl:justify-between xl:gap-10">
            {/* Main content column */}
            <div className="mx-auto w-full min-w-0 max-w-4xl">
              {/* Mobile logo */}
              <Image
                src="/img/fin-feathers-lv-logo-500.png"
                alt="Fin & Feathers Las Vegas"
                width={500}
                height={273}
                priority
                sizes="100vw"
                className="mb-6 block h-auto w-full object-contain md:hidden"
              />

              {/* Desktop logo */}
              <Image
                src="/img/fin-feathers-lv-logo-1000.png"
                alt="Fin & Feathers Las Vegas"
                width={1000}
                height={546}
                priority
                sizes="(min-width: 1280px) 896px, (min-width: 768px) calc(100vw - 48px), 100vw"
                className="mb-6 hidden h-auto w-full object-contain md:block"
              />

              <div className="px-4 sm:px-0">
                <h1 className="max-w-4xl text-center text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
                  ELEVATED DINING MEETS SOUTHERN SOUL
                </h1>

                <p className="mt-3 max-w-4xl text-center text-lg leading-8 text-white/85 sm:text-2xl">
                  Every dish crafted with fresh ingredients and genuine
                  hospitality.
                </p>

                {/* Two columns on mobile, four on desktop */}
                <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
                  {homeButtons.map((button) => {
                    if (button.label === "FULL MENU") {
                      return (
                        <MenuTrigger
                          key={button.label}
                          className={buttonClassName}
                        >
                          {button.label}
                        </MenuTrigger>
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

              </div>

              {/* Mobile virtual tour and ribeye video */}
              <div className="mt-12 px-[10px] xl:hidden">
                <h2 className="mb-3 text-center text-xl font-bold tracking-[0.12em] text-white sm:text-2xl">
                  TAKE A VIRTUAL TOUR
                </h2>

                <div className="flex w-full justify-center">
                  <VirtualTourModal />
                </div>

                <div className="mt-12 w-full">
                  <RibeyeVideo />
                </div>
              </div>
            </div>

            {/* Desktop virtual tour and ribeye video */}
            <div className="hidden w-full flex-col items-center justify-center justify-self-center xl:flex">
              <h2 className="mb-3 w-full text-center text-xl font-bold tracking-[0.12em] text-white sm:text-xl">
                TAKE A VIRTUAL TOUR
              </h2>

              <VirtualTourModal />

              <div className="mt-12 w-full">
                <RibeyeVideo />
              </div>
            </div>
          </div>
        </section>

        {/* Existing sections retained */}
        <section
          id="image-gallery"
          className="mx-auto mt-8 w-full max-w-[1500px] border-t border-white/15 bg-transparent px-0 py-6 sm:px-6"
        >
          <ImageGallery />
        </section>

        <section
          id="follow-us"
          className="mt-8 border-t border-white/15 bg-transparent"
        >
          <SocialLinks />
        </section>

        <section
          id="merch"
          className="mt-8 border-t border-white/15 bg-transparent"
        >
          <MerchModal />
          <LoyaltyProgram />
          <CareersContactEvents />
        </section>
      </main>

      <SiteFooter />

      {/* Shared modals opened by homepage and header links */}
      <MenuModal />
      <ReservationModal />
    </div>
  );
}
