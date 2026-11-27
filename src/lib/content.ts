import fs from "fs";
import path from "path";
import matter from "gray-matter";

export type Collection = "research" | "learn" | "professions" | "statistics";

export type ContentKind =
  | "paper"
  | "study"
  | "brief"
  | "article"
  | "profession"
  | "statistics";

export interface ContentMeta {
  collection: Collection;
  slug: string;
  title: string;
  description: string;
  kind: ContentKind;
  publishedAt: string;
  updatedAt?: string;
  status: "draft" | "published" | "scheduled";
  contributors: string[];
  reviewers: string[];
  dataSource?: string;
  doi?: string;
  pdf?: string;
  keyFindings: string[];
  citations: string[];
  occupationCode?: string;
  onet: boolean;
  topics: string[];
  readingMinutes: number;
}

export interface ContentEntry {
  meta: ContentMeta;
  body: string;
}

const ROOT = path.join(process.cwd(), "content");
const FILE_RE = /^[a-z0-9][a-z0-9-]*\.mdx$/;

function toDateString(v: unknown): string | undefined {
  if (!v) return undefined;
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  return String(v);
}

function asStringArray(v: unknown): string[] {
  return Array.isArray(v) ? v.map(String) : [];
}

function readEntry(collection: Collection, file: string): ContentEntry {
  const raw = fs.readFileSync(path.join(ROOT, collection, file), "utf8");
  const { data, content } = matter(raw);
  const words = content.split(/\s+/).filter(Boolean).length;
  return {
    meta: {
      collection,
      slug: file.replace(/\.mdx$/, ""),
      title: String(data.title ?? ""),
      description: String(data.description ?? ""),
      kind: (data.kind ?? "article") as ContentKind,
      publishedAt: toDateString(data.status === "scheduled" ? data.scheduledFor : data.publishedAt) ?? "",
      updatedAt: toDateString(data.updatedAt),
      status: ["published", "scheduled"].includes(data.status) ? data.status : "draft",
      contributors: asStringArray(data.contributors),
      reviewers: asStringArray(data.reviewers),
      dataSource: data.dataSource ? String(data.dataSource) : undefined,
      doi: data.doi ? String(data.doi) : undefined,
      pdf: data.pdf ? String(data.pdf) : undefined,
      keyFindings: asStringArray(data.keyFindings),
      citations: asStringArray(data.citations),
      occupationCode: data.occupationCode ? String(data.occupationCode) : undefined,
      onet: data.onet === true || Boolean(data.occupationCode),
      topics: asStringArray(data.topics),
      readingMinutes: Math.max(1, Math.round(words / 230)),
    },
    body: content,
  };
}

const cache = new Map<Collection, ContentEntry[]>();

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function isLive(meta: ContentMeta): boolean {
  return meta.status !== "draft" && Boolean(meta.publishedAt) && meta.publishedAt <= todayISO();
}

export function getEntries(collection: Collection): ContentEntry[] {
  if (!cache.has(collection)) {
    const dir = path.join(ROOT, collection);
    const files = fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => FILE_RE.test(f)) : [];
    const entries = files
      .map((f) => readEntry(collection, f))
      .filter((e) => isLive(e.meta))
      .sort(
        (a, b) =>
          b.meta.publishedAt.localeCompare(a.meta.publishedAt) ||
          a.meta.title.localeCompare(b.meta.title)
      );
    cache.set(collection, entries);
  }
  return cache.get(collection)!;
}

/** True when content/<collection>/<slug>.mdx exists, is not a draft, and is dated after today. */
export function isScheduledLater(collection: Collection, slug: string): boolean {
  const file = `${slug}.mdx`;
  if (!FILE_RE.test(file) || !fs.existsSync(path.join(ROOT, collection, file))) return false;
  const { meta } = readEntry(collection, file);
  return meta.status !== "draft" && Boolean(meta.publishedAt) && meta.publishedAt > todayISO();
}

export function getEntry(collection: Collection, slug: string): ContentEntry | undefined {
  return getEntries(collection).find((e) => e.meta.slug === slug);
}

export function getAllLive(): ContentEntry[] {
  return (["research", "learn", "professions", "statistics"] as Collection[]).flatMap(getEntries);
}

export function formatDate(iso: string): string {
  const d = new Date(`${iso}T12:00:00Z`);
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" });
}

export interface FAQ {
  question: string;
  answer: string;
}

/** Parses a "## Frequently asked questions" section of ### question / answer pairs. */
export function extractFaqs(body: string): FAQ[] {
  const lines = body.split("\n");
  const faqs: FAQ[] = [];
  let inSection = false;
  let q = "";
  let a: string[] = [];
  const flush = () => {
    if (q && a.length) faqs.push({ question: q, answer: clean(a.join(" ")) });
  };
  for (const line of lines) {
    if (/^##\s+(frequently asked questions|faqs?)\s*$/i.test(line.trim())) {
      inSection = true;
      continue;
    }
    if (!inSection) continue;
    if (/^##\s/.test(line)) {
      flush();
      q = "";
      a = [];
      inSection = false;
      continue;
    }
    if (line.startsWith("### ")) {
      flush();
      q = line.slice(4).trim();
      a = [];
    } else if (q && line.trim()) {
      a.push(line.trim());
    }
  }
  if (inSection) flush();
  return faqs;
}

function clean(s: string): string {
  return s
    .replace(/<Cite[^>]*\/>/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/O\\?\*NET/g, "O\u0000NET")
    .replace(/[*_`]/g, "")
    .replace(/O\u0000NET/g, "O*NET")
    .replace(/\s+/g, " ")
    .trim();
}
