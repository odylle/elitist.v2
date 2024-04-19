// Initialize IndexedDB
const db = require('./js/modules/storageDB');

const components = require("./js/components")
const { journal } = require("./js/modules")

// Notifications
const notifications = require('./js/notifications');
queue = new notifications.NotificationQueue()
// queue.addEventListener('notification', helpers.renderNotification)

folder = "/Users/vincent/Documents/Development/Electron/elitist.clean/logs"

window.addEventListener('DOMContentLoaded', async () => {
    await components.init(folder).then(async () => {
        console.log("then: Application Initialized")
    })
})