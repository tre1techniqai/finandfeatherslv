
"use client";

import { createPortal } from "react-dom";
import { useEffect, useState } from "react";

type Special = {
  day: string;
  title: string;
  offers: string[];
  start: string;
  end: string;
  thumbnail: string;
  video: string;
  description: string;
  details: string;
  finePrint: string;
  enabled: boolean;
};

const SPECIALS: Special[] = [
  {
    day: "Monday",
    title: "Margarita Monday",
    offers: ["$5 Margaritas"],
    start: "11:00 AM",
    end: "12:00 AM",
    thumbnail: "https://ikxruiemlczfritxrjqr.supabase.co/storage/v1/object/public/website-media/specials/margarita-monday-thumb.jpg",
    video: "https://ikxruiemlczfritxrjqr.supabase.co/storage/v1/object/public/website-media/specials/Special_Mon.mp4",
    description: "",
    details: "",
    finePrint: "",
    enabled: true,
  },
  {
    day: "Tuesday",
    title: "Tito's Margaritas & Tacos",
    offers: ["$5 Tito's Margaritas", "$5 for 2 Tacos"],
    start: "11:00 AM",
    end: "12:00 AM",
    thumbnail: "https://ikxruiemlczfritxrjqr.supabase.co/storage/v1/object/public/website-media/specials/tito-tuesday-thumb.jpg",
    video: "https://ikxruiemlczfritxrjqr.supabase.co/storage/v1/object/public/website-media/specials/Special_Tue.mp4",
    description: "",
    details: "",
    finePrint: "",
    enabled: true,
  },
  {
    day: "Wednesday",
    title: "Wine Down (or Whiskey Up)",
    offers: [
      "$5 Select Wine Glasses",
      "$10 Select Bottles",
      "$6 Select Whiskey Shots",
    ],
    start: "11:00 AM",
    end: "12:00 AM",
    thumbnail: "https://ikxruiemlczfritxrjqr.supabase.co/storage/v1/object/public/website-media/specials/wine-down-wednesday-thumb.jpg",
    video: "https://ikxruiemlczfritxrjqr.supabase.co/storage/v1/object/public/website-media/specials/Special_Wed.mp4",
    description: "Midweek wine and whiskey specials.",
    details: "Enjoy $5 select wine glasses, $10 select bottles, or $6 select whiskey shots.",
    finePrint: "",
    enabled: true,
  },
  {
    day: "Thursday",
    title: "Martini Madness",
    offers: ["$5 Martinis"],
    start: "11:00 AM",
    end: "12:00 AM",
    thumbnail: "https://ikxruiemlczfritxrjqr.supabase.co/storage/v1/object/public/website-media/specials/martini-thursday-thumb.jpg",
    video: "https://ikxruiemlczfritxrjqr.supabase.co/storage/v1/object/public/website-media/specials/Special_Thu.mp4",
    description: "",
    details: "",
    finePrint: "",
    enabled: true,
  },
  {
    day: "Friday",
    title: "Premium Friday at Fins",
    offers: ["$6 Select Premium Shots"],
    start: "5:00 PM",
    end: "8:00 PM",
    thumbnail: "https://ikxruiemlczfritxrjqr.supabase.co/storage/v1/object/public/website-media/specials/premium-friday-thumb.jpg",
    video: "https://ikxruiemlczfritxrjqr.supabase.co/storage/v1/object/public/website-media/specials/Special_Fri.mp4",
    description: "",
    details: "",
    finePrint: "",
    enabled: true,
  },
  {
    day: "Saturday",
    title: "Weekend $5 Specials",
    offers: [
      "$5 Chicken Tacos",
      "$5 Margaritas",
      "$5 4pc Wings & Fries",
      "$5 Select Red & White Wine",
    ],
    start: "5:00 PM",
    end: "8:00 PM",
    thumbnail: "https://ikxruiemlczfritxrjqr.supabase.co/storage/v1/object/public/website-media/specials/5-weekend-thumb.jpg",
    video: "https://ikxruiemlczfritxrjqr.supabase.co/storage/v1/object/public/website-media/specials/Special_Sat_Sun.mp4",
    description: "Weekend food & drink specials for $5",
    details: "Select from a dozen of our weekend $5 Happy Hour food & drink specials.",
    finePrint: "",
    enabled: true,
  },
  {
    day: "Sunday",
    title: "Weekend $5 Specials",
    offers: [
      "$5 Chicken Tacos",
      "$5 Margaritas",
      "$5 4pc Wings & Fries",
      "$5 Select Red & White Wine",
    ],
    start: "6:00 PM",
    end: "12:00 AM",
    thumbnail: "https://ikxruiemlczfritxrjqr.supabase.co/storage/v1/object/public/website-media/specials/5-weekend-thumb.jpg",
    video: "https://ikxruiemlczfritxrjqr.supabase.co/storage/v1/object/public/website-media/specials/Special_Sat_Sun.mp4",
    description: "",
    details: "",
    finePrint: "",
    enabled: true,
  },
];

function getLasVegasDay() {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Los_Angeles",
    weekday: "long",
  }).format(new Date());
}

