"use client";

import { useState } from "react";
import { Panel, Button } from "./ui";

const ITEMS = [
  "In the days before I have to speak, I think about it a lot.",
  "Right before speaking, I notice a racing heart, shaky hands, or a dry mouth.",
  "While speaking, my mind sometimes goes blank.",
  "I avoid opportunities to speak in meetings or classes.",
  "I worry that listeners are judging me negatively.",
  "After speaking, I replay what went wrong.",
  "Speaking up has held me back at school or work.",
  "I would like to feel calmer and more prepared when I speak.",
];

const SCALE = ["Not at all", "A little", "Somewhat", "Quite a bit", "Very much"];

export default function AnxietyCheck() {
  const [answers, setAnswers] = useState<(number | null)[]>(ITEMS.map(() => null));
  const [show, setShow] = useState(false);
  const complete = answers.every((a) => a !== null);
  const total = answers.reduce<number>((s, a) => s + (a ?? 0), 0);
  const max = ITEMS.length * 4;
  const band = total <= max * 0.3 ? "low" : total <= max * 0.6 ? "moderate" : "high";

  return (
    <Panel>
      <p className="text-sm text-ink-3">
        This is a private self-reflection, not a diagnosis or a validated clinical test. Your answers never leave
        this page.
      </p>
      <ol className="mt-5 space-y-6">
        {ITEMS.map((item, idx) => (
          <li key={item}>
            <fieldset>
              <legend className="font-medium text-ink">
                {idx + 1}. {item}
              </legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {SCALE.map((label, v) => (
                  <label
                    key={label}
                    className={`cursor-pointer rounded-full border px-3 py-1.5 text-sm ${answers[idx] === v ? "border-accent bg-accent-soft text-ink" : "border-rule text-ink-2"}`}
                  >
                    <input
                      type="radio"
                      name={`q${idx}`}
                      className="sr-only"
                      checked={answers[idx] === v}
                      onChange={() => setAnswers((a) => a.map((x, j) => (j === idx ? v : x)))}
                    />
                    {label}
                  </label>
                ))}
              </div>
            </fieldset>
          </li>
        ))}
      </ol>
      <div className="mt-6">
        <Button onClick={() => setShow(true)} disabled={!complete}>
          See my reflection
        </Button>
      </div>
      {show && complete ? (
        <div className="mt-6 rounded-xl border border-rule bg-paper p-5" aria-live="polite">
          <p className="font-serif text-xl font-semibold text-ink">
            Your responses suggest {band} speaking-related anxiety right now.
          </p>
          <p className="mt-3 text-ink-2">
            {band === "low"
              ? "Speaking does not seem to weigh heavily on you. Keep building range by taking on slightly bigger speaking tasks than usual."
              : band === "moderate"
                ? "This is very common. Structured, gradual practice tends to help: rehearse out loud, start with small low-stakes audiences, and increase the challenge step by step."
                : "Speaking seems to cost you a lot right now, and that is common too. Gradual, repeated practice with supportive audiences helps many people. If anxiety affects your daily life, a licensed mental health professional can help, and cognitive behavioral approaches have good evidence."}
          </p>
          <p className="mt-3 text-sm text-ink-3">
            Read more in our <a className="underline" href="/learn">explainers</a> on speaking anxiety.
          </p>
        </div>
      ) : null}
    </Panel>
  );
}
