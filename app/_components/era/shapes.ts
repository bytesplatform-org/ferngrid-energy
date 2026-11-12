/**
 * Four simple silhouettes for the ERA point-cloud. Each is drawn into a
 * 400×400 offscreen canvas; alpha controls point density (outlines dense,
 * fills sparse). Points are then sampled from the drawn pixels.
 * Purely illustrative: no values, numbers or axes.
 */

export const BOX = 400;

export type Callout = {
  label: string;
  /** Anchor on the shape, 0–1. */
  ax: number;
  ay: number;
  /** Label position, 0–1. */
  lx: number;
  ly: number;
  align?: "left" | "right";
};

export type ShapeDef = {
  key: string;
  draw: (ctx: CanvasRenderingContext2D) => void;
  callouts: Callout[];
};

const stroke = (ctx: CanvasRenderingContext2D, alpha: number, width: number) => {
  ctx.strokeStyle = `rgba(0,0,0,${alpha})`;
  ctx.lineWidth = width;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.stroke();
};
const fill = (ctx: CanvasRenderingContext2D, alpha: number) => {
  ctx.fillStyle = `rgba(0,0,0,${alpha})`;
  ctx.fill();
};

/* 1 — Load: an hourly load curve over a day */
const loadAt = (h: number) =>
  0.42 + 0.17 * Math.exp(-((h - 8) ** 2) / 6) + 0.32 * Math.exp(-((h - 18.5) ** 2) / 5.5) - 0.06 * Math.exp(-((h - 3) ** 2) / 8);
const LX = (h: number) => 40 + (h / 23) * 320;
const LY = (h: number) => 320 - loadAt(h) * 250;

const load: ShapeDef = {
  key: "load",
  draw(ctx) {
    // area
    ctx.beginPath();
    ctx.moveTo(LX(0), 320);
    for (let h = 0; h <= 23; h += 0.25) ctx.lineTo(LX(h), LY(h));
    ctx.lineTo(LX(23), 320);
    ctx.closePath();
    fill(ctx, 0.16);
    // hourly columns inside the area
    for (let h = 0; h <= 23; h++) {
      ctx.beginPath();
      ctx.moveTo(LX(h), 320);
      ctx.lineTo(LX(h), LY(h) + 6);
      stroke(ctx, 0.28, 1.5);
    }
    // curve
    ctx.beginPath();
    for (let h = 0; h <= 23; h += 0.25) (h === 0 ? ctx.moveTo : ctx.lineTo).call(ctx, LX(h), LY(h));
    stroke(ctx, 1, 5);
    // baseline + hour ticks (no labels)
    ctx.beginPath();
    ctx.moveTo(30, 320);
    ctx.lineTo(370, 320);
    stroke(ctx, 0.9, 3);
    for (let h = 0; h <= 23; h++) {
      ctx.beginPath();
      ctx.moveTo(LX(h), 328);
      ctx.lineTo(LX(h), h % 6 === 0 ? 342 : 334);
      stroke(ctx, 0.85, 2.5);
    }
  },
  callouts: [
    { label: "Hourly load profile", ax: LX(11) / BOX, ay: LY(11) / BOX, lx: 0.1, ly: 0.2, align: "left" },
    { label: "Peak", ax: LX(18.5) / BOX, ay: LY(18.5) / BOX, lx: 0.9, ly: 0.12, align: "right" },
  ],
};

