import { SITE } from "@/data/site";
import { PageHeader } from "@/components/PageHeader";
import { Prose } from "@/components/Prose";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Privacy policy",
  description: `How ${SITE.name} handles information when you visit this website, use our free tools, or join our newsletter.`,
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <>
      <PageHeader eyebrow="Privacy" title="Privacy policy" lede="Last updated November 24, 2026." />
      <Prose>
        <h2>Our free tools run in your browser</h2>
        <p>
          Text you paste and anything you record in our free tools is processed on your device. We do not upload,
          store, or see it. Some browsers send speech to the browser maker&rsquo;s own service when you use
          speech-to-text features; that processing is governed by your browser&rsquo;s privacy policy.
        </p>
        <h2>Analytics</h2>
        <p>
          We use privacy-respecting analytics to count page visits and understand which resources are useful. We
          do not sell data, and we do not use advertising cookies to profile visitors.
        </p>
        <h2>Newsletter</h2>
        <p>
          If you subscribe, we store your email address with our email provider to send the newsletter. Every email
          has an unsubscribe link. We never sell or share your address.
        </p>
        <h2>Contact</h2>
        <p>
          Questions or requests to delete your information: <a href={`mailto:${SITE.email}`}>{SITE.email}</a>.
        </p>
      </Prose>
    </>
  );
}
