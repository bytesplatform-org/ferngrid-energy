"use client";

import Image from "next/image";
import { useRef } from "react";
import { CONTACT, SITE } from "@/lib/content";
import { gsap, useGSAP, MQ } from "../motion/gsap";
import { introPending, onIntro } from "../motion/intro";
import banner from "@/public/images/home-banner.webp";

const DRIFT = 22;

/**
 * Contact hero: "CONTACT US" over the turbine ridge. As it scrolls away the
 * photo eases in and the title lifts and fades. (The pinned line scene that
 * carried the intro was removed at the client's request; the intro now sits by
 * the form.)
 */
export function ContactHero() {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const section = ref.current!;
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

        // Scroll away (not pinned): the photo eases in, the title lifts and fades.
        gsap
          .timeline({
            defaults: { ease: "none" },
            scrollTrigger: { trigger: section, start: "top top", end: "bottom top", scrub: 0.6 },
          })
          .to("[data-ch-img]", { scale: 1.15, duration: 1 }, 0)
          .to("[data-ch-shade]", { opacity: 0.6, duration: 1 }, 0)
          .to("[data-ch-title]", { yPercent: -30, autoAlpha: 0, duration: 0.8 }, 0)
          .to("[data-ch-meta]", { autoAlpha: 0, duration: 0.3 }, 0);

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
                  className="inline-block"
                  style={{ whiteSpace: "pre" }}
                >
                  {c}
                </span>
              ))}
            </h1>
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
