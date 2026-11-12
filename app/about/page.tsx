import type { Metadata } from "next";
import { ABOUT } from "@/lib/content";
import { AboutHero } from "../_components/about/about-hero";
import { ExpertiseStory } from "../_components/about/expertise-story";
import { TrustStory } from "../_components/about/trust-story";
import { ClosingCta } from "../_components/closing-cta";
import { Footer } from "../_components/footer";

export const metadata: Metadata = {
  title: "About",
  description: `${ABOUT.expertise.paragraphs[0].split(". ")[0]}.`,
};

export default function AboutPage() {
  return (
    <>
      <main id="main" className="overflow-x-clip">
        <AboutHero />
        <ExpertiseStory />
        <TrustStory />
        <ClosingCta />
      </main>
      <Footer />
    </>
  );
}
