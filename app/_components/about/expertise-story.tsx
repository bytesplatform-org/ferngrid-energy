"use client";

import Image from "next/image";
import { Fragment, useRef, useState } from "react";
import { ABOUT, ABOUT_FRAGMENTS } from "@/lib/content";
import { ArcSurface } from "../motion/arc-surface";
import { gsap, ScrollTrigger, SplitText, useGSAP, MQ } from "../motion/gsap";
import { cx } from "../ui/primitives";
import logoMark from "@/public/images/logo-mark.png";

/** Scroll distance (viewport heights) the story stays pinned for. */
const PIN_VH = 6;
/** Scroll distance (viewport heights) of the approach, from "top 80%" to the pin. */
const APPROACH_VH = 0.8;

const { heading, paragraphs } = ABOUT.expertise;
/** Paragraph 2, in its three sentences (highlighted in turn). */
const P2 = paragraphs[1].split(/(?<=\.) /);

/* Network (beat 2): FernGrid in the middle, the three sectors around it (0–100 box). */
const HUB = { x: 50, y: 52 };
const SECTORS = [
  { x: 50, y: 12, align: "center" },
  { x: 13, y: 80, align: "left" },
  { x: 87, y: 80, align: "right" },
] as const;

/* Evolution path (beat 3), 0–100 box. */
const PATH = "M 8 78 C 26 78, 26 50, 44 50 S 66 22, 92 22";
const STOPS = [
  { x: 8, y: 78 },
  { x: 44, y: 50 },
  { x: 92, y: 22 },
] as const;

/* Venn (beat 4): final centres, 0–100 box, and where each flies in from. */
const VENN = [
  { x: 50, y: 34, from: { x: 0, y: -60 } },
  { x: 35, y: 61, from: { x: -60, y: 40 } },
  { x: 65, y: 61, from: { x: 60, y: 40 } },
] as const;

/** Static layout (no JS / reduced motion). */
function StaticLayout() {
  return (
    <div className="mx-auto grid max-w-[1400px] gap-10 px-5 pb-28 md:px-10 lg:grid-cols-12">
      <h2
        id="expertise-title"
        className="font-condensed text-condensed-xl uppercase lg:col-span-5"
      >
        {heading}
      </h2>
      <div className="space-y-6 text-base leading-relaxed text-muted md:text-lg lg:col-span-6 lg:col-start-7">
        {paragraphs.map((p) => (
          <p key={p.slice(0, 20)}>{p}</p>
        ))}
      </div>
    </div>
  );
}

/**
 * "Built on Power Systems Expertise" — a pinned story in four beats. The
 * paragraphs (verbatim) change on the right; the left stage illustrates each:
 * 1. Founded in 2026: the year rolls in like an odometer over a decade ruler.
 * 2. The sectors (Utilities, ISOs, software companies) wire up to FernGrid.
 * 3. Custom tools → software → NERC BAL-007-1: a path draws itself.
 * 4. Operational experience, power systems expertise and software development
 *    knowledge fly in as three circles and overlap on the FernGrid mark.
 */