export default function TodaySpecials() {
  const [today, setToday] = useState<string | null>(null);
  const [activeDay, setActiveDay] = useState("Monday");
  const [isOpen, setIsOpen] = useState(false);
  const [portalReady, setPortalReady] = useState(false);

  useEffect(() => {
    const day = getLasVegasDay();
    setToday(day);
    setActiveDay(day);
    setPortalReady(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const oldOverflow = document.body.style.overflow;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setIsOpen(false);
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = oldOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const special = SPECIALS.find((item) => item.day === today);
  const active = SPECIALS.find((item) => item.day === activeDay);

  if (!special?.enabled || !active) return null;

  return (
    <>
      <section
        aria-label="Today's special"
        className="mx-auto mt-5 w-full max-w-4xl text-left"
      >
        <button
          type="button"
          onClick={() => {
            if (!today) return;
            setActiveDay(today);
            setIsOpen(true);
          }}
          aria-label={`Open ${special.day}'s special details`}
          className="group flex w-full min-w-0 overflow-hidden rounded-xl border border-white/15 bg-[#101010] text-left shadow-lg transition hover:border-[#ea1b24]/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ea1b24]"
        >
          <div className="w-24 shrink-0 overflow-hidden bg-black sm:w-36">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={special.thumbnail}
              alt=""
              loading="lazy"
              className="h-full min-h-28 w-full object-cover transition duration-300 group-hover:scale-105"
            />
          </div>

          <div className="flex min-w-0 flex-1 flex-col justify-center gap-2 p-3 sm:p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#ea1b24] sm:text-xs">
                Today's Special
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#d4af67] sm:text-xs">
                {special.day}
              </span>
            </div>

            <h2 className="text-base font-black leading-tight text-white sm:text-xl">
              {special.title}
            </h2>

            <div className="flex flex-wrap gap-x-3 gap-y-1">
              {special.offers.map((offer) => (
                <span
                  key={offer}
                  className="text-xs font-semibold text-white/85 sm:text-sm"
                >
                  {offer}
                </span>
              ))}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-white/50">
                {special.start} – {special.end}
              </span>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#d4af67]">
                View Special ↗
              </span>
            </div>
          </div>
        </button>
      </section>

      {isOpen &&
        portalReady &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto bg-black/90 p-3 backdrop-blur-sm sm:p-6"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) {
                setIsOpen(false);
              }
            }}
          >
            <section
              role="dialog"
              aria-modal="true"
              aria-labelledby="today-special-title"
              className="relative my-auto flex max-h-[94dvh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-white/15 bg-[#101010] shadow-2xl"
            >
              <header className="flex shrink-0 items-center justify-between gap-3 border-b border-white/10 px-4 py-3 sm:px-6">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#ea1b24]">
                    Fin &amp; Feathers Las Vegas
                  </p>
                  <h2
                    id="today-special-title"
                    className="mt-1 text-lg font-black text-white sm:text-xl"
                  >
                    Today's Specials
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  aria-label="Close specials"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-3xl text-white transition hover:bg-[#ea1b24] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  &times;
                </button>
              </header>

              <nav
                aria-label="Specials by day"
                className="flex shrink-0 gap-1 overflow-x-auto border-b border-white/10 px-3 pt-3 sm:px-5"
              >
                {SPECIALS.map((item) => (
                  <button
                    key={item.day}
                    type="button"
                    aria-pressed={activeDay === item.day}
                    onClick={() => setActiveDay(item.day)}
                    className={`shrink-0 rounded-t-lg border-b-2 px-3 py-2.5 text-xs font-extrabold uppercase tracking-wide transition sm:px-4 sm:text-sm ${
                      activeDay === item.day
                        ? "border-[#ea1b24] bg-[#ea1b24]/10 text-white"
                        : "border-transparent text-white/50 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    {item.day.slice(0, 3)}
                  </button>
                ))}
              </nav>

              <div className="min-h-0 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1.15fr)_minmax(280px,0.85fr)]">
                  <div className="flex items-center justify-center bg-black">
                    <video
                      key={active.video}
                      src={active.video}
                      poster={active.thumbnail}
                      controls
                      autoPlay
                      muted
                      playsInline
                      preload="metadata"
                      className="max-h-[42vh] w-full bg-black object-contain md:max-h-[65vh]"
                      aria-label={`${active.day} special video`}
                    >
                      Your browser does not support HTML video.
                    </video>
                  </div>

                  <div className="p-5 sm:p-7">
                    <p className="text-xs font-extrabold uppercase tracking-[0.25em] text-[#ea1b24]">
                      {active.day}'s Special
                    </p>

                    <h3 className="mt-2 text-2xl font-black leading-tight text-white sm:text-3xl">
                      {active.title}
                    </h3>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {active.offers.map((offer) => (
                        <span
                          key={offer}
                          className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-white"
                        >
                          {offer}
                        </span>
                      ))}
                    </div>

                    <p className="mt-4 text-sm font-bold uppercase tracking-wide text-[#d4af67]">
                      {active.start} – {active.end}
                    </p>

                    {active.description && (
                      <p className="mt-4 text-sm leading-6 text-white/75">
                        {active.description}
                      </p>
                    )}

                    {active.details && (
                      <p className="mt-3 text-sm leading-6 text-white/65">
                        {active.details}
                      </p>
                    )}

                    {active.finePrint && (
                      <p className="mt-4 border-t border-white/10 pt-4 text-xs leading-5 text-white/45">
                        {active.finePrint}
                      </p>
                    )}

                    {!active.enabled && (
                      <p className="mt-4 text-sm text-white/50">
                        This special is not currently available.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </section>
          </div>,
          document.body
        )}
    </>
  );
}
