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
          The practice tools process text in your browser. The optional English dictation feature uses
          on-device recognition and asks for microphone access. The Institute does not receive your transcript or audio.
        </p>
        <h2>Site analytics</h2>
        <p>
          When enabled on the Institute’s production website, Google Analytics collects page visits and
          newsletter requests and downloads from emailed teaching-pack links, and Cloudflare Web Analytics measures visits and page performance.
          Google Analytics may use cookies. The Institute does not send your email address, practice text,
          or audio to either analytics service. We do not sell personal information.
        </p>
        <h2>Newsletter requests</h2>
        <p>
          The newsletter form on our Cloudflare site uses Cloudflare Turnstile to check that a request came
          from a person. Cloudflare processes technical signals from your browser for this check.
          After verification, we send your address to Brevo to request a confirmation email.
          Confirm using the link in that email to receive the newsletter. You can unsubscribe from a newsletter email.
        </p>
        <p>
          After Brevo accepts a request, we set a first-party cookie called
          {" "}<code>__Host-institute_signup</code> for up to five minutes. The confirmation page clears it
          to record the request once. It contains a flag, with no email address or subscriber identifier.
        </p>
        <p>
          If the newsletter page links to a hosted subscription form, that provider receives the address
          you submit. If you request the newsletter by email, the Institute receives your message and
          return address in its inbox.
        </p>
        <h2>Teaching pack by email</h2>
        <p>
          You can download the free PDF directly. If you ask for an emailed link, Turnstile verifies the
          form and Brevo processes your address to send that one message. This request does not subscribe
          you to the newsletter. The Institute stores a random link identifier in hashed form and its expiry
          time, separately from your address. The link qualifies for download measurement for seven days.
        </p>
        <p>
          Opening the emailed link sets a secure first-party cookie for up to one hour. A click on the PDF
          can record one download for that link. Analytics receives the event without the email address or
          link identifier. You can still download the PDF if the link has expired.
        </p>
        <h2>Contact</h2>
        <p>
          Questions or requests to delete your information: <a href={`mailto:${SITE.email}`}>{SITE.email}</a>.
        </p>
      </Prose>
    </>
  );
}
