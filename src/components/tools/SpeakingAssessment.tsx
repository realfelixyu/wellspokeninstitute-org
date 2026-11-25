"use client";

import { useRef, useState } from "react";
import { HOW_WELL_SPOKEN_QUESTIONS as questions, dimensions, totalsByWeights } from "@/data/speakingAssessment";
import { Button, Panel } from "./ui";

export default function SpeakingAssessment() {
  const [answers, setAnswers] = useState<number[]>([]);
  const [step, setStep] = useState(0);
  const heading = useRef<HTMLHeadingElement>(null);
  const question = questions[step];
  const scores = totalsByWeights(questions, answers);

  function move(next: number) {
    setStep(next);
    requestAnimationFrame(() => heading.current?.focus());
  }

  return <Panel>
    <p className="mb-2 text-sm text-ink-2">{question ? `Question ${step + 1} of ${questions.length}` : "Your reflection"}</p>
    <h2 ref={heading} tabIndex={-1} className="font-serif text-2xl font-semibold">{question?.prompt ?? "How you describe your speaking habits"}</h2>
    {question ? <>
      <div className="my-5 grid gap-2">
        {question.options.map((option, index) => <button type="button" key={option.label}
          className="min-h-11 rounded-lg border border-rule bg-paper px-4 py-2 text-left hover:border-accent aria-pressed:border-accent"
          aria-pressed={answers[step] === index}
          onClick={() => { const next = [...answers]; next[step] = index; setAnswers(next); move(step + 1); }}>
          {option.label}
        </button>)}
      </div>
      {step > 0 && <Button variant="secondary" onClick={() => move(step - 1)}>Previous question</Button>}
    </> : <>
      <p className="my-3 text-ink-2">Higher numbers mean you chose more of the responses associated with that habit. Choose one habit to discuss with a listener after your next conversation.</p>
      <dl className="my-5 grid gap-2">{Object.entries(dimensions).map(([id, name]) =>
        <div className="flex justify-between border-b border-rule py-2" key={id}><dt>{name}</dt><dd>{scores[id]} / 6</dd></div>)}</dl>
      <a className="mr-4 inline-block py-3 text-accent underline" href="/newsletter">Get the Institute research newsletter</a>
      <Button variant="secondary" onClick={() => { setAnswers([]); move(0); }}>Start again</Button>
    </>}
  </Panel>;
}
