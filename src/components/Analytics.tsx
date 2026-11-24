import { SITE } from "@/data/site";

/**
 * GA4 loads only on the production hostname so preview builds and local runs
 * never record traffic or conversions. No-op until NEXT_PUBLIC_GA_ID is set.
 */
export function Analytics() {
  if (!SITE.gaId) return null;
  const id = SITE.gaId;
  const code = `(function(){if(location.hostname!==${JSON.stringify(SITE.productionHost)})return;var s=document.createElement('script');s.async=true;s.src='https://www.googletagmanager.com/gtag/js?id=${id}';document.head.appendChild(s);window.dataLayer=window.dataLayer||[];window.gtag=function(){dataLayer.push(arguments)};gtag('js',new Date());gtag('config','${id}',{anonymize_ip:true});})();`;
  return <script dangerouslySetInnerHTML={{ __html: code }} />;
}
