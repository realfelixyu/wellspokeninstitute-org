import Link from "next/link";
import { SITE } from "@/data/site";
import { SPEAKING_SUMMARY, millions } from "@/data/stats";
import { getEntries } from "@/lib/content";
import { EntryCards } from "@/components/EntryList";
import { NewsletterInline } from "@/components/Newsletter";
import { Container } from "@/components/PageHeader";
import { TOOLS } from "@/data/tools";

export default function Home() {
  const research = getEntries("research").slice(0, 3);
  const learn = getEntries("learn").slice(0, 3);
  const w = SPEAKING_SUMMARY.workerWeighted;
  const q = SPEAKING_SUMMARY.wages.quartiles;

  return (
    <>
      <section className="border-b border-rule">
        <Container>
          <div className="grid gap-12 py-16 sm:py-24 lg:grid-cols-[1.3fr_1fr] lg:items-end">
            <div className="fade-in">
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-accent">Nonprofit research institute</p>
              <h1 className="mt-4 font-serif text-[2.5rem] font-semibold leading-[1.08] tracking-tight text-ink sm:text-6xl">
                Speaking well should not be a privilege.
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-2 sm:text-xl">
                {SITE.name} studies why spoken communication matters for school, work, and economic mobility, and
                publishes free research, data, and tools so anyone can build the skill.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/research" className="rounded-lg bg-accent px-5 py-3 font-medium text-accent-ink hover:opacity-90">
                  Read the research
                </Link>
                <Link
                  href="/data/speaking-by-occupation"
                  className="rounded-lg border border-rule bg-card px-5 py-3 font-medium text-ink hover:border-accent"
                >
                  Explore the data
                </Link>
              </div>
            </div>
            <figure className="fade-in rounded-2xl border border-rule bg-card p-7">
              <p className="font-serif text-6xl font-semibold text-accent">{w.pctSpeakingImportantOrHigher}%</p>
              <figcaption className="mt-3 text-[1.02rem] leading-relaxed text-ink-2">
                of U.S. workers, about {millions(w.workersSpeakingImportantOrHigher)} people, are in occupations
                where speaking is rated at least &ldquo;important&rdquo; to the job.
                <span className="mt-3 block text-sm text-ink-3">
                  Wellspoken Institute analysis of O*NET® 31.0 and BLS May 2025 data.{" "}
                  <Link href="/research/speaking-at-work-2026" className="underline underline-offset-2 hover:text-accent">
                    Method
                  </Link>
                </span>
              </figcaption>
            </figure>
          </div>
        </Container>
      </section>

      <section className="border-b border-rule bg-paper-2">
        <Container>
          <div className="grid gap-8 py-14 sm:grid-cols-3">
            <div>
              <p className="font-serif text-4xl font-semibold text-ink">{millions(w.workersSpeakingVeryImportant)}</p>
              <p className="mt-2 text-ink-2">workers are in jobs where speaking is rated &ldquo;very important&rdquo; or higher.</p>
            </div>
            <div>
              <p className="font-serif text-4xl font-semibold text-ink">{w.pctFaceToFaceWeeklyOrMore}%</p>
              <p className="mt-2 text-ink-2">of workers hold jobs that involve face-to-face discussion at least weekly.</p>
            </div>
            <div>
              <p className="font-serif text-4xl font-semibold text-ink">
                {Math.round(q[3].medianOfMedianWages / 1000)}K vs {Math.round(q[0].medianOfMedianWages / 1000)}K
              </p>
              <p className="mt-2 text-ink-2">
                typical median pay (USD) in the most vs least speaking-intensive quarter of occupations.
              </p>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-16 sm:py-20">
        <Container>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 className="font-serif text-3xl font-semibold text-ink">Latest research</h2>
            <Link href="/research" className="text-accent underline underline-offset-4">
              All research
            </Link>
          </div>
          <div className="mt-8">
            <EntryCards entries={research} />
          </div>
        </Container>
      </section>

      <section className="border-y border-rule bg-card py-16 sm:py-20">
        <Container>
          <div className="grid gap-10 lg:grid-cols-3">
            <div>
              <h2 className="font-serif text-2xl font-semibold text-ink">Research</h2>
              <p className="mt-3 leading-relaxed text-ink-2">
                Evidence reviews and original studies on how communication skills develop and what they change in
                people&rsquo;s lives. Every claim is sourced.
              </p>
              <Link href="/research/agenda" className="mt-4 inline-block text-accent underline underline-offset-4">
                Our research agenda
              </Link>
            </div>
            <div>
              <h2 className="font-serif text-2xl font-semibold text-ink">Open data</h2>
              <p className="mt-3 leading-relaxed text-ink-2">
                Speaking demands for {SPEAKING_SUMMARY.occupationsRated} occupations, free to download and reuse under
                CC BY 4.0 for journalists, teachers, and researchers.
              </p>
              <Link href="/data/speaking-by-occupation" className="mt-4 inline-block text-accent underline underline-offset-4">
                Speaking by occupation
              </Link>
            </div>
            <div>
              <h2 className="font-serif text-2xl font-semibold text-ink">Free tools and teaching</h2>
              <p className="mt-3 leading-relaxed text-ink-2">
                {TOOLS.length} free practice tools and guides for {getEntries("professions").length || "dozens of"} professions.
                No account, no paywall.
              </p>
              <Link href="/tools" className="mt-4 inline-block text-accent underline underline-offset-4">
                Browse free tools
              </Link>
            </div>
          </div>
        </Container>
      </section>

      {learn.length ? (
        <section className="py-16 sm:py-20">
          <Container>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <h2 className="font-serif text-3xl font-semibold text-ink">Learn</h2>
              <Link href="/learn" className="text-accent underline underline-offset-4">
                All explainers
              </Link>
            </div>
            <div className="mt-8">
              <EntryCards entries={learn} />
            </div>
          </Container>
        </section>
      ) : null}

      <section className="pb-4 pt-4">
        <Container>
          <NewsletterInline source="home" />
        </Container>
      </section>
    </>
  );
}
