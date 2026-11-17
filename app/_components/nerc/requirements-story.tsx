"use client";

import { Fragment, useRef, useState } from "react";
import { NERC, NERC_FRAGMENTS } from "@/lib/content";
import { ArcSurface } from "../motion/arc-surface";
import { gsap, ScrollTrigger, SplitText, useGSAP, MQ } from "../motion/gsap";
import { cx } from "../ui/primitives";

const PIN_VH = 2.8;
const APPROACH_VH = 0.8;
const { heading, scenariosIntro, stressScenarios } = NERC.requirements;

/** The scenarios sentence on this page: the client trimmed the EEA phrase. */
const SCENARIOS = scenariosIntro.replace(NERC_FRAGMENTS.eea, NERC_FRAGMENTS.eeaShort);
const [eeaBefore, eeaAfter] = SCENARIOS.split(NERC_FRAGMENTS.eeaShort);

function StaticLayout() {
  return (
    <div className="mx-auto grid max-w-[1400px] gap-10 px-5 pb-28 md:px-10 lg:grid-cols-12">
      <h2 id="requirements-title" className="font-condensed text-condensed-xl uppercase lg:col-span-5">
        {heading}
      </h2>
      <div className="space-y-6 text-base leading-relaxed text-muted md:text-lg lg:col-span-6 lg:col-start-7">
        <p>{SCENARIOS}</p>
        <p className="font-medium text-fg">
          {NERC_FRAGMENTS.baseScenario}: {NERC_FRAGMENTS.expected}
        </p>
        <div>
          <p className="text-label">{NERC_FRAGMENTS.contingencies}</p>
          <ul className="mt-3 list-disc space-y-1 pl-6">
            {stressScenarios.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

/**
 * New BAL-007-1 Requirements — the Scenarios, pinned:
 * the paragraph rises in (its "Energy Emergency Alerts" highlight fills), then a
 * tree grows: the Base Scenario at the top, a stem down to a bus, and a branch to
 * each contingency scenario, whose pressure gauges then fill.
 * Wide screens: the four contingencies sit in a 2×2 grid; the spine runs down the gap
 * between the columns and branches to each.
 * Narrow screens: they stack under a rail that branches to each.
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

      const split = SplitText.create(q("[data-para]")[0], { type: "lines", mask: "lines" });
      gsap.set(split.masks, { paddingBottom: "0.2em", marginBottom: "-0.2em", paddingTop: "0.05em", marginTop: "-0.05em" });

      // Explicit starting states. (Animated nodes are inner elements: their
      // wrappers own any centring translate, which GSAP would otherwise overwrite.)
      gsap.set(q("[data-head-word]"), { yPercent: 110 });
      gsap.set(split.lines, { yPercent: 110 });
      gsap.set(q("[data-base]"), { scale: 0.7, autoAlpha: 0 });
      gsap.set(q("[data-wire-y]"), { scaleY: 0 });
      gsap.set(q("[data-wire-x]"), { scaleX: 0 });
      gsap.set(q("[data-cont-label]"), { autoAlpha: 0, y: 8 });
      gsap.set(q("[data-cont]"), { autoAlpha: 0, y: 18, scale: 0.94 });
      gsap.set(q("[data-pressure]"), { scaleX: 0 });

      const pinST = ScrollTrigger.create({
        trigger: stage,
        start: "top top",
        end: () => `+=${window.innerHeight * PIN_VH}`,
        pin: true,
        invalidateOnRefresh: true,
      });

      const wide = window.matchMedia("(min-width: 1024px)").matches;
      const conts = q("[data-cont]") as HTMLElement[];
      const lineIn = { duration: 0.12, ease: "power1.inOut" };
      const cardIn = (els: Element[], at: number) =>
        pin
          .to(els, { autoAlpha: 1, y: 0, scale: 1, duration: 0.22, stagger: 0.04, ease: "back.out(1.8)" }, at)
          .to(
            els.map((el) => el.querySelector("[data-pressure]")),
            { scaleX: 1, duration: 0.35, stagger: 0.04, ease: "power2.inOut" },
            at + 0.12,
          );

      // The tree grows in order: base → stem → (each level) line → branches → boxes.
      const pin = gsap
        .timeline({ defaults: { ease: "none" } })
        .fromTo(q("[data-eea]"), { backgroundSize: "0% 100%" }, { backgroundSize: "100% 100%", duration: 0.3 }, 0.05)
        .to(q("[data-base]"), { scale: 1, autoAlpha: 1, duration: 0.25, ease: "back.out(2)" }, 0.1)
        .to(q("[data-wire-y='stem']"), { scaleY: 1, ...lineIn }, 0.32)
        .to(q("[data-cont-label]"), { autoAlpha: 1, y: 0, duration: 0.15 }, 0.4);

      let t = 0.44;
      if (wide) {
        // 2×2: spine to row 1 → its two branches → its two boxes; then row 2 the same
        for (const row of [0, 1]) {
          pin.to(q(`[data-wire-y='spine-${row}']`), { scaleY: 1, ...lineIn }, t);
          t += 0.12;
          pin.to(q(`[data-wire-x^='branch-'][data-row='${row}']`), { scaleX: 1, ...lineIn }, t);
          t += 0.1;
          cardIn(conts.slice(row * 2, row * 2 + 2), t);
          t += 0.24;
        }
      } else {
        // column: each stretch of rail → its branch → its box, down the list
        (q("[data-wire-y='rail']") as HTMLElement[]).forEach((rail, i) => {
          pin.to(rail, { scaleY: 1, duration: 0.08, ease: "none" }, t);
          t += 0.08;
          pin.to(q("[data-wire-x='branch']")[i], { scaleX: 1, duration: 0.07, ease: "power1.out" }, t);
          t += 0.06;
          cardIn([conts[i]], t);
          t += 0.14;
        });
      }
      pin.to({}, { duration: 0.6 }, t + 0.3); // hold

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
        .to(q("[data-head-word]"), { yPercent: 0, duration: approach * 0.5, stagger: approach * 0.06, ease: "power3.out" }, approach * 0.15)
        .fromTo(q("[data-head-rule]"), { scaleX: 0 }, { scaleX: 1, duration: approach * 0.4 }, approach * 0.4)
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

  return (
    <section
      ref={ref}
      id="requirements"
      aria-labelledby="requirements-title"
      className={cx("surface-light arc-next relative z-10", !story && "arc-prev")}
      style={story ? { paddingTop: "var(--arc-depth)", paddingBottom: "var(--arc-depth)" } : undefined}
    >
      {/* No parallax: the ERA scene above is pinned. */}
      <ArcSurface tone="paper" />

      {!story ? (
        <StaticLayout />
      ) : (
        <div data-stage className="relative h-svh overflow-x-clip">
          {/* Inner wrapper: the next section's parallax moves this, never the pinned stage. */}
          <div
            data-req-inner
            className="absolute inset-0 flex flex-col gap-5 px-5 pt-[clamp(5rem,11svh,7.5rem)] pb-6 md:px-10 lg:grid lg:grid-cols-12 lg:items-center lg:gap-10 lg:pb-10"
          >
            {/* ---------------- Copy (left) ---------------- */}
            <div className="flex flex-col justify-center lg:col-span-5">
              <h2 id="requirements-title" className="font-condensed text-[clamp(2rem,4.2vw,4.6rem)] leading-[0.9] uppercase">
                {heading.split(" ").map((w, i) => (
                  <Fragment key={i}>
                    {i > 0 && " "}
                    <span className="inline-block overflow-hidden pb-[0.05em] align-bottom">
                      <span data-head-word className={cx("inline-block", w === "BAL-007-1" && "text-fern")}>
                        {w}
                      </span>
                    </span>
                  </Fragment>
                ))}
              </h2>
              <span data-head-rule aria-hidden className="mt-4 block h-[2px] w-20 origin-left bg-fern md:mt-6" />
              <p
                data-para
                className="mt-5 text-[14px] leading-relaxed text-carbon/80 md:mt-7 md:text-[clamp(0.95rem,1.15vw,1.15rem)]"
              >
                {eeaBefore}
                <span
                  data-eea
                  className="bg-[linear-gradient(rgb(135_169_107/0.35),rgb(135_169_107/0.35))] bg-[length:0%_100%] bg-no-repeat text-carbon"
                >
                  {NERC_FRAGMENTS.eeaShort}
                </span>
                {eeaAfter}
              </p>
            </div>

            {/* ---------------- Scenario tree (right) ---------------- */}
            <div className="flex min-h-0 flex-1 flex-col justify-center lg:col-span-7 lg:col-start-6 lg:h-[72svh] lg:flex-none">
              {/* Base Scenario */}
              <div className="flex justify-start lg:justify-center">
                <div
                  data-base
                  className="w-[min(100%,18rem)] rounded-[18px] bg-carbon p-3 text-center text-paper shadow-[0_0_0_6px_rgb(135_169_107/0.25)] md:p-5 lg:w-[min(46%,17rem)]"
                >
                  <p className="font-condensed text-[clamp(1.05rem,1.8vw,1.8rem)] leading-none uppercase">
                    {NERC_FRAGMENTS.baseScenario}
                  </p>
                  <p className="text-label mt-1.5 text-paper/60 md:mt-2">{NERC_FRAGMENTS.expected}</p>
                </div>
              </div>

              {/* The stem down from the base (centred on wide screens; on narrow ones it
                  heads the rail on the left, with the label beside it) */}
              <div className="flex items-end lg:justify-center">
                <span
                  aria-hidden
                  data-wire-y="stem"
                  className="ml-3 block h-[clamp(1.5rem,4svh,2.75rem)] w-px origin-top bg-carbon/35 lg:ml-0"
                />
                <p data-cont-label className="text-label mb-1 ml-4 text-muted lg:hidden">
                  {NERC_FRAGMENTS.contingencies}
                </p>
              </div>
              {/* Wide: a 2×2 grid; the spine runs down the gap between the columns (from
                  the stem to the middle of the last row) and branches to each box. */}
              <div className="relative w-full [--gx:clamp(3rem,6vw,6rem)] [--gy:1.25rem] lg:mx-auto lg:max-w-[42rem]">
                {/* rows are equal height, so a row's middle sits (100% - gap) / 4 from its edge */}
                <span
                  aria-hidden
                  data-wire-y="spine-0"
                  className="absolute top-0 left-1/2 hidden w-px origin-top bg-carbon/35 lg:block"
                  style={{ height: "calc((100% - var(--gy)) / 4)" }}
                />
                <span
                  aria-hidden
                  data-wire-y="spine-1"
                  className="absolute left-1/2 hidden w-px origin-top bg-carbon/35 lg:block"
                  style={{ top: "calc((100% - var(--gy)) / 4)", bottom: "calc((100% - var(--gy)) / 4)" }}
                />
                <p
                  data-cont-label
                  className="text-label absolute bottom-full left-0 mb-3 hidden text-muted lg:block"
                >
                  {NERC_FRAGMENTS.contingencies}
                </p>
                <ul className="grid gap-2.5 pl-8 lg:auto-rows-fr lg:grid-cols-2 lg:gap-x-[var(--gx)] lg:gap-y-[var(--gy)] lg:pl-0">
                  {stressScenarios.map((s, i) => (
                    <li key={s} className="group relative">
                      {/* Narrow: this box's stretch of the rail (to its middle for the last) */}
                      <span
                        aria-hidden
                        data-wire-y="rail"
                        className="absolute top-[-0.625rem] bottom-0 -left-5 block w-px origin-top bg-carbon/35 group-first:top-0 group-last:bottom-1/2 lg:hidden"
                      />
                      {/* Wide: a branch from the spine (in the column gap) to this box */}
                      <span
                        aria-hidden
                        data-wire-x={i % 2 === 0 ? "branch-l" : "branch-r"}
                        data-row={Math.floor(i / 2)}
                        className={cx(
                          "absolute top-1/2 hidden h-px w-[calc(var(--gx)/2)] bg-carbon/35 lg:block",
                          i % 2 === 0 ? "left-full origin-right" : "right-full origin-left",
                        )}
                      />
                      <span
                        aria-hidden
                        data-wire-x="branch"
                        className="absolute top-1/2 -left-5 block h-px w-5 origin-left bg-carbon/35 lg:hidden"
                      />
                      <div
                        data-cont
                        className="h-full rounded-[14px] border border-carbon/15 bg-paper p-2.5 shadow-[0_18px_36px_-24px_rgb(18_22_10/0.5)] md:p-4 lg:p-5"
                      >
                        <p className="font-display text-[clamp(0.85rem,1.15vw,1.3rem)] leading-tight">{s}</p>
                        {/* pressure gauge: fills as the stress is applied (no values) */}
                        <span aria-hidden className="mt-2 block h-1 w-full overflow-hidden rounded-full bg-carbon/10 md:mt-3">
                          <span data-pressure className="block h-full w-full origin-left rounded-full bg-fern" />
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
