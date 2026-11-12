"use client";

import Image from "next/image";
import { Fragment, useRef, useState } from "react";
import { ABOUT, ABOUT_FRAGMENTS } from "@/lib/content";
import { ArcSurface } from "../motion/arc-surface";
import { gsap, ScrollTrigger, SplitText, useGSAP, MQ } from "../motion/gsap";
import { cx } from "../ui/primitives";
import towerImg from "@/public/images/powerlines.webp";

/** Scroll distance (viewport heights) the story stays pinned for. */
const PIN_VH = 3.8;
/** Scroll distance (viewport heights) of the approach, from "top 80%" to the pin. */
const APPROACH_VH = 0.8;

const { heading, before, emphasis, after } = ABOUT.trust;

function Body({ emph }: { emph?: boolean }) {
  return (
    <>
      {before}
      <span
        data-emph={emph || undefined}
        className={cx(
          emph
            ? "bg-[linear-gradient(rgb(135_169_107/0.55),rgb(135_169_107/0.55))] bg-[length:0%_0.42em] bg-[position:0_92%] bg-no-repeat text-paper"
            : "underline decoration-fern decoration-2 underline-offset-4",
        )}
      >
        {emphasis}
      </span>
      {after}
    </>
  );
}

/**
 * "Engineering You Can Trust" — pinned, over a transmission tower seen from below.
 * 1. The photo opens through an expanding circle; the heading fills the screen.
 * 2. "Written." "Developed." "Tested." stamp in, one after another.
 * 3. The paragraph (verbatim) rises line by line, and "no assistance from Large
 *    Language Models (LLMs)" gets a fern highlighter sweep.
 * Static layout without JS / under reduced motion.
 */
