"use client";

import Image from "next/image";
import { Fragment, useRef, useState } from "react";
import { ABOUT, ABOUT_FRAGMENTS } from "@/lib/content";
import { ArcSurface } from "../motion/arc-surface";
import { gsap, ScrollTrigger, SplitText, useGSAP, MQ } from "../motion/gsap";
import { cx } from "../ui/primitives";
import logoMark from "@/public/images/logo-mark.png";

/** Scroll distance (viewport heights) the story stays pinned for. */
const PIN_VH = 4.5;
/** Scroll distance (viewport heights) of the approach, from "top 80%" to the pin. */
const APPROACH_VH = 0.8;

const { heading, paragraphs } = ABOUT.expertise;

/* Network (beat 2): FernGrid in the middle, the three sectors around it (0–100 box). */
const HUB = { x: 50, y: 52 };
const SECTORS = [
  { x: 50, y: 12, align: "center" },
  { x: 13, y: 80, align: "left" },
  { x: 87, y: 80, align: "right" },
] as const;

/** Sector node radius, and the gap between a node and its label (0–100 box). */
const NODE_R = 3.2;
const LABEL_GAP = 3;

/* Venn (beat 3): final centres, 0–100 box, and where each flies in from. */
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
 * "Built on Power Systems Expertise" — a pinned story in three beats. The
 * paragraphs (verbatim) change on the right; the left stage illustrates each:
 * 1. Founded in 2026: the year's digits rise in over a decade ruler that draws itself in.
 * 2. The sectors (Utilities, ISOs, software companies) wire up to FernGrid.
 * 3. Operational experience, power systems expertise and software development
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
      gsap.set(q("[data-year-digit]"), { yPercent: 110 });
      gsap.set([...l1, ...l2, ...l3], { yPercent: 110 });
      // beat 1 is on stage from the start; the rest come in later
      gsap.set(q("[data-beat]:not([data-beat='0'])"), { autoAlpha: 0 });
      gsap.set(q("[data-tick]"), { scaleY: 0 });
      gsap.set(q("[data-link]"), { strokeDashoffset: 1 });
      gsap.set(q("[data-node]"), { scale: 0, transformOrigin: "50% 50%" });
      gsap.set(q("[data-node-label]"), { autoAlpha: 0, y: 10 });
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
        .to(dot(0), on, 0)
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
        );
      pin
        // ---- beat 3: three strands combine into FernGrid
        .to(
          q("[data-beat='1']"),
          { autoAlpha: 0, scale: 0.92, duration: 0.25, ease: "power2.in" },
          2.6,
        )
        .to(
          l2,
          { yPercent: -110, duration: 0.25, stagger: 0.02, ease: "power2.in" },
          2.6,
        )
        .to(
          l3,
          { yPercent: 0, duration: 0.3, stagger: 0.04, ease: "power3.out" },
          2.8,
        )
        .to(dot(1), off, 2.6)
        .to(dot(2), on, 2.6)
        .fromTo(
          q("[data-beat='2']"),
          { autoAlpha: 0 },
          { autoAlpha: 1, duration: 0.1 },
          2.75,
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
          2.8,
        )
        .to(
          q("[data-venn-label]"),
          { autoAlpha: 1, duration: 0.2, stagger: 0.08 },
          3.25,
        )
        .to(
          q("[data-venn-core]"),
          { scale: 1, autoAlpha: 1, duration: 0.3, ease: "back.out(2)" },
          3.45,
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
        // the year's digits rise into place, one after another
        .to(
          q("[data-year-digit]"),
          {
            yPercent: 0,
            duration: approach * 0.45,
            stagger: approach * 0.08,
            ease: "power3.out",
          },
          approach * 0.2,
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
        <div data-stage className="pin-screen relative overflow-x-clip">
          {/* Inner wrapper: the next section's parallax moves this, never the pinned stage. */}
          <div
            data-exp-inner
            className="absolute inset-0 flex flex-col gap-5 px-5 pt-[clamp(5rem,11svh,7.5rem)] pb-6 md:px-10 lg:grid lg:grid-cols-12 lg:items-center lg:gap-10 lg:pb-10"
          >
            {/* ---------------- Stage (left) ----------------
                Phones (Revision 2): the copy keeps its natural height and the visual
                takes whatever is left (padded so its labels never reach the heading
                or the nav); its contents are sized to the box (cqw), not the screen. */}
            <div className="relative flex min-h-0 flex-1 items-center justify-center pt-6 pb-9 lg:col-span-6 lg:block lg:flex-none lg:py-0">
            <div className="relative aspect-square h-full max-h-[34svh] max-w-full [container-type:size] lg:mx-auto lg:h-auto lg:max-h-none lg:w-full lg:max-w-[min(100%,72svh)] lg:[container-type:normal]">
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
                  className="font-condensed mt-2 flex text-[30cqw] leading-none lg:text-[clamp(4.5rem,13vw,12rem)]"
                >
                  {/* the year: each digit rises from its own mask; the last in fern */}
                  {ABOUT_FRAGMENTS.year.split("").map((d, i, all) => (
                    <span
                      key={i}
                      aria-hidden
                      className="block overflow-hidden pb-[0.04em]"
                    >
                      <span
                        data-year-digit
                        className={cx("block", i === all.length - 1 && "text-fern")}
                      >
                        {d}
                      </span>
                    </span>
                  ))}
                </p>
                {/* a decade ruler: ten ticks, then one more ("more than a decade") */}
                <div
                  aria-hidden
                  className="mt-[5cqw] flex h-[11cqw] w-[80%] items-end justify-between border-b border-carbon/30 lg:mt-6 lg:h-10"
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
                  className="font-display mt-[4cqw] max-w-[24ch] text-center text-[max(0.8rem,7cqw)] leading-tight lg:mt-5 lg:text-[clamp(1.1rem,1.8vw,1.6rem)]"
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
                        r={NODE_R}
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
                      className={cx(
                        "text-label absolute max-w-[14ch] text-carbon max-lg:max-w-[11ch] max-lg:text-[8px] max-lg:tracking-[0.12em]",
                        s.align === "center" &&
                          "-translate-x-1/2 -translate-y-full text-center",
                        s.align === "left" && "text-left",
                        s.align === "right" && "-translate-x-full text-right",
                      )}
                      // Clear of the node circles (r = NODE_R): above the top node;
                      // below and out to the side for the two lower ones.
                      style={
                        s.align === "center"
                          ? { left: `${s.x}%`, top: `${s.y - NODE_R - LABEL_GAP}%` }
                          : {
                              left: `${s.align === "left" ? s.x - NODE_R - 2 : s.x + NODE_R + 2}%`,
                              top: `${s.y + NODE_R + LABEL_GAP}%`,
                            }
                      }
                    >
                      {/* Animated separately: GSAP would overwrite the positioning translate. */}
                      <span data-node-label className="block">
                        {label}
                      </span>
                    </p>
                  );
                })}
              </div>

              {/* Beat 3: three strands overlap on FernGrid */}
              <div data-beat="2" className="absolute inset-0">
                {/* Positioned wrappers; the inner circles animate (GSAP would
                    otherwise overwrite the centring translate). */}
                {VENN.map((v, i) => (
                  <div
                    key={i}
                    className="absolute aspect-square w-[52%] -translate-x-1/2 -translate-y-1/2 mix-blend-multiply"
                    style={{ left: `${v.x}%`, top: `${v.y}%` }}
                  >
                    <div
                      data-venn={i}
                      className="size-full rounded-full border border-carbon/35 bg-fern/15"
                    />
                  </div>
                ))}
                {ABOUT_FRAGMENTS.combine.map((label, i) => {
                  const v = VENN[i];
                  // As near each bubble's centre as the label can sit while staying
                  // clear of the other two circles (0–100 box).
                  const off =
                    i === 0
                      ? { x: 0, y: -6 }
                      : i === 1
                        ? { x: -7, y: 3 }
                        : { x: 7, y: 3 };
                  return (
                    <p
                      key={label}
                      data-venn-label
                      className="text-label absolute w-[22%] -translate-x-1/2 -translate-y-1/2 text-center text-carbon max-md:text-[8px] max-md:tracking-[0.12em]"
                      style={{
                        left: `${v.x + off.x}%`,
                        top: `${v.y + off.y}%`,
                      }}
                    >
                      {label}
                    </p>
                  );
                })}
                {/* the logo, on the centre of the three overlaps */}
                <div className="absolute top-[52%] left-1/2 w-[15%] -translate-x-1/2 -translate-y-1/2">
                  <div
                    data-venn-core
                    className="rounded-full bg-paper p-[17%] shadow-[0_0_0_6px_rgb(135_169_107/0.35),0_18px_40px_-16px_rgb(18_22_10/0.5)]"
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
            </div>

            </div>

            {/* ---------------- Copy (right) ---------------- */}
            <div className="flex shrink-0 flex-col justify-center lg:col-span-5 lg:col-start-8 lg:min-h-0 lg:shrink">
              <h2
                id="expertise-title"
                className="font-condensed text-[clamp(1.75rem,4.2vw,4.6rem)] leading-[0.9] uppercase"
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
                className="mt-3 block h-[2px] w-20 origin-left bg-fern md:mt-6"
              />

              {/* All three paragraphs share one cell; the active one rises in. */}
              <div className="mt-3 grid text-[12.5px] leading-[1.55] text-carbon/80 md:mt-7 md:leading-relaxed md:text-[clamp(0.95rem,1.15vw,1.15rem)]">
                <p data-para className="col-start-1 row-start-1">
                  {paragraphs[0]}
                </p>
                <p data-para className="col-start-1 row-start-1">
                  {paragraphs[1]}
                </p>
                <p data-para className="col-start-1 row-start-1">
                  {paragraphs[2]}
                </p>
              </div>

              {/* Beat dots */}
              <div aria-hidden className="mt-8 hidden gap-2 lg:flex">
                {[0, 1, 2].map((i) => (
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