/* 2 — Generation: a generator stack with an on-site fuel tank */
const generation: ShapeDef = {
  key: "generation",
  draw(ctx) {
    // ground
    ctx.beginPath();
    ctx.moveTo(24, 330);
    ctx.lineTo(376, 330);
    stroke(ctx, 0.9, 3);
    // plant hall
    ctx.beginPath();
    ctx.rect(52, 200, 176, 130);
    fill(ctx, 0.2);
    stroke(ctx, 1, 4);
    // roof line + windows
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.rect(70 + i * 40, 230, 22, 34);
      stroke(ctx, 0.7, 2.5);
    }
    // stacks
    for (const [x, top] of [
      [86, 104],
      [138, 74],
    ] as const) {
      ctx.beginPath();
      ctx.moveTo(x, 200);
      ctx.lineTo(x + 4, top);
      ctx.lineTo(x + 26, top);
      ctx.lineTo(x + 30, 200);
      fill(ctx, 0.35);
      stroke(ctx, 1, 3.5);
    }
    // fuel tank (cylinder)
    const cx = 300,
      rx = 50,
      ry = 13,
      top = 170,
      bottom = 318,
      level = 236;
    ctx.beginPath();
    ctx.rect(cx - rx, level, rx * 2, bottom - level);
    fill(ctx, 0.5); // stored fuel
    ctx.beginPath();
    ctx.rect(cx - rx, top, rx * 2, level - top);
    fill(ctx, 0.08);
    ctx.beginPath();
    ctx.ellipse(cx, top, rx, ry, 0, 0, Math.PI * 2);
    stroke(ctx, 1, 3.5);
    ctx.beginPath();
    ctx.moveTo(cx - rx, top);
    ctx.lineTo(cx - rx, bottom);
    ctx.ellipse(cx, bottom, rx, ry, 0, Math.PI, 0, true);
    ctx.lineTo(cx + rx, top);
    stroke(ctx, 1, 3.5);
    ctx.beginPath();
    ctx.ellipse(cx, level, rx, ry, 0, 0, Math.PI);
    stroke(ctx, 0.9, 2.5);
    // feed pipe
    ctx.beginPath();
    ctx.moveTo(cx - rx, 300);
    ctx.lineTo(228, 300);
    stroke(ctx, 1, 4);
  },
  callouts: [
    { label: "Fuel storage", ax: 300 / BOX, ay: 270 / BOX, lx: 0.94, ly: 0.18, align: "right" },
    { label: "Generator", ax: 140 / BOX, ay: 230 / BOX, lx: 0.06, ly: 0.1, align: "left" },
  ],
};

/* 3 — Transfers: two balancing areas side by side, the interface between them,
   and tie lines carrying energy across it in both directions */
const AREAS = [
  { x: 28, cx: 98 },
  { x: 232, cx: 302 },
] as const;
const AREA_W = 140;
const AREA_TOP = 92;
const AREA_H = 216;
const TIE_Y = [146, 200, 254] as const;
/** Flow direction per tie line: 1 = left → right. */
const TIE_DIR = [1, -1, 1] as const;

const transfers: ShapeDef = {
  key: "transfers",
  draw(ctx) {
    for (const { x, cx } of AREAS) {
      // area outline (very light fill so the points gather on the structure)
      ctx.beginPath();
      ctx.roundRect(x, AREA_TOP, AREA_W, AREA_H, 26);
      fill(ctx, 0.04);
      stroke(ctx, 1, 4.5);
      // internal network: two columns of nodes, laced together
      const cols = [cx - 34, cx + 34];
      const nodes = TIE_Y.flatMap((y) => cols.map((c) => [c, y] as const));
      ctx.beginPath();
      for (const [a, b] of [
        [0, 1],
        [2, 3],
        [4, 5],
        [0, 2],
        [2, 4],
        [1, 3],
        [3, 5],
        [0, 3],
        [3, 4],
      ]) {
        ctx.moveTo(...nodes[a]);
        ctx.lineTo(...nodes[b]);
      }
      stroke(ctx, 0.5, 2.5);
      for (const [nx, ny] of nodes) {
        ctx.beginPath();
        ctx.arc(nx, ny, 9, 0, Math.PI * 2);
        fill(ctx, 1);
      }
    }
    // the interface: a dashed line down the channel between the areas
    ctx.setLineDash([10, 9]);
    ctx.beginPath();
    ctx.moveTo(200, 56);
    ctx.lineTo(200, 344);
    stroke(ctx, 0.9, 3);
    ctx.setLineDash([]);
    // tie lines across the interface, each with a direction chevron in the channel
    const innerA = AREAS[0].cx + 34;
    const innerB = AREAS[1].cx - 34;
    TIE_Y.forEach((y, i) => {
      ctx.beginPath();
      ctx.moveTo(innerA, y);
      ctx.lineTo(innerB, y);
      stroke(ctx, 1, 5.5);
      const d = TIE_DIR[i];
      for (const off of [-10, 8]) {
        const tip = 200 + d * (off + 6);
        ctx.beginPath();
        ctx.moveTo(tip - d * 13, y - 13);
        ctx.lineTo(tip, y);
        ctx.lineTo(tip - d * 13, y + 13);
        stroke(ctx, 1, 5);
      }
    });
  },
  callouts: [
    { label: "Interface", ax: 0.5, ay: 64 / BOX, lx: 0.08, ly: 0.06, align: "left" },
    { label: "Energy transfer", ax: 214 / BOX, ay: 146 / BOX, lx: 0.94, ly: 0.06, align: "right" },
    { label: "Balancing Authority", ax: 98 / BOX, ay: 308 / BOX, lx: 0.04, ly: 0.92, align: "left" },
    { label: "Other BA", ax: 302 / BOX, ay: 308 / BOX, lx: 0.96, ly: 0.92, align: "right" },
  ],
};

