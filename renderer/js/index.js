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
    ipc.send("watcher:start", folder);
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
        address = 14178837668
        system.appendChild(await components.system.render(address))
        let bodiesElement = system.querySelector('.system-bodies')
        let bodies = await db.bodies.where("address").equals(address).toArray()
        bodies.forEach(async body => {
            let bodyElement = await components.system.renderBodies(address, body)
            await bodiesElement.appendChild(bodyElement)
        })
    })
    console.log("after await init")
})


 /**
 * ----------------------------------
 * Events from Main
 * ----------------------------------
 */
 ipc.on("watcher:start:reply", (event, args) => {
    console.log(args);
});
// ipc.on("watcher:file:new", (event, args) => {
//     if (args.split(".").pop() == "log") {
//         store.set('app.fromLine', 0)
//         helpers.processLogFile(args).then(result => console.log(result))
//     }
// });
// ipc.on("watcher:file:update", (event, args) => {
//     if (args.split(".").pop() == "log") {
//         helpers.processLogFile(args).then(result => console.log(result))
//     }
// });


// window.addEventListener('DOMContentLoaded', async () => {
//     await components.init(folder).then(async () => {
//         return new Promise (async resolve => {
//             let system
//             let initElement = document.querySelector('.init')
//             const css = ["animated", "fadeOut", "delay-1s"]
//             initElement.classList.add(...css)
//             await initElement.addEventListener('animationend', async () => {
//                 initElement.remove()
//                 await components.main.render()
//                 system = document.getElementById("systemContent")
//                 system.appendChild(await components.system.render(store.get("session.location.address")))
//                 let bodiesElement = system.querySelector('.system-bodies')
//                 let bodies = await db.bodies.where("address").equals(store.get("session.location.address")).toArray()
//                 bodies.forEach(async body => {
//                     let bodyElement = await components.system.renderBodies(store.get("session.location.address"), body)
//                     bodiesElement.appendChild(bodyElement)
//                 console.log("First")
//             })
//             resolve(system)

//         }).then(result => console.log(result))
//     })
// })

// let main = document.getElementById("mainContent")
// main.appendChild(components.main.render())
// window.addEventListener('DOMContentLoaded', async () => {
//     components.main.render()
//     let system = document.getElementById("systemContent")    
//     system.appendChild(await components.system.render(store.get("session.location.address")))
// })

// let system = document.getElementById("systemContent")
// let systemContent = await components.system.render(store.get("session.location.address"))
// system.appendChild(await components.system.render(store.get("session.location.address")))
