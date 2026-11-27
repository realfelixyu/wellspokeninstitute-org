"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Panel, TextArea, Button, NumberField, SAMPLE_SCRIPT } from "./ui";
import { wordCount } from "@/lib/text";

export default function Teleprompter() {
  const [text, setText] = useState(SAMPLE_SCRIPT);
  const [wpm, setWpm] = useState(130);
  const [size, setSize] = useState(34);
  const [running, setRunning] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const positionBeforeResize = useRef<number | null>(null);
  const count = useMemo(() => wordCount(text), [text]);

  useLayoutEffect(() => {
    const el = box.current;
    if (el && positionBeforeResize.current !== null) {
      el.scrollTop = positionBeforeResize.current * (el.scrollHeight - el.clientHeight);
      positionBeforeResize.current = null;
    }
  }, [size]);

  function changeSize(value: number) {
    const el = box.current;
    if (el) positionBeforeResize.current = el.scrollTop / Math.max(1, el.scrollHeight - el.clientHeight);
    setSize(value);
  }

  useEffect(() => {
    const el = box.current;
    if (!running || !el || !count) return;

    let previousTime: number | undefined;
    let lastPosition = el.scrollTop;
    let progress = lastPosition / Math.max(1, el.scrollHeight - el.clientHeight);
    const durationMs = (count / wpm) * 60_000;
    let frame: number;
    const step = (now: number) => {
      const distance = el.scrollHeight - el.clientHeight;
      if (distance > 0 && Math.abs(el.scrollTop - lastPosition) >= 1) {
        progress = el.scrollTop / distance;
      }
      // Browsers can round scrollTop to whole pixels. Keep fractional progress across frames.
      progress = Math.min(1, progress + (now - (previousTime ?? now)) / durationMs);
      previousTime = now;
      el.scrollTop = progress * distance;
      lastPosition = el.scrollTop;
      if (progress >= 1) setRunning(false);
      else frame = requestAnimationFrame(step);
    };
    const pauseWhenHidden = () => {
      if (document.hidden) setRunning(false);
    };
    document.addEventListener("visibilitychange", pauseWhenHidden);
    frame = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("visibilitychange", pauseWhenHidden);
    };
  }, [running, count, wpm]);

  function rewind() {
    setRunning(false);
    if (box.current) box.current.scrollTop = 0;
  }

  function togglePlayback() {
    const el = box.current;
    if (!running && el && el.scrollTop >= el.scrollHeight - el.clientHeight - 1) el.scrollTop = 0;
    // On a phone the prompter sits below the controls; bring it on screen when playback starts.
    if (!running && el) {
      const rect = el.getBoundingClientRect();
      if (rect.top < 0 || rect.bottom > window.innerHeight) {
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        el.scrollIntoView({ block: "nearest", behavior: reduce ? "auto" : "smooth" });
      }
    }
    setRunning(!running);
  }

  return (
    <Panel>
      <TextArea label="Your script" value={text} onChange={(value) => { rewind(); setText(value); }} rows={5} />
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <NumberField label="Scroll speed" value={wpm} onChange={setWpm} min={80} max={200} step={5} suffix="wpm" />
        <NumberField label="Text size" value={size} onChange={changeSize} min={20} max={64} step={2} suffix="px" />
      </div>
      <div className="mt-5 flex gap-3">
        <Button onClick={togglePlayback} disabled={!count}>{running ? "Pause" : "Play"}</Button>
        <Button variant="secondary" onClick={rewind}>Back to top</Button>
      </div>
      <div
        ref={box}
        className="mt-5 h-[55vh] overflow-y-auto whitespace-pre-wrap break-words rounded-xl bg-[#0d1117] px-6 py-[27.5vh] text-center text-white"
        style={{ fontSize: size, lineHeight: 1.45 }}
      >
        {text}
      </div>
    </Panel>
  );
}
