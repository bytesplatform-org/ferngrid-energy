"use client";

import Image from "next/image";
import { useRef } from "react";
import { FEST_PAGE, SITE } from "@/lib/content";
import { gsap, useGSAP, MQ } from "../motion/gsap";
import { introPending, onIntro } from "../motion/intro";
import turbineImg from "@/public/images/fest-2.webp";

/**
 * "Fuel and Energy Security Tool" as two lines, each word split into its
 * initial (part of F E S T) and the rest (which starts collapsed). Trailing
 * spaces live in the rests, so the collapsed state reads as a tight monogram:
 *   F E      →   Fuel and Energy
 *   S T      →   Security Tool
 */
const LINES = [
  [
    { initial: "F", rest: "uel and " },
    { initial: "E", rest: "nergy" },
  ],
  [
    { initial: "S", rest: "ecurity " },
    { initial: "T", rest: "ool" },
  ],
] as const;
const DRIFT = 22;
const SIZE = "clamp(5rem, min(26vw, 34svh), 22rem)";

/**
 * FEST hero.
 * - Entrance (on the loader's reveal): F E / S T drop in as a 2×2 monogram.
 * - Scroll (pinned): each fern initial grows its word — "Fuel and Energy /
 *   Security Tool" — while the type scales down to fit; then the acronym
 *   settles underneath.
 * - Pointer: the photo drifts against the cursor.
 */
