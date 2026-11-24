// Verifies every entry in content/citations.json against its source and records the result.
//   DOI entries: fetched from the Crossref REST API; the registry title must match Crossref's title.
//   URL entries: fetched directly; must return 2xx/3xx and contain most of the title's key words.
// Usage: node scripts/verify-citations.mjs --file content/citations/<name>.json [--all] [key ...]
// Without --all, only entries lacking a "verified" record are checked.

import fs from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const fileArg = args.indexOf("--file");
const FILE = path.resolve(fileArg >= 0 ? args[fileArg + 1] : path.join("content", "citations", "core.json"));
if (fileArg >= 0) args.splice(fileArg, 2);
const reg = JSON.parse(fs.readFileSync(FILE, "utf8"));
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
  const res = await fetch(url, { headers: { "User-Agent": UA, Accept: "text/html,application/json;q=0.9,*/*;q=0.8" }, redirect: "follow" });
  const text = await res.text();
  return { ok: res.status < 400, status: res.status, text };
}

let changed = 0;
const failures = [];
for (const [key, c] of Object.entries(reg)) {
  if (only.length && !only.includes(key)) continue;
  if (!all && c.verified && !only.length) continue;
  try {
    if (c.doi) {
      const r = await fetchText(`https://api.crossref.org/works/${encodeURIComponent(c.doi)}`);
      if (!r.ok) throw new Error(`crossref HTTP ${r.status}`);
      const msg = JSON.parse(r.text).message;
      const ctitle = (msg.title || [])[0] || "";
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
    changed++;
    console.log(`ok    ${key}`);
  } catch (e) {
    delete c.verified;
    failures.push(`${key}: ${e.message}`);
    console.log(`FAIL  ${key}: ${e.message}`);
  }
  await new Promise((r) => setTimeout(r, 150));
}

fs.writeFileSync(FILE, JSON.stringify(reg, null, 2) + "\n");
console.log(`\n${changed} verified, ${failures.length} failed.`);
if (failures.length) process.exitCode = 1;
