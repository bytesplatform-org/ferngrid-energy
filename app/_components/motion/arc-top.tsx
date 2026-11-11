"use client";

import { useRef } from "react";
import { gsap, useGSAP, MQ } from "./gsap";
import { cx } from "../ui/primitives";

/**
 * Curved section transition. Renders a wide dome in the section's own colour
 * that sits just above the section's top edge, so the section appears to rise
 * over the previous one as an arc. The dome flattens as it scrolls in.
 *
 * Place as the first child of a `relative` section. Without JS or under reduced
 * motion it collapses to a shallow static curve (see globals.css) so it never
 * covers the previous section's content.
 */
export function ArcTop({
  className,
  height = "22vh",
  width = "130vw",
  motionOnly = false,
  grow = false,
}: {
  /** Background colour class, e.g. "bg-paper-warm". */
  className: string;
  height?: string;
  width?: string;
  /** Only render with JS + motion (e.g. the dome that rises over the pinned hero). */
  motionOnly?: boolean;
  /** Start flat and grow before flattening again (for a section that sits directly under an unpinned hero). */
  grow?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MQ.motion, () => {
        const el = ref.current;
        const section = el?.parentElement;
        if (!el || !section) return;
        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: { trigger: section, start: "top bottom", end: "top 25%", scrub: true },
        });
        if (grow) tl.fromTo(el, { scaleY: 0 }, { scaleY: 1, duration: 0.35, ease: "power2.out" });
        tl.fromTo(el, { scaleY: 1 }, { scaleY: 0.06, duration: grow ? 0.65 : 1, immediateRender: !grow });
      });
    },
    { scope: ref, dependencies: [grow] },
  );

  return (
    <div
      ref={ref}
      aria-hidden
      data-arc={motionOnly ? "motion-only" : ""}
      style={{ height, width, marginLeft: `calc(${width} / -2)` }}
      className={cx(
        "pointer-events-none absolute bottom-[calc(100%-1px)] left-1/2 origin-bottom rounded-t-[50%_100%]",
        className,
      )}
    />
  );
}
