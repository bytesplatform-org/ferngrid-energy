import type { Metadata } from "next";
import { NERC } from "@/lib/content";
import { NercHero } from "../_components/nerc/nerc-hero";
import { RequirementsStory } from "../_components/nerc/requirements-story";
import { HourlyStory } from "../_components/nerc/hourly-story";
import { FestEraStory } from "../_components/nerc/fest-era-story";
import { ClosingCta } from "../_components/closing-cta";
import { Footer } from "../_components/footer";

export const metadata: Metadata = {
  title: NERC.title,
  description: NERC.requirements.intro.replace(/ that account for:$/, "."),
};

export default function NercPage() {
  return (
    <>
      <main id="main" className="overflow-x-clip">
        <NercHero />
        <RequirementsStory />
        <HourlyStory />
        <FestEraStory />
        <ClosingCta stackOver="[data-fe-inner]" />
      </main>
      <Footer />
    </>
  );
}
