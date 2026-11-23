"use client";

import Image from "next/image";
import { Fragment, useId, useRef, useState } from "react";
import { FEST_PAGE, NERC_FRAGMENTS } from "@/lib/content";
import { ArcSurface } from "../motion/arc-surface";
import { gsap, ScrollTrigger, SplitText, useGSAP, MQ } from "../motion/gsap";
import { cx } from "../ui/primitives";
import logoMark from "@/public/images/logo-mark.png";

const PIN_VH = 6.4;
const APPROACH_VH = 0.8;
const PAPER = "#f8f9f7";
const { heading, dispatch, fuel, fuelDelivery } = FEST_PAGE.benefits;

/* Part 1 — FEST and what it accounts for (as on the NERC page). */
const FACTORS = NERC_FRAGMENTS.festFactors;
const ANGLES = FACTORS.map((_, i) => (360 / FACTORS.length) * i);
/** Hourly dispatch bars (illustrative heights, no values). */
const DISPATCH = Array.from(
  { length: 24 },
  (_, i) => 0.35 + 0.45 * Math.abs(Math.sin(i * 0.55 + 0.6)) + (i % 7 === 3 ? 0.15 : 0),
);

/* Part 2 — fuel inventory through the study period (viewBox 0 0 1200 640).
   Illustrative only: no values, no value axes. */
const VB = { w: 1200, h: 640 };
const BASE = 520;
const FULL = 360;
const X0 = 24;
const X1 = 1176;
const N = 84;
const STEP = (X1 - X0) / N;
const BAR_W = 5.5;
/** Same hourly rhythm as the NERC page chart. */
const HOURS = Array.from({ length: N }, (_, i) => {
  const daily = Math.sin((i / 24) * Math.PI * 2 - Math.PI / 2);
  const drift = Math.sin(i * 1.7) * 0.04 + Math.sin(i * 0.37) * 0.05;
  return { x: X0 + i * STEP + (STEP - BAR_W) / 2, h: FULL * (0.64 + daily * 0.16 + drift) };
});
/** Storage depletes in steps; a delivery (step 7) refills it partway. */
const FUEL_STEPS = [0, 0.07, 0.15, 0.22, 0.31, 0.4, 0.47, 0.1, 0.18, 0.27, 0.35, 0.44];
const DELIVERY = 7;
const FUEL_SEG = (X1 - X0) / FUEL_STEPS.length;
const fuelY = (d: number) => BASE - FULL * 0.96 + FULL * 0.86 * d;
const FUEL_PATH =
  `M ${X0} ${fuelY(0)}` +
  FUEL_STEPS.map((s, i) => ` V ${fuelY(s)} H ${X0 + FUEL_SEG * (i + 1)}`).join("");
const DELIVERY_X = X0 + FUEL_SEG * DELIVERY;
const DELIVERY_Y = fuelY(FUEL_STEPS[DELIVERY]);
const pct = (v: number, of: number) => `${(v / of) * 100}%`;

function Heading({ id }: { id?: string }) {
  return (
    <h2
      id={id}
      data-fb-heading
      className="font-condensed text-[clamp(2rem,4.4vw,4.6rem)] leading-[0.92] text-carbon uppercase"
    >
      {heading.split(" ").map((w, i) => (
        <Fragment key={i}>
          {i > 0 && " "}
          <span className="inline-block overflow-hidden pb-[0.05em] align-bottom">
            <span data-fb-word className="inline-block">
              {w}
            </span>
          </span>
        </Fragment>
      ))}
    </h2>
  );
}

/** Static layout (no JS / reduced motion): both paragraphs, as text. */
function StaticLayout() {
  return (
    <div className="mx-auto grid max-w-[1400px] gap-10 px-5 pb-28 md:px-10 lg:grid-cols-12">
      <div className="lg:col-span-5">
        <Heading id="fest-benefits-title" />
      </div>
      <div className="space-y-6 text-[15px] leading-relaxed text-carbon/80 md:text-lg lg:col-span-6 lg:col-start-7">
        <p>{dispatch}</p>
        <p>{fuel}</p>
      </div>
    </div>
  );
}

