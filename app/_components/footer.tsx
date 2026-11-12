import Image from "next/image";
import Link from "next/link";
import { HOME, ROUTES, SITE } from "@/lib/content";
import { BigMenu } from "./big-menu";
import { FooterFill } from "./footer-fill";
import { ArcSurface } from "./motion/arc-surface";
import lockup from "@/public/images/logo-lockup.png";

/**
 * Footer: exactly one screen tall below its arc, so the whole thing is visible
 * at the end of the page. A fern wash fills it as you scroll in.
 */
export function Footer() {
  return (
    <footer
      className="surface-light arc-next relative z-10 flex h-[calc(100svh+var(--arc-depth))] flex-col overflow-x-clip px-5 pb-6 md:px-10 md:pb-8"
      // clear the fixed nav bar (overrides arc-next's shorter top padding)
      style={{ paddingTop: "calc(var(--arc-depth) + clamp(5.5rem, 12svh, 7.5rem))" }}
    >
      <ArcSurface tone="paper-warm" parallax="#consultation" />
      <FooterFill />

      <div className="relative mx-auto grid min-h-0 w-full max-w-[1600px] flex-1 content-start gap-8 lg:grid-cols-12 lg:gap-14">
        <div className="lg:col-span-4">
          <Link href={ROUTES.home} aria-label={`${SITE.shortName} home`} className="inline-block">
            <Image
              src={lockup}
              alt="FernGrid Energy"
              sizes="220px"
              className="h-auto w-[min(150px,18svh)] md:w-[min(220px,22svh)]"
            />
          </Link>
          {/* TODO: confirm social URLs with client */}
        </div>

        <nav aria-label="Footer" className="lg:col-span-8">
          <BigMenu fit />
        </nav>
      </div>

      <div className="text-label relative mx-auto mt-6 flex w-full max-w-[1600px] flex-col gap-2 border-t border-line pt-5 text-muted md:flex-row md:items-center md:gap-8">
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
