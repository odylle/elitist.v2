// Initialize IndexedDB
const db = require('./js/modules/storageDB');

// Initialize electron-store
const Store = require('electron-store');
let store = new Store()

// Initialize Electron IPC
const ipc = require("electron").ipcRenderer;

const components = require("./js/components")
const { journal } = require("./js/modules")

// Notifications
const notifications = require('./js/notifications');
queue = new notifications.NotificationQueue()
// queue.addEventListener('notification', helpers.renderNotification)

folder = process.cwd() + "/logs"
// folder = "%userprofile%\\Saved Games\\Frontier Developments\\Elite Dangerous"
// folder = require("os").homedir() + "\\Saved Games\\Frontier Developments\\Elite Dangerous"


const getPromiseFromEvent = (item, event) => {
    return new Promise((resolve) => {
      const listener = () => {
        item.removeEventListener(event, listener);
        resolve();
      }
      item.addEventListener(event, listener);
    })
  }

window.addEventListener('DOMContentLoaded', async () => {
    await components.init(folder).then(async () => {
        let initElement = document.querySelector('.init')
        const css = ["animated", "fadeOut", "delay-1s"]
        initElement.classList.add(...css)
        await getPromiseFromEvent(initElement, "animationend")
        initElement.remove()
        await components.main.render()
        let system = document.getElementById("systemContent")
        return system
    }).then(async (system) => {
        let address = store.get("session.location.address")
        // address = 357522412162
        system.appendChild(await components.system.render(address))
        if (address) {
          let bodiesElement = system.querySelector('.system-bodies')
          let bodies = await db.bodies.where("address").equals(address).toArray()
          bodies.forEach(async body => {
              if (body.type == "Star" || body.type == "Planet") {
                let bodyElement = await components.system.renderBodies(address, body)
                await bodiesElement.appendChild(bodyElement)
              }
          })
        }
    })
    ipc.send("watcher:start", folder);
    // console.log("after await init")
})
onresize = (event) => { 
  store.set("app.window.width", window.innerWidth)
  store.set("app.window.height", window.innerHeight)
};





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
ipc.on("watcher:file:new", async (event, args) => {
    if (args.split(".").pop() == "log") {
        store.set('app.fromLine', 0)
        // helpers.processLogFile(args).then(result => console.log(result))
        journal.functions.readJournal(args, true)
        
    }
});
ipc.on("watcher:file:update", async (event, args) => {
    if (args.split(".").pop() == "log") {
      await journal.functions.readJournal(args, true)
    }
});
