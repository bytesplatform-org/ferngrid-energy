"use client";

import { useRef, type ReactNode } from "react";
import { gsap, useGSAP, MQ } from "./gsap";

/**
 * Slow scroll parallax for an image frame: the frame clips, its first child
 * (the image) drifts by `amount` percent while the frame crosses the viewport.
 */
export function Parallax({
  children,
  className,
  amount = 8,
}: {
  children: ReactNode;
  className?: string;
  amount?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MQ.motion, () => {
        const inner = ref.current?.firstElementChild as HTMLElement | null;
        if (!inner) return;
        gsap.fromTo(
          inner,
          { yPercent: -amount / 2, scale: 1 + amount / 100 },
          {
            yPercent: amount / 2,
            ease: "none",
            scrollTrigger: { trigger: ref.current, start: "top bottom", end: "bottom top", scrub: true },
          },
        );
      });
    },
    { scope: ref },
  );

  return (
    <div ref={ref} className={className}>
      <div className="absolute inset-0">{children}</div>
    </div>
  );
}