/**
 * FEST page, after the hero (Revision 3, client copy): one pinned section in two
 * parts, the copy swapping on the left (like the scenarios story below it).
 * 1. FEST performs Near-Term ERAs: its factors orbit it and are pulled in, then
 *    it sends out the hourly dispatches and a scan assesses them for Energy
 *    Emergencies (the NERC page's animation).
 * 2. Fuel scarcity: the night spreads out of FEST and the stage turns dark, then
 *    the hourly chart draws on with fuel storage depleting step by step, refilled
 *    once by a delivery (the NERC page's middle chart).
 */
export function BenefitsStory() {
  const ref = useRef<HTMLElement>(null);
  const [story, setStory] = useState(false);
  const clipId = `fb-fuel-${useId().replace(/:/g, "")}`;

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
      const one = (sel: string) => q(sel)[0] as HTMLElement;
      const inner = one("[data-fb-inner]");
      const box = one("[data-fb-box]");
      const night = one("[data-fb-night]");

      const splits = q("[data-fb-para]").map((el) => SplitText.create(el, { type: "lines", mask: "lines" }));
      splits.forEach((s) =>
        gsap.set(s.masks, { paddingBottom: "0.2em", marginBottom: "-0.2em", paddingTop: "0.05em", marginTop: "-0.05em" }),
      );
      const [aLines, bLines] = splits.map((s) => s.lines);

      // Starting states
      gsap.set(q("[data-fb-word]"), { yPercent: 110 });
      gsap.set([...aLines, ...bLines], { yPercent: 110 });
      gsap.set(q("[data-fb-para-b]"), { autoAlpha: 0 });
      gsap.set(q("[data-fb-core]"), { scale: 0.6, autoAlpha: 0 });
      gsap.set(q("[data-fb-ring]"), { scale: 0.6, autoAlpha: 0 });
      gsap.set(q("[data-fb-chip]"), { scale: 0, autoAlpha: 0 });
      gsap.set(q("[data-fb-bar]"), { scaleY: 0 });
      gsap.set(q("[data-fb-out]"), { autoAlpha: 0, y: 14 });
      gsap.set(q("[data-fb-scan]"), { autoAlpha: 0 });
      gsap.set(q("[data-fb-chart]"), { autoAlpha: 0 });
      gsap.set(q("[data-fb-hour]"), { opacity: 0.3 });
      gsap.set(q("[data-fb-reveal]"), { attr: { width: 0 } });
      gsap.set(q("[data-fb-playhead]"), { opacity: 0 });
      gsap.set(q("[data-fb-demand]"), { autoAlpha: 0 });
      gsap.set(q("[data-fb-delivery]"), { autoAlpha: 0, scale: 0.4, transformOrigin: "50% 50%" });

      // The night grows out of FEST (the centre of the part 1 visual). Measured
      // against the inner wrapper, so a parallax offset doesn't move the centre.
      const circle = (k: number) => {
        const s = stage.getBoundingClientRect();
        const w = inner.getBoundingClientRect();
        const b = box.getBoundingClientRect();
        const x = b.left - w.left + b.width / 2;
        const y = b.top - w.top + b.height / 2;
        const r = k * Math.hypot(Math.max(x, s.width - x), Math.max(y, s.height - y)) + k * 4;
        return `circle(${r.toFixed(1)}px at ${x.toFixed(1)}px ${y.toFixed(1)}px)`;
      };
      gsap.set(night, { clipPath: circle(0) });

      // Orbit: the ring turns; chips stay upright.
      const orbit = one("[data-fb-orbit]");
      const chipEls = q("[data-fb-chip]") as HTMLElement[];
      const spin = { r: 0 };
      const renderSpin = () => {
        orbit.style.transform = `rotate(${spin.r}deg)`;
        chipEls.forEach((c, i) => (c.style.rotate = `${-(ANGLES[i] + spin.r)}deg`));
      };
      renderSpin();

      const pinST = ScrollTrigger.create({
        trigger: stage,
        start: "top top",
        end: () => `+=${window.innerHeight * PIN_VH}`,
        pin: true,
        invalidateOnRefresh: true,
      });

      const core = q("[data-fb-core]");
      const ring = q("[data-fb-ring]");
      const chips = q("[data-fb-chip]");
      const bars = q("[data-fb-bar]");
      const hours = q("[data-fb-hour]");
      const SWEEP = 4.75;
      const SWEEP_D = 1;
      /** Pin time at which the stage counts as dark (nav colours follow). */
      const DARK_AT = 4.34;

      const pin = gsap
        .timeline({ defaults: { ease: "none" } })
        // ---- Part 1: FEST, with what it accounts for circling it…
        .to(core, { scale: 1, autoAlpha: 1, duration: 0.3, ease: "back.out(2)" }, 0)
        .to(ring, { scale: 1, autoAlpha: 1, duration: 0.3 }, 0.1)
        .to(chips, { scale: 1, autoAlpha: 1, duration: 0.25, stagger: 0.08, ease: "back.out(2)" }, 0.2)
        .fromTo(spin, { r: 0 }, { r: 144, duration: 1.3, onUpdate: renderSpin, immediateRender: false }, 0.1)
        // …pulled into FEST…
        .to(q("[data-fb-arm]"), { top: "50%", duration: 0.3, stagger: 0.03, ease: "power2.in" }, 1.1)
        .to(chips, { scale: 0.3, autoAlpha: 0, duration: 0.3, stagger: 0.03, ease: "power2.in" }, 1.1)
        .to(ring, { scale: 0.4, autoAlpha: 0, duration: 0.3, ease: "power2.in" }, 1.15)
        .fromTo(core, { scale: 1 }, { scale: 1.1, duration: 0.08, yoyo: true, repeat: 1, immediateRender: false }, 1.42)
        // …which sends out the hourly dispatches, then assesses them
        .to(q("[data-fb-core-wrap]"), { yPercent: -36, duration: 0.4, ease: "power3.inOut" }, 1.55)
        .to(q("[data-fb-out='0']"), { autoAlpha: 1, y: 0, duration: 0.2 }, 1.75)
        .to(bars, { scaleY: 1, duration: 0.25, stagger: 0.025, ease: "power3.out" }, 1.8)
        .fromTo(q("[data-fb-scan]"), { left: "0%", autoAlpha: 1 }, { left: "100%", duration: 0.6, ease: "power1.inOut", immediateRender: false }, 2.6)
        .to(q("[data-fb-out='1']"), { autoAlpha: 1, y: 0, duration: 0.25 }, 3.0)
        // ---- Part 2: the copy swaps; the dispatch view clears and FEST returns to the centre…
        .to(aLines, { yPercent: -110, duration: 0.25, stagger: 0.03, ease: "power2.in" }, 3.45)
        .to(q("[data-fb-out]"), { autoAlpha: 0, y: 14, duration: 0.2 }, 3.45)
        .to(q("[data-fb-scan]"), { autoAlpha: 0, duration: 0.15 }, 3.45)
        .to(bars, { scaleY: 0, duration: 0.2, stagger: { each: 0.008, from: "end" }, ease: "power2.in" }, 3.45)
        .to(q("[data-fb-core-wrap]"), { yPercent: 0, duration: 0.35, ease: "power3.inOut" }, 3.55)
        // …and the night spreads out of it
        .fromTo(night, { clipPath: () => circle(0) }, { clipPath: () => circle(1), duration: 0.5, ease: "power2.in" }, 3.85)
        .to(q("[data-fb-heading]"), { color: PAPER, duration: 0.12 }, 4.24)
        .to(core, { autoAlpha: 0, scale: 0.8, duration: 0.2 }, 4.2)
        .to(q("[data-fb-para-b]"), { autoAlpha: 1, duration: 0.05 }, 4.2)
        .to(bLines, { yPercent: 0, duration: 0.3, stagger: 0.04, ease: "power3.out" }, 4.25)
        // Fuel chart: the hours rise, then the playhead runs the study period with
        // fuel storage depleting behind it (and a delivery refilling it)
        .to(q("[data-fb-chart]"), { autoAlpha: 1, duration: 0.05 }, 4.3)
        .from(q("[data-fb-axis]"), { scaleX: 0, transformOrigin: "0 0", duration: 0.3, ease: "power2.out" }, 4.3)
        .from(hours, { attr: { y: BASE, height: 0 }, duration: 0.3, stagger: 0.25 / N, ease: "power3.out" }, 4.35)
        .from(q("[data-fb-label]"), { autoAlpha: 0, y: 8, duration: 0.12, stagger: 0.04 }, 4.5)
        .to(q("[data-fb-reveal]"), { attr: { width: X1 - X0 + 8 }, duration: SWEEP_D }, SWEEP)
        .set(q("[data-fb-playhead]"), { opacity: 1 }, SWEEP)
        .fromTo(
          q("[data-fb-playhead]"),
          { attr: { transform: `translate(${X0} 0)` } },
          { attr: { transform: `translate(${X1} 0)` }, duration: SWEEP_D },
          SWEEP,
        )
        .fromTo(hours, { opacity: 0.3 }, { opacity: 0.85, duration: 0.02, stagger: SWEEP_D / N, immediateRender: false }, SWEEP)
        .fromTo(q("[data-fb-demand]"), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.03 }, SWEEP)
        .fromTo(q("[data-fb-demand]"), { left: pct(X0, VB.w) }, { left: pct(X1, VB.w), duration: SWEEP_D }, SWEEP)
        .fromTo(q("[data-fb-demand-label]"), { xPercent: 100 }, { xPercent: 0, duration: SWEEP_D }, SWEEP)
        .to(
          q("[data-fb-delivery]"),
          { autoAlpha: 1, scale: 1, duration: 0.1, ease: "back.out(2)" },
          SWEEP + (SWEEP_D * (DELIVERY_X - X0)) / (X1 - X0),
        )
        .to(q("[data-fb-playhead]"), { opacity: 0, duration: 0.04 }, SWEEP + SWEEP_D)
        .to({}, { duration: 0.6 }); // hold

      const approach = (pin.duration() * APPROACH_VH) / PIN_VH;
      // The stage turns dark mid-way: the nav reads the surface class to pick its colours.
      let dark = false;
      const outer: gsap.core.Timeline = gsap
        .timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: stage,
            start: "top 80%",
            end: () => `+=${window.innerHeight * (APPROACH_VH + PIN_VH)}`,
            scrub: 0.7,
            invalidateOnRefresh: true,
          },
          onUpdate: () => {
            const d = outer.time() >= approach + DARK_AT;
            if (d !== dark) {
              dark = d;
              inner.classList.toggle("surface-dark", d);
            }
          },
        })
        .to(q("[data-fb-word]"), { yPercent: 0, duration: approach * 0.5, stagger: approach * 0.05, ease: "power3.out" }, approach * 0.15)
        .fromTo(q("[data-fb-rule]"), { scaleX: 0 }, { scaleX: 1, duration: approach * 0.4 }, approach * 0.4)
        .to(aLines, { yPercent: 0, duration: approach * 0.4, stagger: approach * 0.05, ease: "power3.out" }, approach * 0.45)
        .add(pin, approach);

      ScrollTrigger.sort();
      ScrollTrigger.refresh();
      return () => {
        pinST.kill();
        splits.forEach((s) => s.revert());
        inner.classList.remove("surface-dark");
      };
    },
    { scope: ref, dependencies: [story], revertOnUpdate: true },
  );

  return (
    <section
      ref={ref}
      aria-labelledby="fest-benefits-title"
      className={cx("surface-light arc-next relative z-10", !story && "arc-prev")}
      style={story ? { paddingTop: "var(--arc-depth)", paddingBottom: "var(--arc-depth)" } : undefined}
    >
      <ArcSurface tone="paper" parallax="[data-fh-inner]" />

      {!story ? (
        <StaticLayout />
      ) : (
        <>
          {/* The section ends dark: the next section's arc rises over this strip. */}
          <div aria-hidden className="surface-dark absolute inset-x-0 bottom-0 h-[calc(var(--arc-depth)+2px)] bg-carbon-deep" />

          {/* overflow-x only: when the next section's parallax pushes the content down,
              it must stay visible beside that section's arc (not clipped to a black strip) */}
          <div data-stage className="pin-screen relative overflow-x-clip">
            {/* Part 2's dark stage: clipped to a circle that grows out of FEST. */}
            <div data-fb-night aria-hidden className="absolute inset-0 bg-carbon-deep" />

            {/* Inner wrapper: the next section's parallax moves this, never the pinned stage. */}
            <div
              data-fb-inner
              className="absolute inset-0 flex flex-col gap-4 px-5 pt-[clamp(5rem,11svh,7.5rem)] pb-6 md:px-10 lg:grid lg:grid-cols-12 lg:items-center lg:gap-10 lg:pb-10"
            >
              {/* Copy (left): one heading; the paragraph swaps between the parts */}
              <div className="flex shrink-0 flex-col justify-center lg:col-span-5">
                <Heading id="fest-benefits-title" />
                <span data-fb-rule aria-hidden className="mt-4 block h-[2px] w-20 origin-left bg-fern md:mt-6" />
                <div className="mt-4 grid text-[13px] leading-[1.55] md:mt-7 md:text-[clamp(0.95rem,1.15vw,1.15rem)] md:leading-relaxed">
                  <p data-fb-para className="col-start-1 row-start-1 text-carbon/80">
                    {dispatch}
                  </p>
                  <p data-fb-para data-fb-para-b className="col-start-1 row-start-1 text-paper/80">
                    {fuel}
                  </p>
                </div>
              </div>

              {/* Visual (right) */}
              <div className="relative min-h-0 flex-1 lg:col-span-6 lg:col-start-7 lg:h-[64svh] lg:flex-none">
                {/* Part 1: FEST, its factors, the dispatches */}
                <div className="absolute inset-0 flex items-center justify-center py-4 [container-type:size] lg:py-0">
                  <div data-fb-box className="relative aspect-square w-[min(100cqw,100cqh)]">
                    <div data-fb-core-wrap className="absolute inset-0">
                      <div
                        data-fb-ring
                        aria-hidden
                        className="absolute inset-[8%] rounded-full border border-dashed border-carbon/25"
                      />
                      <div data-fb-orbit className="absolute inset-0">
                        {FACTORS.map((f, i) => (
                          <div key={f} className="absolute inset-0" style={{ transform: `rotate(${ANGLES[i]}deg)` }}>
                            <div data-fb-arm className="absolute top-[8%] left-1/2 -translate-x-1/2 -translate-y-1/2">
                              <span
                                data-fb-chip
                                className="font-display block w-max max-w-[5.5rem] rounded-[10px] border border-carbon/15 bg-white px-2 py-1 text-center text-[0.62rem] leading-tight text-balance text-carbon shadow-[0_12px_30px_-16px_rgb(18_22_10/0.5)] md:max-w-[13rem] md:rounded-[14px] md:px-3.5 md:py-2 md:text-[clamp(0.78rem,1vw,0.95rem)]"
                              >
                                {f}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div
                        data-fb-core
                        className="absolute top-1/2 left-1/2 flex w-[26%] -translate-x-1/2 -translate-y-1/2 flex-col items-center rounded-full bg-carbon p-[5%] text-paper shadow-[0_0_0_10px_rgb(135_169_107/0.25),0_30px_60px_-24px_rgb(18_22_10/0.6)]"
                      >
                        <Image src={logoMark} alt="" sizes="80px" className="h-auto w-[55%] invert" />
                        <span className="font-condensed mt-1 text-[clamp(0.9rem,1.6vw,1.5rem)] leading-none tracking-[0.12em]">
                          FEST
                        </span>
                      </div>
                    </div>

                    {/* Outputs: hourly dispatches, then the assessment */}
                    <div className="absolute inset-x-0 bottom-[4%]">
                      <p
                        data-fb-out="0"
                        className="text-label mb-3 text-center whitespace-nowrap text-muted max-lg:mb-1.5 max-lg:text-[8px]"
                      >
                        {NERC_FRAGMENTS.dispatches}
                      </p>
                      <div className="relative flex h-[clamp(3.5rem,11svh,8rem)] items-end gap-[1.2%] overflow-hidden">
                        {DISPATCH.map((h, i) => (
                          <span
                            key={i}
                            data-fb-bar
                            className="block flex-1 origin-bottom rounded-t-[3px] bg-fern"
                            style={{ height: `${h * 100}%` }}
                          />
                        ))}
                        <span
                          data-fb-scan
                          aria-hidden
                          className="absolute top-0 bottom-0 left-0 w-[3px] -translate-x-full bg-carbon/70"
                        />
                      </div>
                      <p
                        data-fb-out="1"
                        className="font-display mt-4 text-center text-[clamp(1rem,1.6vw,1.5rem)] max-lg:mt-2"
                      >
                        {NERC_FRAGMENTS.emergencies}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Part 2: fuel inventory through the study period */}
                <div className="absolute inset-0 flex items-center justify-center [container-type:size]">
                  <div
                    data-fb-chart
                    className="relative aspect-[1200/640] w-[min(100cqw,calc(100cqh*1.875))] text-paper"
                  >
                    <svg
                      viewBox={`0 0 ${VB.w} ${VB.h}`}
                      preserveAspectRatio="none"
                      aria-hidden
                      className="absolute inset-0 size-full overflow-visible"
                    >
                      <line
                        data-fb-axis
                        x1={X0}
                        x2={X1}
                        y1={BASE}
                        y2={BASE}
                        stroke="currentColor"
                        strokeOpacity="0.35"
                        vectorEffect="non-scaling-stroke"
                      />
                      <g>
                        {HOURS.map((b, i) => (
                          <rect key={i} data-fb-hour x={b.x} y={BASE - b.h} width={BAR_W} height={b.h} fill="currentColor" opacity="0.85" />
                        ))}
                      </g>
                      {/* fuel storage, drawn on by a growing clip (a dash draw-on fails
                          with non-scaling strokes in Chrome: see the NERC chart) */}
                      <defs>
                        <clipPath id={clipId}>
                          <rect data-fb-reveal x={X0 - 4} y={0} width={X1 - X0 + 8} height={VB.h} />
                        </clipPath>
                      </defs>
                      <path
                        d={FUEL_PATH}
                        fill="none"
                        clipPath={`url(#${clipId})`}
                        stroke="var(--color-fern)"
                        strokeWidth="2"
                        vectorEffect="non-scaling-stroke"
                      />
                      <g data-fb-playhead>
                        <line y1={BASE - FULL - 30} y2={BASE} stroke="var(--color-fern)" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
                      </g>
                    </svg>

                    {/* the delivery: a fern dot where the storage steps back up */}
                    <span
                      data-fb-delivery
                      aria-hidden
                      className="absolute -mt-1.5 -ml-1.5 block size-3 rounded-full bg-fern shadow-[0_0_0_5px_rgb(135_169_107/0.25)]"
                      style={{ left: pct(DELIVERY_X, VB.w), top: pct(DELIVERY_Y, VB.h) }}
                    />
                    <span
                      data-fb-delivery
                      className="text-label absolute -translate-y-full bg-carbon-deep py-0.5 pr-1.5 pl-2 text-fern"
                      style={{ left: pct(DELIVERY_X, VB.w), top: pct(DELIVERY_Y - 18, VB.h) }}
                    >
                      ↑ {fuelDelivery}
                    </span>

                    {/* HTML labels stay crisp at any width */}
                    <span
                      data-fb-label
                      className="text-label absolute bg-carbon-deep py-0.5 pr-1.5 text-fern"
                      style={{ left: pct(X0, VB.w), top: pct(fuelY(0) - 34, VB.h) }}
                    >
                      Fuel storage
                    </span>
                    {/* Rides the playhead (see the timeline); this is its finished position. */}
                    <span
                      data-fb-demand
                      className="absolute -translate-x-full -translate-y-full pb-2"
                      style={{ left: pct(X1, VB.w), top: pct(BASE - FULL - 30, VB.h) }}
                    >
                      <span
                        data-fb-demand-label
                        className="text-label block bg-carbon-deep py-0.5 whitespace-nowrap text-paper/80"
                      >
                        Demand + operating reserves
                      </span>
                    </span>
                    <span
                      data-fb-label
                      className="text-label absolute flex items-center gap-3 text-paper/80"
                      style={{ left: pct(X0, VB.w), right: pct(VB.w - X1, VB.w), top: pct(BASE + 22, VB.h) }}
                    >
                      Hour by hour — through the study period
                      <span aria-hidden className="h-px flex-1 bg-current opacity-40" />
                      <span aria-hidden>→</span>
                    </span>
                  </div>
                </div>
                <p className="sr-only">
                  Diagram, in two parts. First, FEST sits at the centre with the factors it accounts for circling it:
                  interface limits, demand response programs, site generator fuel storage constraints, natural gas
                  pipeline fuel scarcity and generators’ operating temperature limits. They are pulled in, and FEST
                  sends out generation dispatches for each hour, which are assessed to forecast potential Energy
                  Emergencies. Second, a row of hourly bars through the study period, with a stepped fuel storage line
                  that depletes over time and steps back up once at a fuel delivery.
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
