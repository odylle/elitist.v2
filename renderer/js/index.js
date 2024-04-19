const components = require("./js/components")
const { journal } = require("./js/modules")

// Notifications
const notifications = require('./js/notifications');
queue = new notifications.NotificationQueue()
// queue.addEventListener('notification', helpers.renderNotification)