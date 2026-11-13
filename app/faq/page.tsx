import type { Metadata } from "next";
import { FAQ } from "@/lib/content";
import { FaqHero } from "../_components/faq/faq-hero";
import { FaqList } from "../_components/faq/faq-list";
import { ClosingCta } from "../_components/closing-cta";
import { Footer } from "../_components/footer";

export const metadata: Metadata = {
  title: "FAQ",
  // verbatim: the first answer on the page
  description: (FAQ.categories[0].items[0].a[0] as { parts: readonly string[] }).parts[0],
};

export default function FaqPage() {
  return (
    <>
      <main id="main" className="overflow-x-clip">
        <FaqHero />
        <FaqList />
        <ClosingCta />
      </main>
      <Footer />
    </>
  );
}
