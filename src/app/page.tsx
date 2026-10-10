
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-white text-slate-900">
      <SiteHeader />

      <main className="flex-1">
        <section className="mx-auto max-w-7xl px-6 py-24 sm:py-32">
          <p className="mb-4 text-sm font-medium uppercase tracking-[0.25em] text-slate-500">
            Las Vegas, Nevada
          </p>

          <h1 className="max-w-4xl text-4xl font-semibold tracking-tight sm:text-6xl">
            Welcome to Fin & Feathers.
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            Discover our story, explore what we offer, and stay connected
            with Fin & Feathers Las Vegas.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <a
              href="#about"
              className="rounded-md bg-slate-900 px-5 py-3 text-sm font-medium text-white hover:bg-slate-700"
            >
              Discover More
            </a>

            <a
              href="#contact"
              className="rounded-md border border-slate-300 px-5 py-3 text-sm font-medium hover:bg-slate-50"
            >
              Get in Touch
            </a>
          </div>
        </section>

        <section
          id="about"
          className="border-t border-slate-200 bg-slate-50"
        >
          <div className="mx-auto max-w-7xl px-6 py-20">
            <h2 className="text-2xl font-semibold tracking-tight">
              About Fin & Feathers
            </h2>
            <p className="mt-4 max-w-2xl leading-7 text-slate-600">
              Add your brand story, services, and key information here.
            </p>
          </div>
        </section>

        <section id="contact" className="mx-auto max-w-7xl px-6 py-20">
          <h2 className="text-2xl font-semibold tracking-tight">
            Contact
          </h2>
          <p className="mt-4 max-w-2xl leading-7 text-slate-600">
            Add your preferred contact details and calls to action here.
          </p>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
