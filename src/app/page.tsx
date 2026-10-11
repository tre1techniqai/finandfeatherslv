
import Image from "next/image";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import RibeyeVideo from "@/components/ribeye-video";

const homeButtons = [
  { label: "FULL MENU", href: "#full-menu" },
  { label: "RESERVATIONS", href: "#reservations" },
  { label: "ORDER ONLINE", href: "#order-online" },
  { label: "DIRECTIONS", href: "#directions" },
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
              {/* Mobile logo: full available screen width */}
              <Image
                src="/img/fin-feathers-lv-logo-500.png"
                alt="Fin & Feathers Las Vegas"
                width={500}
                height={273}
                priority
                sizes="100vw"
                className="mb-6 block h-auto w-full object-contain md:hidden"
              />

              {/* Desktop logo: fills the max-w-4xl content column */}
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
                <h1 className="max-w-4xl text-3xl text-center font-bold leading-tight tracking-tight sm:text-4xl">
                  ELEVATED DINING MEETS SOUTHERN SOUL
                </h1>

                <p className="mt-3 max-w-4xl text-lg text-center leading-8 text-white/85 sm:text-2xl">
                  Every dish crafted with fresh ingredients and genuine
                  hospitality.
                </p>

                {/* Four equal-width buttons: 2 columns on mobile, 4 on desktop */}
                <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
                  {homeButtons.map((button) => (
                    <a
                      key={button.label}
                      href={button.href}
                      className={buttonClassName}
                    >
                      {button.label}
                    </a>
                  ))}
                </div>
              </div>

              
              {/* Mobile virtual tour: centered image, max width 300px */}
              <div className="mt-12 px-[10px] xl:hidden">
                <h2 className="mb-3 text-center text-xl font-bold tracking-[0.12em] text-white sm:text-2xl">
                  TAKE A VIRTUAL TOUR
                </h2>

                <a
                  href="https://www.360mall.shop/FIN_and_Feathers/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Explore the Fin & Feathers virtual tour (opens in a new tab)"
                  className="flex w-full justify-center transition-opacity hover:opacity-90"
                >
                  <Image
                    src="/img/fin-feathers-virtual-tour-v2.png"
                    alt="Explore the Fin & Feathers virtual tour"
                    width={295}
                    height={270}
                    sizes="(max-width: 320px) calc(100vw - 20px), 300px"
                    className="h-auto w-full max-w-[300px] object-contain"
                    loading="eager"
                  />
                </a>

                <div className="mt-12 w-full">
                  <RibeyeVideo />
                </div>
              </div>

            </div>

            
            {/* Desktop virtual tour: heading above centered image */}
            <div className="hidden w-full flex-col items-center justify-center justify-self-center xl:flex">
              <h2 className="mb-3 w-full text-center text-xl font-bold tracking-[0.12em] text-white sm:text-xl">
                TAKE A VIRTUAL TOUR
              </h2>

              <a
                href="https://www.360mall.shop/FIN_and_Feathers/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Explore the Fin & Feathers virtual tour (opens in a new tab)"
                className="flex w-full justify-center transition-opacity hover:opacity-90"
              >
                <Image
                  src="/img/fin-feathers-virtual-tour-v2.png"
                  alt="Explore the Fin & Feathers virtual tour"
                  width={295}
                  height={270}
                  sizes="300px"
                  className="h-auto w-full max-w-[300px] object-contain"
                  loading="eager"
                />
              </a>
              <div className="mt-12 w-full">
                  <RibeyeVideo />
              </div>
            </div>
          </div>
        </section>

        {/* Existing sections retained for future content */}
        <section
          id="about"
          className="mt-8 border-t border-white/15 bg-transparent"
        >
          <div className="mx-auto w-full max-w-[1500px] px-0 py-6 sm:px-6">
            <h2 className="text-2xl font-semibold tracking-tight">
              About Fin & Feathers
            </h2>
            <p className="mt-4 max-w-2xl leading-7 text-white/75">
              Add your brand story, services, and key information here.
            </p>
          </div>
        </section>

        <section
          id="contact"
          className="mx-auto w-full max-w-[1500px] px-0 py-6 sm:px-6 mt-8 border-t border-white/15 bg-transparent"
        >
          <h2 className="text-2xl font-semibold tracking-tight">Contact</h2>
          <p className="mt-4 max-w-2xl leading-7 text-white/75">
            Add your preferred contact details and calls to action here.
          </p>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
