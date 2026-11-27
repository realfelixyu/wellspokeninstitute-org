import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const script = fileURLToPath(new URL("../scripts/check-live-routes.py", import.meta.url));
const origin = "https://wellspokeninstitute.org";
const namespace = "http://www.sitemaps.org/schemas/sitemap/0.9";
const pharmacist = "/professions/pharmacists";

function writeSitemap(directory, name, type, routes) {
  const tag = type === "sitemapindex" ? "sitemap" : "url";
  const rows = routes.map(route => `<${tag}><loc>${origin}${route}</loc></${tag}>`);
  fs.writeFileSync(path.join(directory, name), `<${type} xmlns="${namespace}">${rows.join("")}</${type}>`);
}

function fixture(t) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "institute-live-routes-"));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  const live = path.join(dir, "live");
  const out = path.join(dir, "out");
  fs.mkdirSync(live);
  fs.mkdirSync(path.join(out, "professions"), { recursive: true });
  fs.writeFileSync(path.join(out, "index.html"), "<h1>Institute</h1>");
  writeSitemap(live, "sitemap.xml", "urlset", ["", pharmacist]);
  writeSitemap(out, "sitemap.xml", "sitemapindex", ["/sitemap-professions.xml"]);
  const check = () => spawnSync("python3", [script, "--live-dir", live, "--out", out], { encoding: "utf8" });
  return { live, out, check };
}

test("a live scheduled profession needs both indexed XML and exported HTML", t => {
  const { out, check } = fixture(t);
  const page = path.join(out, "professions/pharmacists.html");
  fs.writeFileSync(page, "<h1>Pharmacists</h1>");
  writeSitemap(out, "sitemap-professions.xml", "urlset", ["/"]);
  writeSitemap(out, "unreferenced.xml", "urlset", [pharmacist]);
  const unlisted = check();
  assert.equal(unlisted.status, 1);
  assert.match(unlisted.stderr, /Missing from staged sitemap: \/professions\/pharmacists/);
  assert.doesNotMatch(unlisted.stderr, /Missing exported HTML/);

  writeSitemap(out, "sitemap-professions.xml", "urlset", ["/", pharmacist, "/new"]);
  assert.equal(check().status, 0);
  fs.unlinkSync(page);
  const absent = check();
  assert.equal(absent.status, 1);
  assert.match(absent.stderr, /Missing exported HTML: \/professions\/pharmacists/);
  assert.doesNotMatch(absent.stderr, /Missing from staged sitemap/);
});

test("public sitemap indexes and directory-index HTML work, unreadable sitemap trees fail", t => {
  const { live, out, check } = fixture(t);
  writeSitemap(live, "sitemap.xml", "sitemapindex", ["/professions.xml"]);
  writeSitemap(live, "professions.xml", "urlset", [pharmacist]);
  writeSitemap(out, "sitemap-professions.xml", "urlset", [pharmacist]);
  fs.mkdirSync(path.join(out, "professions/pharmacists"));
  fs.writeFileSync(path.join(out, "professions/pharmacists/index.html"), "<h1>Pharmacists</h1>");
  assert.equal(check().status, 0);
  fs.unlinkSync(path.join(out, "sitemap-professions.xml"));
  assert.match(check().stderr, /Could not read staged sitemap/);
  fs.writeFileSync(path.join(live, "professions.xml"), "<urlset>");
  const malformed = check();
  assert.equal(malformed.status, 1);
  assert.match(malformed.stderr, /Could not read public sitemap/);
});
