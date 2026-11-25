import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { Prose } from "@/components/Prose";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Research agenda",
  description: "The questions Wellspoken Institute is investigating about how spoken communication skills develop and why they matter.",
  path: "/research/agenda",
});

export default function AgendaPage() {
  return (
    <>
      <PageHeader eyebrow="Research agenda" title="What we are studying" lede="Our open questions, current projects, and planned studies." />
      <Prose>
        <h2>Core questions</h2>
        <ol>
          <li>How much do jobs, schools, and civic life depend on spoken communication, and is that dependence changing?</li>
          <li>What kinds of practice actually improve speaking, and for whom?</li>
          <li>How do communication skill gaps affect adult English learners, immigrants, and first-generation students?</li>
          <li>How fairly do automated tools score speech from people with different accents and language backgrounds?</li>
        </ol>
        <h2>Current and planned projects</h2>
        <h3>Speaking at work (ongoing data series)</h3>
        <p>
          We combine U.S. Department of Labor occupational ratings with federal employment and wage data to measure
          how much each occupation depends on speaking. The first release is our{" "}
          <Link href="/research/speaking-at-work-2026">Speaking at Work 2026</Link> data brief and the{" "}
          <Link href="/data/speaking-by-occupation">open dataset</Link>. Our{" "}
          <Link href="/research/speaking-demand-over-time">historical comparison</Link> follows occupations with matching definitions across two O*NET® releases.
        </p>
        <h3>Spaced versus massed speaking practice for adult English learners (protocol in preparation)</h3>
        <p>
          Our draft protocol asks whether a larger trial of speaking-practice schedules is feasible. The proposed
          study would randomly assign 96 adults who use English as an additional language to one of two
          four-week schedules. Both groups would complete twelve 10-minute modules. One group would practice
          on three separate days each week. The other would do the same work in one weekly sitting.
        </p>
        <p>
          We would track recruitment, attendance, follow-up, usable recordings, whether participants practiced
          outside their assigned schedule, and whether assessors could guess the assignments. Participants
          would know their own schedule. Coders and raters would be kept unaware of group and assessment time.
          An exploratory analysis would count pauses within clauses on an unfamiliar speaking task 28 days
          after the planned end of practice.
        </p>
        <p>
          This is a proposed protocol. Recruitment has not begun. Independent ethics review, investigator
          sign-off and prospective registration are required before recruitment. We intend to seek journal
          review through the Registered Report route.
        </p>
        <h3>Normal ranges for everyday speaking tasks (planned)</h3>
        <p>
          How long are typical answers to common interview questions? How often do fluent speakers pause or use
          fillers? We plan to publish reference ranges from large samples of de-identified practice sessions, with
          full methods and limitations.
        </p>
        <h3>The state of speaking skills in the U.S. (planned)</h3>
        <p>
          A national survey of adults on speaking confidence, training received, and how communication affects
          their work and education.
        </p>
        <h2>Collaborate</h2>
        <p>
          We are looking for academic collaborators and adult education or workforce partners. See{" "}
          <Link href="/contact">contact</Link>.
        </p>
      </Prose>
    </>
  );
}
