import { PageHeader, Container } from "@/components/PageHeader";
import { NewsletterForm } from "@/components/Newsletter";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Research newsletter",
  description: "Get new research, open data releases, and free teaching resources on spoken communication, about once a month.",
  path: "/newsletter",
});

export default function NewsletterPage() {
  return (
    <>
      <PageHeader
        eyebrow="Newsletter"
        title="New research on spoken communication, once a month"
        lede="Studies, data releases, and free tools for teachers, trainers, and anyone working on how they speak."
      />
      <Container narrow>
        <div className="py-12">
          <NewsletterForm source="newsletter-page" />
        </div>
      </Container>
    </>
  );
}
