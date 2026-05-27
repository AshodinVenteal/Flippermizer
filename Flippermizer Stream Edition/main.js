const path = require("path");
const fs = require("fs");
const http = require("http");
const crypto = require("crypto");
const { spawn } = require("child_process");
const { pathToFileURL } = require("url");
const { app, BrowserWindow, ipcMain, shell, dialog, screen } = require("electron");

const APP_TITLE = "Flippermizer Launcher";
const DEFAULT_WINDOW_MARGIN = 28;
const GRAPHICS_MODE_DEFAULT = "vulkan";
const KEEP_BACKGROUND_PAINTING = process.env.FLPR_KEEP_BACKGROUND_PAINTING === "1";
const GRAPHICS_MODE_LABELS = Object.freeze({
  vulkan: "Vulkan / ANGLE",
  default_gpu: "Auto / Direct3D",
  software_fallback: "Software Fallback"
});
const DEFAULT_RENDERER_SETTINGS = Object.freeze({
  hardwareAcceleration: true,
  renderer: "vulkan"
});
const DEV_TOOLS_PASSWORD_SHA256 = "b4d45f95e133a7e9b0cdb9b3eb31240b0c501561aea9d5b2d3e332877c874c41";

function appendUniqueSwitchValue(switchName, nextValue) {
  const cleanValue = String(nextValue || "").trim();
  if (!cleanValue) return;
  const existing = app.commandLine.getSwitchValue(switchName);
  const values = existing
    ? existing.split(",").map((value) => value.trim()).filter(Boolean)
    : [];
  if (!values.includes(cleanValue)) values.push(cleanValue);
  app.commandLine.appendSwitch(switchName, values.join(","));
}

function applyWindowCompositorStabilityFlags() {
  if (!KEEP_BACKGROUND_PAINTING) return;
  if (process.platform !== "win32") return;
  app.commandLine.appendSwitch("disable-backgrounding-occluded-windows");
  app.commandLine.appendSwitch("disable-background-timer-throttling");
  app.commandLine.appendSwitch("disable-renderer-backgrounding");
  appendUniqueSwitchValue("disable-features", "CalculateNativeWinOcclusion");
}

function getSettingsPath() {
  try {
    return path.join(app.getPath("userData"), "launcher-settings.json");
  } catch (_) {
    return path.join(__dirname, "launcher-settings.json");
  }
}

function getMusicStatePath() {
  try {
    return path.join(app.getPath("userData"), "launcher-music-state.json");
  } catch (_) {
    return path.join(__dirname, "launcher-music-state.json");
  }
}

function getTaskRepositoryUserCfgPath() {
  try {
    return path.join(app.getPath("userData"), "flippermizer-task-repository-cfg.json");
  } catch (_) {
    return path.join(__dirname, "flippermizer-task-repository-cfg.json");
  }
}

function getMusicStorageDir() {
  try {
    return path.join(app.getPath("userData"), "music");
  } catch (_) {
    return path.join(__dirname, "music");
  }
}

