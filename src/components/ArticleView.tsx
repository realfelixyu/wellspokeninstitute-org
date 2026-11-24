import Link from "next/link";
import type { ContentEntry } from "@/lib/content";
import { extractFaqs, formatDate } from "@/lib/content";
import { getCitations, citationHref, formatCitation } from "@/lib/citations";
import { Mdx } from "@/components/Mdx";
import { Breadcrumbs } from "@/components/PageHeader";
import { JsonLd, articleJsonLd, authorNames, breadcrumbJsonLd, contentPath, faqJsonLd } from "@/lib/seo";
import { PEOPLE, SITE } from "@/data/site";
import { NewsletterInline } from "@/components/Newsletter";

const KIND_LABEL: Record<string, string> = {
  paper: "Research paper",
  study: "Original study",
  brief: "Research brief",
  article: "Explainer",
  profession: "Speaking by profession",
  statistics: "Statistics",
};

const COLLECTION_LABEL: Record<string, string> = {
  research: "Research",
  learn: "Learn",
  professions: "By profession",
  statistics: "Statistics",
};

export function ArticleView({ entry }: { entry: ContentEntry }) {
  const { meta, body } = entry;
  const path = contentPath(meta);
  const citations = getCitations(meta.citations);
  const faqs = extractFaqs(body);
  const names = authorNames(meta);
  const year = meta.publishedAt.slice(0, 4);
  const crumbs = [
    { name: "Home", path: "/" },
    { name: COLLECTION_LABEL[meta.collection], path: `/${meta.collection}` },
    { name: meta.title, path },
  ];
  const howToCite = `${SITE.researchTeamByline}${names.length ? ` (${names.join(", ")})` : ""}. (${year}). ${meta.title}. ${SITE.name}.${meta.doi ? ` https://doi.org/${meta.doi}` : ` ${SITE.url}${path}`}`;

  return (
    <article>
      <JsonLd data={articleJsonLd(meta)} />
      <JsonLd data={breadcrumbJsonLd(crumbs)} />
      {faqs.length ? <JsonLd data={faqJsonLd(faqs)} /> : null}

      <header className="border-b border-rule">
        <div className="mx-auto max-w-3xl px-4 pb-10 pt-10 sm:px-6 sm:pt-14">
          <Breadcrumbs items={crumbs} />
          <p className="mt-6 text-sm font-semibold uppercase tracking-[0.12em] text-accent">{KIND_LABEL[meta.kind]}</p>
          <h1 className="mt-3 font-serif text-[2rem] font-semibold leading-[1.15] tracking-tight text-ink sm:text-[2.75rem]">
            {meta.title}
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-ink-2">{meta.description}</p>
          <div className="mt-6 flex flex-col gap-1 text-sm text-ink-3 sm:flex-row sm:flex-wrap sm:gap-x-4">
            <span>
              By <Link href="/about" className="font-medium text-ink hover:text-accent">{SITE.researchTeamByline}</Link>
            </span>
            <span>
              Published <time dateTime={meta.publishedAt}>{formatDate(meta.publishedAt)}</time>
            </span>
            {meta.updatedAt && meta.updatedAt !== meta.publishedAt ? (
              <span>
                Updated <time dateTime={meta.updatedAt}>{formatDate(meta.updatedAt)}</time>
              </span>
            ) : null}
            <span>{meta.readingMinutes} min read</span>
          </div>
          {meta.doi || meta.pdf ? (
            <div className="mt-5 flex flex-wrap gap-3 text-sm">
              {meta.pdf ? (
                <a href={meta.pdf} className="rounded-md bg-accent px-4 py-2 font-medium text-accent-ink hover:opacity-90">
                  Download PDF
                </a>
              ) : null}
              {meta.doi ? (
                <a href={`https://doi.org/${meta.doi}`} className="rounded-md border border-rule px-4 py-2 text-ink hover:border-accent">
                  DOI: {meta.doi}
                </a>
              ) : null}
            </div>
          ) : null}
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-4 pt-10 sm:px-6">
        {meta.keyFindings.length ? (
          <section aria-labelledby="key-findings" className="mb-10 rounded-xl border border-rule bg-card p-6">
            <h2 id="key-findings" className="font-serif text-xl font-semibold text-ink">
              Key findings
            </h2>
            <ul className="mt-4 space-y-3 text-[1rem] leading-relaxed text-ink-2">
              {meta.keyFindings.map((f) => (
                <li key={f} className="flex gap-3">
                  <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <Mdx source={body} citationKeys={meta.citations} />

        {meta.dataSource ? (
          <p className="mt-10 rounded-lg border border-rule bg-paper-2 px-5 py-4 text-sm leading-relaxed text-ink-2">
            <span className="font-semibold text-ink">Data: </span>
            {meta.dataSource}
          </p>
        ) : null}

        {citations.length ? (
          <section aria-labelledby="references" className="mt-14 border-t border-rule pt-8">
            <h2 id="references" className="font-serif text-xl font-semibold text-ink">
              References
            </h2>
            <ol className="mt-5 list-decimal space-y-3 pl-5 text-[0.95rem] leading-relaxed text-ink-2">
              {citations.map((c, i) => {
                const href = citationHref(c);
                return (
                  <li key={c.key} id={`ref-${i + 1}`} className="pl-1">
                    {formatCitation(c)}{" "}
                    {href ? (
                      <a href={href} className="break-all text-accent underline underline-offset-2" target="_blank" rel="noopener noreferrer">
                        {c.doi ? `https://doi.org/${c.doi}` : href}
                      </a>
                    ) : null}
                  </li>
                );
              })}
            </ol>
          </section>
        ) : null}

        <section aria-labelledby="about-this" className="mt-12 grid gap-6 border-t border-rule pt-8 text-sm text-ink-2 sm:grid-cols-2">
          <div>
            <h2 id="about-this" className="font-semibold text-ink">
              Contributors
            </h2>
            <ul className="mt-2 space-y-1">
              <li>{SITE.researchTeamByline}</li>
              {meta.contributors.map((id) =>
                PEOPLE[id] ? (
                  <li key={id}>
                    {PEOPLE[id].name}, {PEOPLE[id].role}
                  </li>
                ) : null
              )}
              {meta.reviewers.map((r) => (
                <li key={r}>Reviewed by {r}</li>
              ))}
            </ul>
            <p className="mt-3">
              <Link href="/editorial-policy" className="text-accent underline underline-offset-2">
                Editorial and research policy
              </Link>{" "}
              ·{" "}
              <Link href="/disclosures" className="text-accent underline underline-offset-2">
                Funding and disclosures
              </Link>
            </p>
          </div>
          <div>
            <h2 className="font-semibold text-ink">How to cite</h2>
            <p className="mt-2 rounded-md bg-paper-2 p-3 font-mono text-[0.8rem] leading-relaxed">{howToCite}</p>
            <p className="mt-2 text-xs text-ink-3">Licensed CC BY 4.0. Reuse with attribution.</p>
          </div>
        </section>

        <div className="mt-14">
          <NewsletterInline />
        </div>
      </div>
    </article>
  );
}
