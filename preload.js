const { contextBridge, ipcRenderer} = require('electron')

contextBridge.exposeInMainWorld('api', {
  electronModule: () => ipcRenderer.invoke('electron-module'),
  // we can also expose variables, not just functions
})