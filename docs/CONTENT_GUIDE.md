# Content guide

How content for wellspokeninstitute.org is written, sourced, and validated. Every page must pass `node scripts/validate-content.mjs`.

## Files

- Content: `content/<collection>/<slug>.mdx`, where collection is `research`, `learn`, `professions`, or `statistics`. Slug is lowercase kebab-case and becomes the URL: `/professions/registered-nurses`.
- Sources: `content/citations/<file>.json`. Every file is merged into one registry, and keys must be unique across all files. Before adding a key, search the existing files (`grep -r '"key"' content/citations`). If the source already exists, reuse its key and do not redefine it.

## Frontmatter

```yaml
---
title: "How important is speaking for registered nurses?"
description: "One or two plain sentences, under 300 characters, that answer the page's main question."
kind: profession            # paper | study | brief | article | profession | statistics
publishedAt: "2026-11-24"   # YYYY-MM-DD. A future date schedules the page; the daily rebuild publishes it.
status: published
contributors: ["felix-yu", "linfeng-du"]   # real people only, ids from src/data/site.ts
occupationCode: "29-1141.00"               # profession pages only; renders the O*NET data panel and attribution
onet: true                                 # set on any page that uses O*NET data (implied by occupationCode)
keyFindings:                               # optional, 2 to 4 short sentences, shown in a box at the top
  - "..."
citations: ["key1", "key2", "key3"]        # every source cited in the body, in order of first use
---
```

Minimum sources per kind: paper 10, statistics 8, article 5, profession 3, study 3, brief 3.

## Citing

- Put `<Cite k="key" />` straight after the claim it supports, before the final punctuation: `...higher pay <Cite k="deming2017social" />.` Use `<Cite k="a,b" />` for two sources.
- Every key in `citations` must be cited in the body, and every cited key must be in `citations`.
- Citation entry format (prefer a DOI whenever one exists):

```json
"deming2017social": {
  "authors": "Deming, D. J.",
  "year": 2017,
  "title": "The Growing Importance of Social Skills in the Labor Market",
  "container": "The Quarterly Journal of Economics, 132(4), 1593-1640",
  "doi": "10.1093/qje/qjx022"
}
```

For web sources without a DOI, use `"url"` and `"publisher"` instead of `"doi"`. Titles must be exact.

- Verify with `node scripts/verify-citations.mjs --file content/citations/<file>.json`. It checks every DOI against Crossref and every URL against the live page. Fix or delete anything that fails. Never invent a DOI, a title, a number, or a finding.
- Only cite a finding you have read in the source itself: the abstract, the full text, or the official page. Record the supporting sentence for each claim in `.evidence/<file>.md` (git-ignored). If a number is not in the source, do not use it.
- Prefer peer-reviewed studies, meta-analyses, government statistics, and major professional bodies. Avoid vendor blogs, listicles, and quote-farm statistics such as the "75% of people fear public speaking" figure, which has no traceable primary source.

## Writing

- Answer the page's main question in the first 100 words, in plain language.
- Use short paragraphs, concrete examples, US English, and digits for numbers.
- Never use em dashes. Use commas, colons, or parentheses instead.
- Never mention "Wellspoken" on its own, any company's product, or app store links. "Wellspoken Institute" is fine. You may link to our free tools (`/tools/<slug>`) and data (`/data/speaking-by-occupation`).
- Report correlations as correlations. Say when evidence is thin or mixed.
- Avoid AI tells: "delve", "tapestry", "landscape", "crucial", "pivotal", "navigate", "in today's fast-paced world", "it's important to note", "not just X but Y" contrasts, stacked triads, rhetorical-question openers, and closing summaries that restate the page.
- Use "O*NET" as an adjective ("O*NET data", "the O*NET 31.0 Database"). Write "O*NET®" on first mention.
- Profession numbers must match `data/speaking-by-occupation.json` exactly. The page renders a data panel automatically, so refer to the numbers in the text, but sparingly.
- End with `## Frequently asked questions` and 3 `### Question?` entries, each answered in 1 to 3 sentences.
- MDX: do not use bare `<` or `{` in text. The only components allowed are `<Cite />`, `<KeyStat value="" label="" k="" />` and `<Callout title="">...</Callout>`.

## Profession page template

1. Opening (no heading): how much the job depends on speaking, citing its rank among 910 occupations and its speaking importance, in plain words.
2. `## Where speaking shows up in the job`: specific spoken tasks drawn from the O*NET task statements for that occupation (`data/raw/onet/db_31_0_text/Task Statements.txt`), plus work-context frequency (public speaking, face-to-face, phone, dealing with the public).
3. `## What the research says`: at least 3 studies specific to this profession's spoken communication (for example, nurse handoffs, physician-patient communication and adherence, teacher talk, sales conversations). Summarize what each found, accurately.
4. `## Speaking skills that matter most`: 3 to 5 skills, each tied to the tasks above.
5. `## How to practice`: concrete drills, linking to relevant free tools.
6. `## Frequently asked questions`.

Length: 900 to 1,400 words. Each page must be specific to its profession. Never reuse paragraphs across pages; the validator rejects near-duplicates.

## Check before you finish

```
node scripts/verify-citations.mjs --file content/citations/<file>.json
node scripts/validate-content.mjs
```

Do not run `npm run build` or `npm run dev` (another process may be building). Do not edit files outside your assigned content files and citation file.
