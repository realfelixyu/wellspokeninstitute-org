import Link from "next/link";
import { PageHeader, Container } from "@/components/PageHeader";
import { JsonLd, breadcrumbJsonLd, pageMetadata } from "@/lib/seo";
import { orderedTopics, resolveTopic, topicPath } from "@/lib/topics";

export const metadata = pageMetadata({
  title: "Topics",
  description:
    "Browse Institute guides, studies and statistics by topic: speaking at work, job interviews, fear of public speaking, English learners and teaching speaking.",
  path: "/topics",
});

export default function TopicsIndex() {
  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Topics", path: "/topics" },
  ];
  const topics = orderedTopics().map((t) => ({ topic: t, count: resolveTopic(t.slug).groups.reduce((sum, group) => sum + group.entries.length + group.links.length, 0) }));
  return (
    <>
      <JsonLd data={breadcrumbJsonLd(crumbs)} />
      <PageHeader
        crumbs={crumbs}
        eyebrow="Topics"
        title="Browse by topic"
        lede="Find research, practice tools and lessons for the speaking situation you have in mind."
      />
      <Container>
        <ul className="grid gap-4 py-12 sm:grid-cols-2 lg:grid-cols-3">
          {topics.map(({ topic, count }) => (
            <li key={topic.slug} className="min-w-0">
              <Link
                href={topicPath(topic.slug)}
                className="flex h-full min-h-11 flex-col rounded-xl border border-rule bg-card p-5 transition-colors hover:border-accent"
              >
                <span className="font-serif text-lg font-semibold leading-snug text-ink">{topic.title}</span>
                <span className="mt-1 text-sm text-accent">
                  {count} {count === 1 ? "resource" : "resources"}
                </span>
                <span className="mt-3 text-sm leading-relaxed text-ink-2">{topic.description}</span>
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </>
  );
}
