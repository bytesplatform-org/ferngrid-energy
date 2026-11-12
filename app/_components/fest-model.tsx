"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { FEST_MODEL, type FestNode, type FestNodeId } from "@/lib/content";
import { gsap, useGSAP, MQ } from "./motion/gsap";
import { cx } from "./ui/primitives";

/** Grid placement on desktop (mirrors the client's Simple Model diagram). */
const PLACEMENT: Record<FestNodeId, string> = {
  areas: "lg:col-start-1 lg:row-start-1 lg:row-span-3",
  topology: "lg:col-start-3 lg:row-start-1",
  shape: "lg:col-start-3 lg:row-start-2",
  gas: "lg:col-start-3 lg:row-start-3",
  generators: "lg:col-start-1 lg:row-start-4 lg:row-span-2",
  oilcoal: "lg:col-start-3 lg:row-start-4",
  dual: "lg:col-start-3 lg:row-start-5",
};

/** Order in the stacked (mobile) list. */
const MOBILE_ORDER: FestNodeId[] = ["areas", "topology", "generators", "shape", "gas", "oilcoal", "dual"];

type Edge = { id: string; from: FestNodeId; to: FestNodeId; d: string };

const CONNECTIONS: Record<FestNodeId, FestNodeId[]> = {
  areas: ["topology", "generators"],
  topology: ["areas"],
  generators: ["areas", "shape", "gas", "oilcoal", "dual"],
  shape: ["generators"],
  gas: ["generators", "dual"],
  oilcoal: ["generators", "dual"],
  dual: ["generators", "gas", "oilcoal"],
};

const byId = Object.fromEntries(FEST_MODEL.map((n) => [n.id, n])) as Record<FestNodeId, FestNode>;

function Tick() {
  return (
    <svg viewBox="0 0 12 12" aria-hidden className="size-3 shrink-0 text-fern">
      <path d="M2 6.4 4.8 9 10 3" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="square" />
    </svg>
  );
}

/**
 * FEST data model, rebuilt as HTML cards + SVG connectors measured from the
 * DOM so they stay exact at any width.
 *
 * `scrub`: the page drives the build-up on scroll instead (the connectors draw
 * from the `--fest-draw` CSS variable, 0–1, set on this component's root).
 */
