"use client";

import { useMemo, useState } from "react";
import { Panel, TextArea, Stat, SAMPLE_SCRIPT } from "./ui";
import { sentences, syllables, words } from "@/lib/text";

export default function Speakability() {
  const [text, setText] = useState(SAMPLE_SCRIPT);
  const r = useMemo(() => {
    const ss = sentences(text);
    const ws = words(text);
    const syl = ws.reduce((a, w) => a + syllables(w), 0);
    const long = ss.filter((s) => words(s).length > 25);
    const dense = ws.filter((w) => syllables(w) >= 4);
    const avg = ss.length ? ws.length / ss.length : 0;
    const fk = ss.length && ws.length ? 0.39 * (ws.length / ss.length) + 11.8 * (syl / ws.length) - 15.59 : 0;
    return { ss, ws, avg, long, dense, fk };
  }, [text]);

  return (
    <Panel>
      <TextArea label="Paste a script you will say out loud" value={text} onChange={setText} rows={10} />
      <div className="mt-5 grid gap-3 sm:grid-cols-4">
        <Stat value={r.avg.toFixed(1)} label="words per sentence" />
        <Stat value={r.long.length} label="sentences over 25 words" />
        <Stat value={r.dense.length} label="words with 4+ syllables" />
        <Stat value={Math.max(0, r.fk).toFixed(1)} label="reading grade level" />
      </div>
      {r.long.length ? (
        <div className="mt-5">
          <h3 className="font-medium text-ink">Consider splitting these sentences</h3>
          <ul className="mt-2 space-y-2 text-[0.95rem] text-ink-2">
            {r.long.map((s) => (
              <li key={s} className="rounded-lg border border-rule bg-paper p-3">
                {s}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="mt-5 text-ink-2">No very long sentences. Listeners should be able to follow each one on first hearing.</p>
      )}
      <p className="mt-4 text-sm text-ink-3">
        Listeners cannot reread. Shorter sentences and familiar words are easier to follow by ear. The grade level is
        the Flesch-Kincaid formula, built for reading, so treat it as a rough guide.
      </p>
    </Panel>
  );
}
