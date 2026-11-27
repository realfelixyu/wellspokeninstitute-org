import { SITE } from "@/data/site";

export function Analytics() {
  const id = /^G-[A-Z0-9]+$/.test(SITE.gaId) ? SITE.gaId : "";
  const rawToken = process.env.NEXT_PUBLIC_CF_ANALYTICS_TOKEN || "";
  const token = /^[0-9a-f]{32}$/i.test(rawToken) ? rawToken : "";
  if (!id && !token) return null;
  const code = `(function(){
    if(location.origin!==${JSON.stringify(SITE.url)})return;
    var id=${JSON.stringify(id)}, token=${JSON.stringify(token)};
    if(token){
      var beacon=document.createElement('script');
      beacon.src='https://static.cloudflareinsights.com/beacon.min.js';
      beacon.dataset.cfBeacon=JSON.stringify({token:token});
      document.head.appendChild(beacon);
    }
    if(!id)return;
    window.dataLayer=window.dataLayer||[];
    window.gtag=function(){window.dataLayer.push(arguments)};
    gtag('js',new Date());gtag('config',id,{anonymize_ip:true});
    var ga=document.createElement('script');ga.async=true;
    ga.src='https://www.googletagmanager.com/gtag/js?id='+id;
    document.head.appendChild(ga);
  })();`;
  return <script dangerouslySetInnerHTML={{ __html: code }} />;
}
