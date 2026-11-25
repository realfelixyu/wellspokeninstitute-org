// Post-build checks on the static export in out/.
import fs from "node:fs";
import path from "node:path";

const OUT = path.join(process.cwd(), "out");
const BANNED = [/G-RVPTD7M4HC/, /posthog/i, /Mia Torres/, /Daniel Park/, /Margaret Whitaker/, /Robert Caldwell/, /wellspoken\.me/i];
const PRODUCT_OK_PAGES = new Set(["about.html", "disclosures.html"]);
const errors = [];

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) => {
    const p = path.join(dir, d.name);
    return d.isDirectory() ? walk(p) : [p];
  });
}

// Keep the original public PDF links and place an identical copy beside each live paper for Scholar.
for (const file of fs.readdirSync(path.join(OUT, "papers")).filter(name => name.endsWith(".pdf"))) {
  const researchDir = path.join(OUT, "research");
  if (fs.existsSync(path.join(researchDir, file.replace(/\.pdf$/, ".html")))) {
    fs.copyFileSync(path.join(OUT, "papers", file), path.join(researchDir, file));
  }
}

for (const f of walk(OUT)) {
  if (f.includes("__placeholder")) {
    fs.rmSync(f, { force: true });
    continue;
  }
  if (!/\.(?:html|js|txt|xml|json)$/i.test(f)) continue;
  const rel = path.relative(OUT, f);
  const html = fs.readFileSync(f, "utf8");
  for (const re of BANNED) if (re.test(html)) errors.push(`${rel}: contains banned pattern ${re}`);
  if (f.endsWith(".html") && !PRODUCT_OK_PAGES.has(rel)) {
    const visible = html
      .replace(/<script[\s\S]*?<\/script>/g, "")
      .replace(/Data: <\/span>[^<]*/g, "")
      .replace(/<[^>]+>/g, " ");
    const m = visible.match(/Wellspoken(?!\s+Institute)/g);
    if (m) errors.push(`${rel}: ${m.length} product mention(s) outside allowed places`);
  }
}

for (const d of fs.readdirSync(OUT, { withFileTypes: true })) {
  if (d.isDirectory()) {
    const p = path.join(OUT, d.name);
    for (const sub of fs.readdirSync(p)) if (sub.startsWith("__placeholder")) fs.rmSync(path.join(p, sub), { recursive: true, force: true });
  }
}

if (errors.length) {
  errors.forEach((e) => console.error(`error ${e}`));
  process.exit(1);
}
console.log("Output checks passed.");
