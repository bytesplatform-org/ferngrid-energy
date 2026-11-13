"use client";

import Image from "next/image";
import { Fragment, useRef } from "react";
import { FAQ, SITE } from "@/lib/content";
import { gsap, useGSAP, MQ } from "../motion/gsap";
import { introPending, onIntro } from "../motion/intro";
import { cx } from "../ui/primitives";
import linesImg from "@/public/images/power-lines.webp";

/** Every question on the page, with its category (for the jump-to). */
const QUESTIONS = FAQ.categories.flatMap((c) =>
  c.items.map((it) => ({ id: it.id, category: c.id, q: it.q })),
);

/**
 * Where each question floats (left/top in %, depth 0 = far … 1 = near).
 * Two bands, above and below the title, so nothing ever sits on it.
 */
const SPOTS = [
  // band above the title
  { x: 3, y: 8, z: 0.45 },
  { x: 28, y: 5, z: 0.85 },
  { x: 53, y: 9, z: 0.3 },
  { x: 76, y: 7, z: 0.7 },
  { x: 14, y: 21, z: 0.2 },
  { x: 62, y: 22, z: 0.95 },
  // band below the title
  { x: 4, y: 67, z: 0.75 },
  { x: 70, y: 66, z: 0.4 },
  { x: 26, y: 80, z: 0.55 },
  { x: 52, y: 83, z: 0.9 },
];

/** Opens a question in the list below (FaqList listens for this). */
export const FAQ_OPEN_EVENT = "faq:open";

/**
 * FAQ hero: "Frequently Asked Questions" inside a field of the page's real
 * questions, floating at different depths (nearer = larger, sharper, moves more
 * with the cursor). Click a question to jump to its answer.
 * Scroll (pinned): the title blurs away and the questions fly past the camera.
 */
