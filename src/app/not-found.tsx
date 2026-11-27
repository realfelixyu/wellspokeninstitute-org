import Link from "next/link";
import { Container } from "@/components/PageHeader";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Page not found",
  description: "The page you requested does not exist.",
  path: "/404",
  noindex: true,
});

export default function NotFound() {
  return (
    <Container narrow>
      <div className="py-24">
        <p className="text-sm font-semibold uppercase tracking-wider text-accent">404</p>
        <h1 className="mt-3 font-serif text-4xl font-semibold text-ink">We could not find that page</h1>
        <p className="mt-4 text-ink-2">
          Try <Link href="/research" className="text-accent underline">our research</Link> or go back to the{" "}
          <Link href="/" className="text-accent underline">home page</Link>.
        </p>
      </div>
    </Container>
  );
}
