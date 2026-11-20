"use client";

import Image from "next/image";
import { Fragment, useRef, useState } from "react";
import { FRAGMENTS, HOME, ROUTES } from "@/lib/content";
import { gsap, ScrollTrigger, useGSAP, MQ } from "./motion/gsap";
import { MonoLink, PillLink, cx } from "./ui/primitives";
import softwareImg from "@/public/images/our-software.webp";

/**
 * Scroll distance (viewport heights) the panel takes to wipe up over the triad.
 * The section overlaps the end of the triad's pin by exactly this much (see
 * TriadIntro's PIN_VH), so the triad holds still underneath while it covers it.
 */
const COVER_VH = 1;
/** Scroll distance (viewport heights) the story stays pinned for once it has covered the screen. */
const PIN_VH = 2;
/** How far (fraction of the screen) the photo travels while the panel wipes up (the Training panel uses 18%). */
const MEDIA_DRIFT = 0.18;

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

/** Static editorial layout (no JS / reduced motion). */
function StaticLayout() {
  const { ourSoftware } = HOME;
  // The software's name (verbatim from the paragraph), on two lines.
  const nameWords = FRAGMENTS.festName.split(" ");
  const titleLines = [nameWords.slice(0, 3), nameWords.slice(3)];
  return (
    <div className="mx-auto grid max-w-[1600px] gap-14 lg:grid-cols-12 lg:gap-10">
      <figure className="relative aspect-[3/4] overflow-hidden bg-paper-warm lg:col-span-5 lg:col-start-8 lg:row-span-2 lg:mt-28">
        <Image
          src={softwareImg}
          alt="Greyscale desk at dusk: a monitor showing source code beside a desk lamp, laptop and keyboard"
          fill
          sizes="(min-width: 1024px) 40vw, 100vw"
          placeholder="blur"
          className="photo object-cover"
        />
        <figcaption className="text-label absolute top-4 left-4 z-10 rounded-full bg-paper px-3 py-1.5 text-carbon">
          FEST
        </figcaption>
      </figure>

      <div className="lg:col-span-7 lg:row-start-1 lg:pr-6">
        <h2 id="our-software-title" className="font-condensed text-[clamp(2.25rem,4.5vw,4rem)] leading-[0.9] uppercase">
          {ourSoftware.title}
        </h2>
        <p className="font-condensed text-condensed-xl mt-6 uppercase lg:text-[clamp(3rem,6vw,7rem)]">
          {titleLines.map((line, l) => (
            <Fragment key={l}>
              {l > 0 && " "}
              <span className="block">{line.join(" ")}</span>
            </Fragment>
          ))}
        </p>
      </div>

      <div className="max-w-[60ch] lg:col-span-7 lg:row-start-2">
        <p className="text-base leading-relaxed text-muted md:text-lg">{ourSoftware.body}</p>
        <MonoLink href={ROUTES.fest} className="mt-8 text-carbon">
          {HOME.closing.buttons.explore.label}
        </MonoLink>
      </div>
    </div>
  );
}

/**
 * 01 / Our Software — enters the same way Training Services does:
 * 1. With the triad (SOFTWARE lit) held on screen, the software photo wipes up
 *    over it from the bottom, drifting up a little as it comes.
 * 2. A giant SOFTWARE rises letter by letter along the bottom edge; the heading
 *    follows, then the paragraph brightens word by word, key terms in fern.
 * 3. The CTA rises in; the pin releases.
 * Static editorial layout without JS / under reduced motion.
 */
