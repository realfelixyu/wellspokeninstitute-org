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

const lessons = [
  {
    id: "high-school", audience: "High school", title: "Use evidence in a discussion", duration: "25 minutes",
    goal: "Students can support a proposal with evidence and respond to a classmate’s objection.",
    prompt: "Your school can offer one late bus. In this fictional survey, 18 students asked for a bus after sports and 12 after homework club. The school does not know how many students skipped the survey. Which group should get the bus, and what would change your recommendation?",
    steps: [
      "Give students three minutes to write a recommendation, underline a number that supports it, and name one thing the survey cannot tell them.",
      "In groups of three, each student has one minute to make a case. The next speaker must restate a point they heard before giving their own view. Allow eight minutes for discussion.",
      "Give each group six minutes to draft a joint recommendation. Invite one group to present it and another to ask about the missing evidence.",
      "Use the final eight minutes for individual feedback and a second attempt. Ask each speaker to show where a classmate’s question changed or clarified their reasoning.",
    ],
    lookFor: "Listen for a student who cites the survey, names its limitation and answers another speaker’s actual point.",
  },
  {
    id: "college", audience: "College", title: "Explain a finding to someone outside your course", duration: "20 minutes",
    goal: "A listener can explain what a finding means and where the evidence ends.",
    prompt: "A fictional campus report says library visits rose from 80 to 100 during a week with longer opening hours. Explain the finding to a new student who has never seen the report.",
    steps: [
      "Give pairs three minutes to distinguish visits from individual visitors and list another possible reason for the increase.",
      "The speaker has one minute to explain the finding without showing notes. The listener writes down what changed, by how much, and what remains uncertain. Swap roles. Allow five minutes.",
      "Spend five minutes comparing each listener’s notes with what the speaker meant. Mark the phrase that caused the largest misunderstanding.",
      "Use seven minutes to rewrite that phrase, repeat the explanation and ask a different listener to paraphrase it.",
    ],
    lookFor: "A listener should be able to repeat the change in visits without claiming that longer hours caused it.",
  },
  {
    id: "adult-esl", audience: "Adult English learners", title: "Clarify a changed appointment", duration: "20 minutes",
    goal: "Both speakers leave a conversation with the same time, place and next action.",
    prompt: "Caller: your appointment was Thursday at 10 a.m. Ask when and where to go. Your bus arrives five minutes before the new time. Find out if that gives you enough time. Receptionist: the appointment moved to Friday at 2 p.m. in room 16. Check-in takes ten minutes. Ask the caller to arrive by 1:50 p.m.",
    steps: [
      "Model a two-minute exchange. Write “Did you say…?”, “Could you repeat the room number?” and “So I will…” where everyone can see them.",
      "In pairs, have the caller phone the receptionist from across a table. Give them four minutes to ask questions, then have each partner write the final arrangement independently.",
      "Spend five minutes comparing notes. Where they disagree, the caller asks a specific question and the receptionist answers in different words.",
      "Give the same caller six minutes to make a second call with the original card and check both written arrangements. Use three minutes to compare attempts and share the phrase that resolved the misunderstanding.",
    ],
    lookFor: "Score whether the two written arrangements agree. A regional accent or a request for repetition carries no penalty.",
  },
  {
    id: "workplace", audience: "Workplace training", title: "Hand off an unfinished task", duration: "15 minutes",
    goal: "The incoming colleague can identify the open task, its owner and the decision deadline.",
    prompt: "At shift change a delivery is missing three cartons. A replacement might arrive by 3 p.m. The outgoing colleague has logged the shortage. The incoming colleague must call the supplier at 2 p.m. and tell the supervisor if the cartons will miss dispatch.",
    steps: [
      "Give the outgoing colleague two minutes to mark what is known, what is still uncertain, and who owns the next action.",
      "Allow three minutes for a spoken handoff and read-back. The incoming colleague then writes their first action and its deadline from memory.",
      "Use four minutes to compare the plan with the scenario. The listener names the detail that would have been easiest to miss on a busy shift.",
      "Keep the roles and the scenario. Give the pair four minutes for a second handoff and read-back, then two minutes to compare the listener’s notes from both attempts.",
    ],
    lookFor: "The incoming colleague can name the call, its owner, the 2 p.m. deadline and the condition for notifying the supervisor.",
  },
];

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
      {lessons.map(l => <section key={l.id} id={l.id} className="space-y-4">
        <h2>{l.title}</h2>
        <p className="text-sm font-semibold text-accent">{l.audience} · {l.duration}</p>
        <p>{l.goal}</p>
        <h3>{l.id === "adult-esl" ? "Give each person their own role card" : "Read this to the group"}</h3><p>{l.id === "adult-esl" ? l.prompt.split(" Receptionist:")[0] : l.prompt}</p>
        {l.id === "adult-esl" && <p>Receptionist:{l.prompt.split(" Receptionist:")[1]}</p>}
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
