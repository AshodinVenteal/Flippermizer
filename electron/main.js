const { app, BrowserWindow, ipcMain, shell, screen, nativeImage } = require("electron");
const fs = require("fs");
const path = require("path");

const APP_TITLE = "Flippermizer! Pinball Randomized! | Home Edition";
const APP_SHORT_NAME = "Flippermizer Home Edition";
const APP_ID = "net.flippermizer.homeedition";
const APP_ICON_HOME_IMAGE = path.join(__dirname, "..", "Flippermizer Images", "flippermizericon-Home-Edition-64x64.png");
const APP_ICON_PACKAGE = path.join(__dirname, "..", "build", process.platform === "win32" ? "home-icon.ico" : "icon.png");
const OVERLAY_BASE_WIDTH = 910 + 306 + 1280 + 16 + 32;
const OVERLAY_VERTICAL_BASE_WIDTH = 1180;
const OVERLAY_BASE_HEIGHT = 1450;
const DEFAULT_WINDOW_BOUNDS = { width: 1600, height: 960 };
const MIN_WINDOW_BOUNDS = { width: 900, height: 640 };
const WINDOW_STATE_FILE = "standalone-window-state.json";
const RENDERER_SETTINGS_FILE = "standalone-renderer-settings.json";
const DEFAULT_RENDERER_SETTINGS = {
  hardwareAcceleration: true,
  renderer: "default"
};
let mainWindow = null;

function getUserDataBaseDir(){
  return process.platform === "win32"
    ? (process.env.APPDATA || path.join(process.env.USERPROFILE || process.cwd(), "AppData", "Roaming"))
    : (process.env.XDG_CONFIG_HOME || path.join(process.env.HOME || process.cwd(), ".config"));
}

function getFallbackUserDataDir(){
  const base = getUserDataBaseDir();
  return path.join(base, APP_SHORT_NAME);
}

function getCommandLineUserDataDir(){
  try{
    for(let i = 0; i < process.argv.length; i++){
      const arg = String(process.argv[i] || "");
      if(arg.startsWith("--user-data-dir=")){
        const raw = arg.slice("--user-data-dir=".length).replace(/^"|"$/g, "");
        return raw ? path.resolve(raw) : "";
      }
      if(arg === "--user-data-dir" && process.argv[i + 1]){
        return path.resolve(String(process.argv[i + 1]));
      }
    }
  }catch(_err){}
  return "";
}

app.setName(APP_TITLE);
try{
  const cliUserData = getCommandLineUserDataDir();
  app.setPath("userData", cliUserData || getFallbackUserDataDir());
}catch(_err){}

function getUserDataDir(){
  const cliUserData = getCommandLineUserDataDir();
  if(cliUserData) return cliUserData;
  try{ return app.getPath("userData"); }catch(_err){ return getFallbackUserDataDir(); }
}

function getRendererSettingsPath(){
  return path.join(getUserDataDir(), RENDERER_SETTINGS_FILE);
}

function normalizeRendererSettings(value){
  const raw = value && typeof value === "object" ? value : {};
  const renderer = String(raw.renderer || DEFAULT_RENDERER_SETTINGS.renderer).toLowerCase() === "vulkan"
    ? "vulkan"
    : "default";
  return {
    hardwareAcceleration: raw.hardwareAcceleration !== false,
    renderer
  };
}

function readRendererSettings(){
  try{
    const raw = fs.readFileSync(getRendererSettingsPath(), "utf8");
    return normalizeRendererSettings(JSON.parse(raw));
  }catch(_err){
    return { ...DEFAULT_RENDERER_SETTINGS };
  }
}

function writeRendererSettings(settings){
  const next = normalizeRendererSettings(settings);
  fs.mkdirSync(path.dirname(getRendererSettingsPath()), { recursive: true });
  fs.writeFileSync(getRendererSettingsPath(), JSON.stringify(next, null, 2));
  return next;
}

const rendererSettingsAtLaunch = readRendererSettings();

function applyRendererLaunchSettings(settings){
  const cfg = normalizeRendererSettings(settings);
  if(cfg.hardwareAcceleration === false){
    app.disableHardwareAcceleration();
    return;
  }
  if(cfg.renderer === "vulkan"){
    app.commandLine.appendSwitch("ignore-gpu-blocklist");
    app.commandLine.appendSwitch("use-angle", "vulkan");
    app.commandLine.appendSwitch("enable-features", "Vulkan");
  }
}

applyRendererLaunchSettings(rendererSettingsAtLaunch);

function rendererGraphicsMode(settings){
  const cfg = normalizeRendererSettings(settings);
  if(cfg.hardwareAcceleration === false) return "software_fallback";
  return cfg.renderer === "vulkan" ? "vulkan" : "default";
}

function normalizeNavUrl(url){
  try{
    const parsed = new URL(url);
    parsed.search = "";
    parsed.hash = "";
    return parsed.href;
  }catch(_err){
    return String(url || "").split("#")[0].split("?")[0];
  }
}

