import { readdirSync } from "node:fs";
import { join } from "node:path";
import type { MetadataRoute } from "next";
import { SITE } from "@/lib/content";

/**
 * Served at /sitemap.xml. Built from the `app` directory itself: every folder
 * holding a `page.tsx` becomes a URL, so a new page is listed without editing
 * this file. Rendered once at build time.
 *
 * Skipped: private folders (`_components`), parallel-route slots (`@modal`),
 * intercepted routes (`(.)photo`), and dynamic segments (`[slug]`), which have
 * no single URL; list a dynamic route's URLs in EXTRA_URLS. Route groups
 * (`(marketing)`) are walked into but add nothing to the path.
 */

/** Routes that have a page but should stay out of the sitemap, e.g. "/thank-you". */
const EXCLUDE = new Set<string>([]);

/** URLs the folder scan can't find, such as the pages of a dynamic route. */
const EXTRA_URLS: string[] = [];

const PAGE_FILE = /^page\.(tsx|ts|jsx|js|mdx|md)$/;

function findRoutes(dir: string, route: string): string[] {
  const entries = readdirSync(dir, { withFileTypes: true });
  const routes = entries.some((e) => e.isFile() && PAGE_FILE.test(e.name)) ? [route || "/"] : [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const name = entry.name;
    if (/^[_@[]/.test(name) || name.startsWith("(.")) continue;
    const isGroup = name.startsWith("(") && name.endsWith(")");
    routes.push(...findRoutes(join(dir, name), isGroup ? route : `${route}/${name}`));
  }
  return routes;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = findRoutes(join(process.cwd(), "app"), "")
    .filter((route) => !EXCLUDE.has(route))
    .concat(EXTRA_URLS);

  return [...new Set(routes)]
    .sort((a, b) => (a === "/" ? -1 : b === "/" ? 1 : a.localeCompare(b)))
    .map((route) => ({
      url: route === "/" ? SITE.url : `${SITE.url}${route}`,
      changeFrequency: "monthly",
      priority: route === "/" ? 1 : 0.8,
    }));
}
