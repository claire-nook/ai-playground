import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile, readFile, readdir, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { checkExperiments, runCli } from "../scripts/check-experiment-integrity.mjs";

async function cli(root) {
  const output = [], errors = [];
  const status = await runCli(["--root", root], (line) => output.push(line), (line) => errors.push(line));
  return { status, stdout: output.join("\n"), stderr: errors.join("\n") };
}
const declaration = (id, extra = {}) => `<!-- experiment: ${JSON.stringify({ id, card: "required", index: "required", ...extra })} -->`;
const metadata = (id, recordPath) => JSON.stringify({ id, recordPath });
const index = (id, record = "example/README.md") => `### ${id} — Fixture\n\n- Record: [Record](../experiments/${record})\n`;
async function fixture(t, files) {
  const root = await mkdtemp(path.join(os.tmpdir(), "experiment-integrity-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  for (const [relative, content] of Object.entries(files)) {
    await mkdir(path.dirname(path.join(root, relative)), { recursive: true });
    await writeFile(path.join(root, relative), content);
  }
  return root;
}
const codes = (result) => result.findings.filter((item) => item.level === "ERROR").map((item) => item.code);
const base = {
  "experiments/example/README.md": declaration("TEST-1"),
  "experiments/example/test.catalog.json": metadata("TEST-1", "experiments/example/README.md"),
  "knowledge/experiments.md": index("TEST-1"),
};

test("explicit expected card detects entirely absent metadata and CLI exits 1", async (t) => {
  const root = await fixture(t, { "experiments/example/README.md": declaration("TEST-1"), "knowledge/experiments.md": index("TEST-1") });
  assert.deepEqual(codes(await checkExperiments(root)), ["MISSING_CATALOG"]);
  const run = await cli(root);
  assert.equal(run.status, 1); assert.match(run.stdout, /ERROR MISSING_CATALOG/);
});

test("missing record target is an error even without a declaration", async (t) => {
  const root = await fixture(t, { "experiments/example/test.catalog.json": metadata("TEST-1", "experiments/example/missing.md"), "knowledge/experiments.md": "" });
  assert.deepEqual(codes(await checkExperiments(root)), ["MISSING_RECORD"]);
});

test("duplicate declared IDs and duplicate catalog IDs are rejected", async (t) => {
  const root = await fixture(t, { ...base,
    "experiments/other/README.md": declaration("TEST-1"),
    "experiments/other/test.catalog.json": metadata("TEST-1", "experiments/example/README.md"),
  });
  assert.deepEqual(codes(await checkExperiments(root)), ["DUPLICATE_CATALOG_ID", "DUPLICATE_ID"]);
});

test("intentional cardless experiment passes without metadata", async (t) => {
  const root = await fixture(t, { "experiments/example/README.md": declaration("TEST-1", { card: "none" }), "knowledge/experiments.md": index("TEST-1") });
  const result = await checkExperiments(root);
  assert.equal(result.errors, 0); assert.equal(result.warnings, 0);
});

test("shared Record and cardless child registered under parent produce no false positives", async (t) => {
  const root = await fixture(t, { ...base,
    "experiments/example/README.md": `${declaration("TEST-1")}\n${declaration("TEST-2")}`,
    "experiments/example/second.catalog.json": metadata("TEST-2", "experiments/example/README.md"),
    "experiments/child/README.md": declaration("CHILD-1", { card: "none", indexId: "TEST-1" }),
    "knowledge/experiments.md": index("TEST-1") + "- Child Record: [Child](../experiments/child/README.md)\n" + index("TEST-2"),
  });
  const result = await checkExperiments(root);
  assert.equal(result.declarations, 3); assert.equal(result.errors, 0); assert.equal(result.warnings, 0);
});

test("wrong primary target, orphan Index links and missing explicit Index are errors", async (t) => {
  const root = await fixture(t, { ...base,
    "experiments/other/README.md": "Historical note",
    "experiments/example/test.catalog.json": metadata("TEST-1", "experiments/other/README.md"),
    "knowledge/experiments.md": "### TEST-1 — Fixture\n- Record: [Missing](../experiments/example/missing.md)\n",
  });
  assert.deepEqual(codes(await checkExperiments(root)), ["INDEX_RECORD_MISMATCH", "MISSING_INDEX_ENTRY", "ORPHAN_INDEX_REFERENCE", "RECORD_MISMATCH"]);
});

test("catalog pointing at another declared identity is an orphan", async (t) => {
  const root = await fixture(t, { ...base, "experiments/example/test.catalog.json": metadata("OTHER-1", "experiments/example/README.md") });
  assert.ok(codes(await checkExperiments(root)).includes("ORPHAN_CATALOG_ID"));
});

test("cardless intent contradicting a present card is reported", async (t) => {
  const root = await fixture(t, { ...base, "experiments/example/README.md": declaration("TEST-1", { card: "none" }) });
  assert.deepEqual(codes(await checkExperiments(root)), ["CARD_INTENT_MISMATCH"]);
});

test("ambiguous historical README / Catalog warns, fenced example does not declare", async (t) => {
  const root = await fixture(t, { ...base,
    "experiments/example/README.md": `# Legacy\n\n\`\`\`html\n${declaration("EXAMPLE-1")}\n\`\`\`\n`,
    "experiments/historical/README.md": "# Historical note",
  });
  const result = await checkExperiments(root);
  assert.equal(result.declarations, 0); assert.equal(result.errors, 0);
  assert.deepEqual(result.findings.map((item) => item.code), ["LEGACY_CATALOG_ID", "UNCLASSIFIED_RECORD"]);
});

test("malformed declarations and unsafe paths fail without aborting the report", async (t) => {
  const root = await fixture(t, { ...base,
    "experiments/example/README.md": "<!-- experiment: broken -->\n<!-- experiment: {\"id\":\"BAD/ID\",\"card\":\"none\",\"index\":\"unknown\"} -->",
    "experiments/example/test.catalog.json": metadata("TEST-1", "experiments/../README.md"),
  });
  assert.equal(codes(await checkExperiments(root)).filter((code) => code === "INVALID_DECLARATION").length, 2);
  assert.ok(codes(await checkExperiments(root)).includes("MISSING_RECORD"));
});

test("repeatable CLI leaves all fixture contents and directory entries untouched", async (t) => {
  const root = await fixture(t, base);
  async function snapshot(directory) {
    const entries = await readdir(directory, { withFileTypes: true });
    return Promise.all(entries.sort((a, b) => a.name.localeCompare(b.name)).map(async (entry) => [entry.name, entry.isDirectory() ? await snapshot(path.join(directory, entry.name)) : await readFile(path.join(directory, entry.name), "utf8")]));
  }
  const before = await snapshot(root);
  const runs = [await cli(root), await cli(root)];
  assert.equal(runs[0].status, 0); assert.equal(runs[1].status, 0);
  assert.equal(runs[0].stdout, runs[1].stdout);
  assert.deepEqual(await snapshot(root), before);
});
