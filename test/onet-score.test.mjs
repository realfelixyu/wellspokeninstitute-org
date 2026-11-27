import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const importer = fileURLToPath(new URL("../scripts/onet-import.mjs", import.meta.url));

test("the importer rounds an exact score midpoint and its neighbors at publication precision", t => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "onet-midpoint-"));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  const raw = path.join(dir, "data/raw/onet/db_31_0_text");
  fs.mkdirSync(raw, { recursive: true });

  const cases = [
    ["10-0001.00", "Just below", "2.99", 46.7],
    ["45-3031.00", "Fishing and Hunting Workers", "3.00", 46.8],
    ["10-0003.00", "Just above", "3.01", 46.8],
  ];
  function table(name, columns, rows = []) {
    fs.writeFileSync(path.join(raw, name + ".txt"), [columns, ...rows].map(row => row.join("\t")).join("\n") + "\n");
  }
  const headers = ["O*NET-SOC Code", "Element ID", "Scale ID", "Data Value", "Recommend Suppress"];
  table("Occupation Data", ["O*NET-SOC Code", "Title"], cases.map(([code, title]) => [code, title]));
  table("Job Zones", ["O*NET-SOC Code", "Job Zone"]);
  table("Essential Skills", headers, cases.flatMap(([code, , importance]) => [
    [code, "2.A.1.d", "IM", importance, "N"],
    [code, "2.A.1.d", "LV", "2.38", "N"],
  ]));
  table("Abilities", headers, cases.map(([code]) => [code, "1.A.1.a.3", "IM", "3.25", "N"]));
  table("Work Context", headers);
  table("Work Activities", headers);

  execFileSync(process.execPath, [importer], { cwd: dir });
  const { rows } = JSON.parse(fs.readFileSync(path.join(dir, "data/speaking-by-occupation.json"), "utf8"));
  assert.deepEqual(Object.fromEntries(rows.map(r => [r.code, r.speakingDemandScore])),
    Object.fromEntries(cases.map(([code, , , expected]) => [code, expected])));
});
