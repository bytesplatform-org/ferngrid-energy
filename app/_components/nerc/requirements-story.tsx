"use client";

import { Fragment, useRef, useState } from "react";
import { NERC, NERC_FRAGMENTS } from "@/lib/content";
import { ArcSurface } from "../motion/arc-surface";
import { gsap, ScrollTrigger, SplitText, useGSAP, MQ } from "../motion/gsap";
import { cx } from "../ui/primitives";

const PIN_VH = 6;
const APPROACH_VH = 0.8;
const { heading, intro, accountFor, scenariosIntro, stressScenarios } =
  NERC.requirements;

/** The scenarios sentence, with the EEA phrase picked out. */
const [eeaBefore, eeaAfter] = scenariosIntro.split(NERC_FRAGMENTS.eea);

/* Stress diagram (0–100 box): base in the middle, four stresses around it. */
const STRESS_POS = [
  { x: 18, y: 18 },
  { x: 82, y: 18 },
  { x: 18, y: 82 },
  { x: 82, y: 82 },
] as const;

function Check({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      className={cx("size-7 shrink-0 md:size-9", className)}
    >
      <circle
        cx="12"
        cy="12"
        r="11"
        className="fill-fern/15 stroke-fern"
        strokeWidth="1.2"
      />
      <path
        data-check
        d="M7 12.5 10.5 16 17 8.5"
        fill="none"
        className="stroke-carbon"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength={1}
        strokeDasharray="1 1"
      />
    </svg>
  );
}

