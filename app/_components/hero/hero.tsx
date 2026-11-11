import { Fragment } from "react";
import { getImageProps } from "next/image";
import { HERO_MODE } from "@/lib/config";
import { HOME } from "@/lib/content";
import { HERO_FRAME_HEIGHT, HERO_FRAME_WIDTH } from "@/lib/hero-frames";
import banner from "@/public/images/home-banner.webp";
import { HeroStage } from "./hero-stage";
import { MonoLink, PillLink } from "../ui/primitives";

const BACKDROP_ALT = "Wind turbines along a snow-covered ridge under a heavy grey sky";

/**
 * Poster frame as the LCP image; under prefers-reduced-motion the browser
 * picks the static Home banner instead (art direction via <picture>).
 */
function Backdrop() {
  const common = { alt: BACKDROP_ALT, sizes: "100vw" };
  const {
    props: { srcSet: bannerSrcSet },
  } = getImageProps({ ...common, src: banner });
  const { props: poster } = getImageProps({
    ...common,
    src: "/hero/poster.jpg",
    width: HERO_FRAME_WIDTH,
    height: HERO_FRAME_HEIGHT,
    fetchPriority: "high",
    loading: "eager",
  });

  return (
    <picture>
      <source media="(prefers-reduced-motion: reduce)" srcSet={bannerSrcSet} sizes="100vw" />
      {/* eslint-disable-next-line jsx-a11y/alt-text -- alt comes from getImageProps */}
      <img {...poster} className="absolute inset-0 size-full object-cover" />
    </picture>
  );
}

/** Splits a line into masked words for the word-by-word tagline reveal. */
function Words({ text, italic }: { text: string; /** accent word (fern) */ italic?: boolean }) {
  return text.split(" ").map((w, i) => (
    <Fragment key={i}>
      {i > 0 && " "}
      <span className="-mb-[0.12em] inline-block overflow-hidden pb-[0.12em] align-bottom">
        <span data-word className={italic ? "inline-block text-fern" : "inline-block"}>
          {w}
        </span>
      </span>
    </Fragment>
  ));
}

export function Hero() {
  const { hero } = HOME;

  return (
    <HeroStage mode={HERO_MODE} backdrop={<Backdrop />}>
      <p className="sr-only">
        Background footage: a drone rises over a snowy ridge lined with wind turbines, then the view opens onto a
        cloud-filled valley crossed by a transmission line.
      </p>

      {/* Centre: wordmark (h1) and tagline */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-10 px-5 pt-16 text-center md:gap-14">
        <div data-hero-wordmark>
          <h1 id="hero-title" className="font-display flex flex-col items-center uppercase">
            <span className="mb-1 block pl-[0.55em] text-[clamp(1.1rem,2.2vw,2.1rem)] tracking-[0.55em] text-paper/85">
              FernGrid
            </span>{" "}
            <span className="flex items-start">
              <span className="text-hero block">Energy</span>{" "}
              <span className="text-label mt-[0.6em] ml-2 block text-paper/80 md:ml-3">LLC</span>
            </span>
          </h1>
        </div>

        <div data-hero-tagline data-hero-phase="2" className="px-5">
          <p className="font-display max-w-[18ch] text-[clamp(2.25rem,5vw,4.5rem)] leading-[0.95] text-balance md:max-w-none">
            <span className="block">
              <Words text="Reliable Software Starts with" />
            </span>{" "}
            <span className="block">
              <Words text="Reliable" />{" "}
              <Words text="Engineering" italic />
            </span>
          </p>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="absolute inset-x-0 bottom-0 z-10 flex items-end justify-between gap-4 px-5 pb-6 md:px-10 md:pb-10">
        <div data-hero-phase="1" className="flex flex-col items-start gap-1 md:flex-row md:items-center md:gap-6">
          <PillLink href={hero.buttons.learn.href} tone="paper" icon="up-right">
            {hero.buttons.learn.label}
          </PillLink>
          <MonoLink href={hero.buttons.explore.href} className="text-paper">
            {hero.buttons.explore.label}
          </MonoLink>
        </div>

        <div data-hero-phase="2" data-hero-contact>
          <PillLink href={hero.buttons.contact.href} tone="fern" icon="up-right">
            {hero.buttons.contact.label}
          </PillLink>
        </div>
      </div>
    </HeroStage>
  );
}
