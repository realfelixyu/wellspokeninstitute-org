import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const source = fs.readFileSync(path.join(root, "src", "data", "topics.ts"), "utf8");
const assignments = source.slice(source.indexOf("export const TOPIC_ASSIGNMENTS"));
const keys = [...assignments.matchAll(/^\s+"((?:learn|research|statistics|professions)\/[a-z0-9-]+)":/gm)].map(m => m[1]);

test("every topic assignment points at an existing content file", () => {
  assert.ok(keys.length > 30, `expected the topic map to list the existing pages, found ${keys.length}`);
  const missing = keys.filter(key => !fs.existsSync(path.join(root, "content", `${key}.mdx`)));
  assert.deepEqual(missing, []);
  assert.equal(new Set(keys).size, keys.length, "duplicate keys in TOPIC_ASSIGNMENTS");
});

test("topic copy has no em dashes or bare product name", () => {
  assert.doesNotMatch(source, /—/);
  assert.doesNotMatch(source.replace(/^\s*\/\/.*$/gm, ""), /Wellspoken(?!\s+Institute)/);
});

test("every Learn, research and statistics page has a topic assignment", () => {
  const mapped = new Set(keys);
  for (const collection of ["learn", "research", "statistics"]) {
    for (const file of fs.readdirSync(path.join(root, "content", collection))) {
      if (!file.endsWith(".mdx")) continue;
      const key = collection + "/" + file.slice(0, -4);
      assert.ok(mapped.has(key), "Add a topic assignment for " + key);
    }
  }
});
