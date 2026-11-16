"use client";

import { useRef } from "react";
import { HOME } from "@/lib/content";
import { ArcSurface } from "./motion/arc-surface";
import { gsap, useGSAP, MQ } from "./motion/gsap";

const COLUMNS = [
  { label: HOME.ourSoftware.title, href: "#our-software" },
  { label: HOME.ourServices.title, href: "#our-services" },
  { label: HOME.trainingServices.title, href: "#training-services" },
] as const;

/**
 * Rises over the hero as a paper arc: three jump links to the homepage's
 * Our Software / Our Services / Training Services, with underlines that draw in.
 */
export function Statement() {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MQ.motion, () => {
        gsap.from("[data-col]", {
          y: 30,
          autoAlpha: 0,
          duration: 1.1,
          ease: "expo.out",
          stagger: 0.08,
          scrollTrigger: { trigger: "[data-cols]", start: "top 88%", once: true },
        });
        gsap.from("[data-underline]", {
          scaleX: 0,
          transformOrigin: "left",
          duration: 1.2,
          ease: "expo.out",
          stagger: 0.08,
          delay: 0.2,
          scrollTrigger: { trigger: "[data-cols]", start: "top 88%", once: true },
        });
      });
    },
    { scope: ref },
  );

  return (
    <section
      ref={ref}
      aria-label="On this page"
      className="surface-light arc-next relative z-10 px-5 pb-28 md:px-10 md:pb-40"
    >
      <ArcSurface tone="paper-warm" parallax="[data-hero-inner]" />

      <nav aria-label="On this page" data-cols className="mx-auto mt-6 max-w-6xl">
        <ul className="grid gap-8 md:grid-cols-3 md:gap-10">
          {COLUMNS.map((c) => (
            <li key={c.href} data-col>
              <a href={c.href} className="group block">
                <span className="font-display block text-[clamp(2rem,3.4vw,3rem)] leading-none uppercase">
                  {c.label}
                </span>
                <span className="relative mt-3 block h-px w-full overflow-hidden bg-carbon/10">
                  <span
                    data-underline
                    className="absolute inset-0 block bg-carbon transition-colors duration-500 group-hover:bg-fern"
                  />
                </span>
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </section>
  );
}