export function OurSoftware() {
  const { ourSoftware } = HOME;
  const ref = useRef<HTMLElement>(null);
  const [story, setStory] = useState(false);
  const words = splitWords(ourSoftware.body);

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
      const H = () => window.innerHeight;

      gsap.set(q("[data-schar]"), { yPercent: 105 });
      gsap.set(q("[data-sw-word]"), { yPercent: 110 });
      gsap.set(q("[data-sw-rule]"), { scaleX: 0 });
      gsap.set(q("[data-sw-para]"), { autoAlpha: 0 });
      gsap.set(q("[data-word]"), { opacity: 0.14 });
      gsap.set(q("[data-cta]"), { autoAlpha: 0, y: 16 });

      // 1. The wipe. The section scrolls up over the (still pinned) triad and its
      // own edge is the wipe; the photo is held back against the scroll so it only
      // drifts up MEDIA_DRIFT of the screen, as in the Training panel. Tied
      // straight to the scroll (no smoothing) so the photo never slips against
      // the section edge.
      const wipe = gsap.fromTo(
        q("[data-sw-media]"),
        { y: () => -(1 - MEDIA_DRIFT) * H(), scale: 1.15 },
        {
          y: 0,
          scale: 1,
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top bottom",
            end: "top top",
            scrub: true,
            invalidateOnRefresh: true,
          },
        },
      );

      const pinST = ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: () => `+=${H() * PIN_VH}`,
        pin: true,
        invalidateOnRefresh: true,
      });

      // One scrubbed timeline from the start of the wipe to the end of the pin.
      // Timeline time is measured in viewport heights of scroll.
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: section,
          start: "top bottom",
          end: () => `+=${H() * (COVER_VH + PIN_VH)}`,
          scrub: 0.7,
          invalidateOnRefresh: true,
        },
      });
      tl
        // 2. giant word along the bottom, then the heading, rule and paragraph
        .to(q("[data-schar]"), { yPercent: 0, duration: 0.45, stagger: 0.04, ease: "power3.out" }, 0.7)
        .to(q("[data-sw-word]"), { yPercent: 0, duration: 0.25, stagger: 0.07, ease: "power3.out" }, 0.95)
        .to(q("[data-sw-rule]"), { scaleX: 1, duration: 0.2, ease: "power2.out" }, 1.1)
        .to(q("[data-sw-para]"), { autoAlpha: 1, duration: 0.1 }, 1.1)
        .to(q("[data-word]"), { opacity: 1, duration: 0.06, stagger: 0.75 / words.length }, 1.2)
        // 3. the CTA
        .to(q("[data-cta]"), { autoAlpha: 1, y: 0, duration: 0.15, ease: "power2.out" }, 2.05);
      // Hold on the finished scene; the next section's arc rises over the end of the pin.
      tl.to({}, { duration: COVER_VH + PIN_VH - tl.duration() });

      // This pin is created after a state change, so re-order and re-measure.
      ScrollTrigger.sort();
      ScrollTrigger.refresh();
      return () => {
        pinST.kill();
        wipe.scrollTrigger?.kill();
        wipe.kill();
      };
    },
    { scope: ref, dependencies: [story], revertOnUpdate: true },
  );

  if (!story) {
    return (
      <section
        ref={ref}
        id="our-software"
        aria-labelledby="our-software-title"
        className="arc-prev surface-light relative bg-paper px-5 pt-24 md:px-10 md:pt-36"
      >
        {/* Inner wrapper: the next section's parallax moves this. */}
        <div data-software-inner>
          <StaticLayout />
        </div>
      </section>
    );
  }

  return (
    <section
      ref={ref}
      id="our-software"
      aria-labelledby="our-software-title"
      // Pulled up one screen so it slides over the last screen of the triad's pin
      // (z-10 like the triad, later in the DOM, so it paints on top of it; the next
      // section, also z-10, still paints over this one).
      className="arc-prev surface-dark relative z-10 h-svh overflow-hidden bg-carbon-deep"
      style={{ marginTop: `-${COVER_VH * 100}svh` }}
    >
      {/* Inner wrapper: the next section's parallax moves this, never the pinned section. */}
      <div data-software-inner className="absolute inset-0">
        {/* Photo + shade. Taller than the screen: the next section's parallax nudges
            this layer down over the end of the pin, and the overflow keeps the photo
            covering the top edge. */}
        <div data-sw-media className="absolute inset-x-0 -top-[10svh] h-[120svh] will-change-transform">
          <Image
            src={softwareImg}
            alt="Greyscale desk at dusk: a monitor showing source code beside a desk lamp, laptop and keyboard"
            fill
            sizes="100vw"
            placeholder="blur"
            className="photo object-cover"
          />
          <div
            aria-hidden
            className="absolute inset-0 [background:linear-gradient(to_right,rgb(18_22_10/0.9),rgb(18_22_10/0.62)_55%,rgb(18_22_10/0.4)),linear-gradient(to_top,rgb(18_22_10/0.75),transparent_55%)]"
          />
        </div>

        {/* Giant word along the bottom edge */}
        <p
          aria-hidden
          className="font-condensed absolute inset-x-0 -bottom-[0.14em] flex justify-center overflow-hidden text-[24vw] leading-[0.9] text-paper/[0.08] uppercase"
        >
          {"Software".split("").map((c, i) => (
            <span key={i} data-schar className="inline-block">
              {c}
            </span>
          ))}
        </p>

        {/* Heading + paragraph */}
        <div className="absolute inset-0 flex flex-col justify-center px-5 pt-20 pb-8 md:px-10 lg:pt-24">
          <div className="w-[min(88vw,640px)] lg:w-[44vw] lg:max-w-[760px]">
            <h2
              id="our-software-title"
              className="font-condensed text-[clamp(2.5rem,6vw,6.5rem)] leading-[0.9] text-paper uppercase"
            >
              {ourSoftware.title.split(" ").map((w, i) => (
                <Fragment key={w}>
                  {i > 0 && " "}
                  <span className="inline-block overflow-hidden pb-[0.05em] align-bottom">
                    <span data-sw-word className="inline-block">
                      {w}
                    </span>
                  </span>
                </Fragment>
              ))}
            </h2>
            <span data-sw-rule aria-hidden className="mt-4 block h-[2px] w-20 origin-left bg-fern md:mt-6" />
            <p
              data-sw-para
              className="font-display mt-5 text-[clamp(1.35rem,2.3vw,2.6rem)] leading-[1.16] text-paper md:mt-7"
            >
              {words.map(({ w, hi }, i) => (
                <Fragment key={i}>
                  {i > 0 && " "}
                  <span data-word className={cx(hi && "text-fern")}>
                    {w}
                  </span>
                </Fragment>
              ))}
            </p>
          </div>
        </div>

        <div data-cta className="absolute right-5 bottom-[8%] z-10 md:right-10">
          <PillLink href={ROUTES.fest} tone="paper" size="lg">
            {HOME.closing.buttons.explore.label}
          </PillLink>
        </div>
      </div>
    </section>
  );
}
