"use client";

import { useRef, useState } from "react";
import { ArcSurface } from "./motion/arc-surface";
import { gsap, ScrollTrigger, useGSAP, MQ } from "./motion/gsap";
import { cx } from "./ui/primitives";

/**
 * Scroll distance (viewport heights) the triad stays pinned for. The last screen
 * of it is Our Software's photo wiping up over the triad (OurSoftware COVER_VH),
 * so the words must finish dimming well before that.
 */
const PIN_VH = 2;
/** Scroll distance (viewport heights) of the approach, from "top 80%" to the pin. */
const APPROACH_VH = 0.8;

/** The three offerings, stacked (labels). */
export const TRIAD = ["Software", "Services", "Training"] as const;
/** Sized so the three stacked words always fit both the width and the height of the screen. */
export const TRIAD_FONT = "clamp(3.5rem, min(15vw, 25svh), 16rem)";
/** Colour of the words that are not highlighted (paper at low opacity). */
export const TRIAD_DIM = "rgb(248 249 247 / 0.22)";

/**
 * Home, right after the hero (Revision 2, replaces the text ring around the logo):
 * a dark circle swipes up from the bottom of the screen and lands on
 * SOFTWARE / SERVICES / TRAINING stacked vertically; then only SOFTWARE stays
 * lit and the page continues into Our Software.
 * Without JS / under reduced motion: the three words, Software highlighted.
 */
export function TriadIntro() {
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

      gsap.set(q("[data-tw]"), { yPercent: 110 });

      // The hero's buttons fade as the circle rises over them, so they never sit
      // half on top of the arc (mobile "white splotches").
      // (looked up on the document: useGSAP scopes selector strings to this section)
      const heroBar = document.querySelector<HTMLElement>("[data-hero-bar]");
      const bar = gsap.fromTo(
        heroBar,
        { autoAlpha: 1 },
        {
          autoAlpha: 0,
          ease: "none",
          immediateRender: false,
          scrollTrigger: { trigger: section, start: "top bottom", end: "top 82%", scrub: true },
        },
      );

      const pinST = ScrollTrigger.create({
        trigger: stage,
        start: "top top",
        end: () => `+=${window.innerHeight * PIN_VH}`,
        pin: true,
        invalidateOnRefresh: true,
      });

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: stage,
          start: "top 80%",
          end: () => `+=${window.innerHeight * (APPROACH_VH + PIN_VH)}`,
          scrub: 0.7,
          invalidateOnRefresh: true,
        },
      });
      const approach = APPROACH_VH / (APPROACH_VH + PIN_VH);
      tl
        // the three words rise in, all lit, as the circle arrives
        .to(q("[data-tw]"), { yPercent: 0, duration: approach * 0.75, stagger: approach * 0.1, ease: "power3.out" }, approach * 0.1)
        // hold on all three, then only SOFTWARE stays lit
        .to(q("[data-tw='dim']"), { color: TRIAD_DIM, duration: 0.14, ease: "power2.inOut" }, approach + 0.12)
        .to({}, { duration: 1 - (approach + 0.3) });

      ScrollTrigger.sort();
      ScrollTrigger.refresh();
      return () => {
        pinST.kill();
        bar.scrollTrigger?.kill();
        bar.kill();
        if (heroBar) gsap.set(heroBar, { clearProps: "opacity,visibility" });
      };
    },
    { scope: ref, dependencies: [story], revertOnUpdate: true },
  );

  return (
    <section
      ref={ref}
      aria-labelledby="triad-title"
      className={cx("surface-dark arc-next relative z-10", !story && "pb-24")}
      style={story ? { paddingTop: "var(--arc-depth)" } : undefined}
    >
      <ArcSurface tone="carbon-deep" parallax="[data-hero-inner]" />

      <h2 id="triad-title" className="sr-only">
        Software. Services. Training.
      </h2>

      <div
        data-stage
        className={cx(
          "relative flex flex-col items-center justify-center bg-carbon-deep px-5 text-center",
          story ? "pin-screen overflow-hidden pt-12" : "py-10",
        )}
      >
        <div aria-hidden className="font-condensed uppercase leading-[0.88]" style={{ fontSize: TRIAD_FONT }}>
          {TRIAD.map((w, i) => (
            <p key={w} className="overflow-hidden pb-[0.04em]">
              <span
                data-tw={i === 0 ? "lit" : "dim"}
                className="inline-block"
                style={!story && i > 0 ? { color: TRIAD_DIM } : undefined}
              >
                {w}
              </span>
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}
