import Image from "next/image";
import { FRAGMENTS, HOME, ROUTES } from "@/lib/content";
import { FadeUp, SplitReveal } from "./motion/reveal";
import { Parallax } from "./motion/parallax";
import { MonoLink, SectionLabel } from "./ui/primitives";
import softwareImg from "@/public/images/our-software.webp";

/** 01 / Our Software — light editorial split, Trident's "damage starts quietly" layout. */
export function OurSoftware() {
  const { ourSoftware } = HOME;
  return (
    <section
      id="our-software"
      aria-labelledby="our-software-title"
      className="surface-light relative bg-paper px-5 pt-24 pb-[22vh] md:px-10 md:pt-36"
    >
      <div className="mx-auto grid max-w-[1600px] gap-14 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-7 lg:pr-6">
          <SectionLabel index="01">Our Software</SectionLabel>
          <h2 id="our-software-title" className="mt-10 text-sm font-medium tracking-tight text-muted">
            {ourSoftware.title}
          </h2>

          <SplitReveal
            as="p"
            className="font-condensed text-condensed-xl mt-4 max-w-[10ch] uppercase lg:text-[clamp(4rem,9.5vw,10rem)]"
          >
            {FRAGMENTS.beginningApril}
          </SplitReveal>

          <FadeUp className="mt-10 max-w-[60ch] md:mt-14">
            <p className="text-base leading-relaxed text-muted md:text-lg">{ourSoftware.body}</p>

            <dl className="text-label mt-10 grid gap-px border-y border-line sm:grid-cols-2">
              <div className="flex flex-col gap-2 py-4 sm:pr-6">
                <dt className="text-muted">Product</dt>
                <dd className="text-fg">Fuel and Energy Security Tool (FEST)</dd>
              </div>
              <div className="flex flex-col gap-2 border-line py-4 sm:border-l sm:pl-6">
                <dt className="text-muted">Standard</dt>
                <dd className="text-fg">NERC BAL-007-1</dd>
              </div>
            </dl>

            <MonoLink href={ROUTES.fest} className="mt-8 text-carbon">
              {HOME.closing.buttons.explore.label}
            </MonoLink>
          </FadeUp>
        </div>

        <figure className="relative lg:col-span-5 lg:mt-28">
          <Parallax className="relative aspect-[3/4] overflow-hidden bg-paper-warm" amount={10}>
            <Image
              src={softwareImg}
              alt="Greyscale desk at dusk: a monitor showing source code beside a desk lamp, laptop and keyboard"
              fill
              sizes="(min-width: 1024px) 40vw, 100vw"
              placeholder="blur"
              className="photo object-cover"
            />
          </Parallax>
          <figcaption className="text-label absolute top-4 left-4 z-10 rounded-full bg-paper px-3 py-1.5 text-carbon">
            FEST
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