/* 4 — Transmission: a lattice tower with spans */
const transmission: ShapeDef = {
  key: "transmission",
  draw(ctx) {
    const top = 64,
      base = 336,
      cx = 200;
    const legL = (y: number) => cx - 10 - ((y - top) / (base - top)) * 46;
    const legR = (y: number) => cx + 10 + ((y - top) / (base - top)) * 46;
    // legs
    ctx.beginPath();
    ctx.moveTo(cx, top - 14);
    ctx.lineTo(legL(top), top);
    ctx.lineTo(legL(base), base);
    ctx.moveTo(cx, top - 14);
    ctx.lineTo(legR(top), top);
    ctx.lineTo(legR(base), base);
    stroke(ctx, 1, 4);
    // lattice bracing
    ctx.beginPath();
    for (let y = top; y < base; y += 26) {
      ctx.moveTo(legL(y), y);
      ctx.lineTo(legR(y + 26), y + 26);
      ctx.moveTo(legR(y), y);
      ctx.lineTo(legL(y + 26), y + 26);
      ctx.moveTo(legL(y), y);
      ctx.lineTo(legR(y), y);
    }
    stroke(ctx, 0.75, 2);
    // cross arms
    for (const [y, half] of [
      [104, 74],
      [150, 60],
    ] as const) {
      ctx.beginPath();
      ctx.moveTo(cx - half, y);
      ctx.lineTo(cx + half, y);
      ctx.moveTo(cx - half, y);
      ctx.lineTo(legL(y + 18), y + 18);
      ctx.moveTo(cx + half, y);
      ctx.lineTo(legR(y + 18), y + 18);
      stroke(ctx, 1, 3.5);
      // insulators
      for (const x of [cx - half, cx + half]) {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, y + 16);
        stroke(ctx, 1, 3);
      }
    }
    // spans (sagging conductors)
    const span = (x0: number, y0: number, x1: number, y1: number, sag: number) => {
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.quadraticCurveTo((x0 + x1) / 2, Math.max(y0, y1) + sag, x1, y1);
      stroke(ctx, 0.9, 2.5);
    };
    span(126, 120, 0, 132, 34);
    span(274, 120, 400, 132, 34);
    span(140, 166, 0, 180, 30);
    span(260, 166, 400, 180, 30);
    // ground
    ctx.beginPath();
    ctx.moveTo(24, base);
    ctx.lineTo(376, base);
    stroke(ctx, 0.9, 3);
  },
  callouts: [
    { label: "BES transmission", ax: 0.5, ay: 0.55, lx: 0.94, ly: 0.62, align: "right" },
    { label: "Span", ax: 50 / BOX, ay: 146 / BOX, lx: 0.06, ly: 0.08, align: "left" },
    { label: "Transfer limit", ax: 350 / BOX, ay: 192 / BOX, lx: 0.94, ly: 0.3, align: "right" },
  ],
};

export const SHAPES: readonly ShapeDef[] = [load, generation, transfers, transmission];

/* ------------------------------------------------------------------ */

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Sample `n` points (normalized 0–1, interleaved x,y) from a shape's drawn alpha. */
export function samplePoints(shape: ShapeDef, n: number, seed = 7): Float32Array {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = BOX;
  const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
  shape.draw(ctx);
  const data = ctx.getImageData(0, 0, BOX, BOX).data;

  const candidates: number[] = [];
  for (let i = 0, p = 0; i < data.length; i += 4, p++) if (data[i + 3] > 8) candidates.push(p);

  const rnd = mulberry32(seed);
  const out = new Float32Array(n * 2);
  let k = 0;
  let guard = 0;
  while (k < n && guard < n * 60 && candidates.length) {
    guard++;
    const p = candidates[(rnd() * candidates.length) | 0];
    const a = data[p * 4 + 3] / 255;
    if (rnd() > a) continue;
    out[k * 2] = ((p % BOX) + rnd()) / BOX;
    out[k * 2 + 1] = (Math.floor(p / BOX) + rnd()) / BOX;
    k++;
  }
  return out;
}

/** Per-point stagger + scatter used while morphing (stable across shapes). */
export function morphSeeds(n: number, seed = 11) {
  const rnd = mulberry32(seed);
  const delay = new Float32Array(n);
  const sx = new Float32Array(n);
  const sy = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    delay[i] = rnd();
    const a = rnd() * Math.PI * 2;
    const r = 0.02 + rnd() * 0.08;
    sx[i] = Math.cos(a) * r;
    sy[i] = Math.sin(a) * r;
  }
  return { delay, sx, sy };
}
