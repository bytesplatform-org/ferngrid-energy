"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { gsap, useGSAP, MQ } from "../motion/gsap";
import { HeroGrid } from "./hero-grid";

/** Scroll distance the hero stays pinned for the headline swap. */
const PIN_LENGTH = "180%";
/** Max drift (px) at the hero's edges: the video moves against the cursor, the text with it. */
const DRIFT = 32;
const GRID_DRIFT = 14;
const TEXT_DRIFT = 14;
/** Extra drift for the annotations on top of the text's (nearest layer). */
const ANNO_DRIFT = 12;
/** Over-scale so the video drift never reveals an edge. */
const SCALE = 1.08;

const VIDEO_SRC = "/hero/hero.mp4";

/**
 * Hero section shell.
 * - Background: the poster still (server-rendered, LCP) with a looping muted
 *   video faded in over it once it plays. The video only loads when motion is
 *   allowed and pauses while the hero is off screen.
 * - Cursor parallax (mouse/trackpad only; off under reduced motion): the video
 *   drifts against the cursor and the centre text drifts with it.
 */
export function HeroStage({ backdrop, children }: { backdrop: ReactNode; children: ReactNode }) {
  const sectionRef = useRef<HTMLElement>(null);
  const layerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    const section = sectionRef.current;
    if (!video || !section || !window.matchMedia(MQ.motion).matches) return;

    const show = () => video.classList.replace("opacity-0", "opacity-100");
    video.addEventListener("playing", show, { once: true });
    video.src = VIDEO_SRC;

    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) video.play().catch(() => {});
      else video.pause();
    });
    io.observe(section);

    return () => {
      io.disconnect();
      video.removeEventListener("playing", show);
      video.pause();
      video.removeAttribute("src");
      video.load();
    };
  }, []);

  // Pinned, scroll-scrubbed headline swap: the wordmark blurs out, then the
  // tagline blurs in word by word. After the pin the hero scrolls away normally.
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MQ.motion, () => {
        const section = sectionRef.current!;
        const words = section.querySelectorAll<HTMLElement>("[data-hero-word]");

        // Annotations + LLC ring draw in on load (they start hidden via their classes).
        gsap
          .timeline({ delay: 0.9 })
          .set("[data-anno], [data-llc-ring]", { autoAlpha: 1 })
          .fromTo(
            "[data-anno-path]",
            { strokeDashoffset: 1 },
            { strokeDashoffset: 0, duration: 1.1, ease: "power2.inOut", stagger: 0.15 },
          )
          .from("[data-anno] span", { autoAlpha: 0, y: 6, duration: 0.6, ease: "power2.out", stagger: 0.12 }, 0.35);
        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: `+=${PIN_LENGTH}`,
            pin: true,
            scrub: 0.6,
          },
        });
        tl.to(
          "[data-hero-wordmark]",
          { autoAlpha: 0, filter: "blur(20px)", scale: 0.96, duration: 0.3, ease: "power1.in" },
          0.02,
        )
          .fromTo(
            words,
            { autoAlpha: 0, filter: "blur(14px)", y: 18 },
            { autoAlpha: 1, filter: "blur(0px)", y: 0, duration: 0.14, stagger: 0.09, ease: "power2.out" },
            0.3,
          )
          // brief hold on the full tagline before the pin releases
          .to({}, { duration: 0.12 });
      });
    },
    { scope: sectionRef },
  );

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference) and (hover: hover) and (pointer: fine)", () => {
        const section = sectionRef.current!;
        const layer = layerRef.current!;
        gsap.set(layer, { scale: SCALE });
        const text = section.querySelector<HTMLElement>("[data-hero-text]");
        const grid = section.querySelector<HTMLElement>("[data-hero-grid]");
        const annos = section.querySelector<HTMLElement>("[data-hero-annos]");
        const ease = { duration: 1.4, ease: "power3.out" };
        const xTo = gsap.quickTo(layer, "x", ease);
        const yTo = gsap.quickTo(layer, "y", ease);
        const txTo = text ? gsap.quickTo(text, "x", ease) : null;
        const tyTo = text ? gsap.quickTo(text, "y", ease) : null;
        const gxTo = grid ? gsap.quickTo(grid, "x", ease) : null;
        const gyTo = grid ? gsap.quickTo(grid, "y", ease) : null;
        const axTo = annos ? gsap.quickTo(annos, "x", ease) : null;
        const ayTo = annos ? gsap.quickTo(annos, "y", ease) : null;

        // Listen on the window (the fixed navbar sits over the hero, so section
        // events would stop at it); only react while the hero is on screen.
        const onMove = (e: PointerEvent) => {
          if (section.getBoundingClientRect().bottom <= 0) return;
          // -1…1 from the centre of the screen
          const nx = (e.clientX / window.innerWidth - 0.5) * 2;
          const ny = (e.clientY / window.innerHeight - 0.5) * 2;
          xTo(-nx * DRIFT);
          yTo(-ny * DRIFT);
          txTo?.(nx * TEXT_DRIFT);
          tyTo?.(ny * TEXT_DRIFT);
          gxTo?.(-nx * GRID_DRIFT);
          gyTo?.(-ny * GRID_DRIFT);
          axTo?.(nx * ANNO_DRIFT);
          ayTo?.(ny * ANNO_DRIFT);
        };
        const onLeave = () => {
          xTo(0);
          yTo(0);
          txTo?.(0);
          tyTo?.(0);
          gxTo?.(0);
          gyTo?.(0);
          axTo?.(0);
          ayTo?.(0);
        };
        window.addEventListener("pointermove", onMove, { passive: true });
        document.documentElement.addEventListener("pointerleave", onLeave);
        return () => {
          window.removeEventListener("pointermove", onMove);
          document.documentElement.removeEventListener("pointerleave", onLeave);
        };
      });
    },
    { scope: sectionRef },
  );

  return (
    <section
      ref={sectionRef}
      id="top"
      aria-labelledby="hero-title"
      className="surface-dark relative z-0 h-[calc(100svh+var(--arc-depth))] min-h-[calc(560px+var(--arc-depth))] w-full overflow-hidden bg-carbon-deep"
    >
      {/* Inner wrapper: the next section's parallax moves this, never the pinned section itself. */}
      <div data-hero-inner className="absolute inset-0">
        <div ref={layerRef} className="absolute inset-0 will-change-transform">
          {backdrop}
          <video
            ref={videoRef}
            aria-hidden
            muted
            loop
            playsInline
            preload="none"
            className="absolute inset-0 size-full object-cover opacity-0 transition-opacity duration-700"
          />
        </div>

        {/* Carbon vignette: radial plus top/bottom so nav and text stay legible. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 [background:radial-gradient(120%_85%_at_50%_40%,transparent_45%,rgb(18_22_10/0.5)_100%),linear-gradient(to_bottom,rgb(18_22_10/0.72)_0%,rgb(18_22_10/0.05)_20%,rgb(18_22_10/0)_42%,rgb(18_22_10/0.55)_72%,rgb(18_22_10/0.45)_100%)]"
        />

        {/* Power-grid line art (mid depth). */}
        <div data-hero-grid className="absolute inset-x-0 top-0 h-svh min-h-[560px]">
          <HeroGrid />
        </div>

        {/* Content occupies the first screen; the strip below the fold shows through the next section's curve. */}
        <div className="absolute inset-x-0 top-0 h-svh min-h-[560px]">{children}</div>
      </div>
    </section>
  );
}
