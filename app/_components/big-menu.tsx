import Link from "next/link";
import { NAV } from "@/lib/content";
import { ArrowUpRight, cx } from "./ui/primitives";

/** Whether `href` is the current page (Home only matches "/" exactly). */
export function isActivePath(pathname: string | null, href: string) {
  if (!pathname) return false;
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * Big condensed menu: `01 HOME ↗` rows separated by 1px rules.
 * Shared by the footer and the mobile menu overlay. Pass `pathname` to mark the
 * current page (the overlay does; the footer doesn't).
 */
export function BigMenu({
  onNavigate,
  className,
  pathname = null,
  fit = false,
}: {
  onNavigate?: () => void;
  className?: string;
  pathname?: string | null;
  /** Size rows by viewport height too, so the whole menu fits on one screen (footer). */
  fit?: boolean;
}) {
  return (
    <ul className={cx("border-t border-line", className)}>
      {NAV.map((item, i) => {
        const active = isActivePath(pathname, item.href);
        return (
          <li key={item.href} className="border-b border-line">
            <Link
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cx("group flex items-baseline gap-4 md:gap-6", fit ? "py-[min(0.9rem,1.1svh)]" : "py-3 md:py-4")}
            >
              <span className={cx("text-label w-6 shrink-0", active ? "text-fern" : "text-muted")}>
                {String(i + 1).padStart(2, "0")}
              </span>
              <span
                className={cx(
                  "font-condensed leading-[0.9] uppercase transition-transform duration-500 ease-out-expo group-hover:translate-x-2",
                  fit ? "text-[clamp(1.75rem,min(6vw,7svh),5.5rem)]" : "text-[clamp(2.25rem,6vw,5.5rem)]",
                  active && "text-fern",
                )}
              >
                {item.label}
              </span>
              <ArrowUpRight className="ml-auto size-5 self-center text-muted transition-[color,transform] duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-fg md:size-7" />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
