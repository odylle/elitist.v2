// Initialize IndexedDB
const db = require('./js/modules/storageDB');

// Initialize electron-store
const Store = require('electron-store');
let store = new Store()

const components = require('./js/components');
const modules = require('./js/modules');
const helpers = require('./js/helpers');

// Initialize Electron IPC
const ipc = require("electron").ipcRenderer;

// Notifications
queue = new helpers.NotificationQueue()
queue.addEventListener('notification', helpers.renderNotification)




window.addEventListener('DOMContentLoaded', async () => {
    ipc.send("watcher:start", folder);
    
    // components.mainSections()
    modules.init().then(async () => {
        await components.mainSections()
        // await helpers.readJson('NavRoute.json').then(async json => {
        //     let element = document.getElementById('navigationContent')
        //     if (json.Route.length > 0) {
        //         store.set("session.route.summary", json.Route)
        //         document.getElementById('navigationSubtext').setAttribute('data-jumps', json.Route.length)
        //         document.getElementById('navigationSubtext').innerHTML = `${json.Route.length} jumps remaining`
        //     } else {
        //         document.getElementById('navigationSubtext').innerHTML = `No route planned`
        //         element.innerHTML = ""
        //     }
        //     for (i in json.Route) {
        //         element.innerHTML += await components.navigationStop(json.Route[i], parseInt(i) + 1)
        //     }
        // }).catch(error => console.log(error))
        return
    }).then(async () => {
        await components.renderSystemContent()
        // await components.updateCurrentSystem().then(result => console.log("done"))

    })


})


// Window Control
document.getElementById('minimizeButton').addEventListener('click', () => {
    ipc.send('app:minimize')
  })
  document.getElementById('minMaxButton').addEventListener('click', () => {
    ipc.send('app:maximize')
  })
  document.getElementById('fullScreenButton').addEventListener('click', () => {
    ipc.send('app:fullscreen')
  })
  document.getElementById('closeButton').addEventListener('click', () => {
    ipc.send('app:quit')
  })

 /**
 * ----------------------------------
 * Events from Main
 * ----------------------------------
 */
ipc.on("watcher:start:reply", (event, args) => {
    console.log(args);
});
ipc.on("watcher:file:new", (event, args) => {
    if (args.split(".").pop() == "log") {
        store.set('app.fromLine', 0)
        helpers.processLogFile(args).then(result => console.log(result))
    }
});
ipc.on("watcher:file:update", (event, args) => {
    if (args.split(".").pop() == "log") {
        helpers.processLogFile(args).then(result => console.log(result))
    }
});


const loadingStops = () => {
    return `<div class="load-stops">
    <div><i class="fa-solid fa-heart fa-beat" style="--fa-beat-scale: 2.0;"></i></div>
   <div class="message">Initializing application</div>
   <div class="first-use">On first use this may take a while, whilst we add all the bodies you've visited</div>
    </div>`
}
