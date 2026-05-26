const { contextBridge, ipcRenderer } = require("electron");

const rendererApi = {
  getRendererSettings: () => ipcRenderer.invoke("flpr-renderer-settings:get"),
  setRendererSettings: (settings) => ipcRenderer.invoke("flpr-renderer-settings:set", settings),
  relaunch: () => ipcRenderer.invoke("flpr-renderer-settings:relaunch"),
  getTaskRepositoryCfg: () => ipcRenderer.invoke("flpr-task-repository-cfg:get"),
  saveTaskRepositoryCfg: (payload) => ipcRenderer.invoke("flpr-task-repository-cfg:save", payload),
  unlockDevTools: (password) => ipcRenderer.invoke("flpr-dev-tools:unlock", String(password || ""))
};

contextBridge.exposeInMainWorld("flprElectron", rendererApi);
contextBridge.exposeInMainWorld("flprStandaloneElectron", rendererApi);

contextBridge.exposeInMainWorld("flprLauncher", {
  getData: () => ipcRenderer.invoke("launcher:get-data"),
  openPage: (kind, opts) => ipcRenderer.invoke("launcher:open-page", kind, opts || {}),
  openApworldFolder: () => ipcRenderer.invoke("launcher:open-apworld-folder"),
  showApworld: () => ipcRenderer.invoke("launcher:show-apworld"),
  openAppFolder: () => ipcRenderer.invoke("launcher:open-app-folder"),
  runFlprBot: () => ipcRenderer.invoke("launcher:run-flpr-bot"),
  getSettings: () => ipcRenderer.invoke("launcher:get-settings"),
  saveSettings: (nextSettings) => ipcRenderer.invoke("launcher:save-settings", nextSettings || {}),
  getMusicState: () => ipcRenderer.invoke("launcher:get-music-state"),
  saveMusicState: (snapshot) => ipcRenderer.invoke("launcher:save-music-state", snapshot || {}),
  saveMusicFile: (scenario, bytes, fileName, mimeType) => ipcRenderer.invoke("launcher:save-music-file", scenario, bytes, fileName, mimeType),
  deleteMusicFile: (scenario) => ipcRenderer.invoke("launcher:delete-music-file", scenario),
  getRendererSettings: rendererApi.getRendererSettings,
  setRendererSettings: rendererApi.setRendererSettings,
  relaunch: rendererApi.relaunch,
  getTaskRepositoryCfg: rendererApi.getTaskRepositoryCfg,
  saveTaskRepositoryCfg: rendererApi.saveTaskRepositoryCfg,
  unlockDevTools: rendererApi.unlockDevTools,
  setGraphicsMode: (mode) => ipcRenderer.invoke("launcher:set-graphics-mode", mode)
});
