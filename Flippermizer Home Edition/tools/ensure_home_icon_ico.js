const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const HOME_ICON_PNG_REL = path.join("Flippermizer Images", "flippermizericon-Home-Edition-64x64.png");
const HOME_ICON_256_PNG_REL = path.join("build", "home-icon-256.png");
const HOME_ICON_ICO_REL = path.join("build", "home-icon.ico");

function readPngSize(buffer){
  const pngSig = "89504e470d0a1a0a";
  if(!Buffer.isBuffer(buffer) || buffer.length < 24 || buffer.subarray(0, 8).toString("hex") !== pngSig){
    throw new Error("Home Edition icon source is not a PNG file.");
  }
  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20)
  };
}

function findFfmpeg(){
  const candidates = [
    process.env.FFMPEG_PATH,
    "ffmpeg",
    "ffmpeg.exe",
    "C:\\ffmpeg\\bin\\ffmpeg.exe"
  ].filter(Boolean);
  for(const candidate of candidates){
    const probe = spawnSync(candidate, ["-version"], { encoding:"utf8", windowsHide:true });
    if(probe.status === 0) return candidate;
  }
  return "";
}

function runFfmpeg(ffmpeg, args, label){
  const result = spawnSync(ffmpeg, args, { encoding:"utf8", windowsHide:true });
  if(result.status !== 0){
    throw new Error([
      `${label} failed with ffmpeg.`,
      result.stdout,
      result.stderr
    ].filter(Boolean).join("\n"));
  }
}

function ensureHomeIconIco(root){
  const appRoot = root || path.resolve(__dirname, "..");
  const pngPath = path.join(appRoot, HOME_ICON_PNG_REL);
  const scaledPngPath = path.join(appRoot, HOME_ICON_256_PNG_REL);
  const icoPath = path.join(appRoot, HOME_ICON_ICO_REL);
  if(!fs.existsSync(pngPath)) throw new Error(`Home Edition icon source not found: ${pngPath}`);
  const png = fs.readFileSync(pngPath);
  const size = readPngSize(png);
  if(size.width !== 64 || size.height !== 64){
    throw new Error(`Home Edition icon source must be 64x64; got ${size.width}x${size.height}: ${pngPath}`);
  }
  const ffmpeg = findFfmpeg();
  if(!ffmpeg){
    throw new Error("ffmpeg is required to upscale the 64x64 Home Edition PNG into a 256x256 Windows icon.");
  }
  fs.mkdirSync(path.dirname(icoPath), { recursive:true });
  runFfmpeg(ffmpeg, [
    "-hide_banner",
    "-loglevel", "error",
    "-y",
    "-i", pngPath,
    "-vf", "scale=256:256:flags=neighbor,format=rgba",
    scaledPngPath
  ], "Home Edition icon upscale");
  runFfmpeg(ffmpeg, [
    "-hide_banner",
    "-loglevel", "error",
    "-y",
    "-i", scaledPngPath,
    icoPath
  ], "Home Edition ico generation");
  return { pngPath, scaledPngPath, icoPath, width:size.width, height:size.height };
}

if(require.main === module){
  const result = ensureHomeIconIco();
  console.log(`Prepared Home Edition icon: ${path.relative(path.resolve(__dirname, ".."), result.icoPath)}`);
}

module.exports = {
  HOME_ICON_PNG_REL,
  HOME_ICON_256_PNG_REL,
  HOME_ICON_ICO_REL,
  ensureHomeIconIco
};
