import summary from "@data/speaking-demand-summary.json";
import occupations from "@data/speaking-by-occupation.json";

export type OccupationRow = (typeof occupations.rows)[number];

export const SPEAKING_SUMMARY = summary;
export const OCCUPATIONS = occupations;

export function millions(n: number, digits = 0): string {
  return `${(n / 1e6).toFixed(digits)} million`;
}

export function usd(n: number | null | undefined): string {
  if (n == null) return "n/a";
  return `${Math.round(n).toLocaleString("en-US")} USD`;
}

export function findOccupation(code: string): OccupationRow | undefined {
  return occupations.rows.find((r) => r.code === code);
}

export function percentileOf(code: string): number | null {
  const rows = occupations.rows;
  const score = findOccupation(code)?.speakingDemandScore;
  if (score == null) return null;
  const rated = rows.filter(row => row.speakingDemandScore != null);
  const lower = rated.filter(row => row.speakingDemandScore! < score);
  return Math.round((lower.length / rated.length) * 100);
}

export function slugifyTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
