"use client";

import { useState } from "react";
import { Panel, TextArea } from "./ui";

const REVERSED = new Set([4, 6, 7, 8, 11, 12, 15, 16, 17, 18, 24, 26]);

export default function AnxietyCheck() {
  const [text, setText] = useState("");
  const values = text.trim() ? text.trim().split(/[\s,;]+/) : [];
  const valid = values.every(value => /^[1-5]$/.test(value));
  const complete = valid && values.length === 34;
  const score = complete ? values.reduce((total, value, i) =>
    total + (REVERSED.has(i + 1) ? 6 - Number(value) : Number(value)), 0) : null;
  const band = score === null ? "" : score < 98 ? "low" : score > 131 ? "high" : "moderate";

  return <Panel>
    <p className="mb-4 leading-relaxed text-ink-2">
      Open <a href="https://www.jamescmccroskey.com/measures/prpsa.htm" target="_blank" rel="noopener" className="text-accent underline">McCroskey’s questionnaire (new tab)</a>.
      Read each statement in order. Write 1 for strongly disagree, 2 for disagree, 3 for neutral, 4 for agree, or 5 for strongly agree.
    </p>
    <TextArea label="Your 34 responses, separated by spaces or commas" value={text} onChange={setText} rows={3} placeholder="3 2 4 …" />
    <p className="mt-2 text-sm text-ink-2" role="status">
      {!valid ? "Use whole numbers from 1 through 5." : values.length > 34 ? "There are extra responses. Enter one for each of the 34 statements." : `${values.length} of 34 responses entered.`}
    </p>
    {score !== null && <div aria-live="polite" className="mt-5 rounded-lg border border-rule bg-paper p-4">
      <p className="font-serif text-2xl font-semibold">{score} / 170</p>
      <p className="mt-1 text-ink-2">This falls in the {band} range of McCroskey’s scoring key. Your answers describe how you feel about giving speeches.</p>
    </div>}
    <p className="mt-5 text-sm text-ink-3">The author permits instructional use of this measure. <a className="underline" href="https://www.jamescmccroskey.com/measures/">Read the terms.</a></p>
  </Panel>;
}
