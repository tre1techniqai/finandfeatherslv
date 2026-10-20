"use client";

import { useState } from "react";

const VIDEO_URL =
  "https://ikxruiemlczfritxrjqr.supabase.co/storage/v1/object/public/website-media/fin-feathers-ribeye.mp4";

const POSTER_URL = "/img/ribeye-video-thumb.png";

export default function RibeyeVideo() {
  const [playing, setPlaying] = useState(false);

  if (playing) {
    return (
      <div className="relative mx-auto w-full max-w-[420px]">
        <video
          controls
          autoPlay
          playsInline
          preload="metadata"
          poster={POSTER_URL}
          aria-label="Fin & Feathers ribeye steak video"
          onEnded={() => setPlaying(false)}
          className="mx-auto block h-auto w-full rounded-xl"
        >
          <source src={VIDEO_URL} type="video/mp4" />
          Your browser does not support video playback.
        </video>

        <button
          type="button"
          onClick={() => setPlaying(false)}
          aria-label="Close ribeye video and return to thumbnail"
          className="absolute right-2 top-2 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-white/40 bg-black/80 text-2xl leading-none text-white shadow-lg transition-colors hover:bg-[#ea1b24] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          ×
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[420px]">
      <button
        type="button"
        onClick={() => setPlaying(true)}
        aria-label="Play the Fin & Feathers ribeye video"
        className="group grid w-full grid-cols-[120px_minmax(0,1fr)] items-center gap-4 text-left sm:grid-cols-[132px_minmax(0,1fr)] sm:gap-5"
      >
        <div
          className="relative aspect-square w-full overflow-hidden rounded-full border-[3px] border-white bg-cover bg-center bg-no-repeat shadow-[0_10px_28px_rgba(0,0,0,0.38)]"
          style={{ backgroundImage: `url("${POSTER_URL}")` }}
        >
          <span className="absolute inset-0 bg-black/20 transition-colors duration-300 group-hover:bg-black/28" />

          <span className="absolute inset-0 flex items-center justify-center">
            <svg
              viewBox="0 0 48 48"
              aria-hidden="true"
              className="h-[88px] w-[88px] opacity-50 drop-shadow-[0_2px_6px_rgba(0,0,0,0.45)] transition-transform duration-300 group-hover:scale-110"
            >
              <path
                d="M16 11.5C16 9.9 17.8 8.95 19.15 9.85L35.2 20.55C36.42 21.36 36.42 23.14 35.2 23.95L19.15 34.65C17.8 35.55 16 34.6 16 33V11.5Z"
                fill="white"
                stroke="white"
                strokeWidth="1.4"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </div>

        <div className="flex w-full min-w-0 flex-col items-center justify-center p-0 text-center">
          <svg
            viewBox="0 0 300 112"
            xmlns="http://www.w3.org/2000/svg"
            role="img"
            aria-label="HAND-CUT USDA RIBEYE. MARINATED AND GRILLED TO PERFECTION."
            className="block h-auto w-full"
          >
            <text
              x="150"
              y="35"
              textAnchor="middle"
              textLength="98"
              lengthAdjust="spacingAndGlyphs"
              fill="#facc15"
              fontFamily="Arial, Helvetica, sans-serif"
              fontWeight="300"
              fontSize="22"
            >
              HAND-CUT
            </text>

            <text
              x="150"
              y="69"
              textAnchor="middle"
              textLength="296"
              lengthAdjust="spacingAndGlyphs"
              fill="#facc15"
              fontFamily="Arial, Helvetica, sans-serif"
              fontWeight="900"
              fontSize="32"
            >
              USDA RIBEYE
            </text>

            <text
              x="150"
              y="91"
              textAnchor="middle"
              textLength="296"
              lengthAdjust="spacingAndGlyphs"
              fill="#ffffff"
              fontFamily="Arial, Helvetica, sans-serif"
              fontWeight="700"
              fontSize="16"
            >
              MARINATED &amp; GRILLED
            </text>

            <text
              x="150"
              y="109"
              textAnchor="middle"
              fill="#ffffff"
              fontFamily="Arial, Helvetica, sans-serif"
              fontWeight="700"
              fontSize="16"
            >
              TO PERFECTION
            </text>
          </svg>
        </div>
      </button>
    </div>
  );
}