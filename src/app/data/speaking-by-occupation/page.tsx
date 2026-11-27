import Link from "next/link";
import { PageHeader, Container } from "@/components/PageHeader";
import { OccupationExplorer } from "@/components/OccupationExplorer";
import { JsonLd, pageMetadata, breadcrumbJsonLd } from "@/lib/seo";
import { OCCUPATIONS, SPEAKING_SUMMARY, millions, usd } from "@/data/stats";
import { getEntries } from "@/lib/content";
import type { ExplorerRow } from "@/components/useOccupationData";
import { SITE } from "@/data/site";

const PATH = "/data/speaking-by-occupation";

export const metadata = pageMetadata({
  title: "Speaking by occupation: how much 910 jobs depend on speaking",
  description:
    "Free dataset ranking 910 U.S. occupations by how much they depend on speaking, built from O*NET 31.0 ratings with BLS employment and wages. Search, sort, and download.",
  path: PATH,
});

export default function SpeakingByOccupation() {
  const s = SPEAKING_SUMMARY;
  const w = s.workerWeighted;
  const guides: Record<string, string> = {};
  for (const { meta } of getEntries("professions")) {
    if (meta.occupationCode) guides[meta.occupationCode] = `/professions/${meta.slug}`;
  }
  const initial = OCCUPATIONS.rows.slice(0, 50).map<ExplorerRow>((r) => [
    r.rank, r.code, r.title, r.speakingDemandScore, r.speakingImportance, r.speakingLevel,
    r.oralExpressionImportance, r.publicSpeakingFrequency, r.faceToFaceFrequency, r.employment, r.medianWage, r.jobZone,
  ]);
  const dataset = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: "Speaking by Occupation",
    description:
      "Speaking importance, speaking level, oral expression, public speaking frequency, and a composite Speaking Demand Score for 910 U.S. occupations, with BLS employment and median wages.",
    url: `${SITE.url}${PATH}`,
    creator: { "@type": "NGO", name: SITE.name, url: SITE.url },
    license: "https://creativecommons.org/licenses/by/4.0/",
    isAccessibleForFree: true,
    dateModified: OCCUPATIONS.generatedAt,
    temporalCoverage: "2026",
    spatialCoverage: "United States",
    isBasedOn: ["https://www.onetcenter.org/database.html", "https://www.bls.gov/oes/"],
    variableMeasured: ["Speaking importance", "Speaking level", "Oral Expression importance", "Public speaking frequency", "Speaking Demand Score", "Employment", "Median annual wage"],
    distribution: [
      { "@type": "DataDownload", encodingFormat: "text/csv", contentUrl: `${SITE.url}/data/speaking-by-occupation.csv` },
      { "@type": "DataDownload", encodingFormat: "application/json", contentUrl: `${SITE.url}/data/speaking-by-occupation.json` },
    ],
  };
  return (
    <>
      <JsonLd data={dataset} />
      <JsonLd data={breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Speaking by occupation", path: PATH }])} />
      <PageHeader
        eyebrow="Open data"
        title="Speaking by occupation"
        lede={
          <>
            How much does each job depend on speaking? We combined U.S. Department of Labor ratings for{" "}
            {s.occupationsRated} occupations into one score and joined them with federal employment and wage data.
            Free to search, download, and reuse.
          </>
        }
      >
        <div className="mt-6 flex flex-wrap gap-3 text-sm">
          <a href="/data/speaking-by-occupation.csv" download className="rounded-lg bg-accent px-4 py-2.5 font-medium text-accent-ink hover:opacity-90">
            Download CSV
          </a>
          <a href="/data/speaking-by-occupation.json" className="rounded-lg border border-rule bg-card px-4 py-2.5 text-ink hover:border-accent">
            JSON
          </a>
          <Link href="/research/speaking-at-work-2026" className="rounded-lg border border-rule bg-card px-4 py-2.5 text-ink hover:border-accent">
            Read the data brief
          </Link>
        </div>
      </PageHeader>

      <Container>
        <section className="grid gap-6 py-10 sm:grid-cols-3">
          <div className="rounded-xl border border-rule bg-card p-5">
            <p className="font-serif text-3xl font-semibold text-accent">{w.pctSpeakingImportantOrHigher}%</p>
            <p className="mt-2 text-sm text-ink-2">of the employment covered by this analysis ({millions(w.workersSpeakingImportantOrHigher)} jobs) is in occupations rating speaking at least &ldquo;important&rdquo; (3 of 5).</p>
          </div>
          <div className="rounded-xl border border-rule bg-card p-5">
            <p className="font-serif text-3xl font-semibold text-accent">{w.pctSpeakingVeryImportant}%</p>
            <p className="mt-2 text-sm text-ink-2">of the employment covered ({millions(w.workersSpeakingVeryImportant)} jobs) is in occupations rating speaking &ldquo;very important&rdquo; (4 of 5) or higher.</p>
          </div>
          <div className="rounded-xl border border-rule bg-card p-5">
            <p className="font-serif text-3xl font-semibold text-accent">{s.skills?.pctSpeakingAboveWriting}%</p>
            <p className="mt-2 text-sm text-ink-2">of occupations rate speaking as more important than writing, and {s.skills?.pctSpeakingAboveMathematics}% rate it above mathematics.</p>
          </div>
        </section>

        <section aria-labelledby="explore" className="pb-10">
          <h2 id="explore" className="mb-4 font-serif text-2xl font-semibold text-ink">Explore the data</h2>
          <OccupationExplorer initial={initial} guides={guides} />
        </section>

        <section aria-labelledby="method" className="prose-body max-w-3xl pb-6">
          <h2 id="method">Method</h2>
          <p>
            The <strong>Speaking Demand Score</strong> (0 to 100) is the average of three O*NET® ratings, each rescaled
            to 0 to 1: the importance of the skill <em>Speaking</em> (&ldquo;talking to others to convey information
            effectively,&rdquo; rated 1 to 5), the level of Speaking the job requires (0 to 7), and the importance of
            the ability <em>Oral Expression</em> (1 to 5). These ratings come from job analysts and surveys of workers
            in each occupation. Tied scores appear in alphabetical order.
          </p>
          <p>
            Public speaking and face-to-face frequency come from O*NET work context questions, rated from 1
            (never) to 5 (every day). Employment and median annual wages are U.S. Bureau of Labor Statistics May 2025
            national estimates, matched at the six-digit SOC level, so several closely related O*NET occupations
            can share one employment figure. Worker-weighted percentages count each SOC occupation once.
          </p>
          <p>
            Occupations with higher Speaking Demand Scores tend to pay more: typical median pay is{" "}
            {usd(s.wages.quartiles[3].medianOfMedianWages)} in the quarter of occupations with the highest scores and{" "}
            {usd(s.wages.quartiles[0].medianOfMedianWages)} in the lowest quarter (correlation with log median wage, r ={" "}
            {s.wages.correlationScoreLogMedianWage.toFixed(2)}). Among occupations in the same O*NET Job Zone, the association is smaller, about{" "}
            {s.wages.withinJobZone.pctWagePer10PointsWithinZone}% higher pay per 10 points (r ={" "}
            {s.wages.withinJobZone.pooledWithinZoneR.toFixed(2)}). None of this shows that speaking skill causes higher pay.
          </p>
          <h2>Source and license</h2>
          <p>
            This page includes information from the{" "}
            <a href="https://www.onetcenter.org/database.html">O*NET 31.0 Database</a> by the U.S. Department of Labor,
            Employment and Training Administration (USDOL/ETA). Used under the{" "}
            <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a> license. O*NET® is a trademark of
            USDOL/ETA. {SITE.name} has modified all or some of this information. USDOL/ETA has not approved,
            endorsed, or tested these modifications. Employment and wage figures are from the{" "}
            <a href="https://www.bls.gov/oes/">BLS Occupational Employment and Wage Statistics</a> program.
          </p>
          <p>
            Our derived dataset is released under CC BY 4.0. Please cite: {SITE.researchTeamByline}. (2026). Speaking by
            Occupation [Data set]. {SITE.name}. {SITE.url}{PATH}
          </p>
        </section>
      </Container>
    </>
  );
}
