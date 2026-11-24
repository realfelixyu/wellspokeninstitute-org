import Link from "next/link";
import { notFound } from "next/navigation";
import type { ComponentType } from "react";
import { TOOLS } from "@/data/tools";
import { Breadcrumbs } from "@/components/PageHeader";
import { JsonLd, pageMetadata, breadcrumbJsonLd } from "@/lib/seo";
import { SITE } from "@/data/site";
import { TOOL_GUIDES } from "@/data/toolGuides";
import SpeakingRate from "@/components/tools/SpeakingRate";
import SpeechLength from "@/components/tools/SpeechLength";
import FillerCounter from "@/components/tools/FillerCounter";
import InterviewTimer from "@/components/tools/InterviewTimer";
import AnxietyCheck from "@/components/tools/AnxietyCheck";
import Speakability from "@/components/tools/Speakability";
import PausePractice from "@/components/tools/PausePractice";
import Teleprompter from "@/components/tools/Teleprompter";
import PitchBuilder from "@/components/tools/PitchBuilder";
import DemandLookup from "@/components/tools/DemandLookup";

const COMPONENTS: Record<string, ComponentType> = {
  "speaking-rate-calculator": SpeakingRate,
  "speech-length-calculator": SpeechLength,
  "filler-word-counter": FillerCounter,
  "interview-answer-timer": InterviewTimer,
  "public-speaking-anxiety-self-check": AnxietyCheck,
  "speakability-checker": Speakability,
  "pause-practice": PausePractice,
  teleprompter: Teleprompter,
  "elevator-pitch-builder": PitchBuilder,
  "speaking-demand-lookup": DemandLookup,
};

export const dynamicParams = false;

export function generateStaticParams() {
  return TOOLS.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const t = TOOLS.find((x) => x.slug === slug);
  if (!t) return {};
  return pageMetadata({ title: /free/i.test(t.name) || t.name.endsWith("?") ? t.name : `Free ${t.name.charAt(0).toLowerCase()}${t.name.slice(1)}`, description: t.description, path: `/tools/${t.slug}` });
}

export default async function ToolPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const t = TOOLS.find((x) => x.slug === slug);
  const C = COMPONENTS[slug];
  if (!t || !C) notFound();
  const guide = TOOL_GUIDES[slug];
  const path = `/tools/${slug}`;
  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Free tools", path: "/tools" },
    { name: t.name, path },
  ];
  const app = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: t.name,
    description: t.description,
    url: `${SITE.url}${path}`,
    applicationCategory: "EducationalApplication",
    operatingSystem: "Any",
    isAccessibleForFree: true,
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    publisher: { "@type": "NGO", name: SITE.name, url: SITE.url },
  };
  return (
    <>
      <JsonLd data={app} />
      <JsonLd data={breadcrumbJsonLd(crumbs)} />
      <div className="mx-auto max-w-3xl px-4 pb-6 pt-10 sm:px-6 sm:pt-14">
        <Breadcrumbs items={crumbs} />
        <h1 className="mt-6 font-serif text-[2rem] font-semibold leading-tight text-ink sm:text-[2.6rem]">{t.name}</h1>
        <p className="mt-4 text-lg leading-relaxed text-ink-2">{t.description}</p>
      </div>
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <C />
      </div>
      {guide ? (
        <div className="prose-body mx-auto max-w-3xl px-4 py-12 sm:px-6">
          {guide.map((section) => (
            <section key={section.heading}>
              <h2>{section.heading}</h2>
              {section.paragraphs.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </section>
          ))}
        </div>
      ) : null}
      <div className="mx-auto max-w-3xl px-4 pb-4 sm:px-6">
        <p className="text-sm text-ink-3">
          Free and private. This tool runs in your browser and does not send your text or audio to us.{" "}
          <Link href="/tools" className="underline">More free tools</Link>
        </p>
      </div>
    </>
  );
}
