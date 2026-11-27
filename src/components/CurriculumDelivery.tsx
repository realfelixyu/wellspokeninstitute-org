"use client";

import { useEffect, useState, type FormEvent } from "react";
import { trackCurriculumClick } from "../../lib/curriculum-click.mjs";
import { Turnstile } from "./Turnstile";

type Props = { siteKey: string; gaId: string };


export function CurriculumDelivery({ siteKey, gaId }: Props) {
  const [production, setProduction] = useState(false);
  useEffect(() => { setProduction(location.origin === "https://wellspokeninstitute.org"); }, []);
  const emailAvailable = production && Boolean(siteKey);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const [widget, setWidget] = useState(0);
  const [sent, setSent] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy || sent) return;
    const form = event.currentTarget;
    setBusy(true);
    setStatus("");
    try {
      const fields = new URLSearchParams();
      for (const [key, value] of new FormData(form)) if (typeof value === "string") fields.set(key, value);
      const response = await fetch("/api/curriculum-email", { method: "POST", body: fields });
      if (response.ok) {
        setSent(true);
        setStatus("Check your inbox for the teaching pack link.");
      } else {
        setWidget(value => value + 1);
        setStatus("Email delivery did not finish. Try again or download the PDF above.");
      }
    } catch {
      setWidget(value => value + 1);
      setStatus("Email delivery is unavailable. You can download the PDF above.");
    } finally { setBusy(false); }
  }
  return <section id="teaching-pack">
    <p><a href="/curriculum/teaching-pack.pdf" target="_blank" rel="noopener" download onClick={emailAvailable ? () => { void trackCurriculumClick(window, gaId); } : undefined}>Download the lesson plans and feedback sheet (PDF)</a></p>
    {emailAvailable && <details className="mt-4"><summary className="cursor-pointer py-3 font-semibold">Email me the teaching pack</summary>
      {!sent && <form action="/api/curriculum-email" method="post" onSubmit={submit} className="mt-3 flex flex-col items-start gap-3">
        <label htmlFor="pack-email">Email address for this one-time delivery</label>
        <input id="pack-email" name="email" type="email" autoComplete="email" maxLength={254} required
          className="w-full rounded-md border border-rule bg-card px-3 py-2 sm:max-w-sm" />
        <Turnstile key={widget} siteKey={siteKey} action="curriculum" />
        <button disabled={busy} type="submit" className="rounded-md bg-accent px-4 py-2 text-accent-ink">{busy ? "Sending…" : "Send the pack link"}</button>
      </form>}
      <p role="status">{status}</p>
    </details>}
  </section>;
}
