"use client";

import { useRef } from "react";
import { gsap, useGSAP, MQ } from "./motion/gsap";

/**
 * Fern wash over the footer's paper surface, in exactly the same shape (arc +
 * body), revealed by a circle growing from the bottom centre. Scrubbed: it
 * fills as you scroll down to the end of the page and empties as you scroll up.
 * Static partial circle under reduced motion.
 */
export function FooterFill() {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const el = ref.current;
    const footer = el?.parentElement;
    if (!el || !footer) return;
    const mm = gsap.matchMedia();
    mm.add(MQ.motion, () => {
      gsap.fromTo(
        el,
        { clipPath: "circle(0% at 50% 100%)" },
        {
          clipPath: "circle(150% at 50% 100%)",
          ease: "none",
          scrollTrigger: { trigger: footer, start: "top bottom", end: "bottom bottom", scrub: 0.5 },
        },
      );
    });
  });

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 [clip-path:circle(60%_at_50%_100%)]"
    >
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-x-0 top-0 block h-[var(--arc-depth)] w-full fill-fern/20">
        <path d="M0 100 Q50 -100 100 100 Z" />
      </svg>
      <div className="absolute inset-x-0 bottom-0 top-[calc(var(--arc-depth)-1px)] bg-fern/20" />
    </div>
  );
}