export function TrustStory() {
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

      const split = SplitText.create(q("[data-body]")[0], {
        type: "lines",
        mask: "lines",
      });
      gsap.set(split.masks, {
        paddingBottom: "0.22em",
        marginBottom: "-0.22em",
        paddingTop: "0.05em",
        marginTop: "-0.05em",
      });

      gsap.set(q("[data-big-word]"), { yPercent: 110 });
      gsap.set(q("[data-small-word]"), { yPercent: 110 });
      gsap.set(split.lines, { yPercent: 110 });
      gsap.set(q("[data-verb]"), {
        autoAlpha: 0,
        scale: 1.35,
        filter: "blur(16px)",
      });
      gsap.set(q("[data-verb-rule]"), { scaleX: 0 });

      const pinST = ScrollTrigger.create({
        trigger: stage,
        start: "top top",
        end: () => `+=${window.innerHeight * PIN_VH}`,
        pin: true,
        invalidateOnRefresh: true,
      });

      const pin = gsap.timeline({ defaults: { ease: "none" } });
      pin
        // 1. the photo opens fully; the heading holds the screen
        .fromTo(
          q("[data-media]"),
          { clipPath: "circle(26% at 50% 50%)" },
          {
            clipPath: "circle(75% at 50% 50%)",
            duration: 0.6,
            ease: "power2.inOut",
            immediateRender: false,
          },
          0,
        )
        .fromTo(
          q("[data-media-img]"),
          { scale: 1.25 },
          { scale: 1.05, duration: 1.6 },
          0,
        )
        .fromTo(
          q("[data-shade]"),
          { opacity: 0.35 },
          { opacity: 0.75, duration: 0.8 },
          0.2,
        )
        .to(
          q("[data-big]"),
          {
            yPercent: -20,
            autoAlpha: 0,
            filter: "blur(14px)",
            duration: 0.3,
            ease: "power2.in",
          },
          0.75,
        )
        // 2. written. developed. tested.
        .to(
          q("[data-verb]"),
          {
            autoAlpha: 1,
            scale: 1,
            filter: "blur(0px)",
            duration: 0.22,
            stagger: 0.28,
            ease: "power3.out",
          },
          1.0,
        )
        .to(
          q("[data-verb-rule]"),
          { scaleX: 1, duration: 0.2, stagger: 0.28, ease: "power2.out" },
          1.12,
        )
        .to(
          q("[data-verbs]"),
          { yPercent: -18, autoAlpha: 0, duration: 0.3, ease: "power2.in" },
          2.0,
        )
        // 3. the paragraph, then the highlighter
        .to(
          q("[data-small-word]"),
          { yPercent: 0, duration: 0.25, stagger: 0.06, ease: "power3.out" },
          2.2,
        )
        .fromTo(
          q("[data-small-rule]"),
          { scaleX: 0 },
          { scaleX: 1, duration: 0.25, ease: "power2.out" },
          2.3,
        )
        .to(
          split.lines,
          { yPercent: 0, duration: 0.3, stagger: 0.05, ease: "power3.out" },
          2.35,
        )
        .to(
          q("[data-emph]"),
          {
            backgroundSize: "100% 0.42em",
            duration: 0.35,
            ease: "power2.inOut",
          },
          2.95,
        )
        .to({}, { duration: 0.5 }); // hold

      // Approach: the photo starts as a circle; the heading rises as the section arrives.
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
        .fromTo(
          q("[data-media]"),
          { clipPath: "circle(12% at 50% 50%)" },
          {
            clipPath: "circle(26% at 50% 50%)",
            duration: approach * 0.9,
            ease: "power2.out",
            immediateRender: true,
          },
          0,
        )
        .to(
          q("[data-big-word]"),
          {
            yPercent: 0,
            duration: approach * 0.5,
            stagger: approach * 0.08,
            ease: "power3.out",
          },
          approach * 0.3,
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
      aria-labelledby="trust-title"
      className={cx(
        "surface-dark arc-next relative z-10",
        !story && "px-5 pb-28 md:px-10",
      )}
      style={story ? { paddingTop: "var(--arc-depth)" } : undefined}
    >
      {/* Expertise above slides away at ~60% speed as this rises over it */}
      <ArcSurface tone="carbon-deep" parallax="[data-exp-inner]" />

      {!story ? (
        <div className="mx-auto grid max-w-[1400px] gap-10 lg:grid-cols-12">
          <div className="relative aspect-[4/5] overflow-hidden rounded-[18px] lg:col-span-5">
            <Image
              src={towerImg}
              alt="Looking up at a transmission tower with power lines converging overhead"
              fill
              sizes="(min-width: 1024px) 40vw, 100vw"
              className="photo object-cover"
            />
          </div>
          <div className="lg:col-span-6 lg:col-start-7 lg:self-center">
            <h2
              id="trust-title"
              className="font-condensed text-condensed-xl uppercase"
            >
              {heading}
            </h2>
            <p className="mt-6 text-base leading-relaxed text-paper/80 md:text-lg">
              <Body />
            </p>
          </div>
        </div>
      ) : (
        <div
          data-stage
          className="relative h-svh overflow-hidden bg-carbon-deep"
        >
          {/* Photo, opened by a growing circle */}
          <div data-media className="absolute inset-0 overflow-hidden">
            <div data-media-img className="absolute inset-0">
              <Image
                src={towerImg}
                alt="Looking up at a transmission tower with power lines converging overhead"
                fill
                sizes="100vw"
                placeholder="blur"
                className="photo object-cover object-[50%_35%]"
              />
            </div>
            <div
              data-shade
              aria-hidden
              className="absolute inset-0 bg-carbon-deep"
            />
            <div
              aria-hidden
              className="absolute inset-0 [background:linear-gradient(to_right,rgb(18_22_10/0.7),transparent_60%),linear-gradient(to_top,rgb(18_22_10/0.6),transparent_45%)]"
            />
          </div>

          {/* 1. Heading, huge and centred */}
          <div
            data-big
            aria-hidden
            className="absolute inset-0 flex items-center justify-center px-5 text-center"
          >
            <p className="font-condensed text-[clamp(3.2rem,11vw,12rem)] leading-[0.86] text-paper uppercase">
              {heading.split(" ").map((w, i) => (
                <Fragment key={i}>
                  {i > 0 && " "}
                  <span className="inline-block overflow-hidden pb-[0.04em] align-bottom">
                    <span
                      data-big-word
                      className={cx(
                        "inline-block",
                        w === "Trust" && "text-fern",
                      )}
                    >
                      {w}
                    </span>
                  </span>
                </Fragment>
              ))}
            </p>
          </div>

          {/* 2. Written. Developed. Tested. */}
          <div
            data-verbs
            aria-hidden
            className="absolute inset-0 flex flex-col items-center justify-center gap-[2svh] px-5 md:flex-row md:gap-[2.4vw]"
          >
            {ABOUT_FRAGMENTS.verbs.map((v) => (
              <span
                key={v}
                data-verb
                className="font-condensed relative text-[clamp(3rem,5.6vw,7rem)] leading-none text-paper uppercase"
              >
                {v}
                <span
                  data-verb-rule
                  className="absolute inset-x-0 -bottom-[0.08em] block h-[0.06em] origin-left bg-fern"
                />
              </span>
            ))}
          </div>

          {/* 3. The paragraph */}
          <div className="absolute inset-0 flex flex-col justify-center px-5 pt-16 md:px-10 lg:w-[62%]">
            <h2
              id="trust-title"
              className="font-condensed text-[clamp(2.2rem,4.6vw,5rem)] leading-[0.9] text-paper uppercase"
            >
              {heading.split(" ").map((w, i) => (
                <Fragment key={i}>
                  {i > 0 && " "}
                  <span className="inline-block overflow-hidden pb-[0.05em] align-bottom">
                    <span
                      data-small-word
                      className={cx(
                        "inline-block",
                        w === "Trust" && "text-fern",
                      )}
                    >
                      {w}
                    </span>
                  </span>
                </Fragment>
              ))}
            </h2>
            <span
              data-small-rule
              aria-hidden
              className="mt-4 block h-[2px] w-20 origin-left bg-fern md:mt-6"
            />
            <p
              data-body
              className="mt-6 max-w-[58ch] text-[15px] leading-relaxed text-paper/85 md:mt-8 md:text-[clamp(1rem,1.3vw,1.3rem)]"
            >
              <Body emph />
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
