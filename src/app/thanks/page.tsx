import Link from "next/link";
import { PageHeader, Container } from "@/components/PageHeader";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Thank you for subscribing",
  description: "Your subscription is confirmed.",
  path: "/thanks",
  noindex: true,
});

const CONVERSION = `(function(){try{var p=new URLSearchParams(location.search);if(p.get('s')!=='1')return;history.replaceState(null,'',location.pathname);var send=function(){if(window.gtag){gtag('event','newsletter_signup',{method:'newsletter'});}else{setTimeout(send,400);}};send();}catch(e){}})();`;

export default function ThanksPage() {
  return (
    <>
      <PageHeader eyebrow="Subscribed" title="Thank you for subscribing" lede="You will get our next research update by email." />
      <Container narrow>
        <p className="py-10 text-ink-2">
          While you wait, explore <Link className="text-accent underline" href="/data/speaking-by-occupation">speaking demands by occupation</Link>{" "}
          or try a <Link className="text-accent underline" href="/tools">free practice tool</Link>.
        </p>
      </Container>
      <script dangerouslySetInnerHTML={{ __html: CONVERSION }} />
    </>
  );
}