function getWindowStatePath(){
  return path.join(app.getPath("userData"), WINDOW_STATE_FILE);
}

function clampWindowBounds(bounds){
  const width = Math.max(MIN_WINDOW_BOUNDS.width, Math.round(bounds.width || DEFAULT_WINDOW_BOUNDS.width));
  const height = Math.max(MIN_WINDOW_BOUNDS.height, Math.round(bounds.height || DEFAULT_WINDOW_BOUNDS.height));
  const display = screen.getDisplayMatching({
    x: Number.isFinite(bounds.x) ? Math.round(bounds.x) : 0,
    y: Number.isFinite(bounds.y) ? Math.round(bounds.y) : 0,
    width,
    height
  });
  const workArea = display.workArea;
  const clampedWidth = Math.min(width, workArea.width);
  const clampedHeight = Math.min(height, workArea.height);
  const minX = workArea.x;
  const minY = workArea.y;
  const maxX = workArea.x + workArea.width - clampedWidth;
  const maxY = workArea.y + workArea.height - clampedHeight;
  const fallbackX = Math.round(workArea.x + (workArea.width - clampedWidth) / 2);
  const fallbackY = Math.round(workArea.y + (workArea.height - clampedHeight) / 2);
  const x = Number.isFinite(bounds.x) ? Math.round(bounds.x) : fallbackX;
  const y = Number.isFinite(bounds.y) ? Math.round(bounds.y) : fallbackY;

  return {
    x: Math.min(Math.max(x, minX), maxX),
    y: Math.min(Math.max(y, minY), maxY),
    width: clampedWidth,
    height: clampedHeight
  };
}

function readWindowState(){
  try{
    const raw = fs.readFileSync(getWindowStatePath(), "utf8");
    const state = JSON.parse(raw);
    if(!state || typeof state !== "object" || !state.bounds) return null;
    return {
      bounds: clampWindowBounds(state.bounds),
      isMaximized: state.isMaximized === true
    };
  }catch(_err){
    return null;
  }
}

function writeWindowState(win){
  if(!win || win.isDestroyed()) return;
  const isMaximized = win.isMaximized();
  const state = {
    bounds: isMaximized || win.isMinimized() ? win.getNormalBounds() : win.getBounds(),
    isMaximized
  };
  try{
    fs.mkdirSync(path.dirname(getWindowStatePath()), { recursive: true });
    fs.writeFileSync(getWindowStatePath(), JSON.stringify(state, null, 2));
  }catch(err){
    console.error("Failed to save standalone window state", err);
  }
}

function scheduleWindowStateSave(win){
  if(!win || win.isDestroyed()) return;
  if(win.__flprWindowStateTimer) clearTimeout(win.__flprWindowStateTimer);
  win.__flprWindowStateTimer = setTimeout(()=>{
    win.__flprWindowStateTimer = null;
    writeWindowState(win);
  }, 250);
}

function loadAppIcon(){
  const preferred = nativeImage.createFromPath(APP_ICON_HOME_IMAGE);
  if(!preferred.isEmpty()) return preferred;
  return nativeImage.createFromPath(APP_ICON_PACKAGE);
}

function notifyOverlayViewport(win, viewportMode){
  if(!win || win.isDestroyed()) return;
  setTimeout(()=>{
    if(!win || win.isDestroyed()) return;
    const mode = viewportMode && typeof viewportMode === "object" ? viewportMode : {};
    const isVertical = !!mode.vertical;
    const width = Math.max(1, Math.round(Number(mode.width || 0) || 0));
    const height = Math.max(1, Math.round(Number(mode.height || 0) || 0));
    const script = `(()=>{try{window.__flprElectronViewportMode={vertical:${isVertical ? "true" : "false"},width:${width},height:${height}};if(document.body){document.body.classList.toggle("flprStandaloneVerticalViewport",${isVertical ? "true" : "false"});}}catch(_){}try{window.dispatchEvent(new Event("resize"));}catch(_){}})();`;
    win.webContents.executeJavaScript(script).catch(()=>{});
  }, 0);
}

function fitOverlayZoom(win){
  if(!win || win.isDestroyed()) return;
  const bounds = win.getContentBounds();
  const width = Math.max(1, bounds.width || OVERLAY_BASE_WIDTH);
  const height = Math.max(1, bounds.height || OVERLAY_BASE_HEIGHT);
  const vertical = height > width * 1.08;
  const baseWidth = vertical ? OVERLAY_VERTICAL_BASE_WIDTH : OVERLAY_BASE_WIDTH;
  const zoom = Math.max(0.1, Math.min(2.5, width / baseWidth, height / OVERLAY_BASE_HEIGHT));
  try{
    if(Math.abs(win.webContents.getZoomFactor() - zoom) > 0.001){
      win.webContents.setZoomFactor(zoom);
    }
    notifyOverlayViewport(win, { vertical, width, height });
  }catch(err){
    console.error("Failed to fit overlay zoom", err);
  }
}

