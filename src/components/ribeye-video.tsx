
"use client";

import { useState } from "react";

const VIDEO_URL =
  "https://ikxruiemlczfritxrjqr.supabase.co/storage/v1/object/public/website-media/fin-feathers-ribeye.mp4";

const POSTER_URL = "/img/ribeye-video-thumb.png";

export default function RibeyeVideo() {
  const [playing, setPlaying] = useState(false);

  if (playing) {
    return (
      <div className="relative mx-auto w-full max-w-[300px]">
        <video
          controls
          autoPlay
          playsInline
          preload="metadata"
          poster={POSTER_URL}
          aria-label="Fin & Feathers ribeye steak video"
          onEnded={() => setPlaying(false)}
          className="mx-auto block h-auto w-full rounded-lg"
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
    <div className="mx-auto w-full max-w-[300px]">
      <h3 className="mb-3 text-center text-lg font-bold tracking-[0.1em] text-white">
        WATCH THE RIBEYE VIDEO
      </h3>

      <button
        type="button"
        onClick={() => setPlaying(true)}
        aria-label="Play the Fin & Feathers ribeye video"
        className="group relative block w-full overflow-hidden rounded-lg"
      >
        <img
          src={POSTER_URL}
          alt="Fin & Feathers ribeye steak video preview"
          width={300}
          height={169}
          loading="lazy"
          className="block h-auto w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />

        <span className="absolute inset-0 flex items-center justify-center bg-black/20 transition-colors group-hover:bg-black/35">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#ea1b24] text-2xl text-white shadow-lg transition-transform group-hover:scale-110">
            ▶
          </span>
        </span>
      </button>
    </div>
  );
}
