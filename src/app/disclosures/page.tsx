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
          Our published research draws on public occupational data and the research literature. Before we accept
          aggregate tables from the Wellspoken speaking app, we require a written data agreement and privacy review.
          The following rules apply to any future study using those tables.
        </p>
        <ul>
          <li>The study credits its data source in a visible &ldquo;Data&rdquo; line. Its methods describe which sessions were included.</li>
          <li>The Institute may receive aggregate tables only. Names, email addresses, recordings and individual session records stay with the data provider.</li>
          <li>Wellspoken Labs has no right to review, approve, delay, or veto a publication.</li>
          <li>We publish our methods and, where privacy allows, the aggregated data behind each figure.</li>
        </ul>

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
