"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Panel, TextArea, Button, NumberField, SAMPLE_SCRIPT } from "./ui";
import { words } from "@/lib/text";

function phrases(text: string): string[] {
  return text
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?;:,])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export default function PausePractice() {
  const [text, setText] = useState(SAMPLE_SCRIPT);
  const [wpm, setWpm] = useState(140);
  const [gap, setGap] = useState(1);
  const [idx, setIdx] = useState(-1);
  const [pausing, setPausing] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const list = useMemo(() => phrases(text), [text]);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  useEffect(() => {
    if (idx < 0 || idx >= list.length) return;
    const speakMs = (words(list[idx]).length / wpm) * 60000;
    setPausing(false);
    timer.current = setTimeout(() => {
      setPausing(true);
      timer.current = setTimeout(() => setIdx((i) => i + 1), gap * 1000);
    }, speakMs);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [idx, list, wpm, gap]);

  const running = idx >= 0 && idx < list.length;

  return (
    <Panel>
      <TextArea label="Your script" value={text} onChange={(v) => { setText(v); setIdx(-1); }} rows={6} />
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <NumberField label="Speaking pace" value={wpm} onChange={setWpm} min={90} max={190} step={5} suffix="wpm" />
        <NumberField label="Pause length" value={gap} onChange={setGap} min={0.5} max={3} step={0.25} suffix="sec" />
      </div>
      <div className="mt-5 flex gap-3">
        <Button onClick={() => setIdx(0)}>{running ? "Restart" : "Start"}</Button>
        {running ? <Button variant="secondary" onClick={() => setIdx(-1)}>Stop</Button> : null}
      </div>
      <div className="mt-6 min-h-40 rounded-xl border border-rule bg-paper p-6" aria-live="polite">
        {running ? (
          <>
            <p className={`font-serif text-2xl leading-snug sm:text-3xl ${pausing ? "text-ink-3" : "text-ink"}`}>{list[idx]}</p>
            <p className="mt-4 text-sm font-semibold uppercase tracking-wider text-accent">{pausing ? "Pause" : "Say it"}</p>
          </>
        ) : idx >= list.length ? (
          <p className="text-ink-2">Done. Try again with a slightly longer pause and notice how it feels.</p>
        ) : (
          <p className="text-ink-2">Press start, then say each phrase aloud as it appears. Stay silent during each pause.</p>
        )}
      </div>
    </Panel>
  );
}
