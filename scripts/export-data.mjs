// Writes public download files for the Speaking by Occupation dataset.
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const src = JSON.parse(fs.readFileSync(path.join(ROOT, "data", "speaking-by-occupation.json"), "utf8"));
const outDir = path.join(ROOT, "public", "data");
fs.mkdirSync(outDir, { recursive: true });

const COLS = [
  ["rank", "Rank"],
  ["code", "O*NET-SOC code"],
  ["title", "Occupation"],
  ["speakingDemandScore", "Speaking Demand Score (0-100)"],
  ["speakingImportance", "Speaking importance (1-5)"],
  ["speakingLevel", "Speaking level (0-7)"],
  ["oralExpressionImportance", "Oral Expression importance (1-5)"],
  ["oralComprehensionImportance", "Oral Comprehension importance (1-5)"],
  ["publicSpeakingFrequency", "Public speaking frequency (1-5)"],
  ["publicSpeakingDailyPct", "Percent reporting public speaking every day"],
  ["faceToFaceFrequency", "Face-to-face discussion frequency (1-5)"],
  ["telephoneFrequency", "Telephone conversation frequency (1-5)"],
  ["externalPublicFrequency", "Dealing with external customers or public frequency (1-5)"],
  ["teachingImportance", "Training and teaching others importance (1-5)"],
  ["jobZone", "Job Zone (1-5)"],
  ["employment", "U.S. employment, May 2025 (SOC level)"],
  ["medianWage", "Median annual wage USD, May 2025 (SOC level)"],
];

const esc = (v) => {
  if (v == null) return "";
  const s = String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

const csv = [COLS.map((c) => esc(c[1])).join(",")]
  .concat(src.rows.map((r) => COLS.map(([k]) => esc(r[k])).join(",")))
  .join("\n");

const header = [
  "# Speaking by Occupation dataset, Wellspoken Institute (wellspokeninstitute.org/data/speaking-by-occupation)",
  `# Generated ${src.generatedAt}. License: CC BY 4.0.`,
  "# Includes information from the O*NET 31.0 Database by the U.S. Department of Labor, Employment and Training Administration (USDOL/ETA), used under the CC BY 4.0 license. Wellspoken Institute has modified all or some of this information. USDOL/ETA has not approved, endorsed, or tested these modifications.",
  "# Employment and wages: U.S. Bureau of Labor Statistics, OEWS May 2025 national estimates (public domain).",
];

fs.writeFileSync(path.join(outDir, "speaking-by-occupation.csv"), header.join("\n") + "\n" + csv + "\n");

const slim = src.rows.map((r) => [
  r.rank, r.code, r.title, r.speakingDemandScore, r.speakingImportance, r.speakingLevel,
  r.oralExpressionImportance, r.publicSpeakingFrequency, r.faceToFaceFrequency, r.employment, r.medianWage, r.jobZone,
]);
fs.writeFileSync(
  path.join(outDir, "speaking-by-occupation.json"),
  JSON.stringify({
    fields: ["rank", "code", "title", "score", "speakingImportance", "speakingLevel", "oralExpressionImportance", "publicSpeakingFrequency", "faceToFaceFrequency", "employment", "medianWage", "jobZone"],
    source: src.source,
    modifiedBy: src.modifiedBy,
    license: "CC BY 4.0",
    rows: slim,
  })
);
console.log(`exported ${src.rows.length} rows (csv ${(csv.length / 1024).toFixed(0)} KB)`);
