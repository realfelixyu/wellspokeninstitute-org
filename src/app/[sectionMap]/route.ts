import { sections, sitemapName, sectionSitemap } from "@/lib/sitemaps";

export const dynamic = "force-static";
export const dynamicParams = false;
export function generateStaticParams() {
  return sections.map(section => ({ sectionMap: sitemapName(section) }));
}
export async function GET(_request: Request, ctx: { params: Promise<{ sectionMap: string }> }) {
  const { sectionMap } = await ctx.params;
  const key = sections.find(s => sitemapName(s) === sectionMap);
  return key ? sectionSitemap(key) : new Response(null, { status: 404 });
}
