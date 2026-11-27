export function words(text: string): string[] {
  return text
    .replace(/[‘’]/g, "'")
    .split(/[\s–—]+/u)
    .map((w) => w.replace(/^[^\p{L}\p{N}']+|[^\p{L}\p{N}']+$/gu, ""))
    .filter((w) => /[\p{L}\p{N}]/u.test(w));
}

export function wordCount(text: string): number {
  return words(text).length;
}

export function sentences(text: string): string[] {
  return text
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+(?=[A-Z0-9"'“])/)
    .map((s) => s.trim())
    .filter((s) => wordCount(s) > 0);
}

/** Heuristic English syllable count. */
export function syllables(word: string): number {
  const w = word.toLowerCase().replace(/[^a-z]/g, "");
  if (!w) return 0;
  if (w.length <= 3) return 1;
  const stripped = w.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, "").replace(/^y/, "");
  const groups = stripped.match(/[aeiouy]{1,2}/g);
  return Math.max(1, groups ? groups.length : 1);
}

export function formatDuration(totalSeconds: number): string {
  const s = Math.max(0, Math.round(totalSeconds));
  const m = Math.floor(s / 60);
  const r = s % 60;
  if (m === 0) return `${r} sec`;
  return `${m} min ${r.toString().padStart(2, "0")} sec`;
}

export const FILLERS: { label: string; re: RegExp }[] = [
  { label: "um", re: /\b(um+|umm+|erm+)\b/gi },
  { label: "uh", re: /\b(uh+|er+|ah+)\b/gi },
  { label: "like", re: /\blike\b(?!\s+(?:to|a|the|this|that|it)\b)/gi },
  { label: "you know", re: /\byou\s+know\b/gi },
  { label: "I mean", re: /\bi\s+mean\b/gi },
  { label: "sort of / kind of", re: /\b(?:(?:sort|kind)\s+of|kinda|sorta)\b/gi },
  { label: "basically", re: /\bbasically\b/gi },
  { label: "actually", re: /\bactually\b/gi },
  { label: "literally", re: /\bliterally\b/gi },
  // A quoted sentence can open after a reporting comma or colon, or end before its closing quote.
  { label: "so (at the start of a sentence)", re: /(?<=^\s*["'“‘]?|[.!?]["'”’]?\s+["'“‘]?|[,:]\s*["'“‘])\bso\b/gi },
  { label: "right?", re: /\bright\?/gi },
];