export function ExpertiseStory() {
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

      // Paragraph lines, masked (padding keeps descenders inside the masks).
      const splits = q("[data-para]").map((el) =>
        SplitText.create(el, { type: "lines", mask: "lines" }),
      );
      splits.forEach((s) =>
        gsap.set(s.masks, {
          paddingBottom: "0.2em",
          marginBottom: "-0.2em",
          paddingTop: "0.05em",
          marginTop: "-0.05em",
        }),
      );
      const [l1, l2, l3] = splits.map((s) => s.lines);

      // Explicit starting states for every staggered target.
      gsap.set(q("[data-head-word]"), { yPercent: 110 });
      gsap.set([...l1, ...l2, ...l3], { yPercent: 110 });
      gsap.set(q("[data-sentence]"), { opacity: 0.32 });
      // beat 1 is on stage from the start (the year waits at 0000); the rest come in later
      gsap.set(q("[data-beat]:not([data-beat='0'])"), { autoAlpha: 0 });
      gsap.set(q("[data-tick]"), { scaleY: 0 });
      gsap.set(q("[data-link]"), { strokeDashoffset: 1 });
      gsap.set(q("[data-node]"), { scale: 0, transformOrigin: "50% 50%" });
      gsap.set(q("[data-node-label]"), { autoAlpha: 0, y: 10 });
      gsap.set(q("[data-path]"), { strokeDashoffset: 1 });
      gsap.set(q("[data-stop]"), { scale: 0, transformOrigin: "50% 50%" });
      gsap.set(q("[data-stop-label]"), { autoAlpha: 0, y: 10 });
      gsap.set(q("[data-dot]"), { scale: 0.6, opacity: 0.35 });
      VENN.forEach((v, i) => {
        gsap.set(q(`[data-venn='${i}']`), {
          xPercent: v.from.x * 1.6,
          yPercent: v.from.y * 1.6,
          autoAlpha: 0,
          scale: 0.7,
        });
      });
      gsap.set(q("[data-venn-label]"), { autoAlpha: 0 });
      gsap.set(q("[data-venn-core]"), { scale: 0, autoAlpha: 0 });

      // Odometer: each column rolls to its digit (two full turns first).
      const year = ABOUT_FRAGMENTS.year.split("").map(Number);
      const reels = q("[data-reel]");

      // Path dot follows the evolution path.
      const pathEl = q("[data-path]")[0] as unknown as SVGPathElement;
      const traveller = q("[data-traveller]")[0] as HTMLElement;
      const along = { t: 0 };
      const placeTraveller = () => {
        const len = pathEl.getTotalLength();
        const pt = pathEl.getPointAtLength(len * along.t);
        traveller.style.left = `${pt.x}%`;
        traveller.style.top = `${pt.y}%`;
      };
      placeTraveller();

      const pinST = ScrollTrigger.create({
        trigger: stage,
        start: "top top",
        end: () => `+=${window.innerHeight * PIN_VH}`,
        pin: true,
        invalidateOnRefresh: true,
      });

      const dot = (i: number) => q(`[data-dot='${i}']`);
      const on = { scale: 1, opacity: 1, duration: 0.15 };
      const off = { scale: 0.6, opacity: 0.35, duration: 0.15 };

      const pin = gsap.timeline({ defaults: { ease: "none" } });
      pin
        // ---- beat 1: founded in 2026, a decade of experience
        .to(dot(0), on, 0);
      reels.forEach((reel, i) => {
        pin.fromTo(
          reel,
          { yPercent: 0 },
          {
            yPercent: -((20 + year[i]) / 30) * 100,
            duration: 0.7,
            ease: "power3.out",
          },
          0.05 + i * 0.06,
        );
      });
      pin
        .to(
          q("[data-tick]"),
          { scaleY: 1, duration: 0.08, stagger: 0.045, ease: "power2.out" },
          0.3,
        )
        .fromTo(
          q("[data-caption]"),
          { autoAlpha: 0, y: 14 },
          { autoAlpha: 1, y: 0, duration: 0.2 },
          0.75,
        )
        // ---- beat 2: the sectors wire up to FernGrid
        .to(
          q("[data-beat='0']"),
          { autoAlpha: 0, y: -40, duration: 0.25, ease: "power2.in" },
          1.25,
        )
        .to(
          l1,
          { yPercent: -110, duration: 0.25, stagger: 0.03, ease: "power2.in" },
          1.25,
        )
        .to(
          l2,
          { yPercent: 0, duration: 0.3, stagger: 0.04, ease: "power3.out" },
          1.45,
        )
        .to(
          q("[data-sentence='0'], [data-sentence='1']"),
          { opacity: 1, duration: 0.25 },
          1.6,
        )
        .to(dot(0), off, 1.3)
        .to(dot(1), on, 1.3)
        .fromTo(
          q("[data-beat='1']"),
          { autoAlpha: 0 },
          { autoAlpha: 1, duration: 0.1 },
          1.45,
        )
        .to(
          q("[data-hub]"),
          { scale: 1, duration: 0.25, ease: "back.out(2)" },
          1.5,
        )
        .to(
          q("[data-link]"),
          {
            strokeDashoffset: 0,
            duration: 0.35,
            stagger: 0.1,
            ease: "power2.inOut",
          },
          1.6,
        )
        .to(
          q("[data-sector]"),
          { scale: 1, duration: 0.2, stagger: 0.1, ease: "back.out(3)" },
          1.85,
        )
        .to(
          q("[data-node-label]"),
          { autoAlpha: 1, y: 0, duration: 0.2, stagger: 0.1 },
          1.9,
        )
        // ---- beat 3: custom tools → software → NERC BAL-007-1
        .to(
          q("[data-beat='1']"),
          { autoAlpha: 0, scale: 0.92, duration: 0.25, ease: "power2.in" },
          2.6,
        )
        .to(
          q("[data-sentence='0'], [data-sentence='1']"),
          { opacity: 0.32, duration: 0.2 },
          2.6,
        )
        .to(q("[data-sentence='2']"), { opacity: 1, duration: 0.25 }, 2.7)
        .to(dot(1), off, 2.6)
        .to(dot(2), on, 2.6)
        .fromTo(
          q("[data-beat='2']"),
          { autoAlpha: 0 },
          { autoAlpha: 1, duration: 0.1 },
          2.8,
        )
        .to(
          q("[data-path]"),
          { strokeDashoffset: 0, duration: 0.8, ease: "power1.inOut" },
          2.85,
        )
        .fromTo(
          along,
          { t: 0 },
          {
            t: 1,
            duration: 0.8,
            ease: "power1.inOut",
            onUpdate: placeTraveller,
          },
          2.85,
        );
      q("[data-stop]").forEach((stop, i) => {
        const at = 2.85 + i * 0.37;
        pin
          .to(stop, { scale: 1, duration: 0.15, ease: "back.out(3)" }, at)
          .to(
            q(`[data-stop-label='${i}']`),
            { autoAlpha: 1, y: 0, duration: 0.2 },
            at + 0.03,
          );
      });
      pin
        // ---- beat 4: three strands combine into FernGrid
        .to(
          q("[data-beat='2']"),
          { autoAlpha: 0, y: -40, duration: 0.25, ease: "power2.in" },
          4.1,
        )
        .to(
          l2,
          { yPercent: -110, duration: 0.25, stagger: 0.02, ease: "power2.in" },
          4.1,
        )
        .to(
          l3,
          { yPercent: 0, duration: 0.3, stagger: 0.04, ease: "power3.out" },
          4.3,
        )
        .to(dot(2), off, 4.1)
        .to(dot(3), on, 4.1)
        .fromTo(
          q("[data-beat='3']"),
          { autoAlpha: 0 },
          { autoAlpha: 1, duration: 0.1 },
          4.25,
        )
        .to(
          q("[data-venn]"),
          {
            xPercent: 0,
            yPercent: 0,
            autoAlpha: 1,
            scale: 1,
            duration: 0.55,
            stagger: 0.08,
            ease: "power3.out",
          },
          4.3,
        )
        .to(
          q("[data-venn-label]"),
          { autoAlpha: 1, duration: 0.2, stagger: 0.08 },
          4.75,
        )
        .to(
          q("[data-venn-core]"),
          { scale: 1, autoAlpha: 1, duration: 0.3, ease: "back.out(2)" },
          4.95,
        )
        .to({}, { duration: 0.5 }); // hold on the finished scene

      // Approach: heading rises and the first paragraph comes in as the section arrives.
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
            stagger: approach * 0.06,
            ease: "power3.out",
          },
          approach * 0.15,
        )
        .fromTo(
          q("[data-head-rule]"),
          { scaleX: 0 },
          { scaleX: 1, duration: approach * 0.4 },
          approach * 0.4,
        )
        .to(
          l1,
          {
            yPercent: 0,
            duration: approach * 0.4,
            stagger: approach * 0.06,
            ease: "power3.out",
          },
          approach * 0.45,
        )
        .add(pin, approach);

      ScrollTrigger.sort();
      ScrollTrigger.refresh();
      return () => {
        pinST.kill();
        splits.forEach((s) => s.revert());
      };
    },
    { scope: ref, dependencies: [story], revertOnUpdate: true },
  );

  return (
    <section
      ref={ref}
      id="expertise"
      aria-labelledby="expertise-title"
      className={cx(
        "surface-light arc-next relative z-10",
        !story && "arc-prev",
      )}
      // story: the stage starts right under the arc, and the space for the next
      // section's arc sits below the pinned stage, so the pin has ended before
      // that arc rises (the content then slides away at parallax speed).
      style={
        story
          ? {
              paddingTop: "var(--arc-depth)",
              paddingBottom: "var(--arc-depth)",
            }
          : undefined
      }
    >
      <ArcSurface tone="paper" parallax="[data-ah-inner]" />

      {!story ? (
        <StaticLayout />
      ) : (
        <div data-stage className="relative h-svh overflow-x-clip">
          {/* Inner wrapper: the next section's parallax moves this, never the pinned stage. */}
          <div
            data-exp-inner
            className="absolute inset-0 flex flex-col gap-5 px-5 pt-[clamp(5rem,11svh,7.5rem)] pb-6 md:px-10 lg:grid lg:grid-cols-12 lg:items-center lg:gap-10 lg:pb-10"
          >
            {/* ---------------- Stage (left) ---------------- */}
            <div className="relative mx-auto aspect-square w-full max-w-[min(100%,34svh)] shrink-0 lg:col-span-6 lg:max-w-[min(100%,72svh)]">
              {/* Beat 1: odometer + decade ruler */}
              <div
                data-beat="0"
                className="absolute inset-0 flex flex-col items-center justify-center"
              >
                <p className="text-label text-muted">
                  {ABOUT_FRAGMENTS.founded}
                </p>
                <p
                  aria-label={ABOUT_FRAGMENTS.year}
                  className="font-condensed mt-2 flex text-[clamp(4.5rem,13vw,12rem)] leading-none"
                >
                  {ABOUT_FRAGMENTS.year.split("").map((_, i) => (
                    <span
                      key={i}
                      aria-hidden
                      className="relative block h-[1em] overflow-hidden"
                    >
                      <span data-reel className="block">
                        {Array.from({ length: 30 }, (_, k) => (
                          <span
                            key={k}
                            className={cx(
                              "block h-[1em]",
                              i === 3 && k === 26 && "text-fern",
                            )}
                          >
                            {k % 10}
                          </span>
                        ))}
                      </span>
                    </span>
                  ))}
                </p>
                {/* a decade ruler: ten ticks, then one more ("more than a decade") */}
                <div
                  aria-hidden
                  className="mt-6 flex h-10 w-[80%] items-end justify-between border-b border-carbon/30"
                >
                  {Array.from({ length: 11 }, (_, i) => (
                    <span
                      key={i}
                      data-tick
                      className={cx(
                        "block w-px origin-bottom",
                        i === 10
                          ? "h-full bg-fern"
                          : i % 5 === 0
                            ? "h-3/4 bg-carbon"
                            : "h-1/2 bg-carbon/50",
                      )}
                    />
                  ))}
                </div>
                <p
                  data-caption
                  className="font-display mt-5 max-w-[24ch] text-center text-[clamp(1.1rem,1.8vw,1.6rem)] leading-tight"
                >
                  {ABOUT_FRAGMENTS.decade}
                </p>
              </div>

              {/* Beat 2: the sectors, wired to FernGrid */}
              <div data-beat="1" className="absolute inset-0">
                <svg
                  viewBox="0 0 100 100"
                  className="absolute inset-0 size-full overflow-visible"
                  aria-hidden
                >
                  {SECTORS.map((s, i) => (
                    <g key={i}>
                      <line
                        data-link
                        x1={HUB.x}
                        y1={HUB.y}
                        x2={s.x}
                        y2={s.y}
                        pathLength={1}
                        strokeDasharray="1 1"
                        className="stroke-carbon/40"
                        strokeWidth={0.4}
                      />
                      <circle r={0.9} className="fill-fern">
                        <animateMotion
                          dur={`${2.2 + i * 0.4}s`}
                          repeatCount="indefinite"
                          path={`M${s.x} ${s.y} L${HUB.x} ${HUB.y}`}
                        />
                      </circle>
                    </g>
                  ))}
                  {SECTORS.map((s, i) => (
                    <g key={`n${i}`} data-node data-sector>
                      <circle
                        cx={s.x}
                        cy={s.y}
                        r={3.2}
                        className="fill-paper stroke-carbon"
                        strokeWidth={0.5}
                      />
                      <circle cx={s.x} cy={s.y} r={1.3} className="fill-fern" />
                    </g>
                  ))}
                  <g data-node data-hub>
                    <circle
                      cx={HUB.x}
                      cy={HUB.y}
                      r={13}
                      className="fill-paper stroke-fern"
                      strokeWidth={0.6}
                    />
                    <circle
                      cx={HUB.x}
                      cy={HUB.y}
                      r={16.5}
                      fill="none"
                      className="stroke-fern/40"
                      strokeWidth={0.3}
                      strokeDasharray="1 1.4"
                    />
                  </g>
                </svg>
                <div
                  data-node
                  data-hub
                  className="absolute w-[17%] -translate-x-1/2 -translate-y-1/2"
                  style={{ left: `${HUB.x}%`, top: `${HUB.y}%` }}
                >
                  <Image
                    src={logoMark}
                    alt=""
                    sizes="120px"
                    className="h-auto w-full"
                  />
                </div>
                {ABOUT_FRAGMENTS.sectors.map((label, i) => {
                  const s = SECTORS[i];
                  return (
                    <p
                      key={label}
                      data-node-label
                      className={cx(
                        "text-label absolute max-w-[14ch] text-carbon",
                        s.align === "center" &&
                          "-translate-x-1/2 -translate-y-[170%] text-center",
                        s.align === "left" && "translate-y-[90%] text-left",
                        s.align === "right" &&
                          "-translate-x-full translate-y-[90%] text-right",
                      )}
                      style={{ left: `${s.x}%`, top: `${s.y}%` }}
                    >
                      {label}
                    </p>
                  );
                })}
              </div>

              {/* Beat 3: the path from custom tools to NERC BAL-007-1 */}
              <div data-beat="2" className="absolute inset-0">
                <svg
                  viewBox="0 0 100 100"
                  className="absolute inset-0 size-full overflow-visible"
                  aria-hidden
                >
                  <path
                    d={PATH}
                    fill="none"
                    className="stroke-carbon/15"
                    strokeWidth={0.5}
                  />
                  <path
                    data-path
                    d={PATH}
                    fill="none"
                    pathLength={1}
                    strokeDasharray="1 1"
                    className="stroke-fern"
                    strokeWidth={0.9}
                    strokeLinecap="round"
                  />
                  {STOPS.map((s, i) => (
                    <g key={i} data-stop>
                      <circle
                        cx={s.x}
                        cy={s.y}
                        r={3}
                        className="fill-paper stroke-carbon"
                        strokeWidth={0.5}
                      />
                      <circle
                        cx={s.x}
                        cy={s.y}
                        r={1.2}
                        className="fill-carbon"
                      />
                    </g>
                  ))}
                </svg>
                <span
                  data-traveller
                  aria-hidden
                  className="absolute size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-fern ring-4 ring-fern/25"
                />
                {ABOUT_FRAGMENTS.evolution.map((label, i) => {
                  const s = STOPS[i];
                  return (
                    <p
                      key={label}
                      data-stop-label={i}
                      className={cx(
                        "font-display absolute max-w-[16ch] text-[clamp(0.95rem,1.4vw,1.3rem)] leading-tight",
                        i === 0 && "translate-y-5",
                        i === 1 && "-translate-x-1/2 translate-y-5 text-center",
                        i === 2 &&
                          "-translate-x-full -translate-y-[calc(100%+1.25rem)] text-right text-fern",
                      )}
                      style={{ left: `${s.x}%`, top: `${s.y}%` }}
                    >
                      {label}
                    </p>
                  );
                })}
              </div>

              {/* Beat 4: three strands overlap on FernGrid */}
              <div data-beat="3" className="absolute inset-0">
                {VENN.map((v, i) => (
                  <div
                    key={i}
                    data-venn={i}
                    className="absolute flex aspect-square w-[52%] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-carbon/35 bg-fern/15 mix-blend-multiply"
                    style={{ left: `${v.x}%`, top: `${v.y}%` }}
                  />
                ))}
                {ABOUT_FRAGMENTS.combine.map((label, i) => {
                  const v = VENN[i];
                  const off =
                    i === 0
                      ? { x: 0, y: -14 }
                      : i === 1
                        ? { x: -12, y: 8 }
                        : { x: 12, y: 8 };
                  return (
                    <p
                      key={label}
                      data-venn-label
                      className="text-label absolute w-[22%] -translate-x-1/2 -translate-y-1/2 text-center text-carbon"
                      style={{
                        left: `${v.x + off.x}%`,
                        top: `${v.y + off.y}%`,
                      }}
                    >
                      {label}
                    </p>
                  );
                })}
                <div
                  data-venn-core
                  className="absolute top-[52%] left-1/2 w-[15%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-paper p-[2.5%] shadow-[0_0_0_6px_rgb(135_169_107/0.35),0_18px_40px_-16px_rgb(29_34_15/0.5)]"
                >
                  <Image
                    src={logoMark}
                    alt=""
                    sizes="100px"
                    className="h-auto w-full"
                  />
                </div>
              </div>
            </div>

            {/* ---------------- Copy (right) ---------------- */}
            <div className="flex min-h-0 flex-col justify-center lg:col-span-5 lg:col-start-8">
              <h2
                id="expertise-title"
                className="font-condensed text-[clamp(2rem,4.2vw,4.6rem)] leading-[0.9] uppercase"
              >
                {heading.split(" ").map((w, i) => (
                  <Fragment key={i}>
                    {i > 0 && " "}
                    <span className="inline-block overflow-hidden pb-[0.05em] align-bottom">
                      <span data-head-word className="inline-block">
                        {w}
                      </span>
                    </span>
                  </Fragment>
                ))}
              </h2>
              <span
                data-head-rule
                aria-hidden
                className="mt-4 block h-[2px] w-20 origin-left bg-fern md:mt-6"
              />

              {/* All three paragraphs share one cell; the active one rises in. */}
              <div className="mt-5 grid text-[14px] leading-relaxed text-carbon/80 md:mt-7 md:text-[clamp(0.95rem,1.15vw,1.15rem)]">
                <p data-para className="col-start-1 row-start-1">
                  {paragraphs[0]}
                </p>
                <p data-para className="col-start-1 row-start-1">
                  {P2.map((s, i) => (
                    <Fragment key={i}>
                      {i > 0 && " "}
                      <span data-sentence={i}>{s}</span>
                    </Fragment>
                  ))}
                </p>
                <p data-para className="col-start-1 row-start-1">
                  {paragraphs[2]}
                </p>
              </div>

              {/* Beat dots */}
              <div aria-hidden className="mt-8 hidden gap-2 lg:flex">
                {[0, 1, 2, 3].map((i) => (
                  <span
                    key={i}
                    data-dot={i}
                    className="block size-2 rounded-full bg-carbon"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
