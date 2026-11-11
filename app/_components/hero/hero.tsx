import { Fragment } from "react";
import Image from "next/image";
import { HOME } from "@/lib/content";
import poster from "@/public/hero/poster.jpg";
import { HeroStage } from "./hero-stage";
import { HeroAnnotations, LlcRing } from "./hero-annotations";
import { MonoLink, PillLink, cx } from "../ui/primitives";

/** The verbatim tagline, split into its two display lines of words. */
const TAGLINE_WORDS = HOME.hero.tagline.split(" ");
const TAGLINE = [TAGLINE_WORDS.slice(0, 4), TAGLINE_WORDS.slice(4)];

export function Hero() {
  const { hero } = HOME;

  return (
    <HeroStage
      backdrop={
        <Image
          src={poster}
          alt="Wind turbines along a snow-covered ridge under a heavy grey sky"
          fill
          preload
          sizes="100vw"
          placeholder="blur"
          className="object-cover"
        />
      }
    >
      <p className="sr-only">
        Background video: a drone rises over a snowy ridge lined with wind turbines, then the view opens onto a
        cloud-filled valley crossed by a transmission line.
      </p>

      {/*
        Centre: wordmark (h1) and tagline. With motion, only the wordmark shows at
        first; scrolling blurs it out and blurs the tagline in word by word in the
        same spot (see HeroStage). Without JS / under reduced motion both are
        simply stacked.
      */}
      <div
        data-hero-text
        className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-10 px-5 pt-16 text-center md:gap-14"
      >
        <div data-hero-wordmark className="relative">
          <HeroAnnotations />
          {/*
            Balanced lockup: a semibold FERNGRID over a light ENERGY, sized so both
            lines run the same width; LLC sits as a fern badge on a full-width rule.
          */}
          <h1 id="hero-title" className="font-display inline-flex flex-col items-stretch uppercase">
            <span
              data-wm-line
              className="block text-center text-[clamp(3rem,9.6vw,11rem)] leading-[0.86] font-semibold tracking-[0.06em]"
            >
              FernGrid
            </span>{" "}
            <span
              data-wm-line
              className="block text-center text-[clamp(4rem,12.8vw,14.7rem)] leading-[0.86] font-normal tracking-[0.04em]"
            >
              Energy
            </span>{" "}
            <span className="mt-[clamp(0.75rem,1.6vw,1.75rem)] flex items-center gap-[clamp(0.75rem,1.4vw,1.5rem)]">
              <span aria-hidden className="h-px flex-1 bg-gradient-to-r from-transparent to-paper/80" />
              <span className="relative">
                <LlcRing />
                <span className="relative block rounded-full bg-fern px-[1.1em] py-[0.5em] pl-[1.55em] font-mono text-[clamp(0.75rem,1vw,1.05rem)] font-medium tracking-[0.45em] text-carbon shadow-[0_8px_24px_-12px_rgb(0_0_0/0.6)]">
                LLC
              </span>
              </span>
              <span aria-hidden className="h-px flex-1 bg-gradient-to-l from-transparent to-paper/80" />
            </span>
          </h1>
        </div>

        <div
          data-hero-tagline
          className="motion-safe:[.js_&]:absolute motion-safe:[.js_&]:inset-0 motion-safe:[.js_&]:flex motion-safe:[.js_&]:items-center motion-safe:[.js_&]:justify-center motion-safe:[.js_&]:pt-16"
        >
          <p
            className="font-display max-w-[18ch] px-5 text-[clamp(2.25rem,5vw,4.5rem)] leading-[0.95] text-balance md:max-w-none motion-safe:[.js_&]:max-w-[16ch] motion-safe:[.js_&]:text-[clamp(3.25rem,8vw,9rem)] motion-safe:[.js_&]:leading-[0.92]"
          >
            {TAGLINE.map((line, l) => (
              <Fragment key={l}>
                {l > 0 && " "}
                <span className="block">
                  {line.map((w, i) => (
                    <Fragment key={w}>
                      {i > 0 && " "}
                      <span
                        data-hero-word
                        className={cx("inline-block motion-safe:[.js_&]:invisible motion-safe:[.js_&]:opacity-0", w === "Engineering" && "text-fern")}
                      >
                        {w}
                      </span>
                    </Fragment>
                  ))}
                </span>
              </Fragment>
            ))}
          </p>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="absolute inset-x-0 bottom-0 z-10 flex items-end justify-between gap-4 px-5 pb-6 md:px-10 md:pb-10">
        <div className="flex flex-col items-start gap-1 md:flex-row md:items-center md:gap-6">
          <PillLink href={hero.buttons.learn.href} tone="paper" icon="up-right">
            {hero.buttons.learn.label}
          </PillLink>
          <MonoLink href={hero.buttons.explore.href} className="text-paper">
            {hero.buttons.explore.label}
          </MonoLink>
        </div>
        <PillLink href={hero.buttons.contact.href} tone="fern" icon="up-right">
          {hero.buttons.contact.label}
        </PillLink>
      </div>
    </HeroStage>
  );
}
