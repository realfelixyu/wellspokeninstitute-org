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
  ["externalPublicFrequency", "Importance of dealing with external customers or the public (1-5)"],
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

// Keep every record rectangular so spreadsheet and CSV readers can use row one as the header.
const credit = [
  src.source, src.sourceUrl, src.modifiedBy, src.employmentSource,
  `Wellspoken Institute dataset, ${src.generatedAt}. https://wellspokeninstitute.org/data/speaking-by-occupation`,
  "License: https://creativecommons.org/licenses/by/4.0/",
].filter(Boolean).join(" ");
const csv = [
  [...COLS.map(([, title]) => title), "Source and license"].map(esc).join(","),
  ...src.rows.map(row => [...COLS.map(([key]) => row[key]), credit].map(esc).join(",")),
].join("\n") + "\n";

fs.writeFileSync(path.join(outDir, "speaking-by-occupation.csv"), csv);

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
    employmentSource: src.employmentSource,
    sourceUrl: src.sourceUrl,
    license: "CC BY 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by/4.0/",
    rows: slim,
  })
);
console.log(`exported ${src.rows.length} rows (csv ${(csv.length / 1024).toFixed(0)} KB)`);
