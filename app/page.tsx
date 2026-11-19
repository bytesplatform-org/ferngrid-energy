import type { Metadata } from "next";
import { SITE } from "@/lib/content";
import { Hero } from "./_components/hero/hero";
import { TriadIntro } from "./_components/triad-intro";
import { OurSoftware } from "./_components/our-software";
import { AtAGlance } from "./_components/at-a-glance";
import { HourlyStory } from "./_components/nerc/hourly-story";
import { ServicesTraining } from "./_components/services-training";
import { Footer } from "./_components/footer";

export const metadata: Metadata = {
  title: { absolute: `Home | ${SITE.name}` },
};

export default function HomePage() {
  return (
    <>
      <main id="main" className="overflow-x-clip">
        <Hero />
        <TriadIntro />
        <OurSoftware />
        <AtAGlance />
        <HourlyStory />
        <ServicesTraining />
      </main>
      <Footer stackOver="[data-svc-inner]" />
    </>
  );
}