function scheduleOverlayZoom(win){
  if(!win || win.isDestroyed()) return;
  if(win.__flprZoomTimer) clearTimeout(win.__flprZoomTimer);
  win.__flprZoomTimer = setTimeout(()=>{
    win.__flprZoomTimer = null;
    fitOverlayZoom(win);
  }, 50);
}

function rendererSettingsResponse(settings, saved){
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

function installRendererSettingsIpc(){
  ipcMain.handle("flpr-renderer-settings:get", ()=>{
    return rendererSettingsResponse(readRendererSettings(), true);
  });
  ipcMain.handle("flpr-renderer-settings:set", (_event, settings)=>{
    const next = writeRendererSettings(settings);
    return rendererSettingsResponse(next, true);
  });
  ipcMain.handle("flpr-renderer-settings:relaunch", ()=>{
    app.relaunch();
    app.exit(0);
    return { ok:true };
  });
}

function createWindow(){
  const savedWindowState = readWindowState();
  const savedBounds = savedWindowState ? savedWindowState.bounds : null;
  const appIcon = loadAppIcon();
  const win = new BrowserWindow({
    ...(savedBounds || DEFAULT_WINDOW_BOUNDS),
    minWidth: MIN_WINDOW_BOUNDS.width,
    minHeight: MIN_WINDOW_BOUNDS.height,
    backgroundColor: "#04121f",
    autoHideMenuBar: true,
    show: false,
    icon: appIcon.isEmpty() ? APP_ICON_PACKAGE : appIcon,
    title: APP_TITLE,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      preload: path.join(__dirname, "preload.js")
    }
  });
  mainWindow = win;
  if(!appIcon.isEmpty()){
    win.setIcon(appIcon);
  }

  win.loadFile(path.join(__dirname, "..", "flippermizer_overlay_tower_v3.html"), {
    query: {
      launcherGraphicsMode: rendererGraphicsMode(rendererSettingsAtLaunch)
    }
  });

  win.webContents.on("did-finish-load", ()=>{
    try{ win.setTitle(APP_TITLE); }catch(_err){}
    win.webContents.executeJavaScript(`document.title = ${JSON.stringify(APP_TITLE)};`).catch(()=>{});
    fitOverlayZoom(win);
    const bridgePath = path.join(__dirname, "standalone-overlay-bridge.js");
    const giftHousePath = path.join(__dirname, "standalone-gift-house-test.js");
    fs.readFile(bridgePath, "utf8", (err, source)=>{
      if(err){
        console.error("Failed to load standalone overlay bridge", err);
        return;
      }
      win.webContents.executeJavaScript(source).then(()=>{
        fs.readFile(giftHousePath, "utf8", (giftErr, giftSource)=>{
          if(giftErr){
            console.error("Failed to load standalone gift house test", giftErr);
            return;
          }
          win.webContents.executeJavaScript(giftSource).catch((giftExecuteErr)=>{
            console.error("Failed to execute standalone gift house test", giftExecuteErr);
          });
        });
      }).catch((executeErr)=>{
        console.error("Failed to execute standalone overlay bridge", executeErr);
      });
    });
  });

  win.once("ready-to-show", ()=>{
    if(!savedWindowState || savedWindowState.isMaximized){
      win.maximize();
    }
    scheduleOverlayZoom(win);
    win.show();
  });

  win.on("resize", ()=>{
    scheduleOverlayZoom(win);
    scheduleWindowStateSave(win);
  });
  win.on("move", ()=> scheduleWindowStateSave(win));
  win.on("maximize", ()=>{
    scheduleOverlayZoom(win);
    scheduleWindowStateSave(win);
  });
  win.on("unmaximize", ()=>{
    scheduleOverlayZoom(win);
    scheduleWindowStateSave(win);
  });
  win.on("close", ()=> writeWindowState(win));
  win.on("closed", ()=>{
    if(mainWindow === win) mainWindow = null;
  });

  win.webContents.setWindowOpenHandler(({ url })=>{
    shell.openExternal(url);
    return { action: "deny" };
  });

  win.webContents.on("will-navigate", (event, url)=>{
    const current = win.webContents.getURL();
    if(normalizeNavUrl(url) === normalizeNavUrl(current)){
      event.preventDefault();
      return;
    }
    if(url !== current){
      event.preventDefault();
      shell.openExternal(url);
    }
  });

  if(process.env.FLPR_DEVTOOLS === "1"){
    win.webContents.openDevTools({ mode: "detach" });
  }
}

app.setAppUserModelId(APP_ID);
installRendererSettingsIpc();

app.whenReady().then(()=>{
  createWindow();

  app.on("activate", ()=>{
    if(BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", ()=>{
  if(process.platform !== "darwin") app.quit();
});
