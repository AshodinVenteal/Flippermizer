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
