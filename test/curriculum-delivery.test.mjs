import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { emailCurriculum, openCurriculumLink, redeemCurriculumClick } from "../lib/curriculum-delivery.mjs";
import { trackCurriculumClick } from "../lib/curriculum-click.mjs";

const origin = "https://wellspokeninstitute.org";
const email = "reader@example.org";
const template = "42";
function fixture(t) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "pack-"));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  const file = path.join(dir, "db");
  // Exercise the actual migration and queries with Python’s standard SQLite library.
  const sqlite = [
    "import sqlite3, sys",
    "db = sqlite3.connect(sys.argv[1], isolation_level=None)",
    "for statement in sys.stdin.read().split(';'):",
    "    if statement.strip():",
    "        for row in db.execute(statement): print(row[0])",
  ].join("\n");
  const sql = command => execFileSync("python3", ["-c", sqlite, file], { input:command, encoding: "utf8" }).trim();
  sql(fs.readFileSync(new URL("../migrations/0001_curriculum_receipts.sql",import.meta.url),"utf8"));
  const db = {
    prepare(query) {
      return {
        query,
        bind(hash) {
          assert.match(hash, /^[0-9a-f]{64}$/);
          return db.prepare(query.replace("?", "'" + hash + "'"));
        },
        run() { return { meta: { changes: Number(sql(query + "; SELECT changes();")) } }; }
      };
    },
    batch(statements) { sql("BEGIN; " + statements.map(s => s.query).join("; ") + "; COMMIT;"); }
  };
  return { sql, env: { CURRICULUM_RECEIPTS: db, TURNSTILE_SECRET: "test", BREVO_API_KEY: "test",
    BREVO_DOI_TEMPLATE_ID: "2", BREVO_CURRICULUM_TEMPLATE_ID: template } };
}
function form() {
  return new Request(origin + "/api/curriculum-email", { method:"POST", headers:{ Origin:origin },
    body:new URLSearchParams({ email, "cf-turnstile-response":"test" }) });
}
function provider(action, status = 201) {
  const calls = [];
  const send = async (url, options) => {
    calls.push({url,options});
    return calls.length === 1 ? Response.json({ success:true, hostname:"wellspokeninstitute.org", action })
      : new Response(null,{status});
  };
  return { send,calls };
}
test("transactional request preserves ungated access, consumes only on PDF click, once across browsers", async t => {
  const { env, sql } = fixture(t);
  const p = provider("curriculum");
  assert.equal((await emailCurriculum(form(),env,p.send)).status,200);
  assert.deepEqual(p.calls.map(c=>c.url), ["https://challenges.cloudflare.com/turnstile/v0/siteverify","https://api.brevo.com/v3/smtp/email"]);
  const payload = JSON.parse(p.calls[1].options.body);
  assert.deepEqual(Object.keys(payload).sort(),["params","templateId","to"]);
  assert.equal(payload.templateId,42);
  assert.equal(payload.to[0].email,email);
  const url = payload.params.pack_url;
  assert.ok(!url.includes("reader"));
  const open = () => openCurriculumLink(new Request(url));
  assert.equal(open().headers.get("Location"),"/curriculum#teaching-pack");
  assert.equal(open().headers.get("Referrer-Policy"),"no-referrer");
  const cookie = open().headers.get("Set-Cookie").split(";")[0];
  assert.ok(!sql("SELECT digest FROM curriculum_receipts").includes(cookie.split("=")[1]));
  const events = [];
  async function click(cookieValue, host = origin) {
    const browser = { location:new URL(host), gtag:(...args)=>events.push(args),
      fetch:(url, opts)=>redeemCurriculumClick(new Request(origin + url, { ...opts,headers:{ Origin:host, Cookie:cookieValue } }),env) };
    await trackCurriculumClick(browser,"G-TEST");
  }
  await click("");
  await click(cookie,"https://preview.pages.dev");
  assert.equal(sql("SELECT count(*) FROM curriculum_receipts"),"1");
  await Promise.all([click(cookie),click(cookie)]);
  assert.deepEqual(events,[["event","curriculum_download",{ send_to:"G-TEST" }]]);
  assert.equal(sql("SELECT count(*) FROM curriculum_receipts"),"0");
});
test("wrong challenge, missing binding, newsletter template and rejected deliveries never qualify", async t => {
  const {env,sql} = fixture(t);
  for (const override of [{ CURRICULUM_RECEIPTS:null },{ BREVO_CURRICULUM_TEMPLATE_ID:"2" },{ BREVO_CURRICULUM_TEMPLATE_ID:"" }]) {
    assert.equal((await emailCurriculum(form(),{...env,...override},()=>assert.fail())).status,503);
  }
  const wrong = provider("newsletter");
  assert.equal((await emailCurriculum(form(),env,wrong.send)).status,400);
  assert.equal(wrong.calls.length,1);
  const rejected = provider("curriculum",400);
  assert.equal((await emailCurriculum(form(),env,rejected.send)).status,503);
  assert.equal(sql("SELECT count(*) FROM curriculum_receipts"),"0");
});
test("expired and malformed receipts cannot generate conversions", async t => {
  const {env,sql} = fixture(t);
  const p = provider("curriculum");
  await emailCurriculum(form(),env,p.send);
  const url = JSON.parse(p.calls[1].options.body).params.pack_url;
  const opened = openCurriculumLink(new Request(url));
  sql("UPDATE curriculum_receipts SET expires_at = 0");
  const r = await redeemCurriculumClick(new Request(origin + "/api/curriculum-click",{
    method:"POST",headers:{Origin:origin,Cookie:opened.headers.get("Set-Cookie").split(";")[0]}
  }),env);
  assert.equal(r.status,204);
  assert.equal(openCurriculumLink(new Request(origin + "/api/curriculum-ticket?key=garbage")).headers.get("Set-Cookie"),null);
});
