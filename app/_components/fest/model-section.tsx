"use client";

import { useRef } from "react";
import { FestModel } from "../fest-model";
import { ArcSurface } from "../motion/arc-surface";
import { gsap, useGSAP, MQ } from "../motion/gsap";

/** Scatter for each model card before it settles (deterministic). */
const SCATTER = [
  { x: -180, y: 140, r: -14 },
  { x: 220, y: -90, r: 10 },
  { x: -120, y: 220, r: 8 },
  { x: 160, y: 180, r: -9 },
  { x: -240, y: -60, r: 12 },
  { x: 260, y: 120, r: -12 },
  { x: 90, y: 260, r: 6 },
];

/**
 * The FEST data model (after the scenarios story, which now carries this part's
 * heading and text): it assembles like a blueprint as it scrolls into view —
 * cards fly in from scattered angles and settle into the grid while the
 * connectors draw between them. (Hover a card to see what it links to.)
 */
export function ModelSection() {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const section = ref.current!;
      const q = gsap.utils.selector(section);
      const mm = gsap.matchMedia();

      mm.add(MQ.motion, () => {
        // Blueprint assembly, scrubbed: cards settle, then the connectors draw.
        const model = q("[data-fest-model]")[0] as HTMLElement;
        const cards = q("[data-node] > [role='group']") as HTMLElement[];
        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: q("[data-ms-model]")[0],
            start: "top 90%",
            end: "top 20%",
            scrub: 0.8,
          },
        });
        cards.forEach((c, i) => {
          const s = SCATTER[i % SCATTER.length];
          tl.fromTo(
            c,
            { x: s.x, y: s.y, rotate: s.r, scale: 0.85, autoAlpha: 0 },
            {
              x: 0,
              y: 0,
              rotate: 0,
              scale: 1,
              autoAlpha: 1,
              duration: 0.5,
              ease: "power3.out",
            },
            i * 0.07,
          );
        });
        tl.fromTo(
          model,
          { "--fest-draw": 0 },
          { "--fest-draw": 1, duration: 0.45, ease: "power1.inOut" },
          0.55,
        ).fromTo(
          q("[data-ms-grid]"),
          { opacity: 0 },
          { opacity: 1, duration: 0.6 },
          0,
        );
      });
    },
    { scope: ref },
  );

  return (
    <section
      ref={ref}
      aria-label="FEST data model"
      className="surface-light arc-next arc-prev relative z-10 px-5 md:px-10"
    >
      <ArcSurface tone="paper" parallax="[data-fs-inner]" />

      {/* Inner wrapper: the next section's parallax moves this. */}
      <div data-ms-inner className="mx-auto max-w-[1400px]">
        {/* The FEST data model, assembling like a blueprint */}
        <div data-ms-model className="relative mt-4 md:mt-8">
          <div
            data-ms-grid
            aria-hidden
            className="pointer-events-none absolute -inset-x-6 -inset-y-8 rounded-[24px] opacity-100 [background-image:linear-gradient(to_right,rgb(18_22_10/0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgb(18_22_10/0.06)_1px,transparent_1px)] [background-size:32px_32px]"
          />
          <div className="relative">
            <FestModel scrub />
          </div>
        </div>
      </div>
    </section>
  );
}
