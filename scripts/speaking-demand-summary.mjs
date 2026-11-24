// Reproducible summary statistics for the "Speaking at Work" data brief.
// Input: data/speaking-by-occupation.json (built by scripts/onet-import.mjs)
// Output: data/speaking-demand-summary.json
//
// Worker-weighted figures use one O*NET occupation per 6-digit SOC code: the ".00"
// code when present, otherwise the mean of that SOC's O*NET codes. Employment is
// BLS OEWS May 2025 national employment for that SOC.

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const data = JSON.parse(fs.readFileSync(path.join(ROOT, "data", "speaking-by-occupation.json"), "utf8"));
const rows = data.rows;

const KEYS = [
  "speakingImportance",
  "speakingLevel",
  "oralExpressionImportance",
  "publicSpeakingFrequency",
  "publicSpeakingDailyPct",
  "publicSpeakingWeeklyPct",
  "faceToFaceFrequency",
  "speakingDemandScore",
];

const bySoc = new Map();
for (const r of rows) {
  if (!bySoc.has(r.soc)) bySoc.set(r.soc, []);
  bySoc.get(r.soc).push(r);
}

const socRows = [];
for (const [soc, list] of bySoc) {
  const primary = list.find((r) => r.code.endsWith(".00"));
  const merged = { soc, title: primary?.title ?? list[0].title, employment: list[0].employment, medianWage: list[0].medianWage };
  for (const k of KEYS) {
    if (primary && primary[k] != null) merged[k] = primary[k];
    else {
      const vals = list.map((r) => r[k]).filter((v) => v != null);
      merged[k] = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
    }
  }
  socRows.push(merged);
}

const weighted = socRows.filter((r) => r.employment && r.speakingImportance != null);
const totalEmp = weighted.reduce((a, r) => a + r.employment, 0);
const share = (pred) => weighted.filter(pred).reduce((a, r) => a + r.employment, 0) / totalEmp;
const occShare = (pred) => rows.filter(pred).length / rows.length;

