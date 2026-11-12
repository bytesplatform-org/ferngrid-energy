"use client";

import { Suspense, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { gsap, ScrollTrigger, MQ } from "./motion/gsap";
import { armIntro, playIntro } from "./motion/intro";
import {
  RESUME_KEY,
  routeCommitted,
  setTransitionHandler,
  waitForRoute,
} from "./motion/page-transition";
import {
  getLenis,
  scrollToTarget,
  setScrollLocked,
} from "./motion/smooth-scroll";

/** First load: never faster than this (s)… */
const MIN_TIME = 1.8;
/** …and never waits longer than this, whatever is still loading (s). */
const MAX_TIME = 6;
/** Page transitions: the charge takes at least this long (s)… */
const NAV_MIN_TIME = 0.45;
/** …and gives up waiting for the next page after this (s). */
const NAV_MAX_TIME = 8;

const nextFrame = () =>
  new Promise<void>((r) => requestAnimationFrame(() => r()));

/**
 * Full-screen loader: first load AND page transitions.
 *
 * First load: the FERNGRID ENERGY lockup "charges" with fern while a counter
 * runs to 100, driven by real progress (webfonts, page images, the hero video)
 * with a minimum and maximum duration. Then the panel lifts away on a curved
 * edge and every entrance registered through `onIntro` (hero, header, buttons)
 * plays on the same timeline.
 *
 * Page transitions: clicking an internal link to another page brings the panel
 * up from the bottom (curved top edge) to cover the page, the route changes
 * behind it while the lockup charges, then it lifts the same way to reveal the
 * new page, whose entrances play on the reveal.
 *
 * Scrolling is locked whenever the panel covers the page. Rendered on the server
 * so it covers the page from the first paint (only when JS is available:
 * `html.js`); a CSS failsafe fades it out if scripts never run.
 */
export function Loader() {
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const routerRef = useRef(router);
  useEffect(() => {
    routerRef.current = router;
  }, [router]);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const html = document.documentElement;
    const q = gsap.utils.selector(root);
    const fill = q("[data-fill]")[0] as HTMLElement;
    const bar = q("[data-bar]")[0] as HTMLElement;
    const digits = q("[data-digit]") as HTMLElement[];
    const edgeTop = q("[data-edge-top]")[0] as Element;
    const edgeBottom = q("[data-edge]")[0] as Element;
    const reduced = window.matchMedia(MQ.reduce).matches;
    let disposed = false;
    let busy = true; // covering the page (first load or a transition)
    let tick: (() => void) | null = null;

    // During a page transition the charge is persisted, so a full reload
    // mid-transition (unbuilt routes) picks it up instead of restarting at 0.
    let persist = false;
    let lastSaved = 0;
    const render = (p: number) => {
      const s = String(Math.round(p * 100)).padStart(3, "0");
      digits.forEach((d, i) => (d.textContent = s[i]));
      fill.style.clipPath = `inset(0 ${100 - p * 100}% 0 0)`;
      bar.style.transform = `scaleX(${p})`;
      if (persist && performance.now() - lastSaved > 80) {
        lastSaved = performance.now();
        try {
          sessionStorage.setItem(
            RESUME_KEY,
            JSON.stringify({ at: Date.now(), p }),
          );
        } catch {}
      }
    };

    /** Charge to 100: `readiness()` (0–1) is real progress, clamped by min/max time. */
    const charge = (
      minTime: number,
      maxTime: number,
      readiness: () => number,
      rate = 0.06,
      from = 0,
    ) =>
      new Promise<void>((resolve) => {
        const t0 = performance.now();
        let p = from;
        tick = () => {
          const elapsed = (performance.now() - t0) / 1000;
          const real = readiness();
          // time keeps it moving (never past 92% until things have actually loaded)
          const timeFloor = Math.min(0.92, elapsed / minTime);
          let goal = Math.max(
            p,
            Math.min(Math.max(real, timeFloor * 0.6), timeFloor + 0.08, 1),
          );
          if (real >= 0.99 && elapsed >= minTime) goal = 1;
          if (elapsed >= maxTime) goal = 1;
          p += (goal - p) * (goal === 1 ? rate * 2 : rate);
          if (goal === 1 && p > 0.995) p = 1;
          render(p);
          if (p === 1) {
            gsap.ticker.remove(tick!);
            tick = null;
            resolve();
          }
        };
        render(p);
        gsap.ticker.add(tick);
      });

    const unlock = () => {
      html.classList.remove("is-loading");
      setScrollLocked(false);
    };

    /** Lift the panel away and play every registered entrance on the same clock. */
    const reveal = (fast = false) =>
      new Promise<void>((resolve) => {
        // page transitions lift sooner and a little quicker than the first load
        const lift = fast ? 0.25 : 0.45;
        const dur = fast ? 0.95 : 1.15;
        const tl = gsap.timeline({
          onComplete: () => {
            unlock();
            gsap.set(root, { autoAlpha: 0 });
            busy = false;
            resolve();
          },
        });
        if (reduced) {
          tl.to(root, { autoAlpha: 0, duration: 0.4, ease: "power1.out" }).call(
            unlock,
          );
          playIntro(tl);
          return;
        }
        tl.to(q("[data-charge]"), { autoAlpha: 1, duration: 0.15 }, 0)
          .to(
            q("[data-lockup]"),
            { yPercent: -40, autoAlpha: 0, duration: 0.6, ease: "power3.in" },
            0.15,
          )
          .to(
            digits,
            { yPercent: -110, duration: 0.5, stagger: 0.05, ease: "power3.in" },
            0.15,
          )
          .to(q("[data-meta]"), { autoAlpha: 0, duration: 0.3 }, 0.15)
          // up and fully clear, including the curved edge hanging below the panel
          .fromTo(
            root,
            { y: 0 },
            {
              y: () =>
                -(
                  root.offsetHeight +
                  edgeBottom.getBoundingClientRect().height +
                  2
                ),
              duration: dur,
              ease: "expo.inOut",
            },
            lift,
          )
          // the curved edge flattens as it leaves
          .fromTo(
            edgeBottom,
            { scaleY: 1 },
            { scaleY: 0.2, duration: dur, ease: "expo.inOut" },
            lift,
          )
          // scrolling comes back as soon as the panel has cleared the screen
          .call(unlock, undefined, lift + dur);
        playIntro(tl);
      });

    /** Bring the panel up from the bottom to cover the current page. */
    const cover = () =>
      new Promise<void>((resolve) => {
        gsap.set(q("[data-lockup]"), { yPercent: 0, autoAlpha: 1 });
        gsap.set(digits, { yPercent: 0 });
        gsap.set(q("[data-meta]"), { autoAlpha: 1 });
        gsap.set(q("[data-charge]"), { autoAlpha: 0 });
        gsap.set([edgeTop, edgeBottom], { scaleY: 1 });
        render(0);
        if (reduced) {
          gsap.fromTo(
            root,
            { y: 0, autoAlpha: 0 },
            { autoAlpha: 1, duration: 0.3, onComplete: resolve },
          );
          return;
        }
        const below =
          root.offsetHeight + edgeTop.getBoundingClientRect().height + 2;
        gsap.set(root, { autoAlpha: 1, y: below });
        gsap
          .timeline({ onComplete: resolve })
          .to(root, { y: 0, duration: 0.8, ease: "expo.inOut" })
          // the curved top edge flattens as the panel settles
          .fromTo(
            edgeTop,
            { scaleY: 1 },
            { scaleY: 0.2, duration: 0.8, ease: "expo.inOut" },
            0,
          )
          .fromTo(
            q("[data-lockup]"),
            { yPercent: 30, autoAlpha: 0 },
            { yPercent: 0, autoAlpha: 1, duration: 0.6, ease: "power3.out" },
            0.45,
          );
      });

    /** Page transitions show the lockup charge without the counter. */
    const hideCount = () => gsap.set(q("[data-count]"), { autoAlpha: 0 });

    /** Cover → navigate behind the panel → wait for the new route to render → reveal. */
    const navigate = async (url: URL) => {
      busy = true;
      root.classList.remove("loader-failsafe");
      const href = url.pathname + url.search + url.hash;
      routerRef.current.prefetch(href);
      setScrollLocked(true);
      hideCount();
      await cover();
      if (disposed) return;
      setScrollLocked(true); // (closing the mobile menu may have released it)
      armIntro(); // the next page's entrances play on the reveal

      let ready = false;
      waitForRoute(url.pathname, NAV_MAX_TIME * 1000).then(
        () => (ready = true),
      );
      persist = true;
      routerRef.current.push(href, { scroll: false });
      await charge(NAV_MIN_TIME, NAV_MAX_TIME, () => (ready ? 1 : 0.35), 0.14);
      persist = false;
      try {
        sessionStorage.removeItem(RESUME_KEY);
      } catch {}
      if (disposed) return;
      await settleAndReveal(url.hash);
    };

    /** New page is in: start at its top (or #hash), let pins re-measure, reveal. */
    const settleAndReveal = async (hash: string) => {
      await nextFrame();
      await nextFrame();
      window.scrollTo(0, 0);
      getLenis()?.scrollTo(0, { immediate: true, force: true });
      ScrollTrigger.refresh();
      const target = hash
        ? document.getElementById(decodeURIComponent(hash.slice(1)))
        : null;
      if (target) scrollToTarget(target, { immediate: true });
      await reveal(true);
    };

    // Links (TransitionLink → onNavigate) hand their navigation over here.
    const releaseHandler = setTransitionHandler((url) => {
      if (url.origin !== window.location.origin) return false;
      if (busy) return true; // already covering: swallow extra clicks
      if (url.pathname === window.location.pathname) return false; // same page (#section)
      navigate(url);
      return true;
    });

    // --- first load: weighted milestones ----------------------------------------
    setScrollLocked(true);
    window.scrollTo(0, 0);
    const milestones = { fonts: false, load: false, video: false };
    const weights = { fonts: 0.3, load: 0.35, video: 0.35 };
    const done = (k: keyof typeof milestones) => () => {
      milestones[k] = true;
    };
    if (document.fonts) document.fonts.ready.then(done("fonts"));
    else milestones.fonts = true;
    if (document.readyState === "complete") milestones.load = true;
    else window.addEventListener("load", done("load"), { once: true });
    const video = document.querySelector<HTMLVideoElement>("#top video");
    if (!video || reduced || video.readyState >= 3) milestones.video = true;
    else {
      video.addEventListener("canplay", done("video"), { once: true });
      video.addEventListener("error", done("video"), { once: true });
    }
    const loaded = () =>
      (Object.keys(milestones) as (keyof typeof milestones)[]).reduce(
        (sum, k) => sum + (milestones[k] ? weights[k] : 0),
        0.04,
      );
    // A transition that ended in a full reload: carry on from where it was.
    let resume: number | null = null;
    try {
      const saved = JSON.parse(
        sessionStorage.getItem(RESUME_KEY) ?? "null",
      ) as { at: number; p: number } | null;
      if (saved && Date.now() - saved.at < 8000) resume = saved.p;
      sessionStorage.removeItem(RESUME_KEY);
    } catch {}
    const firstLoad = async () => {
      if (resume !== null) {
        hideCount();
        await charge(NAV_MIN_TIME, MAX_TIME, loaded, 0.14, resume);
        html.classList.remove("fg-resume");
        if (disposed) return;
        await settleAndReveal(window.location.hash);
      } else {
        await charge(MIN_TIME, MAX_TIME, loaded);
        if (disposed) return;
        await reveal();
      }
      root.classList.remove("loader-failsafe");
    };
    firstLoad();

    return () => {
      disposed = true;
      if (tick) gsap.ticker.remove(tick);
      releaseHandler();
    };
  }, []);

  return (
    <>
      <Suspense fallback={null}>
        <RouteWatcher />
      </Suspense>
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
        <div
          aria-hidden
          className="relative flex flex-1 items-center justify-center px-5"
        >
          <div
            data-lockup
            className="relative text-center uppercase select-none"
          >
            <Lockup className="text-transparent [-webkit-text-stroke:1px_rgb(248_249_247/0.28)]" />
            <div
              data-fill
              className="absolute inset-0 [clip-path:inset(0_100%_0_0)]"
            >
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
            <p data-meta className="text-label text-paper/55">
              FernGrid Energy LLC
            </p>
            <p
              data-count
              className="flex overflow-hidden font-mono text-[clamp(3rem,9vw,8rem)] leading-[0.85] tabular-nums"
            >
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

        {/* Curved top edge (above the panel): leads when it rises in to cover a page */}
        <svg
          data-edge-top
          aria-hidden
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="absolute inset-x-0 bottom-full block h-[var(--arc-depth)] w-full origin-bottom fill-carbon-deep"
        >
          <path d="M0 100 Q50 -100 100 100 Z" />
        </svg>

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
    </>
  );
}

/** Reports each committed route to the page transition (after React renders it). */
function RouteWatcher() {
  const pathname = usePathname();
  useEffect(() => {
    routeCommitted(pathname);
  }, [pathname]);
  return null;
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
