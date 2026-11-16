import type { Metadata } from "next";
import { CONTACT } from "@/lib/content";
import { ContactHero } from "../_components/contact/contact-hero";
import { ContactForm } from "../_components/contact/contact-form";
import { Footer } from "../_components/footer";

export const metadata: Metadata = {
  title: "Contact",
  description: CONTACT.intro,
};

/** Hero, the form, then the site footer. */
export default function ContactPage() {
  return (
    <>
      <main id="main" className="overflow-x-clip">
        <ContactHero />
        <ContactForm />
      </main>
      <Footer />
    </>
  );
}
