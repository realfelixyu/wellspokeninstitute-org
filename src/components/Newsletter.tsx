import { Turnstile } from "./Turnstile";
import { SITE } from "@/data/site";

export function NewsletterForm({ source = "site" }: { source?: string }) {
  const siteKey = process.env.CF_PAGES === "1" ? process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY : "";
  const action = siteKey ? "/api/subscribe" : SITE.newsletterAction;
  if (!action) {
    return (
      <div className="flex flex-col items-start gap-2">
        <a
          className="inline-flex h-12 items-center rounded-lg bg-accent px-6 font-medium text-accent-ink transition-opacity hover:opacity-90"
          href={`mailto:${SITE.email}?subject=Add%20me%20to%20the%20research%20newsletter`}
        >
          Subscribe by email
        </a>
        <p className="text-sm text-ink-3">
          Opens a message to {SITE.email}. Send it as is and we will add you to the list.
        </p>
      </div>
    );
  }
  return (
    <form method="post" action={action} className="flex flex-col items-start gap-3">
      <label htmlFor={`email-${source}`} className="sr-only">
        Email address
      </label>
      <input
        id={`email-${source}`}
        name="email"
        type="email"
        maxLength={254}
        required
        autoComplete="email"
        placeholder="you@example.org"
        className="h-12 w-full rounded-lg border border-rule bg-card px-4 text-ink placeholder:text-ink-3 sm:max-w-sm"
      />
      <input type="hidden" name="tag" value={source} />
      {siteKey && <Turnstile siteKey={siteKey} />}
      <button
        type="submit"
        className="h-12 shrink-0 rounded-lg bg-accent px-6 font-medium text-accent-ink transition-opacity hover:opacity-90"
      >
        Subscribe
      </button>
    </form>
  );
}

export function NewsletterInline({ source = "article" }: { source?: string }) {
  return (
    <section aria-labelledby={`nl-${source}`} className="rounded-2xl border border-rule bg-accent-soft p-6 sm:p-8">
      <h2 id={`nl-${source}`} className="font-serif text-2xl font-semibold text-ink">
        New research, once a month
      </h2>
      <p className="mt-2 max-w-xl text-ink-2">
        Studies, data releases, and free teaching resources on spoken communication. No spam, and you can leave
        any time.
      </p>
      <div className="mt-5">
        <NewsletterForm source={source} />
      </div>
    </section>
  );
}
