import { notFound } from "next/navigation";
import { getEntries, getEntry } from "@/lib/content";
import { contentMetadata } from "@/lib/seo";
import { ArticleView } from "@/components/ArticleView";

export const dynamicParams = false;

export function generateStaticParams() {
  const entries = getEntries("learn");
  return entries.length ? entries.map((e) => ({ slug: e.meta.slug })) : [{ slug: "__placeholder" }];
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const entry = getEntry("learn", slug);
  return entry ? contentMetadata(entry.meta) : { robots: { index: false } };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const entry = getEntry("learn", slug);
  if (!entry) notFound();
  return <ArticleView entry={entry} />;
}
