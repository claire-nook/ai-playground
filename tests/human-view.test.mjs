import assert from "node:assert/strict";
import { access, readFile, readdir, mkdir, mkdtemp, writeFile, rm } from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { pathToFileURL } from "node:url";
import vm from "node:vm";
import test, { before, after } from "node:test";

const read = (target) => readFile(new URL(`../${target}`, import.meta.url), "utf8");
let catalog, scratch;
const metadataFiles = [];
async function discover(directory) {
  for (const entry of await readdir(new URL(`../${directory}`, import.meta.url), { withFileTypes: true })) {
    const target = `${directory}/${entry.name}`;
    if (entry.isDirectory()) await discover(target);
    else if (entry.name.endsWith(".catalog.json")) metadataFiles.push(target);
  }
}
before(async () => {
  scratch = await mkdtemp(path.join(os.tmpdir(), "research-builder-"));
  await Promise.all([discover("experiments"), discover("knowledge/wall")]);
  await mkdir(path.join(scratch, "scripts"), { recursive: true });
  await writeFile(path.join(scratch, "scripts/build-experiment-catalog.mjs"), await read("scripts/build-experiment-catalog.mjs"));
  for (const target of metadataFiles) {
    const text = await read(target), entry = JSON.parse(text);
    for (const [file, content] of [[target, text], [entry.recordPath, await read(entry.recordPath)]]) {
      await mkdir(path.dirname(path.join(scratch, file)), { recursive: true });
      await writeFile(path.join(scratch, file), content);
    }
  }
  await import(pathToFileURL(path.join(scratch, "scripts/build-experiment-catalog.mjs")));
  catalog = JSON.parse(await readFile(path.join(scratch, "public/research-catalog.json"), "utf8"));
});
after(async () => { if (scratch) await rm(scratch, { recursive: true, force: true }); });

test("Builder includes all source outputs, preserves legacy payload and candidate-first sorting", async () => {
  assert.equal(catalog.length, metadataFiles.length);
  assert.equal(new Set(catalog.map(({ id }) => id)).size, catalog.length);
  assert.deepEqual(catalog, JSON.parse(await readFile(path.join(scratch, "public/experiment-catalog.json"), "utf8")));
  for (const entry of catalog) {
    await access(new URL(`../${entry.recordPath}`, import.meta.url));
    if (entry.verificationStatus === "candidate") assert.ok(entry.completedDate == null);
    else assert.match(entry.completedDate, /^\d{4}-\d{2}-\d{2}$/);
  }
  const expected = [...catalog].sort((left, right) => {
    const candidates = Number(right.verificationStatus === "candidate") - Number(left.verificationStatus === "candidate");
    return candidates || (right.completedDate ?? "").localeCompare(left.completedDate ?? "") || left.id.localeCompare(right.id, "en", { numeric: true });
  });
  assert.deepEqual(catalog.map(({ id }) => id), expected.map(({ id }) => id));
});

test("Batch scheduling metadata resolves its canonical record and live demo", async () => {
  const entry = catalog.find(({ id }) => id === "D-BATCH-1");
  assert.equal(entry.verificationStatus, "verified"); assert.equal(entry.demoStatus, "live"); assert.equal(entry.demoPath, "/cron-edge-observer/");
  await access(new URL(`../public${entry.demoPath}index.html`, import.meta.url));
});

test("actual card renderer distinguishes experiment records and preserves demo shortcuts / planned badge", async () => {
  const html = await read("public/index.html");
  const script = html.slice(html.indexOf("  const pageSize="), html.indexOf("  function renderCatalog()"));
  const document = { getElementById: () => ({}), createElement: () => ({ textContent: "", get innerHTML() { return this.textContent.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll('"', "&quot;"); } }) };
  const context = vm.createContext({ document });
  vm.runInContext(script, context);
  const experiment = catalog.find((entry) => entry.outputType === "experiment" && entry.demoStatus === "live");
  const card = context.renderCard(experiment);
  assert.match(card, /查看實驗紀錄/); assert.match(card, /開啟 Live Demo/); assert.ok(card.includes(`/result/?id=${encodeURIComponent(experiment.id)}`));
  const planned = context.renderCard({ ...experiment, demoStatus: "planned", demoPath: null });
  assert.match(planned, /Demo Planned/); assert.doesNotMatch(planned, /undefined|開啟 Live Demo/);
  assert.match(html, /<option value="planned">Demo Planned<\/option>/);
  const commentary = context.renderCard({ ...experiment, outputType: "commentary", demoPath: "https://example.com/", demoStatus: "live" });
  assert.match(commentary, /查看研究成果/); assert.match(commentary, /target="_blank" rel="noopener noreferrer"/);
});

test("Human View routes main Markdown without copying articles and isolates Mermaid failure", async () => {
  const [index, result, reader, fixture] = await Promise.all([read("public/index.html"), read("public/result/index.html"), read("public/assets/markdown-reader.js"), read("experiments/custom-api/README.md")]);
  assert.match(index, /notes\/short-term-work\.md/); assert.match(index, /knowledge\/maps\/nook-technical-platform\.md/);
  assert.match(result, /research-catalog\.json/); assert.match(reader, /const branch = "main"/); assert.match(reader, /DOMPurify\.sanitize/);
  assert.ok((fixture.match(/```mermaid/g) || []).length >= 2);
  assert.match(reader, /language-mermaid/); assert.match(reader, /Mermaid render error/); assert.match(reader, /mermaid-error/);
});

test("Builder rejects a metadata target that does not exist", async (t) => {
  const root = await mkdtemp(path.join(os.tmpdir(), "missing-record-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  for (const directory of ["scripts", "experiments/example", "knowledge/wall"]) await mkdir(path.join(root, directory), { recursive: true });
  await writeFile(path.join(root, "scripts/build-experiment-catalog.mjs"), await read("scripts/build-experiment-catalog.mjs"));
  await writeFile(path.join(root, "experiments/example/test.catalog.json"), JSON.stringify({ ...catalog[0], id: "TEST-1", outputType: "experiment", recordPath: "experiments/example/missing.md" }));
  await assert.rejects(import(pathToFileURL(path.join(root, "scripts/build-experiment-catalog.mjs"))), /recordPath does not identify an existing file/);
  await assert.rejects(access(path.join(root, "public/research-catalog.json")));
});

test("Netlify trigger still includes Reader assets / metadata and excludes plain research prose", async () => {
  const config = await read("netlify.toml");
  assert.match(config, /\^\(public\//); assert.ok(config.includes(String.raw`experiments/.+\\.catalog\\.json$`));
  assert.doesNotMatch(config, /experiments\/\.\+README/); assert.doesNotMatch(config, /notes\/short-term-work/);
});
