// Check the actual static artifacts. Resolve clean URLs exactly as Pages does.
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { parse } = require("next/dist/compiled/node-html-parser");
const root = path.resolve(process.argv[2] ?? "out");
const origin = "https://wellspokeninstitute.org";
const errors = new Set();
const ids = new Map();
const links = [];
function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const file = path.join(dir,entry.name);
    return entry.isDirectory() ? walk(file) : [file];
  });
}
const files = walk(root);
const paths = new Set(files.map(file => "/" + path.relative(root,file)));
for (const name of paths) {
  if (!name.endsWith(".html")) continue;
  const tree = parse(fs.readFileSync(path.join(root,name), "utf8"));
  ids.set(name,new Set(tree.querySelectorAll("[id],a[name]").map(el => el.getAttribute("id") ?? el.getAttribute("name"))));
  const base = name.replace(/\/index\.html$/, "/").replace(/\.html$/, "");
  for (const el of tree.querySelectorAll("[href],[src]")) {
    const href = el.getAttribute("href") ?? el.getAttribute("src");
    if (href) links.push({ name, base, href });
  }
}
for (const name of paths) {
  if (!name.endsWith(".xml") || !name.includes("sitemap")) continue;
  const xml = fs.readFileSync(path.join(root,name),"utf8");
  for (const m of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) links.push({name, base:name, href:m[1].replaceAll("&amp;","&")});
}
for (const { name, base, href } of links) {
  try {
    const url = new URL(href,origin + base);
    if (url.origin !== origin) continue;
    const pathname = decodeURIComponent(url.pathname);
    // Pages serves "/x/" only from x/index.html; "/x" from x, x.html or x/index.html.
    const candidates = pathname.endsWith("/") ? [pathname + "index.html"] : [pathname, pathname + ".html", pathname + "/index.html"];
    const dest = candidates.find(p => paths.has(p));
    if (!dest) errors.add(name + " links to missing " + href);
    else if (url.hash.length > 1 && ids.has(dest) && !url.hash.startsWith("#:~:") &&
      !ids.get(dest).has(decodeURIComponent(url.hash.slice(1)))) errors.add(name + " links to missing anchor " + href);
  } catch { errors.add(name + " has invalid URL " + href); }
}
if (errors.size) { for (const error of errors) console.error(error); process.exitCode = 1; }
else console.log("Internal links and fragments passed on " + ids.size + " HTML files.");
