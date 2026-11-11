"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { gsap, ScrollTrigger, useGSAP, MQ } from "../motion/gsap";
import { FrameSequence, drawCover } from "./frame-sequence";
import { HERO_FRAME_COUNT } from "@/lib/hero-frames";

type Props = {
  mode: "scrub" | "video";
  backdrop: ReactNode;
  children: ReactNode;
};

const frameUrl = (dir: "frames" | "frames-sm") => (i: number) =>
  `/hero/${dir}/f_${String(i + 1).padStart(3, "0")}.webp`;

/** Scroll timing (fractions of the pinned scroll). Frames 100–114 dissolve at ≈0.52–0.60. */
const T = {
  phase1Out: 0.28,
  wordmarkOut: 0.3,
  taglineIn: 0.535,
  wordsStart: 0.565,
  contactIn: 0.72,
} as const;

/**
 * Client stage for the hero. Owns the canvas / video layer and the pinned
 * ScrollTrigger timeline. All text is server-rendered by the parent and passed
 * as children, so the hero is complete before (and without) JS.
 */
export function HeroStage({ mode, backdrop, children }: Props) {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Scrub mode: frame sequence + pinned timeline.
  useGSAP(
    () => {
      if (mode !== "scrub") return;
      const mm = gsap.matchMedia();

      mm.add(MQ.motion, () => {
        const section = sectionRef.current!;
        const canvas = canvasRef.current!;
        const ctx = canvas.getContext("2d", { alpha: true });
        if (!ctx) return;

        const small = window.innerWidth < 768;
        const state = { frame: 0 };
        let drawn = -1;
        let size = { w: 0, h: 0 };
        let lastImg: HTMLImageElement | null = null;

        const render = (force = false) => {
          const index = Math.round(state.frame);
          const img = seq.get(index);
          if (!img || (!force && index === drawn && img === lastImg)) return;
          ctx.clearRect(0, 0, size.w, size.h);
          drawCover(ctx, img, size.w, size.h);
          drawn = index;
          lastImg = img;
        };

        const seq = new FrameSequence(HERO_FRAME_COUNT, frameUrl(small ? "frames-sm" : "frames"), {
          onFrameLoaded: (i) => {
            // Repaint if the frame we need (or a closer neighbour) just arrived.
            if (Math.abs(i - Math.round(state.frame)) <= 12) render(true);
          },
        });

        const resize = () => {
          const dpr = Math.min(window.devicePixelRatio || 1, 2);
          const w = section.clientWidth;
          const h = section.clientHeight;
          canvas.width = Math.round(w * dpr);
          canvas.height = Math.round(h * dpr);
          size = { w: canvas.width, h: canvas.height };
          render(true);
        };
        const ro = new ResizeObserver(resize);
        ro.observe(section);
        resize();
        seq.start();

        const words = section.querySelectorAll<HTMLElement>("[data-word]");
        const next = section.nextElementSibling as HTMLElement | null;

        // Let the next section's arc rise over the final frames of the pin.
        if (next) gsap.set(next, { marginTop: "-40vh" });

        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: "+=300%",
            pin: true,
            scrub: 0.5,
            anticipatePin: 1,
          },
        });

        tl.to(state, { frame: HERO_FRAME_COUNT - 1, duration: 1, onUpdate: () => render() }, 0)
          .to("[data-hero-phase='1']", { autoAlpha: 0, y: -20, duration: 0.1, ease: "power2.in" }, T.phase1Out)
          // Wordmark drifts up slower than the footage and fades.
          .to("[data-hero-wordmark]", { yPercent: -40, autoAlpha: 0, duration: 0.22, ease: "power1.in" }, T.wordmarkOut)
          .to("[data-hero-vignette]", { opacity: 1, duration: 0.2 }, 0.45)
          .to("[data-hero-tagline]", { autoAlpha: 1, duration: 0.01 }, T.taglineIn)
          .fromTo(
            words,
            { yPercent: 115 },
            { yPercent: 0, duration: 0.07, stagger: 0.022, ease: "power3.out" },
            T.wordsStart,
          )
          .to("[data-hero-contact]", { autoAlpha: 1, duration: 0.05 }, T.contactIn);

        return () => {
          ro.disconnect();
          seq.dispose();
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        };
      });
    },
    { scope: sectionRef, dependencies: [mode] },
  );

  // Video mode: only attach the source when motion is allowed.
  useEffect(() => {
    if (mode !== "video") return;
    const video = videoRef.current;
    if (!video || !window.matchMedia(MQ.motion).matches) return;
    video.src = "/hero/hero.mp4";
    video.play().catch(() => {});
    return () => {
      video.pause();
      video.removeAttribute("src");
      video.load();
    };
  }, [mode]);

  // Subtle entrance for the static hero text (video mode only; scrub owns its own timing).
  useGSAP(
    () => {
      if (mode !== "video") return;
      const mm = gsap.matchMedia();
      mm.add(MQ.motion, () => {
        gsap.from("[data-hero-wordmark] > *, [data-word], [data-hero-phase]", {
          y: 24,
          autoAlpha: 0,
          duration: 1.2,
          ease: "expo.out",
          stagger: 0.05,
          delay: 0.15,
        });
        ScrollTrigger.refresh();
      });
    },
    { scope: sectionRef, dependencies: [mode] },
  );

  return (
    <section
      ref={sectionRef}
      id="top"
      data-hero-mode={mode}
      aria-labelledby="hero-title"
      className="surface-dark relative z-0 h-svh min-h-[560px] w-full overflow-hidden bg-carbon-deep"
    >
      {backdrop}

      {mode === "scrub" ? (
        <canvas ref={canvasRef} aria-hidden data-motion-only className="absolute inset-0 size-full" />
      ) : (
        <video
          ref={videoRef}
          aria-hidden
          data-motion-only
          muted
          loop
          playsInline
          preload="none"
          poster="/hero/poster.jpg"
          className="absolute inset-0 size-full object-cover"
        />
      )}

      {/* Carbon vignette: radial plus top/bottom so nav and text stay legible over bright cloud. */}
      <div
        aria-hidden
        data-hero-vignette
        className="pointer-events-none absolute inset-0 opacity-85 [background:radial-gradient(120%_85%_at_50%_45%,transparent_45%,rgb(18_22_10/0.6)_100%),linear-gradient(to_bottom,rgb(18_22_10/0.72)_0%,rgb(18_22_10/0.05)_26%,rgb(18_22_10/0)_55%,rgb(18_22_10/0.78)_100%)]"
      />

      {children}
    </section>
  );
}
