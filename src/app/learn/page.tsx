import Link from "next/link";
import { getEntries } from "@/lib/content";
import { EntryList } from "@/components/EntryList";
import { PageHeader, Container } from "@/components/PageHeader";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Learn",
  description: "Evidence-based explainers on public speaking, interviews, meetings, accents, and speaking anxiety. Every claim is sourced.",
  path: "/learn",
});

export default function Index() {
  return (
    <>
      <PageHeader
        eyebrow="Learn"
        title="Explainers on speaking and communication"
        lede={
          <>
            Evidence-based explainers on public speaking, interviews, meetings, accents, and speaking anxiety. Every claim is
            sourced. You can also{" "}
            <Link href="/topics" className="text-accent underline underline-offset-4">
              browse guides by topic
            </Link>
            .
          </>
        }
      />
      <Container>
        <div className="py-12">
          <EntryList entries={getEntries("learn")} empty="The first guides are in review." />
        </div>
      </Container>
    </>
  );
}
