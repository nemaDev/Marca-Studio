const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("marcaStudio", {
  saveImages: (images) => ipcRenderer.invoke("images:save", images),
});
