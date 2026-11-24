// Submits sitemap URLs to IndexNow (Bing, Yandex, Seznam, Naver). Usage: node scripts/indexnow.mjs [path ...]
const KEY = "e5c0f78593e323ac9686af3a949ece7a";
const HOST = "wellspokeninstitute.org";
const args = process.argv.slice(2);
let urls;
if (args.length) urls = args.map((p) => `https://${HOST}${p.startsWith("/") ? p : "/" + p}`);
else {
  const xml = await (await fetch(`https://${HOST}/sitemap.xml`)).text();
  urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
}
const res = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify({ host: HOST, key: KEY, keyLocation: `https://${HOST}/${KEY}.txt`, urlList: urls }),
});
console.log(`IndexNow: ${res.status} for ${urls.length} URLs`);
