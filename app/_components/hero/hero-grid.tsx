"use client";

import { useRef } from "react";
import { gsap, useGSAP, MQ } from "../motion/gsap";

/**
 * Decorative power-grid network for the hero: transmission lines between
 * substations, kept to the edges so the headline stays clear.
 * - Lines draw in on load; small fern pulses run along a few of them.
 * - A soft spotlight follows the cursor and lights up the nearby network in fern.
 * Static under reduced motion. Coordinates are in a 1600×900 box ("slice" fit).
 */
const NODES: [number, number][] = [
  // left cluster
  [60, 260], [190, 330], [110, 470], [300, 440], [240, 600], [90, 700], [380, 610], [330, 760], [170, 850],
  // right cluster
  [1540, 240], [1400, 320], [1490, 470], [1290, 430], [1360, 590], [1510, 700], [1220, 620], [1270, 770], [1440, 850],
  // bottom centre
  [560, 780], [800, 830], [1040, 780],
];

const EDGES: [number, number][] = [
  [0, 1], [1, 2], [1, 3], [2, 4], [3, 4], [3, 6], [4, 5], [4, 6], [5, 8], [6, 7], [7, 8], [6, 18], [7, 18], [18, 19],
  [9, 10], [10, 11], [10, 12], [11, 13], [12, 13], [12, 15], [13, 14], [13, 15], [14, 17], [15, 16], [16, 17], [15, 20],
  [16, 20], [19, 20],
];

/** Substations get a double ring. */
const SUBSTATIONS = new Set([3, 6, 12, 15, 19]);
/** Edges that carry a travelling pulse. */
const PULSES = [2, 7, 11, 13, 19, 21, 27];

const line = ([a, b]: [number, number]) => `M ${NODES[a][0]} ${NODES[a][1]} L ${NODES[b][0]} ${NODES[b][1]}`;

function Network({ stroke, width, nodes }: { stroke: string; width: number; nodes: boolean }) {
  return (
    <g fill="none" stroke={stroke} strokeWidth={width}>
      {EDGES.map((e, i) => (
        <path key={i} data-grid-line d={line(e)} pathLength={1} strokeDasharray="1 1" vectorEffect="non-scaling-stroke" />
      ))}
      {nodes &&
        NODES.map(([x, y], i) => (
          <g key={i} data-grid-node>
            <circle cx={x} cy={y} r={3.5} fill="currentColor" stroke="none" />
            {SUBSTATIONS.has(i) && <circle cx={x} cy={y} r={11} vectorEffect="non-scaling-stroke" />}
          </g>
        ))}
    </g>
  );
}

export function HeroGrid() {
  const svgRef = useRef<SVGSVGElement>(null);

  useGSAP(
    () => {
      const svg = svgRef.current;
      if (!svg) return;
      const mm = gsap.matchMedia();

      mm.add(MQ.motion, () => {
        // Draw in after the page settles (it starts hidden via its class, so no flash).
        const tl = gsap.timeline({ delay: 0.5 });
        tl.set(svg, { autoAlpha: 1 })
          .fromTo("[data-grid-line]", { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.6, ease: "power2.out", stagger: 0.025 })
          .from("[data-grid-node]", { autoAlpha: 0, duration: 0.6, stagger: 0.02 }, 0.4);

        // Energy pulses along a few lines.
        gsap.utils.toArray<SVGPathElement>("[data-grid-pulse]").forEach((p, i) => {
          gsap.fromTo(
            p,
            { strokeDashoffset: 0.08 },
            { strokeDashoffset: -1, duration: 2.6 + (i % 3) * 0.6, ease: "none", repeat: -1, delay: 1.8 + i * 0.45 },
          );
        });
      });

      // Cursor spotlight (mouse/trackpad only).
      mm.add("(prefers-reduced-motion: no-preference) and (hover: hover) and (pointer: fine)", () => {
        const spot = svg.querySelector<SVGCircleElement>("[data-grid-spot]");
        if (!spot) return;
        const pos = { x: 800, y: 450, r: 0 };
        const apply = () => {
          spot.setAttribute("cx", String(pos.x));
          spot.setAttribute("cy", String(pos.y));
          spot.setAttribute("r", String(pos.r));
        };
        const pt = svg.createSVGPoint();
        const onMove = (e: PointerEvent) => {
          const box = svg.getBoundingClientRect();
          if (box.bottom <= 0) return;
          const ctm = svg.getScreenCTM();
          if (!ctm) return;
          pt.x = e.clientX;
          pt.y = e.clientY;
          const p = pt.matrixTransform(ctm.inverse());
          gsap.to(pos, { x: p.x, y: p.y, r: 260, duration: 0.7, ease: "power3.out", overwrite: true, onUpdate: apply });
        };
        const onLeave = () => gsap.to(pos, { r: 0, duration: 0.6, ease: "power2.out", overwrite: true, onUpdate: apply });
        window.addEventListener("pointermove", onMove, { passive: true });
        document.documentElement.addEventListener("pointerleave", onLeave);
        return () => {
          window.removeEventListener("pointermove", onMove);
          document.documentElement.removeEventListener("pointerleave", onLeave);
        };
      });
    },
    { scope: svgRef },
  );

  return (
    <svg
      ref={svgRef}
      aria-hidden
      viewBox="0 0 1600 900"
      preserveAspectRatio="xMidYMid slice"
      className="pointer-events-none absolute inset-0 size-full text-paper/40 motion-safe:[.js_&]:invisible motion-safe:[.js_&]:opacity-0"
    >
      <defs>
        <radialGradient id="hero-grid-spot-fill">
          <stop offset="0" stopColor="#fff" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <mask id="hero-grid-spot" maskUnits="userSpaceOnUse" x="0" y="0" width="1600" height="900">
          <circle data-grid-spot cx="800" cy="450" r="0" fill="url(#hero-grid-spot-fill)" />
        </mask>
      </defs>

      {/* base network */}
      <g className="text-paper/30">
        <Network stroke="rgb(248 249 247 / 0.16)" width={1} nodes />
      </g>

      {/* fern network, revealed only under the cursor spotlight */}
      <g mask="url(#hero-grid-spot)" className="text-fern">
        <Network stroke="var(--color-fern)" width={1.6} nodes />
      </g>

      {/* travelling pulses */}
      <g
        fill="none"
        stroke="var(--color-fern)"
        strokeWidth={2.4}
        strokeLinecap="round"
        className="invisible motion-safe:[.js_&]:visible"
      >
        {PULSES.map((i) => (
          <path
            key={i}
            data-grid-pulse
            d={line(EDGES[i])}
            pathLength={1}
            strokeDasharray="0.08 1"
            strokeDashoffset={1.1}
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </g>
    </svg>
  );
}
