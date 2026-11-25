// Refreshes missing or changed entries across every shard in content/citations/.
//   DOI entries: fetched from the Crossref REST API; the registry title must match Crossref's title.
//   URL entries: fetched directly; must return 2xx/3xx and contain most of the title's key words.
// Usage: node scripts/verify-citations.mjs --file content/citations/<name>.json [--all] [key ...]
// --check is the offline build gate. --all refreshes even current records.

import fs from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { createHash } from "node:crypto";

const args = process.argv.slice(2);
const fileArg = args.indexOf("--file");
const dir = path.resolve("content/citations");
const files = fileArg >= 0 ? [path.resolve(args[fileArg + 1])] :
  fs.readdirSync(dir).filter(f => f.endsWith(".json")).sort().map(f => path.join(dir, f));
if (fileArg >= 0) args.splice(fileArg, 2);
const checkOnly = args.includes("--check");
function fingerprint(c) {
  const fields = [c.title, c.authors, c.year, c.doi ?? "", c.url ?? "", c.publisher ?? "", c.container ?? ""];
  return createHash("sha256").update(JSON.stringify(fields)).digest("hex");
}
const all = args.includes("--all");
const only = args.filter((a) => !a.startsWith("--"));
const UA = "WellspokenInstituteCitationCheck/1.0 (mailto:hello@wellspokeninstitute.org)";
const today = new Date().toISOString().slice(0, 10);

const STOP = new Set("a an the of and or in on for to with from by at as is are be its into than that this how what why when do does".split(" "));
const norm = (s) =>
  String(s)
    .toLowerCase()
    .normalize("NFKD")
    .replace(/<[^>]+>/g, " ")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
const keyWords = (s) => norm(s).split(" ").filter((w) => w.length > 2 && !STOP.has(w));

function titleMatch(expected, actual) {
  const e = keyWords(expected);
  const a = new Set(keyWords(actual));
  if (!e.length) return false;
  const hit = e.filter((w) => a.has(w)).length;
  return hit / e.length >= 0.8;
}

async function fetchText(url) {
  for (let attempt = 0; attempt < 4; attempt++) {
    const res = await fetch(url, { headers: { "User-Agent": UA, Accept: "text/html,application/json;q=0.9,*/*;q=0.8" }, redirect: "follow", signal: AbortSignal.timeout(20000) });
    if (res.status === 429 && attempt < 3) {
      await res.body?.cancel();
      const wait = Number(res.headers.get("retry-after")) || 2 ** (attempt + 1);
      await new Promise(resolve => setTimeout(resolve, Math.min(wait, 60) * 1000));
      continue;
    }
    const bytes = Buffer.from(await res.arrayBuffer());
    let text;
    if (bytes.subarray(0, 5).toString() === "%PDF-") {
      const result = spawnSync("pdftotext", ["-", "-"], { input: bytes, encoding: "utf8", maxBuffer: 16 * 1024 * 1024 });
      if (result.status !== 0) throw new Error("pdftotext required to verify PDF titles");
      text = result.stdout;
    } else text = bytes.toString("utf8");
    return { ok: res.ok, status: res.status, text };
  }
}

let changed = 0;
const failures = [];
const matched = new Set();
for (const file of files) {
  const reg = JSON.parse(fs.readFileSync(file, "utf8"));
  for (const [key, c] of Object.entries(reg)) {
    if (only.length && !only.includes(key)) continue;
    matched.add(key);
    if (!all && (checkOnly || !only.length) && c.verified?.fingerprint === fingerprint(c)) continue;
    if (checkOnly) {
      failures.push(key + ": verification missing or stale");
      continue;
    }
    await new Promise(resolve => setTimeout(resolve, 330));
    try {
      if (c.doi) {
        const r = await fetchText(`https://api.crossref.org/works/${encodeURIComponent(c.doi)}?mailto=hello%40wellspokeninstitute.org`);
        if (!r.ok) throw new Error(`crossref HTTP ${r.status}`);
        const msg = JSON.parse(r.text).message;
        const ctitle = [(msg.title || [])[0] || "", (msg.subtitle || [])[0] || ""].filter(Boolean).join(": ");
        const year = msg.issued?.["date-parts"]?.[0]?.[0];
        if (!titleMatch(c.title, ctitle)) throw new Error(`title mismatch. registry="${c.title}" crossref="${ctitle}"`);
        if (year && String(c.year) !== String(year) && Math.abs(Number(c.year) - year) > 1) {
          throw new Error(`year mismatch registry=${c.year} crossref=${year}`);
        }
        c.verified = { method: "crossref", date: today, matched: ctitle };
      } else if (c.url) {
        const r = await fetchText(c.url);
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        if (!titleMatch(c.title, r.text.slice(0, 400000))) throw new Error("page does not contain the cited title's key words");
        c.verified = { method: "url", date: today };
      } else {
        throw new Error("no doi or url");
      }
      c.verified.fingerprint = fingerprint(c);
      changed++;
      console.log(`ok    ${key}`);
    } catch (e) {
      // Keep the historical reference but invalidate its offline build receipt.
      if (c.verified) delete c.verified.fingerprint;
      failures.push(`${key}: ${e.message}`);
      console.log(`FAIL  ${key}: ${e.message}`);
    }
  }
  const output = JSON.stringify(reg, null, 2) + "\n";
  if (!checkOnly && output !== fs.readFileSync(file, "utf8")) fs.writeFileSync(file, output);
}
for (const key of only) if (!matched.has(key)) failures.push("Unknown citation: " + key);
if (failures.length) { console.error(failures.join("\n")); process.exitCode = 1; }
console.log(`Citation verification: ${changed} refreshed, ${failures.length} unresolved.`);
