// Run after the production deployment completes: node scripts/indexnow.mjs [path ...]
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
  const locations = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => siteUrl(m[1].replaceAll("&amp;", "&")));
  if (!locations.length) throw new Error(`Empty sitemap: ${address}`);
  return { index: xml.includes("<sitemapindex"), locations };
}

const paths = process.argv.slice(2);
let urls;
if (paths.length) urls = paths.map(siteUrl);
else {
  const root = await readMap("/sitemap.xml");
  urls = root.index ? (await Promise.all(root.locations.map(readMap))).flatMap(child => child.locations) : root.locations;
}
urls = [...new Set(urls)];
const res = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify({ host: new URL(origin).host, key, keyLocation: `${origin}/${key}.txt`, urlList: urls }),
});
if (!res.ok) throw new Error(`IndexNow rejected submission (HTTP ${res.status})`);
console.log(`IndexNow accepted ${urls.length} URLs (HTTP ${res.status}).`);
