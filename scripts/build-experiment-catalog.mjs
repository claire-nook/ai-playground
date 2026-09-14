import { readdir, readFile, mkdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const experimentsDirectory = path.join(root, "experiments");
const outputPath = path.join(root, "public", "experiment-catalog.json");
const requiredStringFields = [
  "id",
  "title",
  "summary",
  "completedDate",
  "recordPath",
  "demoStatus",
  "verificationStatus",
];
const demoStatuses = new Set(["live", "retired", "none"]);
const verificationStatuses = new Set(["verified", "partial", "candidate"]);

// Recursive scan: discover experiment-owned metadata without coupling entries to folders.
async function findCatalogFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nestedFiles = await Promise.all(
    entries.map(async (entry) => {
      const entryPath = path.join(directory, entry.name);
      if (entry.isDirectory()) return findCatalogFiles(entryPath);
      return entry.isFile() && entry.name.endsWith(".catalog.json")
        ? [entryPath]
        : [];
    }),
  );
  return nestedFiles.flat();
}

// Metadata validation: fail the build rather than publish an incomplete or ambiguous catalog.
function validateCatalogEntry(entry, sourcePath) {
  if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
    throw new Error(`${sourcePath}: metadata must be a JSON object`);
  }
  for (const field of requiredStringFields) {
    if (typeof entry[field] !== "string" || entry[field].trim() === "") {
      throw new Error(`${sourcePath}: ${field} must be a non-empty string`);
    }
  }
  if (
    !Array.isArray(entry.tags) ||
    entry.tags.length === 0 ||
    entry.tags.some(
      (tag) =>
        typeof tag !== "string" || tag.trim() === "" || tag !== tag.trim(),
    )
  ) {
    throw new Error(
      `${sourcePath}: tags must be a non-empty array of trimmed, non-empty strings`,
    );
  }
  const normalizedTags = entry.tags.map((tag) =>
    tag.toLocaleLowerCase("en-US"),
  );
  if (new Set(normalizedTags).size !== normalizedTags.length) {
    throw new Error(
      `${sourcePath}: tags must not contain case-insensitive duplicates`,
    );
  }
  if (!demoStatuses.has(entry.demoStatus))
    throw new Error(`${sourcePath}: invalid demoStatus`);
  if (!verificationStatuses.has(entry.verificationStatus))
    throw new Error(`${sourcePath}: invalid verificationStatus`);
  const parsedCompletedDate = new Date(`${entry.completedDate}T00:00:00Z`);
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(entry.completedDate) ||
    Number.isNaN(parsedCompletedDate.valueOf()) ||
    parsedCompletedDate.toISOString().slice(0, 10) !== entry.completedDate
  ) {
    throw new Error(
      `${sourcePath}: completedDate must be a valid YYYY-MM-DD date`,
    );
  }
  if (
    path.isAbsolute(entry.recordPath) ||
    !entry.recordPath.startsWith("experiments/") ||
    !entry.recordPath.endsWith(".md") ||
    entry.recordPath.split("/").includes("..")
  ) {
    throw new Error(
      `${sourcePath}: recordPath must be a repository-relative Experiment Markdown path`,
    );
  }
  if (
    entry.demoStatus === "live" &&
    (typeof entry.demoPath !== "string" || !entry.demoPath.startsWith("/"))
  ) {
    throw new Error(`${sourcePath}: a live demo requires an absolute demoPath`);
  }
  if (entry.demoStatus !== "live" && "demoPath" in entry) {
    throw new Error(`${sourcePath}: demoPath is only valid for a live demo`);
  }
  if (
    "flow" in entry &&
    (typeof entry.flow !== "string" || !entry.flow.trim())
  ) {
    throw new Error(
      `${sourcePath}: flow must be a non-empty string when present`,
    );
  }
}

const catalogFiles = await findCatalogFiles(experimentsDirectory);
const catalog = await Promise.all(
  catalogFiles.map(async (catalogPath) => {
    const relativePath = path.relative(root, catalogPath);
    let entry;
    try {
      entry = JSON.parse(await readFile(catalogPath, "utf8"));
    } catch (error) {
      throw new Error(`${relativePath}: invalid JSON (${error.message})`);
    }
    validateCatalogEntry(entry, relativePath);

    // A valid-looking route is still unusable when its canonical Record was
    // renamed or removed. Keep that broken navigation out of the generated UI.
    const recordFile = path.join(root, entry.recordPath);
    try {
      const recordStats = await stat(recordFile);
      if (!recordStats.isFile()) throw new Error("path is not a file");
    } catch (error) {
      throw new Error(
        `${relativePath}: recordPath does not reference a readable file (${entry.recordPath}: ${error.message})`,
      );
    }
    return entry;
  }),
);

const ids = new Set();
for (const entry of catalog) {
  if (ids.has(entry.id)) throw new Error(`duplicate catalog id: ${entry.id}`);
  ids.add(entry.id);
}

// Completion date is the research chronology; natural ID order breaks same-day ties.
catalog.sort(
  (left, right) =>
    right.completedDate.localeCompare(left.completedDate) ||
    left.id.localeCompare(right.id, "en", { numeric: true }),
);

// Output generation: emit the disposable browser artifact only after every entry is valid.
await mkdir(path.dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(catalog, null, 2)}\n`, "utf8");
console.log(
  `Generated ${path.relative(root, outputPath)} with ${catalog.length} entries.`,
);
