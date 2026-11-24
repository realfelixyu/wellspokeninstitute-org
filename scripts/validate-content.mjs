// Content quality gate. Fails the build on:
// - missing or invalid frontmatter
// - citations missing from content/citations.json, unverified, or unused/undeclared <Cite> keys
// - too few sources for the content kind
// - em dashes in body text
// - product mentions ("Wellspoken" not followed by "Institute") outside the dataSource field
// - near-duplicate bodies across entries (5-word shingle Jaccard similarity)
// - invented bylines (contributors must exist in src/data/site.ts PEOPLE)

import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const ROOT = process.cwd();
const COLLECTIONS = ["research", "learn", "professions", "statistics"];
const KINDS = new Set(["paper", "study", "brief", "article", "profession", "statistics"]);
const MIN_SOURCES = { paper: 10, study: 3, brief: 3, article: 5, profession: 3, statistics: 8 };
const PEOPLE = new Set(["felix-yu", "linfeng-du"]);
const DUP_THRESHOLD = 0.22;
const today = new Date().toISOString().slice(0, 10);

const errors = [];
const registry = {};
{
  const dir = path.join(ROOT, "content", "citations");
  for (const f of fs.readdirSync(dir).filter((x) => x.endsWith(".json")).sort()) {
    let obj;
    try {
      obj = JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"));
    } catch (e) {
      errors.push(`content/citations/${f}: invalid JSON (${e.message})`);
      continue;
    }
    for (const [k, v] of Object.entries(obj)) {
      if (registry[k]) errors.push(`content/citations/${f}: duplicate citation key "${k}"`);
      registry[k] = v;
    }
  }
}
const warnings = [];
const bodies = [];

function err(file, msg) {
  errors.push(`${file}: ${msg}`);
}

function stripCode(s) {
  return s.replace(/```[\s\S]*?```/g, "");
}

function shingles(text) {
  const w = text
    .toLowerCase()
    .replace(/<[^>]+>/g, " ")
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
  const set = new Set();
  for (let i = 0; i + 5 <= w.length; i++) set.add(w.slice(i, i + 5).join(" "));
  return set;
}

for (const col of COLLECTIONS) {
  const dir = path.join(ROOT, "content", col);
  if (!fs.existsSync(dir)) continue;
  for (const f of fs.readdirSync(dir)) {
    if (!f.endsWith(".mdx")) continue;
    const rel = `content/${col}/${f}`;
    if (!/^[a-z0-9][a-z0-9-]*\.mdx$/.test(f)) {
      err(rel, "filename must be lowercase kebab-case .mdx");
      continue;
    }
    const raw = fs.readFileSync(path.join(dir, f), "utf8");
    let parsed;
    try {
      parsed = matter(raw);
    } catch (e) {
      err(rel, `frontmatter parse error: ${e.message}`);
      continue;
    }
    const { data, content } = parsed;
    const published = data.status === "published";
    const pub = data.publishedAt instanceof Date ? data.publishedAt.toISOString().slice(0, 10) : String(data.publishedAt ?? "");

    for (const k of ["title", "description", "kind", "publishedAt", "status"]) {
      if (!data[k]) err(rel, `missing frontmatter field "${k}"`);
    }
    if (data.kind && !KINDS.has(data.kind)) err(rel, `unknown kind "${data.kind}"`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(pub)) err(rel, `publishedAt must be YYYY-MM-DD, got "${pub}"`);
    // Future publishedAt = scheduled: the daily rebuild publishes it on that date.
    if (data.description && String(data.description).length > 320) err(rel, "description over 320 characters");
    if (data.title && String(data.title).length > 110) err(rel, "title over 110 characters");

    for (const c of data.contributors ?? []) if (!PEOPLE.has(c)) err(rel, `unknown contributor "${c}" (real people only)`);

    const declared = Array.isArray(data.citations) ? data.citations : [];
    const used = new Set();
    for (const m of content.matchAll(/<Cite\s+k="([^"]+)"\s*\/>/g)) m[1].split(",").forEach((k) => used.add(k.trim()));
    for (const m of content.matchAll(/<KeyStat[^>]*\sk="([^"]+)"/g)) m[1].split(",").forEach((k) => used.add(k.trim()));
    for (const k of used) if (!declared.includes(k)) err(rel, `<Cite k="${k}"> not listed in frontmatter citations`);
    for (const k of declared) {
      if (!used.has(k)) warnings.push(`${rel}: citation "${k}" declared but never cited inline`);
      const c = registry[k];
      if (!c) err(rel, `citation "${k}" missing from content/citations.json`);
      else if (published && !c.verified) err(rel, `citation "${k}" is not verified (run node scripts/verify-citations.mjs --file <file>)`);
    }
    const min = MIN_SOURCES[data.kind] ?? 3;
    if (published && declared.length < min) err(rel, `${data.kind} needs at least ${min} sources, has ${declared.length}`);

    const body = stripCode(content);
    if (/—/.test(body) || /—/.test(String(data.title ?? "")) || /—/.test(String(data.description ?? ""))) {
      err(rel, "contains an em dash");
    }
    const productMentions = (body + " " + (data.title ?? "") + " " + (data.description ?? "")).match(/Wellspoken(?!\s+Institute)/g);
    if (productMentions) err(rel, `mentions "Wellspoken" outside the dataSource field (${productMentions.length}x)`);
    if (/\b(app store|download (the|our) app|free trial|sign up for)\b/i.test(body)) err(rel, "contains product call-to-action language");

    if (published) bodies.push({ rel, sh: shingles(body) });
  }
}

for (let i = 0; i < bodies.length; i++) {
  for (let j = i + 1; j < bodies.length; j++) {
    const a = bodies[i].sh;
    const b = bodies[j].sh;
    if (!a.size || !b.size) continue;
    let inter = 0;
    for (const s of a) if (b.has(s)) inter++;
    const jac = inter / (a.size + b.size - inter);
    if (jac > DUP_THRESHOLD) err(bodies[i].rel, `near-duplicate of ${bodies[j].rel} (similarity ${jac.toFixed(2)})`);
  }
}

for (const w of warnings) console.warn(`warn  ${w}`);
if (errors.length) {
  for (const e of errors) console.error(`error ${e}`);
  console.error(`\nContent validation failed with ${errors.length} error(s).`);
  process.exit(1);
}
console.log(`Content validation passed (${bodies.length} published entries, ${warnings.length} warnings).`);