export function FestHero() {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const section = ref.current!;
      const q = gsap.utils.selector(section);
      const mm = gsap.matchMedia();

      mm.add(MQ.motion, () => {
        const entrance = (tl: gsap.core.Timeline, at: number) =>
          tl
            .fromTo(
              "[data-fh-img]",
              { scale: 1.3 },
              { scale: 1, duration: 1.9, ease: "expo.out" },
              at,
            )
            .fromTo(
              "[data-fh-initial]",
              { yPercent: 110, rotateX: -70, autoAlpha: 0 },
              {
                yPercent: 0,
                rotateX: 0,
                autoAlpha: 1,
                duration: 1.2,
                stagger: 0.09,
                ease: "expo.out",
              },
              at + 0.35,
            )
            .fromTo(
              "[data-fh-rule]",
              { scaleX: 0 },
              { scaleX: 1, duration: 1.2, ease: "expo.inOut" },
              at + 0.8,
            )
            .fromTo(
              "[data-fh-meta]",
              { autoAlpha: 0, y: 16 },
              {
                autoAlpha: 1,
                y: 0,
                duration: 0.9,
                stagger: 0.1,
                ease: "expo.out",
              },
              at + 1.1,
            );
        let unregister: (() => void) | undefined;
        if (introPending()) unregister = onIntro((tl) => entrance(tl, 0.5));
        else entrance(gsap.timeline({ delay: 0.1 }), 0);

        // Expansion: rests grow from 0 to their natural width; the whole phrase
        // scales so its widest line fits the screen.
        const rests = q("[data-fh-rest]") as HTMLElement[];
        gsap.set(rests, { maxWidth: 0 });

        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: "+=160%",
            pin: true,
            scrub: 0.6,
            invalidateOnRefresh: true,
          },
        });
        rests.forEach((r, i) => {
          tl.to(
            r,
            {
              maxWidth: () => r.scrollWidth + 2,
              duration: 0.3,
              ease: "power2.inOut",
            },
            0.04 + i * 0.1,
          );
        });
        // Keep the phrase fitting the screen at every moment of the expansion:
        // scale follows its live (unscaled) width.
        const phrase = q("[data-fh-phrase]")[0] as HTMLElement;
        const fitNow = () => {
          gsap.set(phrase, {
            scale: Math.min(
              1,
              (window.innerWidth * 0.9) / Math.max(1, phrase.offsetWidth),
            ),
          });
        };
        tl.eventCallback("onUpdate", fitNow);
        fitNow();
        tl.to("[data-fh-img]", { scale: 1.2, duration: 1 }, 0)
          .to("[data-fh-shade]", { opacity: 0.6, duration: 0.8 }, 0)
          .to("[data-fh-meta]", { autoAlpha: 0, duration: 0.15 }, 0.05)
          .to("[data-fh-rule]", { scaleX: 0, duration: 0.2 }, 0.05)
          .fromTo(
            "[data-fh-acronym]",
            { autoAlpha: 0, y: 30, letterSpacing: "1.2em" },
            {
              autoAlpha: 1,
              y: 0,
              letterSpacing: "0.45em",
              duration: 0.3,
              ease: "power3.out",
            },
            0.62,
          )
          .to({}, { duration: 0.15 });

        return () => unregister?.();
      });

      mm.add(`${MQ.motion} and (hover: hover) and (pointer: fine)`, () => {
        const ease = { duration: 1.4, ease: "power3.out" };
        const ix = gsap.quickTo("[data-fh-drift]", "x", ease);
        const iy = gsap.quickTo("[data-fh-drift]", "y", ease);
        const onMove = (e: PointerEvent) => {
          if (section.getBoundingClientRect().bottom <= 0) return;
          ix(-(e.clientX / window.innerWidth - 0.5) * 2 * DRIFT);
          iy(-(e.clientY / window.innerHeight - 0.5) * 2 * DRIFT);
        };
        window.addEventListener("pointermove", onMove, { passive: true });
        return () => window.removeEventListener("pointermove", onMove);
      });
    },
    { scope: ref },
  );

  return (
    <section
      ref={ref}
      aria-labelledby="fest-title"
      className="surface-dark relative z-0 h-[calc(100svh+var(--arc-depth))] min-h-[calc(560px+var(--arc-depth))] overflow-hidden bg-carbon-deep"
    >
      <div data-fh-inner className="absolute inset-0">
        <div
          data-fh-drift
          className="absolute -inset-[4%] will-change-transform"
        >
          <div data-fh-img className="absolute inset-0">
            <Image
              src={turbineImg}
              alt="Wind turbines standing in a snow-covered field beside bare trees"
              fill
              preload
              sizes="100vw"
              placeholder="blur"
              className="photo object-cover object-[50%_40%]"
            />
          </div>
        </div>
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 [background:radial-gradient(110%_80%_at_50%_45%,rgb(18_22_10/0.45)_30%,rgb(18_22_10/0.8)_100%),linear-gradient(to_bottom,rgb(18_22_10/0.7)_0%,rgb(18_22_10/0.2)_30%,rgb(18_22_10/0.3)_65%,rgb(18_22_10/0.8)_100%)]"
        />
        <div
          data-fh-shade
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-carbon-deep opacity-0"
        />

        <div className="absolute inset-x-0 top-0 h-svh min-h-[560px]">
          <h1 id="fest-title" className="sr-only">
            {FEST_PAGE.title} {FEST_PAGE.acronym}
          </h1>

          <div
            aria-hidden
            className="absolute inset-0 flex flex-col items-center justify-center px-5 [perspective:900px]"
          >
            <div
              data-fh-phrase
              className="font-condensed text-center leading-[0.84] text-paper uppercase"
              style={{ fontSize: SIZE }}
            >
              {LINES.map((line, l) => (
                <span key={l} className="block whitespace-nowrap">
                  {line.map((w) => (
                    <span key={w.initial}>
                      <span data-fh-initial className="inline-block text-fern">
                        {w.initial}
                      </span>
                      <span
                        data-fh-rest
                        className="inline-block overflow-hidden align-bottom whitespace-pre"
                      >
                        {w.rest}
                      </span>
                    </span>
                  ))}
                </span>
              ))}
            </div>
            <p
              data-fh-acronym
              className="font-condensed mt-[4svh] pl-[0.45em] text-[clamp(1.4rem,2.6vw,2.6rem)] leading-none tracking-[0.45em] text-paper/80 motion-safe:[.js_&]:invisible motion-safe:[.js_&]:opacity-0"
            >
              {FEST_PAGE.acronym}
            </p>
          </div>

          {/* Bottom bar */}
          <div className="absolute inset-x-0 bottom-0 flex items-center gap-4 px-5 pb-6 md:gap-8 md:px-10 md:pb-10">
            <p data-fh-meta className="text-label text-paper/70">
              {SITE.name}
            </p>
            <span
              data-fh-rule
              aria-hidden
              className="h-px flex-1 origin-center bg-paper/30"
            />
            <p data-fh-meta className="text-label text-fern">
              {FEST_PAGE.title}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
