import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { rcedit } from "rcedit";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, "..");
const iconPath = path.join(projectRoot, "build", "icon.ico");

const defaultTargets = [
  path.join(projectRoot, "dist", "win-unpacked", "Flippermizer Launcher.exe")
];

const requestedTargets = process.argv.slice(2).map((target) => path.resolve(projectRoot, target));
const targets = requestedTargets.length > 0 ? requestedTargets : defaultTargets;

if (!fs.existsSync(iconPath)) {
  throw new Error(`Launcher icon not found: ${iconPath}`);
}

let stampedCount = 0;
for (const target of targets) {
  if (!fs.existsSync(target)) {
    if (requestedTargets.length > 0) {
      throw new Error(`Launcher executable not found: ${target}`);
    }
    continue;
  }

  if (/Portable\.exe$/i.test(path.basename(target))) {
    console.log(`Skipping portable icon stamp to preserve appended archive: ${path.relative(projectRoot, target)}`);
    continue;
  }

  await rcedit(target, { icon: iconPath });
  stampedCount += 1;
  console.log(`Stamped launcher icon: ${path.relative(projectRoot, target)}`);
}

if (stampedCount === 0) {
  throw new Error("No launcher executables were found to stamp.");
}
