"use client";

import Image from "next/image";
import { Fragment, useRef, useState } from "react";
import { HOME, SITE } from "@/lib/content";
import { gsap, ScrollTrigger, useGSAP, MQ } from "./motion/gsap";
import { PillLink, cx } from "./ui/primitives";
import pylon from "@/public/images/about-pylon.webp";

const ACCENT = "reliable engineering";

/** The three verbatim headline lines, split into words; the accent words are flagged. */
function headlineWords() {
  const [l1, l2, l3] = HOME.closing.lines;
  const [before, after] = l3.split(ACCENT);
  const plain = (s: string) =>
    s
      .split(" ")
      .filter(Boolean)
      .map((w) => ({ w, accent: false, tail: "" }));
  const accentWords = ACCENT.split(" ").map((w, i, all) => ({
    w,
    accent: true,
    // keep the trailing period glued to the last accent word
    tail: i === all.length - 1 ? after : "",
  }));
  return [plain(l1), plain(l2), [...plain(before), ...accentWords]];
}

/**
 * Closing CTA over the pylon-in-fog photograph.
 * - Hovering the headline: letters swell in weight towards the cursor.
 * - The headline assembles word by word as you scroll (3D tilt + de-blur, scrubbed),
 *   then "reliable engineering" sweeps from paper to fern.
 * - Buttons are magnetic; contact rules draw in; the email can be copied.
 * Static (and fully legible) without JS / under reduced motion.
 */
