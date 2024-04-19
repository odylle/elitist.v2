class Watcher {
    constructor(path) {
      this.path = path
    }
    init() {
      const log = require('electron-log/main');
      const watcher = require("chokidar").watch(this.path, {
          ignored: ['/[\/\\]\./', '*.cache'],
          ignoreInitial: true,
          persistent: true
      })
      // .on('all', (event, path) => {
      //   console.log(event, path)
      //   this.win.webContents.send('file-update', path)
      // })
      .on('add', (path) => {
        log.info('%cWatcher (MAIN) %c› %cNew file added', 'color: white;', 'color:unset;', 'color: yellow')
        this.win.webContents.send('watcher:file:new', path)      
      })
      .on('change', (path) => {
        log.info('%cWatcher (MAIN) %c› %cFile changed', 'color: white;', 'color:unset;', 'color: yellow;')
        this.win.webContents.send('watcher:file:update', path)
      })
      this.watcher = watcher
    }
    
  }
  module.exports = Watcher