import { SITE } from "@/data/site";
import { PageHeader } from "@/components/PageHeader";
import { Prose } from "@/components/Prose";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Contact",
  description: `Contact ${SITE.name} about research, data, media requests, partnerships, or corrections.`,
  path: "/contact",
});

export default function ContactPage() {
  return (
    <>
      <PageHeader eyebrow="Contact" title="Get in touch" />
      <Prose>
        <p>
          Email <a href={`mailto:${SITE.email}`}>{SITE.email}</a> for research questions, data requests, media
          inquiries, partnerships with schools and adult education or workforce programs, or corrections.
        </p>
        <p>
          <strong>Journalists:</strong> our data and figures are free to use with attribution. We can provide
          additional cuts of our datasets on request.
        </p>
        <p>
          Mail: {SITE.legalName}, {SITE.address.street}, {SITE.address.city}, {SITE.address.region}{" "}
          {SITE.address.postalCode}
        </p>
      </Prose>
    </>
  );
}
