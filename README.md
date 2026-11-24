# wellspokeninstitute.org

Website of Wellspoken Institute, a nonprofit research organization studying spoken communication skills.

- Next.js static export, deployed to GitHub Pages on every push to `main` (and daily, so dated posts go live on schedule).
- Content lives in `content/<collection>/*.mdx`. Sources live in `content/citations.json`.
- `npm run citations:verify` checks every new reference against Crossref or its source page.
- `npm run build` runs the content validator first and output checks after.
- `npm run onet:import` rebuilds `data/speaking-by-occupation.json` from the O*NET 31.0 Database (CC BY 4.0, USDOL/ETA) and BLS OEWS data.

Text and derived data are licensed CC BY 4.0 unless noted.
