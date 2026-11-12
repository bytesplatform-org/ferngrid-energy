"use client";

import { Fragment, useRef, useState } from "react";
import { FEST_PAGE, ROUTES, type FestPackage } from "@/lib/content";
import { ArcSurface } from "../motion/arc-surface";
import { gsap, ScrollTrigger, SplitText, useGSAP, MQ } from "../motion/gsap";
import { PillLink, cx } from "../ui/primitives";

const PIN_VH = 5;
const APPROACH_VH = 0.8;
/** Extra pinned distance after the story: the closing section slides over it. */
const COVER_VH = 1;
const { packages, packagesHeading, pricingCta } = FEST_PAGE;

function Check({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      aria-hidden
      className={cx("size-4 shrink-0", className)}
    >
      <path
        data-tick
        d="M3 8.5 6.5 12 13 4.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength={1}
        strokeDasharray="1 1"
        strokeDashoffset={0}
      />
    </svg>
  );
}

function Card({ pkg }: { pkg: FestPackage }) {
  return (
    <article
      className={cx(
        "h-full overflow-hidden rounded-[22px] bg-paper text-carbon shadow-[0_40px_80px_-40px_rgb(0_0_0/0.8)]",
        pkg.featured && "ring-2 ring-fern",
      )}
    >
      <h3
        className={cx(
          "px-5 py-4 text-center text-[clamp(1rem,1.3vw,1.25rem)] leading-snug font-medium text-balance md:px-6 md:py-5",
          pkg.featured ? "bg-carbon text-paper" : "bg-fern text-carbon",
        )}
      >
        {pkg.title}
      </h3>
      <ul className="space-y-2.5 px-5 py-5 text-[14px] md:space-y-3 md:px-7 md:py-6 md:text-[15px]">
        {pkg.items.map((it) => (
          <li key={it} data-pk-item className="flex items-center gap-3">
            <Check className="text-fern" />
            {it}
          </li>
        ))}
      </ul>
    </article>
  );
}

function StaticLayout() {
  return (
    <div className="mx-auto max-w-[1300px] px-5 pb-28 md:px-10">
      <h2
        id="packages-title"
        className="font-condensed text-condensed-xl text-center uppercase"
      >
        {packagesHeading}
      </h2>
      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {packages.map((p) => (
          <Card key={p.id} pkg={p} />
        ))}
      </div>
      <div className="mt-10 flex justify-center">
        <PillLink href={ROUTES.contact} tone="fern" size="lg" icon="up-right">
          {pricingCta}
        </PillLink>
      </div>
      <div className="mt-14 space-y-6 text-base leading-relaxed text-paper/80 md:text-lg">
        {packages.map((p) => (
          <p key={p.id}>
            <strong className="text-paper">{p.label}</strong> {p.body}
          </p>
        ))}
      </div>
    </div>
  );
}

/**
 * Our Packages — pinned, on dark.
 * 1. The three cards are dealt in from below; their checklists tick on.
 * 2. Basic → Standard → Premium: the matching card lifts forward while the
 *    others dim, and the description (verbatim) swaps in underneath.
 * 3. All three settle back; the pricing button arrives.
 * Pointer: cards tilt in 3D under the cursor. Small screens: a sliding carousel.
 */
