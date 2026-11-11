import Image from "next/image";
import { HOME, SITE } from "@/lib/content";
import { FadeUp, SplitReveal } from "./motion/reveal";
import { Parallax } from "./motion/parallax";
import { PillLink, SectionLabel } from "./ui/primitives";
import pylon from "@/public/images/about-pylon.webp";

/** Closing CTA over the pylon-in-fog photograph. */
export function ClosingCta() {
  const { closing } = HOME;
  const [l1, l2, l3] = closing.lines;
  const accent = "reliable engineering";
  const [before, after] = l3.split(accent);

  return (
    <section
      id="consultation"
      aria-labelledby="closing-title"
      className="surface-dark arc-prev relative z-10 overflow-hidden bg-carbon px-5 pt-28 md:px-10 md:pt-40"
    >
      <Parallax className="absolute inset-0" amount={12}>
        <Image
          src={pylon}
          alt="Transmission pylon fading into fog over a snowy hillside"
          fill
          sizes="100vw"
          placeholder="blur"
          className="photo object-cover object-[70%_50%]"
        />
      </Parallax>
      <div aria-hidden className="absolute inset-0 bg-carbon/75" />
      <div aria-hidden className="absolute inset-0 bg-[radial-gradient(90%_70%_at_30%_40%,transparent,rgb(18_22_10/0.6))]" />

      <div className="relative mx-auto max-w-[1600px]">
        <SectionLabel index="06">Technical consultation</SectionLabel>

        <SplitReveal
          as="h2"
          id="closing-title"
          className="font-display mt-12 text-[clamp(2.75rem,6.8vw,7.75rem)] leading-[0.98]"
        >
          <span className="block">{l1}</span> <span className="block">{l2}</span>{" "}
          <span className="block">
            {before}
            {/* keep the trailing period on the same line as the accent */}
            <span className="whitespace-nowrap">
              <em className="text-fern not-italic">{accent}</em>
              {after}
            </span>
          </span>
        </SplitReveal>

        <div className="mt-14 grid gap-12 md:mt-20 lg:grid-cols-12 lg:items-end">
          <FadeUp className="lg:col-span-7">
            <p data-stagger className="max-w-[56ch] text-lg leading-relaxed text-paper/80">
              {closing.body}
            </p>
            <div data-stagger className="mt-10 flex flex-wrap gap-3">
              <PillLink href={closing.buttons.explore.href} tone="paper" size="lg">
                {closing.buttons.explore.label}
              </PillLink>
              <PillLink href={closing.buttons.contact.href} tone="fern" size="lg" icon="up-right">
                {closing.buttons.contact.label}
              </PillLink>
            </div>
          </FadeUp>

          <FadeUp as="dl" className="text-label-md grid gap-5 lg:col-span-4 lg:col-start-9" delay={0.15}>
            <div data-stagger className="flex flex-col gap-1.5 border-t border-line pt-4">
              <dt className="text-paper/60">Email —</dt>
              <dd>
                <a href={`mailto:${SITE.email}`} className="normal-case tracking-[0.08em] hover:text-fern">
                  {SITE.email}
                </a>
              </dd>
            </div>
            <div data-stagger className="flex flex-col gap-1.5 border-t border-line pt-4">
              <dt className="text-paper/60">Call —</dt>
              <dd>
                <a href={SITE.phoneHref} className="hover:text-fern">
                  {SITE.phone}
                </a>
              </dd>
            </div>
          </FadeUp>
        </div>
      </div>
    </section>
  );
}
