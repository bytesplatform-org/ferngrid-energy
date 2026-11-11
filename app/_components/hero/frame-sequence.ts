/**
 * Progressive image-sequence loader + "cover" canvas renderer for the hero scrub.
 *
 * Load order: frame 1 first, then every 10th frame (so fast scrubs always have a
 * nearby keyframe), then everything else. Requests run with low fetch priority
 * and limited concurrency, so they never compete with interaction or the LCP.
 */
export class FrameSequence {
  private frames: (HTMLImageElement | null)[];
  private queue: number[] = [];
  private inFlight = 0;
  private disposed = false;
  private onFrameLoaded: (index: number) => void;

  constructor(
    private readonly count: number,
    private readonly urlFor: (index: number) => string,
    opts: { concurrency?: number; onFrameLoaded?: (index: number) => void } = {},
  ) {
    this.frames = new Array(count).fill(null);
    this.concurrency = opts.concurrency ?? 6;
    this.onFrameLoaded = opts.onFrameLoaded ?? (() => {});
  }

  private readonly concurrency: number;

  /** Start loading: frame 0 immediately, the rest when the browser is idle. */
  start() {
    const order: number[] = [];
    const seen = new Set<number>();
    const push = (i: number) => {
      if (i >= 0 && i < this.count && !seen.has(i)) {
        seen.add(i);
        order.push(i);
      }
    };
    push(0);
    for (let i = 9; i < this.count; i += 10) push(i);
    push(this.count - 1);
    for (let i = 0; i < this.count; i++) push(i);

    this.queue = order;
    this.load(this.queue.shift()!, "high");

    const kick = () => this.pump();
    if ("requestIdleCallback" in window) window.requestIdleCallback(kick, { timeout: 1200 });
    else setTimeout(kick, 300);
  }

  private pump() {
    while (!this.disposed && this.inFlight < this.concurrency && this.queue.length) {
      this.load(this.queue.shift()!, "low");
    }
  }

  private load(index: number, priority: "high" | "low") {
    this.inFlight++;
    const img = new Image();
    img.decoding = "async";
    img.fetchPriority = priority;
    img.src = this.urlFor(index);
    const done = (ok: boolean) => {
      this.inFlight--;
      if (this.disposed) return;
      if (ok) {
        this.frames[index] = img;
        this.onFrameLoaded(index);
      }
      this.pump();
    };
    img
      .decode()
      .then(() => done(true))
      .catch(() => done(img.complete && img.naturalWidth > 0));
  }

  /** The requested frame, or the nearest one that has loaded. */
  get(index: number): HTMLImageElement | null {
    const i = Math.max(0, Math.min(this.count - 1, index));
    if (this.frames[i]) return this.frames[i];
    for (let d = 1; d < this.count; d++) {
      const a = this.frames[i - d];
      if (a) return a;
      const b = this.frames[i + d];
      if (b) return b;
    }
    return null;
  }

  dispose() {
    this.disposed = true;
    this.queue = [];
    this.frames = [];
  }
}

/** Draws an image into a canvas with CSS `object-fit: cover` semantics. */
export function drawCover(ctx: CanvasRenderingContext2D, img: HTMLImageElement, cw: number, ch: number) {
  const iw = img.naturalWidth;
  const ih = img.naturalHeight;
  const scale = Math.max(cw / iw, ch / ih);
  const w = iw * scale;
  const h = ih * scale;
  ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);
}
