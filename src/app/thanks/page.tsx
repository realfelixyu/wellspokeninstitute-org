import { SITE } from "@/data/site";
import { Confirmation } from "./Confirmation";
import Link from "next/link";
import { Container } from "@/components/PageHeader";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Newsletter confirmation",
  description: "Email confirmation for the Institute research newsletter.",
  path: "/thanks",
  noindex: true,
});

export default function ThanksPage() {
  return (
    <>
      <Confirmation gaId={SITE.gaId} pending={process.env.CF_PAGES === "1" && !!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY} />
      <Container narrow>
        <p className="py-10 text-ink-2">
          <Link className="text-accent underline" href="/newsletter">Visit the newsletter page</Link>,{" "}
          explore <Link className="text-accent underline" href="/data/speaking-by-occupation">speaking demands by occupation</Link>{" "}
          or try a <Link className="text-accent underline" href="/tools">free practice tool</Link>.
        </p>
      </Container>
    </>
  );
}
