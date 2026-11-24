import Link from "next/link";
import { TOOLS } from "@/data/tools";
import { PageHeader, Container } from "@/components/PageHeader";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Free speaking practice tools",
  description: "Free, private speaking practice tools: speaking rate calculator, speech timer, filler word counter, teleprompter, interview practice, and more. No signup.",
  path: "/tools",
});

export default function ToolsIndex() {
  return (
    <>
      <PageHeader
        eyebrow="Free tools"
        title="Free speaking practice tools"
        lede="Private, free, and no account needed. Everything runs in your browser, so your words never leave your device."
      />
      <Container>
        <ul className="grid gap-4 py-12 sm:grid-cols-2 lg:grid-cols-3">
          {TOOLS.map((t) => (
            <li key={t.slug}>
              <Link href={`/tools/${t.slug}`} className="flex h-full flex-col rounded-xl border border-rule bg-card p-5 transition-colors hover:border-accent">
                <span className="font-serif text-lg font-semibold text-ink">{t.name}</span>
                <span className="mt-1 text-sm text-accent">{t.short}</span>
                <span className="mt-3 text-sm leading-relaxed text-ink-2">{t.description}</span>
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </>
  );
}
