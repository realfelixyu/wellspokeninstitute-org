import type { Metadata } from "next";
import { SITE, PEOPLE } from "@/data/site";
import type { ContentMeta } from "@/lib/content";
import { getCitations, citationHref, formatCitation } from "@/lib/citations";

export function truncateForMeta(text: string, max = 155): string {
  if (text.length <= max) return text;
  const clipped = text.slice(0, max);
  const cut = clipped.lastIndexOf(" ");
  return `${(cut > 0 ? clipped.slice(0, cut) : clipped).replace(/[,.;:]$/, "")}…`;
}

export function JsonLd({ data }: { data: object | object[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": ["NGO", "ResearchOrganization"],
    "@id": `${SITE.url}/#organization`,
    name: SITE.name,
    legalName: SITE.legalName,
    url: SITE.url,
    logo: `${SITE.url}/logo.png`,
    description: SITE.description,
    email: SITE.email,
    taxID: SITE.ein,
    nonprofitStatus: "Nonprofit501c3",
    foundingDate: SITE.incorporated,
    address: {
      "@type": "PostalAddress",
      streetAddress: SITE.address.street,
      addressLocality: SITE.address.city,
      addressRegion: SITE.address.region,
      postalCode: SITE.address.postalCode,
      addressCountry: SITE.address.country,
    },
    founder: Object.values(PEOPLE).map((p) => ({ "@type": "Person", name: p.name })),
  };
}

export function pageMetadata(opts: {
  title: string;
  description: string;
  path: string;
  type?: "website" | "article";
  noindex?: boolean;
}): Metadata {
  const description = truncateForMeta(opts.description);
  return {
    title: opts.title,
    description,
    alternates: { canonical: opts.path },
    robots: opts.noindex ? { index: false, follow: false } : undefined,
    openGraph: {
      title: opts.title,
      description,
      url: `${SITE.url}${opts.path}`,
      type: opts.type ?? "website",
      siteName: SITE.name,
      images: [{ url: "/og-default.png", width: 1200, height: 630 }],
    },
    twitter: { card: "summary_large_image", title: opts.title, description },
  };
}

export function contentPath(meta: Pick<ContentMeta, "collection" | "slug">): string {
  return `/${meta.collection}/${meta.slug}`;
}

export function authorNames(meta: ContentMeta): string[] {
  return meta.contributors.map((id) => PEOPLE[id]?.name).filter(Boolean) as string[];
}

/** Google Scholar (Highwire Press) tags plus article metadata. */
export function contentMetadata(meta: ContentMeta): Metadata {
  const path = contentPath(meta);
  const base = pageMetadata({ title: meta.title, description: meta.description, path, type: "article" });
  const scholarly = meta.kind === "paper" || meta.kind === "study" || meta.kind === "brief";
  const other: Record<string, string | string[]> = {};
  if (scholarly) {
    other["citation_title"] = meta.title;
    other["citation_author"] = SITE.researchTeamByline;
    other["citation_publication_date"] = meta.publishedAt.replace(/-/g, "/");
    other["citation_publisher"] = SITE.name;
    other["citation_abstract_html_url"] = `${SITE.url}${path}`;
    other["citation_language"] = "en";
    if (meta.pdf) other["citation_pdf_url"] = `${SITE.url}${meta.pdf}`;
    if (meta.doi) other["citation_doi"] = meta.doi;
    if (meta.kind === "paper" || meta.kind === "study") other["citation_technical_report_institution"] = SITE.name;
  }
  return {
    ...base,
    openGraph: {
      ...base.openGraph,
      type: "article",
      publishedTime: meta.publishedAt,
      modifiedTime: meta.updatedAt ?? meta.publishedAt,
    },
    other,
  };
}

export function articleJsonLd(meta: ContentMeta) {
  const path = contentPath(meta);
  const scholarly = meta.kind === "paper" || meta.kind === "study" || meta.kind === "brief";
  return {
    "@context": "https://schema.org",
    "@type": scholarly ? "ScholarlyArticle" : "Article",
    headline: meta.title,
    description: meta.description,
    image: [`${SITE.url}/og-default.png`],
    datePublished: meta.publishedAt,
    dateModified: meta.updatedAt ?? meta.publishedAt,
    author: { "@type": "Organization", name: SITE.researchTeamByline, url: `${SITE.url}/about` },
    contributor: authorNames(meta).map(name => ({ "@type": "Person", name })),
    publisher: { "@id": `${SITE.url}/#organization`, "@type": "NGO", name: SITE.name },
    mainEntityOfPage: { "@type": "WebPage", "@id": `${SITE.url}${path}` },
    isAccessibleForFree: true,
    license: "https://creativecommons.org/licenses/by/4.0/",
    ...(meta.doi ? { identifier: { "@type": "PropertyValue", propertyID: "DOI", value: meta.doi } } : {}),
    citation: getCitations(meta.citations).map((c) => ({
      "@type": "CreativeWork",
      name: formatCitation(c),
      url: citationHref(c),
    })),
  };
}

export function faqJsonLd(faqs: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: `${SITE.url}${it.path}`,
    })),
  };
}
