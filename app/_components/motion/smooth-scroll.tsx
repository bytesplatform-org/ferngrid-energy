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

    // Always start at the top (scroll restoration is disabled in the root layout),
    // unless the URL points at a section.
    if (!window.location.hash) window.scrollTo(0, 0);

    if (window.matchMedia(MQ.motion).matches) {
      lenis = new Lenis({ lerp: 0.1, anchors: { offset: 0 }, autoRaf: false });
      lenisInstance = lenis;
      lenis.on("scroll", ScrollTrigger.update);
      tick = (time: number) => lenis?.raf(time * 1000);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);
    }

    // A #hash target is only correct once every pin has added its scroll length
    // (some pins are created after hydration), so re-target it after each layout
    // refresh until the visitor takes over (or a few seconds pass).
    let pendingHash = window.location.hash.length > 1 ? decodeURIComponent(window.location.hash.slice(1)) : null;
    const toHash = () => {
      const target = pendingHash ? document.getElementById(pendingHash) : null;
      if (!target) return;
      const y = target.getBoundingClientRect().top + window.scrollY;
      if (lenis) lenis.scrollTo(y, { immediate: true });
      else window.scrollTo(0, y);
    };
    const stopHash = () => {
      pendingHash = null;
    };
    const userEvents = ["wheel", "touchstart", "keydown", "pointerdown"] as const;
    if (pendingHash) {
      ScrollTrigger.addEventListener("refresh", toHash);
      userEvents.forEach((e) => window.addEventListener(e, stopHash, { once: true, passive: true }));
    }
    const hashTimer = window.setTimeout(stopHash, 3000);

    // Re-measure once webfonts and images have settled (line breaks / heights change).
    let cancelled = false;
    document.fonts?.ready.then(() => !cancelled && refresh());
    if (document.readyState === "complete") requestAnimationFrame(refresh);
    else window.addEventListener("load", refresh, { once: true });

    return () => {
      cancelled = true;
      window.clearTimeout(hashTimer);
      ScrollTrigger.removeEventListener("refresh", toHash);
      userEvents.forEach((e) => window.removeEventListener(e, stopHash));
      window.removeEventListener("load", refresh);
      if (tick) gsap.ticker.remove(tick);
      lenis?.destroy();
      if (lenisInstance === lenis) lenisInstance = null;
    };
  }, []);

  return null;
}
