import type { Metadata } from "next";
import { FEST_PAGE, NERC } from "@/lib/content";
import { FestHero } from "../_components/fest/fest-hero";
import { ModelSection } from "../_components/fest/model-section";
import { PackagesStory } from "../_components/fest/packages-story";
import { Footer } from "../_components/footer";

export const metadata: Metadata = {
  title: FEST_PAGE.acronym,
  description: `${FEST_PAGE.title} (${FEST_PAGE.acronym}). ${NERC.festAndEra.body.split(". ")[0]}.`,
};

export default function FestPage() {
  return (
    <>
      <main id="main" className="overflow-x-clip">
        <FestHero />
        <ModelSection />
        <PackagesStory />
      </main>
      <Footer stackOver="[data-pk-inner]" hideExplore />
    </>
  );
}
