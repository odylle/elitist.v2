const cargoContent = require('./cargoContent')
const exobiologyContent = require('./exobiologyContent')
const mainContent = require('./mainContent')
const materialsContent = require('./materialsContent')
const notificationCenter = require('./notificationCenter')
const systemContent = require('./systemContent')

module.exports = {
    cargo: cargoContent,
    exobiology: exobiologyContent,
    main: mainContent,
    materials: materialsContent,
    notifications: notificationCenter,
    system: systemContent
}