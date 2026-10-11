import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";
import test from "node:test";

const source = await readFile(new URL("../public/assets/markdown-reader.js", import.meta.url), "utf8");
const raw = "https://raw.githubusercontent.com/claire-nook/ai-playground/main/";
const github = "https://github.com/claire-nook/ai-playground/blob/main/";
function readerHarness() {
  const handlers = [];
  const window = { location: { origin: "https://deploy-preview-99--lab.netlify.app" } };
  const document = { addEventListener: (type, handler) => handlers.push(handler), getElementById: () => null, querySelector: () => null };
  const context = vm.createContext({ URL, window, document, console });
  vm.runInContext(source, context);
  return { api: window.PlaygroundReader, handlers, context, document, window };
}
const node = (value, tagName = "A") => ({ tagName, value, getAttribute() { return this.value; }, setAttribute(key, value) { this.value = value; } });

test("actual resolver keeps site-root links on Preview origin and repository artifacts on raw main", () => {
  const { api } = readerHarness();
  const nodes = [node("/dayone-reader/"), node("/downloads/dayone-reader/guide.pdf"), node("../../evidence/result.md"), node("images/photo.png", "IMG"), node("sample.zip"), node("https://example.com/doc.md"), node("//cdn.example.com/image.png", "IMG"), node("#section")];
  api.resolveDocumentUrls({ querySelectorAll: () => nodes }, "experiments/example/README.md");
  assert.deepEqual(nodes.map((item) => item.value), [
    "https://deploy-preview-99--lab.netlify.app/dayone-reader/",
    "https://deploy-preview-99--lab.netlify.app/downloads/dayone-reader/guide.pdf",
    raw + "evidence/result.md", raw + "experiments/example/images/photo.png", raw + "experiments/example/sample.zip",
    "https://example.com/doc.md", "//cdn.example.com/image.png", "#section",
  ]);
});

test("explicit same-repo main Markdown URLs enter Reader; directories, other branches and externals do not", () => {
  const { repositoryPathFromRawUrl: resolve } = readerHarness().api;
  for (const prefix of [raw, github]) {
    assert.equal(resolve(prefix + "evidence/result.md#section"), "evidence/result.md");
    assert.equal(resolve(prefix + "knowledge/space%20name.md?raw=1"), "knowledge/space name.md");
    assert.equal(resolve(prefix + "experiments/example/"), null);
    assert.equal(resolve(prefix + "sample.zip"), null);
    assert.equal(resolve(prefix + "%2e%2e%2Fsecret.md"), null);
    assert.equal(resolve(prefix + "bad%zz.md"), null);
  }
  assert.equal(resolve(github.replace("/main/", "/feature/") + "README.md"), null);
  assert.equal(resolve(github.replace("ai-playground", "other") + "README.md"), null);
  assert.equal(resolve("https://example.com/README.md"), null);
});

test("click dispatch loads main Markdown in the same Reader and preserves external/modified clicks", async () => {
  const { handlers, context, document, window } = readerHarness();
  const fetched = [];
  context.fetch = async (url) => { fetched.push(url); return { ok: true, text: async () => "# Fixture" }; };
  window.marked = { parse: (text) => text }; window.DOMPurify = { sanitize: (html) => html };
  const classList = { add() {}, remove() {} };
  const article = { querySelectorAll: () => [], hidden: true };
  const state = { classList };
  const back = {};
  const toolbar = { querySelector: () => back };
  const fallback = {};
  const anchor = { scrollIntoView() { this.scrolled = true; } };
  const container = {
    id: "reader", dataset: { recordPath: "experiments/example/README.md" },
    querySelector(selector) { return selector === ".reader-toolbar" ? toolbar : selector === ".reader-state" ? state : selector === ".markdown-body" ? article : fallback; },
    scrollIntoView() {}, contains: (target) => target === anchor,
  };
  document.getElementById = (id) => id === "reader" ? container : id === "section" ? anchor : null;
  async function click(href, extra = {}) {
    const link = { href, hasAttribute: () => false };
    const event = { target: { closest: (selector) => selector.includes("a[href]") ? link : null }, preventDefault() { this.prevented = true; }, ...extra };
    await handlers[0](event); return event;
  }
  assert.equal((await click(github + "evidence/result.md#section")).prevented, true);
  assert.deepEqual(fetched, [raw + "evidence/result.md"]);
  assert.equal(container.dataset.recordPath, "evidence/result.md");
  assert.deepEqual(JSON.parse(container.dataset.readerHistory), ["experiments/example/README.md"]);
  assert.equal(anchor.scrolled, true);
  assert.equal(fallback.href, github + "evidence/result.md");
  assert.equal((await click("https://example.com/doc.md")).prevented, undefined);
  assert.equal((await click(raw + "evidence/other.md", { metaKey: true })).prevented, undefined);
  assert.equal(fetched.length, 1);
});
