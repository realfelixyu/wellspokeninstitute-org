"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "./ui";

type SpeechResult = { isFinal: boolean; 0: { transcript: string } };
type LocalRecognition = {
  processLocally: boolean;
  continuous: boolean;
  lang: string;
  onresult: ((event: { resultIndex: number; results: ArrayLike<SpeechResult> }) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
};
type Availability = "available" | "downloadable" | "downloading" | "unavailable";
type LocalOptions = { langs: string[]; processLocally: boolean };
type RecognitionConstructor = (new () => LocalRecognition) & {
  available?: (options: LocalOptions) => Promise<Availability>;
  install?: (options: LocalOptions) => Promise<boolean>;
};
const LOCAL: LocalOptions = { langs: ["en-US"], processLocally: true };

function recognitionType() {
  const browser = window as typeof window & {
    SpeechRecognition?: RecognitionConstructor; webkitSpeechRecognition?: RecognitionConstructor;
  };
  return browser.SpeechRecognition ?? browser.webkitSpeechRecognition;
}

export default function LocalDictation({ append }: { append: (text: string) => void }) {
  // The button appears when the browser exposes on-device recognition. Availability is checked on the first
  // tap, never on page load: starting without a usable English model fails, and some Chromium builds crash.
  const [supported, setSupported] = useState(false);
  const [availability, setAvailability] = useState<Availability | null>(null);
  const [active, setActive] = useState(false);
  const [message, setMessage] = useState("");
  const session = useRef<LocalRecognition | null>(null);
  // Guards for the async start: one start at a time, and nothing starts after the page is left.
  const starting = useRef(false);
  const mounted = useRef(true);
  useEffect(() => {
    const Recognition = recognitionType();
    setSupported(Boolean(Recognition && "processLocally" in Recognition.prototype && typeof Recognition.available === "function"));
    mounted.current = true;
    return () => {
      mounted.current = false;
      if (session.current) {
        session.current.onresult = null;
        session.current.onend = null;
        session.current.onerror = null;
        session.current.abort();
      }
    };
  }, []);

  async function start() {
    const Recognition = recognitionType();
    if (!Recognition || session.current || starting.current) return;
    starting.current = true;
    try {
      await begin(Recognition);
    } finally {
      starting.current = false;
    }
  }

  async function begin(Recognition: RecognitionConstructor) {
    let state = availability;
    if (state === null) {
      state = await Recognition.available?.(LOCAL).catch(() => "unavailable" as const) ?? "unavailable";
      if (!mounted.current) return;
      setAvailability(state);
    }
    if (state === "unavailable") {
      setSupported(false);
      setMessage("On-device English dictation is not available in this browser. You can paste a transcript.");
      return;
    }
    if (state !== "available") {
      setMessage("Downloading the English speech pack for this device…");
      const installed = await Recognition.install?.(LOCAL).catch(() => false);
      if (!mounted.current) return;
      if (!installed) {
        setMessage("The English speech pack could not be installed. You can paste a transcript.");
        return;
      }
      setAvailability("available");
    }
    try {
      const recorder = new Recognition();
      if (!("processLocally" in recorder)) return;
      recorder.processLocally = true;
      recorder.lang = "en-US";
      recorder.continuous = true;
      recorder.onresult = event => {
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal && result[0].transcript.trim()) append(result[0].transcript.trim());
        }
      };
      recorder.onerror = event => setMessage(event.error === "not-allowed"
        ? "Microphone access was declined. You can paste a transcript."
        : "Dictation stopped. Check the English speech pack in your browser or paste a transcript.");
      recorder.onend = () => { session.current = null; setActive(false); };
      setMessage("");
      session.current = recorder;
      recorder.start();
      setActive(true);
    } catch {
      session.current = null;
      setActive(false);
      setMessage("Dictation could not start. Paste a transcript.");
    }
  }

  return <div className="mt-3">
    {supported && <Button variant="secondary" onClick={active ? () => session.current?.stop() : start}>
      {active ? "Stop dictation" : "Dictate in English on this device"}
    </Button>}
    <p role="status" className="mt-1 text-sm text-ink-3">{message || (active
      ? "Listening on this device. Recognized words appear in the transcript."
      : supported ? "Requires microphone permission and an installed English speech pack." : "Dictation requires a browser with on-device speech recognition. You can always paste a transcript.")}</p>
  </div>;
}
