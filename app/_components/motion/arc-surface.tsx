"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP, MQ } from "./gsap";

/** Full class strings so Tailwind can see them. */
const TONES = {
  paper: { bg: "bg-paper", fill: "fill-paper" },
  "paper-warm": { bg: "bg-paper-warm", fill: "fill-paper-warm" },
  "carbon-deep": { bg: "bg-carbon-deep", fill: "fill-carbon-deep" },
} as const;

/**
 * Curved section top (Trident-style).
 *
 * Paints the section's background with a fixed arc on top: a shallow segment of
 * a very large circle, `--arc-depth` tall, that simply scrolls with the section.
 * The area beside the arc is transparent; the section overlaps the previous one
 * by the arc depth (`arc-next`), so the previous section shows through. The
 * previous section reserves that space at its bottom (`arc-prev`).
 *
 * `parallax` (a selector) slows the previous section while this one rises over
 * it, so the next section appears to scroll faster. Never point it at a pinned
 * section or an ancestor of one: a transform would break the pin.
 *
 * Usage: first child of a `relative z-* arc-next` section with no background class.
 */
export function ArcSurface({ tone, parallax }: { tone: keyof typeof TONES; parallax?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!parallax) return;
      const mm = gsap.matchMedia();
      mm.add(MQ.motion, (context) => {
        const section = ref.current?.parentElement;
        if (!section) return;
        // The target may not exist yet (e.g. a story section that swaps in its
        // pinned layout after mounting), so look again after each layout refresh.
        let started = false;
        const start = () => {
          if (started) return;
          const prev = document.querySelector<HTMLElement>(parallax);
          if (!prev) return;
          started = true;
          context.add(() => {
            // Previous section moves at ~60% speed while this one covers it.
            gsap.fromTo(
              prev,
              { y: 0 },
              {
                y: () => window.innerHeight * 0.4,
                ease: "none",
                scrollTrigger: {
                  trigger: section,
                  start: "top bottom",
                  end: "top top",
                  scrub: true,
                  invalidateOnRefresh: true,
                },
              },
            );
          });
        };
        start();
        if (!started) ScrollTrigger.addEventListener("refresh", start);
        return () => ScrollTrigger.removeEventListener("refresh", start);
      });
    },
    { dependencies: [parallax] },
  );

  const { bg, fill } = TONES[tone];
  return (
    <div ref={ref} aria-hidden className="pointer-events-none absolute inset-0 -z-10">
      {/* Arc: apex at the section top, meeting the full width at --arc-depth. */}
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className={`absolute inset-x-0 top-0 block h-[var(--arc-depth)] w-full ${fill}`}
      >
        <path d="M0 100 Q50 -100 100 100 Z" />
      </svg>
      <div className={`absolute inset-x-0 bottom-0 top-[calc(var(--arc-depth)-1px)] ${bg}`} />
    </div>
  );
}
