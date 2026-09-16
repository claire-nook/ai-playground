import { readdir, readFile, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const catalogRoots = [path.join(root, "experiments"), path.join(root, "knowledge", "wall")];
const outputPath = path.join(root, "public", "research-catalog.json");
const legacyOutputPath = path.join(root, "public", "experiment-catalog.json");
const requiredStringFields = ["id", "title", "summary", "recordPath", "demoStatus", "verificationStatus"];
const demoStatuses = new Set(["live", "retired", "none", "planned"]);
const verificationStatuses = new Set(["verified", "partial", "candidate"]);
const outputTypes = new Set(["experiment", "commentary", "technical-note", "knowledge"]);
const researchMethods = new Set(["controlled-experiment", "field-verification", "analysis", "synthesis"]);

// 遞迴尋找 Catalog metadata，讓 metadata 留在所屬 Research Output 旁邊，而不是另外維護一份中央清單。
async function findCatalogFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nestedFiles = await Promise.all(entries.map(async (entry) => {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return findCatalogFiles(entryPath);
    return entry.isFile() && entry.name.endsWith(".catalog.json") ? [entryPath] : [];
  }));
  return nestedFiles.flat();
}

// Catalog metadata 若有歧義就直接讓 deploy 失敗，避免網站發布一份表面可讀、實際語意不可靠的研究索引。
function validateCatalogEntry(entry, sourcePath) {
  if (!entry || typeof entry !== "object" || Array.isArray(entry)) throw new Error(`${sourcePath}: metadata must be a JSON object`);
  for (const field of requiredStringFields) {
    if (typeof entry[field] !== "string" || entry[field].trim() === "") throw new Error(`${sourcePath}: ${field} must be a non-empty string`);
  }
  entry.outputType ??= "experiment";
  entry.researchMethod ??= "controlled-experiment";
  if (!outputTypes.has(entry.outputType)) throw new Error(`${sourcePath}: invalid outputType`);
  if (!researchMethods.has(entry.researchMethod)) throw new Error(`${sourcePath}: invalid researchMethod`);
  if (!Array.isArray(entry.tags) || entry.tags.length === 0 || entry.tags.some((tag) => typeof tag !== "string" || tag.trim() === "" || tag !== tag.trim())) {
    throw new Error(`${sourcePath}: tags must be a non-empty array of trimmed, non-empty strings`);
  }
  const normalizedTags = entry.tags.map((tag) => tag.toLocaleLowerCase("en-US"));
  if (new Set(normalizedTags).size !== normalizedTags.length) throw new Error(`${sourcePath}: tags must not contain case-insensitive duplicates`);
  if (!demoStatuses.has(entry.demoStatus)) throw new Error(`${sourcePath}: invalid demoStatus`);
  if (!verificationStatuses.has(entry.verificationStatus)) throw new Error(`${sourcePath}: invalid verificationStatus`);

  // Candidate 代表目前已正式開啟、但尚未完成的研究，因此 completedDate 可以是 null 或省略。
  // 一旦研究進入 partial / verified，就必須留下真實完成日期，不能用假日期滿足 Catalog validation。
  if (entry.verificationStatus === "candidate") {
    if (entry.completedDate !== null && entry.completedDate !== undefined) {
      throw new Error(`${sourcePath}: candidate completedDate must be null or omitted`);
    }
  } else {
    if (typeof entry.completedDate !== "string" || entry.completedDate.trim() === "") {
      throw new Error(`${sourcePath}: completedDate must be a non-empty string once verificationStatus is not candidate`);
    }
    const parsedCompletedDate = new Date(`${entry.completedDate}T00:00:00Z`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(entry.completedDate) || Number.isNaN(parsedCompletedDate.valueOf()) || parsedCompletedDate.toISOString().slice(0, 10) !== entry.completedDate) {
      throw new Error(`${sourcePath}: completedDate must be a valid YYYY-MM-DD date`);
    }
  }

  if (path.isAbsolute(entry.recordPath) || !entry.recordPath.endsWith(".md") || entry.recordPath.split("/").includes("..")) {
    throw new Error(`${sourcePath}: recordPath must be a repository-relative Markdown path`);
  }
  if (entry.outputType === "experiment" && !entry.recordPath.startsWith("experiments/")) throw new Error(`${sourcePath}: experiment recordPath must live under experiments/`);
  if (entry.demoStatus === "live" && (typeof entry.demoPath !== "string" || !entry.demoPath.startsWith("/"))) throw new Error(`${sourcePath}: a live demo requires an absolute demoPath`);
  if (entry.demoStatus !== "live" && "demoPath" in entry && entry.demoPath !== null) throw new Error(`${sourcePath}: demoPath must be null or omitted unless the demo is live`);
  if ("flow" in entry && (typeof entry.flow !== "string" || !entry.flow.trim())) throw new Error(`${sourcePath}: flow must be a non-empty string when present`);
}

const catalogFiles = (await Promise.all(catalogRoots.map(findCatalogFiles))).flat();
const catalog = await Promise.all(catalogFiles.map(async (catalogPath) => {
  const relativePath = path.relative(root, catalogPath);
  let entry;
  try { entry = JSON.parse(await readFile(catalogPath, "utf8")); }
  catch (error) { throw new Error(`${relativePath}: invalid JSON (${error.message})`); }
  validateCatalogEntry(entry, relativePath);
  return entry;
}));

const ids = new Set();
for (const entry of catalog) {
  if (ids.has(entry.id)) throw new Error(`duplicate catalog id: ${entry.id}`);
  ids.add(entry.id);
}

// Candidate 是目前的 active research front，因此優先顯示在 Catalog。
// 其他已完成／部分完成的 Research Output 再依 completedDate 倒序排列；不要把 null completedDate 當成最舊日期處理。
catalog.sort((left, right) => {
  const leftCandidate = left.verificationStatus === "candidate";
  const rightCandidate = right.verificationStatus === "candidate";
  if (leftCandidate !== rightCandidate) return leftCandidate ? -1 : 1;

  const leftDate = left.completedDate ?? "";
  const rightDate = right.completedDate ?? "";
  return rightDate.localeCompare(leftDate) || left.id.localeCompare(right.id, "en", { numeric: true });
});

await mkdir(path.dirname(outputPath), { recursive: true });
const payload = `${JSON.stringify(catalog, null, 2)}\n`;
await writeFile(outputPath, payload, "utf8");
// 相容性輸出：舊版 result reader 與既有 cache 在 migration 期間仍可繼續使用。
await writeFile(legacyOutputPath, payload, "utf8");
console.log(`Generated ${path.relative(root, outputPath)} with ${catalog.length} research outputs.`);
