import Link from "next/link";
import { Container, PageHeader } from "@/components/PageHeader";
import { pageMetadata } from "@/lib/seo";

const base = "/data/speaking-demand-over-time";
const downloads = "/data/occupation-history-files";
export const metadata = pageMetadata({
  title: "Methods and data for the historical speaking-ratings comparison",
  description: "Reproduce the exact-code, title and definition match between O*NET Database releases 15.0 and 31.0, including rating dates and change counts.",
  path: base,
});

export default function Methods() {
  return <>
    <PageHeader eyebrow="Methods and data" title="Comparing two releases of occupational speaking ratings"
      lede="Download the occupation-level results or reproduce the comparison with the original archives. Each row identifies the job and the dates of the two sets of ratings." />
    <Container narrow><div className="prose-body pb-12">
      <h2>Files</h2>
      <ul>
        <li><a href={downloads + "/matched-occupations.csv"} download>Occupation ratings and changes (CSV)</a></li>
        <li><a href={downloads + "/summary.json"} download>Counts, summary statistics and source checksums (JSON)</a></li>
        <li><a href={downloads + "/reproduce.py"} download>Analysis script (Python)</a></li>
        <li><a href="/charts/speaking-ratings-two-releases.png" download>Chart for reuse (PNG)</a></li>
        <li><a href="/papers/speaking-demand-over-time-press.html">Press summary</a></li>
      </ul>
      <p><Link href="/curriculum/explain-a-research-finding">Teach the comparison in a 20-minute college speaking lesson</Link> using two of the occupations in the data.</p>
      <h2>Source files and matching</h2>
      <p>Download the <a href="https://www.onetcenter.org/dl_files/db_15_0.zip">July 2010 O*NET® 15.0 archive</a> and the <a href="https://www.onetcenter.org/dl_files/database/db_31_0_text.zip">August 2026 O*NET 31.0 archive</a> into one folder called <code>archives</code>. Keep their original filenames. With Python 3.8 or later, run <code>python3 reproduce.py archives results</code>. The script checks the SHA-256 checksum of each archive before reading its tables.</p>
      <p>We selected the Speaking element (2.A.1.d), kept analyst ratings on both scales, and excluded ratings flagged for suppression or marked irrelevant. The script joins occupation codes, then compares titles and descriptions after ignoring capitalization and repeated whitespace. Punctuation and wording must match. We did not allocate ratings from a split or merged occupation to its successors.</p>
      <p>Release 15.0 supplies the starting values in the columns ending in <code>_15</code>. Release 31.0 supplies values ending in <code>_31</code>. To reproduce the headline table, exclude rows with identical rating dates, subtract the earlier value from the later one, and count positive, zero and negative differences. Each occupation counts once.</p>
      <h2>Interpretation and reuse</h2>
      <p>Changing a definition by one word excludes a job, even when its work stayed similar. A matching definition can also conceal changes in the work itself. The sample favors longstanding classifications, and later rating dates vary by occupation. The comparisons describe releases, with no employment weighting or test of statistical significance.</p>
      <p>Adapted from the O*NET 15.0 and 31.0 Databases, US Department of Labor, Employment and Training Administration (USDOL/ETA), under <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>. The Institute matched observations and calculated differences. USDOL/ETA has not approved, endorsed or tested these modifications. O*NET® is a trademark of USDOL/ETA.</p>
      <p><Link href="/research/speaking-demand-over-time">Read the study</Link></p>
    </div></Container>
  </>;
}
