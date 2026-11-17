import type { Metadata } from "next";
import { NERC } from "@/lib/content";
import { NercHero } from "../_components/nerc/nerc-hero";
import { RequirementsStory } from "../_components/nerc/requirements-story";
import { CapacityEnergy } from "../_components/capacity-energy";
import { EraScene } from "../_components/era/era-scene";
import { FestEraStory } from "../_components/nerc/fest-era-story";
import { Footer } from "../_components/footer";

export const metadata: Metadata = {
  title: NERC.title,
  description: NERC.requirements.intro.replace(/ that account for:?$/, "."),
};

export default function NercPage() {
  return (
    <>
      <main id="main" className="overflow-x-clip">
        <NercHero />
        <RequirementsStory />
        <CapacityEnergy />
        <EraScene />
        <FestEraStory />
      </main>
      <Footer stackOver="[data-fe-inner]" />
    </>
  );
}
