const {app, BrowserWindow, electron, Menu, ipcRenderer, ipcMain} = require('electron')
const path                           = require('path')
const remoteMain                     = require("@electron/remote/main")
const os                             = require('os')
const model                          = require(path.join(__dirname, 'src', 'model.js'))

/* add this before the enable function */
remoteMain.initialize();

let win
const createWindow = () => {
  win = new BrowserWindow({
    width: 1240,
    height: 600,
    webPreferences: {
      nodeIntegration   : true,    // is default value after Electron v5
      contextIsolation  : false,   // protect against prototype pollution
      enableRemoteModule: true,
    },
  })

  remoteMain.enable(win.webContents);
  win.webContents.openDevTools()
  model.initDb(app.getAppPath())
  win.maximize()
  win.setResizable(false)
  win.setMenu(null)
  win.loadFile('index.html')
}

  app.whenReady().then(() => {
    createWindow();
    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
      }
    });
  });
  
  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  })
