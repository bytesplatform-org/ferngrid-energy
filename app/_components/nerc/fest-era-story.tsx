"use client";

import Image from "next/image";
import { Fragment, useRef, useState } from "react";
import { NERC, NERC_FRAGMENTS, ROUTES } from "@/lib/content";
import { ArcSurface } from "../motion/arc-surface";
import { gsap, ScrollTrigger, SplitText, useGSAP, MQ } from "../motion/gsap";
import { PillLink, cx } from "../ui/primitives";
import logoMark from "@/public/images/logo-mark.png";
import solarImg from "@/public/images/fest-3.webp";
import fallsImg from "@/public/images/fest-4.webp";

const PIN_VH = 4.6;
const APPROACH_VH = 0.8;
/** Extra pinned distance after the story: the closing section slides over it. */
const COVER_VH = 1;
const { heading, body } = NERC.festAndEra;
const SENTENCES = body.split(/(?<=\.) /);
const FACTORS = NERC_FRAGMENTS.festFactors;
const ANGLES = FACTORS.map((_, i) => (360 / FACTORS.length) * i);
/** Hourly dispatch bars (illustrative heights, no values). */
const DISPATCH = Array.from(
  { length: 24 },
  (_, i) =>
    0.35 + 0.45 * Math.abs(Math.sin(i * 0.55 + 0.6)) + (i % 7 === 3 ? 0.15 : 0),
);

const PHOTOS = [
  {
    src: solarImg,
    alt: "Rows of solar panels in deep snow with a wind turbine behind",
    speed: 0.12,
    position: "50% 50%",
    filter: undefined as string | undefined,
  },
  // In greyscale the falls' mist blows out to white, so frame the edge of the
  // falls and the water, with a touch more contrast so the mist reads as mist.
  {
    src: fallsImg,
    alt: "Niagara Falls in winter, mist rising over the falls",
    speed: -0.12,
    position: "12% 78%",
    filter: "grayscale(1) contrast(1.3) brightness(0.84)",
  },
];

function StaticLayout() {
  return (
    <div className="mx-auto max-w-[1100px] px-5 pb-28 md:px-10">
      <h2
        id="festera-title"
        className="font-condensed text-[clamp(2rem,4.4vw,4.4rem)] leading-[0.95] uppercase"
      >
        {heading}
      </h2>
      <p className="mt-8 text-base leading-relaxed text-muted md:text-lg">
        {body}
      </p>
      <PillLink href={ROUTES.fest} tone="carbon" size="lg" className="mt-8">
        Explore FEST
      </PillLink>
    </div>
  );
}

/**
 * FernGrid Energy and Energy Reliability Assessments.
 * - Two photos open (clip reveal) at different parallax speeds as they pass.
 * - Pinned: FEST's five factors orbit a FEST core, then are pulled into it one
 *   by one; the core pulses and sends out hourly dispatch bars, which are then
 *   evaluated — "forecast potential Energy Emergencies". The paragraph's
 *   sentences light up in step; the Explore FEST button arrives last.
 */
