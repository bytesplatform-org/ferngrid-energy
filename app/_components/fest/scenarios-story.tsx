"use client";

import { Fragment, useRef, useState } from "react";
import { FEST_PAGE, NERC, NERC_FRAGMENTS } from "@/lib/content";
import { ArcSurface } from "../motion/arc-surface";
import { gsap, ScrollTrigger, SplitText, useGSAP, MQ } from "../motion/gsap";
import { cx } from "../ui/primitives";

const PIN_VH = 3.6;
const APPROACH_VH = 0.8;
const { scenariosIntro, stressScenarios } = NERC.requirements;
const { modelHeading, requirementBoxes } = FEST_PAGE;
/** Revision 3: the paragraph's two halves, lit in turn — the base Scenario, then the stresses. */
const SPLIT_AT = scenariosIntro.indexOf(" then considering");
const PARTS = [scenariosIntro.slice(0, SPLIT_AT), scenariosIntro.slice(SPLIT_AT + 1)] as const;
const DIM = 0.32;

/* Diagram (0–100 box): the centre box, and the four boxes in the corners around it. */
const CORNERS = [
  { x: 20, y: 18 },
  { x: 80, y: 18 },
  { x: 20, y: 82 },
  { x: 80, y: 82 },
] as const;

function Heading() {
  return (
    <h2
      id="fest-scen-title"
      className="font-condensed text-[clamp(2rem,4.4vw,4.6rem)] leading-[0.92] uppercase"
    >
      {modelHeading.split(" ").map((w, i) => (
        <Fragment key={i}>
          {i > 0 && " "}
          <span className="inline-block overflow-hidden pb-[0.05em] align-bottom">
            <span data-fs-word className={cx("inline-block", w === "(FEST)" && "text-fern")}>
              {w}
            </span>
          </span>
        </Fragment>
      ))}
    </h2>
  );
}