function median(arr) {
  const s = [...arr].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

function pearson(xs, ys) {
  const n = xs.length;
  const mx = xs.reduce((a, b) => a + b, 0) / n;
  const my = ys.reduce((a, b) => a + b, 0) / n;
  let sxy = 0, sxx = 0, syy = 0;
  for (let i = 0; i < n; i++) {
    sxy += (xs[i] - mx) * (ys[i] - my);
    sxx += (xs[i] - mx) ** 2;
    syy += (ys[i] - my) ** 2;
  }
  return sxy / Math.sqrt(sxx * syy);
}

const jobZoneBySoc = new Map();
for (const r of rows) if (!jobZoneBySoc.has(r.soc) || r.code.endsWith(".00")) jobZoneBySoc.set(r.soc, r.jobZone);
for (const r of socRows) r.jobZone = jobZoneBySoc.get(r.soc) ?? null;
const wagePts = weighted.filter((r) => r.medianWage && r.speakingDemandScore != null);
const sortedByScore = [...wagePts].sort((a, b) => a.speakingDemandScore - b.speakingDemandScore);
const q = Math.floor(sortedByScore.length / 4);
const quartiles = [0, 1, 2, 3].map((i) => {
  const slice = sortedByScore.slice(i * q, i === 3 ? sortedByScore.length : (i + 1) * q);
  return {
    quartile: i + 1,
    occupations: slice.length,
    scoreRange: [slice[0].speakingDemandScore, slice[slice.length - 1].speakingDemandScore].map((v) => Math.round(v * 10) / 10),
    medianOfMedianWages: median(slice.map((r) => r.medianWage)),
    employment: slice.reduce((a, r) => a + r.employment, 0),
  };
});

const r1 = (x) => Math.round(x * 1000) / 10;

// Basic-skill comparison from the raw O*NET Essential Skills file (importance scale).
function skillComparison() {
  const file = path.join(ROOT, "data", "raw", "onet", "db_31_0_text", "Essential Skills.txt");
  if (!fs.existsSync(file)) return null;
  const im = {};
  for (const line of fs.readFileSync(file, "utf8").trim().split(/\r?\n/).slice(1)) {
    const c = line.split("\t");
    if (c[3] !== "IM") continue;
    (im[c[0]] ??= {})[c[2]] = Number(c[4]);
  }
  const occ = Object.keys(im);
  const pct = (f) => r1(occ.filter((o) => f(im[o])).length / occ.length);
  const mean = (k) => Math.round((occ.reduce((a, o) => a + (im[o][k] ?? 0), 0) / occ.length) * 100) / 100;
  return {
    occupations: occ.length,
    pctSpeakingAboveWriting: pct((s) => s.Speaking > s.Writing),
    pctSpeakingAtLeastWriting: pct((s) => s.Speaking >= s.Writing),
    pctSpeakingAboveMathematics: pct((s) => s.Speaking > s.Mathematics),
    meanImportance: {
      speaking: mean("Speaking"),
      activeListening: mean("Active Listening"),
      readingComprehension: mean("Reading Comprehension"),
      writing: mean("Writing"),
      mathematics: mean("Mathematics"),
      science: mean("Science"),
    },
  };
}

// Association with wages after holding Job Zone (preparation level) fixed.
function withinJobZone(points) {
  const zones = new Map();
  for (const p of points) {
    if (!p.jobZone) continue;
    if (!zones.has(p.jobZone)) zones.set(p.jobZone, []);
    zones.get(p.jobZone).push(p);
  }
  let sxy = 0, sxx = 0, syy = 0;
  const byZone = [];
  for (const [z, arr] of [...zones].sort((a, b) => a[0] - b[0])) {
    const mx = arr.reduce((a, b) => a + b.speakingDemandScore, 0) / arr.length;
    const my = arr.reduce((a, b) => a + Math.log(b.medianWage), 0) / arr.length;
    let a = 0, b = 0, c = 0;
    for (const p of arr) {
      const dx = p.speakingDemandScore - mx;
      const dy = Math.log(p.medianWage) - my;
      a += dx * dy; b += dx * dx; c += dy * dy;
    }
    sxy += a; sxx += b; syy += c;
    byZone.push({ jobZone: z, occupations: arr.length, r: Math.round((a / Math.sqrt(b * c)) * 1000) / 1000, pctWagePer10Points: Math.round((Math.exp((a / b) * 10) - 1) * 1000) / 10 });
  }
  return {
    pooledWithinZoneR: Math.round((sxy / Math.sqrt(sxx * syy)) * 1000) / 1000,
    pctWagePer10PointsWithinZone: Math.round((Math.exp((sxy / sxx) * 10) - 1) * 1000) / 10,
    byZone,
  };
}

const summary = {
  generatedAt: new Date().toISOString().slice(0, 10),
  sources: {
    onet: data.source,
    bls: "U.S. Bureau of Labor Statistics, Occupational Employment and Wage Statistics (OEWS), May 2025 national estimates.",
  },
  occupationsRated: rows.length,
  socOccupationsWithEmployment: weighted.length,
  employmentCovered: Math.round(totalEmp),
  occupationLevel: {
    pctSpeakingImportantOrHigher: r1(occShare((r) => r.speakingImportance >= 3)),
    pctSpeakingVeryImportant: r1(occShare((r) => r.speakingImportance >= 4)),
    pctFaceToFaceWeeklyOrMore: r1(occShare((r) => r.faceToFaceFrequency >= 4)),
    medianSpeakingImportance: median(rows.map((r) => r.speakingImportance)),
  },
  workerWeighted: {
    pctSpeakingImportantOrHigher: r1(share((r) => r.speakingImportance >= 3)),
    pctSpeakingQuiteImportant: r1(share((r) => r.speakingImportance >= 3.5)),
    pctSpeakingVeryImportant: r1(share((r) => r.speakingImportance >= 4)),
    pctFaceToFaceWeeklyOrMore: r1(share((r) => r.faceToFaceFrequency >= 4)),
    pctPublicSpeakingMonthlyOrMoreAvg: null,
    workersSpeakingImportantOrHigher: Math.round(weighted.filter((r) => r.speakingImportance >= 3).reduce((a, r) => a + r.employment, 0)),
    workersSpeakingVeryImportant: Math.round(weighted.filter((r) => r.speakingImportance >= 4).reduce((a, r) => a + r.employment, 0)),
  },
  wages: {
    occupationsWithWage: wagePts.length,
    correlationScoreLogMedianWage: Math.round(pearson(wagePts.map((r) => r.speakingDemandScore), wagePts.map((r) => Math.log(r.medianWage))) * 1000) / 1000,
    rawPctWagePer10Points: (() => {
      const n = wagePts.length;
      const mx = wagePts.reduce((a, r) => a + r.speakingDemandScore, 0) / n;
      const my = wagePts.reduce((a, r) => a + Math.log(r.medianWage), 0) / n;
      let a = 0, b = 0;
      for (const r of wagePts) { a += (r.speakingDemandScore - mx) * (Math.log(r.medianWage) - my); b += (r.speakingDemandScore - mx) ** 2; }
      return Math.round((Math.exp((a / b) * 10) - 1) * 1000) / 10;
    })(),
    quartiles,
    withinJobZone: withinJobZone(wagePts),
  },
  skills: skillComparison(),
  top25: rows.slice(0, 25).map((r) => ({ code: r.code, title: r.title, score: r.speakingDemandScore })),
  largestHighSpeakingOccupations: [...weighted]
    .filter((r) => r.speakingImportance >= 4)
    .sort((a, b) => b.employment - a.employment)
    .slice(0, 15)
    .map((r) => ({ soc: r.soc, title: r.title, employment: r.employment, speakingImportance: r.speakingImportance })),
};

fs.writeFileSync(path.join(ROOT, "data", "speaking-demand-summary.json"), JSON.stringify(summary, null, 2));
console.log(JSON.stringify({ occupationLevel: summary.occupationLevel, workerWeighted: summary.workerWeighted, wages: summary.wages }, null, 2));
console.log(summary.largestHighSpeakingOccupations.map((r) => `${r.title}: ${(r.employment / 1e6).toFixed(2)}M`).join("\n"));
