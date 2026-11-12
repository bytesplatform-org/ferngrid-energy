"use client";

import Image from "next/image";
import { useRef } from "react";
import { NERC, NERC_FRAGMENTS, SITE } from "@/lib/content";
import { gsap, useGSAP, MQ } from "../motion/gsap";
import { introPending, onIntro } from "../motion/intro";
import plantImg from "@/public/images/fest-1.webp";

const TITLE = NERC.title.split("");
const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-/#";
const DRIFT = 22;

/**
 * NERC BAL-007-1 hero.
 * - Entrance (on the loader's reveal): the standard's name decodes in like a
 *   readout, each character cycling through glyphs before it locks.
 * - Scroll (pinned): a fern scan-line sweeps down the screen; everything above
 *   it has already turned into the requirement it introduces ("As of April 2027,
 *   NERC Standard BAL-007-1 will require…").
 * - Pointer: the photo drifts against the cursor.
 */
export function NercHero() {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const section = ref.current!;
      const q = gsap.utils.selector(section);
      const mm = gsap.matchMedia();

      mm.add(MQ.motion, () => {
        const glyphs = q("[data-glyph]") as HTMLElement[];
        const decode = { p: 0 };
        const renderDecode = () => {
          glyphs.forEach((g, i) => {
            const lockAt = 0.25 + (i / glyphs.length) * 0.65;
            const final = TITLE[i];
            if (final === " " || decode.p >= lockAt) {
              g.textContent = final;
              g.dataset.locked = "1";
            } else {
              g.textContent = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
              g.dataset.locked = "";
            }
          });
        };
        const entrance = (tl: gsap.core.Timeline, at: number) =>
          tl
            .fromTo(
              "[data-nh-img]",
              { scale: 1.3 },
              { scale: 1, duration: 1.9, ease: "expo.out" },
              at,
            )
            .fromTo(
              "[data-nh-title]",
              { autoAlpha: 0 },
              { autoAlpha: 1, duration: 0.2 },
              at + 0.3,
            )
            .fromTo(
              decode,
              { p: 0 },
              { p: 1, duration: 1.4, ease: "none", onUpdate: renderDecode },
              at + 0.3,
            )
            .fromTo(
              "[data-nh-rule]",
              { scaleX: 0 },
              { scaleX: 1, duration: 1.2, ease: "expo.inOut" },
              at + 0.8,
            )
            .fromTo(
              "[data-nh-meta]",
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

        // Scan: the line sweeps down; above it the requirement, below it the title.
        const scan = { p: 0 };
        const renderScan = () => {
          const pct = scan.p * 100;
          (q("[data-nh-before]")[0] as HTMLElement).style.clipPath =
            `inset(${pct}% 0 0 0)`;
          (q("[data-nh-after]")[0] as HTMLElement).style.clipPath =
            `inset(0 0 ${100 - pct}% 0)`;
          (q("[data-nh-scan]")[0] as HTMLElement).style.top = `${pct}%`;
        };
        renderScan();
        gsap
          .timeline({
            defaults: { ease: "none" },
            scrollTrigger: {
              trigger: section,
              start: "top top",
              end: "+=150%",
              pin: true,
              scrub: 0.6,
            },
          })
          .fromTo(
            "[data-nh-scan]",
            { autoAlpha: 0 },
            { autoAlpha: 1, duration: 0.05 },
            0,
          )
          .fromTo(
            scan,
            { p: 0 },
            {
              p: 1,
              duration: 0.75,
              ease: "power1.inOut",
              onUpdate: renderScan,
            },
            0.02,
          )
          .to("[data-nh-scan]", { autoAlpha: 0, duration: 0.08 }, 0.77)
          .to("[data-nh-img]", { scale: 1.25, duration: 1 }, 0)
          .to("[data-nh-shade]", { opacity: 0.88, duration: 0.8 }, 0)
          .to("[data-nh-meta]", { autoAlpha: 0, duration: 0.15 }, 0.05)
          .to("[data-nh-rule]", { scaleX: 0, duration: 0.2 }, 0.05)
          .fromTo(
            "[data-nh-asof]",
            { backgroundSize: "0% 100%" },
            { backgroundSize: "100% 100%", duration: 0.15 },
            0.8,
          )
          .to({}, { duration: 0.12 });

        return () => unregister?.();
      });

      mm.add(`${MQ.motion} and (hover: hover) and (pointer: fine)`, () => {
        const ease = { duration: 1.4, ease: "power3.out" };
        const ix = gsap.quickTo("[data-nh-drift]", "x", ease);
        const iy = gsap.quickTo("[data-nh-drift]", "y", ease);
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

  const asOf = NERC_FRAGMENTS.asOf;
  const rest = NERC_FRAGMENTS.requireLine.slice(asOf.length);

  return (
    <section
      ref={ref}
      aria-labelledby="nerc-title"
      className="surface-dark relative z-0 h-[calc(100svh+var(--arc-depth))] min-h-[calc(560px+var(--arc-depth))] overflow-hidden bg-carbon-deep"
    >
      <div data-nh-inner className="absolute inset-0">
        <div
          data-nh-drift
          className="absolute -inset-[4%] will-change-transform"
        >
          <div data-nh-img className="absolute inset-0">
            <Image
              src={plantImg}
              alt="Power plant with smoking stacks in a snowy valley"
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
          className="pointer-events-none absolute inset-0 [background:radial-gradient(110%_80%_at_50%_45%,rgb(18_22_10/0.25)_30%,rgb(18_22_10/0.7)_100%),linear-gradient(to_bottom,rgb(18_22_10/0.7)_0%,rgb(18_22_10/0.2)_30%,rgb(18_22_10/0.3)_65%,rgb(18_22_10/0.8)_100%)]"
        />
        {/* faint measurement grid */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.08] [background-image:linear-gradient(to_right,var(--color-paper)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-paper)_1px,transparent_1px)] [background-size:clamp(40px,6vw,96px)_clamp(40px,6vw,96px)]"
        />
        <div
          data-nh-shade
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-carbon-deep opacity-0"
        />

        <div className="absolute inset-x-0 top-0 h-svh min-h-[560px]">
          <h1 id="nerc-title" className="sr-only">
            {NERC.title}
          </h1>

          {/* Below the scan line: the standard's name */}
          <div
            data-nh-before
            aria-hidden
            className="absolute inset-0 flex items-center justify-center px-5"
          >
            <p
              data-nh-title
              className="font-condensed flex text-[clamp(3.2rem,13vw,15rem)] leading-none whitespace-nowrap text-paper uppercase"
            >
              {TITLE.map((c, i) => (
                <span
                  key={i}
                  className="relative inline-grid"
                  style={{ whiteSpace: "pre" }}
                >
                  {/* the final glyph reserves the width; the scrambling glyph sits on top */}
                  <span className="invisible col-start-1 row-start-1">{c}</span>
                  <span
                    data-glyph
                    className="col-start-1 row-start-1 text-center data-[locked='']:text-fern"
                  >
                    {c}
                  </span>
                </span>
              ))}
            </p>
          </div>

          {/* Above the scan line: the requirement it introduces (hidden until the sweep) */}
          <div
            data-nh-after
            aria-hidden
            className="absolute inset-0 hidden items-center justify-center px-5 motion-safe:[.js_&]:flex"
            style={{ clipPath: "inset(0 0 100% 0)" }}
          >
            <p className="font-display max-w-[24ch] text-center text-[clamp(1.8rem,4.2vw,4.4rem)] leading-[1.08] text-balance text-paper">
              <span
                data-nh-asof
                className="bg-[linear-gradient(rgb(135_169_107/0.35),rgb(135_169_107/0.35))] bg-[length:0%_100%] bg-no-repeat px-[0.12em] text-fern"
              >
                {asOf}
              </span>
              {rest}
            </p>
          </div>

          {/* The scan line */}
          <div
            data-nh-scan
            aria-hidden
            className="pointer-events-none invisible absolute inset-x-0 top-0 h-0 opacity-0"
          >
            <span className="absolute inset-x-0 -top-px block h-[2px] bg-fern shadow-[0_0_24px_4px_rgb(135_169_107/0.7)]" />
            <span className="absolute inset-x-0 -top-24 block h-24 bg-gradient-to-t from-fern/20 to-transparent" />
          </div>

          {/* Bottom bar */}
          <div className="absolute inset-x-0 bottom-0 flex items-center gap-4 px-5 pb-6 md:gap-8 md:px-10 md:pb-10">
            <p data-nh-meta className="text-label text-paper/70">
              {SITE.name}
            </p>
            <span
              data-nh-rule
              aria-hidden
              className="h-px flex-1 origin-center bg-paper/30"
            />
            <p data-nh-meta className="text-label text-fern">
              {asOf}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
