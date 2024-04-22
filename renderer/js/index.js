// Initialize IndexedDB
const db = require('./js/modules/storageDB');

// Initialize electron-store
const Store = require('electron-store');
let store = new Store()

const components = require("./js/components")
const { journal } = require("./js/modules")

// Notifications
const notifications = require('./js/notifications');
queue = new notifications.NotificationQueue()
// queue.addEventListener('notification', helpers.renderNotification)

folder = process.cwd() + "/logs"

window.addEventListener('DOMContentLoaded', async () => {
    await components.init(folder).then(async () => {
        console.log("then: Application Initialized")
    })
})