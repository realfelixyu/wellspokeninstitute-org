import type { MetadataRoute } from "next";
import { SITE } from "@/data/site";
import { getAllLive } from "@/lib/content";
import { TOOLS } from "@/data/tools";

export const dynamic = "force-static";

const STATIC_PATHS = [
  "/",
  "/research",
  "/research/agenda",
  "/data/speaking-by-occupation",
  "/professions",
  "/statistics",
  "/learn",
  "/tools",
  "/about",
  "/mission",
  "/governance",
  "/disclosures",
  "/editorial-policy",
  "/newsletter",
  "/contact",
  "/privacy",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const today = new Date().toISOString().slice(0, 10);
  const entries = getAllLive().map((e) => ({
    url: `${SITE.url}/${e.meta.collection}/${e.meta.slug}`,
    lastModified: e.meta.updatedAt ?? e.meta.publishedAt,
  }));
  return [
    ...STATIC_PATHS.map((p) => ({ url: `${SITE.url}${p === "/" ? "" : p}`, lastModified: today })),
    ...TOOLS.map((t) => ({ url: `${SITE.url}/tools/${t.slug}`, lastModified: today })),
    ...entries,
  ];
}