/** Static layout (no JS / reduced motion): the paragraph, and both diagrams as lists. */
function StaticLayout() {
  return (
    <div className="mx-auto grid max-w-[1400px] gap-10 px-5 pb-28 md:px-10 lg:grid-cols-12">
      <div className="lg:col-span-5">
        <Heading />
      </div>
      <div className="space-y-6 text-[15px] leading-relaxed text-carbon/80 md:text-lg lg:col-span-6 lg:col-start-7">
        <p>{scenariosIntro}</p>
        <ul className="list-disc space-y-1 pl-6">
          {requirementBoxes.map((a) => (
            <li key={a}>{a}</li>
          ))}
        </ul>
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
 * FEST page — Fuel and Energy Security Tool (FEST) and Near Term ERAs, pinned in
 * two parts under one heading and one paragraph (the scenarios paragraph, dimmed;
 * each part lights its half — Revision 3, client request):
 * 1. "…developed from expected system conditions": a Base Scenario in the middle,
 *    wired to the four requirements around it.
 * 2. "then considering other Scenarios…": the centre becomes "Contingency
 *    scenarios" and the four stresses take the corners, their pressure gauges filling.
 */
export function ScenariosStory() {
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

      const split = SplitText.create(q("[data-fs-para]")[0], { type: "lines", mask: "lines" });
      gsap.set(split.masks, { paddingBottom: "0.2em", marginBottom: "-0.2em", paddingTop: "0.05em", marginTop: "-0.05em" });
      // (a half can be split across lines into several pieces: select them all)
      const part = (i: number) => q(`[data-fs-part='${i}']`);

      // Starting states (animated nodes are inner elements; their wrappers own
      // the centring translate, which GSAP would otherwise overwrite).
      gsap.set(q("[data-fs-word]"), { yPercent: 110 });
      gsap.set(split.lines, { yPercent: 110 });
      gsap.set(q("[data-fs-part]"), { opacity: DIM });
      gsap.set(q("[data-fs-centre]"), { scale: 0.6, autoAlpha: 0 });
      gsap.set(q("[data-fs-centre-b]"), { autoAlpha: 0, yPercent: 30 });
      gsap.set(q("[data-fs-wire]"), { strokeDashoffset: 1 });
      gsap.set(q("[data-fs-req], [data-fs-stress]"), { scale: 0.5, autoAlpha: 0 });
      gsap.set(q("[data-fs-pressure]"), { scaleX: 0 });

      const pinST = ScrollTrigger.create({
        trigger: stage,
        start: "top top",
        end: () => `+=${window.innerHeight * PIN_VH}`,
        pin: true,
        invalidateOnRefresh: true,
      });

      const pin = gsap
        .timeline({ defaults: { ease: "none" } })
        // Part 1 — the first half lights; the Base Scenario, wired to the four requirements
        .to(part(0), { opacity: 1, duration: 0.2 }, 0)
        .to(q("[data-fs-centre]"), { scale: 1, autoAlpha: 1, duration: 0.3, ease: "back.out(2)" }, 0.05)
        .to(q("[data-fs-wire]"), { strokeDashoffset: 0, duration: 0.3, stagger: 0.08, ease: "power2.inOut" }, 0.3)
        .to(q("[data-fs-req]"), { scale: 1, autoAlpha: 1, duration: 0.3, stagger: 0.12, ease: "back.out(2.2)" }, 0.5)
        // Part 2 — the second half lights instead; the centre becomes "Contingency
        // scenarios"; the requirements give way to the four stresses
        .to(part(0), { opacity: DIM, duration: 0.2 }, 1.55)
        .to(part(1), { opacity: 1, duration: 0.2 }, 1.65)
        .to(q("[data-fs-req]"), { scale: 0.6, autoAlpha: 0, duration: 0.25, stagger: 0.05, ease: "power2.in" }, 1.55)
        .to(q("[data-fs-centre-a]"), { autoAlpha: 0, yPercent: -30, duration: 0.2, ease: "power2.in" }, 1.7)
        .to(q("[data-fs-centre-b]"), { autoAlpha: 1, yPercent: 0, duration: 0.25, ease: "power3.out" }, 1.85)
        .to(q("[data-fs-stress]"), { scale: 1, autoAlpha: 1, duration: 0.3, stagger: 0.12, ease: "back.out(2.2)" }, 1.95)
        .to(q("[data-fs-pressure]"), { scaleX: 1, duration: 0.45, stagger: 0.12, ease: "power2.inOut" }, 2.25)
        .to({}, { duration: 0.6 }); // hold

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
        .to(q("[data-fs-word]"), { yPercent: 0, duration: approach * 0.5, stagger: approach * 0.05, ease: "power3.out" }, approach * 0.15)
        .fromTo(q("[data-fs-rule]"), { scaleX: 0 }, { scaleX: 1, duration: approach * 0.4 }, approach * 0.4)
        .to(split.lines, { yPercent: 0, duration: approach * 0.4, stagger: approach * 0.05, ease: "power3.out" }, approach * 0.45)
        .add(pin, approach);

      ScrollTrigger.sort();
      ScrollTrigger.refresh();
      return () => {
        pinST.kill();
        split.revert();
      };
    },
    { scope: ref, dependencies: [story], revertOnUpdate: true },
  );

  const box =
    "absolute w-[min(44%,14rem)] -translate-x-1/2 -translate-y-1/2";

  return (
    <section
      ref={ref}
      aria-labelledby="fest-scen-title"
      className={cx("surface-light arc-next relative z-10", !story && "arc-prev")}
      style={story ? { paddingTop: "var(--arc-depth)", paddingBottom: "var(--arc-depth)" } : undefined}
    >
      <ArcSurface tone="paper" parallax="[data-fb-inner]" />

      {!story ? (
        <StaticLayout />
      ) : (
        <div data-stage className="pin-screen relative overflow-x-clip">
          {/* Inner wrapper: the next section's parallax moves this, never the pinned stage. */}
          <div
            data-fs-inner
            className="absolute inset-0 flex flex-col gap-4 px-5 pt-[clamp(5rem,11svh,7.5rem)] pb-6 md:px-10 lg:grid lg:grid-cols-12 lg:items-center lg:gap-10 lg:pb-10"
          >
            {/* Copy (left): one heading, one paragraph whose halves light in turn */}
            <div className="flex flex-col justify-center lg:col-span-5">
              <Heading />
              <span data-fs-rule aria-hidden className="mt-4 block h-[2px] w-20 origin-left bg-fern md:mt-6" />
              <p
                data-fs-para
                className="mt-5 text-[14px] leading-relaxed text-carbon/80 md:mt-7 md:text-[clamp(0.95rem,1.15vw,1.15rem)]"
              >
                <span data-fs-part="0">{PARTS[0]}</span> <span data-fs-part="1">{PARTS[1]}</span>
              </p>
            </div>

            {/* Diagram (right) */}
            <div className="relative min-h-0 flex-1 lg:col-span-6 lg:col-start-7 lg:h-[64svh] lg:flex-none">
              <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden className="absolute inset-0 size-full">
                {CORNERS.map((c, i) => (
                  <line
                    key={i}
                    data-fs-wire
                    x1={50}
                    y1={50}
                    x2={c.x}
                    y2={c.y}
                    pathLength={1}
                    strokeDasharray="1 1"
                    className="stroke-carbon/30"
                    // viewBox units (no non-scaling-stroke: with pathLength, Chrome
                    // dashes it in screen space and the draw-on breaks into fragments)
                    strokeWidth={0.2}
                  />
                ))}
              </svg>

              {/* Centre: Base Scenario, then Contingency scenarios */}
              <div className="absolute top-1/2 left-1/2 w-[min(46%,15rem)] -translate-x-1/2 -translate-y-1/2">
                <div
                  data-fs-centre
                  className="grid overflow-hidden rounded-[18px] bg-carbon p-4 text-center text-paper shadow-[0_0_0_8px_rgb(135_169_107/0.25)] md:p-6"
                >
                  <div data-fs-centre-a className="col-start-1 row-start-1 self-center">
                    <p className="font-condensed text-[clamp(1.1rem,1.8vw,1.8rem)] leading-none uppercase">
                      {NERC_FRAGMENTS.baseScenario}
                    </p>
                    <p className="text-label mt-2 text-paper/60">{NERC_FRAGMENTS.expected}</p>
                  </div>
                  <p
                    data-fs-centre-b
                    className="font-condensed col-start-1 row-start-1 self-center text-[clamp(1.1rem,1.8vw,1.8rem)] leading-none uppercase"
                  >
                    {NERC_FRAGMENTS.contingencies}
                  </p>
                </div>
              </div>

              {/* Part 1: the four requirements; part 2: the four stresses (same corners) */}
              {CORNERS.map((c, i) => (
                <div key={i} className={box} style={{ left: `${c.x}%`, top: `${c.y}%` }}>
                  <div className="grid">
                    <div
                      data-fs-req
                      className="col-start-1 row-start-1 flex items-center justify-center rounded-[16px] border border-carbon/15 bg-paper p-3 text-center shadow-[0_20px_40px_-24px_rgb(18_22_10/0.5)] md:p-4"
                    >
                      <p className="font-display text-[clamp(0.85rem,1.2vw,1.15rem)] leading-tight">
                        {requirementBoxes[i]}
                      </p>
                    </div>
                    <div
                      data-fs-stress
                      className="col-start-1 row-start-1 rounded-[16px] border border-carbon/15 bg-paper p-3 shadow-[0_20px_40px_-24px_rgb(18_22_10/0.5)] md:p-4"
                    >
                      <p className="font-display text-[clamp(0.85rem,1.2vw,1.15rem)] leading-tight">{stressScenarios[i]}</p>
                      {/* pressure gauge: fills as the stress is applied (no values) */}
                      <span aria-hidden className="mt-3 block h-1 w-full overflow-hidden rounded-full bg-carbon/10">
                        <span data-fs-pressure className="block h-full w-full origin-left rounded-full bg-fern" />
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
