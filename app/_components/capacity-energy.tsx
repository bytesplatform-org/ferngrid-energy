"use client";

import { useRef } from "react";
import { FRAGMENTS, NERC } from "@/lib/content";
import { ArcSurface } from "./motion/arc-surface";
import { gsap, useGSAP, MQ } from "./motion/gsap";
import { SplitReveal, FadeUp } from "./motion/reveal";
import { SectionLabel } from "./ui/primitives";

/* Diagram geometry (viewBox 0 0 1200 640). Illustrative only: no values, no value axes. */
const VB = { w: 1200, h: 640 };
const BASE = 520;
const FULL = 360;
const X0 = 150;
const X1 = 1160;
const N = 84;
const STEP = (X1 - X0) / N;
const BAR_W = 5;
const CAP = { x: 40, w: 46, startX: 577, startW: 46 };
const DEMAND_Y = BASE - FULL * 0.5;

/** Deterministic hourly pattern: a daily rhythm plus gentle variation. */
const BARS = Array.from({ length: N }, (_, i) => {
  const daily = Math.sin((i / 24) * Math.PI * 2 - Math.PI / 2);
  const drift = Math.sin(i * 1.7) * 0.04 + Math.sin(i * 0.37) * 0.05;
  const f = 0.64 + daily * 0.16 + drift;
  return { x: X0 + i * STEP + (STEP - BAR_W) / 2, h: FULL * f };
});

/** Stepped fuel-storage line that depletes through the study period. */
const FUEL_STEPS = [0, 0.08, 0.13, 0.24, 0.3, 0.42, 0.47, 0.58, 0.66, 0.71, 0.8];
const FUEL_PATH = (() => {
  const seg = (X1 - X0) / FUEL_STEPS.length;
  const y = (d: number) => BASE - FULL * 0.96 + FULL * 0.86 * d;
  let d = `M ${X0} ${y(0)}`;
  FUEL_STEPS.forEach((s, i) => {
    d += ` V ${y(s)} H ${X0 + seg * (i + 1)}`;
  });
  return d;
})();

const pct = (v: number, of: number) => `${(v / of) * 100}%`;

