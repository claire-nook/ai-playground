import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("catalog carries validated Reader metadata and newest-first order", async () => {
  const catalog = JSON.parse(await read("public/experiment-catalog.json"));
  assert.equal(catalog.length, 6);
  for (const entry of catalog) {
    assert.match(entry.completedDate, /^\d{4}-\d{2}-\d{2}$/);
    assert.match(entry.recordPath, /^experiments\/.+\.md$/);
  }
  const expected = [...catalog].sort(
    (left, right) =>
      right.completedDate.localeCompare(left.completedDate) ||
      left.id.localeCompare(right.id, "en", { numeric: true }),
  );
  assert.deepEqual(
    catalog.map(({ id }) => id),
    expected.map(({ id }) => id),
  );
});

test("Human View routes canonical Markdown without copying articles", async () => {
  const [index, result, reader] = await Promise.all([
    read("public/index.html"),
    read("public/result/index.html"),
    read("public/assets/markdown-reader.js"),
  ]);
  assert.match(index, />\s*Experiments\s*</);
  assert.match(index, />\s*Short Term\s*</);
  assert.match(index, />\s*Knowledge Map\s*</);
  assert.match(index, /notes\/short-term-work\.md/);
  assert.match(index, /knowledge\/maps\/nook-technical-platform\.md/);
  assert.match(result, /experiment-catalog\.json/);
  assert.match(reader, /raw\.githubusercontent\.com/);
  assert.match(reader, /DOMPurify\.sanitize/);
});

test("Mermaid fixture and failure-isolation implementation are present", async () => {
  const [fixture, reader] = await Promise.all([
    read("experiments/custom-api/README.md"),
    read("public/assets/markdown-reader.js"),
  ]);
  assert.ok((fixture.match(/```mermaid/g) || []).length >= 2);
  assert.match(reader, /language-mermaid/);
  assert.match(reader, /Mermaid render error/);
  assert.match(reader, /mermaid-error/);
});

test("Netlify trigger includes deployable Reader assets but excludes research Markdown", async () => {
  const config = await read("netlify.toml");
  assert.match(config, /\^\(public\//);
  assert.ok(config.includes(String.raw`experiments/.+\\.catalog\\.json$`));
  assert.doesNotMatch(config, /experiments\/\.\+README/);
  assert.doesNotMatch(config, /notes\/short-term-work/);
  assert.doesNotMatch(config, /knowledge\/maps/);
});
