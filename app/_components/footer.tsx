import Image from "next/image";
import Link from "next/link";
import { HOME, ROUTES, SITE } from "@/lib/content";
import { BigMenu } from "./big-menu";
import { ArcSurface } from "./motion/arc-surface";
import lockup from "@/public/images/logo-lockup.png";

export function Footer() {
  return (
    <footer className="surface-light arc-next relative z-10 overflow-x-clip px-5 pb-8 md:px-10">
      <ArcSurface tone="paper-warm" parallax="#consultation" />

      {/* Soft fern-tinted arc in the background */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-[38%] left-1/2 aspect-square w-[150vw] -translate-x-1/2 rounded-full bg-fern/15 md:top-[30%] md:w-[120vw]" />
      </div>

      <div className="relative mx-auto grid max-w-[1600px] gap-14 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <p className="text-label text-muted">07 / Menu</p>
          <Link href={ROUTES.home} aria-label={`${SITE.shortName} home`} className="mt-8 inline-block">
            <Image src={lockup} alt="FernGrid Energy" sizes="220px" className="h-auto w-[180px] md:w-[220px]" />
          </Link>
          {/* TODO: confirm social URLs with client */}
        </div>

        <nav aria-label="Footer" className="lg:col-span-8">
          <BigMenu />
        </nav>
      </div>

      <div className="text-label relative mx-auto mt-20 flex max-w-[1600px] flex-col gap-3 border-t border-line pt-6 text-muted md:mt-28 md:flex-row md:items-center md:gap-8">
        <a href={`mailto:${SITE.email}`} className="hover:text-carbon">
          {SITE.email}
        </a>
        <a href={SITE.phoneHref} className="hover:text-carbon">
          {SITE.phone}
        </a>
        <p className="md:ml-auto">{HOME.footer.copyright}</p>
      </div>
    </footer>
  );
}
