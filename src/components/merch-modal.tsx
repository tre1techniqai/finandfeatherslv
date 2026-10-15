"use client";

const MERCH_URL = "https://finandfeathers.live/merch";

export default function MerchModal() {
  return (
    <section className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold uppercase tracking-wide text-white sm:text-3xl">
          Fin &amp; Feathers Merch
        </h2>
        <p className="mt-2 text-sm text-white/70">
          Official Fin & Feathers merchandise. Fresh drops and limited-edition favorites.
        </p>
      </div>

      <a
        href={MERCH_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Open the Fin & Feathers merchandise shop in a new tab"
        className="group mx-auto block w-full max-w-[500px] overflow-hidden rounded-xl border border-white/15 bg-black/60 text-center shadow-xl transition hover:-translate-y-1 hover:border-[#ea1b24] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ea1b24]"
      >
        <img
          src="/img/fin-feathers-merch-thumb.jpg"
          alt="Shop Fin & Feathers merchandise"
          className="h-auto w-full object-contain transition duration-300 group-hover:scale-[1.02]"
        />

        <span className="block bg-[#ea1b24]/90 px-4 py-3 font-semibold uppercase tracking-wide text-white transition group-hover:bg-[#ea1b24]">
          Shop Merch
        </span>
      </a>
    </section>
  );
}