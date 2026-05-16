const { contextBridge, ipcRenderer } = require("electron");

const rendererApi = {
  getRendererSettings: () => ipcRenderer.invoke("flpr-renderer-settings:get"),
  setRendererSettings: (settings) => ipcRenderer.invoke("flpr-renderer-settings:set", settings),
  relaunch: () => ipcRenderer.invoke("flpr-renderer-settings:relaunch")
};

contextBridge.exposeInMainWorld("flprElectron", rendererApi);
contextBridge.exposeInMainWorld("flprStandaloneElectron", rendererApi);
