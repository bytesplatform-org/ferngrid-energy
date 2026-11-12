"use client";

import { Fragment, useRef, useState } from "react";
import { FRAGMENTS, NERC, NERC_FRAGMENTS } from "@/lib/content";
import { ArcSurface } from "../motion/arc-surface";
import { gsap, ScrollTrigger, SplitText, useGSAP, MQ } from "../motion/gsap";
import { cx } from "../ui/primitives";

const PIN_VH = 5;
const APPROACH_VH = 0.8;
const { heading, body } = NERC.eraDifference;

/** Hour cells in the strip, and each hour's stored-fuel level (a slow, uneven drawdown; illustrative, no values). */
const HOURS = 36;
const LEVELS = Array.from({ length: HOURS }, (_, i) => {
  const t = i / (HOURS - 1);
  return Math.max(
    0.16,
    0.92 - t * 0.62 + Math.sin(i * 1.7) * 0.05 + (i % 9 === 4 ? 0.12 : 0),
  );
});

function StaticLayout() {
  return (
    <div className="mx-auto max-w-[1100px] px-5 pb-28 md:px-10">
      <h2
        id="hourly-title"
        className="font-condensed text-[clamp(2rem,4.4vw,4.4rem)] leading-[0.95] uppercase"
      >
        {heading}
      </h2>
      <p className="mt-8 text-base leading-relaxed text-paper/80 md:text-lg">
        {body}
      </p>
    </div>
  );
}

/**
 * "How are Energy Reliability Assessments Different than Existing Studies?"
 * Pinned, on dark:
 * 0. The question and the paragraph (verbatim) rise in.
 * 1. Capacity: one snapshot frame rises in as the question blurs away — "at a point in time".
 * 2. Energy: the frame multiplies into an hour-by-hour strip that slides past;
 *    a playhead checks every hour while the stored-fuel bars step down in turn —
 *    "enough energy for every hour".
 * (Illustrative only: no values, no axes.)
 */
