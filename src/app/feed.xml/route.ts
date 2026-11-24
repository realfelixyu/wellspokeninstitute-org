import { SITE } from "@/data/site";
import { getAllLive } from "@/lib/content";

export const dynamic = "force-static";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export function GET() {
  const items = getAllLive()
    .sort((a, b) => b.meta.publishedAt.localeCompare(a.meta.publishedAt))
    .slice(0, 50)
    .map((e) => {
      const url = `${SITE.url}/${e.meta.collection}/${e.meta.slug}`;
      return `<item><title>${esc(e.meta.title)}</title><link>${url}</link><guid>${url}</guid><pubDate>${new Date(`${e.meta.publishedAt}T12:00:00Z`).toUTCString()}</pubDate><description>${esc(e.meta.description)}</description></item>`;
    })
    .join("");
  const xml = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>${esc(SITE.name)}</title><link>${SITE.url}</link><description>${esc(SITE.description)}</description><language>en-us</language>${items}</channel></rss>`;
  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
}
