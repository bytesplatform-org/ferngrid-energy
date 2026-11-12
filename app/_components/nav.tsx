"use client";

import Image from "next/image";
import { TransitionLink as Link } from "./ui/transition-link";
import { Suspense, useCallback, useEffect, useId, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { HOME, ROUTES, SITE } from "@/lib/content";
import { BigMenu, isActivePath } from "./big-menu";
import { gsap, useGSAP, MQ } from "./motion/gsap";
import { onIntro } from "./motion/intro";
import { setScrollLocked } from "./motion/smooth-scroll";
import { PillLink, cx } from "./ui/primitives";
import logoMark from "@/public/images/logo-mark.png";
import logoMarkPaper from "@/public/images/logo-mark-paper.png";

const LINKS = [
  { label: "Home", href: ROUTES.home },
  { label: "About", href: ROUTES.about },
  { label: "NERC BAL-007-1", href: ROUTES.nerc },
  { label: "FEST", href: ROUTES.fest },
  { label: "FAQ", href: ROUTES.faq },
] as const;

/** Desktop links; the current page gets a fern underline and aria-current. */
function LinkList({ pathname }: { pathname: string | null }) {
  return (
    <ul className="hidden items-center gap-8 lg:flex">
      {LINKS.map((l) => {
        const active = isActivePath(pathname, l.href);
        return (
          <li key={l.href}>
            <Link
              href={l.href}
              aria-current={active ? "page" : undefined}
              className={cx(
                "relative py-2 text-sm font-medium transition-opacity duration-300",
                "after:absolute after:inset-x-0 after:bottom-0 after:origin-left after:transition-transform after:duration-500 after:ease-out-expo",
                active
                  ? "opacity-100 after:h-[2px] after:scale-x-100 after:bg-fern"
                  : "opacity-75 after:h-px after:scale-x-0 after:bg-current hover:opacity-100 hover:after:scale-x-100",
              )}
            >
              {l.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

/**
 * Reads the current path. Kept behind Suspense (see usages): with Cache
 * Components, usePathname can suspend on routes with dynamic params, and the
 * fallback is the same UI without the highlight.
 */
function ActiveLinkList() {
  return <LinkList pathname={usePathname()} />;
}

function ActiveBigMenu({ onNavigate }: { onNavigate: () => void }) {
  return <BigMenu onNavigate={onNavigate} pathname={usePathname()} />;
}

/** Scroll distance after which the bar turns solid. */
const SOLID_AFTER = 24;

function Wordmark({ dark }: { dark: boolean }) {
  return (
    <span className="flex items-center gap-3">
      <span className="relative block size-9">
        <Image
          src={logoMarkPaper}
          alt=""
          width={36}
          height={36}
          className={cx("absolute inset-0 size-9 transition-opacity duration-300", !dark && "opacity-0")}
        />
        <Image
          src={logoMark}
          alt=""
          width={36}
          height={36}
          className={cx("absolute inset-0 size-9 transition-opacity duration-300", dark && "opacity-0")}
        />
      </span>
      <span className="font-display hidden text-[15px] leading-none tracking-[0.32em] uppercase sm:block">
        FernGrid Energy
      </span>
    </span>
  );
}

function MenuIcon({ open }: { open: boolean }) {
  return (
    <span aria-hidden className="relative block h-2.5 w-3.5">
      <span
        className={cx(
          "absolute left-0 block h-px w-3.5 bg-current transition-transform duration-300",
          open ? "top-1/2 rotate-45" : "top-0",
        )}
      />
      <span
        className={cx(
          "absolute left-0 block h-px w-3.5 bg-current transition-transform duration-300",
          open ? "top-1/2 -rotate-45" : "bottom-0",
        )}
      />
    </span>
  );
}

/**
 * Classic full-width navigation bar.
 * - Logo on the left; text links + Contact Us on the right (≥1024px).
 * - Transparent with light text over the top of the hero; once the page is
 *   scrolled it becomes a solid paper bar with dark text and a bottom rule.
 * - Below 1024px the links move into a full-screen menu overlay.
 */
export function Nav() {
  const [open, setOpen] = useState(false);
  const [solid, setSolid] = useState(false);
  const menuId = useId();
  const overlayRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const headerRef = useRef<HTMLElement>(null);

  // Drops in as the loader lifts (part of the loader's exit timeline).
  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add(MQ.motion, () =>
      onIntro((tl) => {
        tl.fromTo(
          headerRef.current,
          { yPercent: -120 },
          { yPercent: 0, duration: 1.1, ease: "expo.out", clearProps: "transform" },
          1.05,
        );
      }),
    );
  });

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    let raf = 0;
    const check = () => {
      raf = 0;
      setSolid(window.scrollY > SOLID_AFTER);
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(check);
    };
    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", schedule);
    };
  }, []);

  // Overlay (mobile): lock scroll, trap focus, Escape to close, restore focus.
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

  // Close the overlay if the viewport grows past the breakpoint.
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const onChange = () => mq.matches && setOpen(false);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return (
    <>
      <header
        ref={headerRef}
        className={cx(
          "fixed inset-x-0 top-0 z-50 rounded-b-[28px] transition-[background-color,box-shadow,color,backdrop-filter] duration-300 md:rounded-b-[36px]",
          solid
            ? "bg-paper/90 text-carbon shadow-[0_10px_30px_-18px_rgb(29_34_15/0.45)] backdrop-blur-md"
            : "bg-transparent text-paper",
        )}
      >
        <nav
          aria-label="Primary"
          className={cx(
            "flex items-center justify-between px-5 transition-[height] duration-300 md:px-10",
            solid ? "h-16" : "h-20 md:h-24",
          )}
        >
          <Link href={ROUTES.home} aria-label={`${SITE.shortName} home`}>
            <Wordmark dark={!solid} />
          </Link>

          <div className="flex items-center gap-2 lg:gap-8">
            <Suspense fallback={<LinkList pathname={null} />}>
              <ActiveLinkList />
            </Suspense>

            <PillLink href={HOME.hero.buttons.contact.href} tone="fern" size="sm" icon="up-right" className="h-10 px-4">
              {HOME.hero.buttons.contact.label}
            </PillLink>

            <button
              ref={toggleRef}
              type="button"
              aria-expanded={open}
              aria-controls={menuId}
              onClick={() => setOpen(true)}
              className={cx(
                "inline-flex h-10 items-center gap-2.5 rounded-full px-4 text-[13px] font-medium transition-colors duration-300 lg:hidden",
                solid ? "bg-carbon text-paper hover:bg-ink" : "bg-paper text-carbon hover:bg-white",
              )}
            >
              <MenuIcon open={false} />
              Menu
            </button>
          </div>
        </nav>
      </header>

      {/* Full-screen menu (below 1024px) */}
      <div
        ref={overlayRef}
        id={menuId}
        role="dialog"
        aria-modal="true"
        aria-label="Site menu"
        hidden={!open}
        className="surface-dark fixed inset-0 z-[60] overflow-y-auto bg-carbon"
        data-lenis-prevent
      >
        <div className="flex h-20 items-center justify-between px-5 md:h-24 md:px-10">
          <Link href={ROUTES.home} onClick={close} aria-label={`${SITE.shortName} home`}>
            <Wordmark dark />
          </Link>
          <button
            type="button"
            onClick={close}
            className="inline-flex h-10 items-center gap-2.5 rounded-full bg-paper px-4 text-[13px] font-medium text-carbon hover:bg-white"
          >
            <MenuIcon open />
            Close
          </button>
        </div>

        <div className="px-5 pt-6 pb-12 md:px-10">
          <p className="text-label mb-4 text-muted">Menu</p>
          <Suspense fallback={<BigMenu onNavigate={close} />}>
            <ActiveBigMenu onNavigate={close} />
          </Suspense>
          <div className="text-label mt-10 flex flex-col gap-2 text-muted md:flex-row md:gap-8">
            <a href={`mailto:${SITE.email}`} className="hover:text-paper">
              {SITE.email}
            </a>
            <a href={SITE.phoneHref} className="hover:text-paper">
              {SITE.phone}
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