export function PackagesStory() {
  const ref = useRef<HTMLElement>(null);
  const [story, setStory] = useState(false);

  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add(MQ.motion, () => {
      setStory(true);
      return () => setStory(false);
    });
  });

  useGSAP(
    () => {
      const section = ref.current;
      const stage = section?.querySelector<HTMLElement>("[data-stage]");
      if (!story || !section || !stage) return;
      const q = gsap.utils.selector(section);
      const wide = () => window.innerWidth >= 768;

      const cards = q("[data-pk-card]") as HTMLElement[];
      const track = q("[data-pk-track]")[0] as HTMLElement;
      const viewport = q("[data-pk-viewport]")[0] as HTMLElement;
      // Carousel offset (small screens): centre card k in the viewport.
      const centreOn = (k: number) => () => {
        if (wide()) return 0;
        const c = cards[k];
        return viewport.clientWidth / 2 - (c.offsetLeft + c.offsetWidth / 2);
      };

      const splits = q("[data-pk-body]").map((el) =>
        SplitText.create(el, { type: "lines", mask: "lines" }),
      );
      splits.forEach((s) =>
        gsap.set(s.masks, { paddingBottom: "0.2em", marginBottom: "-0.2em" }),
      );

      gsap.set(q("[data-head-word]"), { yPercent: 110 });
      gsap.set(cards, {
        yPercent: 130,
        rotate: (i) => [-9, 0, 9][i],
        rotateX: 40,
        autoAlpha: 0,
      });
      gsap.set(q("[data-tick]"), { strokeDashoffset: 1 });
      gsap.set(q("[data-pk-item]"), { autoAlpha: 0.35 });
      gsap.set(q("[data-pk-desc]"), { autoAlpha: 0 });
      splits.forEach((s) => gsap.set(s.lines, { yPercent: 110 }));
      gsap.set(q("[data-pk-label]"), { yPercent: 110 });
      gsap.set(q("[data-pk-cta]"), { autoAlpha: 0, y: 20 });

      const pinST = ScrollTrigger.create({
        trigger: stage,
        start: "top top",
        end: () => `+=${window.innerHeight * (PIN_VH + COVER_VH)}`,
        pin: true,
        invalidateOnRefresh: true,
      });

      const pin = gsap.timeline({ defaults: { ease: "none" } });
      // 1. deal the cards in, checklists tick on
      pin
        .to(
          cards,
          {
            yPercent: 0,
            rotate: 0,
            rotateX: 0,
            autoAlpha: 1,
            duration: 0.45,
            stagger: 0.1,
            ease: "power3.out",
          },
          0,
        )
        .to(
          q("[data-pk-item]"),
          { autoAlpha: 1, duration: 0.12, stagger: 0.025 },
          0.4,
        )
        .to(
          q("[data-tick]"),
          {
            strokeDashoffset: 0,
            duration: 0.12,
            stagger: 0.025,
            ease: "power2.out",
          },
          0.4,
        );

      // 2. walk through the packages
      const BEAT = 0.95;
      packages.forEach((_, k) => {
        const at = 1.0 + k * BEAT;
        cards.forEach((c, i) => {
          const on = i === k;
          pin.to(
            c,
            {
              y: on ? -26 : 0,
              scale: on ? 1.04 : 0.95,
              opacity: on ? 1 : 0.4,
              duration: 0.3,
              ease: "power3.inOut",
            },
            at,
          );
        });
        pin.to(
          track,
          { x: centreOn(k), duration: 0.3, ease: "power3.inOut" },
          at,
        );
        if (k > 0) {
          const prev = k - 1;
          pin
            .to(
              q(`[data-pk-desc='${prev}'] [data-pk-label]`),
              { yPercent: -110, duration: 0.2, ease: "power2.in" },
              at,
            )
            .to(
              splits[prev].lines,
              {
                yPercent: -110,
                duration: 0.2,
                stagger: 0.02,
                ease: "power2.in",
              },
              at,
            )
            .to(
              q(`[data-pk-desc='${prev}']`),
              { autoAlpha: 0, duration: 0.05 },
              at + 0.25,
            );
        }
        pin
          .to(
            q(`[data-pk-desc='${k}']`),
            { autoAlpha: 1, duration: 0.05 },
            at + 0.1,
          )
          .to(
            q(`[data-pk-desc='${k}'] [data-pk-label]`),
            { yPercent: 0, duration: 0.25, ease: "power3.out" },
            at + 0.12,
          )
          .to(
            splits[k].lines,
            { yPercent: 0, duration: 0.3, stagger: 0.035, ease: "power3.out" },
            at + 0.15,
          );
      });

      // 3. settle back, pricing button
      const end = 1.0 + packages.length * BEAT;
      pin
        .to(
          cards,
          { y: 0, scale: 1, opacity: 1, duration: 0.3, ease: "power3.inOut" },
          end,
        )
        .to(track, { x: centreOn(1), duration: 0.3, ease: "power3.inOut" }, end)
        .to(
          q("[data-pk-cta]"),
          { autoAlpha: 1, y: 0, duration: 0.25, ease: "power3.out" },
          end + 0.15,
        )
        .to({}, { duration: 0.5 });

      const approach = (pin.duration() * APPROACH_VH) / PIN_VH;
      gsap
        .timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: stage,
            start: "top 80%",
            end: () => `+=${window.innerHeight * (APPROACH_VH + PIN_VH)}`,
            scrub: 0.7,
            invalidateOnRefresh: true,
          },
        })
        .to(
          q("[data-head-word]"),
          {
            yPercent: 0,
            duration: approach * 0.5,
            stagger: approach * 0.08,
            ease: "power3.out",
          },
          approach * 0.2,
        )
        .fromTo(
          q("[data-head-rule]"),
          { scaleX: 0 },
          { scaleX: 1, duration: approach * 0.4 },
          approach * 0.45,
        )
        .add(pin, approach);

      ScrollTrigger.sort();
      ScrollTrigger.refresh();
      return () => {
        pinST.kill();
        splits.forEach((s) => s.revert());
      };
    },
    { scope: ref, dependencies: [story], revertOnUpdate: true },
  );

  // 3D tilt under the cursor (mouse/trackpad), on an inner layer so it never
  // fights the scroll timeline.
  useGSAP(
    () => {
      if (!story) return;
      const mm = gsap.matchMedia();
      mm.add(`${MQ.motion} and (hover: hover) and (pointer: fine)`, () => {
        const tilts = gsap.utils.toArray<HTMLElement>(
          "[data-pk-tilt]",
          ref.current,
        );
        const handlers = tilts.map((el) => {
          const rx = gsap.quickTo(el, "rotateX", {
            duration: 0.6,
            ease: "power3.out",
          });
          const ry = gsap.quickTo(el, "rotateY", {
            duration: 0.6,
            ease: "power3.out",
          });
          const move = (e: PointerEvent) => {
            const r = el.getBoundingClientRect();
            ry(((e.clientX - r.left) / r.width - 0.5) * 14);
            rx(-((e.clientY - r.top) / r.height - 0.5) * 12);
          };
          const leave = () => (rx(0), ry(0));
          el.addEventListener("pointermove", move);
          el.addEventListener("pointerleave", leave);
          return () => {
            el.removeEventListener("pointermove", move);
            el.removeEventListener("pointerleave", leave);
          };
        });
        return () => handlers.forEach((h) => h());
      });
    },
    { scope: ref, dependencies: [story] },
  );

  return (
    <section
      ref={ref}
      aria-labelledby="packages-title"
      className={cx("surface-dark arc-next relative z-10", !story && "px-0")}
      style={story ? { paddingTop: "var(--arc-depth)" } : undefined}
    >
      <ArcSurface tone="carbon-deep" parallax="[data-ms-inner]" />

      {!story ? (
        <StaticLayout />
      ) : (
        <div data-stage className="relative h-svh overflow-x-clip">
          <div
            data-pk-inner
            className="absolute inset-0 flex origin-[50%_30%] flex-col items-center justify-center gap-[2.5svh] px-5 pt-[clamp(4.5rem,10svh,6.5rem)] pb-6 will-change-transform md:px-10"
          >
            <div className="text-center">
              <h2
                id="packages-title"
                className="font-condensed text-[clamp(2.2rem,4.6vw,5rem)] leading-[0.9] text-paper uppercase"
              >
                {packagesHeading.split(" ").map((w, i) => (
                  <Fragment key={i}>
                    {i > 0 && " "}
                    <span className="inline-block overflow-hidden pb-[0.05em] align-bottom">
                      <span
                        data-head-word
                        className={cx(
                          "inline-block",
                          w === "Packages" && "text-fern",
                        )}
                      >
                        {w}
                      </span>
                    </span>
                  </Fragment>
                ))}
              </h2>
              <span
                data-head-rule
                aria-hidden
                className="mx-auto mt-3 block h-[2px] w-20 bg-fern md:mt-4"
              />
            </div>

            {/* Cards: a row on wider screens, a sliding carousel on small ones */}
            <div
              data-pk-viewport
              className="w-full max-w-[1200px] md:overflow-visible"
            >
              <div
                data-pk-track
                className="flex w-max gap-4 will-change-transform md:grid md:w-full md:grid-cols-3 md:gap-6"
              >
                {packages.map((p) => (
                  <div
                    key={p.id}
                    data-pk-card
                    className="w-[78vw] max-w-[22rem] [perspective:900px] md:w-auto md:max-w-none"
                  >
                    <div
                      data-pk-tilt
                      className="h-full will-change-transform [transform-style:preserve-3d]"
                    >
                      <Card pkg={p} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* The matching description */}
            <div className="grid w-full max-w-[1000px] text-[14px] leading-relaxed text-paper/80 md:text-[clamp(0.95rem,1.1vw,1.1rem)]">
              {packages.map((p, k) => (
                <div
                  key={p.id}
                  data-pk-desc={k}
                  className="col-start-1 row-start-1"
                >
                  <p className="overflow-hidden pb-[0.05em]">
                    <span
                      data-pk-label
                      className="font-condensed inline-block text-[clamp(1.2rem,1.8vw,1.7rem)] leading-none text-fern uppercase"
                    >
                      {p.label}
                    </span>
                  </p>
                  <p data-pk-body className="mt-2">
                    {p.body}
                  </p>
                </div>
              ))}
            </div>

            <div data-pk-cta>
              <PillLink
                href={ROUTES.contact}
                tone="fern"
                size="lg"
                icon="up-right"
              >
                {pricingCta}
              </PillLink>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
