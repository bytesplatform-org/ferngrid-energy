import type { Metadata } from "next";
import { SITE } from "@/lib/content";
import { Hero } from "./_components/hero/hero";
import { Statement } from "./_components/statement";
import { OurSoftware } from "./_components/our-software";
import { CapacityEnergy } from "./_components/capacity-energy";
import { EraScene } from "./_components/era/era-scene";
import { ServicesTraining } from "./_components/services-training";
import { Marquee } from "./_components/marquee";
import { ClosingCta } from "./_components/closing-cta";
import { Footer } from "./_components/footer";

export const metadata: Metadata = {
  title: { absolute: `Home | ${SITE.name}` },
};

export default function HomePage() {
  return (
    <>
      <main id="main" className="overflow-x-clip">
        <Hero />
        <Statement />
        <OurSoftware />
        <CapacityEnergy />
        <EraScene />
        <ServicesTraining />
        <Marquee />
        <ClosingCta />
      </main>
      <Footer />
    </>
  );
}
