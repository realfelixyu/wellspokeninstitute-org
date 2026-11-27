// Builds data/speaking-by-occupation.json from the O*NET 31.0 Database text files.
// Source: O*NET 31.0 Database by USDOL/ETA, CC BY 4.0. Download db_31_0_text.zip from
// https://www.onetcenter.org/dl_files/database/db_31_0_text.zip and unzip into data/raw/onet/.
//
// Wellspoken Institute derives a composite "Speaking Demand Score" from these ratings.
// The method is documented on /data/speaking-by-occupation#method.

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const SRC = path.join(ROOT, "data", "raw", "onet", "db_31_0_text");
const OUT = path.join(ROOT, "data", "speaking-by-occupation.json");
const OPTIONAL_EMPLOYMENT = path.join(ROOT, "data", "bls-oews-national.json");

if (process.argv.includes("--require-employment") && !fs.existsSync(OPTIONAL_EMPLOYMENT)) {
  throw new Error("The full dataset release requires data/bls-oews-national.json for employment and wage summaries.");
}

function readTsv(file) {
  const text = fs.readFileSync(path.join(SRC, file), "utf8");
  const [header, ...rows] = text.trim().split(/\r?\n/);
  const cols = header.split("\t");
  return rows.map((r) => {
    const v = r.split("\t");
    return Object.fromEntries(cols.map((c, i) => [c, v[i]]));
  });
}

const occupations = new Map();
for (const r of readTsv("Occupation Data.txt")) {
  occupations.set(r["O*NET-SOC Code"], { code: r["O*NET-SOC Code"], title: r.Title, description: r.Description });
}

const jobZone = new Map(readTsv("Job Zones.txt").map((r) => [r["O*NET-SOC Code"], Number(r["Job Zone"])]));

function collect(file, elementId, scaleId, category) {
  const m = new Map();
  for (const r of readTsv(file)) {
    if (r["Element ID"] !== elementId || r["Scale ID"] !== scaleId) continue;
    if (category !== undefined && r.Category !== String(category)) continue;
    const suppressed = r["Recommend Suppress"] === "Y";
    m.set(r["O*NET-SOC Code"], { value: Number(r["Data Value"]), suppressed });
  }
  return m;
}

const measures = {
  speakingImportance: collect("Essential Skills.txt", "2.A.1.d", "IM"),
  speakingLevel: collect("Essential Skills.txt", "2.A.1.d", "LV"),
  oralExpressionImportance: collect("Abilities.txt", "1.A.1.a.3", "IM"),
  oralExpressionLevel: collect("Abilities.txt", "1.A.1.a.3", "LV"),
  oralComprehensionImportance: collect("Abilities.txt", "1.A.1.a.1", "IM"),
  publicSpeakingFrequency: collect("Work Context.txt", "4.C.1.a.2.c", "CX"),
  publicSpeakingDailyPct: collect("Work Context.txt", "4.C.1.a.2.c", "CXP", 5),
  publicSpeakingWeeklyPct: collect("Work Context.txt", "4.C.1.a.2.c", "CXP", 4),
  faceToFaceFrequency: collect("Work Context.txt", "4.C.1.a.2.l", "CX"),
  telephoneFrequency: collect("Work Context.txt", "4.C.1.a.2.f", "CX"),
  externalPublicFrequency: collect("Work Context.txt", "4.C.1.b.1.f", "CX"),
  communicatingInternalImportance: collect("Work Activities.txt", "4.A.4.a.2", "IM"),
  communicatingExternalImportance: collect("Work Activities.txt", "4.A.4.a.3", "IM"),
  teachingImportance: collect("Work Activities.txt", "4.A.4.b.3", "IM"),
};

let employment = new Map();
if (fs.existsSync(OPTIONAL_EMPLOYMENT)) {
  const rows = JSON.parse(fs.readFileSync(OPTIONAL_EMPLOYMENT, "utf8")).rows;
  employment = new Map(rows.map((r) => [r.soc, r]));
}

// Speaking Demand Score (0 to 100): mean of three rescaled ratings.
//   Speaking importance (1 to 5)        -> (x - 1) / 4
//   Speaking level (0 to 7)             -> x / 7
//   Oral Expression importance (1 to 5) -> (x - 1) / 4
function score(o) {
  const parts = [];
  if (o.speakingImportance != null) parts.push((o.speakingImportance - 1) / 4);
  if (o.speakingLevel != null) parts.push(o.speakingLevel / 7);
  if (o.oralExpressionImportance != null) parts.push((o.oralExpressionImportance - 1) / 4);
  if (parts.length < 3) return null;
  return Math.round((parts.reduce((a, b) => a + b, 0) / parts.length) * 1000) / 10;
}

const round2 = (x) => (x == null ? null : Math.round(x * 100) / 100);

const rows = [];
for (const [code, occ] of occupations) {
  const o = { code, title: occ.title, jobZone: jobZone.get(code) ?? null };
  let anySuppressed = false;
  for (const [k, m] of Object.entries(measures)) {
    const v = m.get(code);
    o[k] = v ? round2(v.value) : null;
    if (v?.suppressed && (k === "speakingImportance" || k === "speakingLevel")) anySuppressed = true;
  }
  if (o.speakingImportance == null) continue;
  o.speakingDemandScore = score(o);
  o.lowPrecision = anySuppressed;
  const soc = code.slice(0, 7);
  const emp = employment.get(soc);
  o.soc = soc;
  o.employment = emp?.employment ?? null;
  o.medianWage = emp?.medianWage ?? null;
  o.description = occ.description;
  rows.push(o);
}

rows.sort((a, b) => (b.speakingDemandScore ?? 0) - (a.speakingDemandScore ?? 0) || a.title.localeCompare(b.title));
rows.forEach((r, i) => (r.rank = i + 1));

const out = {
  source: "O*NET® 31.0 Database (August 2026 release), U.S. Department of Labor, Employment and Training Administration. CC BY 4.0.",
  sourceUrl: "https://www.onetcenter.org/database.html",
  modifiedBy: "Wellspoken Institute calculated the Speaking Demand Score from O*NET ratings. Public-speaking percentages come from the O*NET Work Context data. O*NET® is a trademark of USDOL/ETA. USDOL/ETA has not approved, endorsed, or tested these modifications.",
  employmentSource: employment.size ? "U.S. Bureau of Labor Statistics, Occupational Employment and Wage Statistics, May 2025 national estimates (public domain)." : null,
  generatedAt: new Date().toISOString().slice(0, 10),
  count: rows.length,
  rows,
};

fs.writeFileSync(OUT, JSON.stringify(out));
console.log(`wrote ${rows.length} occupations to ${path.relative(ROOT, OUT)}`);
console.log("top 10:", rows.slice(0, 10).map((r) => `${r.title} ${r.speakingDemandScore}`).join(" | "));
console.log("bottom 5:", rows.slice(-5).map((r) => `${r.title} ${r.speakingDemandScore}`).join(" | "));
