"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, MQ } from "./motion/gsap";
import { playIntro } from "./motion/intro";
import { setScrollLocked } from "./motion/smooth-scroll";

/** The loader never finishes faster than this (s)… */
const MIN_TIME = 1.8;
/** …and never waits longer than this, whatever is still loading (s). */
const MAX_TIME = 6;

/**
 * Full-screen loader shown on the first page load.
 *
 * The FERNGRID ENERGY lockup "charges" with fern from left to right while a
 * counter runs to 100, driven by real progress (webfonts, page images, the
 * hero video) with a minimum and maximum duration. Then the panel lifts away on
 * a curved edge, and every entrance registered through `onIntro` (hero, header,
 * buttons) plays on the same timeline. Scrolling is locked until it's done.
 *
 * Rendered on the server so it covers the page from the first paint (only when
 * JS is available: `html.js`). A CSS failsafe fades it out if scripts never run.
 */
export function Loader() {
  const ref = useRef<HTMLDivElement>(null);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const html = document.documentElement;
    setScrollLocked(true);
    window.scrollTo(0, 0);

    const q = gsap.utils.selector(root);
    const fill = q("[data-fill]")[0] as HTMLElement;
    const bar = q("[data-bar]")[0] as HTMLElement;
    const digits = q("[data-digit]") as HTMLElement[];
    const reduced = window.matchMedia(MQ.reduce).matches;

    // --- progress: weighted milestones, smoothed, clamped by time ---------------
    const t0 = performance.now();
    const milestones = { fonts: false, load: false, video: false };
    const weights = { fonts: 0.3, load: 0.35, video: 0.35 };
    const done = (k: keyof typeof milestones) => () => {
      milestones[k] = true;
    };
    document.fonts?.ready.then(done("fonts"));
    if (!document.fonts) milestones.fonts = true;
    if (document.readyState === "complete") milestones.load = true;
    else window.addEventListener("load", done("load"), { once: true });
    const video = document.querySelector<HTMLVideoElement>("#top video");
    if (!video || reduced) milestones.video = true;
    else if (video.readyState >= 3) milestones.video = true;
    else {
      video.addEventListener("canplay", done("video"), { once: true });
      video.addEventListener("error", done("video"), { once: true });
    }

    const state = { p: 0 };
    let exiting = false;
    const render = () => {
      const pct = Math.round(state.p * 100);
      const s = String(pct).padStart(3, "0");
      digits.forEach((d, i) => (d.textContent = s[i]));
      fill.style.clipPath = `inset(0 ${100 - state.p * 100}% 0 0)`;
      bar.style.transform = `scaleX(${state.p})`;
    };
    const tick = () => {
      const elapsed = (performance.now() - t0) / 1000;
      const real = (Object.keys(milestones) as (keyof typeof milestones)[]).reduce(
        (sum, k) => sum + (milestones[k] ? weights[k] : 0),
        0.04,
      );
      // time keeps it moving (never past 92% until things have actually loaded)
      const timeFloor = Math.min(0.92, elapsed / MIN_TIME);
      let goal = Math.min(Math.max(real, timeFloor * 0.6), timeFloor + 0.08, 1);
      if (real >= 0.99 && elapsed >= MIN_TIME) goal = 1;
      if (elapsed >= MAX_TIME) goal = 1;
      state.p += (goal - state.p) * (goal === 1 ? 0.12 : 0.06);
      if (goal === 1 && state.p > 0.995) state.p = 1;
      render();
      if (state.p === 1 && !exiting) {
        exiting = true;
        gsap.ticker.remove(tick);
        exit();
      }
    };

    // --- exit: lift the panel, play every registered entrance on one clock --------
    let unlocked = false;
    const unlock = () => {
      if (unlocked) return;
      unlocked = true;
      html.classList.remove("is-loading");
      setScrollLocked(false);
    };
    const exit = () => {
      // The loader unmounts once every entrance has played…
      const tl = gsap.timeline({
        onComplete: () => {
          unlock();
          setGone(true);
        },
      });
      if (reduced) {
        tl.to(root, { autoAlpha: 0, duration: 0.4, ease: "power1.out" }).call(unlock);
        playIntro(tl);
        return;
      }
      tl.to(q("[data-charge]"), { autoAlpha: 1, duration: 0.15 }, 0)
        .to(q("[data-lockup]"), { yPercent: -40, autoAlpha: 0, duration: 0.6, ease: "power3.in" }, 0.15)
        .to(digits, { yPercent: -110, duration: 0.5, stagger: 0.05, ease: "power3.in" }, 0.15)
        .to(q("[data-meta]"), { autoAlpha: 0, duration: 0.3 }, 0.15)
        // up and fully clear, including the curved edge hanging below the panel
        .to(
          root,
          {
            y: () => -(root.offsetHeight + (q("[data-edge]")[0] as Element).getBoundingClientRect().height + 2),
            duration: 1.15,
            ease: "expo.inOut",
          },
          0.45,
        )
        // the curved edge flattens as it leaves
        .fromTo(q("[data-edge]"), { scaleY: 1 }, { scaleY: 0.2, duration: 1.15, ease: "expo.inOut" }, 0.45)
        // …but scrolling comes back as soon as the panel has cleared the screen.
        .call(unlock, undefined, 1.6);
      playIntro(tl);
    };

    render();
    gsap.ticker.add(tick);
    return () => {
      gsap.ticker.remove(tick);
    };
  }, []);

  if (gone) return null;

  return (
    <div
      ref={ref}
      role="status"
      aria-live="polite"
      className="loader-failsafe fixed inset-0 z-[100] hidden flex-col bg-carbon-deep text-paper [.js_&]:flex"
    >
      <span className="sr-only">Loading FernGrid Energy</span>

      {/* faint grid behind everything */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:linear-gradient(to_right,var(--color-paper)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-paper)_1px,transparent_1px)] [background-size:clamp(48px,8vw,120px)_clamp(48px,8vw,120px)] [mask-image:radial-gradient(70%_60%_at_50%_50%,#000,transparent)]"
      />

      {/* Lockup: outline, with a fern fill clipped to the progress */}
      <div aria-hidden className="relative flex flex-1 items-center justify-center px-5">
        <div data-lockup className="relative text-center uppercase select-none">
          <Lockup className="text-transparent [-webkit-text-stroke:1px_rgb(248_249_247/0.28)]" />
          <div data-fill className="absolute inset-0 [clip-path:inset(0_100%_0_0)]">
            <Lockup className="text-fern" />
          </div>
          {/* brief paper flash once fully charged */}
          <div data-charge className="invisible absolute inset-0 opacity-0">
            <Lockup className="text-paper" />
          </div>
        </div>
      </div>

      {/* Bottom bar: name, counter, progress rule */}
      <div aria-hidden className="relative px-5 pb-6 md:px-10 md:pb-10">
        <div className="flex items-end justify-between gap-6">
          <p data-meta className="text-label text-paper/55">FernGrid Energy LLC</p>
          <p className="flex overflow-hidden font-mono text-[clamp(3rem,9vw,8rem)] leading-[0.85] tabular-nums">
            {[0, 1, 2].map((i) => (
              <span key={i} data-digit className="inline-block">
                0
              </span>
            ))}
          </p>
        </div>
        <div className="mt-5 h-px w-full bg-paper/15">
          <div data-bar className="h-full origin-left scale-x-0 bg-fern" />
        </div>
      </div>

      {/* Curved bottom edge (below the panel) that sweeps up as it lifts */}
      <svg
        data-edge
        aria-hidden
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="absolute inset-x-0 top-full block h-[var(--arc-depth)] w-full origin-top fill-carbon-deep"
      >
        <path d="M0 0 Q50 200 100 0 Z" />
      </svg>
    </div>
  );
}

function Lockup({ className }: { className?: string }) {
  return (
    <div className={className}>
      <span className="font-display block text-[clamp(2.75rem,9vw,9.5rem)] leading-[0.86] font-semibold tracking-[0.06em]">
        FernGrid
      </span>
      <span className="font-display block text-[clamp(3.6rem,12vw,12.7rem)] leading-[0.86] font-normal tracking-[0.04em]">
        Energy
      </span>
    </div>
  );
}
