// Renders PDFs of research pages from the local static build (out/) with headless Chrome.
// Usage: node scripts/make-pdfs.mjs <slug> [slug ...]   (run after `npx next build`)
import { execFileSync, spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const CHROME = process.env.CHROME || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const slugs = process.argv.slice(2);
const outDir = path.join(process.cwd(), "public", "papers");
fs.mkdirSync(outDir, { recursive: true });
const port = 5099;
const server = spawn("npx", ["--yes", "serve", "out", "-l", String(port)], { stdio: "ignore" });
await new Promise((r) => setTimeout(r, 3000));
try {
  for (const slug of slugs) {
    const file = path.join(outDir, `${slug}.pdf`);
    execFileSync(CHROME, [
      "--headless=new",
      "--disable-gpu",
      "--no-pdf-header-footer",
      "--run-all-compositor-stages-before-draw",
      "--virtual-time-budget=4000",
      `--print-to-pdf=${file}`,
      `http://localhost:${port}/research/${slug}`,
    ], { stdio: "ignore" });
    console.log(`wrote public/papers/${slug}.pdf (${Math.round(fs.statSync(file).size / 1024)} KB)`);
  }
} finally {
  server.kill();
}
