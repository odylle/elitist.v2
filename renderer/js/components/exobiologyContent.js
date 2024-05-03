const getOrganicLocations = async (genus, species) => {
    let data = await db.organics.where({ genus: genus, species: species }).toArray();
    let bodies = []
    await data.forEach(async organic => {
        for (loc of organic.locations) {
            let body = await db.bodies.get({address: loc.address, id: loc.body})
            bodies.push(body)
        }
    })
    return bodies
}
module.exports = { getOrganicLocations }