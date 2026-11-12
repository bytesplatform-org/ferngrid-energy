"use client";

import Image from "next/image";
import { useRef } from "react";
import { ABOUT, ABOUT_FRAGMENTS, SITE } from "@/lib/content";
import { gsap, useGSAP, MQ } from "../motion/gsap";
import { introPending, onIntro } from "../motion/intro";
import banner from "@/public/images/home-banner.webp";

/** The founding sentence, coming into focus once the title has flown past. */
const FOUNDING = `${ABOUT.expertise.paragraphs[0].split(". ")[0]}.`;
const DRIFT = 26;
const TEXT_DRIFT = 10;

const TITLE_CHARS = ABOUT.title.split("");
const CENTER = (TITLE_CHARS.length - 1) / 2;
/** Small deterministic "random" per letter, so the fly-through is the same every visit. */
const jitter = (i: number, salt: number) => {
  const v = Math.sin((i + 1) * 12.9898 + salt * 78.233) * 43758.5453;
  return v - Math.floor(v); // 0–1
};

function Title() {
  return (
    <p
      aria-hidden
      className="font-condensed flex justify-center text-[clamp(4rem,19vw,20rem)] leading-[0.82] whitespace-nowrap text-paper uppercase [transform-style:preserve-3d]"
    >
      {TITLE_CHARS.map((c, i) => (
        // outer span: the scroll fly-through; inner span: the entrance
        <span
          key={i}
          data-ah-fly={i}
          className="inline-block will-change-transform [transform-style:preserve-3d]"
        >
          <span
            data-ah-char
            className="inline-block"
            style={{ whiteSpace: "pre" }}
          >
            {c}
          </span>
        </span>
      ))}
    </p>
  );
}

/**
 * About hero: the greyscale ridge of turbines with a huge "ABOUT US".
 * - Entrance (on the loader's reveal): the photo settles, letters rise in 3D.
 * - Scroll (pinned): the camera flies through the title — letters peel off from
 *   the centre outward and stream past the viewer in 3D, tumbling out of focus —
 *   while the photo pushes in and the founding sentence comes into focus.
 * - Pointer: the photo drifts against the cursor, the title with it.
 */
