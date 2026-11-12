"use client";

import { Fragment, useRef, useState } from "react";
import { FRAGMENTS, NERC } from "@/lib/content";
import { gsap, ScrollTrigger, useGSAP, MQ } from "../motion/gsap";
import { scrollToTarget } from "../motion/smooth-scroll";
import { cx } from "../ui/primitives";
import { Callouts } from "./callouts";
import { PointCloud, type PointCloudHandle } from "./point-cloud";
import { SHAPES } from "./shapes";

/** Short titles for the four BAL-007-1 requirements (structural labels). */
const STEPS = ["Load", "Generation", "Transfers", "Transmission"] as const;

/** carbon → warmer carbon → olive-tinted carbon, blended continuously with scroll */
const TONES = ["#1d220f", "#21230f", "#222711", "#252c14"];

/** Scroll distance (viewport heights) the story stays pinned for. */
const PIN_VH = 4.6;
/** Scroll distance (viewport heights) of the approach, from "top 80%" to the pin. */
const APPROACH_VH = 0.8;

const words = (text: string) => text.split(" ");

/** Masked words for rise-in reveals. */
function MaskedWords({ text, attr }: { text: string; attr: string }) {
  return words(text).map((w, i) => (
    <Fragment key={i}>
      {i > 0 && " "}
      <span className="-mb-[0.14em] inline-block overflow-hidden pb-[0.14em] align-bottom">
        <span {...{ [attr]: "" }} className="inline-block">
          {w}
        </span>
      </span>
    </Fragment>
  ));
}

/**
 * 03 — What a Near-Term ERA must account for. A pinned, scroll-scrubbed story
 * (same structure as Our Software: one timeline owns everything):
 * 1. "New BAL-007-1 Requirements" rises in, huge; then parks small top-left.
 * 2. The intro brightens word by word.
 * 3. The four requirements slide in horizontally; the point cloud morphs
 *    continuously with scroll between their shapes; a quiet step row tracks
 *    (and jumps to) the current one.
 * 4. Closing line rises in, holds, releases.
 * Static stacked layout without JS / under reduced motion.
 */
