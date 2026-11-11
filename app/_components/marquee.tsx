"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP, MQ } from "./motion/gsap";
import { cx } from "./ui/primitives";

/** Terms that already appear in the site copy. */
const ROW_1 = ["Near-Term ERA", "Fuel Security", "BAL-007-1", "FEST", "Power Systems"];
const ROW_2 = "Balancing Authorities / Reliability";

function Row1() {
  return (
    <div className="flex shrink-0 items-center">
      {ROW_1.map((t, i) => (
        <span key={t} className="flex items-center">
          <span
            className={cx(
              "font-condensed px-[0.25em] text-[clamp(3.5rem,10vw,10rem)] leading-[0.95] uppercase",
              i % 2 === 1 && "text-outline",
            )}
          >
            {t}
          </span>
          <span className="mx-[0.35em] size-[0.18em] rounded-full bg-fern text-[clamp(3.5rem,10vw,10rem)]" />
        </span>
      ))}
    </div>
  );
}

function Row2() {
  return (
    <div className="flex shrink-0 items-center">
      {Array.from({ length: 6 }, (_, i) => (
        <span key={i} className="text-label-md flex items-center gap-6 px-6 text-muted">
          {ROW_2}
          <span className="h-px w-10 bg-current opacity-50" />
        </span>
      ))}
    </div>
  );
}

/**
 * Two-row marquee band. Scroll velocity nudges speed (and direction);
 * pauses on hover; static under reduced motion.
 */
export function Marquee() {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MQ.motion, () => {
        const a = gsap.to("[data-track='1']", { xPercent: -50, duration: 38, ease: "none", repeat: -1 });
        const b = gsap.fromTo("[data-track='2']", { xPercent: -50 }, { xPercent: 0, duration: 46, ease: "none", repeat: -1 });
        const tweens = [a, b];
        let hovered = false;

        const st = ScrollTrigger.create({
          trigger: ref.current,
          start: "top bottom",
          end: "bottom top",
          onToggle: (self) => tweens.forEach((t) => (self.isActive && !hovered ? t.play() : t.pause())),
          onUpdate: (self) => {
            if (hovered) return;
            const v = self.getVelocity();
            const boost = gsap.utils.clamp(-5, 5, v / 300);
            const scale = (self.direction >= 0 ? 1 : -1) * (1 + Math.abs(boost));
            tweens.forEach((t) =>
              gsap.to(t, { timeScale: scale, duration: 0.2, overwrite: true, onComplete: () => {
                gsap.to(t, { timeScale: Math.sign(scale) || 1, duration: 1.2, ease: "power2.out" });
              } }),
            );
          },
        });

        const el = ref.current!;
        const enter = () => {
          hovered = true;
          tweens.forEach((t) => t.pause());
        };
        const leave = () => {
          hovered = false;
          if (st.isActive) tweens.forEach((t) => t.play());
        };
        el.addEventListener("mouseenter", enter);
        el.addEventListener("mouseleave", leave);
        return () => {
          el.removeEventListener("mouseenter", enter);
          el.removeEventListener("mouseleave", leave);
        };
      });
    },
    { scope: ref },
  );

  return (
    <section
      ref={ref}
      aria-label="Focus areas"
      className="surface-light relative z-10 overflow-hidden border-y border-line bg-paper-warm py-12 md:py-16"
    >
      <p className="sr-only">{[...ROW_1, ROW_2].join(", ")}</p>
      <div aria-hidden className="flex flex-col gap-6 md:gap-8">
        <div data-track="1" className="flex w-max text-carbon will-change-transform">
          <Row1 />
          <Row1 />
        </div>
        <div data-track="2" className="flex w-max will-change-transform">
          <Row2 />
          <Row2 />
        </div>
      </div>
    </section>
  );
}
