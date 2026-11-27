/** Share of rated occupations below the selected score. Ties count only in the denominator. */
export function compareOccupationScore(scores: (number | null)[], score: number | null) {
  if (score === null) return null;
  const rated = scores.filter((value): value is number => value !== null);
  if (!rated.length) return null;
  const below = rated.filter(value => value < score).length;
  return { percentBelow: Math.round(1000 * below / rated.length) / 10, ratedCount: rated.length };
}
