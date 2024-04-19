const helpers = require('../helpers')
const { isFuelStar } = require('../helpers/functions')

const unknownSystemElement = () => {
    let element = document.createElement('div')
    element.classList.add('unknown-system')
    element.innerHTML = `<div class="title h1">Unknown System</div><div class="title h4">please scan</div>`
    return element
}

const discoveryElement = () => {
    let div = document.createElement("div")
    div.classList.add("discoveries")
    div.innerHTML = `<div class="elw"><i class="fa icarus-terminal-planet-earthlike"></i> <span>ELW</span></div>
    <div class="ww"><i class="fa icarus-terminal-planet-water-world"></i> <span>WW</span></div>
    <div class="aw"><i class="fa icarus-terminal-planet-ammonia-world"></i> <span>AW</span></div>
    <div class="bio"><i class="fa icarus-terminal-planet-life"></i> <span>Bio</span></div>
    <div class="high"><i class="fa icarus-terminal-planet-high-value"></i> <span>High Value</span></div>`
    return div
}

const bodyIsStar = (body) => {
    let div = document.createElement("div")
    const default_cls = ["body", "star", "common"]
    div.classList.add(...default_cls)
    div.id = store.get("session.location.address") + "." + body.id

    // Details
    let fuelIcon = isFuelStar(body.class) ? `<i class="fa icarus-terminal-fuel fuel"></i>` : ""
    let distance = body.distance
    let distanceColor = parseFloat(distance) > 4000 ? "far-away" : ""
    distance = helpers.formatNumber(parseFloat(distance.toFixed(2)))
    div.innerHTML = `<div class="icon"><i class="fa icarus-terminal-star"></i></div>
    <div class="name">${body.name}<span class="class">${body.class} Class Main Sequence</span></div>
    <div class="attributes">${fuelIcon}</div>
    <div class="distance ${distanceColor}">${distance} Ls</div>`
    return div
}

const bodyIsPlanet = (body) => {
    let div = document.createElement("div")
    const default_cls = ["body", "planet"]
    div.classList.add(...default_cls)
    div.id = store.get("session.location.address") + "." + body.id

    let planetIcon = helpers.getPlanetIcon(body.class)
    let distance = body.distance
    let distanceColor = parseFloat(distance) > 4000 ? "far-away" : ""
    distance = helpers.formatNumber(parseFloat(distance.toFixed(2)))

    let signals = helpers.checkSignals(store.get("session.location.address"), body.id)

    let attributes = helpers.getPlanetAttributes(body)
    let bodyCss =
      attributes.includes("bio") ||
      attributes.includes("elw") ||
      attributes.includes("ww") ||
      attributes.includes("aw") ||
      attributes.includes("high-value")
        ? "interesting"
        : "common";
    div.classList.add(bodyCss)
    if (attributes.includes("high-value")) { div.classList.add("high-value") }

    div.innerHTML = `<div class="icon">${planetIcon}</div>
    <div class="name">${body.name}<span class="class">${body.class}</span></div>
    <div class="attributes">${helpers.getAttributeIcons(attributes)}</div>
    <div class="distance ${distanceColor || "hahaha"}">${distance || "hahaha"} Ls</div>
    <div class="signals">${signals}</div>`
    return div
}

const bodyRow = (body) => {
    body = helpers.bodyLineformatter(body)
    if (body.type == "Star") {
        return bodyIsStar(body)
    }
    else if (body.type == "Planet") {
        return bodyIsPlanet(body)
    }
    return ""
}

const bodiesElement = (bodies) => {
   
    let div = document.createElement("div")
    div.classList.add("bodies")
    
    for (body of bodies) {
        div.append(bodyRow(body))
    }
    return div
}

const renderSystemContent = async () => {
    let element = await document.getElementById('systemContent')
    let isKnown = await helpers.isKnownSystem(store.get('session.location.address'))
    if (isKnown) {
        element.append(discoveryElement())
        let bodies = await db.bodies.where('address').equals(store.get('session.location.address')).toArray()
        element.append(bodiesElement(bodies))
    } else {
        element.append(unknownSystemElement())
    }
}

const updateLocation = async () => {
    console.log("update Location")
}

module.exports = {
    renderSystemContent,
    updateLocation
}