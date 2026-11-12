"use client";

import Image from "next/image";
import { Fragment, useRef, useState } from "react";
import { FRAGMENTS, HOME, ROUTES } from "@/lib/content";
import { gsap, ScrollTrigger, useGSAP, MQ } from "./motion/gsap";
import { MonoLink, PillLink, cx } from "./ui/primitives";
import softwareImg from "@/public/images/our-software.webp";
import gridImg from "@/public/images/fest-1.webp";

/** Scroll distance the story stays pinned for. */
/** Scroll distance (viewport heights) the story stays pinned for. */
const PIN_VH = 3.8;
/** Scroll distance (viewport heights) of the approach, from "top 80%" to the pin. */
const APPROACH_VH = 0.8;
// The first 0.27 of timeline time is the approach (before the pin); the
// positions below already include that offset.
/**
 * Hold on the finished scene (timeline time) after the CTA lands. The next
 * section's arc rises over the last --arc-depth of the pin, so everything must
 * be complete well before then.
 */
const HOLD = 0.34;

/** Phrases in the (verbatim) paragraph that light up in fern. */
const HIGHLIGHTS = [
  "Fuel and Energy Security Tool (FEST)",
  "Near Term Energy Reliability Assessments (ERA)",
  "Balancing Authorities",
  "April 2027",
  "NERC BAL-007-1",
];

/** Split the paragraph into words, flagging those inside a highlight phrase. */
function splitWords(text: string) {
  const marks = new Array(text.length).fill(false);
  for (const phrase of HIGHLIGHTS) {
    let i = text.indexOf(phrase);
    while (i !== -1) {
      for (let k = i; k < i + phrase.length; k++) marks[k] = true;
      i = text.indexOf(phrase, i + phrase.length);
    }
  }
  const words: { w: string; hi: boolean }[] = [];
  let pos = 0;
  for (const w of text.split(" ")) {
    words.push({ w, hi: marks[pos] });
    pos += w.length + 1;
  }
  return words;
}

/** Spec cards: structural labels with values taken from the copy. */
const SPECS = [
  { label: "Product", value: "Fuel and Energy Security Tool (FEST)", at: "lg:top-[16%] lg:right-[6%]" },
  { label: "Standard", value: "NERC BAL-007-1", at: "lg:top-[38%] lg:right-[22%]" },
  { label: "Timeline", value: FRAGMENTS.beginningApril.replace(/\.$/, ""), at: "lg:top-[52%] lg:right-[4%]" },
  { label: "For", value: "Balancing Authorities", at: "lg:top-[72%] lg:right-[18%]" },
];

/**
 * 01 / Our Software — a pinned, scroll-scrubbed story (Trident-style):
 * 1. "OUR SOFTWARE" rises in, huge; then rolls out as "BEGINNING APRIL 2027." rolls in.
 * 2. Two photos fly in from opposite corners across the title (grid → software).
 * 3. They converge; the software photo expands to fill the screen.
 * 4. The paragraph brightens word by word, key terms in fern.
 * 5. Spec cards pop in, then the CTA; the pin releases.
 * Static editorial layout without JS / under reduced motion.
 */
