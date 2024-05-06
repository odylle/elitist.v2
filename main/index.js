const log = require("electron-log");
log.initialize();

const Store = require("electron-store");
Store.initRenderer();
let store = new Store();

// Modules to control application life and create native browser window
const { app, BrowserWindow, ipcMain } = require("electron");
const Watcher = require("./watcher");

const path = require("node:path");
let win;

const createWindow = () => {
  // Create the browser window.
  win = new BrowserWindow({
    width: store.get("app.window.width") ? store.get("app.window.width") : 1440,
    height: store.get("app.window.height")
      ? store.get("app.window.height")
      : 900,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    frame: process.env.ELECTRON_ENV == "development" ? true : false,
  });

  // and load the index.html of the app.
  win.loadFile("renderer/index.html");

  // Open the DevTools.
  if (process.env.ELECTRON_ENV == "development") {
    win.webContents.openDevTools()
  }
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
var Watching;

ipcMain.on("watcher:start", (event, folder) => {
  if (Watching) {
    event.sender.send("watcher:start:reply", "Watcher running");
  } else {
    Watching = new Watcher(folder);
    Watching.win = win;
    Watching.init();
    event.sender.send("watcher:start:reply", "New watcher initialized");
  }
});

ipcMain.on("app:version", (event, arg) => {
  event.returnValue = app.getVersion();
});
ipcMain.on("app:quit", (event, arg) => {
  app.quit();
});
ipcMain.on("app:minimize", (event, arg) => {
  win.minimize();
});
ipcMain.on("app:maximize", (event, arg) => {
  if (win.isMaximized()) {
    win.unmaximize();
  } else {
    win.maximize();
  }
});

ipcMain.on("app:fullscreen", (event, arg) => {
  if (win.isFullScreen()) {
    win.setFullScreen(false);
  } else {
    win.setFullScreen(true);
  }
});
