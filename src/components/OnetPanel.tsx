import Link from "next/link";
import outlook from "@data/bls-employment-outlook.json";
import { findOccupation, percentileOf, OCCUPATIONS, usd } from "@/data/stats";

function level(v: number | null | undefined) {
  if (v == null) return "n/a";
  return v >= 4 ? "very important" : v >= 3.5 ? "quite important" : v >= 3 ? "important" : v >= 2 ? "somewhat important" : "not very important";
}

const projections = new Map(outlook.rows.map(row => [row.soc, row]));

export function OnetPanel({ code }: { code: string }) {
  const o = findOccupation(code);
  if (!o) return null;
  const pct = percentileOf(code);
  const projection = projections.get(o.soc);
  const rows: [string, string][] = [
    ["Speaking Demand Score", `${o.speakingDemandScore?.toFixed(1)} of 100 (rank ${o.rank} of ${OCCUPATIONS.count}, higher than ${pct}% of occupations)`],
    ["Speaking importance", `${o.speakingImportance?.toFixed(2)} of 5 (${level(o.speakingImportance)})`],
    ["Speaking level required", `${o.speakingLevel?.toFixed(2)} of 7`],
    ["Oral expression importance", `${o.oralExpressionImportance?.toFixed(2)} of 5`],
    ["Public speaking", o.publicSpeakingFrequency != null ? `${o.publicSpeakingFrequency.toFixed(2)} of 5 on average` : "n/a"],
    ["Face-to-face discussions", o.faceToFaceFrequency != null ? `${o.faceToFaceFrequency.toFixed(2)} of 5 on average` : "n/a"],
    ["U.S. employment (May 2025)", o.employment ? Math.round(o.employment).toLocaleString("en-US") : "n/a"],
    ["Median annual wage (May 2025)", usd(o.medianWage)],
  ];
  return (
    <aside aria-labelledby="onet-panel" className="mb-10 rounded-xl border border-rule bg-card p-6">
      <h2 id="onet-panel" className="font-serif text-xl font-semibold text-ink">
        Speaking demands: {o.title}
      </h2>
      <dl className="mt-4 grid gap-x-6 gap-y-3 text-[0.95rem] sm:grid-cols-2">
        {rows.map(([k, v]) => (
          <div key={k}>
            <dt className="text-ink-3">{k}</dt>
            <dd className="font-medium text-ink">{v}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-4 text-sm text-ink-2">
        {projection ? <>BLS projects a change of <strong>{projection.percentChange > 0 ? "+" : ""}{projection.percentChange.toFixed(1)}%</strong> in national employment for {projection.title.toLowerCase()} from 2025 to 2035. This estimate covers the six-digit occupation group ({o.soc}).</>
          : <>A matching 2025 to 2035 national employment projection is unavailable for occupation code {o.soc}.</>}{" "}
        <a className="underline" href={outlook.url}>BLS employment projections, Table 1.2</a>
      </p>
      <p className="mt-4 text-sm text-ink-3">
        O*NET-SOC {o.code}. Compare every occupation in our{" "}
        <Link href="/data/speaking-by-occupation" className="underline underline-offset-2 hover:text-accent">
          speaking by occupation data
        </Link>
        .
      </p>
    </aside>
  );
}

export function OnetAttribution() {
  return (
    <p className="mt-8 text-xs leading-relaxed text-ink-3">
      This page includes information from the{" "}
      <a className="underline" href="https://www.onetcenter.org/database.html">O*NET 31.0 Database</a> by the U.S.
      Department of Labor, Employment and Training Administration (USDOL/ETA). Used under the{" "}
      <a className="underline" href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a> license. O*NET® is a
      trademark of USDOL/ETA. Wellspoken Institute has modified all or some of this information. USDOL/ETA has not
      approved, endorsed, or tested these modifications. Employment and wages: U.S. Bureau of Labor Statistics, OEWS
      May 2025.
    </p>
  );
}
