"use client";

import { useEffect, useImperativeHandle, useRef, type Ref } from "react";
import { gsap } from "../motion/gsap";
import { SHAPES, morphSeeds, samplePoints } from "./shapes";

export type PointCloudHandle = {
  /** Timed morph to a shape (used by the stepped layout). */
  morphTo: (index: number) => void;
  /** Scroll-driven: draw shape `a` morphed `t` (0–1) of the way to shape `b`. */
  blend: (a: number, b: number, t: number) => void;
};

type Props = {
  /** Shape shown first (and the only one, in static mode). */
  initial: number;
  /** "morph": samples all shapes and can morph between them. "static": draws one shape once. */
  mode: "morph" | "static";
  count?: number;
  className?: string;
  ref?: Ref<PointCloudHandle>;
};

const DOT = "rgba(248, 249, 247, 0.88)";

/**
 * Stippled point-cloud illustration on a canvas. Sampling is deferred until the
 * canvas is near the viewport, so it costs nothing until it's needed.
 */
export function PointCloud({ initial, mode, count = 2400, className, ref }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const api = useRef<PointCloudHandle>({ morphTo: () => {}, blend: () => {} });
  const pending = useRef<number>(initial);

  useImperativeHandle(
    ref,
    () => ({
      morphTo: (i: number) => api.current.morphTo(i),
      blend: (a: number, b: number, t: number) => api.current.blend(a, b, t),
    }),
    [],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const handle = api.current;

    const n = mode === "static" ? Math.round(count * 0.6) : count;
    let shapes: Float32Array[] | null = null;
    let current = initial;
    const from = new Float32Array(n * 2);
    const to = new Float32Array(n * 2);
    const pos = new Float32Array(n * 2);
    const seeds = morphSeeds(n);
    const state = { p: 1 };
    let tween: gsap.core.Tween | null = null;
    let w = 0;
    let h = 0;
    let dot = 1.6;

    const draw = () => {
      if (!shapes) return;
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = DOT;
      const s = Math.min(w, h);
      const ox = (w - s) / 2;
      const oy = (h - s) / 2;
      const p = state.p;
      for (let i = 0; i < n; i++) {
        // staggered, eased per point, with a little scatter mid-flight
        const t = Math.min(1, Math.max(0, (p - seeds.delay[i] * 0.35) / 0.65));
        const e = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
        const lift = Math.sin(t * Math.PI);
        const x = from[i * 2] + (to[i * 2] - from[i * 2]) * e + seeds.sx[i] * lift;
        const y = from[i * 2 + 1] + (to[i * 2 + 1] - from[i * 2 + 1]) * e + seeds.sy[i] * lift;
        pos[i * 2] = x;
        pos[i * 2 + 1] = y;
        ctx.fillRect(ox + x * s, oy + y * s, dot, dot);
      }
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const r = canvas.getBoundingClientRect();
      if (!r.width) return;
      canvas.width = Math.round(r.width * dpr);
      canvas.height = Math.round(r.height * dpr);
      w = canvas.width;
      h = canvas.height;
      dot = Math.max(1.3, Math.min(2.2, r.width / 300)) * dpr;
      draw();
    };

    const ensureSampled = () => {
      if (shapes) return;
      shapes =
        mode === "static"
          ? SHAPES.map((s, i) => (i === initial ? samplePoints(s, n, 7 + i) : new Float32Array(0)))
          : SHAPES.map((s, i) => samplePoints(s, n, 7 + i));
      from.set(shapes[current]);
      to.set(shapes[current]);
      state.p = 1;
      resize();
      if (pendingBlend) handle.blend(...pendingBlend);
      else if (pending.current !== current) handle.morphTo(pending.current);
    };

    let pendingBlend: [number, number, number] | null = null;
    let pair = "";
    handle.blend = (a: number, b: number, t: number) => {
      if (!shapes || mode === "static") {
        pendingBlend = [a, b, t];
        return;
      }
      tween?.kill();
      const key = `${a}>${b}`;
      if (key !== pair) {
        from.set(shapes[a]);
        to.set(shapes[b]);
        pair = key;
      }
      state.p = Math.min(1, Math.max(0, t));
      current = state.p >= 1 ? b : a;
      draw();
    };

    handle.morphTo = (index: number) => {
      pair = "";
      pending.current = index;
      if (!shapes || mode === "static" || index === current) return;
      current = index;
      from.set(state.p >= 1 ? to : pos);
      to.set(shapes[index]);
      tween?.kill();
      state.p = 0;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        state.p = 1;
        draw();
        return;
      }
      tween = gsap.to(state, { p: 1, duration: 1.6, ease: "none", onUpdate: draw });
    };

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          ensureSampled();
          io.disconnect();
        }
      },
      { rootMargin: "400px 0px" },
    );
    io.observe(canvas);
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    return () => {
      io.disconnect();
      ro.disconnect();
      tween?.kill();
      handle.morphTo = () => {};
      handle.blend = () => {};
    };
  }, [initial, mode, count]);

  return <canvas ref={canvasRef} aria-hidden className={className} />;
}
