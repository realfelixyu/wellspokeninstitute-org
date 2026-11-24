"use client";

import { useEffect, useMemo, useState } from "react";
import { Panel } from "./ui";

type Row = [number, string, string, number, number, number, number | null, number | null, number | null, number | null, number | null, number | null];

export default function DemandLookup() {
  const [rows, setRows] = useState<Row[]>([]);
  const [q, setQ] = useState("");
  const [sel, setSel] = useState<Row | null>(null);

  useEffect(() => {
    fetch("/data/speaking-by-occupation.json")
      .then((r) => r.json())
      .then((d) => setRows(d.rows))
      .catch(() => setRows([]));
  }, []);

  const matches = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (s.length < 2) return [];
    return rows.filter((r) => r[2].toLowerCase().includes(s)).slice(0, 8);
  }, [q, rows]);

  const total = rows.length;
  const pct = sel ? Math.round(((total - sel[0]) / (total - 1)) * 100) : 0;
  const label = (v: number) => (v >= 4 ? "very important" : v >= 3.5 ? "quite important" : v >= 3 ? "important" : v >= 2 ? "somewhat important" : "not very important");

  return (
    <Panel>
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-ink">Your occupation</span>
        <input
          type="search"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setSel(null);
          }}
          placeholder="Start typing, for example: accountant"
          className="h-12 w-full rounded-lg border border-rule bg-paper px-3 text-ink"
        />
      </label>
      {matches.length && !sel ? (
        <ul className="mt-2 divide-y divide-rule rounded-lg border border-rule bg-paper">
          {matches.map((r) => (
            <li key={r[1]}>
              <button type="button" onClick={() => setSel(r)} className="w-full px-3 py-2.5 text-left text-ink hover:bg-paper-2">
                {r[2]}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      {sel ? (
        <div className="mt-6 rounded-xl border border-rule bg-paper p-5" aria-live="polite">
          <p className="font-serif text-2xl font-semibold text-ink">{sel[2]}</p>
          <p className="mt-3 text-ink-2">
            Speaking is rated <strong className="text-ink">{label(sel[4])}</strong> ({sel[4].toFixed(2)} of 5) in
            this job. Its Speaking Demand Score is <strong className="text-ink">{sel[3].toFixed(1)}</strong>, higher
            than <strong className="text-ink">{pct}%</strong> of the {total} occupations we rank.
          </p>
          <p className="mt-3 text-sm text-ink-3">
            Rank {sel[0]} of {total}. Based on O*NET® 31.0 ratings.{" "}
            <a className="underline" href="/data/speaking-by-occupation">See the full dataset and method.</a>
          </p>
        </div>
      ) : null}
    </Panel>
  );
}