export function ClosingCta({ stackOver }: { stackOver?: string } = {}) {
  const { closing } = HOME;
  const ref = useRef<HTMLElement>(null);
  const [copied, setCopied] = useState(false);
  const lines = headlineWords();

  useGSAP(
    () => {
      const section = ref.current;
      if (!section) return;
      const q = gsap.utils.selector(section);
      const mm = gsap.matchMedia();

      mm.add(MQ.motion, (context) => {
        // Stacked over a pinned previous scene: that scene shrinks back and dims
        // while this section slides up over it. (Its pinned layout may mount after
        // this, so look for it again after each layout refresh.)
        if (stackOver) {
          let started = false;
          const start = () => {
            const under = document.querySelector<HTMLElement>(stackOver);
            if (started || !under) return;
            started = true;
            context.add(() => {
              gsap.fromTo(
                under,
                { scale: 1, opacity: 1 },
                {
                  scale: 0.9,
                  opacity: 0.25,
                  ease: "none",
                  scrollTrigger: {
                    trigger: section,
                    start: "top bottom",
                    end: "top top",
                    scrub: true,
                  },
                },
              );
            });
          };
          start();
          if (!started) ScrollTrigger.addEventListener("refresh", start);
          context.add(
            () => () => ScrollTrigger.removeEventListener("refresh", start),
          );
        }

        // Photo: slow push-in + drift while the section crosses the viewport.
        gsap.fromTo(
          q("[data-bg]"),
          { yPercent: -6, scale: 1.18 },
          {
            yPercent: 6,
            scale: 1.04,
            ease: "none",
            scrollTrigger: {
              trigger: section,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          },
        );

        // Headline: words tilt up out of the fog, scrubbed to scroll (both directions).
        const words = q("[data-cword]");
        const accents = q("[data-accent]");
        gsap.set(words, {
          yPercent: 70,
          rotateX: -75,
          opacity: 0,
          filter: "blur(14px)",
        });
        gsap.set(accents, { backgroundPosition: "100% 0%" });
        gsap
          .timeline({
            defaults: { ease: "none" },
            scrollTrigger: {
              trigger: q("[data-headline]")[0],
              start: "top 88%",
              end: "top 30%",
              scrub: 0.6,
            },
          })
          .to(words, {
            yPercent: 0,
            rotateX: 0,
            opacity: 1,
            filter: "blur(0px)",
            duration: 0.5,
            stagger: 0.06,
            ease: "power2.out",
          })
          .to(
            accents,
            { backgroundPosition: "0% 0%", duration: 0.35, stagger: 0.12 },
            ">-0.15",
          );

        // Body, buttons and contact rows.
        gsap.from(q("[data-rise]"), {
          y: 36,
          autoAlpha: 0,
          duration: 1.1,
          stagger: 0.09,
          ease: "expo.out",
          scrollTrigger: {
            trigger: q("[data-rise]")[0],
            start: "top 90%",
            once: true,
          },
        });
        gsap.fromTo(
          q("[data-rule]"),
          { scaleX: 0 },
          {
            scaleX: 1,
            ease: "none",
            stagger: 0.15,
            scrollTrigger: {
              trigger: q("[data-contacts]")[0],
              start: "top 95%",
              end: "top 55%",
              scrub: 0.6,
            },
          },
        );
      });

      // Pointer-only interactivity (fine pointers, motion allowed).
      mm.add(`${MQ.motion} and (pointer: fine)`, () => {
        // Headline: letters swell towards the cursor (Dosis is a variable font,
        // so the weight glides smoothly between 300 and 750).
        const headline = q("[data-headline]")[0] as HTMLElement;
        const chars = q("[data-ch]").map((el) => ({
          el,
          cx: 0,
          cy: 0,
          w: gsap.quickTo(el, "fontWeight", {
            duration: 0.55,
            ease: "power3.out",
          }),
        }));
        const measureChars = () => {
          const h = headline.getBoundingClientRect();
          for (const c of chars) {
            const r = c.el.getBoundingClientRect();
            c.cx = r.left + r.width / 2 - h.left;
            c.cy = r.top + r.height / 2 - h.top;
          }
        };
        const BASE = 300;
        const PEAK = 750;
        const swell = (e: PointerEvent) => {
          const h = headline.getBoundingClientRect();
          const x = e.clientX - h.left;
          const y = e.clientY - h.top;
          const radius = parseFloat(getComputedStyle(headline).fontSize) * 2.2;
          for (const c of chars) {
            const d = Math.hypot(c.cx - x, (c.cy - y) * 1.4);
            const k = Math.max(0, 1 - d / radius);
            c.w(BASE + (PEAK - BASE) * k * k);
          }
        };
        const calm = () => chars.forEach((c) => c.w(BASE));
        headline.addEventListener("pointerenter", measureChars);
        headline.addEventListener("pointermove", swell);
        headline.addEventListener("pointerleave", calm);

        const magnets = q("[data-magnet]").map((el) => ({
          el,
          x: gsap.quickTo(el, "x", { duration: 0.5, ease: "power3.out" }),
          y: gsap.quickTo(el, "y", { duration: 0.5, ease: "power3.out" }),
        }));

        const move = (e: PointerEvent) => {
          for (const m of magnets) {
            const b = m.el.getBoundingClientRect();
            const dx = e.clientX - (b.left + b.width / 2);
            const dy = e.clientY - (b.top + b.height / 2);
            const near =
              Math.abs(dx) < b.width / 2 + 50 &&
              Math.abs(dy) < b.height / 2 + 40;
            m.x(near ? dx * 0.32 : 0);
            m.y(near ? dy * 0.4 : 0);
          }
        };
        const leave = () => magnets.forEach((m) => (m.x(0), m.y(0)));
        section.addEventListener("pointermove", move);
        section.addEventListener("pointerleave", leave);
        return () => {
          section.removeEventListener("pointermove", move);
          section.removeEventListener("pointerleave", leave);
          headline.removeEventListener("pointerenter", measureChars);
          headline.removeEventListener("pointermove", swell);
          headline.removeEventListener("pointerleave", calm);
        };
      });
    },
    { scope: ref },
  );

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(SITE.email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      window.location.href = `mailto:${SITE.email}`;
    }
  };

  return (
    <section
      ref={ref}
      id="consultation"
      aria-labelledby="closing-title"
      className={cx(
        "surface-dark arc-prev relative overflow-hidden bg-carbon px-5 pt-28 md:px-10 md:pt-40",
        stackOver
          ? // slides up over the last (pinned) screen of the previous section, like a card
            "z-20 motion-safe:[.js_&]:-mt-[100svh] motion-safe:[.js_&]:rounded-t-[28px] motion-safe:[.js_&]:shadow-[0_-40px_90px_-30px_rgb(0_0_0/0.75)] md:motion-safe:[.js_&]:rounded-t-[44px]"
          : "z-10",
      )}
    >
      {/* Photo (slow push-in on scroll) */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          data-bg
          className="absolute inset-x-0 -top-[8%] -bottom-[8%] will-change-transform"
        >
          <Image
            src={pylon}
            alt="Transmission pylon fading into fog over a snowy hillside"
            fill
            sizes="100vw"
            placeholder="blur"
            className="photo object-cover object-[70%_50%]"
          />
          <div aria-hidden className="absolute inset-0 bg-carbon/75" />
        </div>
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(90%_70%_at_30%_40%,transparent,rgb(18_22_10/0.6))]"
      />

      <div className="relative mx-auto max-w-[1600px]">
        <h2
          id="closing-title"
          data-headline
          className="font-display text-[clamp(2.75rem,6.8vw,7.75rem)] leading-[0.98] [perspective:900px]"
        >
          {lines.map((line, l) => (
            <Fragment key={l}>
              {l > 0 && " "}
              <span className="block">
                {line.map(({ w, accent, tail }, i) => (
                  <Fragment key={i}>
                    {i > 0 && " "}
                    <span
                      data-cword
                      className="inline-block origin-bottom whitespace-nowrap will-change-transform"
                    >
                      <span
                        data-accent={accent || undefined}
                        className={cx(
                          accent &&
                            "-my-[0.14em] inline-block bg-[linear-gradient(90deg,var(--color-fern)_50%,var(--color-paper)_50%)] bg-[length:200%_100%] bg-clip-text py-[0.14em] text-transparent",
                        )}
                      >
                        {w.split("").map((ch, k) => (
                          <span key={k} data-ch>
                            {ch}
                          </span>
                        ))}
                      </span>
                      {tail}
                    </span>
                  </Fragment>
                ))}
              </span>
            </Fragment>
          ))}
        </h2>

        <div className="mt-14 grid gap-12 md:mt-20 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <p
              data-rise
              className="max-w-[56ch] text-lg leading-relaxed text-paper/80"
            >
              {closing.body}
            </p>
            <div data-rise className="mt-10 flex flex-wrap gap-3">
              <span data-magnet className="inline-block">
                <PillLink
                  href={closing.buttons.explore.href}
                  tone="paper"
                  size="lg"
                >
                  {closing.buttons.explore.label}
                </PillLink>
              </span>
              <span data-magnet className="inline-block">
                <PillLink
                  href={closing.buttons.contact.href}
                  tone="fern"
                  size="lg"
                  icon="up-right"
                >
                  {closing.buttons.contact.label}
                </PillLink>
              </span>
            </div>
          </div>

          <dl
            data-contacts
            className="text-label-md grid gap-5 lg:col-span-4 lg:col-start-9"
          >
            <div data-rise className="relative flex flex-col gap-1.5 pt-4">
              <span
                data-rule
                aria-hidden
                className="absolute inset-x-0 top-0 h-px origin-left bg-line"
              />
              <dt className="text-paper/60">Email —</dt>
              <dd className="flex items-center justify-between gap-4">
                <a
                  href={`mailto:${SITE.email}`}
                  className="group relative normal-case tracking-[0.08em]"
                >
                  {SITE.email}
                  <span
                    aria-hidden
                    className="absolute inset-x-0 -bottom-1 h-px origin-right scale-x-0 bg-fern transition-transform duration-500 group-hover:origin-left group-hover:scale-x-100"
                  />
                </a>
                <button
                  type="button"
                  onClick={copyEmail}
                  className="text-label rounded-full px-3 py-1.5 text-paper/80 ring-1 ring-paper/25 transition-colors hover:bg-paper hover:text-carbon"
                >
                  <span aria-live="polite">{copied ? "Copied" : "Copy"}</span>
                </button>
              </dd>
            </div>
            <div data-rise className="relative flex flex-col gap-1.5 pt-4">
              <span
                data-rule
                aria-hidden
                className="absolute inset-x-0 top-0 h-px origin-left bg-line"
              />
              <dt className="text-paper/60">Call —</dt>
              <dd>
                <a href={SITE.phoneHref} className="group relative">
                  {SITE.phone}
                  <span
                    aria-hidden
                    className="absolute inset-x-0 -bottom-1 h-px origin-right scale-x-0 bg-fern transition-transform duration-500 group-hover:origin-left group-hover:scale-x-100"
                  />
                </a>
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  );
}