export function OurSoftware() {
  const { ourSoftware } = HOME;
  const ref = useRef<HTMLElement>(null);
  const [story, setStory] = useState(false);
  const words = splitWords(ourSoftware.body);
  const [line1, ...rest] = FRAGMENTS.beginningApril.split(" ");
  const titleLines = [[line1], rest];

  // Story layout whenever motion is allowed.
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
      if (!story || !section) return;
      const q = gsap.utils.selector(section);
      const cardA = q("[data-card='a']")[0];
      const cardB = q("[data-card='b']")[0];
      const W = () => window.innerWidth;
      const H = () => window.innerHeight;
      const cw = () => (W() < 768 ? W() * 0.7 : W() * 0.34);
      const ch = () => cw() * 0.64;

      // Cards start hidden and fully off-screen (past the corner by their own size).
      gsap.set([cardA, cardB], { xPercent: -50, yPercent: -50, width: cw, height: ch, autoAlpha: 0 });
      const offX = () => W() / 2 + cw() * 0.75 + 60;
      const offY = () => H() / 2 + ch() * 0.75 + 60;

      // Explicit starting states for every staggered target. A staggered fromTo
      // only pre-renders its *first* target (the others haven't "started" yet at
      // time 0), which left "SOFTWARE" / "APRIL 2027." visible on the first pass.
      gsap.set(q("[data-heading-word]"), { yPercent: 115 });
      gsap.set(q("[data-title-word]"), { yPercent: 115 });
      gsap.set(q("[data-spec]"), { autoAlpha: 0, y: 30, scale: 0.94 });
      gsap.set(q("[data-word]"), { opacity: 0.14 });

      // The pin on its own, with no animation attached…
      ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: () => `+=${window.innerHeight * PIN_VH}`,
        pin: true,
        invalidateOnRefresh: true,
      });

      // …and ONE scrubbed timeline that owns the whole sequence, from the approach
      // ("top 80%") to the end of the pin. Every property is driven by a single
      // timeline, so smoothed tweens can never fight and leave words stuck on screen.
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: section,
          start: "top 80%",
          end: () => `+=${window.innerHeight * (APPROACH_VH + PIN_VH)}`,
          scrub: 0.7,
          invalidateOnRefresh: true,
        },
      });

      // 1. "Our Software" rises in as the section arrives (before the pin locks)
      tl.fromTo(
        q("[data-heading-word]"),
        { yPercent: 115 },
        { yPercent: 0, duration: 0.2, stagger: 0.04, ease: "power3.out" },
        0.02,
      );

      tl
        // 1b. "Our Software" rolls out, "Beginning April 2027." rolls in
        .fromTo(
          q("[data-heading-word]"),
          { yPercent: 0 },
          { yPercent: -115, duration: 0.07, stagger: 0.025, ease: "power3.in", immediateRender: false },
          0.28,
        )
        .fromTo(
          q("[data-title-word]"),
          { yPercent: 115 },
          { yPercent: 0, duration: 0.08, stagger: 0.03, ease: "power3.out" },
          0.34,
        )
        // 2. photos fly in from opposite corners, crossing the title
        .fromTo(
          cardA,
          { x: () => -offX(), y: () => offY(), rotate: -14, autoAlpha: 0 },
          { x: () => -W() * 0.14, y: () => H() * 0.1, rotate: -4, autoAlpha: 1, duration: 0.3, ease: "power2.out" },
          0.46,
        )
        .fromTo(
          cardB,
          { x: () => offX(), y: () => -offY(), rotate: 14, autoAlpha: 0 },
          { x: () => W() * 0.15, y: () => -H() * 0.12, rotate: 5, autoAlpha: 1, duration: 0.3, ease: "power2.out" },
          0.5,
        )
        // 3. converge, then the software photo fills the screen
        .to([cardA, cardB], { x: 0, y: 0, rotate: 0, duration: 0.12, ease: "power2.inOut" }, 0.81)
        .to(cardB, { autoAlpha: 0, scale: 0.9, duration: 0.05 }, 0.91)
        .to(cardA, { width: W, height: H, borderRadius: 0, duration: 0.14, ease: "power2.inOut" }, 0.93)
        .to(q("[data-on-image]"), { color: "#f8f9f7", duration: 0.08 }, 0.97)
        .to(q("[data-shade]"), { autoAlpha: 1, duration: 0.1 }, 0.99)
        // 4. title leaves; paragraph brightens word by word
        .to(q("[data-title]"), { yPercent: -35, autoAlpha: 0, filter: "blur(12px)", duration: 0.08 }, 1.05)
        .to(q("[data-para]"), { autoAlpha: 1, duration: 0.03 }, 1.07)
        .fromTo(q("[data-para-heading]"), { yPercent: 110 }, { yPercent: 0, duration: 0.05, ease: "power3.out" }, 1.07)
        .fromTo(q("[data-para-rule]"), { scaleX: 0 }, { scaleX: 1, duration: 0.05, ease: "power2.out" }, 1.1)
        .fromTo(
          q("[data-word]"),
          { opacity: 0.14 },
          { opacity: 1, duration: 0.02, stagger: 0.17 / words.length },
          1.12,
        )
        // 5. spec cards, then the CTA
        .fromTo(
          q("[data-spec]"),
          { autoAlpha: 0, y: 30, scale: 0.94 },
          { autoAlpha: 1, y: 0, scale: 1, duration: 0.05, stagger: 0.03, ease: "power3.out" },
          1.27,
        )
        .fromTo(q("[data-cta]"), { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.04 }, 1.38)
        .to({}, { duration: HOLD });

      // This pin is created after a state change, so re-order and re-measure.
      ScrollTrigger.sort();
      ScrollTrigger.refresh();
    },
    { scope: ref, dependencies: [story], revertOnUpdate: true },
  );

  return (
    <section
      ref={ref}
      id="our-software"
      aria-labelledby="our-software-title"
      className={cx(
        "surface-light arc-prev relative bg-paper",
        story ? "h-svh overflow-hidden" : "px-5 pt-24 md:px-10 md:pt-36",
      )}
    >
      {/* Inner wrapper: the next section's parallax moves this, never the pinned section. */}
      <div data-software-inner className={cx(story && "absolute inset-0")}>
        <div className={cx(story ? "absolute inset-0" : "mx-auto grid max-w-[1600px] gap-14 lg:grid-cols-12 lg:gap-10")}>
          {/* Photos (story: flying cards; static: the right-hand figure) */}
          {story && (
            <div
              data-card="b"
              className="absolute top-1/2 left-1/2 z-10 overflow-hidden rounded-[18px] shadow-[0_30px_80px_-30px_rgb(0_0_0/0.55)]"
            >
              <Image src={gridImg} alt="" fill sizes="40vw" className="photo object-cover" />
            </div>
          )}
          <figure
            data-card={story ? "a" : undefined}
            className={cx(
              "overflow-hidden",
              story
                ? "absolute top-1/2 left-1/2 z-10 rounded-[18px] shadow-[0_30px_80px_-30px_rgb(0_0_0/0.55)]"
                : "relative aspect-[3/4] bg-paper-warm lg:col-span-5 lg:col-start-8 lg:row-span-2 lg:mt-28",
            )}
          >
            <Image
              src={softwareImg}
              alt="Greyscale desk at dusk: a monitor showing source code beside a desk lamp, laptop and keyboard"
              fill
              sizes={story ? "100vw" : "(min-width: 1024px) 40vw, 100vw"}
              placeholder="blur"
              className="photo object-cover"
            />
            {story && (
              <div
                data-shade
                aria-hidden
                className="invisible absolute inset-0 opacity-0 [background:linear-gradient(to_right,rgb(18_22_10/0.88),rgb(18_22_10/0.55)_55%,rgb(18_22_10/0.35)),linear-gradient(to_top,rgb(18_22_10/0.6),transparent_45%)]"
              />
            )}
            {!story && (
              <figcaption className="text-label absolute top-4 left-4 z-10 rounded-full bg-paper px-3 py-1.5 text-carbon">
                FEST
              </figcaption>
            )}
          </figure>

          {/* Titles: "Our Software" first, then "Beginning April 2027." in the same spot */}
          <div className={cx(story ? "pointer-events-none absolute inset-0 z-20" : "lg:col-span-7 lg:row-start-1 lg:pr-6")}>
            <div
              data-title
              className={cx(story && "absolute inset-0 grid place-items-center px-5 text-center")}
            >
              <h2
                id="our-software-title"
                className={cx(
                  "font-condensed uppercase",
                  story
                    ? "col-start-1 row-start-1 text-[clamp(3.5rem,13vw,15rem)] leading-[0.86] text-carbon"
                    : "text-[clamp(2.25rem,4.5vw,4rem)] leading-[0.9]",
                )}
              >
                {story
                  ? ourSoftware.title.split(" ").map((w, i) => (
                      <Fragment key={w}>
                        {i > 0 && " "}
                        <span className="block overflow-hidden pb-[0.04em]">
                          <span data-heading-word className="inline-block">
                            {w}
                          </span>
                        </span>
                      </Fragment>
                    ))
                  : ourSoftware.title}
              </h2>

              <p
                data-on-image
                className={cx(
                  "font-condensed uppercase",
                  story
                    ? "col-start-1 row-start-1 text-[clamp(3.5rem,13vw,15rem)] leading-[0.86] text-carbon"
                    : "text-condensed-xl mt-6 max-w-[10ch] lg:text-[clamp(4rem,9.5vw,10rem)]",
                )}
              >
                {titleLines.map((line, l) => (
                  <Fragment key={l}>
                    {l > 0 && " "}
                    <span className={cx("block", story && "overflow-hidden pb-[0.04em]")}>
                      {story ? (
                        <span data-title-word className="inline-block">
                          {line.join(" ")}
                        </span>
                      ) : (
                        line.join(" ")
                      )}
                    </span>
                  </Fragment>
                ))}
              </p>
            </div>
          </div>

          {/* Paragraph, specs, CTA */}
          <div
            className={cx(
              story
                ? "pointer-events-none absolute inset-0 z-20"
                : "max-w-[60ch] lg:col-span-7 lg:row-start-2",
            )}
          >
            <div
              data-para
              className={cx(
                story &&
                  "invisible absolute top-1/2 left-5 w-[min(88vw,640px)] -translate-y-1/2 opacity-0 md:left-10 lg:w-[44vw] lg:max-w-[760px]",
              )}
            >
              {/* Visible heading for the paragraph (the section's h2 is the big title above). */}
              {story && (
                <div aria-hidden className="mb-5 md:mb-7">
                  <span className="block overflow-hidden pb-[0.05em]">
                    <span
                      data-para-heading
                      className="font-condensed inline-block text-[clamp(2.25rem,4.6vw,5rem)] leading-[0.9] text-paper uppercase"
                    >
                      {ourSoftware.title}
                    </span>
                  </span>
                  <span data-para-rule className="mt-4 block h-[2px] w-20 origin-left bg-fern md:mt-5" />
                </div>
              )}
              <p
                className={cx(
                  story
                    ? "font-display text-[clamp(1.35rem,2.3vw,2.6rem)] leading-[1.16] text-paper"
                    : "text-base leading-relaxed text-muted md:text-lg",
                )}
              >
                {story
                  ? words.map(({ w, hi }, i) => (
                      <Fragment key={i}>
                        {i > 0 && " "}
                        <span data-word className={cx(hi && "text-fern")}>
                          {w}
                        </span>
                      </Fragment>
                    ))
                  : ourSoftware.body}
              </p>
            </div>

            <dl
              className={cx(
                story
                  ? "hidden lg:block"
                  : "text-label mt-10 grid gap-px border-y border-line sm:grid-cols-2",
              )}
            >
              {SPECS.map((s, i) =>
                story ? (
                  <div
                    key={s.label}
                    data-spec
                    className={cx(
                      "invisible absolute w-[min(24vw,340px)] rounded-[16px] bg-paper/95 p-5 text-carbon opacity-0 shadow-[0_24px_60px_-24px_rgb(0_0_0/0.6)] backdrop-blur-sm",
                      s.at,
                    )}
                  >
                    <span aria-hidden className="absolute -top-1.5 -left-1.5 flex size-3">
                      <span className="absolute inline-flex size-full animate-ping rounded-full bg-fern opacity-60" />
                      <span className="relative inline-flex size-3 rounded-full bg-fern" />
                    </span>
                    <dt className="text-label text-carbon/60">
                      {String(i + 1).padStart(2, "0")} — {s.label}
                    </dt>
                    <dd className="font-display mt-2 text-[clamp(1.1rem,1.5vw,1.6rem)] leading-tight">{s.value}</dd>
                  </div>
                ) : (
                  // Static: the original two-column meta row (Product, Standard).
                  i < 2 && (
                    <div
                      key={s.label}
                      className={cx("flex flex-col gap-2 py-4", i === 0 ? "sm:pr-6" : "border-line sm:border-l sm:pl-6")}
                    >
                      <dt className="text-muted">{s.label}</dt>
                      <dd className="text-fg">{s.value}</dd>
                    </div>
                  )
                ),
              )}
            </dl>

            {story ? (
              <div data-cta className="pointer-events-auto invisible absolute right-5 bottom-[8%] opacity-0 md:right-10">
                <PillLink href={ROUTES.fest} tone="paper" size="lg">
                  {HOME.closing.buttons.explore.label}
                </PillLink>
              </div>
            ) : (
              <MonoLink href={ROUTES.fest} className="mt-8 text-carbon">
                {HOME.closing.buttons.explore.label}
              </MonoLink>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