export function FestModel({ scrub = false }: { scrub?: boolean } = {}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [box, setBox] = useState({ w: 0, h: 0 });
  const [hover, setHover] = useState<FestNodeId | null>(null);

  const measure = useCallback(() => {
    const root = rootRef.current;
    if (!root) return;
    if (window.innerWidth < 1024) {
      setEdges([]);
      return;
    }
    // Layout positions (offsetLeft/Top up to the root), NOT on-screen boxes:
    // transforms — e.g. the cards' scattered start on the FEST page — must not
    // bend the connectors.
    const rect = (sel: string) => {
      const el = root.querySelector<HTMLElement>(sel);
      if (!el) return null;
      let x = 0;
      let y = 0;
      for (let n: HTMLElement | null = el; n && n !== root; n = n.offsetParent as HTMLElement | null) {
        x += n.offsetLeft;
        y += n.offsetTop;
      }
      const w = el.offsetWidth;
      const h = el.offsetHeight;
      return { l: x, r: x + w, t: y, b: y + h, cy: y + h / 2 };
    };
    const head = (id: FestNodeId) => rect(`[data-node="${id}"] [data-head]`);
    const item = (id: FestNodeId, idx: number) => rect(`[data-node="${id}"] [data-item="${idx}"]`);

    const areasH = head("areas");
    const topoH = head("topology");
    const areasGen = item("areas", 4);
    const genH = head("generators");
    const genFuel = item("generators", 0);
    const targets = (["shape", "gas", "oilcoal", "dual"] as const).map((id) => ({ id, h: head(id) }));
    const dualGas = item("dual", 1);
    const dualOil = item("dual", 2);
    const gasH = head("gas");
    const oilH = head("oilcoal");
    if (!areasH || !topoH || !areasGen || !genH || !genFuel || !dualGas || !dualOil || !gasH || !oilH) return;

    const next: Edge[] = [];
    // Areas → Topology
    next.push({ id: "a-t", from: "areas", to: "topology", d: `M ${areasH.r} ${areasH.cy} H ${topoH.l - 2}` });
    // Areas (Generators row) → Generators
    const railX = areasGen.l - 22;
    next.push({
      id: "a-g",
      from: "areas",
      to: "generators",
      d: `M ${areasGen.l} ${areasGen.cy} H ${railX} V ${genH.cy} H ${genH.l - 2}`,
    });
    // Generators → bus → four fuel nodes
    const busX = (genFuel.r + (targets[0].h?.l ?? genFuel.r + 80)) / 2;
    for (const t of targets) {
      if (!t.h) continue;
      next.push({
        id: `g-${t.id}`,
        from: "generators",
        to: t.id,
        d: `M ${genFuel.r} ${genFuel.cy} H ${busX} V ${t.h.cy} H ${t.h.l - 2}`,
      });
    }
    // Dual Fuel constraints → back to Natural Gas and Oil/Coal (right-hand rails)
    const outer = Math.max(dualGas.r, gasH.r) + 44;
    const inner = Math.max(dualOil.r, oilH.r) + 22;
    next.push({
      id: "d-gas",
      from: "dual",
      to: "gas",
      d: `M ${dualGas.r} ${dualGas.cy} H ${outer} V ${gasH.cy} H ${gasH.r + 2}`,
    });
    next.push({
      id: "d-oil",
      from: "dual",
      to: "oilcoal",
      d: `M ${dualOil.r} ${dualOil.cy} H ${inner} V ${oilH.cy} H ${oilH.r + 2}`,
    });
    setBox({ w: root.offsetWidth, h: root.offsetHeight });
    setEdges(next);
  }, []);

  // ResizeObserver fires once on observe, so this also handles the first measure.
  useEffect(() => {
    const ro = new ResizeObserver(measure);
    if (rootRef.current) ro.observe(rootRef.current);
    document.fonts?.ready.then(measure);
    return () => ro.disconnect();
  }, [measure]);

  // Draw connectors + cards in on scroll.
  useGSAP(
    () => {
      if (!edges.length || scrub) return;
      const mm = gsap.matchMedia();
      mm.add(MQ.motion, () => {
        const tl = gsap.timeline({ scrollTrigger: { trigger: rootRef.current, start: "top 75%", once: true } });
        tl.from("[data-node]", { y: 24, autoAlpha: 0, duration: 0.9, ease: "expo.out", stagger: 0.07, clearProps: "all" }, 0).fromTo(
          "[data-edge]",
          { strokeDashoffset: 1, opacity: 0 },
          { strokeDashoffset: 0, opacity: 1, duration: 1.1, ease: "power2.inOut", stagger: 0.08, clearProps: "opacity" },
          0.35,
        );
      });
    },
    { scope: rootRef, dependencies: [edges.length > 0, scrub] },
  );

  const related = hover ? new Set<FestNodeId>([hover, ...CONNECTIONS[hover]]) : null;

  return (
    <div ref={rootRef} data-fest-model className="relative">
      {/* Mobile rail */}
      <span aria-hidden className="absolute top-2 bottom-2 left-[5px] w-px bg-carbon/25 lg:hidden" />

      <ol
        className={cx(
          "relative grid gap-5 pl-7 lg:gap-x-0 lg:gap-y-6 lg:pl-0",
          "lg:grid-cols-[minmax(0,0.9fr)_minmax(80px,0.42fr)_minmax(0,1fr)_96px]",
        )}
      >
        {MOBILE_ORDER.map((id) => {
          const node = byId[id];
          const dim = related && !related.has(id);
          return (
            <li
              key={id}
              data-node={id}
              className={cx(
                "group relative self-start transition-opacity duration-300",
                PLACEMENT[id],
                dim && "lg:opacity-35",
              )}
              onMouseEnter={() => setHover(id)}
              onMouseLeave={() => setHover(null)}
              onFocus={() => setHover(id)}
              onBlur={() => setHover(null)}
            >
              <span aria-hidden className="absolute top-[18px] -left-[26px] size-[9px] rounded-full border border-carbon bg-paper lg:hidden" />
              <div
                tabIndex={0}
                role="group"
                aria-labelledby={`fest-head-${id}`}
                aria-describedby={`fest-links-${id}`}
                className={cx(
                  "overflow-hidden rounded-[10px] border bg-paper transition-[border-color,box-shadow] duration-300 outline-offset-4",
                  hover === id ? "border-carbon shadow-[0_18px_40px_-24px_rgb(29_34_15/0.6)]" : "border-carbon/20",
                )}
              >
                <h3
                  id={`fest-head-${id}`}
                  data-head
                  className={cx(
                    "text-label-md flex items-center justify-between gap-4 border-b px-4 py-3 transition-colors duration-300",
                    hover === id ? "border-carbon bg-carbon text-paper" : "border-carbon/15 bg-paper-warm text-carbon",
                  )}
                >
                  <span>{node.title}</span>
                </h3>
                <ul>
                  {node.items.map((it, k) => (
                    <li
                      key={it}
                      data-item={k}
                      className="flex items-center justify-between gap-4 border-b border-carbon/10 px-4 py-2.5 text-sm text-carbon last:border-b-0"
                    >
                      <span>{it}</span>
                      <Tick />
                    </li>
                  ))}
                </ul>
              </div>

              {/* Hover / focus card (desktop) */}
              <div
                aria-hidden
                className={cx(
                  "surface-dark pointer-events-none absolute top-0 z-30 hidden w-64 rounded-[10px] bg-carbon p-4 text-paper shadow-[0_24px_60px_-20px_rgb(0_0_0/0.6)] transition-[opacity,transform] duration-300 lg:block",
                  id === "areas" || id === "generators" ? "left-[calc(100%+16px)]" : "right-[calc(100%+16px)]",
                  hover === id ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0",
                )}
              >
                <p className="font-display text-3xl leading-none">{node.title}</p>
                <ul className="mt-3 space-y-1.5 border-t border-paper/15 pt-3 text-sm text-paper/80">
                  {node.items.map((it) => (
                    <li key={it} className="flex items-center gap-2">
                      <span aria-hidden className="size-1 rounded-full bg-fern" />
                      {it}
                    </li>
                  ))}
                </ul>
                <p id={`fest-links-${id}`} className="text-label mt-3 text-paper/50">
                  Links → {CONNECTIONS[id].map((c) => byId[c].title).join(" · ")}
                </p>
              </div>
            </li>
          );
        })}
      </ol>

      {/* Connectors (desktop) */}
      {edges.length > 0 && (
        <svg
          aria-hidden
          width={box.w}
          height={box.h}
          viewBox={`0 0 ${box.w} ${box.h}`}
          className="pointer-events-none absolute inset-0 hidden overflow-visible lg:block"
        >
          <defs>
            <marker id="fest-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0 0 10 5 0 10z" fill="currentColor" />
            </marker>
          </defs>
          {edges.map((e) => {
            const on = hover && (e.from === hover || e.to === hover);
            return (
              <path
                key={e.id}
                data-edge
                d={e.d}
                pathLength={1}
                strokeDasharray="1 1"
                style={scrub ? { strokeDashoffset: "calc(1 - var(--fest-draw, 1))" } : undefined}
                fill="none"
                stroke="currentColor"
                strokeWidth={on ? 1.75 : 1}
                markerEnd="url(#fest-arrow)"
                className={cx(
                  "transition-[color,opacity] duration-300",
                  on ? "text-fern" : "text-carbon",
                  hover && !on && "opacity-30",
                )}
              />
            );
          })}
        </svg>
      )}
    </div>
  );
}
