// Tell IndexNow engines (Bing and others) about Institute URLs.
//   node scripts/indexnow.mjs                    submit every URL in the live sitemaps
//   node scripts/indexnow.mjs <path> [path ...]  submit these paths
//   node scripts/indexnow.mjs --since YYYY-MM-DD submit live sitemap URLs whose lastmod is on or after that date
//   node scripts/indexnow.mjs --plan <file>      compare the built sitemaps in out/ with the live ones and write
//                                                new or changed URLs to <file>; submits nothing (deploy build step)
//   node scripts/indexnow.mjs --file <file>      submit the URLs listed in <file>, one per line (deploy step)
import fs from "node:fs";
import path from "node:path";

const key = "e5c0f78593e323ac9686af3a949ece7a";
const origin = "https://wellspokeninstitute.org";
function siteUrl(value) {
  const url = new URL(value, origin);
  if (url.origin !== origin) throw new Error("Expected an Institute URL");
  return url.href;
}

function parseMap(xml, address) {
  const entries = [...xml.matchAll(/<(?:url|sitemap)>([\s\S]*?)<\/(?:url|sitemap)>/g)]
    .map(m => ({ loc: m[1].match(/<loc>\s*([^<\s]+)\s*<\/loc>/)?.[1], lastmod: m[1].match(/<lastmod>([^<]+)<\/lastmod>/)?.[1] ?? "" }))
    .filter(e => e.loc)
    .map(e => ({ loc: siteUrl(e.loc.replaceAll("&amp;", "&")), lastmod: e.lastmod }));
  if (!entries.length) throw new Error(`Empty sitemap: ${address}`);
  return { index: xml.includes("<sitemapindex"), entries };
}

async function liveMap(address) {
  const res = await fetch(siteUrl(address), { signal: AbortSignal.timeout(30_000) });
  if (!res.ok) throw new Error(`Sitemap request failed (${res.status}): ${address}`);
  return parseMap(await res.text(), address);
}

function builtMap(address) {
  const file = path.join("out", new URL(siteUrl(address)).pathname);
  return parseMap(fs.readFileSync(file, "utf8"), address);
}

async function allEntries(read) {
  const root = await read("/sitemap.xml");
  if (!root.index) return root.entries;
  return (await Promise.all(root.entries.map(e => read(e.loc)))).flatMap(child => child.entries);
}

function option(args, name, check, message) {
  const at = args.indexOf(name);
  if (at < 0) return "";
  const value = args[at + 1];
  if (!value || value.startsWith("--") || !check(value)) throw new Error(message);
  args.splice(at, 2);
  return value;
}

const args = process.argv.slice(2);
const isDate = v => /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(`${v}T00:00:00Z`)) && new Date(`${v}T00:00:00Z`).toISOString().startsWith(v);
const since = option(args, "--since", isDate, "--since needs a real YYYY-MM-DD date");
const plan = option(args, "--plan", () => true, "--plan needs an output file");
const listFile = option(args, "--file", () => true, "--file needs an input file");
const unknown = args.find(a => a.startsWith("-"));
if (unknown) throw new Error(`Unknown option: ${unknown}`);
if ([since, plan, listFile, args.length ? "paths" : ""].filter(Boolean).length > 1)
  throw new Error("Use only one of --since, --plan, --file or explicit paths");

if (plan) {
  const built = await allEntries(async a => builtMap(a));
  let live = [];
  try {
    live = await allEntries(liveMap);
  } catch (e) {
    // Without the live sitemap there is nothing safe to compare against; submit nothing rather than everything.
    console.warn(`Could not read the live sitemap (${e.message}); planning no submissions.`);
    fs.writeFileSync(plan, "# IndexNow plan: live sitemap unavailable\n");
    process.exit(0);
  }
  const before = new Map(live.map(e => [e.loc, e.lastmod]));
  const changed = [...new Set(built.filter(e => !before.has(e.loc) || before.get(e.loc) !== e.lastmod).map(e => e.loc))];
  fs.writeFileSync(plan, [`# IndexNow plan ${new Date().toISOString()}`, ...changed].join("\n") + "\n");
  console.log(`Planned ${changed.length} new or changed URL(s) for IndexNow.`);
  for (const url of changed) console.log(`  ${url}`);
  process.exit(0);
}

let urls;
if (listFile) urls = fs.readFileSync(listFile, "utf8").split("\n").map(s => s.trim()).filter(s => s && !s.startsWith("#")).map(siteUrl);
else if (args.length) urls = args.map(siteUrl);
else urls = (await allEntries(liveMap)).filter(e => !since || e.lastmod.slice(0, 10) >= since).map(e => e.loc);
urls = [...new Set(urls)];
if (!urls.length) {
  console.log("No URLs to submit.");
  process.exit(0);
}
const res = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify({ host: new URL(origin).host, key, keyLocation: `${origin}/${key}.txt`, urlList: urls }),
  signal: AbortSignal.timeout(60_000),
});
if (!res.ok) throw new Error(`IndexNow rejected submission (HTTP ${res.status})`);
console.log(`IndexNow accepted ${urls.length} URLs (HTTP ${res.status}).`);