export function CapacityEnergy() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      const build = (tl: gsap.core.Timeline) => {
        const bars = gsap.utils.toArray<SVGRectElement>("[data-hour]");
        // Step A: one tall capacity bar, centred.
        tl.from("[data-cap]", { attr: { x: CAP.startX, width: CAP.startW + 30 }, duration: 0.18, ease: "none" }, 0)
          .from("[data-cap-label]", { left: pct(CAP.startX - 160, VB.w), duration: 0.18, ease: "none" }, 0)
          .from(
            bars,
            {
              attr: { x: CAP.startX + 20, height: FULL, y: BASE - FULL },
              opacity: 0,
              duration: 0.3,
              ease: "power2.inOut",
              stagger: { each: 0.18 / N, from: "start" },
            },
            0.2,
          )
          .to("[data-cap]", { opacity: 0.3, duration: 0.2, ease: "none" }, 0.2)
          .from("[data-axis]", { scaleX: 0, transformOrigin: "0 0", duration: 0.3, ease: "power2.out" }, 0.22)
          .from("[data-b-label]", { autoAlpha: 0, y: 8, duration: 0.12, stagger: 0.04 }, 0.4)
          .from("[data-demand]", { scaleX: 0, transformOrigin: "0% 50%", duration: 0.22, ease: "power2.inOut" }, 0.5)
          .fromTo("[data-fuel]", { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.42, ease: "none" }, 0.58)
          .set("[data-playhead]", { opacity: 1 }, 0.58)
          .fromTo(
            "[data-playhead]",
            { attr: { transform: `translate(${X0} 0)` } },
            { attr: { transform: `translate(${X1} 0)` }, duration: 0.42, ease: "none" },
            0.58,
          )
          .fromTo(bars, { opacity: 0.3 }, { opacity: 0.85, duration: 0.02, stagger: 0.4 / N, ease: "none", immediateRender: false }, 0.58)
          .to("[data-playhead]", { opacity: 0, duration: 0.04 }, 0.98);
        return tl;
      };

      // Desktop: pinned scrub.
      mm.add(MQ.desktopMotion, () => {
        build(
          gsap.timeline({
            scrollTrigger: {
              trigger: stageRef.current,
              start: "center center",
              end: "+=120%",
              pin: true,
              scrub: 0.6,
            },
          }),
        );
      });

      // Mobile: plays as a short timeline on enter.
      mm.add(MQ.mobileMotion, () => {
        const tl = gsap.timeline({ paused: true });
        build(tl);
        tl.duration(2.8);
        gsap.timeline({ scrollTrigger: { trigger: stageRef.current, start: "top 75%", once: true } }).add(() => {
          tl.play();
        });
      });
    },
    { scope: sectionRef },
  );

  return (
    <section
      ref={sectionRef}
      aria-labelledby="capacity-title"
      className="surface-dark arc-next relative z-10 px-5 pb-24 md:px-10 md:pb-32"
    >
      <ArcSurface tone="carbon-deep" parallax="[data-software-inner]" />

      <div className="mx-auto max-w-[1600px]">
        <SectionLabel index="02">Capacity vs. Energy</SectionLabel>
        <h2 id="capacity-title" className="text-label-md mt-10 max-w-[44ch] leading-relaxed text-paper/80">
          {NERC.eraDifference.heading}
        </h2>
        <SplitReveal
          as="p"
          className="font-display mt-6 max-w-[14ch] text-[clamp(3.75rem,9.5vw,11rem)] leading-[0.9]"
        >
          {FRAGMENTS.enoughEnergy}
        </SplitReveal>

        <div ref={stageRef} className="mt-14 grid gap-10 md:mt-20 lg:grid-cols-12 lg:items-center lg:gap-12">
          <FadeUp className="lg:col-span-4">
            <p className="max-w-[60ch] text-base leading-relaxed text-muted lg:text-[15px] xl:text-base">
              {NERC.eraDifference.body}
            </p>
          </FadeUp>

          <figure className="lg:col-span-8">
            <div className="relative aspect-[4/3] w-full sm:aspect-[1200/640]">
              <svg
                viewBox={`0 0 ${VB.w} ${VB.h}`}
                preserveAspectRatio="none"
                aria-hidden
                className="absolute inset-0 size-full overflow-visible"
              >
                {/* baseline / timeline */}
                <line
                  data-axis
                  x1={X0}
                  x2={X1}
                  y1={BASE}
                  y2={BASE}
                  stroke="currentColor"
                  strokeOpacity="0.35"
                  vectorEffect="non-scaling-stroke"
                />
                <line x1={CAP.x - 10} x2={CAP.x + CAP.w + 10} y1={BASE} y2={BASE} stroke="currentColor" strokeOpacity="0.35" vectorEffect="non-scaling-stroke" />

                {/* capacity: a single point in time */}
                <rect data-cap x={CAP.x} y={BASE - FULL} width={CAP.w} height={FULL} fill="currentColor" opacity="0.3" />

                {/* hour-by-hour bars */}
                <g>
                  {BARS.map((b, i) => (
                    <rect key={i} data-hour x={b.x} y={BASE - b.h} width={BAR_W} height={b.h} fill="currentColor" opacity="0.85" />
                  ))}
                </g>

                {/* demand + operating reserves */}
                <line
                  data-demand
                  x1={X0}
                  x2={X1}
                  y1={DEMAND_Y}
                  y2={DEMAND_Y}
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeDasharray="7 7"
                  vectorEffect="non-scaling-stroke"
                />

                {/* fuel storage depleting in steps (progress stroke: fern) */}
                <path
                  data-fuel
                  d={FUEL_PATH}
                  fill="none"
                  pathLength={1}
                  strokeDasharray="1 1"
                  stroke="var(--color-fern)"
                  strokeWidth="2"
                  vectorEffect="non-scaling-stroke"
                />

                {/* playhead (active stroke: fern) */}
                <g data-playhead opacity="0">
                  <line y1={BASE - FULL - 30} y2={BASE} stroke="var(--color-fern)" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
                </g>
              </svg>

              {/* HTML labels stay crisp and legible at any width */}
              <span
                data-cap-label
                className="text-label absolute whitespace-nowrap text-paper"
                style={{ left: pct(CAP.x, VB.w), top: pct(BASE - FULL - 100, VB.h) }}
              >
                Capacity — a point in time
              </span>
              <span
                data-b-label
                className="text-label absolute bg-carbon-deep py-0.5 pr-1.5 text-fern"
                style={{ left: pct(X0, VB.w), top: pct(BASE - FULL * 0.96 - 34, VB.h) }}
              >
                Fuel storage
              </span>
              <span
                data-b-label
                className="text-label absolute bg-carbon-deep py-0.5 pl-1.5 text-right whitespace-nowrap text-paper/80"
                style={{ right: pct(VB.w - X1, VB.w), top: pct(DEMAND_Y - 40, VB.h) }}
              >
                Demand + operating reserves
              </span>
              <span
                data-b-label
                className="text-label absolute flex items-center gap-3 text-paper/80"
                style={{ left: pct(X0, VB.w), right: pct(VB.w - X1, VB.w), top: pct(BASE + 22, VB.h) }}
              >
                Hour by hour — through the study period
                <span aria-hidden className="h-px flex-1 bg-current opacity-40" />
                <span aria-hidden>→</span>
              </span>
            </div>
            <figcaption className="text-label mt-14 text-paper/50 sm:mt-10">Illustrative diagram.</figcaption>
            <p className="sr-only">
              Diagram: a single tall bar labelled capacity, a point in time, splits into a long row of thin hourly bars
              along a timeline labelled hour by hour, through the study period. A stepped line labelled fuel storage
              depletes across it, and a dashed line marks demand plus operating reserves.
            </p>
          </figure>
        </div>
      </div>
    </section>
  );
}