export function FaqHero() {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const section = ref.current!;
      const q = gsap.utils.selector(section);
      const mm = gsap.matchMedia();

      mm.add(MQ.motion, () => {
        const entrance = (tl: gsap.core.Timeline, at: number) =>
          tl
            .fromTo(
              "[data-fqh-img]",
              { scale: 1.25 },
              { scale: 1, duration: 1.9, ease: "expo.out" },
              at,
            )
            .fromTo(
              "[data-fqh-word]",
              { yPercent: 110 },
              { yPercent: 0, duration: 1.1, stagger: 0.08, ease: "expo.out" },
              at + 0.35,
            )
            .fromTo(
              "[data-fqh-chip]",
              { autoAlpha: 0, scale: 0.6, z: -200 },
              {
                autoAlpha: 1,
                scale: 1,
                z: 0,
                duration: 1.2,
                stagger: 0.06,
                ease: "expo.out",
              },
              at + 0.55,
            )
            .fromTo(
              "[data-fqh-meta]",
              { autoAlpha: 0, y: 16 },
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

        // Idle drift: each question bobs gently, nearer ones further.
        q("[data-fqh-float]").forEach((el, i) => {
          const z = SPOTS[i].z;
          gsap.to(el, {
            y: (i % 2 ? 1 : -1) * (8 + z * 14),
            x: (i % 3 === 0 ? 1 : -1) * (4 + z * 6),
            duration: 4.5 + (i % 4) * 0.8,
            ease: "sine.inOut",
            repeat: -1,
            yoyo: true,
          });
        });

        // Scroll: the title blurs away; the questions fly past the camera,
        // outward from the centre, nearest first.
        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: "+=130%",
            pin: true,
            scrub: 0.6,
          },
        });
        tl.to(
          "[data-fqh-title]",
          {
            yPercent: -30,
            autoAlpha: 0,
            filter: "blur(16px)",
            duration: 0.4,
            ease: "power2.in",
          },
          0.1,
        )
          .to("[data-fqh-meta]", { autoAlpha: 0, duration: 0.15 }, 0.05)
          .to("[data-fqh-img]", { scale: 1.25, duration: 1 }, 0);
        q("[data-fqh-fly]").forEach((el, i) => {
          const s = SPOTS[i];
          const dx = (s.x + 10 - 50) / 50;
          const dy = (s.y - 50) / 50;
          tl.to(
            el,
            {
              xPercent: dx * 160,
              yPercent: dy * 420,
              scale: 2.2 + s.z * 1.6,
              autoAlpha: 0,
              filter: "blur(8px)",
              duration: 0.55,
              ease: "power2.in",
            },
            0.05 + (1 - s.z) * 0.3,
          );
        });
        tl.to({}, { duration: 0.1 });

        return () => unregister?.();
      });

      // Cursor parallax: nearer questions move more.
      mm.add(`${MQ.motion} and (hover: hover) and (pointer: fine)`, () => {
        const ease = { duration: 1.3, ease: "power3.out" };
        const layers = (q("[data-fqh-par]") as HTMLElement[]).map((el, i) => ({
          z: SPOTS[i].z,
          x: gsap.quickTo(el, "x", ease),
          y: gsap.quickTo(el, "y", ease),
        }));
        const ix = gsap.quickTo("[data-fqh-drift]", "x", ease);
        const iy = gsap.quickTo("[data-fqh-drift]", "y", ease);
        const onMove = (e: PointerEvent) => {
          if (section.getBoundingClientRect().bottom <= 0) return;
          const nx = (e.clientX / window.innerWidth - 0.5) * 2;
          const ny = (e.clientY / window.innerHeight - 0.5) * 2;
          layers.forEach((l) => {
            l.x(nx * (6 + l.z * 34));
            l.y(ny * (4 + l.z * 24));
          });
          ix(-nx * 18);
          iy(-ny * 18);
        };
        window.addEventListener("pointermove", onMove, { passive: true });
        return () => window.removeEventListener("pointermove", onMove);
      });
    },
    { scope: ref },
  );

  const open = (id: string, category: string) =>
    window.dispatchEvent(
      new CustomEvent(FAQ_OPEN_EVENT, { detail: { id, category } }),
    );

  return (
    <section
      ref={ref}
      aria-labelledby="faq-title"
      className="surface-dark relative z-0 h-[calc(100svh+var(--arc-depth))] min-h-[calc(600px+var(--arc-depth))] overflow-hidden bg-carbon-deep"
    >
      <div data-fqh-inner className="absolute inset-0">
        <div
          data-fqh-drift
          className="absolute -inset-[4%] will-change-transform"
        >
          <div data-fqh-img className="absolute inset-0 opacity-30">
            <Image
              src={linesImg}
              alt=""
              fill
              preload
              sizes="100vw"
              placeholder="blur"
              className="photo object-cover object-[50%_60%]"
            />
          </div>
        </div>
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 [background:radial-gradient(70%_60%_at_50%_50%,rgb(135_169_107/0.12),transparent_70%),linear-gradient(to_bottom,rgb(18_22_10/0.75),rgb(18_22_10/0.35)_40%,rgb(18_22_10/0.85))]"
        />

        <div className="absolute inset-x-0 top-0 h-svh min-h-[600px] [perspective:1000px]">
          {/* Floating questions (hidden from small screens' crowded space below md) */}
          <div className="absolute inset-0 hidden md:block">
            {QUESTIONS.map((item, i) => {
              const s = SPOTS[i % SPOTS.length];
              return (
                <div
                  key={item.id}
                  data-fqh-par
                  className="absolute will-change-transform"
                  style={{
                    left: `${s.x}%`,
                    top: `${s.y}%`,
                    zIndex: Math.round(s.z * 10),
                  }}
                >
                  <div data-fqh-float className="will-change-transform">
                    <div data-fqh-fly className="will-change-transform">
                      <button
                        type="button"
                        data-fqh-chip
                        onClick={() => open(item.id, item.category)}
                        className={cx(
                          "max-w-[17rem] origin-left rounded-[14px] border px-4 py-2.5 text-left leading-snug text-balance backdrop-blur-sm transition-[background-color,border-color,color] duration-300",
                          "border-paper/15 bg-paper/[0.06] text-paper hover:border-fern hover:bg-fern hover:text-carbon",
                          "motion-safe:[.js_&]:invisible motion-safe:[.js_&]:opacity-0",
                        )}
                        style={{
                          fontSize: `${0.72 + s.z * 0.28}rem`,
                          filter: `blur(${((1 - s.z) * 1.6).toFixed(2)}px)`,
                        }}
                      >
                        <span style={{ opacity: 0.45 + s.z * 0.55 }}>
                          {item.q}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Title */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-5">
            <h1
              id="faq-title"
              data-fqh-title
              className="font-condensed max-w-[12ch] text-center text-[clamp(3.4rem,10.5vw,11rem)] leading-[0.86] text-paper uppercase md:max-w-none"
            >
              {FAQ.title.split(" ").map((w, i) => (
                <Fragment key={w}>
                  {i > 0 && " "}
                  <span
                    className={cx(
                      "inline-block overflow-hidden pb-[0.04em] align-bottom",
                      i === 2 && "md:block",
                    )}
                  >
                    <span
                      data-fqh-word
                      className={cx(
                        "inline-block",
                        w === "Questions" && "text-fern",
                      )}
                    >
                      {w}
                    </span>
                  </span>
                </Fragment>
              ))}
            </h1>
          </div>

          {/* Bottom bar */}
          <div className="absolute inset-x-0 bottom-0 flex items-center gap-4 px-5 pb-6 md:gap-8 md:px-10 md:pb-10">
            <p data-fqh-meta className="text-label text-paper/70">
              {SITE.name}
            </p>
            <span aria-hidden className="h-px flex-1 bg-paper/30" />
            <p data-fqh-meta className="text-label hidden text-fern md:block">
              {FAQ.categories.map((c) => c.label).join(" · ")}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
