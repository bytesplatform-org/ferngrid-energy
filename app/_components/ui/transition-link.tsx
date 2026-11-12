"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import { startPageTransition } from "../motion/page-transition";

/**
 * next/link that plays the page transition: on a client-side navigation
 * (`onNavigate`: same-origin, no modifier keys, not a download) the loader takes
 * over, covers the page, and navigates itself.
 */
export function TransitionLink({ href, onNavigate, ...rest }: ComponentProps<typeof Link>) {
  return (
    <Link
      href={href}
      {...rest}
      onNavigate={(e) => {
        onNavigate?.(e);
        if (typeof href === "string" && startPageTransition(href)) e.preventDefault();
      }}
    />
  );
}
