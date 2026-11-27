import { SITE } from "@/data/site";
import { lessons } from "@/data/curriculum";
import { TOOLS } from "@/data/tools";
import { getEntries, type Collection } from "@/lib/content";

const collections: Collection[] = ["research", "statistics", "professions", "learn"];
export const sections = ["institute", ...collections, "tools"] as const;
export const sitemapName = (section: string) => `sitemap-${section}.xml`;

export function urlsForSection(section: string): { path: string; modified?: string }[] {
  if (section === "institute") {
    return ["/", "/data/speaking-by-occupation", "/data/speaking-demand-over-time", "/curriculum", ...lessons.map(lesson => `/curriculum/worksheets/${lesson.id}`), "/about", "/mission", "/governance", "/disclosures", "/editorial-policy", "/newsletter", "/contact", "/privacy"].map(path => ({ path }));
  }
  if (section === "tools") {
    return ["/tools", ...TOOLS.map(tool => `/tools/${tool.slug}`)].map(path => ({ path }));
  }
  const collection = collections.find(name => name === section);
  if (!collection) return [];
  return [
    { path: `/${collection}` },
    ...(collection === "research" ? [{ path: "/research/agenda" }] : []),
    ...getEntries(collection).map(({ meta }) => ({ path: `/${collection}/${meta.slug}`, modified: meta.updatedAt ?? meta.publishedAt })),
  ];
}

function xml(root: string, entries: string[]) {
  return new Response(`<?xml version="1.0" encoding="UTF-8"?>\n<${root} xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join("\n")}\n</${root}>\n`, { headers: { "Content-Type": "application/xml; charset=utf-8" } });
}

export function sitemapIndex() {
  return xml("sitemapindex", sections.map(key => `<sitemap><loc>${SITE.url}/${sitemapName(key)}</loc></sitemap>`));
}

export function sectionSitemap(key: string) {
  return xml("urlset", urlsForSection(key).map(entry => `<url><loc>${SITE.url}${entry.path}</loc>${entry.modified ? `<lastmod>${entry.modified}</lastmod>` : ""}</url>`));
}