export function HourlyStory() {
  const ref = useRef<HTMLElement>(null);
  const [story, setStory] = useState(false);

  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add(MQ.motion, () => {
      setStory(true);
      return () => setStory(false);
    });
  });

  useGSAP(
    () => {
      const section = ref.current;
      const stage = section?.querySelector<HTMLElement>("[data-stage]");
      if (!story || !section || !stage) return;
      const q = gsap.utils.selector(section);

      const split = SplitText.create(q("[data-para]")[0], {
        type: "lines",
        mask: "lines",
      });
      gsap.set(split.masks, {
        paddingBottom: "0.2em",
        marginBottom: "-0.2em",
        paddingTop: "0.05em",
        marginTop: "-0.05em",
      });

      gsap.set(q("[data-head-word]"), { yPercent: 110 });
      gsap.set(split.lines, { yPercent: 110 });
      gsap.set(q("[data-beat]"), { autoAlpha: 0 });
      gsap.set(q("[data-snap]"), { autoAlpha: 0, y: 70, scale: 0.92, filter: "blur(10px)" });
      gsap.set(q("[data-snap-fill]"), { scaleY: 0 });
      gsap.set(q("[data-cell]"), { autoAlpha: 0, y: 30 });
      gsap.set(q("[data-cell-check]"), { scale: 0, opacity: 0 });
      gsap.set(q("[data-line-word]"), { yPercent: 110 });

      const track = q("[data-track]")[0] as HTMLElement;
      const window_ = q("[data-window]")[0] as HTMLElement;
      const cells = q("[data-cell]") as HTMLElement[];
      const fills = q("[data-cell-fill]") as HTMLElement[];
      const checks = q("[data-cell-check]") as HTMLElement[];
      const playhead = q("[data-playhead]")[0] as HTMLElement;
      const overflow = () =>
        Math.max(0, track.scrollWidth - window_.clientWidth);

      // Fuel bars: each hour starts "full" (the previous hour's level) and steps
      // down to its own as the playhead passes — sequential, never all at once.
      const sweep = { p: 0 };
      const renderSweep = () => {
        const pos = sweep.p * (HOURS - 1);
        const x = -overflow() * sweep.p;
        track.style.transform = `translateX(${x}px)`;
        cells.forEach((_, i) => {
          const passed = pos >= i;
          const level = passed
            ? LEVELS[i]
            : i === 0
              ? LEVELS[0]
              : LEVELS[i - 1];
          fills[i].style.transform = `scaleY(${level})`;
          checks[i].style.transform = `scale(${passed ? 1 : 0})`;
          checks[i].style.opacity = passed ? "1" : "0";
        });
        const cell = cells[Math.min(HOURS - 1, Math.floor(pos))];
        if (cell)
          playhead.style.left = `${cell.offsetLeft + cell.offsetWidth / 2 + x}px`;
      };

      const pinST = ScrollTrigger.create({
        trigger: stage,
        start: "top top",
        end: () => `+=${window.innerHeight * PIN_VH}`,
        pin: true,
        invalidateOnRefresh: true,
      });

      const lineIn = (i: number, at: number) =>
        pin.to(
          q(`[data-line='${i}'] [data-line-word]`),
          { yPercent: 0, duration: 0.25, stagger: 0.03, ease: "power3.out" },
          at,
        );
      const lineOut = (i: number, at: number) =>
        pin.to(
          q(`[data-line='${i}'] [data-line-word]`),
          { yPercent: -110, duration: 0.2, stagger: 0.015, ease: "power2.in" },
          at,
        );

      const pin = gsap.timeline({ defaults: { ease: "none" } });
      pin
        // 0 → 1: the question drifts up and blurs out while, overlapping it,
        // the capacity snapshot rises in and sharpens — one continuous move.
        .to(
          q("[data-copy]"),
          { autoAlpha: 0, y: -60, filter: "blur(10px)", duration: 0.4, ease: "power2.in" },
          0.55,
        )
        .to(q("[data-beat='1']"), { autoAlpha: 1, duration: 0.05 }, 0.7)
        .to(
          q("[data-snap]"),
          { autoAlpha: 1, y: 0, scale: 1, filter: "blur(0px)", duration: 0.4, ease: "power3.out" },
          0.72,
        )
        .to(
          q("[data-snap-fill]"),
          { scaleY: 0.72, duration: 0.35, ease: "power2.out" },
          0.95,
        );
      lineIn(0, 1.0);
      pin.to({}, { duration: 0.35 }, 1.3);
      // 1 → 2: the snapshot becomes the first hour of a strip
      lineOut(0, 1.75);
      pin
        .to(
          q("[data-snap]"),
          { autoAlpha: 0, scale: 0.6, duration: 0.25, ease: "power2.in" },
          1.75,
        )
        .to(q("[data-beat='2']"), { autoAlpha: 1, duration: 0.05 }, 1.9)
        .to(
          cells,
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.3,
            stagger: 0.012,
            ease: "power3.out",
          },
          1.9,
        )
        .fromTo(
          playhead,
          { autoAlpha: 0 },
          { autoAlpha: 1, duration: 0.1 },
          2.2,
        );
      lineIn(1, 2.0);
      pin
        .fromTo(
          sweep,
          { p: 0 },
          {
            p: 1,
            duration: 1.6,
            ease: "none",
            onUpdate: renderSweep,
            immediateRender: false,
          },
          2.25,
        )
        .to(playhead, { autoAlpha: 0, duration: 0.1 }, 3.9);
      lineOut(1, 4.0);
      lineIn(2, 4.15);
      pin.to({}, { duration: 0.6 }, 4.4);

      const approach = (pin.duration() * APPROACH_VH) / PIN_VH;
      gsap
        .timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: stage,
            start: "top 80%",
            end: () => `+=${window.innerHeight * (APPROACH_VH + PIN_VH)}`,
            scrub: 0.7,
            invalidateOnRefresh: true,
          },
        })
        .to(
          q("[data-head-word]"),
          {
            yPercent: 0,
            duration: approach * 0.5,
            stagger: approach * 0.03,
            ease: "power3.out",
          },
          approach * 0.1,
        )
        .to(
          split.lines,
          {
            yPercent: 0,
            duration: approach * 0.4,
            stagger: approach * 0.05,
            ease: "power3.out",
          },
          approach * 0.45,
        )
        .add(pin, approach);

      renderSweep();
      ScrollTrigger.sort();
      ScrollTrigger.refresh();
      return () => {
        pinST.kill();
        split.revert();
      };
    },
    { scope: ref, dependencies: [story], revertOnUpdate: true },
  );

  const lines = [
    NERC_FRAGMENTS.capacityLine,
    NERC_FRAGMENTS.energyLine,
    FRAGMENTS.enoughEnergy,
  ];

  return (
    <section
      ref={ref}
      aria-labelledby="hourly-title"
      className={cx(
        "surface-dark arc-next relative z-10",
        !story && "arc-prev px-0",
      )}
      style={
        story
          ? {
              paddingTop: "var(--arc-depth)",
              paddingBottom: "var(--arc-depth)",
            }
          : undefined
      }
    >
      <ArcSurface tone="carbon-deep" parallax="[data-req-inner]" />

      {!story ? (
        <StaticLayout />
      ) : (
        <div data-stage className="relative h-svh overflow-x-clip">
          <div data-hr-inner className="absolute inset-0">
            {/* 0. The question + paragraph */}
            <div
              data-copy
              className="absolute inset-0 flex flex-col justify-center px-5 pt-16 md:px-10 lg:pl-[8vw]"
            >
              <h2
                id="hourly-title"
                className="font-condensed max-w-[22ch] text-[clamp(2rem,4.6vw,5rem)] leading-[0.92] text-paper uppercase"
              >
                {heading.split(" ").map((w, i) => (
                  <Fragment key={i}>
                    {i > 0 && " "}
                    <span className="inline-block overflow-hidden pb-[0.05em] align-bottom">
                      <span
                        data-head-word
                        className={cx(
                          "inline-block",
                          (w === "Energy" || w === "Reliability") &&
                            "text-fern",
                        )}
                      >
                        {w}
                      </span>
                    </span>
                  </Fragment>
                ))}
              </h2>
              <p
                data-para
                className="mt-6 max-w-[62ch] text-[15px] leading-relaxed text-paper/80 md:mt-8 md:text-[clamp(1rem,1.25vw,1.25rem)]"
              >
                {body}
              </p>
            </div>

            {/* Kinetic line for each beat */}
            <div
              aria-hidden
              className="absolute inset-x-0 top-[clamp(5.5rem,14svh,9rem)] grid px-5 text-center md:px-10"
            >
              {lines.map((l, i) => (
                <p
                  key={l}
                  data-line={i}
                  className={cx(
                    "font-display col-start-1 row-start-1 mx-auto max-w-[26ch] text-[clamp(1.5rem,3.4vw,3.6rem)] leading-[1.05] text-paper",
                    i === 2 && "text-fern",
                  )}
                >
                  {l.split(" ").map((w, k) => (
                    <Fragment key={k}>
                      {k > 0 && " "}
                      <span className="inline-block overflow-hidden pb-[0.08em] align-bottom">
                        <span data-line-word className="inline-block">
                          {w}
                        </span>
                      </span>
                    </Fragment>
                  ))}
                </p>
              ))}
            </div>

            {/* 1. Capacity: one snapshot */}
            <div
              data-beat="1"
              className="absolute inset-0 flex items-center justify-center pt-[16svh]"
            >
              <div
                data-snap
                className="relative flex h-[38svh] w-[min(42vw,13rem)] flex-col items-center rounded-[18px] border border-paper/25 bg-paper/5 p-4"
              >
                <p className="text-label text-paper/60">
                  {NERC_FRAGMENTS.pointInTime}
                </p>
                <div className="relative mt-4 w-10 flex-1 overflow-hidden rounded-md bg-paper/10">
                  <span
                    data-snap-fill
                    className="absolute inset-x-0 bottom-0 block h-full origin-bottom bg-paper/70"
                  />
                </div>
              </div>
            </div>

            {/* 2. Energy: every hour */}
            <div
              data-beat="2"
              className="absolute inset-0 flex flex-col justify-center pt-[16svh]"
            >
              <p className="text-label mb-4 px-5 text-paper/60 md:px-10">
                {NERC_FRAGMENTS.everyHour}
              </p>
              <div
                data-window
                className="relative overflow-hidden px-5 md:px-10"
              >
                <div
                  data-track
                  className="flex w-max gap-[clamp(6px,0.8vw,12px)] will-change-transform"
                >
                  {LEVELS.map((_, i) => (
                    <div
                      key={i}
                      data-cell
                      className="relative flex h-[34svh] w-[clamp(2.4rem,4.4vw,4.2rem)] flex-col items-center justify-end rounded-[12px] border border-paper/15 bg-paper/[0.04] p-1.5"
                    >
                      <span
                        data-cell-check
                        aria-hidden
                        className="absolute top-2 size-2.5 rounded-full bg-fern shadow-[0_0_10px_2px_rgb(135_169_107/0.6)]"
                      />
                      <div className="relative h-[80%] w-full overflow-hidden rounded-[8px] bg-paper/10">
                        <span
                          data-cell-fill
                          className="absolute inset-x-0 bottom-0 block h-full origin-bottom bg-fern/80"
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <span
                  data-playhead
                  aria-hidden
                  className="pointer-events-none absolute top-0 -bottom-3 w-px -translate-x-1/2 bg-paper/80 shadow-[0_0_14px_2px_rgb(248_249_247/0.5)]"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
