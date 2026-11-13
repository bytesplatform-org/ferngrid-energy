"use client";

import Image from "next/image";
import { Fragment, useRef } from "react";
import { CONTACT, SITE } from "@/lib/content";
import { gsap, useGSAP, MQ } from "../motion/gsap";
import { introPending, onIntro } from "../motion/intro";
import { cx } from "../ui/primitives";
import banner from "@/public/images/home-banner.webp";
import logoMark from "@/public/images/logo-mark.png";

/** The line between the two nodes, in a 1000×200 box (it sags like a cable). */
const LINE = "M 40 70 Q 500 210 960 70";
const A = { x: 40, y: 70 };
const B = { x: 960, y: 70 };
/** Point on the quadratic at t (for the pulses). */
const at = (t: number) => {
  const cx = 500;
  const cy = 210;
  const x = (1 - t) ** 2 * A.x + 2 * (1 - t) * t * cx + t ** 2 * B.x;
  const y = (1 - t) ** 2 * A.y + 2 * (1 - t) * t * cy + t ** 2 * B.y;
  return { x: x / 10, y: y / 2 }; // → % of the box
};
const DRIFT = 22;

/**
 * Contact hero: "CONTACT US" over the turbine ridge.
 * Scroll (pinned): the title rises and shrinks; a transmission line draws itself
 * across the screen from your side to FernGrid's while the intro sentence lights
 * up word by word; once connected, energy pulses run along it and "We look
 * forward to connecting with you." arrives.
 */
