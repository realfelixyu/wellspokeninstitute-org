import Link from "next/link";
import { getEntries } from "@/lib/content";
import { PageHeader, Container } from "@/components/PageHeader";
import { pageMetadata } from "@/lib/seo";
import { findOccupation } from "@/data/stats";

export const metadata = pageMetadata({
  title: "Communication skills by profession",
  description:
    "Profession-by-profession guides to the speaking demands of the job, based on U.S. Department of Labor data and published research.",
  path: "/professions",
});

const GROUPS: Record<string, string> = {
  "11": "Management",
  "13": "Business and finance",
  "15": "Computing and data",
  "17": "Architecture and engineering",
  "19": "Science and psychology",
  "21": "Community and social service",
  "23": "Law",
  "25": "Education and libraries",
  "27": "Media and communication",
  "29": "Healthcare",
  "31": "Healthcare support",
  "33": "Public safety",
  "35": "Food service",
  "41": "Sales",
  "43": "Office and customer service",
  "53": "Transportation",
};

export default function ProfessionsIndex() {
  const entries = getEntries("professions");
  const grouped = new Map<string, typeof entries>();
  for (const e of entries) {
    const g = GROUPS[(e.meta.occupationCode ?? "").slice(0, 2)] ?? "Other";
    if (!grouped.has(g)) grouped.set(g, []);
    grouped.get(g)!.push(e);
  }
  const groups = [...grouped.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  return (
    <>
      <PageHeader
        eyebrow="Speaking by profession"
        title="How speaking shows up in your job"
        lede={
          <>
            Guides to the spoken side of each profession, built on U.S. Department of Labor ratings and published
            research. Look up any of 910 occupations in our{" "}
            <Link href="/data/speaking-by-occupation" className="text-accent underline underline-offset-4">
              speaking by occupation data
            </Link>
            .
          </>
        }
      />
      <Container>
        <div className="space-y-12 py-12">
          {groups.length === 0 ? <p className="text-ink-3">The first guides are in review.</p> : null}
          {groups.map(([name, list]) => (
            <section key={name} aria-labelledby={`g-${name}`}>
              <h2 id={`g-${name}`} className="font-serif text-2xl font-semibold text-ink">
                {name}
              </h2>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {list
                  .sort((a, b) => a.meta.title.localeCompare(b.meta.title))
                  .map((e) => {
                    const o = e.meta.occupationCode ? findOccupation(e.meta.occupationCode) : undefined;
                    return (
                      <li key={e.meta.slug}>
                        <Link
                          href={`/professions/${e.meta.slug}`}
                          className="flex h-full items-start justify-between gap-4 rounded-xl border border-rule bg-card p-4 transition-colors hover:border-accent"
                        >
                          <span className="font-medium leading-snug text-ink">{o?.title ?? e.meta.title}</span>
                          {o?.speakingDemandScore != null ? (
                            <span className="shrink-0 rounded-md bg-accent-soft px-2 py-1 text-sm font-semibold text-accent" title="Speaking Demand Score">
                              {o.speakingDemandScore.toFixed(0)}
                            </span>
                          ) : null}
                        </Link>
                      </li>
                    );
                  })}
              </ul>
            </section>
          ))}
        </div>
      </Container>
    </>
  );
}
