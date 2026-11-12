"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "./motion/gsap";

/** Elements that count as interactive for the hover state. */
const INTERACTIVE = 'a[href], button, [role="button"], [role="tab"], input, select, textarea, label, summary';
const HOVER_SCALE = 0.6;

/**
 * Cursor follower: a circle with `mix-blend-mode: difference` that eases toward
 * the pointer and shrinks a little over links and buttons. Mouse/trackpad only;
 * without motion it tracks the pointer directly. Purely decorative.
 */
export function Cursor() {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add(
      { fine: "(hover: hover) and (pointer: fine)", reduce: "(prefers-reduced-motion: reduce)" },
      (ctx) => {
        const { fine, reduce } = ctx.conditions as { fine: boolean; reduce: boolean };
        const dot = ref.current;
        if (!fine || !dot) return;

        const follow = reduce ? 0 : 0.45;
        const xTo = gsap.quickTo(dot, "x", { duration: follow, ease: "power3.out" });
        const yTo = gsap.quickTo(dot, "y", { duration: follow, ease: "power3.out" });
        let shown = false;
        let hovering = false;

        const onMove = (e: PointerEvent) => {
          if (e.pointerType !== "mouse" && e.pointerType !== "pen") return;
          if (!shown) {
            // First move: jump to the pointer instead of flying in from the corner.
            gsap.set(dot, { x: e.clientX, y: e.clientY });
            gsap.to(dot, { autoAlpha: 1, duration: 0.3 });
            shown = true;
          }
          xTo(e.clientX);
          yTo(e.clientY);

          const over = e.target instanceof Element && !!e.target.closest(INTERACTIVE);
          if (over !== hovering) {
            hovering = over;
            gsap.to(dot, { scale: over ? HOVER_SCALE : 1, duration: reduce ? 0 : 0.35, ease: "power3.out", overwrite: "auto" });
          }
        };
        const onLeave = () => {
          shown = false;
          gsap.to(dot, { autoAlpha: 0, duration: 0.3 });
        };

        window.addEventListener("pointermove", onMove, { passive: true });
        document.documentElement.addEventListener("pointerleave", onLeave);
        return () => {
          window.removeEventListener("pointermove", onMove);
          document.documentElement.removeEventListener("pointerleave", onLeave);
        };
      },
    );
  });

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none invisible fixed top-0 left-0 z-[110] -mt-5 -ml-5 size-10 rounded-full bg-paper opacity-0 mix-blend-difference"
    />
  );
}
