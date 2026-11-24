"use client";

import { useMemo, useState } from "react";
import { Panel, TextArea, Stat } from "./ui";
import { FILLERS, wordCount } from "@/lib/text";

const SAMPLE =
  "So, um, I think the main thing is, like, we kind of need to, you know, rethink the plan. Basically the timeline is, uh, actually pretty tight, right? I mean we can do it, but it's sort of risky.";

export default function FillerCounter() {
  const [text, setText] = useState(SAMPLE);
  const result = useMemo(() => {
    const counts = FILLERS.map((f) => ({ label: f.label, count: (text.match(f.re) || []).length })).filter((c) => c.count > 0);
    const total = counts.reduce((a, c) => a + c.count, 0);
    const n = wordCount(text);
    let html = text.replace(/&/g, "&amp;").replace(/</g, "&lt;");
    for (const f of FILLERS) {
      html = html.replace(f.re, (m) => `<mark class="rounded bg-accent-soft px-0.5 text-ink">${m}</mark>`);
    }
    return { counts, total, n, per100: n ? (total / n) * 100 : 0, html };
  }, [text]);

  return (
    <Panel>
      <TextArea label="Paste a transcript of yourself speaking" value={text} onChange={setText} rows={8} />
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <Stat value={result.total} label="filler words and phrases" />
        <Stat value={result.n} label="total words" />
        <Stat value={result.per100.toFixed(1)} label="fillers per 100 words" />
      </div>
      {result.counts.length ? (
        <ul className="mt-5 flex flex-wrap gap-2 text-sm">
          {result.counts.map((c) => (
            <li key={c.label} className="rounded-full border border-rule bg-paper px-3 py-1 text-ink-2">
              {c.label}: <strong className="text-ink">{c.count}</strong>
            </li>
          ))}
        </ul>
      ) : null}
      <div className="mt-5 rounded-lg border border-rule bg-paper p-4 text-[0.98rem] leading-relaxed text-ink-2" dangerouslySetInnerHTML={{ __html: result.html }} />
      <p className="mt-3 text-sm text-ink-3">
        Automatic detection is approximate. Words like &ldquo;like&rdquo; and &ldquo;so&rdquo; are often used
        correctly, so check the highlights.
      </p>
    </Panel>
  );
}
