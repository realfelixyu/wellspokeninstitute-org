import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const require = createRequire(import.meta.url);

test("the public crosswalk and one-row-per-group download match the source data", () => {
  execFileSync(process.execPath, ["scripts/export-employment-groups.mjs", "--check"], { cwd: root });
  const crosswalk = JSON.parse(fs.readFileSync(new URL("../public/data/employment-groups.json", import.meta.url)));
  assert.deepEqual(crosswalk.groups.map(group => [group.code, group.employment, group.members.map(m => [m.code, m.rated])]), [
    ["31-1120", 4305810, [["31-1121.00", true], ["31-1122.00", true]]],
    ["25-9045", 1420350, [["25-9042.00", true], ["25-9043.00", true], ["25-9049.00", false]]],
    ["51-2090", 1405030, [["51-2092.00", true], ["51-2099.00", false]]],
  ]);
  for (const group of crosswalk.groups) {
    for (const member of group.members) assert.equal("employment" in member, false);
  }
  const download = fs.readFileSync(new URL("../public/data/employment-groups.csv", import.meta.url), "utf8");
  const lines = download.trimEnd().split(/\r?\n/);
  assert.equal(lines.length, 4);
  assert.equal(crosswalk.licenseUrl, "https://creativecommons.org/licenses/by/4.0/");
  for (const line of lines.slice(1)) {
    for (const field of ["occupationSource", "sourceUrl", "employmentSource", "modifiedBy", "canonical", "licenseUrl"]) {
      assert.ok(line.includes(crosswalk[field]), "missing credit: " + field);
    }
  }
});

test("group lookup and search include unrated members and exclude occupations reported separately", t => {
  // CI runs Node 20. Compile the same typed module the browser imports.
  const output = fs.mkdtempSync(path.join(os.tmpdir(), "institute-employment-groups-"));
  t.after(() => fs.rmSync(output, { recursive: true, force: true }));
  execFileSync(process.execPath, [
    require.resolve("typescript/bin/tsc"), "src/lib/employmentGroups.ts", "--target", "ES2022",
    "--module", "commonjs", "--resolveJsonModule", "--esModuleInterop", "--skipLibCheck",
    "--rootDir", ".", "--outDir", output,
  ], { cwd: root });
  const { employmentGroups, groupForOccupation, groupMatchesQuery, occupationMatchesQuery, findOccupationMatches } = require(path.join(output, "src/lib/employmentGroups.js"));
  const teachers = groupForOccupation("25-9042.00");
  assert.equal(teachers.code, "25-9045");
  assert.equal(groupForOccupation(" 25-9049 "), teachers);
  assert.equal(groupForOccupation("25-9044.00"), undefined);
  assert.equal(groupForOccupation("51-2051.00"), undefined);
  assert.equal(groupForOccupation("31-1121.01"), undefined);
  assert.ok(groupMatchesQuery(teachers, "  teaching assistants, ALL OTHER "));
  assert.ok(groupMatchesQuery(teachers, "25-9045"));
  assert.ok(groupMatchesQuery(teachers, "25-9049"));
  assert.ok(groupMatchesQuery(teachers, ""));
  assert.equal(groupMatchesQuery(teachers, "25-9044.00"), false);
  assert.equal(occupationMatchesQuery(teachers, "25-9049"), false);

  const { rows } = JSON.parse(fs.readFileSync(new URL("../public/data/speaking-by-occupation.json", import.meta.url)));
  function actual(query) {
    const results = findOccupationMatches(rows, query);
    return { codes: results.occupations.map(row => row[1]).sort(), groups: results.groups.map(group => group.code) };
  }
  for (const group of employmentGroups) {
    const expected = group.members.filter(member => member.rated).map(member => member.code).sort();
    for (const query of [group.code, group.title]) {
      assert.deepEqual(actual(query), { codes: expected, groups: [group.code] });
    }
    for (const member of group.members) {
      for (const query of [member.code, member.title]) {
        assert.deepEqual(actual(query), { codes: member.rated ? [member.code] : [], groups: [group.code] });
      }
    }
  }
  const postsecondary = actual("postsecondary");
  assert.ok(postsecondary.codes.includes("25-9044.00"));
  assert.ok(teachers.members.every(member => !postsecondary.codes.includes(member.code)));
  assert.deepEqual(postsecondary.groups, []);
  assert.deepEqual(actual("25-9044.00"), { codes: ["25-9044.00"], groups: [] });
});
