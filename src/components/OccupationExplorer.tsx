"use client";

import { useMemo, useRef, useState } from "react";

import { groupForOccupation } from "@/lib/employmentGroups";
import { EmploymentGroupSummary, findOccupationMatches } from "./EmploymentGroupResults";
import { useOccupationData, type ExplorerRow } from "./useOccupationData";

interface Props {
  initial: ExplorerRow[];
  guides: Record<string, string>;
}

const SORTS = {
  score: { label: "Speaking Demand Score", heading: "Score", idx: 3 },
  importance: { label: "Speaking importance", heading: "Speaking importance", idx: 4 },
  public: { label: "Public speaking frequency", heading: "Public speaking", idx: 7 },
  employment: { label: "Employment", heading: "Employment", idx: 9 },
  wage: { label: "Median wage", heading: "Median wage (USD)", idx: 10 },
} as const;

type SortKey = keyof typeof SORTS;

function fmtInt(n: number | null) {
  return n == null ? "n/a" : Math.round(n).toLocaleString("en-US");
}

export function OccupationExplorer({ initial, guides }: Props) {
  const { rows, loadState, retry } = useOccupationData(initial);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("score");
  const [desc, setDesc] = useState(true);
  const [limit, setLimit] = useState(50);
  const searchInput = useRef<HTMLInputElement>(null);

  const matches = useMemo(() => findOccupationMatches(rows, query), [rows, query]);
  const filtered = useMemo(() => {
    const idx = SORTS[sort].idx;
    return [...matches.occupations].sort((a, b) => {
      const av = a[idx];
      const bv = b[idx];
      if (av === bv) return 0;
      if (av === null) return 1;
      if (bv === null) return -1;
      return desc ? bv - av : av - bv;
    });
  }, [matches.occupations, sort, desc]);

  const shown = filtered.slice(0, limit);
  const direction = desc ? "descending" : "ascending";

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <label className="flex-1">
          <span className="mb-1 block text-sm font-medium text-ink">Search occupations</span>
          <input
            type="search"
            ref={searchInput}
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
        {filtered.length > 0 ? (
          <>Showing {shown.length} of {filtered.length} {query.trim() && "matching "}{filtered.length === 1 ? "occupation" : "occupations"}.</>
        ) : matches.groups.length === 0 && (
          <>
            No occupation matches “{query.trim()}”. Try a broader word, such as “teacher” or “manager”, or{" "}
            <button type="button" onClick={() => { setQuery(""); searchInput.current?.focus(); }} className="font-medium text-accent underline underline-offset-2">clear the search</button>.
          </>
        )}
        {matches.groups.length > 0 && ` Found ${matches.groups.length} matching BLS employment ${matches.groups.length === 1 ? "group" : "groups"}.`}
        {loadState === "loading" && " Loading all occupations…"}
        {loadState === "error" && ` The full dataset could not load. Search and sorting cover the top ${initial.length} occupations.`}
      </p>
      {loadState === "error" && (
        <button
          type="button"
          onClick={retry}
          className="mt-2 rounded-lg border border-rule bg-card px-4 py-2 text-sm text-ink hover:border-accent"
        >
          Retry loading all occupations
        </button>
      )}
      {matches.groups.map(group => <EmploymentGroupSummary key={group.code} group={group} />)}
      <p hidden={shown.length === 0} className="mt-4 text-xs text-ink-3 sm:hidden">Swipe the table sideways to see every column.</p>
      <div hidden={shown.length === 0} role="region" aria-label="Occupation rankings" tabIndex={0} className="mt-4 overflow-x-auto rounded-xl border border-rule">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-paper-2 text-ink">
            <tr>
              <th className="px-3 py-2.5 font-semibold">Rank</th>
              <th className="sticky left-0 z-10 bg-paper-2 px-3 py-2.5 font-semibold">Occupation</th>
              {Object.entries(SORTS).map(([key, column]) => (
                <th key={key} aria-sort={sort === key ? direction : undefined} className="px-3 py-2.5 text-right font-semibold">
                  {column.heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {shown.map((r) => {
              const group = r[9] === null ? groupForOccupation(r[1]) : undefined;
              return (
                <tr key={r[1]} className="border-t border-rule">
                  <td className="px-3 py-2 text-ink-3">{r[0]}</td>
                  <td className="sticky left-0 z-10 bg-paper px-3 py-2 text-ink">
                    {guides[r[1]] ? <a href={guides[r[1]]} className="underline underline-offset-2">{r[2]}</a> : r[2]}
                    <span className="ml-2 whitespace-nowrap text-xs text-ink-3">{r[1]}</span>
                  </td>
                  <td className="px-3 py-2 text-right font-semibold text-accent">{r[3]?.toFixed(1) ?? "n/a"}</td>
                  <td className="px-3 py-2 text-right text-ink-2">{r[4]?.toFixed(2)}</td>
                  <td className="px-3 py-2 text-right text-ink-2">{r[7] == null ? "n/a" : r[7].toFixed(2)}</td>
                  <td className="px-3 py-2 text-right text-ink-2">
                    {group ? (
                      <button
                        type="button"
                        aria-label={`Group only, show employment for ${group.title}`}
                        className="min-h-6 whitespace-nowrap underline underline-offset-2"
                        onClick={() => {
                          setQuery(group.code);
                          setLimit(50);
                          searchInput.current?.focus();
                        }}
                      >
                        Group only
                      </button>
                    ) : fmtInt(r[9])}
                  </td>
                  <td className="px-3 py-2 text-right text-ink-2">{fmtInt(r[10])}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {filtered.length > limit ? (
        <button
          type="button"
          onClick={() => setLimit((l) => l + 100)}
          className="mt-4 min-h-11 rounded-lg border border-rule bg-card px-4 py-2 text-sm text-ink hover:border-accent"
        >
          Show more
        </button>
      ) : null}
    </div>
  );
}
