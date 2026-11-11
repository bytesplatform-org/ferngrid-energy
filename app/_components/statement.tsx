"use client";

import Image from "next/image";
import { useRef } from "react";
import { FRAGMENTS, HOME } from "@/lib/content";
import { ArcTop } from "./motion/arc-top";
import { gsap, useGSAP, MQ } from "./motion/gsap";
import { SectionLabel } from "./ui/primitives";
import logoMark from "@/public/images/logo-mark.png";

const COLUMNS = [
  { index: "01", label: HOME.ourSoftware.title, href: "#our-software" },
  { index: "02", label: HOME.ourServices.title, href: "#our-services" },
  { index: "03", label: HOME.trainingServices.title, href: "#training-services" },
] as const;

/** Circle radius in the 1000×1000 viewBox and the text that wraps it. */
const R = 380;
const CIRC = 2 * Math.PI * R;
const RING_TEXT = `${FRAGMENTS.statement.toUpperCase()} · `;

/**
 * 00 — "The statement". Rises over the hero as a paper arc; the statement
 * (lifted from the tagline) is set on a circle that rotates and settles.
 */
export function Statement({ heroMode }: { heroMode: "scrub" | "video" }) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MQ.motion, () => {
        gsap.fromTo(
          "[data-ring]",
          { rotate: -110, scale: 0.86 },
          {
            rotate: 0,
            scale: 1,
            ease: "none",
            scrollTrigger: { trigger: ref.current, start: "top 95%", end: "center 55%", scrub: 0.6 },
          },
        );
        gsap.from("[data-mark]", {
          autoAlpha: 0,
          scale: 0.8,
          duration: 1.4,
          ease: "expo.out",
          scrollTrigger: { trigger: "[data-mark]", start: "top 80%", once: true },
        });
        gsap.from("[data-drop]", {
          scaleY: 0,
          transformOrigin: "top",
          duration: 1.4,
          ease: "expo.out",
          scrollTrigger: { trigger: "[data-drop]", start: "top 85%", once: true },
        });
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
      aria-labelledby="statement-title"
      className="surface-light relative z-10 bg-paper-warm px-5 pt-10 pb-28 md:px-10 md:pb-40"
    >
      {/* Rises over the hero; motion-only so it never covers the static hero. */}
      <ArcTop
        className="bg-paper-warm"
        height={heroMode === "scrub" ? "35vh" : "24vh"}
        width="150vw"
        motionOnly
        grow={heroMode === "video"}
      />

      <SectionLabel index="00">FernGrid Energy</SectionLabel>
      <h2 id="statement-title" className="sr-only">
        {FRAGMENTS.statement}
      </h2>

      <div className="relative mx-auto mt-6 aspect-square w-[min(92vw,820px)]">
        <svg data-ring viewBox="0 0 1000 1000" aria-hidden className="absolute inset-0 size-full overflow-visible">
          <defs>
            <path
              id="statement-ring"
              d={`M 500 ${500 - R} a ${R} ${R} 0 1 1 -0.01 0`}
              fill="none"
            />
          </defs>
          <circle cx="500" cy="500" r={R - 46} fill="none" stroke="currentColor" strokeOpacity="0.14" />
          <text className="font-display fill-current text-[56px] tracking-[0.04em]">
            <textPath href="#statement-ring" textLength={CIRC - 6} lengthAdjust="spacing">
              {RING_TEXT}
            </textPath>
          </text>
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div data-mark className="w-[30%]">
            <Image src={logoMark} alt="" sizes="260px" className="h-auto w-full" />
          </div>
        </div>
      </div>

      {/* Thin line dropping from the mark */}
      <div className="flex justify-center">
        <span data-drop aria-hidden className="block h-24 w-px bg-carbon/40 md:h-36" />
      </div>

      <nav aria-label="On this page" data-cols className="mx-auto mt-10 max-w-6xl">
        <ul className="grid gap-8 md:grid-cols-3 md:gap-10">
          {COLUMNS.map((c) => (
            <li key={c.href} data-col>
              <a href={c.href} className="group block">
                <span className="text-label text-muted">{c.index} /</span>
                <span className="font-display mt-2 block text-[clamp(2rem,3.4vw,3rem)] leading-none uppercase">
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
