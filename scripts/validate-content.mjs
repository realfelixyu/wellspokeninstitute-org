// Content quality gate. Fails the build on:
// - missing or invalid frontmatter
// - citations missing from the citation registry, unverified, or unused/undeclared <Cite> keys
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
const MIN_SOURCES = { paper: 10, study: 5, brief: 5, article: 5, profession: 5, statistics: 8 };
const PEOPLE = new Set(["felix-yu", "linfeng-du"]);
const APPROVED_REVIEWERS = new Set(); // Add named external reviewers only after their review is accepted.
const DUP_THRESHOLD = 0.22;
const today = new Date().toISOString().slice(0, 10);

const summary = JSON.parse(fs.readFileSync("data/speaking-demand-summary.json", "utf8"));
const historyFile = path.join(ROOT, "public", "data", "occupation-history-files", "summary.json");
if (fs.existsSync(historyFile)) summary.occupationHistory = JSON.parse(fs.readFileSync(historyFile, "utf8"));
const occupations = new Map(JSON.parse(fs.readFileSync("data/speaking-by-occupation.json","utf8")).rows.map(row => [row.code, row]));
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
const bodies = [];

function err(file, msg) {
  errors.push(`${file}: ${msg}`);
}

function validDate(date) {
  return /^\d{4}-\d{2}-\d{2}$/.test(date) && Number.isFinite(Date.parse(date)) &&
    new Date(date).toISOString().slice(0,10) === date;
}

function containsNumber(text, value) {
  const number = String(value).replaceAll(".", "\\.");
  return new RegExp(`(?<![\\d.])${number}(?![\\d.])`).test(text);
}

function calculationMatches(stat, content) {
  const inputs = stat.inputs;
  if (!Array.isArray(inputs) || !inputs.length || !inputs.every(Number.isFinite)) return false;
  const visible = String(stat.value ?? "");
  if (!/^-?\d+(?:\.\d{1,6})?$/.test(visible)) return false;
  let result;
  switch (stat.operation) {
    case "difference": if (inputs.length !== 2) return false; result = inputs[0] - inputs[1]; break;
    case "ratio": if (inputs.length !== 2) return false; result = inputs[0] / inputs[1]; break;
    case "product": result = inputs.reduce((a, b) => a * b, 1); break;
    default: return false;
  }
  const decimals = (visible.split(".")[1] ?? "").length;
  if (!Number.isFinite(result) || Number(result.toFixed(decimals)) !== Number(visible)) return false;
  return content.split(/\n\s*\n/).some(paragraph => {
    const citations = [...paragraph.matchAll(/<Cite\s+k="([^"]+)"/g)].flatMap(match => match[1].split(",").map(k => k.trim()));
    return citations.includes(stat.source) && containsNumber(paragraph.replace(/<[^>]*>/g, ""), visible);
  });
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
    const published = ["published", "scheduled"].includes(data.status);
    const dateField = data.status === "scheduled" ? "scheduledFor" : "publishedAt";
    const rawDate = data[dateField];
    const pub = rawDate instanceof Date ? rawDate.toISOString().slice(0,10) : String(rawDate ?? "");
    for (const k of ["title", "description", "kind", dateField, "status"]) {
      if (!data[k]) err(rel, `missing frontmatter field "${k}"`);
    }
    if (!["published","scheduled","draft"].includes(data.status)) err(rel, "unknown publication status");
    if (data.kind && !KINDS.has(data.kind)) err(rel, `unknown kind "${data.kind}"`);
    if (!validDate(pub)) err(rel, dateField + " must be a calendar date");
    if (data.status === "scheduled" && data.publishedAt) err(rel, "scheduled entries use scheduledFor");
    if (data.status !== "scheduled" && data.scheduledFor) err(rel, "scheduledFor requires scheduled status");
    if (data.status !== "scheduled" && pub > today) err(rel, "future publishedAt; use status scheduled and scheduledFor");
    if (data.updatedAt) {
      const updated = data.updatedAt instanceof Date ? data.updatedAt.toISOString().slice(0,10) : String(data.updatedAt);
      if (!validDate(updated) || updated > today || updated < pub) err(rel, "invalid updatedAt");
    }
    if (data.description && String(data.description).length > 320) err(rel, "description over 320 characters");
    if (data.title && String(data.title).length > 110) err(rel, "title over 110 characters");

    for (const c of data.contributors ?? []) if (!PEOPLE.has(c)) err(rel, `unknown contributor "${c}" (real people only)`);

    if (data.reviewers !== undefined && (!Array.isArray(data.reviewers) || data.reviewers.some(name => !APPROVED_REVIEWERS.has(name)))) {
      err(rel, "reviewers must be approved external reviewers");
    }

    const declared = Array.isArray(data.citations) ? data.citations : [];
    const used = new Set();
    for (const m of content.matchAll(/<Cite\s+k="([^"]+)"\s*\/>/g)) m[1].split(",").forEach((k) => used.add(k.trim()));
    for (const m of content.matchAll(/<KeyStat[^>]*\sk="([^"]+)"/g)) m[1].split(",").forEach((k) => used.add(k.trim()));
    const occupation = occupations.get(data.occupationCode);
    if (data.occupationCode && !Number.isFinite(occupation?.speakingDemandScore)) err(rel, "unknown occupation or missing Institute score");
    if (occupation) {
      used.add("onet31"); // Sources rendered with the calculated occupation panel.
      if (occupation.employment != null || occupation.medianWage != null) used.add("blsoews2025");
    }
    for (const k of used) if (!declared.includes(k)) err(rel, `<Cite k="${k}"> not listed in frontmatter citations`);
    for (const k of declared) {
      if (!used.has(k)) err(rel, `citation "${k}" declared but never cited inline`);
      const c = registry[k];
      if (!c) err(rel, `citation "${k}" missing from the citation registry`);
      else if (published && !c.verified) err(rel, `citation "${k}" is not verified (run node scripts/verify-citations.mjs --file <file>)`);
    }
    const min = MIN_SOURCES[data.kind] ?? 3;
    const identities = new Set([...used].map(k => registry[k]?.doi?.toLowerCase() || registry[k]?.url).filter(Boolean));
    if (new Set(declared).size !== declared.length) err(rel, "duplicate entries in citations");
    if (published && identities.size < min) err(rel, `${data.kind} needs at least ${min} distinct cited sources, has ${identities.size}`);
    if (published && !occupation) {
      const stat = data.instituteStat;
      if (typeof stat === "string") {
        const value = stat.split(".").reduce((obj, k) => obj?.[k], summary);
        if (!Number.isFinite(value) || !containsNumber(content, value) || !used.has("onet31"))
          err(rel, "Institute statistic must match a cited, visible occupation-data figure");
      } else if (stat && typeof stat === "object") {
        if (!calculationMatches(stat, content)) err(rel, "unverified Institute calculation or missing adjacent citation");
      } else err(rel, "missing Institute statistic");
    }

    const body = stripCode(content);
    const visibleCopy = [body, data.title, data.description, ...(data.keyFindings ?? []), ...(data.topics ?? [])].join(" ");
    if (/—/.test(visibleCopy) || /—/.test(data.dataSource ?? "")) {
      err(rel, "contains an em dash");
    }
    const productMentions = visibleCopy.match(/Wellspoken(?!\s+Institute)/g);
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

if (errors.length) {
  for (const e of errors) console.error(`error ${e}`);
  console.error(`\nContent validation failed with ${errors.length} error(s).`);
  process.exit(1);
}
console.log(`Content validation passed (${bodies.length} published or queued entries).`);
