#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const flyerDir = path.join(root, "WorldsBanners", "BestiaryFlyers");
const tableRepoPath = path.join(root, "flippermizer_table_repository.js");
const overlayPath = path.join(root, "flippermizer_overlay_tower_v3.html");
const placeholderRe = /placeholder|missing|blank|dummy|sample|temp/i;
const errors = [];

function rel(absPath) {
  return path.relative(root, absPath).replace(/\\/g, "/");
}

function existsRepoRef(ref) {
  return fs.existsSync(path.join(root, ref));
}

function checkRef(ref, owner) {
  const raw = String(ref || "").trim();
  if (!raw) return;
  if (placeholderRe.test(raw)) {
    errors.push(`${owner} points at a placeholder-style flyer ref: ${raw}`);
  }
  if (!existsRepoRef(raw)) {
    errors.push(`${owner} flyer ref does not exist: ${raw}`);
  }
  if (/\.png$/i.test(raw)) {
    const jpg = raw.replace(/\.png$/i, ".jpg");
    if (existsRepoRef(jpg)) {
      errors.push(`${owner} still points at PNG while JPG replacement exists: ${raw} -> ${jpg}`);
    }
  }
}

if (!fs.existsSync(flyerDir)) {
  errors.push(`Missing flyer directory: ${rel(flyerDir)}`);
} else {
  const files = fs.readdirSync(flyerDir, { withFileTypes: true }).filter((entry) => entry.isFile());
  const imageFiles = files.filter((entry) => /\.(?:jpg|jpeg|png)$/i.test(entry.name));
  const byBase = new Map();

  for (const entry of imageFiles) {
    const abs = path.join(flyerDir, entry.name);
    if (placeholderRe.test(entry.name)) {
      errors.push(`Placeholder-style flyer asset is not allowed: ${rel(abs)}`);
    }
    const base = path.basename(entry.name, path.extname(entry.name)).toUpperCase();
    if (!byBase.has(base)) byBase.set(base, new Set());
    byBase.get(base).add(path.extname(entry.name).toLowerCase());
  }

  for (const [base, exts] of byBase.entries()) {
    if ((exts.has(".jpg") || exts.has(".jpeg")) && exts.has(".png")) {
      errors.push(`Duplicate flyer formats for ${base}; keep the sourced JPG and remove the PNG.`);
    }
  }
}

try {
  const repoMod = require(tableRepoPath);
  const tableRepo = repoMod.FLPR_TABLE_REPO || globalThis.FLPR_TABLE_REPO;
  const tables = tableRepo && typeof tableRepo.getAllTables === "function" ? tableRepo.getAllTables() : [];
  for (const table of tables) {
    checkRef(table && table.banner, `table repo ${table?.code || table?.name || "(unknown)"}`);
  }
} catch (err) {
  errors.push(`Unable to inspect table repository flyer refs: ${err?.message || err}`);
}

try {
  const html = fs.readFileSync(overlayPath, "utf8");
  const match = html.match(/const\s+DEFAULT_TABLE_BANNER_REFS_BY_CODE\s*=\s*Object\.freeze\(\{([\s\S]*?)\n\s*\}\);/);
  if (!match) {
    errors.push("Unable to locate DEFAULT_TABLE_BANNER_REFS_BY_CODE in overlay.");
  } else {
    for (const refMatch of match[1].matchAll(/:\s*"([^"]+)"/g)) {
      checkRef(refMatch[1], "overlay default banner map");
    }
  }
} catch (err) {
  errors.push(`Unable to inspect overlay flyer refs: ${err?.message || err}`);
}

if (errors.length) {
  console.error("Flyer asset validation failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("Flyer asset validation passed: real sourced assets only, no duplicate JPG/PNG flyer pairs.");
