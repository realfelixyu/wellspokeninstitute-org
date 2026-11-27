import crosswalk from "../../public/data/employment-groups.json";

export interface EmploymentGroupMember {
  code: string;
  title: string;
  rated: boolean;
}

export interface EmploymentGroup {
  code: string;
  title: string;
  employment: number;
  members: EmploymentGroupMember[];
}

export const employmentGroups: EmploymentGroup[] = crosswalk.groups;

/** Matches an exact component code. Combined employment belongs to the returned group. */
export function groupForOccupation(code: string): EmploymentGroup | undefined {
  const input = code.trim();
  const fullCode = /^\d{2}-\d{4}$/.test(input) ? input + ".00" : input;
  return employmentGroups.find(group => group.members.some(member => member.code === fullCode));
}

export function occupationMatchesQuery(occupation: { code: string; title: string }, query: string): boolean {
  const text = query.trim().toLowerCase();
  const title = occupation.title.toLowerCase();
  // A search for an excluded specialty should not identify this as one of its occupations.
  const searchableTitle = text.includes("except") ? title : title.split(", except ")[0];
  return searchableTitle.includes(text) || occupation.code.startsWith(text);
}

export function groupMatchesQuery(group: EmploymentGroup, query: string): boolean {
  return occupationMatchesQuery(group, query) || group.members.some(member => occupationMatchesQuery(member, query));
}

type OccupationRow = readonly [number, string, string, ...unknown[]];

export function findOccupationMatches<Row extends OccupationRow>(rows: Row[], query: string) {
  const term = query.trim().toLowerCase();
  if (!term) return { occupations: rows, groups: [] };

  const groups = term.length >= 2 ? employmentGroups.filter(group => groupMatchesQuery(group, term)) : [];
  const exactMember = groups.flatMap(group => group.members).find(member => member.title.toLowerCase() === term);
  if (exactMember) return { occupations: rows.filter(row => row[1] === exactMember.code), groups };

  // Expand a combined category only when the query does not already identify its members directly.
  const groupOnly = groups.filter(group => !group.members.some(member => occupationMatchesQuery(member, term)));
  const memberCodes = new Set(groupOnly.flatMap(group => group.members.map(member => member.code)));
  const occupations = rows.filter(row =>
    memberCodes.has(row[1]) || occupationMatchesQuery({ code: row[1], title: row[2] }, term)
  );
  return { occupations, groups };
}
