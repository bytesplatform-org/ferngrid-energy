import { FRAGMENTS, HOME } from "@/lib/content";
import { ArcSurface } from "./motion/arc-surface";
import { FadeUp } from "./motion/reveal";
import { ImageStrip } from "./image-strip";
import { SectionLabel } from "./ui/primitives";

function Chips({ items, arrows }: { items: readonly string[]; arrows?: boolean }) {
  return (
    <ul className="mt-6 flex flex-wrap items-center gap-2">
      {items.map((it, i) => (
        <li key={it} data-stagger className="flex items-center gap-2">
          <span className="text-label rounded-full px-3 py-1.5 text-paper ring-1 ring-paper/20">{it}</span>
          {arrows && i < items.length - 1 && (
            <span aria-hidden className="text-label text-fern">
              →
            </span>
          )}
        </li>
      ))}
    </ul>
  );
}

/** 05 / Services & Training — "not a product, not just a service" layout. */
export function ServicesTraining() {
  const rows = [
    { id: "our-services", n: "01", ...HOME.ourServices, chips: <Chips items={FRAGMENTS.serviceSteps} arrows /> },
    { id: "training-services", n: "02", ...HOME.trainingServices, chips: <Chips items={FRAGMENTS.trainingOfferings} /> },
  ];

  return (
    <section
      aria-labelledby="services-title"
      className="surface-dark arc-next relative z-10 px-5 pb-24 md:px-10 md:pb-32"
    >
      <ArcSurface tone="carbon-deep" parallax="#inside-fest" />
      <div className="mx-auto max-w-[1600px]">
        <SectionLabel index="05">Services &amp; Training</SectionLabel>

        <div className="mt-12 grid gap-16 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-28">
              <FadeUp as="h2" id="services-title" className="font-condensed text-condensed-xl uppercase">
                <span data-stagger className="block">
                  Software.
                </span>{" "}
                <span data-stagger className="block text-paper/35">
                  Services.
                </span>{" "}
                <span data-stagger className="block">
                  Training.
                </span>
              </FadeUp>
            </div>
          </div>

          <ol className="border-t border-line lg:col-span-7">
            {rows.map((r) => (
              <li key={r.id} id={r.id} className="scroll-mt-24 border-b border-line">
                <FadeUp className="grid gap-4 py-10 md:grid-cols-[4rem_1fr] md:py-14" start="top 80%">
                  <span data-stagger className="text-label pt-2 text-fern">
                    {r.n}
                  </span>
                  <div>
                    <h3 data-stagger className="text-2xl font-medium tracking-tight md:text-3xl">
                      {r.title}
                    </h3>
                    <p data-stagger className="mt-4 max-w-[60ch] text-base leading-relaxed text-muted md:text-lg">
                      {r.body}
                    </p>
                    {r.chips}
                  </div>
                </FadeUp>
              </li>
            ))}
          </ol>
        </div>
      </div>

      <div className="mx-auto mt-20 max-w-[1600px] md:mt-28">
        <ImageStrip />
      </div>
    </section>
  );
}