export function EraScene() {
  const ref = useRef<HTMLElement>(null);
  const cloudRef = useRef<PointCloudHandle>(null);
  const jumpRef = useRef<(i: number) => void>(() => {});
  const [story, setStory] = useState(false);
  const reqs = NERC.requirements.accountFor;

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
      if (!story || !section) return;
      const q = gsap.utils.selector(section);
      const W = () => window.innerWidth;
      const n = STEPS.length;
      const callouts = q("[data-callouts]");
      const stepBtns = q("[data-step]");

      // Explicit starting states (staggered tweens only pre-render their first target).
      gsap.set(q("[data-heading-word]"), { yPercent: 120 });
      gsap.set(q("[data-kicker]"), { autoAlpha: 0, y: 12 });
      gsap.set(q("[data-intro]"), { autoAlpha: 0 });
      gsap.set(q("[data-intro-word]"), { opacity: 0.14 });
      gsap.set(q("[data-track]"), { x: W });
      gsap.set(q("[data-visual]"), { autoAlpha: 0, scale: 0.92 });
      gsap.set(q("[data-steps]"), { autoAlpha: 0, y: 16 });
      gsap.set(callouts, { autoAlpha: 0 });
      gsap.set(q("[data-closing-word]"), { yPercent: 120 });

      // Scroll-driven position through the requirements (0 … n-1, fractional).
      const proxy = { f: 0 };
      let lastActive = -1;
      const tone = gsap.utils.interpolate(TONES);
      const renderSteps = () => {
        const f = proxy.f;
        const a = Math.min(n - 1, Math.floor(f));
        const b = Math.min(n - 1, a + 1);
        cloudRef.current?.blend(a, b, f - a);
        callouts.forEach((c, i) => gsap.set(c, { autoAlpha: Math.max(0, 1 - Math.abs(f - i) * 3) }));
        gsap.set(section, { backgroundColor: tone(f / (n - 1)) });
        const active = Math.round(f);
        if (active !== lastActive) {
          lastActive = active;
          stepBtns.forEach((btn, i) => {
            if (i === active) btn.setAttribute("aria-current", "step");
            else btn.removeAttribute("aria-current");
          });
        }
      };

      // ---- pinned part -------------------------------------------------------
      const pin = gsap.timeline({ defaults: { ease: "none" } });
      pin
        // heading rolls out; kicker (same heading, small) parks top-left
        .to(q("[data-heading-word]"), { yPercent: -120, duration: 0.1, stagger: 0.02, ease: "power3.in" }, 0.02)
        .to(q("[data-kicker]"), { autoAlpha: 1, y: 0, duration: 0.06 }, 0.1)
        // intro brightens word by word
        .to(q("[data-intro]"), { autoAlpha: 1, duration: 0.04 }, 0.1)
        .to(q("[data-intro-word]"), { opacity: 1, duration: 0.02, stagger: 0.24 / words(NERC.requirements.intro).length }, 0.14)
        .to(q("[data-intro]"), { autoAlpha: 0, yPercent: -18, filter: "blur(10px)", duration: 0.08 }, 0.44)
        // first requirement slides in, illustration appears
        .to(q("[data-track]"), { x: 0, duration: 0.14, ease: "power3.out" }, 0.48)
        .to(q("[data-visual]"), { autoAlpha: 1, scale: 1, duration: 0.12, ease: "power3.out" }, 0.5)
        .to(q("[data-steps]"), { autoAlpha: 1, y: 0, duration: 0.06 }, 0.54)
        .addLabel("step0", 0.64);

      // rest on each requirement, then slide to the next while the dots morph
      let t = 0.64;
      for (let i = 1; i < n; i++) {
        t += 0.16;
        pin
          .to(q("[data-track]"), { x: () => -i * W(), duration: 0.24, ease: "power2.inOut" }, t)
          .to(proxy, { f: i, duration: 0.24, ease: "power2.inOut", onUpdate: renderSteps }, t);
        t += 0.24;
        pin.addLabel(`step${i}`, t);
      }
      t += 0.16;

      // closing line takes over
      pin
        .to(q("[data-track], [data-visual], [data-steps], [data-kicker]"), { autoAlpha: 0, duration: 0.08 }, t)
        .to(q("[data-closing-word]"), { yPercent: 0, duration: 0.1, stagger: 0.012, ease: "power3.out" }, t + 0.06)
        // hold the finished scene (the next section's arc rises over the end of the pin)
        .to({}, { duration: 0.36 });

      // ---- master: approach (heading rises) + pinned part, one ScrollTrigger --
      const approach = (pin.duration() * APPROACH_VH) / PIN_VH;
      const master = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: section,
          start: "top 80%",
          end: () => `+=${window.innerHeight * (APPROACH_VH + PIN_VH)}`,
          scrub: 0.7,
          invalidateOnRefresh: true,
        },
      });
      master
        .to(q("[data-heading-word]"), { yPercent: 0, duration: approach * 0.85, stagger: approach * 0.05, ease: "power3.out" }, 0)
        .add(pin, approach);

      ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: () => `+=${window.innerHeight * PIN_VH}`,
        pin: true,
        invalidateOnRefresh: true,
      });

      renderSteps();

      // Step buttons scroll to their resting point.
      jumpRef.current = (i: number) => {
        const st = master.scrollTrigger;
        if (!st) return;
        const time = approach + pin.labels[`step${i}`];
        scrollToTarget(st.start + (time / master.duration()) * (st.end - st.start));
      };

      ScrollTrigger.sort();
      ScrollTrigger.refresh();

      return () => {
        jumpRef.current = () => {};
      };
    },
    { scope: ref, dependencies: [story], revertOnUpdate: true },
  );

  /* ---------------------------------------------------------------------- */
  /* Static layout (no JS / reduced motion)                                  */
  /* ---------------------------------------------------------------------- */
  if (!story) {
    return (
      <section
        ref={ref}
        aria-labelledby="era-title"
        className="surface-dark arc-prev relative z-10 overflow-clip bg-carbon px-5 pt-24 md:px-10 md:pt-32"
      >
        <div className="mx-auto max-w-[1600px]">
          <h2 id="era-title" className="font-condensed text-[clamp(2.5rem,6vw,6rem)] leading-[0.9] uppercase">
            {NERC.requirements.heading}
          </h2>
          <p className="mt-6 max-w-[58ch] text-lg leading-relaxed text-muted">{NERC.requirements.intro}</p>
        </div>
        <ol className="mx-auto mt-16 max-w-[1600px] space-y-20 md:mt-24">
          {STEPS.map((title, i) => (
            <li key={title} className="grid gap-10 border-t border-line pt-10 md:grid-cols-2 md:gap-12">
              <div>
                <h3 className="font-display text-[clamp(3rem,6.4vw,7.5rem)] leading-[0.9]">{title}</h3>
                <p className="mt-6 max-w-[40ch] text-lg leading-relaxed text-paper/80">{reqs[i]}</p>
              </div>
              <div className="relative mx-auto aspect-square w-full max-w-[460px]">
                <PointCloud mode="static" initial={i} className="absolute inset-0 size-full" />
                <Callouts items={SHAPES[i].callouts} />
              </div>
            </li>
          ))}
        </ol>
        <p className="font-display mx-auto mt-28 max-w-[22ch] text-center text-[clamp(2.25rem,6vw,7rem)] leading-[0.98] md:mt-40">
          {FRAGMENTS.eeaForecast}
        </p>
      </section>
    );
  }

  /* ---------------------------------------------------------------------- */
  /* Story layout                                                            */
  /* ---------------------------------------------------------------------- */
  return (
    <section
      ref={ref}
      aria-labelledby="era-title"
      className="surface-dark arc-prev relative z-10 h-svh overflow-hidden bg-carbon"
    >
      {/* 1. Heading, huge and centred */}
      <div className="pointer-events-none absolute inset-0 grid place-items-center px-5 text-center">
        <h2
          id="era-title"
          className="font-condensed max-w-[12ch] text-[clamp(3.25rem,10.5vw,12rem)] leading-[0.88] uppercase"
        >
          <MaskedWords text={NERC.requirements.heading} attr="data-heading-word" />
        </h2>
      </div>

      {/* Kicker: the same heading, parked small top-left for context */}
      <div aria-hidden data-kicker className="absolute top-24 left-5 z-10 md:top-28 md:left-10">
        <p className="font-condensed text-[clamp(1.25rem,1.8vw,1.75rem)] leading-none uppercase">
          {NERC.requirements.heading}
        </p>
        <span className="mt-3 block h-[2px] w-14 bg-fern" />
      </div>

      {/* 2. Intro, revealed word by word */}
      <div
        data-intro
        className="pointer-events-none absolute inset-x-5 top-1/2 -translate-y-1/2 md:inset-x-10 lg:right-auto lg:w-[60vw]"
      >
        <p className="font-display text-[clamp(1.6rem,3.4vw,3.6rem)] leading-[1.12] text-paper">
          {words(NERC.requirements.intro).map((w, i) => (
            <Fragment key={i}>
              {i > 0 && " "}
              <span data-intro-word>{w}</span>
            </Fragment>
          ))}
        </p>
      </div>

      {/* 3. Requirements: a horizontal track of full-width panels */}
      <div data-track className="absolute inset-y-0 left-0 flex" style={{ width: `${STEPS.length * 100}vw` }}>
        {STEPS.map((title, i) => (
          <div key={title} className="relative h-full w-screen">
            <div className="absolute inset-x-5 bottom-[16%] md:inset-x-10 lg:top-1/2 lg:right-auto lg:bottom-auto lg:w-[42vw] lg:-translate-y-[30%]">
              <h3 className="font-display text-[clamp(3.25rem,8vw,9.5rem)] leading-[0.92]">{title}</h3>
              <p className="mt-5 max-w-[34ch] text-lg leading-relaxed text-paper/80 md:text-xl">{reqs[i]}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Illustration: one point cloud that morphs with scroll */}
      <div className="pointer-events-none absolute top-[17%] left-1/2 aspect-square w-[min(74vw,46vh)] -translate-x-1/2 lg:top-1/2 lg:right-10 lg:left-auto lg:w-[min(40vw,62vh)] lg:translate-x-0 lg:-translate-y-[46%]">
        <div data-visual className="absolute inset-0">
          <PointCloud ref={cloudRef} mode="morph" initial={0} className="absolute inset-0 size-full" />
          {SHAPES.map((shape) => (
            <div key={shape.key} data-callouts className="absolute inset-0">
              <Callouts items={shape.callouts} />
            </div>
          ))}
        </div>
      </div>

      {/* Step row: words only, current one underlined; click to jump */}
      <nav aria-label="BAL-007-1 requirements" className="absolute inset-x-0 bottom-6 z-20 flex justify-center px-5 md:bottom-8">
        <ul data-steps className="flex gap-5 md:gap-10">
          {STEPS.map((title, i) => (
            <li key={title}>
              <button
                type="button"
                data-step
                onClick={() => jumpRef.current(i)}
                className={cx(
                  "relative py-2 text-sm font-medium text-paper/50 transition-colors duration-300 hover:text-paper md:text-base",
                  "after:absolute after:inset-x-0 after:bottom-0 after:h-[2px] after:origin-left after:scale-x-0 after:bg-fern after:transition-transform after:duration-500",
                  "aria-[current=step]:text-paper aria-[current=step]:after:scale-x-100",
                )}
              >
                {title}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* 4. Closing line */}
      <div className="pointer-events-none absolute inset-0 grid place-items-center px-5 text-center md:px-10">
        <p className="font-display max-w-[20ch] text-[clamp(2.25rem,6vw,7rem)] leading-[1]">
          <MaskedWords text={FRAGMENTS.eeaForecast} attr="data-closing-word" />
        </p>
      </div>
    </section>
  );
}
