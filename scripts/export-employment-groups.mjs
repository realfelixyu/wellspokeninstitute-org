// Regenerate the public combined-group crosswalk from the frozen May 2025 and O*NET 31.0 data.
import assert from "node:assert/strict";
import fs from "node:fs";

const data = new URL("../data/", import.meta.url);
const destination = new URL("../public/data/", import.meta.url);
const read = (file) => JSON.parse(fs.readFileSync(new URL(file, data), "utf8"));
const bls = read("bls-oews-national.json");
const occupations = read("speaking-by-occupation.json");
const national = new Map(bls.rows.map(row => [row.soc, row]));
const byCode = new Map(occupations.rows.map(row => [row.code, row]));

// May 2025 OEWS uses a special teaching-assistant group which excludes 25-9044.
const membership = [
  ["31-1120", ["31-1121.00", "31-1122.00"]],
  ["25-9045", ["25-9042.00", "25-9043.00", "25-9049.00"]],
  ["51-2090", ["51-2092.00", "51-2099.00"]],
];
const unratedTitles = new Map([
  ["25-9049.00", "Teaching Assistants, All Other"],
  ["51-2099.00", "Assemblers and Fabricators, All Other"],
]);
const sources = {
  nationalEstimates: "https://www.bls.gov/oes/special-requests/oesm25nat.zip",
  employmentStructure: "https://www.bls.gov/oes/2025/may/oes_stru.htm",
  socStructure: "https://www.bls.gov/soc/2018/major_groups.htm",
  teachingAssistantDefinition: "https://www.bls.gov/oes/oes_ques.htm",
  occupationDatabase: "https://www.onetcenter.org/dl_files/database/db_31_0_text.zip",
};
const groups = membership.map(([code, codes]) => {
  const group = national.get(code);
  assert.ok(Number.isInteger(group?.employment), "Missing national employment for " + code);
  const members = codes.map(memberCode => {
    const row = byCode.get(memberCode);
    const title = row?.title ?? unratedTitles.get(memberCode);
    assert.ok(title, "Unknown O*NET member " + memberCode);
    return { code: memberCode, title, rated: Number.isFinite(row?.speakingDemandScore) };
  });
  return { code, title: group.title, employment: group.employment, members };
});

const licenseUrl = "https://creativecommons.org/licenses/by/4.0/";
const canonical = "https://wellspokeninstitute.org/data/speaking-by-occupation";
const modifiedBy = "Wellspoken Institute matched combined BLS employment groups to detailed O*NET occupations and identified which have a Speaking Demand Score. " + occupations.modifiedBy;
const crosswalk = {
  employmentSource: occupations.employmentSource, occupationSource: occupations.source,
  sourceUrl: occupations.sourceUrl, modifiedBy, license: "CC BY 4.0", licenseUrl, canonical, sources, groups,
};
const credit = [crosswalk.occupationSource, crosswalk.sourceUrl, modifiedBy, crosswalk.employmentSource,
  canonical, "License: " + licenseUrl].join(" ");
const rows = [
  ["May 2025 OEWS group code", "OEWS occupation group", "US employment for the entire group",
    "All O*NET-SOC member codes", "All member titles (in code order)", "Codes with a Speaking Demand Score",
    "Codes without a Speaking Demand Score", "May 2025 national estimates", "May 2025 OEWS structure",
    "2018 SOC structure", "BLS combined-code definitions", "O*NET 31.0 database", "Source and license"],
  ...groups.map(group => {
    const codes = members => members.map(member => member.code).join(" | ");
    return [group.code, group.title, group.employment, codes(group.members),
      group.members.map(member => member.title).join(" | "), codes(group.members.filter(member => member.rated)),
      codes(group.members.filter(member => !member.rated)), sources.nationalEstimates, sources.employmentStructure,
      sources.socStructure, sources.teachingAssistantDefinition, sources.occupationDatabase, credit];
  }),
];

function csvCell(value) {
  const text = String(value);
  return /[",\r\n]/.test(text) ? '"' + text.replaceAll('"', '""') + '"' : text;
}
const csv = rows.map(row => row.map(csvCell).join(",")).join("\r\n") + "\r\n";
for (const [name, body] of [["employment-groups.json", JSON.stringify(crosswalk, null, 2) + "\n"], ["employment-groups.csv", csv]]) {
  const file = new URL(name, destination);
  if (process.argv.includes("--check")) {
    assert.equal(fs.readFileSync(file, "utf8"), body, name + " must be regenerated");
  } else {
    fs.writeFileSync(file, body);
  }
}
