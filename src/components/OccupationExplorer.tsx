"use client";

import { useEffect, useMemo, useState } from "react";

type Row = [number, string, string, number, number, number, number | null, number | null, number | null, number | null, number | null, number | null];

interface Props {
  initial: Row[];
}

const SORTS = {
  score: { label: "Speaking Demand Score", idx: 3 },
  importance: { label: "Speaking importance", idx: 4 },
  public: { label: "Public speaking frequency", idx: 7 },
  employment: { label: "Employment", idx: 9 },
  wage: { label: "Median wage", idx: 10 },
} as const;

type SortKey = keyof typeof SORTS;

function fmtInt(n: number | null) {
  return n == null ? "n/a" : Math.round(n).toLocaleString("en-US");
}

export function OccupationExplorer({ initial }: Props) {
  const [rows, setRows] = useState<Row[]>(initial);
  const [loaded, setLoaded] = useState(false);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("score");
  const [desc, setDesc] = useState(true);
  const [limit, setLimit] = useState(50);

  useEffect(() => {
    let alive = true;
    fetch("/data/speaking-by-occupation.json")
      .then((r) => r.json())
      .then((d) => {
        if (alive) {
          setRows(d.rows);
          setLoaded(true);
        }
      })
      .catch(() => setLoaded(false));
    return () => {
      alive = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q ? rows.filter((r) => r[2].toLowerCase().includes(q) || r[1].startsWith(q)) : rows;
    const idx = SORTS[sort].idx;
    return [...list].sort((a, b) => {
      const av = (a[idx] as number | null) ?? -Infinity;
      const bv = (b[idx] as number | null) ?? -Infinity;
      return desc ? bv - av : av - bv;
    });
  }, [rows, query, sort, desc]);

  const shown = filtered.slice(0, limit);

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <label className="flex-1">
          <span className="mb-1 block text-sm font-medium text-ink">Search occupations</span>
          <input
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setLimit(50);
            }}
            placeholder="For example: nurse, engineer, teacher"
            className="h-11 w-full rounded-lg border border-rule bg-card px-3 text-ink placeholder:text-ink-3"
          />
        </label>
        <label>
          <span className="mb-1 block text-sm font-medium text-ink">Sort by</span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="h-11 w-full rounded-lg border border-rule bg-card px-3 text-ink sm:w-60"
          >
            {Object.entries(SORTS).map(([k, v]) => (
              <option key={k} value={k}>
                {v.label}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          onClick={() => setDesc((d) => !d)}
          className="h-11 rounded-lg border border-rule bg-card px-4 text-sm text-ink hover:border-accent"
          aria-label={desc ? "Sorted high to low. Switch to low to high" : "Sorted low to high. Switch to high to low"}
        >
          {desc ? "High to low" : "Low to high"}
        </button>
      </div>
      <p className="mt-3 text-sm text-ink-3" aria-live="polite">
        {loaded ? `${filtered.length} of ${rows.length} occupations` : `Showing top ${initial.length} occupations. Loading all…`}
      </p>
      <div className="mt-4 overflow-x-auto rounded-xl border border-rule">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-paper-2 text-ink">
            <tr>
              <th className="px-3 py-2.5 font-semibold">#</th>
              <th className="px-3 py-2.5 font-semibold">Occupation</th>
              <th className="px-3 py-2.5 text-right font-semibold">Score</th>
              <th className="px-3 py-2.5 text-right font-semibold">Speaking importance</th>
              <th className="px-3 py-2.5 text-right font-semibold">Public speaking</th>
              <th className="px-3 py-2.5 text-right font-semibold">Employment</th>
              <th className="px-3 py-2.5 text-right font-semibold">Median wage (USD)</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((r) => (
              <tr key={r[1]} className="border-t border-rule">
                <td className="px-3 py-2 text-ink-3">{r[0]}</td>
                <td className="px-3 py-2 text-ink">
                  {r[2]}
                  <span className="ml-2 text-xs text-ink-3">{r[1]}</span>
                </td>
                <td className="px-3 py-2 text-right font-semibold text-accent">{r[3]?.toFixed(1)}</td>
                <td className="px-3 py-2 text-right text-ink-2">{r[4]?.toFixed(2)}</td>
                <td className="px-3 py-2 text-right text-ink-2">{r[7] == null ? "n/a" : r[7].toFixed(2)}</td>
                <td className="px-3 py-2 text-right text-ink-2">{fmtInt(r[9])}</td>
                <td className="px-3 py-2 text-right text-ink-2">{fmtInt(r[10])}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {filtered.length > limit ? (
        <button
          type="button"
          onClick={() => setLimit((l) => l + 100)}
          className="mt-4 rounded-lg border border-rule bg-card px-4 py-2 text-sm text-ink hover:border-accent"
        >
          Show more
        </button>
      ) : null}
    </div>
  );
}
