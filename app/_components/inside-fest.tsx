import { FRAGMENTS, NERC } from "@/lib/content";
import { ArcTop } from "./motion/arc-top";
import { FadeUp, SplitReveal } from "./motion/reveal";
import { FestModel } from "./fest-model";
import { SectionLabel } from "./ui/primitives";

/** 04 / Inside FEST — the FEST data model, rebuilt. */
export function InsideFest() {
  return (
    <section
      id="inside-fest"
      aria-labelledby="inside-fest-title"
      className="surface-light relative z-10 bg-paper px-5 pt-20 pb-28 md:px-10 md:pt-28 md:pb-40"
    >
      <ArcTop className="bg-paper" />
      <div className="mx-auto max-w-[1400px]">
        <SectionLabel index="04">Inside FEST</SectionLabel>

        <div className="mt-10 grid gap-10 lg:grid-cols-12 lg:items-end">
          <SplitReveal
            as="h2"
            id="inside-fest-title"
            className="font-condensed text-condensed-xl uppercase lg:col-span-7"
          >
            {FRAGMENTS.festName}
          </SplitReveal>
          <FadeUp className="lg:col-span-5">
            <p className="text-base leading-relaxed text-muted md:text-lg">{NERC.festAndEra.body}</p>
          </FadeUp>
        </div>

        <div className="mt-16 md:mt-24">
          <FestModel />
        </div>
        <p className="text-label mt-8 text-muted">FEST data model</p>
      </div>
    </section>
  );
}
