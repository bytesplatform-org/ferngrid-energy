import { cx } from "../ui/primitives";

/**
 * Engineering-drawing style callouts around the hero lockup: a mono label and a
 * curved fern arrow pointing at the wordmark. Labels are terms from the site copy.
 * Decorative (aria-hidden); desktop only. HeroStage draws them in and gives
 * them the strongest cursor parallax.
 */
type Anno = {
  label: string;
  /** Box placement relative to the lockup. */
  box: string;
  w: number;
  h: number;
  /** Label placement inside the box. */
  labelAt: string;
  /** Arrow path in box coordinates; ends at the target. */
  d: string;
  /** Target ring position. */
  ring: [number, number];
};

const ANNOS: Anno[] = [
  {
    label: "Near-Term ERA",
    box: "right-[calc(100%+12px)] top-[-6%]",
    w: 220,
    h: 130,
    labelAt: "left-0 top-0",
    d: "M 118 26 C 170 26, 200 48, 206 104",
    ring: [208, 116],
  },
  {
    label: "BAL-007-1",
    box: "left-[calc(100%+4px)] top-[-14%]",
    w: 200,
    h: 130,
    labelAt: "right-0 top-0 text-right",
    d: "M 104 24 C 50 22, 20 52, 16 104",
    ring: [14, 116],
  },
  {
    label: "Fuel security",
    box: "right-[calc(100%+20px)] bottom-[22%]",
    w: 230,
    h: 120,
    labelAt: "left-0 bottom-0",
    d: "M 126 98 C 186 100, 214 70, 218 22",
    ring: [219, 12],
  },
  {
    label: "FEST",
    box: "left-[calc(100%+20px)] bottom-[30%]",
    w: 190,
    h: 120,
    labelAt: "right-0 bottom-0 text-right",
    d: "M 132 98 C 70 100, 20 76, 14 24",
    ring: [12, 13],
  },
];

export function HeroAnnotations() {
  return (
    <div aria-hidden data-hero-annos className="pointer-events-none absolute inset-0 hidden lg:block">
      {ANNOS.map((a) => (
        <div
          key={a.label}
          data-anno
          className={cx("absolute motion-safe:[.js_&]:invisible motion-safe:[.js_&]:opacity-0", a.box)}
          style={{ width: a.w, height: a.h }}
        >
          <svg viewBox={`0 0 ${a.w} ${a.h}`} width={a.w} height={a.h} className="absolute inset-0 overflow-visible" fill="none">
            <path
              data-anno-path
              d={a.d}
              pathLength={1}
              strokeDasharray="1 1"
              stroke="var(--color-fern)"
              strokeWidth={1.5}
              strokeLinecap="round"
            />
            <circle cx={a.ring[0]} cy={a.ring[1]} r={6} stroke="var(--color-fern)" strokeWidth={1.5} />
            <circle cx={a.ring[0]} cy={a.ring[1]} r={2} fill="var(--color-fern)" />
          </svg>
          <span
            className={cx(
              "text-label-md absolute flex items-center gap-2 whitespace-nowrap text-paper [text-shadow:0_1px_12px_rgb(18_22_10/0.8)]",
              a.labelAt,
            )}
          >
            <span className="size-1.5 rounded-full bg-fern" />
            {a.label}
          </span>
        </div>
      ))}
    </div>
  );
}

/** Hand-drawn ring around the LLC badge. */
export function LlcRing() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 200 80"
      preserveAspectRatio="none"
      className="pointer-events-none absolute top-[-55%] left-[-38%] h-[210%] w-[176%] overflow-visible motion-safe:[.js_&]:invisible motion-safe:[.js_&]:opacity-0"
      data-llc-ring
    >
      <ellipse
        data-anno-path
        cx="100"
        cy="40"
        rx="96"
        ry="34"
        transform="rotate(-4 100 40)"
        pathLength={1}
        strokeDasharray="1 1"
        fill="none"
        stroke="var(--color-fern)"
        strokeWidth={1.25}
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
