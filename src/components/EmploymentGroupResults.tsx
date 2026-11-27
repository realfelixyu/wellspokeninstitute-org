import type { EmploymentGroup } from "@/lib/employmentGroups";
export { findOccupationMatches } from "@/lib/employmentGroups";

export function EmploymentGroupSummary({ group, heading: Heading = "h3" }: { group: EmploymentGroup; heading?: "h2" | "h3" }) {
  const headingId = `employment-group-${group.code}`;
  return (
    <section aria-labelledby={headingId} className="mt-4 rounded-xl border border-rule bg-paper-2 p-4 text-sm">
      <Heading id={headingId} className="font-semibold text-ink">{group.title}</Heading>
      <p className="mt-1 text-ink-2">
        BLS reports <strong className="text-ink">{group.employment.toLocaleString("en-US")} U.S. jobs</strong> in
        May 2025 for these occupations combined (BLS {group.code}).
      </p>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-ink-2">
        {group.members.map(member => (
          <li key={member.code}>
            {member.title} <span className="whitespace-nowrap text-ink-3">({member.code})</span>
            {!member.rated && <span className="font-medium"> · No O*NET Speaking rating</span>}
          </li>
        ))}
      </ul>
    </section>
  );
}
