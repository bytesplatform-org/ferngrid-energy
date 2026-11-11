"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { HOME, ROUTES, SITE } from "@/lib/content";
import { BigMenu } from "./big-menu";
import { setScrollLocked } from "./motion/smooth-scroll";
import { ArrowUpRight, PillLink, cx } from "./ui/primitives";
import logoMark from "@/public/images/logo-mark.png";
import logoMarkPaper from "@/public/images/logo-mark-paper.png";

const DESKTOP_LINKS = [
  { label: "About", href: ROUTES.about },
  { label: "NERC BAL-007-1", href: ROUTES.nerc },
  { label: "FEST", href: ROUTES.fest },
  { label: "FAQ", href: ROUTES.faq },
] as const;

const pill =
  "inline-flex h-10 items-center rounded-full bg-paper px-4 text-[13px] font-medium text-carbon shadow-[0_1px_1px_rgb(0_0_0/0.06),0_10px_24px_-14px_rgb(0_0_0/0.5)] transition-colors duration-300 hover:bg-white";

/** Floating pill navigation, fixed top-centre. */
export function Nav() {
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const overlayRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    setScrollLocked(true);
    const overlay = overlayRef.current;
    overlay?.querySelector<HTMLElement>("a,button")?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        return;
      }
      // Keep focus inside the dialog.
      if (e.key === "Tab" && overlay) {
        const focusables = overlay.querySelectorAll<HTMLElement>("a[href],button");
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    const toggle = toggleRef.current;
    return () => {
      document.removeEventListener("keydown", onKey);
      setScrollLocked(false);
      toggle?.focus();
    };
  }, [open]);

  return (
    <>
      <nav aria-label="Primary" className="pointer-events-none fixed inset-x-0 top-4 z-50 flex justify-center px-4 md:top-5">
        <div className="pointer-events-auto flex items-center gap-1.5">
          <Link
            href={ROUTES.home}
            aria-label={`${SITE.shortName} home`}
            className="grid size-10 place-items-center rounded-full bg-paper shadow-[0_1px_1px_rgb(0_0_0/0.06),0_10px_24px_-14px_rgb(0_0_0/0.5)]"
          >
            <Image src={logoMark} alt="" width={26} height={26} className="size-[26px]" />
          </Link>

          <ul className="hidden items-center gap-1.5 md:flex">
            {DESKTOP_LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className={pill}>
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>

          <PillLink href={HOME.hero.buttons.contact.href} tone="fern" size="sm" className="h-10 px-4">
            {HOME.hero.buttons.contact.label}
          </PillLink>
          <Link
            href={ROUTES.contact}
            aria-label="Contact FernGrid Energy"
            className="hidden size-10 place-items-center rounded-[12px] bg-paper text-carbon shadow-[0_1px_1px_rgb(0_0_0/0.06),0_10px_24px_-14px_rgb(0_0_0/0.5)] md:grid"
          >
            <ArrowUpRight className="size-4" />
          </Link>

          <button
            ref={toggleRef}
            type="button"
            aria-expanded={open}
            aria-controls={menuId}
            onClick={() => setOpen(true)}
            className={cx(pill, "gap-2 md:hidden")}
          >
            <span aria-hidden className="flex flex-col gap-[3px]">
              <span className="block h-px w-3.5 bg-current" />
              <span className="block h-px w-3.5 bg-current" />
            </span>
            Menu
          </button>
        </div>
      </nav>

      <div
        ref={overlayRef}
        id={menuId}
        role="dialog"
        aria-modal="true"
        aria-label="Site menu"
        hidden={!open}
        className="surface-dark fixed inset-0 z-[60] overflow-y-auto bg-carbon px-5 pt-5 pb-10"
        data-lenis-prevent
      >
        <div className="flex items-center justify-between">
          <Link href={ROUTES.home} onClick={close} aria-label={`${SITE.shortName} home`} className="grid size-10 place-items-center">
            <Image src={logoMarkPaper} alt="" width={28} height={28} className="size-7" />
          </Link>
          <button type="button" onClick={close} className={cx(pill, "gap-2")}>
            <span aria-hidden className="relative block size-3">
              <span className="absolute top-1/2 left-0 block h-px w-3 rotate-45 bg-current" />
              <span className="absolute top-1/2 left-0 block h-px w-3 -rotate-45 bg-current" />
            </span>
            Close
          </button>
        </div>
        <p className="text-label mt-10 mb-4 text-muted">Menu</p>
        <BigMenu onNavigate={close} />
        <div className="text-label mt-10 flex flex-col gap-2 text-muted">
          <a href={`mailto:${SITE.email}`} className="hover:text-paper">
            {SITE.email}
          </a>
          <a href={SITE.phoneHref} className="hover:text-paper">
            {SITE.phone}
          </a>
        </div>
      </div>
    </>
  );
}
