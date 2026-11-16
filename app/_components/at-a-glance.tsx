"use client";

import { Fragment, useEffect, useRef, useState, type CSSProperties } from "react";
import { AT_A_GLANCE, ROUTES } from "@/lib/content";
import { ArcSurface } from "./motion/arc-surface";
import { gsap, ScrollTrigger, useGSAP, MQ } from "./motion/gsap";
import { TransitionLink } from "./ui/transition-link";
import { ArrowUpRight, cx } from "./ui/primitives";

/** Scroll distance (viewport heights) the stage stays pinned for. */
const PIN_VH = 2.4;

type Pt = { x: number; y: number };

/*
 * Node positions in % of the stage. Wide: a wave from the left edge to the right
 * edge, nodes alternating low/high. Narrow: the same wave, running down the left.
 */
const WIDE: readonly Pt[] = [
  { x: 14, y: 60 },
  { x: 38, y: 40 },
  { x: 62, y: 60 },
  { x: 86, y: 40 },
];
const WIDE_ENDS = [{ x: 0, y: 50 }, { x: 100, y: 50 }] as const;
const NARROW: readonly Pt[] = [
  { x: 12, y: 30 },
  { x: 21, y: 47 },
  { x: 12, y: 64 },
  { x: 21, y: 81 },
];
const NARROW_ENDS = [{ x: 16, y: 16 }, { x: 16, y: 98 }] as const;

/**
 * The line as one cubic segment per gap (start → node 1 → … → node 4 → end),
 * smoothed Catmull-Rom style, in the stage's pixel space (`w`×`h`).
 */
function segments(nodes: readonly Pt[], ends: readonly [Pt, Pt], w: number, h: number) {
  const pts = [ends[0], ...nodes, ends[1]].map((p) => ({ x: (p.x / 100) * w, y: (p.y / 100) * h }));
  const at = (i: number) => pts[Math.max(0, Math.min(pts.length - 1, i))];
  const f = (n: number) => n.toFixed(1);
  return pts.slice(0, -1).map((p0, i) => {
    const prev = at(i - 1);
    const p1 = at(i + 1);
    const next = at(i + 2);
    const c1 = { x: p0.x + (p1.x - prev.x) / 6, y: p0.y + (p1.y - prev.y) / 6 };
    const c2 = { x: p1.x - (next.x - p0.x) / 6, y: p1.y - (next.y - p0.y) / 6 };
    return `M ${f(p0.x)} ${f(p0.y)} C ${f(c1.x)} ${f(c1.y)}, ${f(c2.x)} ${f(c2.y)}, ${f(p1.x)} ${f(p1.y)}`;
  });
}

function Line({ kind, w, h }: { kind: "wide" | "narrow"; w: number; h: number }) {
  const segs =
    kind === "wide" ? segments(WIDE, WIDE_ENDS, w, h) : segments(NARROW, NARROW_ENDS, w, h);
  return (
    <svg
      data-line={kind}
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      aria-hidden
      className={cx("absolute inset-0 size-full overflow-visible", kind === "wide" ? "hidden md:block" : "md:hidden")}
    >
      {/* the whole route, faint */}
      <path data-route d={segs.join(" ")} fill="none" className="stroke-carbon/12" strokeWidth={1.5} strokeDasharray="2 7" strokeLinecap="round" />
      {/* the drawn line, one segment per gap */}
      {segs.map((d, i) => (
        <path
          key={i}
          data-seg
          d={d}
          fill="none"
          pathLength={1}
          strokeDasharray="1 1"
          className="stroke-fern"
          strokeWidth={2.5}
          strokeLinecap="round"
        />
      ))}
    </svg>
  );
}

/**
 * Home, after Our Software — the four facts on one line (client layout):
 * Standard → Timeline → Applies to → Solution. Pinned and scrubbed: a fern line
 * draws left to right; a glowing head rides it, easing into each node, which
 * pops with a ripple as its label rises in. FEST, the last stop, links to /fest.
 * Without JS / under reduced motion the finished line is shown as is.
 */
