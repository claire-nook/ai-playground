#!/usr/bin/env node

import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { dirname, join, relative, resolve } from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const sourceDirectory = resolve(root, process.argv[2] ?? "experiments");
const outputFile = resolve(root, process.argv[3] ?? "public/experiment-catalog.json");
const requiredStrings = ["id", "title", "summary", "demoStatus", "verificationStatus"];
const demoStatuses = new Set(["live", "retired", "none"]);
const verificationStatuses = new Set(["verified", "partial", "candidate"]);

async function findMetadata(directory) {
  const found = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) found.push(...await findMetadata(path));
    else if (entry.isFile() && entry.name.endsWith(".catalog.json")) found.push(path);
  }
  return found;
}

function validate(entry, file) {
  const label = relative(root, file);
  if (!entry || Array.isArray(entry) || typeof entry !== "object") throw new Error(`${label}: root must be an object`);
  for (const field of requiredStrings) {
    if (typeof entry[field] !== "string" || !entry[field].trim()) throw new Error(`${label}: ${field} must be a non-empty string`);
  }
  if (!Array.isArray(entry.tags) || entry.tags.length === 0 || entry.tags.some((tag) => typeof tag !== "string" || !tag.trim())) throw new Error(`${label}: tags must be a non-empty array of non-empty strings`);
  const normalizedTags = entry.tags.map((tag) => tag.toLocaleLowerCase("en-US"));
  if (new Set(normalizedTags).size !== normalizedTags.length) throw new Error(`${label}: tags contain a case-insensitive duplicate`);
  if (!demoStatuses.has(entry.demoStatus)) throw new Error(`${label}: invalid demoStatus`);
  if (!verificationStatuses.has(entry.verificationStatus)) throw new Error(`${label}: invalid verificationStatus`);
  if (entry.demoStatus === "live" && (typeof entry.demoPath !== "string" || !entry.demoPath.startsWith("/"))) throw new Error(`${label}: a live demo requires an absolute demoPath`);
  if (entry.demoStatus !== "live" && "demoPath" in entry) throw new Error(`${label}: demoPath is only allowed for a live demo`);
  if ("flow" in entry && (typeof entry.flow !== "string" || !entry.flow.trim())) throw new Error(`${label}: flow must be a non-empty string`);
}

const files = (await findMetadata(sourceDirectory)).sort();
if (files.length === 0) throw new Error(`No *.catalog.json files found under ${sourceDirectory}`);
const entries = [];
const ids = new Map();
for (const file of files) {
  let entry;
  try { entry = JSON.parse(await readFile(file, "utf8")); }
  catch (error) { throw new Error(`${relative(root, file)}: invalid JSON (${error.message})`); }
  validate(entry, file);
  if (ids.has(entry.id)) throw new Error(`Duplicate id ${entry.id}: ${ids.get(entry.id)} and ${relative(root, file)}`);
  ids.set(entry.id, relative(root, file));
  entries.push(entry);
}
entries.sort((a, b) => a.id.localeCompare(b.id, "en", { numeric: true, sensitivity: "base" }));
await mkdir(dirname(outputFile), { recursive: true });
await writeFile(outputFile, `${JSON.stringify(entries, null, 2)}\n`);
console.log(`Built ${entries.length} catalog entries → ${relative(root, outputFile)}`);
