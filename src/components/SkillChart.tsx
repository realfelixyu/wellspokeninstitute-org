import { SPEAKING_SUMMARY } from "@/data/stats";

/** Horizontal bar chart: mean O*NET importance of basic skills across 910 occupations. */
export function SkillChart() {
  const m = SPEAKING_SUMMARY.skills?.meanImportance;
  if (!m) return null;
  const data = [
    { label: "Active listening", v: m.activeListening },
    { label: "Speaking", v: m.speaking, focus: true },
    { label: "Reading comprehension", v: m.readingComprehension },
    { label: "Writing", v: m.writing },
    { label: "Mathematics", v: m.mathematics },
    { label: "Science", v: m.science },
  ];
  const W = 640;
  const labelW = 190;
  const valueW = 48;
  const barH = 22;
  const gap = 14;
  const top = 8;
  const plotW = W - labelW - valueW;
  const x = (v: number) => ((v - 1) / 4) * plotW;
  const H = top + data.length * (barH + gap) + 26;
  return (
    <figure className="not-prose my-8 rounded-xl border border-rule bg-card p-4 sm:p-6">
      <figcaption className="mb-3 text-sm font-semibold text-ink">
        Average importance of basic skills across 910 occupations (1 = not important, 5 = extremely important)
      </figcaption>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Bar chart of average skill importance" className="h-auto w-full">
        {[1, 2, 3, 4, 5].map((t) => (
          <g key={t}>
            <line x1={labelW + x(t)} x2={labelW + x(t)} y1={top - 4} y2={H - 22} stroke="var(--rule)" strokeWidth="1" />
            <text x={labelW + x(t)} y={H - 6} textAnchor="middle" fontSize="12" fill="var(--ink-3)">
              {t}
            </text>
          </g>
        ))}
        {data.map((d, i) => {
          const y = top + i * (barH + gap);
          const w = Math.max(4, x(d.v));
          return (
            <g key={d.label}>
              <title>{`${d.label}: ${d.v.toFixed(2)}`}</title>
              <text x={labelW - 10} y={y + barH / 2 + 5} textAnchor="end" fontSize="14" fill={d.focus ? "var(--ink)" : "var(--ink-2)"} fontWeight={d.focus ? 700 : 400}>
                {d.label}
              </text>
              <path
                d={`M${labelW},${y} h${w - 4} a4,4 0 0 1 4,4 v${barH - 8} a4,4 0 0 1 -4,4 h${-(w - 4)} z`}
                fill={d.focus ? "var(--accent)" : "var(--ink-3)"}
                opacity={d.focus ? 1 : 0.45}
              />
              <text x={labelW + w + 8} y={y + barH / 2 + 5} fontSize="13" fill="var(--ink)" fontWeight={d.focus ? 700 : 400}>
                {d.v.toFixed(2)}
              </text>
            </g>
          );
        })}
      </svg>
      <p className="mt-2 text-xs text-ink-3">
        Source: Wellspoken Institute analysis of the O*NET® 31.0 Database (USDOL/ETA), CC BY 4.0.
      </p>
    </figure>
  );
}
