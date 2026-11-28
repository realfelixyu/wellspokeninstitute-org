import Link from "next/link";
import type { ContentEntry } from "@/lib/content";
import { contentPath } from "@/lib/seo";
import { findOccupation } from "@/data/stats";
import type { StaticLink } from "@/data/topics";
import { relatedReading, topicPath } from "@/lib/topics";

const KIND_LABEL: Record<string, string> = {
  paper: "Paper",
  study: "Study",
  brief: "Brief",
  article: "Explainer",
  profession: "Profession",
  statistics: "Statistics",
};

const CARD =
  "flex h-full min-h-11 flex-col rounded-xl border border-rule bg-card p-4 transition-colors hover:border-accent focus-visible:border-accent";

export interface LinkCardItem {
  href: string;
  label: string;
  title: string;
  description?: string;
}

export function entryCard(entry: ContentEntry): LinkCardItem {
  const { meta } = entry;
  const occupation = meta.occupationCode ? findOccupation(meta.occupationCode) : undefined;
  return {
    href: contentPath(meta),
    label: KIND_LABEL[meta.kind] ?? "Guide",
    title: meta.kind === "profession" ? occupation?.title ?? meta.title : meta.title,
    description: meta.kind === "profession" ? undefined : meta.description,
  };
}

export function staticCard(link: StaticLink, label = "Resource"): LinkCardItem {
  return { href: link.href, label, title: link.title, description: link.description };
}

export function LinkCards({ items, columns = 2 }: { items: LinkCardItem[]; columns?: 2 | 3 }) {
  return (
    <ul className={`grid gap-3 sm:grid-cols-2 ${columns === 3 ? "lg:grid-cols-3" : ""}`}>
      {items.map((item) => (
        <li key={item.href} className="min-w-0">
          <Link href={item.href} className={CARD}>
            <span className="text-xs font-semibold uppercase tracking-wider text-accent">{item.label}</span>
            <span className="mt-1.5 font-medium leading-snug text-ink [overflow-wrap:anywhere]">{item.title}</span>
            {item.description ? (
              <span className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-ink-2">{item.description}</span>
            ) : null}
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function RelatedReading({ entry }: { entry: ContentEntry }) {
  const { entries, topics, resources } = relatedReading(entry);
  const cards = [...entries.map(entryCard), ...resources.map(link => staticCard(link))];
  if (!cards.length && !topics.length) return null;
  return (
    <section aria-labelledby="related-reading" className="no-print mt-14 border-t border-rule pt-8">
      <h2 id="related-reading" className="font-serif text-xl font-semibold text-ink">
        Related reading
      </h2>
      {cards.length ? (
        <div className="mt-5">
          <LinkCards items={cards} />
        </div>
      ) : null}
      {topics.length ? (
        <div className="mt-5 flex flex-wrap items-center gap-2 text-sm">
          <span className="text-ink-3">{topics.length > 1 ? "Topics:" : "Topic:"}</span>
          {topics.map((t) => (
            <Link
              key={t.slug}
              href={topicPath(t.slug)}
              className="inline-flex min-h-11 items-center rounded-md border border-rule px-3 py-2 font-medium text-ink transition-colors hover:border-accent hover:text-accent"
            >
              {t.title}
            </Link>
          ))}
        </div>
      ) : null}
    </section>
  );
}
