"use client";

import { useState } from "react";
import { Panel, TextArea, Stat, NumberField, SAMPLE_SCRIPT } from "./ui";
import { formatDuration, sentences, wordCount } from "@/lib/text";

export default function SpeechLength() {
  const [text, setText] = useState(SAMPLE_SCRIPT);
  const [wpm, setWpm] = useState(140);
  const [pause, setPause] = useState(0.5);
  const n = wordCount(text);
  const s = sentences(text).length;
  const at = (rate: number) => (n / rate) * 60 + s * pause;
  return (
    <Panel>
      <TextArea label="Paste your script" value={text} onChange={setText} rows={10} />
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <NumberField label="Your speaking rate" value={wpm} onChange={setWpm} min={90} max={200} step={5} suffix="wpm" />
        <NumberField label="Pause after each sentence" value={pause} onChange={setPause} min={0} max={3} step={0.25} suffix="sec" />
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-4">
        <Stat value={n} label={`words, ${s} sentences`} />
        <Stat value={formatDuration(at(wpm))} label={`at ${wpm} wpm`} />
        <Stat value={formatDuration(at(120))} label="slower, at 120 wpm" />
        <Stat value={formatDuration(at(160))} label="faster, at 160 wpm" />
      </div>
      <p className="mt-4 text-sm text-ink-3">
        Estimates include your pause setting after every sentence. Time a real run-through with the{" "}
        <a className="underline" href="/tools/speaking-rate-calculator">speaking rate calculator</a> to set your own rate.
      </p>
    </Panel>
  );
}
