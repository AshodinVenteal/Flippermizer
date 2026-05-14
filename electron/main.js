const { app, BrowserWindow, shell, screen, nativeImage } = require("electron");
const fs = require("fs");
const path = require("path");

const APP_ID = "net.flippermizer.standalone";
const APP_ICON = path.join(__dirname, "..", "build", process.platform === "win32" ? "icon.ico" : "icon.png");
const APP_ICON_FALLBACK = path.join(__dirname, "..", "Flippermizer Images", "FM-Icon64x64.png");
const OVERLAY_BASE_HEIGHT = 1450;
const DEFAULT_WINDOW_BOUNDS = { width: 1600, height: 960 };
const MIN_WINDOW_BOUNDS = { width: 1280, height: 720 };
const WINDOW_STATE_FILE = "standalone-window-state.json";

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
  const preferred = nativeImage.createFromPath(APP_ICON);
  if(!preferred.isEmpty()) return preferred;
  return nativeImage.createFromPath(APP_ICON_FALLBACK);
}

function notifyOverlayViewport(win){
  if(!win || win.isDestroyed()) return;
  setTimeout(()=>{
    if(!win || win.isDestroyed()) return;
    win.webContents.executeJavaScript('window.dispatchEvent(new Event("resize"));').catch(()=>{});
  }, 0);
}

function fitOverlayZoom(win){
  if(!win || win.isDestroyed()) return;
  const bounds = win.getContentBounds();
  const height = Math.max(1, bounds.height || OVERLAY_BASE_HEIGHT);
  const zoom = Math.max(0.1, Math.min(2.5, height / OVERLAY_BASE_HEIGHT));
  try{
    if(Math.abs(win.webContents.getZoomFactor() - zoom) > 0.001){
      win.webContents.setZoomFactor(zoom);
    }
    notifyOverlayViewport(win);
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
    icon: appIcon.isEmpty() ? APP_ICON : appIcon,
    title: "Flippermizer Standalone AP Client",
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });
  if(!appIcon.isEmpty()){
    win.setIcon(appIcon);
  }

  win.loadFile(path.join(__dirname, "..", "flippermizer_overlay_tower_v3.html"));

  win.webContents.on("did-finish-load", ()=>{
    fitOverlayZoom(win);
    const bridgePath = path.join(__dirname, "standalone-overlay-bridge.js");
    fs.readFile(bridgePath, "utf8", (err, source)=>{
      if(err){
        console.error("Failed to load standalone overlay bridge", err);
        return;
      }
      win.webContents.executeJavaScript(source).catch((executeErr)=>{
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

app.whenReady().then(()=>{
  createWindow();

  app.on("activate", ()=>{
    if(BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", ()=>{
  if(process.platform !== "darwin") app.quit();
});
