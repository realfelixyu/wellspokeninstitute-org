import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const root = fileURLToPath(new URL("../", import.meta.url));
function run(script, cwd, ...args) {
  return spawnSync(process.execPath, [path.join(root, "scripts", script), ...args], {
    cwd, encoding: "utf8",
  });
}
function fixture(t) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "institute-check-"));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  return dir;
}
test("static checker catches missing cross-page anchors, hrefs and sitemap URLs", t => {
  const dir = fixture(t);
  fs.writeFileSync(path.join(dir,"index.html"), '<a href="/example#note">Read</a>');
  fs.writeFileSync(path.join(dir,"example.html"), '<h1 id="note">Note</h1>');
  const check = () => run("check-links.mjs", dir, dir);
  assert.equal(check().status, 0);
  fs.writeFileSync(path.join(dir,"example.html"), '<img src="/missing.png">');
  fs.writeFileSync(path.join(dir,"sitemap.xml"), '<url><loc>https://wellspokeninstitute.org/missing</loc></url>');
  const broken = check();
  assert.equal(broken.status, 1);
  for (const text of ["missing anchor /example#note", "missing /missing.png", "missing /missing"]) {
    assert.ok(broken.stderr.includes(text), broken.stderr);
  }
});

test("an edit to a verified source invalidates its cached receipt in any registry shard", t => {
  const dir = fixture(t);
  const registry = path.join(dir,"content","citations");
  fs.mkdirSync(registry,{recursive:true});
  const data = JSON.parse(fs.readFileSync(path.join(root,"content","citations","core.json")));
  const nondefault = path.join(registry,"another-shard.json");
  fs.writeFileSync(nondefault,JSON.stringify(data));
  const check = () => run("verify-citations.mjs",dir,"--check");
  assert.equal(check().status,0);
  data.onet31.title = "Edited reference";
  fs.writeFileSync(nondefault,JSON.stringify(data));
  assert.match(check().stderr,/onet31: verification missing or stale/);
});
test("queued content is checked before release and a future date cannot masquerade as published", t => {
  const dir = fixture(t);
  fs.symlinkSync(path.join(root,"data"),path.join(dir,"data"));
  const collection = path.join(dir,"content","professions");
  fs.mkdirSync(collection,{recursive:true});
  fs.symlinkSync(path.join(root,"content","citations"),path.join(dir,"content","citations"));
  const file = "nurse-practitioners.mdx";
  const original = fs.readFileSync(path.join(root,"content","professions",file),"utf8");
  const check = text => {
    fs.writeFileSync(path.join(collection,file),text);
    return run("validate-content.mjs",dir);
  };
  const future = original.replace(/^publishedAt:.*$/m,'publishedAt: "2099-11-24"');
  assert.match(check(future).stderr,/future publishedAt/);
  const scheduled = future.replace("publishedAt:", "scheduledFor:").replace("status: published","status: scheduled");
  assert.equal(check(scheduled).status,0);
  assert.match(check(scheduled.replace(/occupationCode: .*/,'occupationCode: "xxx"')).stderr,/unknown occupation/);
  assert.match(check(scheduled.replace('"blsoews2025", ', "")).stderr,/blsoews2025/);
});
