import Link from "next/link";
import { SITE } from "@/data/site";
import { PageHeader } from "@/components/PageHeader";
import { Prose } from "@/components/Prose";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Funding and disclosures",
  description: `How ${SITE.name} is funded, its relationship with Wellspoken Labs, and the rules that keep its research independent.`,
  path: "/disclosures",
});

export default function DisclosuresPage() {
  return (
    <>
      <PageHeader eyebrow="Transparency" title="Funding and disclosures" lede="Who is behind the Institute and how we handle conflicts of interest." />
      <Prose>
        <h2>Our relationship with Wellspoken Labs</h2>
        <p>
          The Institute&rsquo;s founders, Felix Yu and Linfeng (Liam) Du, also co-founded Wellspoken Labs Inc., a
          for-profit company that makes the Wellspoken speaking-practice app. The Institute and Wellspoken Labs are
          separate legal entities with separate finances. The Institute does not sell, license, or endorse any
          product, and our publications do not promote any product.
        </p>
        <h2>Use of Wellspoken app data</h2>
        <p>
          Some of our studies analyze speaking-practice data recorded in the Wellspoken app, because large samples
          of real practice sessions are rare in public research. When we do:
        </p>
        <ul>
          <li>The study says so in a &ldquo;Data&rdquo; line and in its methods.</li>
          <li>We receive only de-identified, aggregated data. We never receive names, emails, or recordings.</li>
          <li>Wellspoken Labs has no right to review, approve, delay, or veto a publication.</li>
          <li>We publish our methods and, where privacy allows, the aggregated data behind each figure.</li>
        </ul>
        <p>
          Most of our work uses public data (for example U.S. Department of Labor occupational ratings) or the
          published research literature and involves no company data at all.
        </p>
        <h2>Funding</h2>
        <p>
          The Institute is funded by contributions. We will publish every contributor of 5,000 USD or more in a
          calendar year, including any contribution from Wellspoken Labs, in our annual report. Contributors do not
          receive any say over research questions, methods, findings, or publication.
        </p>
        <h2>Corrections</h2>
        <p>
          If you find an error, write to <a href={`mailto:${SITE.email}`}>{SITE.email}</a>. We correct errors
          promptly and note the change on the page. See our <Link href="/editorial-policy">editorial policy</Link>.
        </p>
      </Prose>
    </>
  );
}
