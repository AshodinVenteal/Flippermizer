const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const root = path.resolve(__dirname, "..");
const homeIconSourcePath = path.join(root, "Flippermizer Images", "FM-Icon64x64.png");
const iconPath = path.join(root, "build", "icon.ico");
const rceditPath = path.join(root, "node_modules", "electron-winstaller", "vendor", "rcedit.exe");
const unpackedExe = path.join(root, "dist", "win-unpacked", "Flippermizer Home Edition.exe");

function requireFile(filePath, label){
  if(!fs.existsSync(filePath)){
    throw new Error(`${label} not found: ${filePath}`);
  }
}

requireFile(homeIconSourcePath, "Home Edition icon source");
requireFile(iconPath, "Windows icon");
requireFile(rceditPath, "rcedit");
requireFile(unpackedExe, "Unpacked executable");

const result = spawnSync(rceditPath, [unpackedExe, "--set-icon", iconPath], {
  cwd: root,
  encoding: "utf8"
});

if(result.status !== 0){
  throw new Error([
    `Failed to stamp icon on ${unpackedExe}`,
    result.stdout,
    result.stderr
  ].filter(Boolean).join("\n"));
}

console.log(`Stamped FM icon: ${path.relative(root, unpackedExe)}`);
