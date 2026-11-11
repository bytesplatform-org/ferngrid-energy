import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

export function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

/** `01 / OUR SOFTWARE` style index label (structural, not copy). */
export function SectionLabel({
  index,
  children,
  className,
}: {
  index?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <p className={cx("text-label flex items-center gap-3 text-muted", className)}>
      {index && <span className="text-fg">{index}</span>}
      {index && <span aria-hidden className="h-px w-6 bg-current opacity-50" />}
      <span>{children}</span>
    </p>
  );
}

export function ArrowUpRight({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden className={cx("size-[0.9em]", className)}>
      <path d="M4.5 11.5 11.5 4.5M5.5 4.5h6v6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="square" />
    </svg>
  );
}

export function ArrowRight({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden className={cx("size-[0.9em]", className)}>
      <path d="M2.5 8h11M9 3.5 13.5 8 9 12.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="square" />
    </svg>
  );
}

const PILL_TONES = {
  paper: "bg-paper text-carbon hover:bg-white",
  fern: "bg-fern text-carbon hover:bg-[#93b478]",
  carbon: "bg-carbon text-paper hover:bg-ink",
  ghost: "bg-transparent text-fg ring-1 ring-inset ring-line hover:ring-current",
} as const;

type PillProps = Omit<ComponentProps<typeof Link>, "className"> & {
  tone?: keyof typeof PILL_TONES;
  size?: "sm" | "md" | "lg";
  icon?: "up-right" | "right" | "none";
  className?: string;
};

/** Rounded pill button-link used across nav and CTAs. */
export function PillLink({ tone = "paper", size = "md", icon = "none", className, children, ...rest }: PillProps) {
  const sizes = { sm: "h-9 px-3.5 text-[13px]", md: "h-11 px-5 text-sm", lg: "h-13 px-6 text-[15px]" };
  return (
    <Link
      {...rest}
      className={cx(
        "group/pill inline-flex items-center gap-2 rounded-full font-medium tracking-[-0.005em] whitespace-nowrap",
        "shadow-[0_1px_1px_rgb(0_0_0/0.06),0_10px_24px_-14px_rgb(0_0_0/0.45)] transition-[background-color,transform] duration-300 ease-out-quart",
        PILL_TONES[tone],
        sizes[size],
        className,
      )}
    >
      {children}
      {icon === "up-right" && (
        <ArrowUpRight className="transition-transform duration-300 group-hover/pill:translate-x-0.5 group-hover/pill:-translate-y-0.5" />
      )}
      {icon === "right" && <ArrowRight className="transition-transform duration-300 group-hover/pill:translate-x-0.5" />}
    </Link>
  );
}

/** Mono underlined text link (e.g. "Explore FEST"). */
export function MonoLink({ className, children, ...rest }: ComponentProps<typeof Link>) {
  return (
    <Link
      {...rest}
      className={cx(
        "text-label-md relative inline-flex items-center gap-2 py-2",
        "after:absolute after:inset-x-0 after:bottom-1 after:h-px after:origin-left after:bg-current after:transition-transform after:duration-500 after:ease-out-expo hover:after:scale-x-[0.35]",
        className,
      )}
    >
      {children}
    </Link>
  );
}
