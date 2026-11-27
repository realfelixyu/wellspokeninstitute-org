// Run after the production deployment completes: node scripts/indexnow.mjs [path ...]
// --since YYYY-MM-DD submits only sitemap entries whose lastmod is on or after that date (used by the daily deploy).
const key = "e5c0f78593e323ac9686af3a949ece7a";
const origin = "https://wellspokeninstitute.org";
function siteUrl(value) {
  const url = new URL(value, origin);
  if (url.origin !== origin) throw new Error("Expected an Institute URL");
  return url.href;
}

async function readMap(address) {
  const res = await fetch(siteUrl(address));
  if (!res.ok) throw new Error(`Sitemap request failed (${res.status}): ${address}`);
  const xml = await res.text();
  const entries = [...xml.matchAll(/<(?:url|sitemap)>([\s\S]*?)<\/(?:url|sitemap)>/g)].map(m => ({
    loc: siteUrl(m[1].match(/<loc>([^<]+)<\/loc>/)[1].replaceAll("&amp;", "&")),
    lastmod: m[1].match(/<lastmod>([^<]+)<\/lastmod>/)?.[1] ?? "",
  }));
  if (!entries.length) throw new Error(`Empty sitemap: ${address}`);
  return { index: xml.includes("<sitemapindex"), entries };
}

const args = process.argv.slice(2);
const sinceAt = args.indexOf("--since");
const since = sinceAt >= 0 ? args.splice(sinceAt, 2)[1] : "";
if (sinceAt >= 0 && !/^\d{4}-\d{2}-\d{2}$/.test(since ?? "")) throw new Error("--since needs a YYYY-MM-DD date");
const paths = args;
let urls;
if (paths.length) urls = paths.map(siteUrl);
else {
  const root = await readMap("/sitemap.xml");
  const entries = root.index ? (await Promise.all(root.entries.map(e => readMap(e.loc)))).flatMap(child => child.entries) : root.entries;
  urls = entries.filter(e => !since || e.lastmod.slice(0, 10) >= since).map(e => e.loc);
}
urls = [...new Set(urls)];
if (!urls.length) {
  console.log(since ? `No sitemap URLs changed since ${since}; nothing to submit.` : "No URLs to submit.");
  process.exit(0);
}
const res = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify({ host: new URL(origin).host, key, keyLocation: `${origin}/${key}.txt`, urlList: urls }),
});
if (!res.ok) throw new Error(`IndexNow rejected submission (HTTP ${res.status})`);
console.log(`IndexNow accepted ${urls.length} URLs (HTTP ${res.status}).`);
