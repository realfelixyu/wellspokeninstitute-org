import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader, Container } from "@/components/PageHeader";
import { LinkCards, entryCard, staticCard } from "@/components/TopicLinks";
import { JsonLd, breadcrumbJsonLd, pageMetadata } from "@/lib/seo";
import { isTopicSlug, orderedTopics, resolveTopic, topicPath } from "@/lib/topics";

export const dynamicParams = false;

export function generateStaticParams() {
  return orderedTopics().map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!isTopicSlug(slug)) return { robots: { index: false } };
  const { topic } = resolveTopic(slug);
  return pageMetadata({ title: topic.title, description: topic.description, path: topicPath(slug) });
}

export default async function TopicPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!isTopicSlug(slug)) notFound();
  const { topic, groups } = resolveTopic(slug);
  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Topics", path: "/topics" },
    { name: topic.title, path: topicPath(slug) },
  ];
  const others = orderedTopics().filter((t) => t.slug !== slug);
  return (
    <>
      <JsonLd data={breadcrumbJsonLd(crumbs)} />
      <PageHeader
        crumbs={crumbs}
        eyebrow="Topic"
        title={topic.title}
        lede={
          <div className="space-y-3">
            {topic.intro.map((sentence) => (
              <p key={sentence}>{sentence}</p>
            ))}
          </div>
        }
      />
      <Container>
        <div className="space-y-12 py-12">
          {groups.map((group) => (
            <section key={group.id} aria-labelledby={`group-${group.id}`}>
              <h2 id={`group-${group.id}`} className="font-serif text-2xl font-semibold text-ink">
                {group.title}
              </h2>
              <div className="mt-4">
                <LinkCards
                  columns={3}
                  items={[
                    ...group.entries.map(entryCard),
                    ...group.links.map((l) => staticCard(l, l.href.startsWith("/tools/") ? "Free tool" : "Resource")),
                  ]}
                />
              </div>
            </section>
          ))}
          <section aria-labelledby="other-topics" className="border-t border-rule pt-8">
            <h2 id="other-topics" className="font-serif text-xl font-semibold text-ink">
              Other topics
            </h2>
            <ul className="mt-4 flex flex-wrap gap-2 text-sm">
              {others.map((t) => (
                <li key={t.slug}>
                  <Link
                    href={topicPath(t.slug)}
                    className="inline-flex min-h-11 items-center rounded-md border border-rule px-3 py-2 font-medium text-ink transition-colors hover:border-accent hover:text-accent"
                  >
                    {t.title}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </Container>
    </>
  );
}
