import Link from "next/link";
import { NAV } from "@/lib/content";
import { ArrowUpRight, cx } from "./ui/primitives";

/**
 * Big condensed menu: `01 HOME ↗` rows separated by 1px rules.
 * Shared by the footer and the mobile menu overlay.
 */
export function BigMenu({ onNavigate, className }: { onNavigate?: () => void; className?: string }) {
  return (
    <ul className={cx("border-t border-line", className)}>
      {NAV.map((item, i) => (
        <li key={item.href} className="border-b border-line">
          <Link
            href={item.href}
            onClick={onNavigate}
            className="group flex items-baseline gap-4 py-3 md:gap-6 md:py-4"
          >
            <span className="text-label w-6 shrink-0 text-muted">{String(i + 1).padStart(2, "0")}</span>
            <span className="font-condensed text-[clamp(2.25rem,6vw,5.5rem)] leading-[0.9] uppercase transition-transform duration-500 ease-out-expo group-hover:translate-x-2">
              {item.label}
            </span>
            <ArrowUpRight className="ml-auto size-5 self-center text-muted transition-[color,transform] duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-fg md:size-7" />
          </Link>
        </li>
      ))}
    </ul>
  );
}
