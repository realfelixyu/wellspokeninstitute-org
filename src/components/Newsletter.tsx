import { SITE } from "@/data/site";

/**
 * Newsletter signup. When NEXT_PUBLIC_NEWSLETTER_ACTION is configured the form
 * posts straight to the provider's hosted subscribe endpoint (provider is set
 * to redirect to /thanks?s=1 after a confirmed signup). Until then it falls
 * back to an email link so the page never ships a dead form.
 */
export function NewsletterForm({ source = "site" }: { source?: string }) {
  if (!SITE.newsletterAction) {
    return (
      <p className="text-[0.98rem] text-ink-2">
        Our research newsletter opens with the first report. To be added now, email{" "}
        <a
          className="font-medium text-accent underline underline-offset-2"
          href={`mailto:${SITE.email}?subject=Add%20me%20to%20the%20research%20newsletter`}
        >
          {SITE.email}
        </a>
        .
      </p>
    );
  }
  return (
    <form method="post" action={SITE.newsletterAction} className="flex flex-col gap-3 sm:flex-row">
      <label htmlFor={`email-${source}`} className="sr-only">
        Email address
      </label>
      <input
        id={`email-${source}`}
        name="email"
        type="email"
        required
        autoComplete="email"
        placeholder="you@example.org"
        className="h-12 w-full rounded-lg border border-rule bg-card px-4 text-ink placeholder:text-ink-3 sm:max-w-sm"
      />
      <input type="hidden" name="tag" value={source} />
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
