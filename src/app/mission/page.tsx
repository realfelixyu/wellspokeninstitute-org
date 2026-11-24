import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { Prose } from "@/components/Prose";
import { pageMetadata } from "@/lib/seo";
import { SPEAKING_SUMMARY } from "@/data/stats";

export const metadata = pageMetadata({
  title: "Our mission",
  description:
    "Wellspoken Institute exists to advance public understanding of why spoken communication skills matter and to make the means of building them freely available.",
  path: "/mission",
});

export default function MissionPage() {
  const w = SPEAKING_SUMMARY.workerWeighted;
  return (
    <>
      <PageHeader eyebrow="Mission" title="Everyone deserves to be heard and understood" />
      <Prose>
        <p>
          Our charter commits us to three things. We advance public understanding of the importance of spoken
          communication and articulation skills to educational attainment, workforce participation, and economic
          mobility. We conduct, commission, and publish independent research on how communication skills develop and
          on the social and economic effects of communication skill gaps. And we provide public education and freely
          available resources on effective spoken communication, with particular attention to adult English
          learners, immigrants, refugees, first-generation Americans, and the organizations that serve them.
        </p>
        <h2>Why this matters</h2>
        <p>
          Speaking is part of almost every job. In our analysis of U.S. Department of Labor ratings,{" "}
          {w.pctSpeakingImportantOrHigher}% of workers are in occupations where speaking is rated at least
          &ldquo;important,&rdquo; and the more an occupation depends on speaking, the more it tends to pay (
          <Link href="/research/speaking-at-work-2026">see the data brief</Link>).
        </p>
        <p>
          Yet speaking is rarely taught directly. Most people build the skill informally, through family, school
          activities, and jobs that already expect it. That leaves the people with the least access to those
          settings, including many English learners and first-generation students, to learn it the hard way.
        </p>
        <h2>What we believe</h2>
        <ul>
          <li>Spoken communication is a learnable skill, not a fixed trait.</li>
          <li>Clear speech is about being understood, not about sounding like any one accent or class.</li>
          <li>Evidence should guide how speaking is taught, and that evidence should be free.</li>
        </ul>
      </Prose>
    </>
  );
}