export function FestEraStory() {
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

      // Photos: clip reveal + counter parallax.
      q("[data-photo]").forEach((ph, i) => {
        gsap.fromTo(
          ph,
          { clipPath: "inset(18% 10% 18% 10% round 28px)" },
          {
            clipPath: "inset(0% 0% 0% 0% round 20px)",
            ease: "none",
            scrollTrigger: {
              trigger: ph,
              start: "top 95%",
              end: "top 35%",
              scrub: 0.6,
            },
          },
        );
        gsap.fromTo(
          ph.querySelector("[data-photo-img]"),
          { yPercent: -PHOTOS[i].speed * 100, scale: 1.2 },
          {
            yPercent: PHOTOS[i].speed * 100,
            scale: 1.1,
            ease: "none",
            scrollTrigger: {
              trigger: ph,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          },
        );
      });

      const split = SplitText.create(q("[data-para]")[0], {
        type: "lines",
        mask: "lines",
      });
      gsap.set(split.masks, {
        paddingBottom: "0.2em",
        marginBottom: "-0.2em",
        paddingTop: "0.05em",
        marginTop: "-0.05em",
      });

      gsap.set(q("[data-head-word]"), { yPercent: 110 });
      gsap.set(split.lines, { yPercent: 110 });
      gsap.set(q("[data-sentence]"), { opacity: 0.32 });
      gsap.set(q("[data-chip]"), { scale: 0, autoAlpha: 0 });
      gsap.set(q("[data-core]"), { scale: 0.6, autoAlpha: 0 });
      gsap.set(q("[data-ring]"), { scale: 0.6, autoAlpha: 0 });
      gsap.set(q("[data-bar]"), { scaleY: 0 });
      gsap.set(q("[data-out]"), { autoAlpha: 0, y: 14 });
      gsap.set(q("[data-cta]"), { autoAlpha: 0, y: 16 });

      // Orbit: the ring turns; chips stay upright.
      const orbit = q("[data-orbit]")[0] as HTMLElement;
      const chipEls = q("[data-chip]") as HTMLElement[];
      const spin = { r: 0 };
      const renderSpin = () => {
        orbit.style.transform = `rotate(${spin.r}deg)`;
        chipEls.forEach(
          (c, i) => (c.style.rotate = `${-(ANGLES[i] + spin.r)}deg`),
        );
      };
      renderSpin();

      const pinST = ScrollTrigger.create({
        trigger: stage,
        start: "top top",
        end: () => `+=${window.innerHeight * (PIN_VH + COVER_VH)}`,
        pin: true,
        invalidateOnRefresh: true,
      });

      const s = (i: number) => q(`[data-sentence='${i}']`);
      const pin = gsap.timeline({ defaults: { ease: "none" } });
      pin
        // factors orbit the core (sentence 2: what FEST accounts for)
        .to(
          q("[data-core]"),
          { scale: 1, autoAlpha: 1, duration: 0.3, ease: "back.out(2)" },
          0,
        )
        .to(q("[data-ring]"), { scale: 1, autoAlpha: 1, duration: 0.3 }, 0.05)
        .to(
          q("[data-chip]"),
          {
            scale: 1,
            autoAlpha: 1,
            duration: 0.25,
            stagger: 0.08,
            ease: "back.out(2)",
          },
          0.15,
        )
        .to(s(1), { opacity: 1, duration: 0.2 }, 0.15)
        .fromTo(
          spin,
          { r: 0 },
          {
            r: 150,
            duration: 1.6,
            onUpdate: renderSpin,
            immediateRender: false,
          },
          0,
        )
        // …and are pulled in, one by one
        .to(
          q("[data-arm-holder]"),
          { top: "50%", duration: 0.3, stagger: 0.12, ease: "power3.in" },
          1.05,
        )
        .to(
          q("[data-chip]"),
          {
            scale: 0,
            autoAlpha: 0,
            duration: 0.15,
            stagger: 0.12,
            ease: "power2.in",
          },
          1.2,
        )
        .to(q("[data-ring]"), { scale: 0.5, autoAlpha: 0, duration: 0.3 }, 1.6)
        .to(
          q("[data-core]"),
          { scale: 1.25, duration: 0.15, ease: "power2.out" },
          1.75,
        )
        .to(
          q("[data-core]"),
          { scale: 1, duration: 0.25, ease: "elastic.out(1, 0.5)" },
          1.9,
        )
        // dispatches for each hour (sentence 1)
        .to(s(1), { opacity: 0.32, duration: 0.2 }, 1.9)
        .to(s(0), { opacity: 1, duration: 0.2 }, 1.95)
        .to(
          q("[data-core-wrap]"),
          { yPercent: -36, duration: 0.4, ease: "power3.inOut" },
          1.95,
        )
        .to(q("[data-out='0']"), { autoAlpha: 1, y: 0, duration: 0.2 }, 2.15)
        .to(
          q("[data-bar]"),
          { scaleY: 1, duration: 0.25, stagger: 0.025, ease: "power3.out" },
          2.2,
        )
        // evaluated to forecast potential Energy Emergencies (sentence 3)
        .to(s(0), { opacity: 0.32, duration: 0.2 }, 3.0)
        .to(s(2), { opacity: 1, duration: 0.2 }, 3.05)
        .to(
          q("[data-scanbar]"),
          { left: "100%", duration: 0.6, ease: "power1.inOut" },
          3.05,
        )
        .to(q("[data-out='1']"), { autoAlpha: 1, y: 0, duration: 0.25 }, 3.5)
        .to(q("[data-cta]"), { autoAlpha: 1, y: 0, duration: 0.25 }, 3.65)
        .to({}, { duration: 0.6 });

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
            stagger: approach * 0.05,
            ease: "power3.out",
          },
          approach * 0.1,
        )
        .fromTo(
          q("[data-head-rule]"),
          { scaleX: 0 },
          { scaleX: 1, duration: approach * 0.4 },
          approach * 0.35,
        )
        .to(
          split.lines,
          {
            yPercent: 0,
            duration: approach * 0.4,
            stagger: approach * 0.05,
            ease: "power3.out",
          },
          approach * 0.45,
        )
        .add(pin, approach);

      ScrollTrigger.sort();
      ScrollTrigger.refresh();
      return () => {
        pinST.kill();
        split.revert();
      };
    },
    { scope: ref, dependencies: [story], revertOnUpdate: true },
  );

  return (
    <section
      ref={ref}
      aria-labelledby="festera-title"
      className={cx(
        "surface-light arc-next relative z-10",
        !story && "arc-prev",
      )}
      style={
        story ? { paddingTop: "calc(var(--arc-depth) + 2rem)" } : undefined
      }
    >
      <ArcSurface tone="paper" parallax="[data-hr-inner]" />

      {/* Two photos, between the sections (as on the live page) */}
      <div className="mx-auto grid max-w-[1600px] gap-4 px-5 pb-14 md:grid-cols-2 md:gap-6 md:px-10 md:pb-20">
        {PHOTOS.map((p) => (
          <div
            key={p.alt}
            data-photo
            className="relative aspect-[4/3] overflow-hidden rounded-[20px] md:aspect-[5/4]"
          >
            <div data-photo-img className="absolute -inset-y-[14%] inset-x-0">
              <Image
                src={p.src}
                alt={p.alt}
                fill
                sizes="(min-width: 768px) 50vw, 100vw"
                placeholder="blur"
                className="photo object-cover"
                style={{ objectPosition: p.position, filter: p.filter }}
              />
            </div>
          </div>
        ))}
      </div>

      {!story ? (
        <StaticLayout />
      ) : (
        <div data-stage className="relative h-svh overflow-hidden">
          {/* Inner wrapper: the closing section pushes this back as it slides over. */}
          <div
            data-fe-inner
            className="absolute inset-0 flex origin-[50%_30%] flex-col gap-4 px-5 pt-[clamp(5rem,11svh,7.5rem)] pb-6 will-change-transform md:px-10 lg:grid lg:grid-cols-12 lg:items-center lg:gap-10 lg:pb-10"
          >
            {/* Copy (left) */}
            <div className="flex flex-col justify-center lg:col-span-5">
              <h2
                id="festera-title"
                className="font-condensed text-[clamp(1.9rem,3.8vw,4.2rem)] leading-[0.92] uppercase"
              >
                {heading.split(" ").map((w, i) => (
                  <Fragment key={i}>
                    {i > 0 && " "}
                    <span className="inline-block overflow-hidden pb-[0.05em] align-bottom">
                      <span
                        data-head-word
                        className={cx(
                          "inline-block",
                          w === "FernGrid" && "text-fern",
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
                className="mt-4 block h-[2px] w-20 origin-left bg-fern md:mt-6"
              />
              <p
                data-para
                className="mt-5 text-[14px] leading-relaxed text-carbon/80 md:mt-7 md:text-[clamp(0.95rem,1.15vw,1.15rem)]"
              >
                {SENTENCES.map((t, i) => (
                  <Fragment key={i}>
                    {i > 0 && " "}
                    <span data-sentence={i}>{t}</span>
                  </Fragment>
                ))}
              </p>
              <div data-cta className="mt-6 md:mt-8">
                <PillLink
                  href={ROUTES.fest}
                  tone="carbon"
                  size="lg"
                  icon="right"
                >
                  Explore FEST
                </PillLink>
              </div>
            </div>

            {/* Stage (right) */}
            <div className="relative mx-auto aspect-square w-full max-w-[min(100%,30svh)] shrink-0 lg:col-span-6 lg:col-start-7 lg:max-w-[min(100%,72svh)]">
              <div data-core-wrap className="absolute inset-0">
                {/* orbit ring + factor chips */}
                <div
                  data-ring
                  aria-hidden
                  className="absolute inset-[8%] rounded-full border border-dashed border-carbon/25"
                />
                <div data-orbit className="absolute inset-0">
                  {FACTORS.map((f, i) => (
                    <div
                      key={f}
                      className="absolute inset-0"
                      style={{ transform: `rotate(${ANGLES[i]}deg)` }}
                    >
                      <div
                        data-arm-holder
                        className="absolute top-[8%] left-1/2 -translate-x-1/2 -translate-y-1/2"
                      >
                        <span
                          data-chip
                          className="font-display block w-max max-w-[11rem] rounded-[14px] border border-carbon/15 bg-white px-3.5 py-2 text-center text-[clamp(0.78rem,1vw,0.95rem)] leading-tight text-balance text-carbon shadow-[0_12px_30px_-16px_rgb(29_34_15/0.5)] md:max-w-[13rem]"
                        >
                          {f}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                {/* FEST core */}
                <div
                  data-core
                  className="absolute top-1/2 left-1/2 flex w-[26%] -translate-x-1/2 -translate-y-1/2 flex-col items-center rounded-full bg-carbon p-[5%] text-paper shadow-[0_0_0_10px_rgb(135_169_107/0.25),0_30px_60px_-24px_rgb(29_34_15/0.6)]"
                >
                  <Image
                    src={logoMark}
                    alt=""
                    sizes="80px"
                    className="h-auto w-[55%] invert"
                  />
                  <span className="font-condensed mt-1 text-[clamp(0.9rem,1.6vw,1.5rem)] leading-none tracking-[0.12em]">
                    FEST
                  </span>
                </div>
              </div>

              {/* Outputs: hourly dispatches, then the forecast */}
              <div className="absolute inset-x-0 bottom-[4%]">
                <p
                  data-out="0"
                  className="text-label mb-3 text-center text-muted"
                >
                  {NERC_FRAGMENTS.dispatches}
                </p>
                <div className="relative flex h-[clamp(3.5rem,11svh,8rem)] items-end gap-[1.2%] overflow-hidden">
                  {DISPATCH.map((h, i) => (
                    <span
                      key={i}
                      data-bar
                      className="block flex-1 origin-bottom rounded-t-[3px] bg-fern"
                      style={{ height: `${h * 100}%` }}
                    />
                  ))}
                  <span
                    data-scanbar
                    aria-hidden
                    className="absolute top-0 bottom-0 left-0 w-[3px] -translate-x-full bg-carbon/70"
                  />
                </div>
                <p
                  data-out="1"
                  className="font-display mt-4 flex items-center justify-center gap-2 text-center text-[clamp(1rem,1.6vw,1.5rem)]"
                >
                  {NERC_FRAGMENTS.emergencies}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
