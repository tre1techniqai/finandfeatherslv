"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

type ScrollRevealProps = {
  children: ReactNode;
  className?: string;
  desktopIntro?: boolean;
};

export default function ScrollReveal({
  children,
  className = "",
  desktopIntro = false,
}: ScrollRevealProps) {
  const elementRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = elementRef.current;

    if (!element) return;

    const isDesktop = window.matchMedia("(min-width: 1280px)").matches;
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    // Desktop Virtual Tour and Ribeye use the timed intro animation.
    if (desktopIntro && isDesktop) return;

    if (reduceMotion) {
      setIsVisible(true);
      return;
    }

    let revealTimeout: ReturnType<typeof setTimeout> | undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            // Stop observing immediately so each section reveals only once.
            observer.unobserve(entry.target);

            // Brief pause after the section enters the visible area.
            revealTimeout = setTimeout(() => {
              setIsVisible(true);
            }, 180);
          }
        }
      },
      {
        threshold: 0.05,
        rootMargin: "0px 0px -40px 0px",
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();

      if (revealTimeout) {
        clearTimeout(revealTimeout);
      }
    };
  }, [desktopIntro]);

  const revealClass = [
    "scroll-reveal",
    desktopIntro ? "scroll-reveal--desktop-intro" : "",
    isVisible ? "is-visible" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div ref={elementRef} className={revealClass}>
      {children}
    </div>
  );
}