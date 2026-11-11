import { cx } from "../ui/primitives";
import type { Callout } from "./shapes";

/**
 * Mono callout tags with leader lines, drawn over a square point-cloud box.
 * Anchors and labels are in 0–1 box coordinates.
 */
export function Callouts({ items, className }: { items: readonly Callout[]; className?: string }) {
  return (
    <div aria-hidden className={cx("pointer-events-none absolute inset-0", className)}>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 size-full overflow-visible">
        {items.map((c, i) => {
          const elbowY = c.ly * 100 + 2.2;
          return (
            <g key={i} stroke="currentColor" fill="none" className="text-paper/55">
              <polyline
                points={`${c.lx * 100},${elbowY} ${c.ax * 100},${elbowY} ${c.ax * 100},${c.ay * 100}`}
                strokeWidth="1"
                vectorEffect="non-scaling-stroke"
              />
            </g>
          );
        })}
      </svg>
      {items.map((c, i) => (
        <span key={`d${i}`}>
          <span
            className="absolute size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-fern ring-4 ring-fern/20"
            style={{ left: `${c.ax * 100}%`, top: `${c.ay * 100}%` }}
          />
          <span
            className={cx(
              "text-label absolute -translate-y-full rounded-sm bg-carbon/80 px-1.5 py-0.5 whitespace-nowrap text-paper",
              c.align === "right" && "-translate-x-full",
            )}
            style={{ left: `${c.lx * 100}%`, top: `${c.ly * 100 + 2.2}%` }}
          >
            {c.label}
          </span>
        </span>
      ))}
    </div>
  );
}
