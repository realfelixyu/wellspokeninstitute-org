import { PageHeader } from "@/components/PageHeader";
import { Prose } from "@/components/Prose";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Listener sheet | Explain a research finding",
  description: "Four prompts for listening to a classmate explain a research finding and restating what you understood.",
  path: "/curriculum/explain-a-research-finding/listener",
});

export default function ResearchListener() {
  return <>
    <PageHeader eyebrow="College speaking lesson · Listener sheet" title="Tell the finding in your own words"
      lede="Imagine you are talking to someone who missed class. What would you tell them about the finding you just heard?" />
    <Prose>
      <h2>Round one</h2>
      <p>Listen without looking at the presenter’s card. You may ask one question. Write the occupation’s name on your paper, then make short notes for these four prompts.</p>
      <ol>
        <li>What changed or stayed the same in each rating?</li>
        <li>What did the two scales measure, and what range did each use?</li>
        <li>When did the later database come out? When were this occupation’s ratings in it last updated?</li>
        <li>What would someone need other evidence to find out?</li>
      </ol>
      <p>Say your account aloud before the presenter comments. Leave your first account as you wrote it. Which phrase helped you understand? What detail did you have to ask about?</p>
      <h2>Round two</h2>
      <p>Move to the other presenter. Keep your earlier notes private. Use a fresh space on your paper for the second occupation. Listen, ask your question and use the same four prompts. Compare notes with the presenter only after you have given your account.</p>
    </Prose>
  </>;
}