export function AboutHero() {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const section = ref.current!;
      const mm = gsap.matchMedia();

      mm.add(MQ.motion, () => {
        const entrance = (tl: gsap.core.Timeline, at: number) =>
          tl
            .fromTo(
              "[data-ah-img]",
              { scale: 1.3 },
              { scale: 1, duration: 1.9, ease: "expo.out" },
              at,
            )
            .fromTo(
              "[data-ah-char]",
              { yPercent: 105, rotateX: -70, autoAlpha: 0 },
              {
                yPercent: 0,
                rotateX: 0,
                autoAlpha: 1,
                duration: 1.2,
                stagger: 0.05,
                ease: "expo.out",
              },
              at + 0.35,
            )
            .fromTo(
              "[data-ah-rule]",
              { scaleX: 0 },
              { scaleX: 1, duration: 1.2, ease: "expo.inOut" },
              at + 0.7,
            )
            .fromTo(
              "[data-ah-meta]",
              { autoAlpha: 0, y: 18 },
              {
                autoAlpha: 1,
                y: 0,
                duration: 0.9,
                stagger: 0.1,
                ease: "expo.out",
              },
              at + 1,
            );
        let unregister: (() => void) | undefined;
        if (introPending()) unregister = onIntro((tl) => entrance(tl, 0.5));
        else entrance(gsap.timeline({ delay: 0.1 }), 0);

        // Pinned fly-through: letters peel off from the centre outward and stream
        // past the camera (towards the viewer, outward, tumbling, out of focus),
        // the photo pushes in, then the founding sentence comes into focus.
        gsap.set("[data-ah-line-word]", {
          autoAlpha: 0.08,
          filter: "blur(6px)",
        });
        const fly = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: "+=140%",
            pin: true,
            scrub: 0.6,
          },
        });
        TITLE_CHARS.forEach((_, i) => {
          const side = i - CENTER; // negative: left of centre
          const dist = Math.abs(side);
          fly.to(
            `[data-ah-fly='${i}']`,
            {
              z: 520 + jitter(i, 1) * 620,
              xPercent: side * (70 + jitter(i, 2) * 50),
              yPercent: (jitter(i, 3) - 0.5) * 160,
              rotateY: side * 14 + (jitter(i, 4) - 0.5) * 40,
              rotateX: (jitter(i, 5) - 0.5) * 70,
              rotateZ: (jitter(i, 6) - 0.5) * 30,
              filter: "blur(10px)",
              autoAlpha: 0,
              duration: 0.42,
              ease: "power2.in",
            },
            0.02 + (dist - 0.5) * 0.045,
          );
        });
        fly
          .to("[data-ah-img]", { scale: 1.35, duration: 1 }, 0)
          .to("[data-ah-shade]", { opacity: 0.9, duration: 0.8 }, 0)
          .to(
            "[data-ah-meta]",
            { autoAlpha: 0, y: -12, duration: 0.2, stagger: 0.05 },
            0.05,
          )
          .to("[data-ah-rule]", { scaleX: 0, duration: 0.3 }, 0.05)
          .to(
            "[data-ah-line-word]",
            {
              autoAlpha: 1,
              filter: "blur(0px)",
              duration: 0.2,
              stagger: 0.025,
              ease: "power2.out",
            },
            0.52,
          )
          .to({}, { duration: 0.18 });

        return () => unregister?.();
      });

      // Pointer drift (mouse/trackpad only).
      mm.add(`${MQ.motion} and (hover: hover) and (pointer: fine)`, () => {
        const ease = { duration: 1.4, ease: "power3.out" };
        const ix = gsap.quickTo("[data-ah-drift]", "x", ease);
        const iy = gsap.quickTo("[data-ah-drift]", "y", ease);
        const tx = gsap.quickTo("[data-ah-text]", "x", ease);
        const ty = gsap.quickTo("[data-ah-text]", "y", ease);
        const onMove = (e: PointerEvent) => {
          if (section.getBoundingClientRect().bottom <= 0) return;
          const nx = (e.clientX / window.innerWidth - 0.5) * 2;
          const ny = (e.clientY / window.innerHeight - 0.5) * 2;
          ix(-nx * DRIFT);
          iy(-ny * DRIFT);
          tx(nx * TEXT_DRIFT);
          ty(ny * TEXT_DRIFT);
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
      aria-labelledby="about-title"
      className="surface-dark relative z-0 h-[calc(100svh+var(--arc-depth))] min-h-[calc(560px+var(--arc-depth))] overflow-hidden bg-carbon-deep"
    >
      {/* Inner wrapper: the next section's parallax moves this, never the pinned section. */}
      <div data-ah-inner className="absolute inset-0">
        <div
          data-ah-drift
          className="absolute -inset-[4%] will-change-transform"
        >
          <div data-ah-img className="absolute inset-0">
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
          className="pointer-events-none absolute inset-0 [background:radial-gradient(110%_80%_at_50%_45%,transparent_40%,rgb(18_22_10/0.6)_100%),linear-gradient(to_bottom,rgb(18_22_10/0.7)_0%,rgb(18_22_10/0.1)_25%,rgb(18_22_10/0.1)_60%,rgb(18_22_10/0.75)_100%)]"
        />
        <div
          data-ah-shade
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-carbon-deep opacity-0"
        />

        <div className="absolute inset-x-0 top-0 h-svh min-h-[560px]">
          <h1 id="about-title" className="sr-only">
            {ABOUT.title}
          </h1>

          {/* The founding sentence, behind the title */}
          <p
            aria-hidden
            className="font-display absolute inset-x-0 top-1/2 mx-auto hidden max-w-[22ch] -translate-y-1/2 px-5 text-center motion-safe:[.js_&]:block text-[clamp(1.9rem,4.4vw,4.6rem)] leading-[1.05] text-balance text-paper"
          >
            {FOUNDING.split(" ").map((w, i) => (
              <span key={i}>
                {i > 0 && " "}
                <span
                  data-ah-line-word
                  className={`inline-block opacity-[0.08] blur-[6px] ${w.startsWith("2026") ? "text-fern" : ""}`}
                >
                  {w}
                </span>
              </span>
            ))}
          </p>

          {/* Title (the camera flies through it on scroll) */}
          <div
            data-ah-text
            className="absolute inset-0 flex items-center justify-center [perspective:900px]"
          >
            <Title />
          </div>

          {/* Bottom bar */}
          <div className="absolute inset-x-0 bottom-0 flex items-center gap-4 px-5 pb-6 md:gap-8 md:px-10 md:pb-10">
            <p data-ah-meta className="text-label text-paper/70">
              {SITE.name}
            </p>
            <span
              data-ah-rule
              aria-hidden
              className="h-px flex-1 origin-center bg-paper/30"
            />
            <p data-ah-meta className="text-label text-paper/70">
              {ABOUT_FRAGMENTS.founded}{" "}
              <span className="text-fern">{ABOUT_FRAGMENTS.year}</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
