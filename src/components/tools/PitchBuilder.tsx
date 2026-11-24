"use client";

import { useState } from "react";
import { Panel, Stat } from "./ui";
import { formatDuration, wordCount } from "@/lib/text";

const FIELDS = [
  { key: "who", label: "Who you are", hint: "Name and role in one line", example: "I'm Dana, a nurse educator at a community hospital." },
  { key: "problem", label: "The problem you work on", hint: "What do you help with?", example: "New nurses often struggle to hand off patients clearly at shift change." },
  { key: "approach", label: "What you do about it", hint: "Your approach or skill", example: "I run short, practice-based handoff workshops built on a simple checklist." },
  { key: "proof", label: "One result or proof point", hint: "A number, outcome, or example", example: "On my unit, handoff questions from the next shift dropped noticeably within two months." },
  { key: "ask", label: "What you want next", hint: "A clear, small ask", example: "I'd love to compare notes on how your team handles handoffs." },
] as const;

type Key = (typeof FIELDS)[number]["key"];

export default function PitchBuilder() {
  const [v, setV] = useState<Record<Key, string>>(
    Object.fromEntries(FIELDS.map((f) => [f.key, f.example])) as Record<Key, string>
  );
  const pitch = FIELDS.map((f) => v[f.key].trim()).filter(Boolean).join(" ");
  const n = wordCount(pitch);
  return (
    <Panel>
      <div className="space-y-4">
        {FIELDS.map((f) => (
          <label key={f.key} className="block">
            <span className="block text-sm font-medium text-ink">{f.label}</span>
            <span className="block text-xs text-ink-3">{f.hint}</span>
            <input
              value={v[f.key]}
              onChange={(e) => setV((s) => ({ ...s, [f.key]: e.target.value }))}
              className="mt-1.5 h-11 w-full rounded-lg border border-rule bg-paper px-3 text-ink"
            />
          </label>
        ))}
      </div>
      <div className="mt-6 rounded-xl border border-rule bg-paper p-5">
        <p className="text-sm font-semibold uppercase tracking-wider text-accent">Your pitch</p>
        <p className="mt-2 font-serif text-xl leading-relaxed text-ink">{pitch}</p>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Stat value={n} label="words" />
        <Stat value={formatDuration((n / 140) * 60)} label="at a comfortable 140 wpm" />
      </div>
      <p className="mt-4 text-sm text-ink-3">
        Say it out loud three times. If it runs past a minute, cut the proof point to one short sentence.
      </p>
    </Panel>
  );
}
