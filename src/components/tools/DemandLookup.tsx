"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Panel } from "./ui";
import { useOccupationData, type ExplorerRow } from "../useOccupationData";
import { EmploymentGroupSummary, findOccupationMatches } from "../EmploymentGroupResults";
import { compareOccupationScore } from "@/lib/occupation-score";
import { groupForOccupation } from "@/lib/employmentGroups";

export default function DemandLookup() {
  const { rows, loadState, retry } = useOccupationData();
  const [q, setQ] = useState("");
  const [sel, setSel] = useState<ExplorerRow | null>(null);

  const resultHeading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (sel) resultHeading.current?.focus();
  }, [sel]);

  const { occupations, groups } = useMemo(() => {
    if (q.trim().length < 2) return { occupations: [], groups: [] };
    return findOccupationMatches(rows, q);
  }, [q, rows]);
  const matches = occupations.slice(0, 8);
  const selectedGroup = sel ? groupForOccupation(sel[1]) : undefined;

  const total = rows.length;
  const comparison = sel ? compareOccupationScore(rows.map(row => row[3]), sel[3]) : null;
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
      {loadState === "loading" && <p role="status">Loading occupations…</p>}
      {loadState === "error" && <p role="status">The occupation data could not load. <button type="button" onClick={retry} className="underline">Try again</button></p>}
      {loadState === "ready" && q.trim().length >= 2 && !matches.length && !groups.length && <p role="status">No matching occupations.</p>}
      {!sel && groups.length > 0 && (
        <p role="status" className="mt-3 text-sm text-ink-2">
          Found {groups.length} matching BLS employment {groups.length === 1 ? "group" : "groups"}.
        </p>
      )}
      {matches.length > 0 && !sel ? (
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
        <div className="mt-6 rounded-xl border border-rule bg-paper p-5">
          <h2 ref={resultHeading} tabIndex={-1} className="font-serif text-2xl font-semibold text-ink">{sel[2]}</h2>
          <p className="mt-3 text-ink-2">
            Speaking is rated <strong className="text-ink">{label(sel[4])}</strong> ({sel[4].toFixed(2)} of 5) in this job.{" "}
            {comparison && sel[3] !== null ? (
              <>Its Speaking Demand Score is <strong className="text-ink">{sel[3].toFixed(1)}</strong>, higher
              than <strong className="text-ink">{comparison.percentBelow}%</strong> of the {comparison.ratedCount} rated {comparison.ratedCount === 1 ? "occupation" : "occupations"}.</>
            ) : "A composite Speaking Demand Score is unavailable."}
          </p>
          <p className="mt-3 text-sm text-ink-3">
            {comparison && `List position ${sel[0]} of ${total}. `}Based on O*NET® 31.0 ratings.{" "}
            <a className="underline" href="/data/speaking-by-occupation">See the full dataset and method.</a>
          </p>
        </div>
      ) : null}
      {sel
        ? selectedGroup && <EmploymentGroupSummary group={selectedGroup} />
        : groups.map(group => <EmploymentGroupSummary key={group.code} group={group} />)}
    </Panel>
  );
}
