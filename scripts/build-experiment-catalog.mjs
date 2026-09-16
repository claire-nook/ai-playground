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

// Recursive discovery keeps catalog metadata beside the research output that owns it.
async function findCatalogFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nestedFiles = await Promise.all(entries.map(async (entry) => {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return findCatalogFiles(entryPath);
    return entry.isFile() && entry.name.endsWith(".catalog.json") ? [entryPath] : [];
  }));
  return nestedFiles.flat();
}

// Validation fails the deploy rather than publishing ambiguous research metadata.
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

  // Candidate research may be cataloged before it is completed. A completion date becomes mandatory
  // once the output advances beyond candidate, while candidate cards may explicitly use null.
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

// Completed outputs are ordered by research chronology. Candidate cards without a completion date
// stay after dated outputs and use natural ID order among themselves.
catalog.sort((left, right) => {
  const leftDate = left.completedDate ?? "";
  const rightDate = right.completedDate ?? "";
  return rightDate.localeCompare(leftDate) || left.id.localeCompare(right.id, "en", { numeric: true });
});

await mkdir(path.dirname(outputPath), { recursive: true });
const payload = `${JSON.stringify(catalog, null, 2)}\n`;
await writeFile(outputPath, payload, "utf8");
// Compatibility artifact: existing result readers and old cached pages keep working during migration.
await writeFile(legacyOutputPath, payload, "utf8");
console.log(`Generated ${path.relative(root, outputPath)} with ${catalog.length} research outputs.`);
