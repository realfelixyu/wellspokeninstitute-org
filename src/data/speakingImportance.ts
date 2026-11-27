import { OCCUPATIONS } from "./stats";

// Retain every occupation tied with the 25th position in the released ratings.
const sorted = OCCUPATIONS.rows
  .filter(row => row.speakingImportance != null)
  .sort((a, b) => b.speakingImportance - a.speakingImportance || a.title.localeCompare(b.title, "en") || a.code.localeCompare(b.code));

export const rankedCount = sorted.length;
export const position = 25;
if (rankedCount < position) throw new Error("The occupation dataset lacks enough Speaking importance ratings for the ranking.");
export const cutoff = sorted[position - 1].speakingImportance;
export const leadingRatings = sorted.filter(row => row.speakingImportance >= cutoff).map((row, _, rows) => ({
  rank: rows.findIndex(other => other.speakingImportance === row.speakingImportance) + 1,
  code: row.code,
  title: row.title,
  importance: row.speakingImportance,
}));
export const archiveUrl = "https://www.onetcenter.org/dl_files/database/db_31_0_text.zip";
export const credit = "O*NET® 31.0 Database, August 2026. U.S. Department of Labor, Employment and Training Administration (USDOL/ETA). Wellspoken Institute ranked published Speaking importance ratings and retained all ties. USDOL/ETA has not approved, endorsed, or tested this analysis. O*NET® is a trademark of USDOL/ETA.";
