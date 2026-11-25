import { notFound } from "next/navigation";
import { TOOLS } from "@/data/tools";
import { SITE } from "@/data/site";
import { TOOL_COMPONENTS } from "@/components/tools/registry";
import { pageMetadata } from "@/lib/seo";
import "./embed.css";

type Props = { params: Promise<{ slug: string }> };
export const dynamicParams = false;
export const generateStaticParams = () => TOOLS.map(({ slug }) => ({ slug }));

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const tool = TOOLS.find(entry => entry.slug === slug);
  return tool ? pageMetadata({ title: tool.name, description: tool.description, path: `/tools/${slug}`, noindex: true }) : {};
}

export default async function Embed({ params }: Props) {
  const { slug } = await params;
  const tool = TOOLS.find(entry => entry.slug === slug);
  const Component = TOOL_COMPONENTS[slug];
  if (!tool || !Component) notFound();
  return <article data-tool-embed className="mx-auto max-w-3xl p-3">
    <h1 className="mb-4 font-serif text-2xl font-semibold">{tool.name}</h1>
    <Component />
    <p className="mt-4 text-sm text-ink-2"><a className="underline" target="_blank" rel="noopener" href={`/tools/${slug}`}>Instructions and sources at {SITE.name}</a></p>
  </article>;
}
