import type { Metadata, Viewport } from "next";
import { Dosis, Geist_Mono, Inter } from "next/font/google";
import { HOME, SITE } from "@/lib/content";
import { Cursor } from "./_components/cursor";
import { Loader } from "./_components/loader";
import { Nav } from "./_components/nav";
import { SmoothScroll } from "./_components/motion/smooth-scroll";
import "./globals.css";

const dosis = Dosis({
  variable: "--font-dosis",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

/** First sentence of the Our Software paragraph. */
const DESCRIPTION = `${HOME.ourSoftware.body.split(". ")[0]}.`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `Home | ${SITE.name}`,
    template: `%s | ${SITE.name}`,
  },
  description: DESCRIPTION,
  openGraph: {
    type: "website",
    siteName: SITE.name,
    title: `Home | ${SITE.name}`,
    description: DESCRIPTION,
    images: [{ url: "/images/og.jpg", width: 1200, height: 630, alt: "Wind turbines along a snow-covered ridge" }],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/images/og.jpg"],
  },
};

export const viewport: Viewport = {
  themeColor: "#1d220f",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${dosis.variable} ${inter.variable} ${geistMono.variable} antialiased`}
    >
      <head>
        {/*
          Before first paint: mark JS as available, lock scrolling while the loader
          covers the page (released by the loader; failsafe after 11s), and stop the
          browser restoring the previous scroll position on reload.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(){var d=document.documentElement;d.classList.add('js','is-loading');setTimeout(function(){d.classList.remove('is-loading')},11000);if('scrollRestoration' in history)history.scrollRestoration='manual'})();",
          }}
        />
      </head>
      {/* suppressHydrationWarning: browser extensions (e.g. ColorZilla) inject attributes on <body> */}
      <body suppressHydrationWarning>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[70] focus:rounded-full focus:bg-paper focus:px-4 focus:py-2 focus:text-sm focus:text-carbon"
        >
          Skip to content
        </a>
        <SmoothScroll />
        <Nav />
        {children}
        <Cursor />
        <Loader />
      </body>
    </html>
  );
}
