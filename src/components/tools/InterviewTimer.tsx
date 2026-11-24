"use client";

import { useEffect, useRef, useState } from "react";
import { Panel, Button, Stat } from "./ui";

const QUESTIONS = [
  { q: "Tell me about yourself.", min: 60, max: 120 },
  { q: "Why do you want this job?", min: 45, max: 90 },
  { q: "Tell me about a time you handled a conflict at work.", min: 90, max: 150 },
  { q: "What is your greatest strength?", min: 45, max: 90 },
  { q: "Tell me about a mistake you made and what you learned.", min: 60, max: 120 },
  { q: "Where do you see yourself in five years?", min: 30, max: 75 },
  { q: "Why should we hire you?", min: 45, max: 90 },
  { q: "Do you have any questions for us?", min: 20, max: 60 },
];

export default function InterviewTimer() {
  const [i, setI] = useState(0);
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [done, setDone] = useState(false);
  const start = useRef(0);
  const item = QUESTIONS[i];

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setElapsed((Date.now() - start.current) / 1000), 200);
    return () => clearInterval(id);
  }, [running]);

  const verdict = !done
    ? null
    : elapsed < item.min
      ? "Short. Add one concrete example or result so the answer feels complete."
      : elapsed > item.max
        ? "Long. Lead with your main point and cut background the interviewer did not ask for."
        : "On target. That length gives enough detail without losing the listener.";

  return (
    <Panel>
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-ink">Question</span>
        <select
          value={i}
          onChange={(e) => {
            setI(Number(e.target.value));
            setRunning(false);
            setDone(false);
            setElapsed(0);
          }}
          className="h-11 w-full rounded-lg border border-rule bg-paper px-3 text-ink"
        >
          {QUESTIONS.map((q, idx) => (
            <option key={q.q} value={idx}>
              {q.q}
            </option>
          ))}
        </select>
      </label>
      <p className="mt-5 font-serif text-2xl font-semibold text-ink">&ldquo;{item.q}&rdquo;</p>
      <p className="mt-1 text-sm text-ink-3">
        Practice target: {item.min} to {item.max} seconds.
      </p>
      <div className="mt-5 flex flex-wrap gap-3">
        {!running ? (
          <Button
            onClick={() => {
              start.current = Date.now();
              setElapsed(0);
              setDone(false);
              setRunning(true);
            }}
          >
            Start answering
          </Button>
        ) : (
          <Button
            onClick={() => {
              setRunning(false);
              setDone(true);
            }}
          >
            Done
          </Button>
        )}
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <Stat value={`${Math.floor(elapsed)} s`} label="your answer" />
        <Stat value={`${item.min} to ${item.max} s`} label="practice target" />
      </div>
      {verdict ? (
        <p className="mt-4 text-[0.98rem] text-ink-2" aria-live="polite">
          {verdict}
        </p>
      ) : null}
    </Panel>
  );
}
