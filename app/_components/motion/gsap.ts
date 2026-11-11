"use client";

/**
 * Single place GSAP plugins are registered. Every animated component imports
 * gsap / ScrollTrigger / SplitText / useGSAP from here, never from "gsap" directly.
 * (SplitText ships free with gsap ≥ 3.13.)
 */
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP);
  gsap.defaults({ ease: "power3.out", duration: 1 });
}

/** Media queries shared by every animated section. */
export const MQ = {
  motion: "(prefers-reduced-motion: no-preference)",
  reduce: "(prefers-reduced-motion: reduce)",
  desktopMotion: "(prefers-reduced-motion: no-preference) and (min-width: 1024px)",
  mobileMotion: "(prefers-reduced-motion: no-preference) and (max-width: 1023.98px)",
} as const;

export { gsap, ScrollTrigger, SplitText, useGSAP };