function StaticLayout() {
  return (
    <div className="mx-auto grid max-w-[1400px] gap-10 px-5 pb-28 md:px-10 lg:grid-cols-12">
      <h2
        id="requirements-title"
        className="font-condensed text-condensed-xl uppercase lg:col-span-5"
      >
        {heading}
      </h2>
      <div className="space-y-6 text-base leading-relaxed text-muted md:text-lg lg:col-span-6 lg:col-start-7">
        <p>{intro}</p>
        <ul className="list-disc space-y-1 pl-6">
          {accountFor.map((a) => (
            <li key={a}>{a}</li>
          ))}
        </ul>
        <p>{scenariosIntro}</p>
        <ul className="list-disc space-y-1 pl-6">
          {stressScenarios.map((a) => (
            <li key={a}>{a}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/**
 * New BAL-007-1 Requirements — pinned, two acts:
 * 1. "That account for": the four requirements are dealt in as a stacked deck,
 *    each check drawing itself; then the deck fans out into a grid.
 * 2. The Scenarios: a Base Scenario (expected system conditions) in the middle,
 *    the four stress scenarios wired out from it, their pressure gauges filling.
 * The copy on the left swaps from the intro to the scenarios paragraph.
 */
export function RequirementsStory() {
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
      const [introLines, scenLines] = splits.map((s) => s.lines);

      const cards = q("[data-card]") as HTMLElement[];
      const isWide = () => window.innerWidth >= 1024;

      gsap.set(q("[data-head-word]"), { yPercent: 110 });
      gsap.set([...introLines, ...scenLines], { yPercent: 110 });
      gsap.set(cards, {
        yPercent: 140,
        rotate: (i) => [6, -5, 4, -3][i],
        autoAlpha: 0,
      });
      gsap.set(q("[data-check]"), { strokeDashoffset: 1 });
      gsap.set(q("[data-scen]"), { autoAlpha: 0 });
      gsap.set(q("[data-base]"), { scale: 0.6, autoAlpha: 0 });
      gsap.set(q("[data-wire]"), { strokeDashoffset: 1 });
      gsap.set(q("[data-stress]"), { scale: 0.5, autoAlpha: 0 });

      const pinST = ScrollTrigger.create({
        trigger: stage,
        start: "top top",
        end: () => `+=${window.innerHeight * PIN_VH}`,
        pin: true,
        invalidateOnRefresh: true,
      });

      const pin = gsap.timeline({ defaults: { ease: "none" } });

      // Act 1 — the deck: each card slides up onto the stack; earlier ones sink back.
      cards.forEach((card, i) => {
        const at = 0.1 + i * 0.42;
        pin
          .to(
            card,
            {
              yPercent: 0,
              rotate: 0,
              autoAlpha: 1,
              duration: 0.3,
              ease: "power3.out",
            },
            at,
          )
          .to(
            card.querySelector("[data-check]"),
            { strokeDashoffset: 0, duration: 0.15, ease: "power2.out" },
            at + 0.25,
          );
        for (let k = 0; k < i; k++) {
          const depth = i - k;
          pin.to(
            cards[k],
            {
              y: -depth * 18,
              scale: 1 - depth * 0.05,
              opacity: 1 - depth * 0.18,
              duration: 0.3,
              ease: "power3.out",
            },
            at,
          );
        }
      });
      // …then the deck fans out into a grid (2×2 on desktop, a column on small screens).
      const fan = 1.95;
      cards.forEach((card, i) => {
        const col = i % 2;
        const row = Math.floor(i / 2);
        pin.to(
          card,
          {
            xPercent: () => (isWide() ? (col === 0 ? -53 : 53) : 0),
            yPercent: () =>
              isWide() ? (row === 0 ? -56 : 56) : (i - 1.5) * 108,
            y: 0,
            scale: () => (isWide() ? 0.94 : 0.9),
            opacity: 1,
            duration: 0.45,
            ease: "power3.inOut",
          },
          fan,
        );
      });

      pin
        // Act 2 — out with the deck, in with the scenarios
        .to(
          cards,
          {
            scale: 0.6,
            autoAlpha: 0,
            duration: 0.3,
            stagger: 0.05,
            ease: "power2.in",
          },
          2.9,
        )
        .to(
          introLines,
          { yPercent: -110, duration: 0.25, stagger: 0.03, ease: "power2.in" },
          2.9,
        )
        .to(q("[data-scen]"), { autoAlpha: 1, duration: 0.05 }, 3.1)
        .to(
          scenLines,
          { yPercent: 0, duration: 0.3, stagger: 0.04, ease: "power3.out" },
          3.15,
        )
        .fromTo(
          q("[data-eea]"),
          { backgroundSize: "0% 100%" },
          { backgroundSize: "100% 100%", duration: 0.3 },
          3.6,
        )
        .to(
          q("[data-base]"),
          { scale: 1, autoAlpha: 1, duration: 0.3, ease: "back.out(2)" },
          3.3,
        )
        .to(
          q("[data-wire]"),
          {
            strokeDashoffset: 0,
            duration: 0.35,
            stagger: 0.08,
            ease: "power2.inOut",
          },
          3.55,
        )
        .to(
          q("[data-stress]"),
          {
            scale: 1,
            autoAlpha: 1,
            duration: 0.3,
            stagger: 0.12,
            ease: "back.out(2.2)",
          },
          3.75,
        )
        .fromTo(
          q("[data-pressure]"),
          { scaleX: 0 },
          { scaleX: 1, duration: 0.5, stagger: 0.12, ease: "power2.inOut" },
          4.05,
        )
        .to({}, { duration: 0.7 }); // hold

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
          introLines,
          {
            yPercent: 0,
            duration: approach * 0.4,
            stagger: approach * 0.05,
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
      id="requirements"
      aria-labelledby="requirements-title"
      className={cx(
        "surface-light arc-next relative z-10",
        !story && "arc-prev",
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
      <ArcSurface tone="paper" parallax="[data-nh-inner]" />

      {!story ? (
        <StaticLayout />
      ) : (
        <div data-stage className="relative h-svh overflow-x-clip">
          {/* Inner wrapper: the next section's parallax moves this, never the pinned stage. */}
          <div
            data-req-inner
            className="absolute inset-0 flex flex-col gap-4 px-5 pt-[clamp(5rem,11svh,7.5rem)] pb-6 md:px-10 lg:grid lg:grid-cols-12 lg:items-center lg:gap-10 lg:pb-10"
          >
            {/* ---------------- Copy (left) ---------------- */}
            <div className="flex flex-col justify-center lg:col-span-5">
              <h2
                id="requirements-title"
                className="font-condensed text-[clamp(2rem,4.2vw,4.6rem)] leading-[0.9] uppercase"
              >
                {heading.split(" ").map((w, i) => (
                  <Fragment key={i}>
                    {i > 0 && " "}
                    <span className="inline-block overflow-hidden pb-[0.05em] align-bottom">
                      <span
                        data-head-word
                        className={cx(
                          "inline-block",
                          w === "BAL-007-1" && "text-fern",
                        )}
                      >
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
              <div className="mt-5 grid text-[14px] leading-relaxed text-carbon/80 md:mt-7 md:text-[clamp(0.95rem,1.15vw,1.15rem)]">
                <p data-para className="col-start-1 row-start-1">
                  {intro}
                </p>
                <p data-para data-scen className="col-start-1 row-start-1">
                  {eeaBefore}
                  <span
                    data-eea
                    className="bg-[linear-gradient(rgb(135_169_107/0.35),rgb(135_169_107/0.35))] bg-[length:0%_100%] bg-no-repeat text-carbon"
                  >
                    {NERC_FRAGMENTS.eea}
                  </span>
                  {eeaAfter}
                </p>
              </div>
            </div>

            {/* ---------------- Stage (right) ---------------- */}
            <div className="relative min-h-0 flex-1 lg:col-span-6 lg:col-start-7 lg:h-[72svh] lg:flex-none">
              {/* Act 1: the deck */}
              <div className="absolute inset-0 flex items-center justify-center">
                {accountFor.map((item) => (
                  <div
                    key={item}
                    data-card
                    className="absolute w-[min(92%,30rem)] rounded-[20px] border border-carbon/10 bg-white p-4 shadow-[0_30px_60px_-30px_rgb(29_34_15/0.45)] md:p-7 lg:w-[min(48%,26rem)]"
                  >
                    <p className="text-label text-muted">
                      {NERC_FRAGMENTS.accountFor}
                    </p>
                    <div className="mt-2 flex items-start gap-3 md:mt-4 md:gap-4">
                      <Check />
                      <p className="font-display text-[clamp(1rem,1.7vw,1.6rem)] leading-tight">
                        {item}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Act 2: base scenario + stress scenarios */}
              <div className="absolute inset-0">
                <svg
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                  aria-hidden
                  className="absolute inset-0 size-full"
                >
                  {STRESS_POS.map((s, i) => (
                    <line
                      key={i}
                      data-wire
                      x1={50}
                      y1={50}
                      x2={s.x}
                      y2={s.y}
                      pathLength={1}
                      strokeDasharray="1 1"
                      className="stroke-carbon/30"
                      strokeWidth={0.35}
                      vectorEffect="non-scaling-stroke"
                    />
                  ))}
                </svg>
                <div
                  data-base
                  className="absolute top-1/2 left-1/2 w-[min(46%,15rem)] -translate-x-1/2 -translate-y-1/2 rounded-[18px] bg-carbon p-4 text-center text-paper shadow-[0_0_0_8px_rgb(135_169_107/0.25)] md:p-6"
                >
                  <p className="font-condensed text-[clamp(1.1rem,1.8vw,1.8rem)] leading-none uppercase">
                    {NERC_FRAGMENTS.baseScenario}
                  </p>
                  <p className="text-label mt-2 text-paper/60">
                    {NERC_FRAGMENTS.expected}
                  </p>
                </div>
                {stressScenarios.map((s, i) => {
                  const pos = STRESS_POS[i];
                  return (
                    <div
                      key={s}
                      data-stress
                      className="absolute w-[min(44%,14rem)] -translate-x-1/2 -translate-y-1/2 rounded-[16px] border border-carbon/15 bg-paper p-3 shadow-[0_20px_40px_-24px_rgb(29_34_15/0.5)] md:p-4"
                      style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                    >
                      <p className="font-display text-[clamp(0.85rem,1.2vw,1.15rem)] leading-tight">
                        {s}
                      </p>
                      {/* pressure gauge: fills as the stress is applied (no values) */}
                      <span
                        aria-hidden
                        className="mt-3 block h-1 w-full overflow-hidden rounded-full bg-carbon/10"
                      >
                        <span
                          data-pressure
                          className="block h-full w-full origin-left rounded-full bg-fern"
                        />
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
