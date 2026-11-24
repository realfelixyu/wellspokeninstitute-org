"use client";

import { useEffect, useRef, useState } from "react";
import { Panel, TextArea, Button, NumberField, SAMPLE_SCRIPT } from "./ui";
import { wordCount } from "@/lib/text";

export default function Teleprompter() {
  const [text, setText] = useState(SAMPLE_SCRIPT);
  const [wpm, setWpm] = useState(130);
  const [size, setSize] = useState(34);
  const [running, setRunning] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const last = useRef<number | null>(null);

  useEffect(() => {
    if (!running) return;
    let raf = 0;
    const step = (t: number) => {
      const el = box.current;
      if (el) {
        const dt = last.current == null ? 0 : (t - last.current) / 1000;
        last.current = t;
        const totalWords = Math.max(1, wordCount(text));
        const pxPerWord = (el.scrollHeight - el.clientHeight * 0.4) / totalWords;
        el.scrollTop += (wpm / 60) * pxPerWord * dt;
        if (el.scrollTop + el.clientHeight >= el.scrollHeight - 1) {
          setRunning(false);
          return;
        }
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(raf);
      last.current = null;
    };
  }, [running, wpm, text]);

  return (
    <Panel>
      <TextArea label="Your script" value={text} onChange={setText} rows={5} />
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <NumberField label="Scroll speed" value={wpm} onChange={setWpm} min={80} max={200} step={5} suffix="wpm" />
        <NumberField label="Text size" value={size} onChange={setSize} min={20} max={64} step={2} suffix="px" />
      </div>
      <div className="mt-5 flex gap-3">
        <Button onClick={() => setRunning((r) => !r)}>{running ? "Pause" : "Play"}</Button>
        <Button
          variant="secondary"
          onClick={() => {
            setRunning(false);
            if (box.current) box.current.scrollTop = 0;
          }}
        >
          Back to top
        </Button>
      </div>
      <div
        ref={box}
        className="mt-5 h-[55vh] overflow-y-auto rounded-xl bg-[#0d1117] px-6 py-[20vh] text-center text-white"
        style={{ fontSize: size, lineHeight: 1.45 }}
      >
        {text}
      </div>
    </Panel>
  );
}
