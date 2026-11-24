import fs from "fs";
import path from "path";

export interface Citation {
  key: string;
  authors: string;
  year: number | string;
  title: string;
  container?: string;
  publisher?: string;
  doi?: string;
  url?: string;
  verified?: { method: string; date: string; matched?: string };
}

let registry: Record<string, Omit<Citation, "key">> | null = null;

function load(): Record<string, Omit<Citation, "key">> {
  if (!registry) {
    const dir = path.join(process.cwd(), "content", "citations");
    registry = {};
    if (fs.existsSync(dir)) {
      for (const f of fs.readdirSync(dir).filter((x) => x.endsWith(".json")).sort()) {
        Object.assign(registry, JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")));
      }
    }
  }
  return registry!;
}

export function getCitation(key: string): Citation | undefined {
  const c = load()[key];
  return c ? { key, ...c } : undefined;
}

export function getCitations(keys: string[]): Citation[] {
  return keys.map((k) => getCitation(k)).filter((c): c is Citation => Boolean(c));
}

export function citationHref(c: Citation): string | undefined {
  if (c.doi) return `https://doi.org/${c.doi}`;
  return c.url;
}

/** APA-like plain string. */
export function formatCitation(c: Citation): string {
  const parts = [`${c.authors} (${c.year}).`, `${c.title}.`];
  if (c.container) parts.push(`${c.container}.`);
  if (c.publisher && c.publisher !== c.container) parts.push(`${c.publisher}.`);
  return parts.join(" ");
}
