import Link from "next/link";
import { notFound } from "next/navigation";
import { TOOLS } from "@/data/tools";
import { Breadcrumbs } from "@/components/PageHeader";
import { JsonLd, pageMetadata, breadcrumbJsonLd } from "@/lib/seo";
import { SITE } from "@/data/site";
import { TOOL_GUIDES } from "@/data/toolGuides";
import { TOOL_COMPONENTS } from "@/components/tools/registry";
import { getCitations, citationHref, formatCitation } from "@/lib/citations";
import { TOOL_SOURCES } from "@/data/toolGuides";

export const dynamicParams = false;

export function generateStaticParams() {
  return TOOLS.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const t = TOOLS.find((x) => x.slug === slug);
  if (!t) return {};
  return pageMetadata({ title: /free/i.test(t.name) || t.name.endsWith("?") ? t.name : `Free ${t.name.charAt(0).toLowerCase()}${t.name.slice(1)}`, description: t.description, path: `/tools/${t.slug}` });
}

export default async function ToolPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const t = TOOLS.find((x) => x.slug === slug);
  const C = TOOL_COMPONENTS[slug];
  if (!t || !C) notFound();
  const sources = getCitations(TOOL_SOURCES[slug]);
  const guide = TOOL_GUIDES[slug];
  const path = `/tools/${slug}`;
  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Free tools", path: "/tools" },
    { name: t.name, path },
  ];
  const app = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: t.name,
    description: t.description,
    url: `${SITE.url}${path}`,
    applicationCategory: "EducationalApplication",
    operatingSystem: "Any",
    isAccessibleForFree: true,
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    publisher: { "@type": "NGO", name: SITE.name, url: SITE.url },
  };
  return (
    <>
      <JsonLd data={app} />
      <JsonLd data={breadcrumbJsonLd(crumbs)} />
      <div className="mx-auto max-w-3xl px-4 pb-6 pt-10 sm:px-6 sm:pt-14">
        <Breadcrumbs items={crumbs} />
        <h1 className="mt-6 font-serif text-[2rem] font-semibold leading-tight text-ink sm:text-[2.6rem]">{t.name}</h1>
        <p className="mt-4 text-lg leading-relaxed text-ink-2">{t.description}</p>
      </div>
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <C />
      </div>
      {guide ? (
        <div className="prose-body mx-auto max-w-3xl px-4 py-12 sm:px-6">
          {guide.map((section) => (
            <section key={section.heading}>
              <h2>{section.heading}</h2>
              {section.paragraphs.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </section>
          ))}
        </div>
      ) : null}
      <section className="mx-auto max-w-3xl px-4 pb-8 sm:px-6">
        <h2 className="font-serif text-xl font-semibold">Sources and further reading</h2>
        <ul className="mt-3 space-y-2 text-sm text-ink-2">
          {sources.map(source => <li key={source.key}><a className="underline" href={citationHref(source)}>{formatCitation(source)}</a></li>)}
        </ul>
        <details className="mt-6 rounded-lg border border-rule px-4 py-3">
          <summary className="cursor-pointer py-3 font-medium">Embed this tool on your site</summary>
          <label className="mt-3 block text-sm">HTML embed code
            <textarea className="mt-2 w-full rounded border border-rule bg-paper p-2 font-mono" readOnly rows={4}
              value={`<iframe title="${t.name}" src="${SITE.url}/embed/${slug}" width="100%" height="640"${slug === "filler-word-counter" ? ' allow="microphone; on-device-speech-recognition"' : ""} style="border:0" loading="lazy"></iframe>`} />
          </label>
        </details>
      </section>
      <div className="mx-auto max-w-3xl px-4 pb-4 sm:px-6">
        <p className="text-sm text-ink-3">
          Free and private. This tool runs in your browser and does not send your text or audio to us.{" "}
          <Link href="/tools" className="underline">More free tools</Link>
        </p>
      </div>
    </>
  );
}
