import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { Prose } from "@/components/Prose";
import { archiveUrl, cutoff, leadingRatings, position, rankedCount } from "@/data/speakingImportance";
import { JsonLd, pageMetadata } from "@/lib/seo";
import { SITE } from "@/data/site";
import styles from "./rankings.module.css";

export const metadata = pageMetadata({
  title: "Which U.S. occupations rate speaking most important?",
  description: "Compare the highest published Speaking importance ratings in the O*NET 31.0 Database. See every occupation tied at the cutoff and download the table.",
  path: "/data/speaking-importance-rankings",
});

export default function ImportanceRankings() {
  const first = leadingRatings[0];
  const tied = leadingRatings.filter(row => row.importance === cutoff).length;
  const above = leadingRatings.length - tied;

  return <>
    <JsonLd data={{
      "@context": "https://schema.org", "@type": "Dataset",
      name: "Highest O*NET Speaking importance ratings, with ties",
      description: "Occupations with the highest published Speaking importance ratings in the O*NET 31.0 Database, ranked with every tie at the cutoff retained.",
      url: `${SITE.url}/data/speaking-importance-rankings`,
      creator: { "@type": "NGO", name: SITE.name, url: SITE.url },
      license: "https://creativecommons.org/licenses/by/4.0/", isAccessibleForFree: true,
      spatialCoverage: "United States", isBasedOn: "https://www.onetcenter.org/database.html",
      distribution: [{ "@type": "DataDownload", encodingFormat: "text/csv", contentUrl: `${SITE.url}/data/speaking-importance-ranks.csv` }],
    }} />
    <PageHeader eyebrow="Speaking at Work · Open data" title="Which U.S. occupations rate speaking most important?"
      lede={<>College and university teachers of anthropology and archeology have the highest published Speaking importance rating, at {first.importance.toFixed(2)} out of 5. Further down the list, {tied} occupations share the rating at position {position}.</>} />
    <Prose>
      <p>Speaking here means conveying information by talking to other people. In the August 2026 O*NET® Database, clergy, broadcast announcers and K–12 education administrators each had a rating of 4.75.</p>
      <h2>Highest published ratings, including ties</h2>
      <p>Among {rankedCount} occupations with a rating, {above} scored above {cutoff.toFixed(2)} and {tied} scored exactly {cutoff.toFixed(2)}. Those {tied} share rank {above + 1}, spanning positions {above + 1} through {leadingRatings.length}. Occupations appear alphabetically within each tie.</p>
      <figure>
        <img src="/charts/speaking-importance-rankings.png" width={1512} height={1570} loading="lazy" className="h-auto w-full max-w-lg"
          alt="Of the 42 occupations, 1 scored 4.88, 6 scored 4.75, 7 scored 4.62, 3 scored 4.50 and 2 scored 4.38. The other 23 scored 4.25 and share rank 20." />
        <figcaption className="mt-2 text-sm"><a href="/charts/speaking-importance-rankings.png" download>Download the chart (PNG)</a>. Credit Wellspoken Institute and the O*NET® 31.0 Database, USDOL/ETA. <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>.</figcaption>
      </figure>
      <p><a href="/data/speaking-importance-ranks.csv" download>Download the ranked table with occupation codes and source credits (CSV)</a></p>
      <div className="table-wrap"><table className={styles.rankings}>
        <caption className="p-2 text-left">O*NET 31.0 Speaking importance, on a scale from 1 to 5</caption>
        <thead><tr><th scope="col">Rank</th><th scope="col">Occupation</th><th scope="col">Rating</th></tr></thead>
        <tbody>{leadingRatings.map(row => <tr key={row.code}>
          <td>{row.rank}</td><th scope="row">{row.title}</th><td>{row.importance.toFixed(2)}</td>
        </tr>)}</tbody>
      </table></div>
      <h2>How to reproduce the list</h2>
      <p>In the <a href={archiveUrl}>original O*NET 31.0 text archive</a>, open <code>Essential Skills.txt</code>. Select Speaking (element <code>2.A.1.d</code>), Importance (scale <code>IM</code>) and Analyst as the data source. Exclude rows flagged for suppression or marked not relevant. Match titles from <code>Occupation Data.txt</code> by O*NET-SOC code and sort the ratings from high to low. Keep every value at least as high as the one at position {position}. The <a href="https://www.onetcenter.org/dictionary/31.0/csv/essential_skills.html">federal data dictionary</a> defines each field.</p>
      <p>To check with the <a href="/data/speaking-by-occupation.csv" download>Institute’s full occupation spreadsheet</a>, filter the column named “Speaking importance (1-5)” to {cutoff.toFixed(2)} or higher. The Rank column in that larger spreadsheet orders the Institute’s three-measure Speaking Demand Score. The table on this page uses only the single federal importance rating.</p>
      <h2>What does a high rating tell us?</h2>
      <p>A score of 4 means speaking is very important to the occupation and 5 means extremely important. Each published estimate draws on eight analyst ratings. To find out how often a person gives speeches or how much of their day they spend talking, you would need a frequency or time measure. Small differences between ratings alone cannot establish a meaningful difference between occupations.</p>
      <p>Wellspoken Institute ranked ratings from the O*NET® 31.0 Database, U.S. Department of Labor, Employment and Training Administration (USDOL/ETA). Data and adaptation are available under <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>. O*NET® is a trademark of USDOL/ETA. The agency has not approved, endorsed or tested this analysis. <a href="https://www.onetonline.org/help/online/scales">O*NET scale definitions</a>.</p>
      <p><Link href="/data/speaking-by-occupation">Explore all occupations and their Speaking Demand Scores</Link> or <Link href="/research/speaking-at-work-2026">read the employment-weighted research brief</Link>.</p>
    </Prose>
  </>;
}