export function ContactHero() {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const section = ref.current!;
      const q = gsap.utils.selector(section);
      const mm = gsap.matchMedia();

      mm.add(MQ.motion, () => {
        const entrance = (tl: gsap.core.Timeline, at0: number) =>
          tl
            .fromTo(
              "[data-ch-img]",
              { scale: 1.3 },
              { scale: 1, duration: 1.9, ease: "expo.out" },
              at0,
            )
            .fromTo(
              "[data-ch-letter]",
              { yPercent: 110, rotateX: -70, autoAlpha: 0 },
              {
                yPercent: 0,
                rotateX: 0,
                autoAlpha: 1,
                duration: 1.2,
                stagger: 0.05,
                ease: "expo.out",
              },
              at0 + 0.35,
            )
            .fromTo(
              "[data-ch-meta]",
              { autoAlpha: 0, y: 16 },
              {
                autoAlpha: 1,
                y: 0,
                duration: 0.9,
                stagger: 0.1,
                ease: "expo.out",
              },
              at0 + 1,
            );
        let unregister: (() => void) | undefined;
        if (introPending()) unregister = onIntro((tl) => entrance(tl, 0.5));
        else entrance(gsap.timeline({ delay: 0.1 }), 0);

        // Pulses along the line (run continuously; visible once it's connected).
        const pulses = q("[data-ch-pulse]") as HTMLElement[];
        const flow = { t: 0 };
        const placePulses = () =>
          pulses.forEach((p, i) => {
            const pt = at((flow.t + i / pulses.length) % 1);
            p.style.left = `${pt.x}%`;
            p.style.top = `${pt.y}%`;
          });
        placePulses();
        gsap.to(flow, {
          t: 1,
          duration: 3.2,
          ease: "none",
          repeat: -1,
          onUpdate: placePulses,
        });

        gsap.set("[data-ch-word]", { opacity: 0.12 });
        gsap
          .timeline({
            defaults: { ease: "none" },
            scrollTrigger: {
              trigger: section,
              start: "top top",
              end: "+=180%",
              pin: true,
              scrub: 0.6,
            },
          })
          .to(
            "[data-ch-title]",
            {
              y: () => -window.innerHeight * 0.27,
              scale: 0.42,
              duration: 0.3,
              ease: "power2.inOut",
            },
            0.02,
          )
          .to("[data-ch-img]", { scale: 1.2, duration: 1 }, 0)
          .to("[data-ch-shade]", { opacity: 0.78, duration: 0.4 }, 0)
          .to("[data-ch-meta]", { autoAlpha: 0, duration: 0.1 }, 0.02)
          .fromTo(
            "[data-ch-stage]",
            { autoAlpha: 0 },
            { autoAlpha: 1, duration: 0.08 },
            0.22,
          )
          .fromTo(
            "[data-ch-node='a']",
            { scale: 0 },
            { scale: 1, duration: 0.08, ease: "back.out(3)" },
            0.24,
          )
          .fromTo(
            "[data-ch-line]",
            { strokeDashoffset: 1 },
            { strokeDashoffset: 0, duration: 0.45 },
            0.28,
          )
          .to(
            "[data-ch-word]",
            {
              opacity: 1,
              duration: 0.05,
              stagger: 0.4 / q("[data-ch-word]").length,
            },
            0.3,
          )
          .fromTo(
            "[data-ch-node='b']",
            { scale: 0.4, autoAlpha: 0 },
            { scale: 1, autoAlpha: 1, duration: 0.1, ease: "back.out(2.5)" },
            0.72,
          )
          .fromTo(
            "[data-ch-pulses]",
            { autoAlpha: 0 },
            { autoAlpha: 1, duration: 0.06 },
            0.74,
          )
          .fromTo(
            "[data-ch-outro]",
            { autoAlpha: 0, y: 24 },
            { autoAlpha: 1, y: 0, duration: 0.12, ease: "power3.out" },
            0.8,
          )
          .to({}, { duration: 0.14 });

        return () => unregister?.();
      });

      mm.add(`${MQ.motion} and (hover: hover) and (pointer: fine)`, () => {
        const ease = { duration: 1.4, ease: "power3.out" };
        const ix = gsap.quickTo("[data-ch-drift]", "x", ease);
        const iy = gsap.quickTo("[data-ch-drift]", "y", ease);
        const onMove = (e: PointerEvent) => {
          if (section.getBoundingClientRect().bottom <= 0) return;
          ix(-(e.clientX / window.innerWidth - 0.5) * 2 * DRIFT);
          iy(-(e.clientY / window.innerHeight - 0.5) * 2 * DRIFT);
        };
        window.addEventListener("pointermove", onMove, { passive: true });
        return () => window.removeEventListener("pointermove", onMove);
      });
    },
    { scope: ref },
  );

  return (
    <section
      ref={ref}
      aria-labelledby="contact-title"
      className="surface-dark relative z-0 h-[calc(100svh+var(--arc-depth))] min-h-[calc(600px+var(--arc-depth))] overflow-hidden bg-carbon-deep"
    >
      <div data-ch-inner className="absolute inset-0">
        <div
          data-ch-drift
          className="absolute -inset-[4%] will-change-transform"
        >
          <div data-ch-img className="absolute inset-0">
            <Image
              src={banner}
              alt="Wind turbines along a snow-covered ridge under a heavy grey sky"
              fill
              preload
              sizes="100vw"
              placeholder="blur"
              className="photo object-cover object-[50%_40%]"
            />
          </div>
        </div>
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 [background:radial-gradient(110%_80%_at_50%_45%,transparent_35%,rgb(18_22_10/0.65)_100%),linear-gradient(to_bottom,rgb(18_22_10/0.7)_0%,rgb(18_22_10/0.15)_30%,rgb(18_22_10/0.3)_65%,rgb(18_22_10/0.8)_100%)]"
        />
        <div
          data-ch-shade
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-carbon-deep opacity-0"
        />

        <div className="absolute inset-x-0 top-0 h-svh min-h-[600px]">
          {/* Title */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-5 [perspective:900px]">
            <h1
              id="contact-title"
              data-ch-title
              className="font-condensed text-[clamp(4.2rem,16vw,17rem)] leading-[0.85] whitespace-nowrap text-paper uppercase will-change-transform"
            >
              {CONTACT.title.split("").map((c, i) => (
                <span
                  key={i}
                  data-ch-letter
                  className={cx("inline-block", i >= 8 && "text-fern")}
                  style={{ whiteSpace: "pre" }}
                >
                  {c}
                </span>
              ))}
            </h1>
          </div>

          {/* The line, the intro and the outro (revealed on scroll) */}
          <div
            data-ch-stage
            className="absolute inset-x-0 top-[36%] hidden px-5 md:px-10 motion-safe:[.js_&]:block motion-safe:[.js_&]:invisible motion-safe:[.js_&]:opacity-0"
          >
            <div className="relative mx-auto aspect-[5/1] w-full max-w-[1300px]">
              <svg
                viewBox="0 0 1000 200"
                preserveAspectRatio="none"
                aria-hidden
                className="absolute inset-0 size-full overflow-visible"
              >
                <path
                  d={LINE}
                  fill="none"
                  className="stroke-paper/15"
                  strokeWidth={1.5}
                  vectorEffect="non-scaling-stroke"
                />
                <path
                  data-ch-line
                  d={LINE}
                  fill="none"
                  pathLength={1}
                  strokeDasharray="1 1"
                  className="stroke-fern"
                  strokeWidth={2.5}
                  vectorEffect="non-scaling-stroke"
                  style={{
                    filter: "drop-shadow(0 0 6px rgb(135 169 107 / 0.7))",
                  }}
                />
              </svg>
              <div data-ch-pulses aria-hidden className="absolute inset-0">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    data-ch-pulse
                    className="absolute size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-paper shadow-[0_0_14px_4px_rgb(135_169_107/0.9)]"
                  />
                ))}
              </div>
              {/* your side */}
              <span
                data-ch-node="a"
                aria-hidden
                className="absolute size-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-fern bg-carbon-deep"
                style={{ left: `${A.x / 10}%`, top: `${A.y / 2}%` }}
              />
              {/* FernGrid's side */}
              <span
                data-ch-node="b"
                aria-hidden
                className="absolute w-[clamp(2.75rem,5vw,4.5rem)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-paper p-[0.6%] shadow-[0_0_0_6px_rgb(135_169_107/0.35),0_0_40px_6px_rgb(135_169_107/0.35)]"
                style={{ left: `${B.x / 10}%`, top: `${B.y / 2}%` }}
              >
                <Image
                  src={logoMark}
                  alt=""
                  sizes="72px"
                  className="h-auto w-full"
                />
              </span>
            </div>
            <p className="font-display mx-auto mt-[3svh] max-w-[34ch] text-center text-[clamp(1.25rem,2.3vw,2.3rem)] leading-[1.18] text-balance text-paper">
              {CONTACT.intro.split(" ").map((w, i) => (
                <Fragment key={i}>
                  {i > 0 && " "}
                  <span data-ch-word>{w}</span>
                </Fragment>
              ))}
            </p>
            <p
              data-ch-outro
              className="font-display mt-[2.5svh] text-center text-[clamp(1.1rem,1.8vw,1.8rem)] text-fern"
            >
              {CONTACT.outro}
            </p>
          </div>

          {/* Without motion: the intro sits under the title */}
          <div className="absolute inset-x-0 bottom-[14%] hidden px-5 text-center text-paper/85 motion-reduce:block">
            <p className="mx-auto max-w-[60ch] text-lg">{CONTACT.intro}</p>
            <p className="mt-2 text-lg">{CONTACT.outro}</p>
          </div>

          {/* Bottom bar */}
          <div className="absolute inset-x-0 bottom-0 flex items-center gap-4 px-5 pb-6 md:gap-8 md:px-10 md:pb-10">
            <p data-ch-meta className="text-label text-paper/70">
              {SITE.name}
            </p>
            <span aria-hidden className="h-px flex-1 bg-paper/30" />
            <a
              data-ch-meta
              href={`mailto:${SITE.email}`}
              className="text-label normal-case text-fern hover:text-paper"
            >
              {SITE.email}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