function loadLauncherSettings() {
  try {
    const raw = fs.readFileSync(getSettingsPath(), "utf8");
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch (_) {
    return {};
  }
}

function sanitizeGraphicsMode(value) {
  return Object.prototype.hasOwnProperty.call(GRAPHICS_MODE_LABELS, value)
    ? value
    : GRAPHICS_MODE_DEFAULT;
}

function normalizeRendererSettings(value) {
  const raw = value && typeof value === "object" ? value : {};
  const renderer = String(raw.renderer || DEFAULT_RENDERER_SETTINGS.renderer).toLowerCase() === "default"
    ? "default"
    : "vulkan";
  return {
    hardwareAcceleration: raw.hardwareAcceleration !== false,
    renderer
  };
}

function rendererGraphicsMode(settings) {
  const cfg = normalizeRendererSettings(settings);
  if (cfg.hardwareAcceleration === false) return "software_fallback";
  return cfg.renderer === "default" ? "default_gpu" : "vulkan";
}

function rendererSettingsFromGraphicsMode(mode, fallbackSettings) {
  const selected = sanitizeGraphicsMode(String(mode || ""));
  if (selected === "software_fallback") {
    const fallback = normalizeRendererSettings(fallbackSettings || DEFAULT_RENDERER_SETTINGS);
    return { ...fallback, hardwareAcceleration: false };
  }
  if (selected === "default_gpu") {
    return { hardwareAcceleration: true, renderer: "default" };
  }
  return { ...DEFAULT_RENDERER_SETTINGS };
}

function readRendererSettingsFromLauncherSettings(settings) {
  const raw = settings && typeof settings === "object" ? settings : {};
  if (raw.rendererSettings && typeof raw.rendererSettings === "object") {
    return normalizeRendererSettings(raw.rendererSettings);
  }
  if (Object.prototype.hasOwnProperty.call(raw, "hardwareAcceleration") || Object.prototype.hasOwnProperty.call(raw, "renderer")) {
    return normalizeRendererSettings(raw);
  }
  if (raw.graphicsMode === "software_fallback" || raw.graphicsMode === "default_gpu") {
    return rendererSettingsFromGraphicsMode(raw.graphicsMode, DEFAULT_RENDERER_SETTINGS);
  }
  return { ...DEFAULT_RENDERER_SETTINGS };
}

function saveLauncherSettings(nextSettings) {
  const merged = Object.assign({}, loadLauncherSettings(), nextSettings || {});
  fs.mkdirSync(path.dirname(getSettingsPath()), { recursive: true });
  fs.writeFileSync(getSettingsPath(), JSON.stringify(merged, null, 2), "utf8");
  return merged;
}

function saveRendererSettings(settings) {
  const next = normalizeRendererSettings(settings);
  saveLauncherSettings({
    rendererSettings: next,
    graphicsMode: rendererGraphicsMode(next)
  });
  return next;
}

function loadLauncherMusicState() {
  try {
    const raw = fs.readFileSync(getMusicStatePath(), "utf8");
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch (_) {
    return {};
  }
}

function sanitizeMusicSnapshot(snapshot) {
  const src = snapshot && typeof snapshot === "object" ? snapshot : {};
  const cloneRecord = (value) => {
    if (!value || typeof value !== "object" || Array.isArray(value)) return {};
    return Object.fromEntries(Object.entries(value).map(([key, entry]) => [String(key), entry]));
  };
  return {
    refs: cloneRecord(src.refs),
    meta: cloneRecord(src.meta),
    modes: cloneRecord(src.modes),
    volumes: cloneRecord(src.volumes),
    savedAt: new Date().toISOString()
  };
}

function saveLauncherMusicState(snapshot) {
  const next = sanitizeMusicSnapshot(snapshot || {});
  fs.mkdirSync(path.dirname(getMusicStatePath()), { recursive: true });
  fs.writeFileSync(getMusicStatePath(), JSON.stringify(next, null, 2), "utf8");
  return next;
}

function sanitizeMusicScenario(value) {
  const safe = String(value || "").trim().toLowerCase().replace(/[^a-z0-9_-]+/g, "_").replace(/^_+|_+$/g, "");
  return safe || "music";
}

function getSafeMusicExtension(fileName, mimeType) {
  const fromName = path.extname(String(fileName || "")).toLowerCase();
  if ([".mp3", ".wav", ".ogg", ".m4a", ".aac", ".flac"].includes(fromName)) return fromName;
  const mime = String(mimeType || "").toLowerCase();
  if (mime.includes("wav")) return ".wav";
  if (mime.includes("ogg")) return ".ogg";
  if (mime.includes("mp4") || mime.includes("m4a") || mime.includes("aac")) return ".m4a";
  if (mime.includes("flac")) return ".flac";
  return ".mp3";
}

function bytesToBuffer(bytes) {
  if (Buffer.isBuffer(bytes)) return bytes;
  if (bytes instanceof ArrayBuffer) return Buffer.from(new Uint8Array(bytes));
  if (ArrayBuffer.isView(bytes)) return Buffer.from(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  if (bytes && Array.isArray(bytes.data)) return Buffer.from(bytes.data);
  return Buffer.alloc(0);
}

function applyRendererLaunchSettings(settings) {
  const cfg = normalizeRendererSettings(settings);
  if (cfg.hardwareAcceleration === false) {
    app.disableHardwareAcceleration();
    app.commandLine.appendSwitch("disable-gpu");
    return rendererGraphicsMode(cfg);
  }
  if (cfg.renderer === "vulkan") {
    app.commandLine.appendSwitch("ignore-gpu-blocklist");
    app.commandLine.appendSwitch("use-angle", "vulkan");
    app.commandLine.appendSwitch("enable-features", "Vulkan");
  }
  return rendererGraphicsMode(cfg);
}

applyWindowCompositorStabilityFlags();

const launcherSettings = loadLauncherSettings();
const rendererSettingsAtLaunch = readRendererSettingsFromLauncherSettings(launcherSettings);
const activeGraphicsMode = applyRendererLaunchSettings(rendererSettingsAtLaunch);

const PAGE_MAP = Object.freeze({
  overlay: {
    kind: "overlay",
    file: "flippermizer_overlay_tower_v3.html",
    title: "Flippermizer! Pinball Randomized!",
    summary: "Live randomizer HUD with Tower, Overview, Checks, boss flow, and control tabs.",
    width: 1820,
    height: 1120,
    minWidth: 1180,
    minHeight: 760,
    designWidth: 2544,
    designHeight: 1482
  },
  bestiary: {
    kind: "bestiary",
    file: "flippermizer_table_repository_library.html",
    title: "Flippermizer Bestiary",
    summary: "Repository browser for table flyers, designer credits, progress, and achievements.",
    width: 1640,
    height: 1040,
    minWidth: 980,
    minHeight: 720,
    designWidth: 2040,
    designHeight: 1040
  },
  options: {
    kind: "options",
    file: "html-option-generators/flippermizer-player-options.html",
    title: "Flippermizer AP Options",
    summary: "Build a Base Game YAML with world selection, starts, boss keys, and score display settings.",
    width: 1420,
    height: 980,
    minWidth: 900,
    minHeight: 700,
    designWidth: 1280,
    designHeight: 980
  }
});

const TUTORIAL_STEPS = Object.freeze({
  overlay: [
    {
      title: "Capture Area",
      body: "This is the stream-facing randomizer display. Tower, overview, checks, boss state, and rewards all live in the capture column.",
      selector: ".capture"
    },
    {
      title: "Header and World State",
      body: "The header reflects the active world, table focus, and top-level run context while you move through the seed.",
      selector: ".header"
    },
    {
      title: "Control Tabs",
      body: "Connection, visuals, utility controls, and achievements stay in the right-side control stack so the stream scene can crop them out when needed.",
      selector: ".controls"
    }
  ],
  bestiary: [
    {
      title: "Repository Header",
      body: "The Bestiary header summarizes what this page tracks: table records, designer profiles, and long-term run progress.",
      selector: ".repoHd"
    },
    {
      title: "Index Column",
      body: "Use the left index to jump between tables and featured designers without losing your place in the current page.",
      selector: ".indexCol"
    },
    {
      title: "Book Page",
      body: "The main book frame combines flyer art, table metadata, and achievement or run-history details for the selected entry.",
      selector: ".bookCol"
    }
  ],
  options: [
    {
      title: "Core AP Options",
      body: "Start here for player name, progression balancing, accessibility, and the options Archipelago expects on every file.",
      selector: ".grid .card:first-of-type"
    },
    {
      title: "Base Game World Options",
      body: "These controls shape the seed itself: world selection mode, active table count, starting opens, and Featured Designer limits.",
      selector: "#metasizerOptionsWrap"
    },
    {
      title: "Generated YAML",
      body: "The export block is the final player file. Copy or download from here once the run settings look right.",
      selector: ".card.yaml"
    }
  ]
});

function isPackagedApp() {
  return app.isPackaged;
}

function getDevRoot() {
  return path.resolve(__dirname, "..");
}

function getLauncherRoot() {
  return __dirname;
}

function getWorkspaceRoot() {
  if (!isPackagedApp()) return getDevRoot();
  return path.resolve(process.resourcesPath, "..", "..", "..", "..");
}

function getAssetRoot() {
  if (isPackagedApp()) return path.join(process.resourcesPath, "app-assets");
  const localAssets = path.join(getLauncherRoot(), "app-assets");
  if (fs.existsSync(localAssets)) return localAssets;
  return getDevRoot();
}

function getTaskRepositoryCfgPath() {
  return path.join(getAssetRoot(), "flippermizer_task_repository_cfg.js");
}

function getFlprBotPath() {
  const candidates = [
    path.join(getWorkspaceRoot(), "FLPR-Bot", "dist", "FLPR-Bot.exe"),
    path.join(getWorkspaceRoot(), "FLPR-Bot", "dist", "flpr-bot.exe"),
    path.join(getDevRoot(), "FLPR-Bot", "dist", "FLPR-Bot.exe"),
    path.join(getDevRoot(), "FLPR-Bot", "dist", "flpr-bot.exe")
  ];
  return candidates.find((candidate) => fs.existsSync(candidate)) || candidates[0];
}

function getApworldPath() {
  if (isPackagedApp()) {
    return path.join(
      process.resourcesPath,
      "apworld",
      "manual_flippermizerworldsofpinball_base_game.apworld"
    );
  }
  const localApworld = path.join(
    getLauncherRoot(),
    "apworld",
    "manual_flippermizerworldsofpinball_base_game.apworld"
  );
  if (fs.existsSync(localApworld)) return localApworld;
  return path.join(
    getDevRoot(),
    "manual_flippermizerworldsofpinball_base_game.apworld"
  );
}

function getLogoPath() {
  return path.join(getAssetRoot(), "Flippermizer Images", "FlippermizerLogo.png");
}

function getLauncherIconPath() {
  const iconPath = isPackagedApp()
    ? path.join(process.resourcesPath, "icon.ico")
    : path.join(__dirname, "build", "icon.ico");
  return fs.existsSync(iconPath) ? iconPath : null;
}

let staticServerPromise = null;
let staticServerInfo = null;
const contentWindows = new Map();
let flprBotProcess = null;
const STATIC_SERVER_HOST = "127.0.0.1";
const STATIC_SERVER_PORT = 17375;
const STATIC_SERVER_PORT_ATTEMPTS = 12;
function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return {
    ".html": "text/html; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
    ".svg": "image/svg+xml",
    ".mp3": "audio/mpeg",
    ".wav": "audio/wav",
    ".ogg": "audio/ogg",
    ".m4a": "audio/mp4",
    ".aac": "audio/aac",
    ".flac": "audio/flac",
    ".webp": "image/webp"
  }[ext] || "application/octet-stream";
}

function getPreferredStaticServerPort() {
  const raw = Number(process.env.FLPR_LAUNCHER_PORT || STATIC_SERVER_PORT);
  return Number.isFinite(raw) && raw >= 0 ? Math.round(raw) : STATIC_SERVER_PORT;
}

function ensureStaticServer() {
  if (staticServerInfo) return Promise.resolve(staticServerInfo);
  if (staticServerPromise) return staticServerPromise;
  staticServerPromise = new Promise((resolve, reject) => {
    const root = getAssetRoot();
    const server = http.createServer((req, res) => {
      try {
        const rawUrl = new URL(req.url || "/", "http://127.0.0.1");
        const rel = decodeURIComponent(rawUrl.pathname || "/").replace(/^\/+/, "") || "launcher.html";
        if (rel.startsWith("__flpr_user_music/")) {
          const musicRel = rel.slice("__flpr_user_music/".length);
          const musicRoot = getMusicStorageDir();
          const musicPath = path.resolve(musicRoot, musicRel);
          if (musicPath !== musicRoot && !musicPath.startsWith(musicRoot + path.sep)) {
            res.writeHead(403);
            res.end("Forbidden");
            return;
          }
          fs.stat(musicPath, (statErr, stat) => {
            if (statErr || !stat || !stat.isFile()) {
              res.writeHead(404);
              res.end("Not found");
              return;
            }
            res.writeHead(200, {
              "Content-Type": getMimeType(musicPath),
              "Cache-Control": "no-store"
            });
            fs.createReadStream(musicPath).pipe(res);
          });
          return;
        }
        const resolved = path.resolve(root, rel);
        if (resolved !== root && !resolved.startsWith(root + path.sep)) {
          res.writeHead(403);
          res.end("Forbidden");
          return;
        }
        fs.stat(resolved, (statErr, stat) => {
          if (statErr || !stat || !stat.isFile()) {
            res.writeHead(404);
            res.end("Not found");
            return;
          }
          res.writeHead(200, {
            "Content-Type": getMimeType(resolved),
            "Cache-Control": "no-store"
          });
          fs.createReadStream(resolved).pipe(res);
        });
      } catch (err) {
        res.writeHead(500);
        res.end(String(err && err.message ? err.message : err));
      }
    });
    const listen = (port, attemptsLeft) => {
      const onError = (err) => {
        server.removeListener("listening", onListening);
        if (err && err.code === "EADDRINUSE" && attemptsLeft > 0) {
          setTimeout(() => listen(port + 1, attemptsLeft - 1), 0);
          return;
        }
        if (err && err.code === "EADDRINUSE" && port !== 0) {
          setTimeout(() => listen(0, 0), 0);
          return;
        }
        reject(err);
      };
      const onListening = () => {
        server.removeListener("error", onError);
        const address = server.address();
        staticServerInfo = {
          server,
          port: Number(address && address.port) || 0,
          baseUrl: `http://${STATIC_SERVER_HOST}:${Number(address && address.port) || 0}`
        };
        resolve(staticServerInfo);
      };
      server.once("error", onError);
      server.once("listening", onListening);
      server.listen(port, STATIC_SERVER_HOST);
    };
    listen(getPreferredStaticServerPort(), STATIC_SERVER_PORT_ATTEMPTS);
  });
  return staticServerPromise;
}

function clamp(value, min, max) {
  if (max < min) return max;
  return Math.max(min, Math.min(max, value));
}

function resolveDisplayForConfig(config) {
  const primary = screen.getPrimaryDisplay();
  const workArea = primary?.workAreaSize || { width: config.width, height: config.height };
  return {
    width: Math.max(800, workArea.width),
    height: Math.max(600, workArea.height)
  };
}

function getContentWindowBounds(config) {
  const display = resolveDisplayForConfig(config);
  const maxWidth = Math.max(820, display.width - DEFAULT_WINDOW_MARGIN);
  const maxHeight = Math.max(620, display.height - DEFAULT_WINDOW_MARGIN);
  return {
    width: clamp(Math.round(maxWidth * 0.96), Math.min(config.minWidth, maxWidth), maxWidth),
    height: clamp(Math.round(maxHeight * 0.96), Math.min(config.minHeight, maxHeight), maxHeight)
  };
}

function getContentWindowStateKey(config) {
  return String(config?.kind || config?.file || "window");
}

function getSavedContentWindowState(config) {
  try {
    const key = getContentWindowStateKey(config);
    const states = loadLauncherSettings().contentWindowBounds;
    const saved = states && typeof states === "object" ? states[key] : null;
    return saved && typeof saved === "object" ? saved : null;
  } catch (_) {
    return null;
  }
}

function sanitizeContentWindowBounds(config, savedState) {
  const fallback = getContentWindowBounds(config);
  const saved = savedState && typeof savedState === "object" ? savedState : {};
  const primary = screen.getPrimaryDisplay();
  const displays = screen.getAllDisplays();
  const minWidth = Math.max(720, Math.min(config.minWidth || config.width, fallback.width));
  const minHeight = Math.max(540, Math.min(config.minHeight || config.height, fallback.height));
  const displayForSaved = Number.isFinite(Number(saved.x)) && Number.isFinite(Number(saved.y))
    ? screen.getDisplayMatching({
        x: Math.round(Number(saved.x)),
        y: Math.round(Number(saved.y)),
        width: Math.max(1, Math.round(Number(saved.width) || fallback.width)),
        height: Math.max(1, Math.round(Number(saved.height) || fallback.height))
      })
    : primary;
  const workArea = displayForSaved?.workArea || primary?.workArea || {
    x: 0,
    y: 0,
    width: fallback.width + DEFAULT_WINDOW_MARGIN,
    height: fallback.height + DEFAULT_WINDOW_MARGIN
  };
  const maxWidth = Math.max(minWidth, workArea.width - DEFAULT_WINDOW_MARGIN);
  const maxHeight = Math.max(minHeight, workArea.height - DEFAULT_WINDOW_MARGIN);
  const width = clamp(Math.round(Number(saved.width) || fallback.width), Math.min(minWidth, maxWidth), maxWidth);
  const height = clamp(Math.round(Number(saved.height) || fallback.height), Math.min(minHeight, maxHeight), maxHeight);
  let x = Number.isFinite(Number(saved.x)) ? Math.round(Number(saved.x)) : undefined;
  let y = Number.isFinite(Number(saved.y)) ? Math.round(Number(saved.y)) : undefined;

  if (Number.isFinite(x) && Number.isFinite(y)) {
    const candidate = { x, y, width, height };
    const visible = displays.some((display) => {
      const area = display.workArea || display.bounds;
      const overlapX = Math.min(candidate.x + candidate.width, area.x + area.width) - Math.max(candidate.x, area.x);
      const overlapY = Math.min(candidate.y + candidate.height, area.y + area.height) - Math.max(candidate.y, area.y);
      return overlapX >= 80 && overlapY >= 80;
    });
    if (!visible) {
      x = undefined;
      y = undefined;
    }
  }

  if (Number.isFinite(x) && Number.isFinite(y)) {
    x = clamp(x, workArea.x, Math.max(workArea.x, workArea.x + workArea.width - width));
    y = clamp(y, workArea.y, Math.max(workArea.y, workArea.y + workArea.height - height));
    return { x, y, width, height };
  }

  return { width, height };
}

function makeWindowOptions(config, bounds) {
  const iconPath = getLauncherIconPath();
  return {
    title: config.title,
    ...(Number.isFinite(bounds.x) && Number.isFinite(bounds.y) ? { x: bounds.x, y: bounds.y } : {}),
    ...(iconPath ? { icon: iconPath } : {}),
    width: bounds.width,
    height: bounds.height,
    minWidth: Math.max(720, Math.min(config.minWidth || config.width, bounds.width)),
    minHeight: Math.max(540, Math.min(config.minHeight || config.height, bounds.height)),
    backgroundColor: "#0c1117",
    autoHideMenuBar: true,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      backgroundThrottling: !KEEP_BACKGROUND_PAINTING
    }
  };
}

function keepWindowPaintingOnFocusChanges(win) {
  if (!KEEP_BACKGROUND_PAINTING) return;
  if (!win || win.isDestroyed()) return;
  try {
    win.webContents.setBackgroundThrottling(false);
  } catch (_) {}
  let repaintTimer = null;
  const repaint = () => {
    if (!win || win.isDestroyed()) return;
    try {
      win.webContents.invalidate();
    } catch (_) {}
  };
  const queueRepaint = () => {
    repaint();
    clearTimeout(repaintTimer);
    repaintTimer = setTimeout(repaint, 180);
  };
  // NVIDIA driver overrides can briefly black-flash Electron when focus/blur
  // handlers force an explicit repaint, so keep this to visibility restores.
  win.on("show", queueRepaint);
  win.on("restore", queueRepaint);
  win.on("close", () => clearTimeout(repaintTimer));
}

function saveContentWindowState(config, win) {
  try {
    if (!config || !win || win.isDestroyed()) return;
    const key = getContentWindowStateKey(config);
    const bounds = win.isMaximized() ? win.getNormalBounds() : win.getBounds();
    if (!bounds || bounds.width < 200 || bounds.height < 160) return;
    const settings = loadLauncherSettings();
    const contentWindowBounds = Object.assign({}, settings.contentWindowBounds || {});
    contentWindowBounds[key] = {
      x: Math.round(bounds.x),
      y: Math.round(bounds.y),
      width: Math.round(bounds.width),
      height: Math.round(bounds.height),
      maximized: !!win.isMaximized()
    };
    saveLauncherSettings({ contentWindowBounds });
  } catch (_) {}
}

function rememberContentWindowState(config, win) {
  let timer = null;
  const queueSave = () => {
    clearTimeout(timer);
    timer = setTimeout(() => saveContentWindowState(config, win), 220);
  };
  win.on("resize", queueSave);
  win.on("move", queueSave);
  win.on("maximize", queueSave);
  win.on("unmaximize", queueSave);
  win.on("close", () => {
    clearTimeout(timer);
    saveContentWindowState(config, win);
  });
}

function fitContentWindow(win, config) {
  if (!win || win.isDestroyed()) return;
  const display = screen.getDisplayMatching(win.getBounds());
  const workArea = display?.workAreaSize || { width: config.width, height: config.height };
  const usableWidth = Math.max(640, workArea.width - DEFAULT_WINDOW_MARGIN);
  const usableHeight = Math.max(520, workArea.height - DEFAULT_WINDOW_MARGIN);
  const widthRatio = usableWidth / Math.max(1, config.designWidth || usableWidth);
  const heightRatio = usableHeight / Math.max(1, config.designHeight || usableHeight);
  const zoomFactor = clamp(Math.min(widthRatio, heightRatio), 0.55, 1.6);
  try {
    win.webContents.setZoomFactor(zoomFactor);
  } catch (_) {}
}

function buildTutorialInjection(kind) {
  const steps = Array.isArray(TUTORIAL_STEPS[kind]) ? TUTORIAL_STEPS[kind] : [];
  if (!steps.length) return "";
  return `
    (() => {
      const tutorialKey = "__flprLauncherTutorial";
      try{
        if(window[tutorialKey] && typeof window[tutorialKey].destroy === "function"){
          window[tutorialKey].destroy();
        }
      }catch(_){}
      const steps = ${JSON.stringify(steps)};
      const styleId = "flprLauncherTutorialStyle";
      const rootId = "flprLauncherTutorialRoot";
      const existingRoot = document.getElementById(rootId);
      if(existingRoot) existingRoot.remove();
      if(!document.getElementById(styleId)){
        const style = document.createElement("style");
        style.id = styleId;
        style.textContent = \`
          #\${rootId}{
            position:fixed;
            right:18px;
            top:18px;
            width:min(420px, calc(100vw - 36px));
            max-height:calc(100vh - 36px);
            overflow:auto;
            z-index:2147483646;
            border:1px solid rgba(0,217,255,.42);
            border-radius:18px;
            background:linear-gradient(180deg, rgba(6,18,30,.96), rgba(3,10,18,.96));
            color:#e9fbff;
            box-shadow:0 22px 60px rgba(0,0,0,.45);
            font-family:Segoe UI, Tahoma, sans-serif;
          }
          #\${rootId} *{ box-sizing:border-box; }
          #\${rootId} .hd{
            padding:16px 18px 12px;
            border-bottom:1px solid rgba(0,217,255,.22);
          }
          #\${rootId} .eyebrow{
            font-size:11px;
            letter-spacing:.16em;
            text-transform:uppercase;
            color:#7ddfff;
            margin-bottom:8px;
          }
          #\${rootId} .title{
            font-size:22px;
            font-weight:700;
            line-height:1.2;
          }
          #\${rootId} .lede{
            margin-top:10px;
            color:#a8cfe0;
            font-size:13px;
            line-height:1.5;
          }
          #\${rootId} .body{
            padding:14px 18px 18px;
            display:flex;
            flex-direction:column;
            gap:12px;
          }
          #\${rootId} .stepBtn{
            width:100%;
            text-align:left;
            border:1px solid rgba(0,217,255,.22);
            border-radius:14px;
            background:rgba(8,21,34,.84);
            color:#e9fbff;
            padding:12px 14px;
            cursor:pointer;
          }
          #\${rootId} .stepBtn.active{
            border-color:rgba(34,255,136,.72);
            box-shadow:0 0 0 1px rgba(34,255,136,.24);
          }
          #\${rootId} .stepTitle{
            display:block;
            font-size:14px;
            font-weight:700;
            line-height:1.35;
          }
          #\${rootId} .stepBody{
            display:block;
            margin-top:8px;
            color:#a8cfe0;
            font-size:12px;
            line-height:1.5;
          }
          #\${rootId} .actions{
            display:flex;
            justify-content:space-between;
            gap:10px;
            margin-top:4px;
          }
          #\${rootId} .miniBtn{
            border:1px solid rgba(0,217,255,.3);
            border-radius:10px;
            background:rgba(10,24,39,.9);
            color:#e9fbff;
            padding:10px 12px;
            cursor:pointer;
            font-size:12px;
            font-weight:600;
          }
          #\${rootId} .miniBtn.primary{
            border-color:rgba(34,255,136,.45);
          }
          #flprLauncherTutorialHighlight{
            position:fixed;
            z-index:2147483645;
            border:2px solid rgba(34,255,136,.92);
            border-radius:18px;
            box-shadow:0 0 0 9999px rgba(2,8,16,.52), 0 0 26px rgba(34,255,136,.28);
            pointer-events:none;
            transition:all 160ms ease;
          }
          @media (max-width: 720px){
            #\${rootId}{
              left:12px;
              right:12px;
              top:auto;
              bottom:12px;
              width:auto;
              max-height:52vh;
            }
          }
        \`;
        document.head.appendChild(style);
      }
      const root = document.createElement("aside");
      root.id = rootId;
      root.innerHTML = \`
        <div class="hd">
          <div class="eyebrow">Guided Tour</div>
          <div class="title">Flippermizer Walkthrough</div>
          <div class="lede">Use this quick tour to learn the main blocks on the page. Pick a section and the launcher will spotlight it.</div>
        </div>
        <div class="body">
          \${steps.map((step, index) => \`
            <button class="stepBtn" data-step-index="\${index}">
              <span class="stepTitle">\${step.title}</span>
              <span class="stepBody">\${step.body}</span>
            </button>
          \`).join("")}
          <div class="actions">
            <button class="miniBtn primary" data-action="next">Next Highlight</button>
            <button class="miniBtn" data-action="close">Close Tour</button>
          </div>
        </div>
      \`;
      document.body.appendChild(root);
      const highlight = document.createElement("div");
      highlight.id = "flprLauncherTutorialHighlight";
      document.body.appendChild(highlight);
      let activeIndex = -1;
      function getStepElement(index){
        const step = steps[index];
        if(!step) return null;
        try{
          return document.querySelector(step.selector);
        }catch(_){
          return null;
        }
      }
      function positionHighlight(index){
        const target = getStepElement(index);
        if(!target){
          highlight.style.display = "none";
          return;
        }
        const rect = target.getBoundingClientRect();
        const pad = 10;
        highlight.style.display = "block";
        highlight.style.left = Math.max(8, rect.left - pad) + "px";
        highlight.style.top = Math.max(8, rect.top - pad) + "px";
        highlight.style.width = Math.max(48, rect.width + (pad * 2)) + "px";
        highlight.style.height = Math.max(48, rect.height + (pad * 2)) + "px";
      }
      function activate(index){
        activeIndex = (index + steps.length) % steps.length;
        root.querySelectorAll(".stepBtn").forEach((el, idx) => {
          el.classList.toggle("active", idx === activeIndex);
        });
        const target = getStepElement(activeIndex);
        if(target && typeof target.scrollIntoView === "function"){
          target.scrollIntoView({ behavior:"smooth", block:"center", inline:"center" });
          setTimeout(() => positionHighlight(activeIndex), 180);
        }else{
          positionHighlight(activeIndex);
        }
      }
      root.querySelectorAll(".stepBtn").forEach((el) => {
        el.addEventListener("click", () => activate(Number(el.getAttribute("data-step-index") || 0)));
      });
      root.querySelector('[data-action="next"]')?.addEventListener("click", () => activate(activeIndex < 0 ? 0 : activeIndex + 1));
      function destroy(){
        try{ root.remove(); }catch(_){}
        try{ highlight.remove(); }catch(_){}
        window.removeEventListener("resize", onResize);
      }
      root.querySelector('[data-action="close"]')?.addEventListener("click", destroy);
      const onResize = () => {
        if(activeIndex >= 0) positionHighlight(activeIndex);
      };
      window.addEventListener("resize", onResize);
      window[tutorialKey] = { destroy };
      activate(0);
    })();
  `;
}

function createLauncherWindow() {
  const primary = screen.getPrimaryDisplay();
  const workArea = primary?.workAreaSize || { width: 1280, height: 900 };
  const bounds = {
    width: clamp(980, 860, Math.max(860, workArea.width - DEFAULT_WINDOW_MARGIN)),
    height: clamp(760, 680, Math.max(680, workArea.height - DEFAULT_WINDOW_MARGIN))
  };
  const win = new BrowserWindow(makeWindowOptions({
    title: APP_TITLE,
    width: bounds.width,
    height: bounds.height,
    minWidth: 860,
    minHeight: 680
  }, bounds));
  keepWindowPaintingOnFocusChanges(win);
  win.loadFile(path.join(__dirname, "launcher.html"));
  win.once("ready-to-show", () => win.show());
  return win;
}

async function createContentWindow(kind, opts = {}) {
  const config = PAGE_MAP[kind];
  if (!config) return;
  const existing = contentWindows.get(config.kind);
  if (existing && !existing.isDestroyed()) {
    try {
      if (existing.isMinimized()) existing.restore();
      existing.show();
      existing.focus();
      if (opts.tutorial) {
        const script = buildTutorialInjection(kind);
        if (script) await existing.webContents.executeJavaScript(script, true);
      }
    } catch (_) {}
    return;
  }
  const assetPath = path.join(getAssetRoot(), config.file);
  if (!fs.existsSync(assetPath)) {
    dialog.showErrorBox(
      APP_TITLE,
      `Missing file:\n${assetPath}`
    );
    return;
  }
  const savedState = getSavedContentWindowState(config);
  const bounds = sanitizeContentWindowBounds(config, savedState);
  const win = new BrowserWindow(makeWindowOptions(config, bounds));
  keepWindowPaintingOnFocusChanges(win);
  rememberContentWindowState(config, win);
  let fitTimer = null;
  const queueFit = () => {
    clearTimeout(fitTimer);
    fitTimer = setTimeout(() => fitContentWindow(win, config), 60);
  };
  contentWindows.set(config.kind, win);
  win.on("resize", queueFit);
  win.on("maximize", queueFit);
  win.on("closed", () => {
    clearTimeout(fitTimer);
    if (contentWindows.get(config.kind) === win) contentWindows.delete(config.kind);
  });
  win.webContents.on("did-finish-load", async () => {
    queueFit();
    if (opts.tutorial) {
      const script = buildTutorialInjection(kind);
      if (script) {
        try {
          await win.webContents.executeJavaScript(script, true);
        } catch (_) {}
      }
    }
  });
  try {
    const localServer = await ensureStaticServer();
    const url = new URL(config.file.replace(/\\/g, "/"), `${localServer.baseUrl}/`);
    url.searchParams.set("launcherGraphicsMode", activeGraphicsMode);
    if (config.kind === "overlay") {
      url.searchParams.set("launcherStreamPerformance", "1");
      url.searchParams.set("launcherTwitchVideoAutoload", "0");
    }
    win.loadURL(url.toString());
  } catch (err) {
    console.warn("Local asset server failed; falling back to file://", err);
    win.loadFile(assetPath, {
      query: {
        launcherGraphicsMode: activeGraphicsMode,
        ...(config.kind === "overlay" ? {
          launcherStreamPerformance: "1",
          launcherTwitchVideoAutoload: "0"
        } : {})
      }
    });
  }
  win.once("ready-to-show", () => {
    if (savedState && savedState.maximized) {
      try {
        win.maximize();
      } catch (_) {}
    }
    win.show();
  });
}

function rendererSettingsResponse(settings, saved) {
  const normalized = normalizeRendererSettings(settings);
  const applied = normalizeRendererSettings(rendererSettingsAtLaunch);
  return {
    settings: normalized,
    applied,
    saved: saved !== false,
    restartRequired: (
      normalized.hardwareAcceleration !== applied.hardwareAcceleration ||
      normalized.renderer !== applied.renderer
    )
  };
}

function getLauncherData() {
  const assetRoot = getAssetRoot();
  const apworldPath = getApworldPath();
  const logoPath = getLogoPath();
  const flprBotPath = getFlprBotPath();
  const primaryDisplay = screen.getPrimaryDisplay();
  const rendererSettings = readRendererSettingsFromLauncherSettings(loadLauncherSettings());
  const rendererResponse = rendererSettingsResponse(rendererSettings, true);
  return {
    packaged: isPackagedApp(),
    appVersion: app.getVersion(),
    displayFrequency: Number(primaryDisplay?.displayFrequency) || 0,
    graphicsMode: activeGraphicsMode,
    graphicsModeLabel: GRAPHICS_MODE_LABELS[activeGraphicsMode] || GRAPHICS_MODE_LABELS[GRAPHICS_MODE_DEFAULT],
    graphicsModes: Object.entries(GRAPHICS_MODE_LABELS).map(([value, label]) => ({ value, label })),
    rendererSettings: rendererResponse.settings,
    activeRendererSettings: rendererResponse.applied,
    rendererRestartRequired: rendererResponse.restartRequired,
    assetRoot,
    apworldPath,
    apworldExists: fs.existsSync(apworldPath),
    flprBotPath,
    flprBotExists: fs.existsSync(flprBotPath),
    logoUrl: fs.existsSync(logoPath) ? pathToFileURL(logoPath).href : "",
    pages: Object.fromEntries(
      Object.entries(PAGE_MAP).map(([key, value]) => [
        key,
        {
          title: value.title,
          file: value.file,
          summary: value.summary,
          exists: fs.existsSync(path.join(assetRoot, value.file))
        }
      ])
    )
  };
}

function installRendererSettingsIpc() {
  ipcMain.handle("flpr-renderer-settings:get", () => {
    return rendererSettingsResponse(readRendererSettingsFromLauncherSettings(loadLauncherSettings()), true);
  });
  ipcMain.handle("flpr-renderer-settings:set", (_event, settings) => {
    const next = saveRendererSettings(settings);
    return rendererSettingsResponse(next, true);
  });
  ipcMain.handle("flpr-renderer-settings:relaunch", () => {
    app.relaunch();
    app.exit(0);
    return { ok: true };
  });
}

function normalizeTaskRepositoryCfg(value) {
  const raw = value && typeof value === "object" ? value : {};
  return {
    kind: "flippermizer_task_repository_cfg",
    version: String(raw.version || "1.0.0"),
    updatedAt: String(raw.updatedAt || raw.savedAt || new Date().toISOString()),
    source: raw.source && typeof raw.source === "object" ? raw.source : {},
    edits: raw.edits && typeof raw.edits === "object" ? raw.edits : {},
    flags: raw.flags && typeof raw.flags === "object" ? raw.flags : {},
    codexSuggestions: raw.codexSuggestions && typeof raw.codexSuggestions === "object" ? raw.codexSuggestions : {},
    accepted: raw.accepted && typeof raw.accepted === "object" ? raw.accepted : {},
    templateTables: raw.templateTables && typeof raw.templateTables === "object" ? raw.templateTables : {},
    history: raw.history && typeof raw.history === "object" ? raw.history : {}
  };
}

function buildTaskRepositoryCfgSource(cfg) {
  const normalized = normalizeTaskRepositoryCfg(cfg);
  const json = JSON.stringify(normalized, null, 2);
  return [
    "/* Packaged task repository review CFG.",
    " * Generated by the Flippermizer Electron launcher.",
    " */",
    "(function(global){",
    "  'use strict';",
    "  global.FLPR_TASK_REPOSITORY_DEFAULT_CFG = Object.freeze(" + json + ");",
    "})(typeof window !== 'undefined' ? window : this);",
    ""
  ].join("\n");
}

function writeTaskRepositoryCfg(payload) {
  const cfg = normalizeTaskRepositoryCfg(payload && payload.cfg);
  let source = String(payload && payload.source || "").trim();
  if (
    !source ||
    source.length > 10_000_000 ||
    !source.includes("FLPR_TASK_REPOSITORY_DEFAULT_CFG") ||
    !source.includes("flippermizer_task_repository_cfg")
  ) {
    source = buildTaskRepositoryCfgSource(cfg);
  }
  const cfgPath = getTaskRepositoryCfgPath();
  const userCfgPath = getTaskRepositoryUserCfgPath();
  fs.mkdirSync(path.dirname(cfgPath), { recursive: true });
  fs.writeFileSync(cfgPath, source, "utf8");
  fs.mkdirSync(path.dirname(userCfgPath), { recursive: true });
  fs.writeFileSync(userCfgPath, JSON.stringify(cfg, null, 2), "utf8");
  return { ok: true, path: cfgPath, userPath: userCfgPath, cfg };
}

function readTaskRepositoryUserCfg() {
  try {
    const raw = fs.readFileSync(getTaskRepositoryUserCfgPath(), "utf8");
    return normalizeTaskRepositoryCfg(JSON.parse(raw));
  } catch (_) {
    return null;
  }
}

function verifyDevToolsPassword(password) {
  try {
    const hash = crypto.createHash("sha256").update(String(password || ""), "utf8").digest("hex");
    const given = Buffer.from(hash, "hex");
    const wanted = Buffer.from(DEV_TOOLS_PASSWORD_SHA256, "hex");
    return given.length === wanted.length && crypto.timingSafeEqual(given, wanted);
  } catch (_) {
    return false;
  }
}

function installTaskRepositoryIpc() {
  ipcMain.handle("flpr-task-repository-cfg:get", () => ({
    ok: true,
    cfg: readTaskRepositoryUserCfg(),
    path: getTaskRepositoryCfgPath(),
    userPath: getTaskRepositoryUserCfgPath()
  }));
  ipcMain.handle("flpr-task-repository-cfg:save", (_event, payload) => writeTaskRepositoryCfg(payload || {}));
}

function installDevToolsIpc() {
  ipcMain.handle("flpr-dev-tools:unlock", (_event, password) => ({ ok: verifyDevToolsPassword(password) }));
}

function windowFromIpcEvent(event) {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (win && !win.isDestroyed()) return win;
  const focused = BrowserWindow.getFocusedWindow();
  return focused && !focused.isDestroyed() ? focused : null;
}

function installWindowIpc() {
  ipcMain.handle("flpr-window:get-fullscreen-state", (event) => {
    const win = windowFromIpcEvent(event);
    return { ok: !!win, fullscreen: !!(win && win.isFullScreen()) };
  });
  ipcMain.handle("flpr-window:toggle-fullscreen", (event) => {
    const win = windowFromIpcEvent(event);
    if (!win) return { ok: false, fullscreen: false };
    const next = !win.isFullScreen();
    win.setFullScreen(next);
    return { ok: true, fullscreen: next };
  });
  ipcMain.handle("flpr-window:exit-app", () => {
    app.quit();
    return { ok: true };
  });
}

installRendererSettingsIpc();
installTaskRepositoryIpc();
installDevToolsIpc();
installWindowIpc();

ipcMain.handle("launcher:get-data", async () => getLauncherData());
ipcMain.handle("launcher:get-settings", async () => {
  return {
    ...loadLauncherSettings(),
    settingsPath: getSettingsPath()
  };
});
ipcMain.handle("launcher:save-settings", async (_event, nextSettings) => {
  return {
    ...saveLauncherSettings(nextSettings || {}),
    settingsPath: getSettingsPath()
  };
});
ipcMain.handle("launcher:get-music-state", async () => {
  return {
    ...loadLauncherMusicState(),
    musicStatePath: getMusicStatePath()
  };
});
ipcMain.handle("launcher:save-music-state", async (_event, snapshot) => {
  return {
    ...saveLauncherMusicState(snapshot || {}),
    musicStatePath: getMusicStatePath()
  };
});
ipcMain.handle("launcher:save-music-file", async (_event, scenario, bytes, fileName, mimeType) => {
  const safeScenario = sanitizeMusicScenario(scenario);
  const ext = getSafeMusicExtension(fileName, mimeType);
  const storedName = `${safeScenario}${ext}`;
  const dir = getMusicStorageDir();
  const target = path.resolve(dir, storedName);
  if (target !== dir && !target.startsWith(dir + path.sep)) {
    return { ok: false, error: "invalid-path" };
  }
  const buffer = bytesToBuffer(bytes);
  if (!buffer.length) return { ok: false, error: "empty-file" };
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(target, buffer);
  return {
    ok: true,
    ref: `/__flpr_user_music/${encodeURIComponent(storedName)}?v=${Date.now()}`,
    path: target,
    fileName: storedName
  };
});
ipcMain.handle("launcher:delete-music-file", async (_event, scenario) => {
  const safeScenario = sanitizeMusicScenario(scenario);
  const dir = getMusicStorageDir();
  const removed = [];
  if (!fs.existsSync(dir)) return { ok: true, removed };
  const prefix = `${safeScenario}.`;
  for (const entry of fs.readdirSync(dir)) {
    if (!entry.toLowerCase().startsWith(prefix)) continue;
    const target = path.resolve(dir, entry);
    if (target !== dir && target.startsWith(dir + path.sep) && fs.existsSync(target)) {
      fs.rmSync(target, { force: true });
      removed.push(target);
    }
  }
  return { ok: true, removed };
});
ipcMain.handle("launcher:open-page", async (_event, kind, opts = {}) => {
  await createContentWindow(String(kind || ""), opts || {});
  return true;
});
ipcMain.handle("launcher:open-apworld-folder", async () => {
  const apworldPath = getApworldPath();
  const dir = path.dirname(apworldPath);
  if (!fs.existsSync(dir)) return false;
  await shell.openPath(dir);
  return true;
});
ipcMain.handle("launcher:show-apworld", async () => {
  const apworldPath = getApworldPath();
  if (!fs.existsSync(apworldPath)) return false;
  await shell.showItemInFolder(apworldPath);
  return true;
});
ipcMain.handle("launcher:open-app-folder", async () => {
  const dir = isPackagedApp() ? path.dirname(process.execPath) : getDevRoot();
  await shell.openPath(dir);
  return true;
});
ipcMain.handle("launcher:run-flpr-bot", async () => {
  const exePath = getFlprBotPath();
  if (!fs.existsSync(exePath)) {
    dialog.showErrorBox(APP_TITLE, `Missing FLPR-Bot executable:\n${exePath}`);
    return { ok: false, error: "missing", path: exePath };
  }
  if (flprBotProcess && flprBotProcess.exitCode === null && !flprBotProcess.killed) {
    return { ok: true, path: exePath, existing: true };
  }
  const exeDir = path.dirname(exePath);
  const child = spawn(
    "cmd.exe",
    ["/k", ".\\flpr-bot.exe"],
    {
      cwd: exeDir,
      detached: true,
      stdio: "ignore",
      windowsHide: false
    }
  );
  flprBotProcess = child;
  child.once("exit", () => {
    if (flprBotProcess === child) flprBotProcess = null;
  });
  child.once("error", () => {
    if (flprBotProcess === child) flprBotProcess = null;
  });
  child.unref();
  return { ok: true, path: exePath };
});
ipcMain.handle("launcher:set-graphics-mode", async (_event, nextMode) => {
  const selected = sanitizeGraphicsMode(String(nextMode || ""));
  const current = readRendererSettingsFromLauncherSettings(loadLauncherSettings());
  saveRendererSettings(rendererSettingsFromGraphicsMode(selected, current));
  app.relaunch();
  app.exit(0);
  return true;
});

app.whenReady().then(() => {
  createLauncherWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createLauncherWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("before-quit", () => {
  try {
    if (staticServerInfo && staticServerInfo.server) staticServerInfo.server.close();
  } catch (_) {}
});
