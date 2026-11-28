import { getEntries, type Collection, type ContentEntry } from "@/lib/content";
import { findOccupation } from "@/data/stats";
import {
  TOPICS,
  TOPIC_ASSIGNMENTS,
  TOPIC_GROUPS,
  TOPIC_ORDER,
  type StaticLink,
  type Topic,
  type TopicGroup,
  type TopicSlug,
} from "@/data/topics";

// Every function here reads only getEntries(), which drops drafts and pages scheduled after today.
// That is what keeps hubs and related reading free of unpublished links.

const ARTICLE_COLLECTIONS: Collection[] = ["learn", "research", "statistics"];

const key = (e: ContentEntry) => `${e.meta.collection}/${e.meta.slug}`;
const modifiedOn = (e: ContentEntry) => e.meta.updatedAt ?? e.meta.publishedAt;

export function topicPath(slug: TopicSlug): string {
  return `/topics/${slug}`;
}

export function isTopicSlug(slug: string): slug is TopicSlug {
  return Object.prototype.hasOwnProperty.call(TOPIC_GROUPS, slug);
}

export function orderedTopics(): Topic[] {
  return TOPIC_ORDER.map((slug) => TOPICS[slug] as Topic);
}

export function topicsFor(entry: ContentEntry): TopicSlug[] {
  const assignment = TOPIC_ASSIGNMENTS[key(entry)] ?? {};
  return TOPIC_ORDER.filter((slug) => assignment[slug] !== undefined);
}

function groupFor(entry: ContentEntry, topic: TopicSlug): string | undefined {
  return TOPIC_ASSIGNMENTS[key(entry)]?.[topic];
}

function employment(entry: ContentEntry): number {
  const code = entry.meta.occupationCode;
  return (code ? findOccupation(code)?.employment : undefined) ?? 0;
}

function byEmployment(a: ContentEntry, b: ContentEntry): number {
  return employment(b) - employment(a) || a.meta.title.localeCompare(b.meta.title);
}

/** Published profession guides, largest U.S. employment first. */
export function professionsByEmployment(): ContentEntry[] {
  return [...getEntries("professions")].sort(byEmployment);
}

function allPublished(): ContentEntry[] {
  return [...ARTICLE_COLLECTIONS, "professions" as Collection].flatMap(getEntries);
}

export interface ResolvedGroup {
  id: string;
  title: string;
  entries: ContentEntry[];
  links: StaticLink[];
}

export interface ResolvedTopic {
  topic: Topic;
  groups: ResolvedGroup[];
  entries: ContentEntry[];
  /** Newest updatedAt or publishedAt among the linked pages. */
  lastModified?: string;
}

const COLLECTION_RANK: Record<Collection, number> = { learn: 0, research: 1, statistics: 2, professions: 3 };

export function resolveTopic(slug: TopicSlug): ResolvedTopic {
  const topic = TOPICS[slug] as Topic;
  const published = allPublished();
  const groups: ResolvedGroup[] = Object.entries(topic.groups as Record<string, TopicGroup>).map(([id, group]) => {
    const mapped = published
      .filter((e) => groupFor(e, slug) === id)
      .sort(
        (a, b) =>
          COLLECTION_RANK[a.meta.collection] - COLLECTION_RANK[b.meta.collection] ||
          b.meta.publishedAt.localeCompare(a.meta.publishedAt) ||
          a.meta.title.localeCompare(b.meta.title)
      );
    const top = group.topProfessions
      ? professionsByEmployment()
          .filter((e) => !mapped.includes(e))
          .slice(0, group.topProfessions)
      : [];
    return { id, title: group.title, entries: [...mapped, ...top], links: group.links ?? [] };
  });
  const entries = groups.flatMap((g) => g.entries);
  const lastModified = entries.map(modifiedOn).sort().at(-1);
  return { topic, groups: groups.filter((g) => g.entries.length || g.links.length), entries, lastModified };
}

export interface RelatedReading {
  entries: ContentEntry[];
  topics: Topic[];
  resources: StaticLink[];
}

const MAX_RELATED = 5;
const MIN_RELATED = 3;

function relatedArticles(entry: ContentEntry, own: TopicSlug[]): ContentEntry[] {
  const self = key(entry);
  const candidates = allPublished().filter((e) => key(e) !== self);
  return candidates
    .map((e) => {
      const shared = topicsFor(e).filter((t) => own.includes(t));
      const sameGroup = shared.some((t) => groupFor(e, t) === groupFor(entry, t));
      return { e, score: shared.length * 10 + (sameGroup ? 5 : 0) };
    })
    .filter((c) => c.score > 0)
    .sort(
      (a, b) =>
        b.score - a.score ||
        b.e.meta.publishedAt.localeCompare(a.e.meta.publishedAt) ||
        a.e.meta.title.localeCompare(b.e.meta.title)
    )
    .map((c) => c.e)
    .slice(0, MAX_RELATED);

}

function relatedProfessions(entry: ContentEntry): ContentEntry[] {
  const self = key(entry);
  const group = (entry.meta.occupationCode ?? "").slice(0, 2);
  const others = professionsByEmployment().filter((e) => key(e) !== self);
  const sameGroup = group ? others.filter((e) => (e.meta.occupationCode ?? "").startsWith(group)) : [];
  const picked = sameGroup.slice(0, 4);
  for (const e of others) {
    if (picked.length >= 4) break;
    if (!picked.includes(e)) picked.push(e);
  }
  return picked;
}

/** 3 to 5 published pages that share a topic (or, for professions, an O*NET major group), plus the matching hubs. */
export function relatedReading(entry: ContentEntry): RelatedReading {
  const own = topicsFor(entry);
  if (entry.meta.collection === "professions") {
    const hubs: TopicSlug[] = ["speaking-at-work", ...own.filter((t) => t !== "speaking-at-work")];
    return { entries: relatedProfessions(entry), topics: hubs.map((t) => TOPICS[t] as Topic), resources: [] };
  }
  const entries = relatedArticles(entry, own);
  const topics = own.map((slug) => TOPICS[slug] as Topic);
  const available = topics.flatMap(topic =>
    Object.values(topic.groups).flatMap(group => group.links ?? [])
  );
  const unique = new Map(available.map(link => [link.href, link]));
  const resources = [...unique.values()].slice(0, Math.max(0, MIN_RELATED - entries.length));
  return { entries, topics, resources };
}
