"use client";

import { useEffect, useState } from "react";

export type ExplorerRow = [number, string, string, number | null, number, number | null, number | null, number | null, number | null, number | null, number | null, number | null];

export function useOccupationData(initial: ExplorerRow[] = []) {
  const [rows, setRows] = useState(initial);
  const [loadState, setLoadState] = useState<"loading" | "ready" | "error">("loading");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/data/speaking-by-occupation.json", { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("Dataset request failed");
        return response.json();
      })
      .then((d) => {
        if (!Array.isArray(d.rows)) throw new Error("Missing occupation rows");
        if (controller.signal.aborted) return;
        setRows(d.rows);
        setLoadState("ready");
      })
      .catch(() => {
        if (!controller.signal.aborted) setLoadState("error");
      });
    return () => controller.abort();
  }, [attempt]);

  function retry() {
    setLoadState("loading");
    setAttempt(previous => previous + 1);
  }

  return { rows, loadState, retry };
}
