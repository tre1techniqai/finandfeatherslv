"use client";

import { useEffect, useRef, useState } from "react";
import ReservationTrigger from "@/components/reservation-trigger";

const TITLE_TEXT = "Reservations by Text";
const MAX_TITLE_FONT_SIZE = 18;
const HOLD_AFTER_TYPING_MS = 10000;
const PULSE_SEQUENCE_MS = 1800;
const RESET_DELAY_MS = 700;
const EXIT_ANIMATION_MS = 280;

// Keep this longer than the title's typing duration. The final typing-dots
// message then remains visible throughout the hold and pulse sequence.
const MESSAGE_PAUSE_MS = 1150;
const FIRST_MESSAGE_DELAY_MS = 500;
const DOTS_DELAY_MS = 1150;

function getRandomTypingDelay(character: string, index: number) {
  if (character === " ") return 70 + Math.floor(Math.random() * 75);
  const base = 65 + Math.floor(Math.random() * 85);
  return index > 0 && index % 5 === 0
    ? base + 50 + Math.floor(Math.random() * 85)
    : base;
}

export default function ReservationsTextHero() {
  const [typedText, setTypedText] = useState("");
  const [showCta, setShowCta] = useState(false);
  const [pulseTitle, setPulseTitle] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [titleFontSize, setTitleFontSize] = useState(MAX_TITLE_FONT_SIZE);
  const titleContainerRef = useRef<HTMLDivElement>(null);
  const titleMeasureRef = useRef<HTMLSpanElement>(null);
  const [visibleBubbleCount, setVisibleBubbleCount] = useState(0);
  const [showTypingBubble, setShowTypingBubble] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setPrefersReducedMotion(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  // Fit the title by adjusting its real font size instead of scaleX().
  // The complete title and cursor are measured at 18px, preserving glyph
  // proportions at every breakpoint and for the entire typing sequence.
  useEffect(() => {
    const container = titleContainerRef.current;
    const measure = titleMeasureRef.current;
    if (!container || !measure) return;

    const updateFontSize = () => {
      const availableWidth = container.clientWidth;
      const naturalWidth = measure.getBoundingClientRect().width;
      if (availableWidth > 0 && naturalWidth > 0) {
        const fit = (availableWidth - 2) / naturalWidth;
        setTitleFontSize(MAX_TITLE_FONT_SIZE * Math.min(1, fit));
      }
    };

    updateFontSize();
    const observer = new ResizeObserver(updateFontSize);
    observer.observe(container);
    document.fonts.ready.then(updateFontSize).catch(() => {});
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let cancelled = false;
    const timeouts: number[] = [];

    function wait(ms: number) {
      return new Promise<void>((resolve) => {
        const id = window.setTimeout(resolve, ms);
        timeouts.push(id);
      });
    }

    async function animateConversation() {
      await wait(FIRST_MESSAGE_DELAY_MS);
      if (cancelled) return;
      for (let count = 1; count <= 4; count += 1) {
        setVisibleBubbleCount(count);
        await wait(MESSAGE_PAUSE_MS);
        if (cancelled) return;
      }
      await wait(DOTS_DELAY_MS);
      if (!cancelled) setShowTypingBubble(true);
    }

    async function animate() {
      if (prefersReducedMotion) {
        setTypedText(TITLE_TEXT);
        setVisibleBubbleCount(4);
        setShowTypingBubble(true);
        setShowCta(true);
        setPulseTitle(false);
        setIsExiting(false);
        return;
      }

      while (!cancelled) {
        setTypedText("");
        setShowCta(false);
        setPulseTitle(false);
        setIsExiting(false);
        setVisibleBubbleCount(0);
        setShowTypingBubble(false);

        // The title and messages start together, but the messages arrive
        // more slowly; the three dots are the last and longest-held item.
        void animateConversation();

        for (let index = 0; index < TITLE_TEXT.length; index += 1) {
          await wait(getRandomTypingDelay(TITLE_TEXT[index], index));
          if (cancelled) return;
          setTypedText(TITLE_TEXT.slice(0, index + 1));
        }

        setShowCta(true);
        await wait(HOLD_AFTER_TYPING_MS);
        if (cancelled) return;
        setPulseTitle(true);
        await wait(PULSE_SEQUENCE_MS);
        if (cancelled) return;
        setPulseTitle(false);
        setIsExiting(true);
        // Title and CTA fade/scale out in the same 280ms window.
        await wait(EXIT_ANIMATION_MS);
        if (cancelled) return;
        setShowCta(false);
        setTypedText("");
        await wait(RESET_DELAY_MS);
      }
    }

    void animate();
    return () => {
      cancelled = true;
      for (const id of timeouts) window.clearTimeout(id);
    };
  }, [prefersReducedMotion]);

  return (
    <section
      aria-label="Reservations by text"
      className="reservations-text-hero relative w-full overflow-visible"
    >
      <div className="grid min-h-[220px] grid-cols-[42%_58%] items-center sm:min-h-[250px]">
        <div
          aria-hidden="true"
          className="relative flex h-full items-center justify-center overflow-visible"
        >
          <div className="phone-aura pointer-events-none absolute inset-0" />
          <div
            className={`phone-exit-wrapper ${
                isExiting ? "phone-exiting" : ""
            }`}
            >
            <div className="phone-float relative">
            <div className="phone-perspective">
            </div>
              <div className="phone-shell">
                <div className="phone-shadow-side" />
                <div className="phone-shadow-bottom" />
                <div className="phone-frame">
                  <div className="phone-screen">
                    <div className="screen-glow" />
                    <div className="camera-island">
                      <div className="speaker-slot" />
                    </div>
                    <div className="message-stack">
                      <div className={`message-row left ${visibleBubbleCount >= 1 ? "bubble-visible" : "bubble-hidden"}`}>
                        <div className="bubble-avatar" />
                        <div className="bubble-red bubble-short" />
                      </div>
                      <div className={`message-row right ${visibleBubbleCount >= 2 ? "bubble-visible" : "bubble-hidden"}`}>
                        <div className="bubble-blue bubble-medium" />
                        <div className="bubble-avatar" />
                      </div>
                      <div className={`message-row left ${visibleBubbleCount >= 3 ? "bubble-visible" : "bubble-hidden"}`}>
                        <div className="bubble-avatar" />
                        <div className="bubble-red bubble-medium" />
                      </div>
                      <div className={`message-row right ${visibleBubbleCount >= 4 ? "bubble-visible" : "bubble-hidden"}`}>
                        <div className="bubble-blue bubble-short" />
                        <div className="bubble-avatar" />
                      </div>
                      <div className={`message-row left ${showTypingBubble ? "bubble-visible" : "bubble-hidden"}`}>
                        <div className="bubble-avatar" />
                        <div className="typing-bubble">
                          <span className="typing-dot" />
                          <span className="typing-dot" />
                          <span className="typing-dot" />
                        </div>
                      </div>
                    </div>
                    <div className="home-indicator" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative flex min-w-0 flex-col items-start justify-center gap-5 py-4 pr-2 sm:gap-6 sm:pr-4">
          <h2 className="sr-only">Reservations by Text</h2>
          <div
            ref={titleContainerRef}
            className={`title-wrap min-w-0 w-full ${pulseTitle ? "title-pulse-on" : ""} ${isExiting ? "title-exiting" : ""}`}
            aria-hidden="true"
          >
            <span
              className="title-line"
              style={{ fontSize: `${titleFontSize}px` }}
            >
              <span className="title-text">{typedText}</span>
              <span className="typing-cursor" />
            </span>
            <span ref={titleMeasureRef} className="title-line title-measure">
              <span className="title-text">{TITLE_TEXT}</span>
              <span className="typing-cursor measure-cursor" />
            </span>
          </div>
          <div
            className={`cta-wrap ${isExiting ? "cta-exiting" : showCta ? "cta-visible" : "cta-hidden"}`}
          >
            <ReservationTrigger
              className="inline-flex min-h-[46px] w-full items-center justify-center rounded-lg border border-[#ff4b53]/60 bg-[#ea1b24] px-2 py-3 text-center text-[10px] font-extrabold tracking-[0.04em] text-white shadow-[0_0_18px_rgba(234,27,36,0.28)] transition-colors hover:bg-[#ff343d] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:text-xs"
            >
              RESERVE YOUR TABLE!
            </ReservationTrigger>
          </div>
        </div>
      </div>

      <style jsx>{`
        .phone-aura {
          background: radial-gradient(ellipse at center, rgba(234,27,36,.16) 0%, rgba(234,27,36,.09) 32%, transparent 72%);
          filter: blur(12px);
          transform: scale(1.05);
        }
        .phone-float { animation: phoneFloating 6.2s ease-in-out infinite; }
        .phone-perspective {
          transform: perspective(900px) rotateY(20deg) rotateZ(-8deg);
          transform-style: preserve-3d;
        }
        .phone-shell { position: relative; width: 122px; height: 220px; }
        /* Perspective depth and the contact shadow are now both on the left. */
        .phone-shadow-side {
          position: absolute;
          inset: 10px 10px 8px -9px;
          border-radius: 28px;
          background: linear-gradient(180deg, #353942, #101218);
          transform: translateZ(-10px);
          box-shadow: -5px 8px 12px rgba(0,0,0,.6);
        }
        .phone-shadow-bottom {
          position: absolute;
          bottom: -11px;
          left: -20px;
          width: 94%;
          height: 28px;
          border-radius: 50%;
          background: rgba(0,0,0,.65);
          filter: blur(12px);
          transform: translateZ(-24px);
        }
        .phone-frame {
          position: absolute;
          inset: 0;
          border-radius: 26px;
          border: 4px solid #5b616d;
          background: linear-gradient(145deg, #444955 0%, #1b202a 55%, #080b10 100%);
          padding: 5px;
          box-shadow: -16px 18px 28px rgba(0,0,0,.58), 0 0 18px rgba(234,27,36,.14), inset 1px 1px 1px rgba(255,255,255,.14);
        }
        .phone-frame::before {
          content: "";
          position: absolute;
          top: 8px;
          bottom: 8px;
          left: -7px;
          width: 7px;
          border-radius: 20px 0 0 20px;
          background: linear-gradient(180deg, #696e78, #23272e);
          box-shadow: inset -1px 0 1px rgba(255,255,255,.2);
        }
        .phone-frame::after {
          content: "";
          position: absolute;
          inset: 8px 8px 8px auto;
          width: 14px;
          border-radius: 20px;
          background: linear-gradient(180deg, rgba(255,255,255,.12), rgba(255,255,255,.02));
          opacity: .55;
          pointer-events: none;
        }
        .phone-screen {
          position: relative;
          height: 100%;
          width: 100%;
          overflow: hidden;
          border-radius: 18px;
          background: linear-gradient(180deg, #121823, #080b10);
          box-shadow: inset 0 0 0 1px rgba(255,255,255,.05), inset 0 0 28px rgba(0,0,0,.5);
          padding: 12px 10px 14px;
        }
        .screen-glow {
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse at top left, rgba(255,255,255,.08), transparent 30%), radial-gradient(ellipse at center, rgba(234,27,36,.08), transparent 62%);
          pointer-events: none;
        }
        .camera-island { position: relative; display: flex; justify-content: center; margin-bottom: 10px; }
        .speaker-slot { height: 4px; width: 34px; border-radius: 999px; background: rgba(255,255,255,.18); }
        .message-stack { position: relative; display: flex; flex-direction: column; gap: 10px; margin-top: 4px; }
        .message-row { display: flex; align-items: center; gap: 5px; transition: opacity 360ms ease, transform 360ms ease; }
        .message-row.left { justify-content: flex-start; }
        .message-row.right { justify-content: flex-end; }
        .bubble-hidden { opacity: 0; transform: translateY(8px); }
        .bubble-visible { opacity: 1; transform: translateY(0); }
        .bubble-avatar {
          width: 14px;
          height: 14px;
          flex-shrink: 0;
          border-radius: 999px;
          background: radial-gradient(circle at 35% 35%, rgba(255,255,255,.42), rgba(255,255,255,.12) 35%, rgba(255,255,255,.04) 36%), rgba(255,255,255,.16);
        }
        .bubble-red, .bubble-blue, .typing-bubble {
          border-radius: 12px;
          box-shadow: 0 6px 12px rgba(0,0,0,.24), inset 0 1px 1px rgba(255,255,255,.1);
        }
        .bubble-red {
          height: 22px;
          background: linear-gradient(180deg, #ff5760, #ea1b24);
          border-top-left-radius: 5px;
        }
        .bubble-blue {
          height: 24px;
          background: linear-gradient(180deg, #496495, #2e4570);
          border-top-right-radius: 5px;
        }
        .bubble-short { width: 56px; }
        .bubble-medium { width: 66px; }
        .typing-bubble {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          height: 22px;
          min-width: 42px;
          padding: 0 10px;
          background: linear-gradient(180deg, rgba(255,87,96,.94), rgba(234,27,36,.96));
          border-top-left-radius: 5px;
        }
        .typing-dot {
          width: 4px;
          height: 4px;
          border-radius: 999px;
          background: rgba(255,255,255,.95);
          animation: typingDots 1.15s infinite ease-in-out;
        }
        .typing-dot:nth-child(2) { animation-delay: .16s; }
        .typing-dot:nth-child(3) { animation-delay: .32s; }
        .home-indicator {
          position: absolute;
          bottom: 5px;
          left: 50%;
          width: 36px;
          height: 4px;
          border-radius: 999px;
          transform: translateX(-50%);
          background: rgba(255,255,255,.24);
        }
        .title-wrap { min-height: 42px; display: flex; align-items: center; max-width: 100%; position: relative; transform-origin: center; }
        .title-measure { position: absolute; left: 0; top: 0; visibility: hidden; pointer-events: none; font-size: 18px !important; }
        .measure-cursor { animation: none !important; }
        .title-line {
          display: inline-flex;
          align-items: center;
          width: max-content;
          max-width: none;
          flex-shrink: 0;
          transform-origin: left center;
          white-space: nowrap;
          font-size: 18px;
          line-height: 1.15;
          font-weight: 900;
          letter-spacing: -.035em;
          color: white;
          text-shadow: 0 0 12px rgba(255,255,255,.08), 0 0 20px rgba(234,27,36,.1);
        }
        .title-text { flex-shrink: 0; }
        .typing-cursor {
          display: inline-block;
          width: .11em;
          height: 1em;
          margin-left: .06em;
          background: white;
          border-radius: 1px;
          animation: cursorBlink .9s step-end infinite;
          box-shadow: 0 0 10px rgba(255,255,255,.28);
          flex-shrink: 0;
        }
        .title-pulse-on .title-line { animation: titlePulse .45s ease-in-out 3; transform-origin: left center; }
        .title-exiting {
            animation: titleFadeOut 280ms ease-in both;
        }

        .cta-wrap {
            width: 100%;
            transform-origin: center;
        }

        .cta-exiting {
            opacity: 1;
            pointer-events: none;
            animation: ctaExit 280ms ease-in both;
        }

        @keyframes titleFadeOut {
        0% {
            opacity: 1;
            transform: translateY(0);
        }
        100% {
             opacity: 0;
             transform: translateY(-5px);
            }
        }

        @keyframes ctaExit {
        0% {
            opacity: 1;
            transform: scale(1);
        }
        35% {
            opacity: 1;
            transform: scale(1.075);
        }
        100% {
            opacity: 0;
            transform: scale(.65);
        }
        }
        .cta-hidden { opacity: 0; transform: scale(.88); pointer-events: none; transition: opacity 180ms ease, transform 180ms ease; }
        .cta-visible { opacity: 1; pointer-events: auto; animation: ctaRebound 900ms both; }
        @keyframes ctaRebound {
          0%   { opacity: 0; transform: scale(.55); }
          28%  { opacity: 1; transform: scale(1.23); }
          46%  { transform: scale(.87); }
          62%  { transform: scale(1.105); }
          75%  { transform: scale(.95); }
          86%  { transform: scale(1.035); }
          94%  { transform: scale(.99); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes phoneFloating {
          0%, 100% { transform: translate3d(0,0,0); }
          25% { transform: translate3d(4px,-5px,0); }
          50% { transform: translate3d(-2px,-10px,0); }
          75% { transform: translate3d(-5px,-4px,0); }
        }
        @keyframes cursorBlink {
          0%, 44% { opacity: 1; }
          45%, 100% { opacity: .2; }
        }
        @keyframes typingDots {
          0%, 80%, 100% { opacity: .35; transform: translateY(0); }
          40% { opacity: 1; transform: translateY(-1px); }
        }
        @keyframes titlePulse {
        0%, 100% {
            opacity: 1;
            filter: brightness(1);
        }
        50% {
            opacity: 0.85;
            filter: brightness(1.4);
        }
        }
        @media (max-width: 420px) {
          .phone-shell { width: 110px; height: 205px; }

        }
        @media (prefers-reduced-motion: reduce) {
          .phone-float, .typing-cursor, .typing-dot, .title-pulse-on .title-line, .title-exiting, .cta-visible, .cta-exiting { animation: none !important; }
          .message-row { transition: none; }
          .cta-visible, .cta-exiting { opacity: 1; transform: none; }
        }
      `}</style>
    </section>
  );
}