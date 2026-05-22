const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");
const { HOME_ICON_PNG_REL, HOME_ICON_ICO_REL, ensureHomeIconIco } = require("./ensure_home_icon_ico");

const root = path.resolve(__dirname, "..");
const homeIconSourcePath = path.join(root, HOME_ICON_PNG_REL);
const iconPath = path.join(root, HOME_ICON_ICO_REL);
const rceditPath = path.join(root, "node_modules", "electron-winstaller", "vendor", "rcedit.exe");
const unpackedExe = path.join(root, "dist", "win-unpacked", "Flippermizer Home Edition.exe");

function requireFile(filePath, label){
  if(!fs.existsSync(filePath)){
    throw new Error(`${label} not found: ${filePath}`);
  }
}

requireFile(homeIconSourcePath, "Home Edition icon source");
ensureHomeIconIco(root);
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
