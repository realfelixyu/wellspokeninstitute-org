import { SITE } from "@/data/site";
import { PageHeader } from "@/components/PageHeader";
import { Prose } from "@/components/Prose";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Privacy policy",
  description: `How ${SITE.name} handles information when you visit this website, use our free tools, or join our newsletter.`,
  path: "/privacy",
});

// Describe only what this build actually runs. Each optional service is switched on by its own build variable.
const GA_ON = /^G-[A-Z0-9]+$/.test(SITE.gaId);
const CF_ANALYTICS_ON = /^[0-9a-f]{32}$/i.test(process.env.NEXT_PUBLIC_CF_ANALYTICS_TOKEN || "");
const CF_SIGNUP_ON = process.env.CF_PAGES === "1" && Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY);
const HOSTED_FORM_ON = !CF_SIGNUP_ON && Boolean(SITE.newsletterAction);

export default function PrivacyPage() {
  return (
    <>
      <PageHeader eyebrow="Privacy" title="Privacy policy" lede="Last updated November 27, 2026." />
      <Prose>
        <h2>Our free tools run in your browser</h2>
        <p>
          The practice tools process text in your browser. The optional English dictation feature uses
          on-device recognition and asks for microphone access. The Institute does not receive your transcript or audio.
        </p>
        <h2>Site analytics</h2>
        {GA_ON || CF_ANALYTICS_ON ? (
          <p>
            {GA_ON ? "Google Analytics records page visits and how pages are used, such as scrolling, clicks on links to other sites and file downloads, and uses cookies to do so. " : ""}
            {CF_ANALYTICS_ON ? "Cloudflare Web Analytics measures visits and page performance without cookies. " : ""}
            The Institute does not send your email address, practice text or audio to an analytics service. We do not sell personal information.
          </p>
        ) : (
          <p>
            This website does not currently run analytics or advertising scripts and sets no tracking cookies. We will update this
            page before we add any. Our web host processes technical data, such as IP addresses, to serve pages and keep the site
            secure. We do not sell personal information.
          </p>
        )}
        <h2>Newsletter requests</h2>
        {CF_SIGNUP_ON ? (
          <>
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
          </>
        ) : HOSTED_FORM_ON ? (
          <p>
            The newsletter form sends the address you enter to our newsletter provider, which emails you a confirmation link.
            Confirm using that link to receive the newsletter. You can unsubscribe from any newsletter email.
          </p>
        ) : (
          <p>
            To join the newsletter, you email us. The Institute receives your message and return address in its inbox and uses
            them only to send the newsletter. Ask us at any time to remove you.
          </p>
        )}
        <h2>Teaching pack</h2>
        <p>You can download the free PDF directly. We do not ask for your email address to download it.</p>
        {CF_SIGNUP_ON ? (
          <>
        <p>
          If you ask for an emailed link instead, Turnstile verifies the
          form and Brevo processes your address to send that one message. This request does not subscribe
          you to the newsletter. The Institute stores a random link identifier in hashed form and its expiry
          time, separately from your address. The link qualifies for download measurement for seven days.
        </p>
        <p>
          Opening the emailed link sets a secure first-party cookie for up to one hour. A click on the PDF
          can record one download for that link. Analytics receives the event without the email address or
          link identifier. You can still download the PDF if the link has expired.
        </p>
          </>
        ) : null}
        <h2>Contact</h2>
        <p>
          Questions or requests to delete your information: <a href={`mailto:${SITE.email}`}>{SITE.email}</a>.
        </p>
      </Prose>
    </>
  );
}
