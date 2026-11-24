import Link from "next/link";
import type { ContentEntry } from "@/lib/content";
import { formatDate } from "@/lib/content";
import { contentPath } from "@/lib/seo";

const KIND_LABEL: Record<string, string> = {
  paper: "Paper",
  study: "Study",
  brief: "Brief",
  article: "Explainer",
  profession: "Profession",
  statistics: "Statistics",
};

export function EntryList({ entries, empty }: { entries: ContentEntry[]; empty?: string }) {
  if (!entries.length) {
    return <p className="rounded-xl border border-dashed border-rule p-8 text-ink-3">{empty ?? "Coming soon."}</p>;
  }
  return (
    <ul className="divide-y divide-rule border-y border-rule">
      {entries.map(({ meta }) => (
        <li key={meta.slug}>
          <Link href={contentPath(meta)} className="group grid gap-2 py-6 sm:grid-cols-[9rem_1fr] sm:gap-8">
            <div className="text-sm text-ink-3">
              <span className="font-semibold uppercase tracking-wider text-accent">{KIND_LABEL[meta.kind]}</span>
              <span className="mt-1 block">{formatDate(meta.updatedAt ?? meta.publishedAt)}</span>
            </div>
            <div>
              <h3 className="font-serif text-xl font-semibold leading-snug text-ink group-hover:text-accent sm:text-[1.4rem]">
                {meta.title}
              </h3>
              <p className="mt-2 text-[0.98rem] leading-relaxed text-ink-2">{meta.description}</p>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function EntryCards({ entries }: { entries: ContentEntry[] }) {
  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {entries.map(({ meta }) => (
        <li key={meta.slug}>
          <Link
            href={contentPath(meta)}
            className="flex h-full flex-col rounded-xl border border-rule bg-card p-5 transition-colors hover:border-accent"
          >
            <span className="text-xs font-semibold uppercase tracking-wider text-accent">{KIND_LABEL[meta.kind]}</span>
            <span className="mt-2 font-serif text-lg font-semibold leading-snug text-ink">{meta.title}</span>
            <span className="mt-2 line-clamp-3 text-sm leading-relaxed text-ink-2">{meta.description}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
