import Link from "next/link";
import { BOARD, SITE } from "@/data/site";
import { PageHeader } from "@/components/PageHeader";
import { Prose } from "@/components/Prose";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "About the Institute",
  description:
    "Wellspoken Institute is a Virginia nonprofit and 501(c)(3) public charity that researches spoken communication skills and publishes free resources.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow="About"
        title="Research and public education on spoken communication"
        lede={<>Who we are, what we study, and how we keep our work independent.</>}
      />
      <Prose>
        <p>
          {SITE.name} is a nonprofit research organization. We study how people develop spoken communication skills,
          why those skills matter for education, work, and economic mobility, and what helps people improve. We
          publish what we learn for free, along with open data, practical tools, and teaching materials.
        </p>
        <p>
          We pay particular attention to people for whom speaking confidently carries the highest stakes and the
          least support: adult English learners, immigrants and refugees, first-generation college students and
          professionals, and the schools and workforce programs that serve them.
        </p>
        <h2>What we do</h2>
        <ul>
          <li>
            <strong>Research.</strong> Evidence reviews, original studies, and data briefs. See{" "}
            <Link href="/research">our research</Link> and <Link href="/research/agenda">research agenda</Link>.
          </li>
          <li>
            <strong>Open data.</strong> Datasets such as <Link href="/data/speaking-by-occupation">speaking demands by
            occupation</Link>, released under CC BY 4.0.
          </li>
          <li>
            <strong>Public education.</strong> Free <Link href="/tools">practice tools</Link>,{" "}
            <Link href="/professions">guides by profession</Link>, and <Link href="/learn">explainers</Link>.
          </li>
        </ul>
        <h2>Who we are</h2>
        <p>
          The Institute was incorporated in {SITE.stateOfIncorporation} in July 2026 and is recognized by the IRS as a{" "}
          {SITE.taxStatus}. Our publications carry the byline &ldquo;{SITE.researchTeamByline},&rdquo; with
          individual contributors and outside reviewers listed on each piece.
        </p>
        <div className="not-prose my-8 grid gap-4 sm:grid-cols-2">
          {BOARD.map((p) => (
            <div key={p.id} className="rounded-xl border border-rule bg-card p-5">
              <p className="font-serif text-lg font-semibold text-ink">{p.name}</p>
              <p className="text-sm text-accent">{p.role}</p>
              <p className="mt-2 text-sm leading-relaxed text-ink-2">{p.bio}</p>
            </div>
          ))}
        </div>
        <p>
          Our founders also co-founded Wellspoken Labs, a company that makes speaking-practice software. The two
          organizations are separate legal entities. We explain the relationship, and the rules that keep our
          research independent, on our <Link href="/disclosures">funding and disclosures</Link> page and in our{" "}
          <Link href="/editorial-policy">editorial and research policy</Link>.
        </p>
        <h2>Work with us</h2>
        <p>
          We welcome collaboration with researchers, educators, adult education and workforce programs, and
          journalists. Write to <a href={`mailto:${SITE.email}`}>{SITE.email}</a>.
        </p>
      </Prose>
    </>
  );
}
