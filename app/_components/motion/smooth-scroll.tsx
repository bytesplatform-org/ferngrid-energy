"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger, MQ } from "./gsap";

let lenisInstance: Lenis | null = null;

/** The active Lenis instance, or null under reduced motion / before mount. */
export function getLenis() {
  return lenisInstance;
}

/** Scroll to a y position or element, through Lenis when it's running. */
export function scrollToTarget(target: number | HTMLElement, opts: { immediate?: boolean } = {}) {
  if (lenisInstance) {
    lenisInstance.scrollTo(target, { immediate: opts.immediate, duration: 1.2 });
  } else if (typeof target === "number") {
    window.scrollTo({ top: target });
  } else {
    target.scrollIntoView();
  }
}

/** Freeze/unfreeze page scroll (used by the mobile menu overlay). */
export function setScrollLocked(locked: boolean) {
  if (lenisInstance) {
    if (locked) lenisInstance.stop();
    else lenisInstance.start();
  }
  document.documentElement.style.overflow = locked ? "hidden" : "";
}

/**
 * Lenis smooth scrolling driven by gsap.ticker and synced with ScrollTrigger.
 * Renders nothing. Disabled entirely under prefers-reduced-motion.
 */
export function SmoothScroll() {
  useEffect(() => {
    const refresh = () => {
      ScrollTrigger.sort();
      ScrollTrigger.refresh();
    };

    let lenis: Lenis | null = null;
    let tick: ((time: number) => void) | null = null;

    if (window.matchMedia(MQ.motion).matches) {
      lenis = new Lenis({ lerp: 0.1, anchors: { offset: 0 }, autoRaf: false });
      lenisInstance = lenis;
      lenis.on("scroll", ScrollTrigger.update);
      tick = (time: number) => lenis?.raf(time * 1000);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);
    }

    // Re-measure once webfonts and images have settled (line breaks / heights change).
    let cancelled = false;
    document.fonts?.ready.then(() => !cancelled && refresh());
    if (document.readyState === "complete") requestAnimationFrame(refresh);
    else window.addEventListener("load", refresh, { once: true });

    return () => {
      cancelled = true;
      window.removeEventListener("load", refresh);
      if (tick) gsap.ticker.remove(tick);
      lenis?.destroy();
      if (lenisInstance === lenis) lenisInstance = null;
    };
  }, []);

  return null;
}
