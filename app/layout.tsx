import type { Metadata, Viewport } from "next";
import { Dosis, Geist_Mono, Inter } from "next/font/google";
import { HOME, SITE } from "@/lib/content";
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
    images: [{ url: "/hero/end.jpg", width: 1280, height: 568, alt: "Wind turbines above a cloud-filled valley" }],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/hero/end.jpg"],
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
        {/* Marks JS as available before first paint so motion-only states never hide content without JS. */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
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
      </body>
    </html>
  );
}
