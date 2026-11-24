import { getEntries } from "@/lib/content";
import { EntryList } from "@/components/EntryList";
import { PageHeader, Container } from "@/components/PageHeader";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Speaking by profession",
  description: "Profession-by-profession guides to the speaking demands of the job, based on U.S. Department of Labor data and research.",
  path: "/professions",
});

export default function Index() {
  return (
    <>
      <PageHeader eyebrow="Speaking by profession" title="How speaking shows up in your job" lede="Profession-by-profession guides to the speaking demands of the job, based on U.S. Department of Labor data and research." />
      <Container>
        <div className="py-12">
          <EntryList entries={getEntries("professions")} empty="The first guides are in review." />
        </div>
      </Container>
    </>
  );
}
