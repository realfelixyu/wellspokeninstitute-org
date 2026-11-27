import Link from "next/link";
import { notFound } from "next/navigation";
import { lessons } from "@/data/curriculum";
import { pageMetadata } from "@/lib/seo";
import { PrintWorksheet } from "./PrintWorksheet";
import styles from "./worksheet.module.css";

type Lesson = (typeof lessons)[number];
type Card = { role: string; directions: string; prompts: [string, string] };
type PageProps = { params: Promise<{ lesson: string }> };

function roleCards(lesson: Lesson): [Card, Card] {
  switch (lesson.id) {
    case "high-school":
      return [
        { role: "Speaker", directions: lesson.prompt, prompts: ["My recommendation and the evidence behind it", "One thing the survey leaves out"] },
        { role: "Discussion partner", directions: "Listen to the proposal for the late bus. Restate the speaker’s reasoning before raising an objection. Invite the speaker to revise the proposal.", prompts: ["I heard this reason for choosing a group", "The speaker’s answer to my objection"] },
      ];
    case "college":
      return [
        { role: "Presenter", directions: lesson.prompt, prompts: ["What my campus report counted", "One explanation the report cannot rule out"] },
        { role: "Listener", directions: "You are a new student hearing about a campus service. After the explanation, write what you understood. Ask about anything you had to guess.", prompts: ["What changed, and by how much?", "What is still uncertain?"] },
      ];
    case "adult-esl":
      return [
        { role: "Caller", directions: lesson.caller, prompts: ["New day, appointment time and room", "When do I need to arrive? What will I do about my bus?"] },
        { role: "Receptionist", directions: lesson.receptionist, prompts: ["What time and room did the caller repeat?", "What did we agree to do about arrival?"] },
      ];
    case "workplace":
      return [
        { role: "Outgoing colleague", directions: lesson.prompt, prompts: ["What I have already done", "What the incoming colleague needs to do and when"] },
        { role: "Incoming colleague", directions: "Your colleague is handing off an unfinished delivery. Listen without seeing their notes. Read back what you will do so they can correct any missed detail.", prompts: ["My first action and its deadline", "When I should tell the supervisor"] },
      ];
  }
}

export const dynamicParams = false;

export function generateStaticParams() {
  return lessons.map(lesson => ({ lesson: lesson.id }));
}

export async function generateMetadata({ params }: PageProps) {
  const { lesson: id } = await params;
  const lesson = lessons.find(item => item.id === id);
  if (!lesson) return {};
  return pageMetadata({
    title: `${lesson.title} | Printable practice sheet`,
    description: `Printable role cards for the ${lesson.audience.toLowerCase()} speaking lesson. ${lesson.goal}`,
    path: `/curriculum/worksheets/${id}`,
  });
}

export default async function WorksheetPage({ params }: PageProps) {
  const { lesson: id } = await params;
  const lesson = lessons.find(item => item.id === id);
  if (!lesson) notFound();

  return <article className={styles.sheet}>
    <div className={`${styles.actions} no-print`}>
      <Link href={`/curriculum#${lesson.id}`}>← Teacher guide</Link>
      <PrintWorksheet />
    </div>
    <header>
      <p className={styles.audience}>{lesson.audience} · Speaking practice</p>
      <h1>{lesson.title}</h1>
      <p>{lesson.id === "high-school"
        ? "Print one sheet per student. In groups of three, take turns presenting a proposal. The next speaker uses the discussion partner card to restate the proposal and raise an objection before presenting their own."
        : lesson.id === "college"
          ? "Print one sheet per pair. Cut it in two and hand out the cards. The presenter uses the assigned report, A or B. Compare notes. For the second attempt, exchange listeners with a pair that used the other report."
          : "Print one sheet per pair. Cut along the dashed line and give each person their own card. Each partner makes notes before comparing what they understood."}</p>
    </header>
    {roleCards(lesson).map(card => <section className={styles.card} key={card.role}>
      <h2>{card.role}</h2>
      <p>{card.directions}</p>
      {card.prompts.map(prompt => <p className={styles.answer} key={prompt}>{prompt}</p>)}
      <p className={styles.retry}>Second attempt: which detail became clearer?</p>
    </section>)}
    <footer className={styles.credit}>Wellspoken Institute · Teach It Everywhere · <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a></footer>
  </article>;
}