export function AtAGlance() {
  const ref = useRef<HTMLElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [story, setStory] = useState(false);
  // The stage size in px, so the SVG's viewBox matches it (an even stroke).
  const [box, setBox] = useState({ w: 1440, h: 900 });

  useEffect(() => {
    const el = innerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => {
      const { width, height } = e.contentRect;
      if (width && height) setBox({ w: Math.round(width), h: Math.round(height) });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add(MQ.motion, () => {
      setStory(true);
      return () => setStory(false);
    });
  });

  useGSAP(
    () => {
      const section = ref.current;
      const stage = section?.querySelector<HTMLElement>("[data-stage]");
      if (!story || !section || !stage) return;
      const q = gsap.utils.selector(section);

      const mm = gsap.matchMedia();
      // (Both conditions listed: a conditions object only fires when one matches.)
      mm.add({ wide: "(min-width: 768px)", narrow: "(max-width: 767.98px)" }, (ctx) => {
        const { wide } = ctx.conditions as { wide: boolean };
        const svg = q(`[data-line='${wide ? "wide" : "narrow"}']`)[0] as unknown as SVGSVGElement;
        const segs = q(`[data-line='${wide ? "wide" : "narrow"}'] [data-seg]`) as unknown as SVGPathElement[];
        const head = q("[data-head]")[0] as HTMLElement;
        const nodes = q("[data-node]");

        // Explicit starting states.
        gsap.set(q("[data-seg]"), { strokeDashoffset: 1 });
        gsap.set(q("[data-eyebrow]"), { autoAlpha: 0, y: 16 });
        gsap.set(q("[data-route]"), { opacity: 0 });
        gsap.set(q("[data-marker]"), { scale: 0 });
        gsap.set(q("[data-ripple]"), { scale: 1, autoAlpha: 0 });
        gsap.set(q("[data-label]"), { autoAlpha: 0, y: 12 });
        gsap.set(q("[data-value]"), { yPercent: 110 });
        gsap.set(head, { autoAlpha: 0, scale: 0.4 });

        // The head sits on segment `seg` at fraction `t`.
        const ride = { seg: 0, t: 0 };
        const place = () => {
          const path = segs[ride.seg];
          if (!path) return;
          const vb = svg.viewBox.baseVal;
          const pt = path.getPointAtLength(path.getTotalLength() * ride.t);
          head.style.left = `${(pt.x / vb.width) * 100}%`;
          head.style.top = `${(pt.y / vb.height) * 100}%`;
        };
        place();

        ScrollTrigger.create({
          trigger: stage,
          start: "top top",
          end: () => `+=${window.innerHeight * PIN_VH}`,
          pin: true,
          invalidateOnRefresh: true,
        });

        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: stage,
            start: "top 70%",
            end: () => `+=${window.innerHeight * (0.7 + PIN_VH)}`,
            scrub: 0.6,
            invalidateOnRefresh: true,
          },
        });

        // Arrival: label and faint route.
        tl.to(q("[data-eyebrow]"), { autoAlpha: 1, y: 0, duration: 0.25, ease: "power2.out" }, 0.05).to(
          q(`[data-line='${wide ? "wide" : "narrow"}'] [data-route]`),
          { opacity: 1, duration: 0.3 },
          0.1,
        );

        // The head appears at the start, then rides each segment in turn.
        const START = 0.45;
        const SEG = 0.42;
        tl.to(head, { autoAlpha: 1, scale: 1, duration: 0.1, ease: "back.out(3)" }, START - 0.08);
        segs.forEach((seg, i) => {
          const at = START + i * SEG;
          tl.to(seg, { strokeDashoffset: 0, duration: SEG, ease: "sine.inOut" }, at).fromTo(
            ride,
            { seg: i, t: 0 },
            { seg: i, t: 1, duration: SEG, ease: "sine.inOut", onUpdate: place, immediateRender: false },
            at,
          );

          // Arriving at node i (segment i ends on it).
          const node = nodes[i];
          if (!node) return;
          const hit = at + SEG;
          const n = gsap.utils.selector(node);
          tl.to(n("[data-marker]"), { scale: 1, duration: 0.12, ease: "back.out(2.6)" }, hit - 0.04)
            .fromTo(
              n("[data-ripple]"),
              { scale: 1, autoAlpha: 0.7 },
              { scale: 3.4, autoAlpha: 0, duration: 0.3, ease: "power2.out" },
              hit - 0.04,
            )
            .to(n("[data-label]"), { autoAlpha: 1, y: 0, duration: 0.14, ease: "power2.out" }, hit - 0.02)
            .to(n("[data-value]"), { yPercent: 0, duration: 0.2, stagger: 0.03, ease: "power3.out" }, hit);
        });
        // The head leaves past the far end.
        const out = START + segs.length * SEG;
        tl.to(head, { autoAlpha: 0, scale: 0.4, duration: 0.08 }, out - 0.08).to({}, { duration: 0.5 });

        // Created after a state change: re-order and re-measure.
        ScrollTrigger.sort();
        ScrollTrigger.refresh();
      });
      return () => mm.revert();
    },
    { scope: ref, dependencies: [story], revertOnUpdate: true },
  );

  const { label, items } = AT_A_GLANCE;

  return (
    <section
      ref={ref}
      id="at-a-glance"
      aria-labelledby="glance-title"
      className={cx("surface-light arc-next relative z-10", !story && "arc-prev")}
      // story: the stage starts under the arc, and the next section's arc space sits
      // below the pinned stage, so the pin ends before that arc rises.
      style={story ? { paddingTop: "var(--arc-depth)", paddingBottom: "var(--arc-depth)" } : undefined}
    >
      <ArcSurface tone="paper" parallax="[data-software-inner]" />

      <div data-stage className={cx("relative overflow-x-clip", story ? "h-svh" : "h-[max(600px,82svh)]")}>
        {/* Inner wrapper: the next section's parallax moves this, never the pinned stage. */}
        <div ref={innerRef} data-glance-inner className="absolute inset-0">
          <h2
            id="glance-title"
            data-eyebrow
            className="text-label absolute top-[clamp(5.5rem,13svh,8.5rem)] left-5 flex items-center gap-3 text-muted md:left-10"
          >
            <span aria-hidden className="block size-1.5 rounded-full bg-fern" />
            {label}
          </h2>

          <Line kind="wide" w={box.w} h={box.h} />
          <Line kind="narrow" w={box.w} h={box.h} />

          <ol className="contents">
            {items.map((item, i) => {
              const last = i === items.length - 1;
              const low = i % 2 === 0;
              const vars = {
                "--x": `${WIDE[i].x}%`,
                "--y": `${WIDE[i].y}%`,
                "--mx": `${NARROW[i].x}%`,
                "--my": `${NARROW[i].y}%`,
              } as CSSProperties;
              const words = item.value.split(" ");
              const value = (
                <span className="font-condensed block text-[clamp(1.9rem,3.1vw,3.4rem)] leading-[0.92] uppercase">
                  {words.map((w, wi) => (
                    <Fragment key={wi}>
                      {wi > 0 && " "}
                      <span className="inline-block overflow-hidden pb-[0.06em] align-top">
                        <span data-value className="inline-block">
                          {w}
                        </span>
                      </span>
                    </Fragment>
                  ))}
                  {last && (
                    <span className="inline-block overflow-hidden pb-[0.06em] align-top">
                      <span data-value className="ml-2 inline-block text-[0.6em] text-fern">
                        <ArrowUpRight className="size-[1em] transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
                      </span>
                    </span>
                  )}
                </span>
              );
              return (
                <li key={item.label} data-node style={vars}>
                  {/* Node marker */}
                  <span
                    aria-hidden
                    className="absolute top-[var(--my)] left-[var(--mx)] -translate-x-1/2 -translate-y-1/2 md:top-[var(--y)] md:left-[var(--x)]"
                  >
                    <span className="absolute top-1/2 left-1/2 block size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-carbon/25" />
                    <span
                      data-ripple
                      className="absolute top-1/2 left-1/2 -mt-3 -ml-3 block size-6 rounded-full border border-fern"
                    />
                    <span
                      data-marker
                      className={cx(
                        "relative block rounded-full border-2 bg-paper",
                        last ? "size-7 border-fern" : "size-5 border-carbon",
                      )}
                    >
                      <span
                        className={cx(
                          "absolute rounded-full",
                          last ? "inset-[5px] bg-fern" : "inset-[4px] bg-carbon",
                        )}
                      />
                    </span>
                  </span>

                  {/* Label + value */}
                  <div
                    className={cx(
                      "absolute top-[var(--my)] left-[30%] w-[calc(70%-1.25rem)] -translate-y-1/2",
                      "md:top-[var(--y)] md:left-[var(--x)] md:w-[min(24vw,340px)] md:-translate-x-1/2 md:text-center",
                      low ? "md:translate-y-9" : "md:-translate-y-[calc(100%+2.25rem)]",
                    )}
                  >
                    <span data-label className="text-label block text-muted">
                      {item.label}
                    </span>
                    {last ? (
                      <TransitionLink href={ROUTES.fest} className="group mt-2 inline-block">
                        {value}
                      </TransitionLink>
                    ) : (
                      <span className="mt-2 block">{value}</span>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>

          {/* The glowing head that rides the line */}
          {story && (
            <span
              data-head
              aria-hidden
              className="pointer-events-none absolute z-10 -mt-2 -ml-2 block size-4 rounded-full bg-fern shadow-[0_0_0_6px_rgb(135_169_107/0.22),0_0_28px_6px_rgb(135_169_107/0.55)]"
            />
          )}
        </div>
      </div>
    </section>
  );
}
