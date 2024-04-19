const Dexie = require('dexie');
const db = new Dexie('elitistDB');

db.version(1).stores({
    systems: '&address, name, position, allegiance, government, economy.first, economy.second, security, population, visited',
    bodies: '[address+id], address, name, type, class, parents, landable, gravity, rings, materials, discovered, mapped',    
})
db.version(2).stores({
    biolog: 'id++, genus, species, variant, address, body',
})

module.exports = db