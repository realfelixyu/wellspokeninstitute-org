import { getEntries } from "@/lib/content";
import { EntryList } from "@/components/EntryList";
import { PageHeader, Container } from "@/components/PageHeader";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Statistics",
  description: "Sourced statistics on public speaking, communication skills at work, speaking anxiety, and English learners, updated regularly.",
  path: "/statistics",
});

export default function Index() {
  return (
    <>
      <PageHeader eyebrow="Statistics" title="Statistics on speaking and communication" lede="Sourced statistics on public speaking, communication skills at work, speaking anxiety, and English learners, updated regularly." />
      <Container>
        <div className="py-12">
          <EntryList entries={getEntries("statistics")} empty="The first guides are in review." />
        </div>
      </Container>
    </>
  );
}
