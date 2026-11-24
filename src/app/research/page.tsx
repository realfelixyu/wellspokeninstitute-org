import Link from "next/link";
import { getEntries } from "@/lib/content";
import { EntryList } from "@/components/EntryList";
import { PageHeader, Container } from "@/components/PageHeader";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Research",
  description: "Evidence reviews, original studies, and data briefs on spoken communication skills, education, and work.",
  path: "/research",
});

export default function ResearchIndex() {
  return (
    <>
      <PageHeader
        eyebrow="Research"
        title="Papers, studies, and data briefs"
        lede={
          <>
            Free to read, cite, and reuse under CC BY 4.0. See what we are working on next in our{" "}
            <Link href="/research/agenda" className="text-accent underline underline-offset-4">research agenda</Link>.
          </>
        }
      />
      <Container>
        <div className="py-12">
          <EntryList entries={getEntries("research")} empty="Our first publications are in review." />
        </div>
      </Container>
    </>
  );
}
