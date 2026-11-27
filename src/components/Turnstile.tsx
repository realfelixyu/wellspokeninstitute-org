"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";

declare global {
  interface Window {
    turnstile?: {
      render: (element: HTMLElement, options: { sitekey: string; action: string }) => string;
      remove: (widget: string) => void;
    };
  }
}

export function Turnstile({ siteKey, action = "newsletter" }: { siteKey: string; action?: string }) {
  const container = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (!ready || !container.current || !window.turnstile) return;
    const widget = window.turnstile.render(container.current, { sitekey: siteKey, action });
    return () => window.turnstile?.remove(widget);
  }, [ready, siteKey, action]);
  return <>
    <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
      strategy="afterInteractive" onReady={() => setReady(true)} />
    <div ref={container} />
  </>;
}
