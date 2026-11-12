"use client";

import { Fragment, useRef } from "react";
import { FEST_PAGE, NERC } from "@/lib/content";
import { FestModel } from "../fest-model";
import { ArcSurface } from "../motion/arc-surface";
import { gsap, SplitText, useGSAP, MQ } from "../motion/gsap";

const { intro, accountFor, scenariosIntro, stressScenarios } =
  NERC.requirements;

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
 * FEST and Near Term ERAs: the requirements (verbatim) rise in line by line,
 * then the FEST data model assembles like a blueprint as it scrolls into view —
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
        // Heading words + copy lines rise in.
        gsap.from(q("[data-ms-word]"), {
          yPercent: 110,
          duration: 1.1,
          stagger: 0.05,
          ease: "expo.out",
          scrollTrigger: {
            trigger: q("[data-ms-head]")[0],
            start: "top 85%",
            once: true,
          },
        });
        const splits = q("[data-ms-copy]").map((el) =>
          SplitText.create(el, { type: "lines", mask: "lines" }),
        );
        splits.forEach((s) => {
          gsap.set(s.masks, { paddingBottom: "0.2em", marginBottom: "-0.2em" });
          gsap.from(s.lines, {
            yPercent: 110,
            duration: 1,
            stagger: 0.05,
            ease: "expo.out",
            scrollTrigger: {
              trigger: s.masks[0],
              start: "top 88%",
              once: true,
            },
          });
        });
        gsap.from(q("[data-ms-li]"), {
          x: -24,
          autoAlpha: 0,
          duration: 0.8,
          stagger: 0.06,
          ease: "expo.out",
          scrollTrigger: {
            trigger: q("[data-ms-li]")[0],
            start: "top 90%",
            once: true,
          },
        });

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

        return () => splits.forEach((s) => s.revert());
      });
    },
    { scope: ref },
  );

  return (
    <section
      ref={ref}
      aria-labelledby="model-title"
      className="surface-light arc-next arc-prev relative z-10 px-5 md:px-10"
    >
      <ArcSurface tone="paper" parallax="[data-fh-inner]" />

      {/* Inner wrapper: the next section's parallax moves this. */}
      <div data-ms-inner className="mx-auto max-w-[1400px]">
        <div className="grid gap-10 lg:grid-cols-12">
          <h2
            id="model-title"
            data-ms-head
            className="font-condensed text-[clamp(2rem,4.4vw,4.6rem)] leading-[0.92] uppercase lg:col-span-5"
          >
            {FEST_PAGE.modelHeading.split(" ").map((w, i) => (
              <Fragment key={i}>
                {i > 0 && " "}
                <span className="inline-block overflow-hidden pb-[0.05em] align-bottom">
                  <span
                    data-ms-word
                    className={
                      w === "(FEST)" ? "inline-block text-fern" : "inline-block"
                    }
                  >
                    {w}
                  </span>
                </span>
              </Fragment>
            ))}
          </h2>

          <div className="text-[15px] leading-relaxed text-carbon/80 md:text-[clamp(1rem,1.15vw,1.15rem)] lg:col-span-6 lg:col-start-7">
            <p data-ms-copy>{intro}</p>
            <ul className="mt-4 space-y-2">
              {accountFor.map((a) => (
                <li key={a} data-ms-li className="flex gap-3">
                  <span
                    aria-hidden
                    className="mt-[0.6em] size-1.5 shrink-0 rounded-full bg-fern"
                  />
                  {a}
                </li>
              ))}
            </ul>
            <p data-ms-copy className="mt-6">
              {scenariosIntro}
            </p>
            <ul className="mt-4 space-y-2">
              {stressScenarios.map((a) => (
                <li key={a} data-ms-li className="flex gap-3">
                  <span
                    aria-hidden
                    className="mt-[0.6em] size-1.5 shrink-0 rounded-full bg-fern"
                  />
                  {a}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* The FEST data model, assembling like a blueprint */}
        <div data-ms-model className="relative mt-16 md:mt-24">
          <div
            data-ms-grid
            aria-hidden
            className="pointer-events-none absolute -inset-x-6 -inset-y-8 rounded-[24px] opacity-100 [background-image:linear-gradient(to_right,rgb(29_34_15/0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgb(29_34_15/0.06)_1px,transparent_1px)] [background-size:32px_32px]"
          />
          <div className="relative">
            <FestModel scrub />
          </div>
        </div>
      </div>
    </section>
  );
}
