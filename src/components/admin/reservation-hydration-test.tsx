"use client";

import { useState } from "react";

export default function ReservationHydrationTest() {
  const [clicks, setClicks] = useState(0);

  return (
    <section className="mb-6 rounded-xl border border-amber-400/30 bg-zinc-900 p-5 text-white">
      <h2 className="text-lg font-bold">
        React Hydration Diagnostic
      </h2>

      <p className="mt-2 text-sm text-zinc-300">
        This is a temporary test of client-side React state.
      </p>

      <p className="mt-4 text-sm">
        Button clicks:{" "}
        <span className="font-bold" data-testid="hydration-click-count">
          {clicks}
        </span>
      </p>

      <button
        type="button"
        onClick={() => setClicks((current) => current + 1)}
        className="mt-4 rounded-lg bg-amber-500 px-4 py-3 font-semibold text-black"
      >
        Test React Click
      </button>
    </section>
  );
}