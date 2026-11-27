import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { Prose } from "@/components/Prose";
import { pageMetadata } from "@/lib/seo";
import styles from "./lesson.module.css";

const path = "/curriculum/explain-a-research-finding";
export const metadata = pageMetadata({
  title: "Explain a research finding | College speaking lesson",
  description: "A free 20-minute college lesson using two occupational speaking ratings. Includes private presenter cards, a listener sheet and an instructor tally.",
  path,
});

const cards = [
  { letter: "A", job: "Restaurant servers", title: "Waiters and Waitresses", code: "35-3031.00", update: "August 2025", importance: ["3.62", "3.50"], level: ["2.25", "2.62"] },
  { letter: "B", job: "Electricians", title: "Electricians", code: "47-2111.00", update: "August 2022", importance: ["3.12", "3.38"], level: ["3.12", "3.12"] },
];

export default function ResearchLesson() {
  return <>
    <PageHeader eyebrow="College speaking lesson · 20 minutes" title="Explain a research finding to someone outside your course"
      lede="Can someone who never saw your table explain what changed? Students practice using two federal job ratings, then try their explanation again with a new listener." />
    <Prose>
      <p><a href="/curriculum/college-research-pilot.pdf" download>Download the five-page classroom packet (PDF)</a> or use the cards below. Give listeners the <Link href={path + "/listener"}>separate listener sheet</Link>.</p>
      <h2>Set up groups of four</h2>
      <p>Choose two presenters and two listeners. Give each presenter a different private card. Seat the pairs far enough apart that they cannot hear each other. On paper, print the presenter cards on one side and cut them apart before class. Keep the answer key with the instructor.</p>
      <h2>Run the two rounds</h2>
      <ol>
        <li><strong>Prepare · 3 minutes.</strong> Presenters read only their assigned card and plan a one-minute explanation for someone outside the course. Listeners read the prompts on their own sheet.</li>
        <li><strong>Explain · 5 minutes.</strong> Each presenter speaks without showing the table. The listener may ask one question, then writes and says in their own words what they understood. Keep this first account as written.</li>
        <li><strong>Compare · 5 minutes.</strong> The presenter uses the private card to check the listener’s account. Together, identify a phrase that helped or a detail the listener misunderstood.</li>
        <li><strong>Revise and repeat · 7 minutes.</strong> Presenters revise one phrase. The two listeners switch places, taking their sheets and keeping their earlier notes private. Each hears the other occupation for the first time. Repeat the question and paraphrase before offering corrections.</li>
      </ol>
      <h2>Private presenter cards</h2>
      <p>Open only the card your instructor assigned. Explain how the two ratings changed, when the later database came out, when its ratings for your occupation were last updated, and one question the table leaves open.</p>
      {cards.map(card => <details key={card.letter} className="rounded-md border border-rule px-4 py-2">
        <summary className="cursor-pointer py-2 font-semibold">Card {card.letter} · {card.job}</summary>
        <div className="space-y-3 py-3">
          <p>O*NET occupation {card.code} · {card.title}</p>
          <div className="table-wrap"><table className={styles.ratings}>
            <caption className="pb-2 text-left">Speaking ratings for {card.job.toLowerCase()} in two database releases</caption>
            <thead><tr><th scope="col">Measure</th><th scope="col">July 2010 release</th><th scope="col">August 2026 release</th></tr></thead>
            <tbody>
              <tr><th scope="row">Ratings last updated</th><td>June 2010</td><td>{card.update}</td></tr>
              <tr><th scope="row">Importance (1–5)</th><td>{card.importance[0]}</td><td>{card.importance[1]}</td></tr>
              <tr><th scope="row">Skill level (0–7)</th><td>{card.level[0]}</td><td>{card.level[1]}</td></tr>
            </tbody>
          </table></div>
          <p>Importance describes how much the job depends on speaking. Level describes how much speaking skill the job requires. Both are analyst ratings of the occupation. A worker’s individual skill and time spent talking would require other evidence.</p>
        </div>
      </details>)}
      <h2>What did the listener understand?</h2>
      <p>Use the same four checks in both rounds. Score the account after the listener’s question and before anyone corrects it. A spoken or written answer in the student’s own words counts.</p>
      <ul>
        <li>Did the listener describe both directions, including a rating that stayed the same when applicable?</li>
        <li>Could they explain what each scale measures and give its range?</li>
        <li>Could they tell you the later release year and the year the occupation’s ratings were last updated in that release?</li>
        <li>Did they give one example of a question the data cannot answer?</li>
      </ul>
      <details className="rounded-md border border-rule px-4 py-2">
        <summary className="cursor-pointer py-2 font-semibold">Instructor answer key</summary>
        <ul className="py-2">
          <li><strong>Restaurant servers.</strong> Speaking importance fell and required skill level rose. The 2026 release carries ratings last updated in 2025.</li>
          <li><strong>Electricians.</strong> Speaking importance rose and required skill level stayed the same. The 2026 release carries ratings last updated in 2022.</li>
        </ul>
        <p className="pb-3">Importance runs from 1 to 5 and skill level from 0 to 7. Accept the correct years without the months. The figures alone cannot tell us why a rating changed.</p>
      </details>
      <p>For each round, tally the number of accounts you observed, the number meeting each check and the number meeting all four. Follow the same presenters across rounds if you can. Leave out any account you missed. If you observed none, that round has no result. Keep the tally anonymous and use it to choose what to explain differently in the next class.</p>
      <h2>Where the ratings come from</h2>
      <p>Wellspoken Institute compared the O*NET® 15.0 and 31.0 Databases from the U.S. Department of Labor, Employment and Training Administration (USDOL/ETA). Adapted under <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>. USDOL/ETA has not approved, endorsed or tested the Institute’s changes. See the <Link href="/data/speaking-demand-over-time">study methods and data</Link> and the <a href="https://www.onetcenter.org/dictionary/31.0/csv/essential_skills.html">O*NET definitions of the rating fields</a>.</p>
      <p><Link href="/curriculum#college">Return to the college speaking lesson</Link></p>
    </Prose>
  </>;
}
