import Link from "next/link";
import { lessons } from "@/data/curriculum";
import { CurriculumDelivery } from "@/components/CurriculumDelivery";
import { SITE } from "@/data/site";
import { PageHeader } from "@/components/PageHeader";
import { Prose } from "@/components/Prose";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Teach It Everywhere | Speaking lesson plans",
  description: "Four ready-to-teach lessons with scenarios, listener feedback and a printable rubric for high school, college, adult English classes and workplace training.",
  path: "/curriculum",
});

const scenarioDirections = {
  "high-school": "Read this to the group",
  college: "Give this only to the presenter",
  "adult-esl": "Give each person their own role card",
  workplace: "Give this only to the outgoing colleague",
};

export default function CurriculumPage() {
  const template = Number(process.env.BREVO_CURRICULUM_TEMPLATE_ID);
  const enabled = process.env.CF_PAGES === "1" && process.env.CF_PAGES_BRANCH === "main" &&
    Number.isSafeInteger(template) && template > 0 && template !== Number(process.env.BREVO_DOI_TEMPLATE_ID);
  return <>
    <PageHeader eyebrow="Teach It Everywhere" title="Speaking lessons you can teach today" lede="Choose a lesson for your group. Each includes a scenario you can read aloud, time for a second attempt and a way to check what the listener understood." />
    <Prose>
      <nav aria-label="Choose a lesson">
        <ul>{lessons.map(l => <li key={l.id}><a href={`#${l.id}`}>{l.audience}: {l.title}</a> ({l.duration})</li>)}</ul>
      </nav>
      <CurriculumDelivery siteKey={enabled ? process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "" : ""} gaId={SITE.gaId} />
      <p><a href="/curriculum/learner-worksheets.pdf" download>Download all four learner worksheets (PDF)</a></p>
      {lessons.map(l => <section key={l.id} id={l.id} className="space-y-4">
        <h2>{l.title}</h2>
        <p className="text-sm font-semibold text-accent">{l.audience} · {l.duration}</p>
        <p>{l.goal}</p>
        <h3>{scenarioDirections[l.id]}</h3>
        {l.id === "adult-esl" ? <>
          <p>Caller: {l.caller}</p><p>Receptionist: {l.receptionist}</p>
        </> : <p>{l.prompt}</p>}
        <p><Link href={`/curriculum/worksheets/${l.id}`}>Printable {l.audience.toLowerCase()} practice sheet</Link></p>
        {l.id === "college" && <p><Link href="/curriculum/explain-a-research-finding">Teach this lesson with real job ratings</Link>. The 20-minute version includes private presenter cards and a separate listener sheet.</p>}
        <h3>Teacher guide</h3><ol>{l.steps.map(s => <li key={s}>{s}</li>)}</ol>
        <p><strong>What to listen for.</strong> {l.lookFor}</p>
        {l.id === "high-school" && <p>Aligned to grades 9–10 speaking and listening standards SL.9-10.1 (collaborative discussion) and SL.9-10.4 (presenting evidence). <a href="https://www.thecorestandards.org/ELA-Literacy/SL/9-10/">Read the standards</a>.</p>}
      </section>)}
      <h2>Listener feedback sheet</h2>
      <p>Score each row after the first attempt, then again after the second. Use the same prompt for both attempts. Leave a row blank if the task did not give the speaker an opportunity to demonstrate it.</p>
      <div className="table-wrap"><table><thead><tr><th scope="col">Skill</th><th scope="col">0 · Try again</th><th scope="col">1 · With a prompt</th><th scope="col">2 · Independently</th></tr></thead>
      <tbody>
        <tr><th scope="row">Main point</th><td>I could not restate it.</td><td>I could restate it after asking.</td><td>I could restate it in my own words.</td></tr>
        <tr><th scope="row">Supporting detail</th><td>A necessary detail was missing.</td><td>The speaker supplied it when asked.</td><td>The speaker gave the detail I needed.</td></tr>
        <tr><th scope="row">Response to the listener</th><td>My question remained open.</td><td>A follow-up prompt resolved it.</td><td>The speaker answered my question directly.</td></tr>
      </tbody></table></div>
      <p>Write the words that helped you understand. Tell the speaker one change to try. Keep the scores with the learner and compare only their two attempts.</p>
    </Prose>
  </>;
}
