import { SITE } from "@/data/site";
import { PageHeader } from "@/components/PageHeader";
import { Prose } from "@/components/Prose";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Editorial and research policy",
  description: `How ${SITE.name} sources claims, protects research independence, handles data, uses AI tools, and corrects errors.`,
  path: "/editorial-policy",
});

export default function EditorialPolicyPage() {
  return (
    <>
      <PageHeader eyebrow="Standards" title="Editorial and research policy" />
      <Prose>
        <h2>Independence</h2>
        <p>
          Research questions, methods, and conclusions are decided by the Institute alone. No funder or data
          provider may review, edit, approve, or block a publication. We publish results whether or not they are
          convenient for anyone, including our funders.
        </p>
        <h2>Sourcing</h2>
        <ul>
          <li>Every factual claim links to a source. We prefer peer-reviewed research and official statistics.</li>
          <li>Each reference is checked against its original record (for example its DOI) before publication.</li>
          <li>We distinguish what a study found from what we infer, and we say when evidence is thin or mixed.</li>
          <li>Correlation is reported as correlation. We do not present associations as causes.</li>
        </ul>
        <h2>Original data and privacy</h2>
        <ul>
          <li>We analyze only de-identified, aggregated data and never publish anything that could identify a person.</li>
          <li>Methods, limitations, and data sources are described on every study page.</li>
          <li>Where licenses and privacy allow, we publish the data behind our figures.</li>
        </ul>
        <h2>Authorship</h2>
        <p>
          Publications carry the byline &ldquo;{SITE.researchTeamByline}.&rdquo; Each page lists the named people
          who contributed and any outside reviewers. We never publish under invented names.
        </p>
        <h2>Use of AI tools</h2>
        <p>
          We use software, including AI tools, to help with data processing, drafting, and checking. People at the
          Institute are responsible for every published claim, and every reference is verified against its source
          before publication.
        </p>
        <h2>Corrections and updates</h2>
        <p>
          We fix errors promptly and record the date of meaningful updates on the page. To report an error, email{" "}
          <a href={`mailto:${SITE.email}`}>{SITE.email}</a>.
        </p>
        <h2>Licensing</h2>
        <p>
          Unless noted otherwise, our text and data are licensed under Creative Commons Attribution 4.0 (CC BY 4.0).
          Third-party data keeps its original license, which we name on each dataset.
        </p>
      </Prose>
    </>
  );
}
