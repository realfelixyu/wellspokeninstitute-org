# Wellspoken Institute

This repository builds the Institute’s static research and education website with Next.js. Cloudflare Pages Functions handles newsletter subscriptions when enabled.

## Development and publishing

Use Node 20 or later and run `npm ci`. Start the site with `npm run dev`. Run `node --test test/*.test.mjs` and `npm run build` before publication. The build checks source verification records, article content and internal links in the static export under `out/`.

Write articles in `content/<collection>/*.mdx` and register sources in `content/citations/*.json`. Run `npm run citations:verify` with network access after adding or changing a source. PDF title verification requires `pdftotext`. For a scheduled release, set `status: scheduled` and `scheduledFor: "YYYY-MM-DD"`. A production rebuild publishes eligible content.

## Hosting and scheduled releases

Immediately before changing hosts, build the candidate with its production settings and run `npm run check:live-routes` with Python 3 and network access. The command reads the current public sitemap and follows each sitemap index on both sides. Each public route must have an HTML file in `out/` and an entry in the candidate sitemap. Resolve any reported omissions before switching hosts. Use `-- --out <directory>` for another candidate export. To replay a saved baseline offline, add `--live-dir <directory>` after the npm argument separator and place the captured `sitemap.xml` and its referenced sitemaps there at their original paths.

The default GitHub Actions workflow builds and publishes GitHub Pages on main-branch pushes and daily at 11:17 UTC. To switch after Institute-owned Cloudflare Pages is configured:

1. Connect the production branch `main`, use `node --test test/*.test.mjs && npm run build` and publish `out`. Keep the repository root as the project root so Pages discovers `functions/`. Cloudflare’s Git integration builds pushes.
2. In the Cloudflare Pages project, create a deploy hook for `main`. Save its full URL as GitHub Actions repository secret `CLOUDFLARE_PAGES_DEPLOY_HOOK`.
3. After the approved domain cutover, set GitHub Actions repository variable `INSTITUTE_HOSTING` to `cloudflare`. The workflow then skips GitHub Pages publication and invokes the Cloudflare hook for the daily schedule or manual workflow dispatch. A successful hook request queues a build; its result appears in Cloudflare Pages.

## Institute newsletter and analytics

For the Cloudflare form, configure these values in the Institute production Pages project and rebuild:

- Build environment: `NEXT_PUBLIC_TURNSTILE_SITE_KEY` for an Institute widget permitting the apex domain. Pages supplies `CF_PAGES=1`.
- Function secrets: `TURNSTILE_SECRET` and `BREVO_API_KEY`. Set `BREVO_LIST_ID` and `BREVO_DOI_TEMPLATE_ID` to positive IDs from the Institute Brevo account. Use a verified sender and a double-opt-in template containing Brevo’s confirmation link.
- Optional build environment: `NEXT_PUBLIC_GA_ID` for the Institute GA4 property, and `NEXT_PUBLIC_CF_ANALYTICS_TOKEN` for the Institute Cloudflare beacon. Enable only one Cloudflare beacon installation. Leave analytics IDs empty for untracked builds.

The verified production form redirects to `/thanks?s=1` after the provider accepts the double-opt-in request. A short-lived first-party cookie lets the page show the inbox instructions and queue one GA4 request event when configured. This event measures a requested confirmation email. Completed subscriptions are recorded by Brevo. Direct visits and hosted-provider returns show a neutral page. A hosted form can use `NEXT_PUBLIC_NEWSLETTER_ACTION` when the Cloudflare form is unavailable. With neither configured, the newsletter page offers an email link.

Use `node --test test/newsletter.test.mjs` for local mocked upstream and conversion tests. In production, submit with a consenting test address, verify the confirmation email and the pending request in Brevo, check the single GA4 event in DebugView, follow the confirmation link, and verify list membership. Keep local function secrets in ignored `.dev.vars` files.

## Optional curriculum email delivery

The free PDF is always available at `/curriculum`. To enable one-time email delivery on the Institute’s production Pages branch:

1. Create a separate Brevo transactional template with an Institute sender, a subject, and the download link `{{ params.pack_url }}`. Use a different ID from the newsletter double-opt-in template. Supply `BREVO_CURRICULUM_TEMPLATE_ID` to the production build and Functions runtime. Reuse the Institute’s existing Brevo API key, Turnstile secret, and public site key.
2. Create an Institute D1 database. Apply `migrations/0001_curriculum_receipts.sql` and bind it to production Pages Functions as `CURRICULUM_RECEIPTS`. Receipts contain a hash and expiry time. A single atomic deletion qualifies one PDF click, including across different devices.
3. Rebuild on the Cloudflare production branch `main`. Test using a consenting address: request the pack, open the email, press the PDF link twice, and confirm exactly one `curriculum_download` in GA4 DebugView. Verify that the address received no newsletter subscription. A form submission, opening the email link, and accessing the ungated PDF should each produce zero qualified events.

Email link delivery sends a transactional message through Brevo rather than adding a contact to a list. Local tests use a temporary SQLite database and mocked provider calls. They use Python 3’s standard SQLite module.

Rebuild the occupation dataset with `npm run onet:import` using the O*NET and BLS inputs specified in the importer.

Text and derived data are licensed CC BY 4.0 unless noted.
