import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const defaultRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const validId = (id) => typeof id === "string" && /^[A-Za-z0-9][A-Za-z0-9-]*$/.test(id);
const withoutFences = (text) => text.replace(/^\s*(`{3,}|~{3,})[^\n]*\n[\s\S]*?^\s*\1\s*$/gm, "");
const safePath = (target) => typeof target === "string" && target.startsWith("experiments/") &&
  target.endsWith(".md") && !target.includes("\\") && !target.split("/").includes("..");

async function filesUnder(directory) {
  const entries = await readdir(directory, { withFileTypes: true }).catch((error) => {
    if (error.code === "ENOENT") return [];
    throw error;
  });
  const files = await Promise.all(entries.map((entry) => {
    const target = path.join(directory, entry.name);
    return entry.isDirectory() ? filesUnder(target) : entry.isFile() ? [target] : [];
  }));
  return files.flat().sort();
}

// No writes, subprocesses, network requests or generated Index. Scope is explicit
// declarations; absence of a declaration never proves an experiment is informal.
export async function checkExperiments(root = defaultRoot) {
  root = path.resolve(root);
  if (!(await stat(root)).isDirectory()) throw new Error("repository root must be a directory");
  const findings = [];
  const add = (level, code, source, message) => findings.push({ level, code, source, message });
  const exists = async (target) => (await stat(path.join(root, target)).catch((error) => {
    if (["ENOENT", "ENOTDIR"].includes(error.code)) return null;
    throw error;
  }))?.isFile() === true;
  const files = await filesUnder(path.join(root, "experiments"));
  const declarations = new Map();
  const records = new Set();
  for (const file of files.filter((file) => file.endsWith(".md"))) {
    const source = path.relative(root, file).split(path.sep).join("/");
    const text = withoutFences(await readFile(file, "utf8"));
    for (const match of text.matchAll(/<!--\s*experiment:\s*([\s\S]*?)-->/g)) {
      let declaration;
      try { declaration = JSON.parse(match[1]); }
      catch { add("ERROR", "INVALID_DECLARATION", source, "experiment comment must contain valid JSON"); continue; }
      if (!declaration || !validId(declaration.id) ||
          !["required", "none", "unknown"].includes(declaration.card) ||
          !["required", "unknown"].includes(declaration.index) ||
          (declaration.indexId !== undefined && !validId(declaration.indexId))) {
        add("ERROR", "INVALID_DECLARATION", source, "expected id, card=required|none|unknown, index=required|unknown, optional indexId");
        continue;
      }
      records.add(source);
      if (declarations.has(declaration.id)) add("ERROR", "DUPLICATE_ID", source, `${declaration.id} already declared in ${declarations.get(declaration.id).recordPath}`);
      else declarations.set(declaration.id, { ...declaration, recordPath: source });
    }
  }

  const catalogs = new Map();
  const metadataPaths = new Set();
  for (const file of files.filter((file) => file.endsWith(".catalog.json"))) {
    const source = path.relative(root, file).split(path.sep).join("/");
    let entry;
    try { entry = JSON.parse(await readFile(file, "utf8")); }
    catch { add("ERROR", "INVALID_CATALOG", source, "invalid JSON"); continue; }
    if (!entry || typeof entry !== "object" || Array.isArray(entry) || !validId(entry.id)) {
      add("ERROR", "INVALID_CATALOG", source, "catalog requires a valid ID"); continue;
    }
    if ((entry.outputType ?? "experiment") !== "experiment") continue;
    metadataPaths.add(source);
    if (catalogs.has(entry.id)) add("ERROR", "DUPLICATE_CATALOG_ID", source, entry.id);
    else catalogs.set(entry.id, entry);
    if (!safePath(entry.recordPath) || !await exists(entry.recordPath)) {
      add("ERROR", "MISSING_RECORD", source, `${entry.id}: invalid or missing recordPath ${entry.recordPath}`);
      continue;
    }
    const declaration = declarations.get(entry.id);
    if (!declaration) add("WARN", "LEGACY_CATALOG_ID", source, `${entry.id}: no Record declaration; identity currently inferred from existing catalog`);
    else if (declaration.recordPath !== entry.recordPath) add("ERROR", "RECORD_MISMATCH", source, `${entry.id}: declaration is in ${declaration.recordPath}, catalog targets ${entry.recordPath}`);
    else if (declaration.card === "none") add("ERROR", "CARD_INTENT_MISMATCH", source, `${entry.id}: Record explicitly requests no standalone card`);
    if (records.has(entry.recordPath) && !declaration) add("ERROR", "ORPHAN_CATALOG_ID", source, `${entry.id}: target Record declares other IDs, but not this ID`);
  }

  // Only identity-bearing primary targets / metadata belong to this checker.
  // Ordinary supporting links in the human Index are not experiment registrations.
  const primaryTargets = new Set([...declarations.values(), ...catalogs.values()]
    .map((entry) => entry.recordPath).filter(safePath));
  const indexPath = "knowledge/experiments.md";
  const indexText = await readFile(path.join(root, indexPath), "utf8").catch((error) => {
    if (error.code === "ENOENT") { add("WARN", "MISSING_INDEX_FILE", indexPath, "human index absent"); return ""; }
    throw error;
  });
  const indexEntries = new Map();
  let headingId;
  for (const line of withoutFences(indexText).split("\n")) {
    if (/^#{1,6}\s/.test(line)) {
      headingId = /^###\s+`?([A-Za-z0-9][A-Za-z0-9-]*)`?\s+[—–-]\s/.exec(line)?.[1];
      if (headingId) {
        if (indexEntries.has(headingId)) add("ERROR", "DUPLICATE_INDEX_ID", indexPath, headingId);
        else indexEntries.set(headingId, new Set());
      }
    }
    for (const match of line.matchAll(/\[[^\]]*\]\(([^\s)]+)(?:\s+"[^"]*")?\)/g)) {
      let target;
      try {
        const url = new URL(match[1], "https://repository.invalid/knowledge/experiments.md");
        if (url.origin === "https://repository.invalid") target = decodeURIComponent(url.pathname.slice(1));
        else {
          const prefix = "https://github.com/claire-nook/ai-playground/blob/main/";
          if (url.href.startsWith(prefix)) target = decodeURIComponent(url.pathname.slice(new URL(prefix).pathname.length));
        }
      } catch { continue; }
      if (!target?.startsWith("experiments/")) continue;
      if (headingId) indexEntries.get(headingId)?.add(target);
      if ((primaryTargets.has(target) || metadataPaths.has(target)) && !await exists(target)) {
        add("ERROR", "ORPHAN_INDEX_REFERENCE", indexPath, target);
      }
    }
  }
  for (const [id, declaration] of declarations) {
    const source = declaration.recordPath;
    if (declaration.card === "required" && !catalogs.has(id)) add("ERROR", "MISSING_CATALOG", source, `${id}: card explicitly required, metadata absent`);
    if (declaration.card === "unknown") add("WARN", "UNKNOWN_CARD_INTENT", source, id);
    if (declaration.index === "required") {
      const indexId = declaration.indexId ?? id;
      if (!indexEntries.get(indexId)?.has(source)) add("ERROR", "MISSING_INDEX_ENTRY", source, `${id}: expected ${indexId} heading with explicit primary Record link`);
      if (declaration.indexId && !declarations.has(indexId) && !catalogs.has(indexId)) add("ERROR", "ORPHAN_INDEX_PARENT", source, `${id}: unknown parent identity ${indexId}`);
    } else add("WARN", "UNKNOWN_INDEX_INTENT", source, `${id}: historical registration intent not declared`);
  }
  for (const [id, targets] of indexEntries) {
    if (!declarations.has(id) && !catalogs.has(id)) add("WARN", "UNKNOWN_INDEX_ID", indexPath, `${id}: no declared identity or legacy catalog`);
    const record = declarations.get(id)?.recordPath ?? catalogs.get(id)?.recordPath;
    if (record && !targets.has(record)) add("ERROR", "INDEX_RECORD_MISMATCH", indexPath, `${id}: heading does not link to primary Record ${record}`);
  }
  findings.sort((a, b) => `${a.level}:${a.code}:${a.source}`.localeCompare(`${b.level}:${b.code}:${b.source}`));
  return { declarations: declarations.size, catalogs: catalogs.size, findings,
    errors: findings.filter((item) => item.level === "ERROR").length,
    warnings: findings.filter((item) => item.level === "WARN").length };
}

export async function runCli(args, output = console.log, errorOutput = console.error) {
  if (args.length && !(args.length === 2 && args[0] === "--root")) {
    errorOutput("Usage: node scripts/check-experiment-integrity.mjs [--root <repository>]");
    return 2;
  }
  try {
    const result = await checkExperiments(args.length ? args[1] : defaultRoot);
    for (const item of result.findings) output(`${item.level} ${item.code} ${item.source}: ${item.message}`);
    output(`Checked ${result.declarations} declared IDs / ${result.catalogs} experiment catalogs: ${result.errors} ERROR, ${result.warnings} WARN`);
    return result.errors ? 1 : 0;
  } catch (error) { errorOutput(error.message); return 2; }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exitCode = await runCli(process.argv.slice(2));
}
