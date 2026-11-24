"use client";

import { useEffect, useRef, useState } from "react";
import { Panel, TextArea, Stat, Button, SAMPLE_SCRIPT } from "./ui";
import { wordCount } from "@/lib/text";

export default function SpeakingRate() {
  const [text, setText] = useState(SAMPLE_SCRIPT);
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [manualSec, setManualSec] = useState<number | "">("");
  const start = useRef<number | null>(null);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setElapsed((Date.now() - (start.current ?? Date.now())) / 1000), 100);
    return () => clearInterval(id);
  }, [running]);

  const n = wordCount(text);
  const seconds = manualSec !== "" ? manualSec : elapsed;
  const wpm = seconds > 0 ? Math.round((n / seconds) * 60) : null;

  return (
    <Panel>
      <TextArea label="Your passage" value={text} onChange={setText} />
      <div className="mt-4 flex flex-wrap items-center gap-3">
        {!running ? (
          <Button
            onClick={() => {
              setManualSec("");
              setElapsed(0);
              start.current = Date.now();
              setRunning(true);
            }}
          >
            Start timer and read aloud
          </Button>
        ) : (
          <Button onClick={() => setRunning(false)}>Stop</Button>
        )}
        <label className="flex items-center gap-2 text-sm text-ink-2">
          or enter seconds
          <input
            type="number"
            min={1}
            value={manualSec}
            onChange={(e) => {
              setRunning(false);
              setManualSec(e.target.value === "" ? "" : Number(e.target.value));
            }}
            className="h-10 w-24 rounded-lg border border-rule bg-paper px-2 text-ink"
          />
        </label>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <Stat value={n} label="words" />
        <Stat value={`${seconds.toFixed(1)} s`} label="time" />
        <Stat value={wpm ?? "–"} label="words per minute" />
      </div>
      {wpm ? (
        <p className="mt-4 text-[0.98rem] text-ink-2" aria-live="polite">
          {wpm < 110
            ? "That is a slow, deliberate pace. It can suit complex material or a large room; check that your energy stays up."
            : wpm <= 170
              ? "That is a moderate pace. Check that you still pause after key points so listeners can keep up."
              : "That is a fast pace. For new or technical material, try adding pauses after key sentences."}
        </p>
      ) : null}
    </Panel>
  );
}
