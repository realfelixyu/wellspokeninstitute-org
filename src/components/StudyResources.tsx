import { SITE } from "@/data/site";

interface StudyMaterials {
  links: [string, string][];
  chart?: {
    image: string;
    alt: string;
    creditHtml: string;
  };
}

const materials: Record<string, StudyMaterials | undefined> = {
  "why-speaking-skills-should-be-taught": {
    links: [
      ["Plain-language summary and two charts for reuse", "/papers/speaking-review-summary.html"],
      ["Methods and data behind the employment figures", "/data/speaking-by-occupation#method"],
      ["Press release", "/papers/speaking-review-press.html"],
    ],
  },
  "speaking-at-work-2026": {
    links: [
      ["Occupation data (CSV)", "/data/speaking-by-occupation.csv"],
      ["Highest speaking-importance ratings, including ties", "/data/speaking-importance-rankings"],
      ["Methods and source attribution", "/data/speaking-by-occupation#method"],
      ["Press release", "/papers/speaking-at-work-2026-press.html"],
    ],
    chart: {
      image: "/charts/speaking-importance-jobs.png",
      alt: "Among matched jobs, 85.5% were in occupations with speaking importance of at least 3 out of 5, 55.6% at least 3.5, and 26.4% at least 4.",
      creditHtml: 'The Institute weighted speaking ratings from the <a href="https://www.onetcenter.org/dl_files/database/db_31_0_text.zip">O*NET® 31.0 Database</a> using <a href="https://www.bls.gov/oes/">May 2025 Occupational Employment and Wage Statistics</a> from the U.S. Bureau of Labor Statistics.',
    },
  },
  "speaking-demand-over-time": {
    links: [
      ["Matched occupations (CSV)", "/data/occupation-history-files/matched-occupations.csv"],
      ["Methods, original data and reproduction code", "/data/speaking-demand-over-time"],
      ["Press release", "/papers/speaking-demand-over-time-press.html"],
    ],
    chart: {
      image: "/charts/speaking-ratings-two-releases.png",
      alt: "Of 223 rerated occupations, speaking importance rose in 64, fell in 96 and stayed the same in 63. Speaking level rose in 108, fell in 59 and stayed the same in 56.",
      creditHtml: 'The Institute matched occupations and calculated changes between the <a href="https://www.onetcenter.org/dl_files/db_15_0.zip">O*NET® 15.0</a> and <a href="https://www.onetcenter.org/dl_files/database/db_31_0_text.zip">31.0</a> Databases.',
    },
  },
};

export function StudyResources({ slug }: { slug: string }) {
  const study = materials[slug];
  if (!study) return null;
  const chart = study.chart;
  const studyUrl = `${SITE.url}/research/${slug}`;
  return (
    <section aria-labelledby="study-materials" className="no-print mt-8 border-t border-rule pt-5">
      <h2 id="study-materials" className="font-serif text-xl font-semibold text-ink">Study resources</h2>
      <ul className="mt-2 flex flex-wrap gap-x-5 gap-y-2 text-sm text-accent">
        {study.links.map(([label, href]) => (
          <li key={href}><a href={href} className="underline underline-offset-2">{label}</a></li>
        ))}
      </ul>
      {chart && (
        <details className="mt-4 text-sm">
          <summary className="cursor-pointer py-3 font-medium text-ink">Download or embed the chart</summary>
          <p className="mt-3 text-ink-2">{chart.alt}</p>
          <a href={chart.image} download className="inline-block py-2 text-accent underline underline-offset-2">Download chart (PNG)</a>
          <p className="mt-2 text-ink-2">Copy this HTML to include the chart and its source.</p>
          <pre tabIndex={0} aria-label="Chart embed HTML" className="mt-2 overflow-x-auto whitespace-pre-wrap break-words rounded-md border border-rule bg-paper-2 p-3 text-xs text-ink">
            <code>{`<figure>
  <img src="${SITE.url}${chart.image}" alt="${chart.alt}" width="750" style="max-width:100%;height:auto">
  <figcaption><a href="${studyUrl}">${SITE.name}</a>. ${chart.creditHtml} The U.S. Department of Labor, Employment and Training Administration (USDOL/ETA) provides the O*NET data under <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>. O*NET® is a trademark of USDOL/ETA. The agency has not endorsed or tested the Institute’s analysis.</figcaption>
</figure>`}</code>
          </pre>
        </details>
      )}
    </section>
  );
}
