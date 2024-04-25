const bodySummary = async (address) => {
    let stars, planets
    let bodies = await db.bodies.where("address").equals(address).toArray()
    stars = bodies.filter(body => body.type == "Star")
    planets = bodies.filter(body => body.type == "Planet")
    if (stars.length == 0 && planets.length == 0) {
        return `No bodies stored for this system`
    }
    starsElement =  stars.length > 0 ?`<span><i class="fa icarus-terminal-star"></i> ${stars.length} stars</span>` : ""
    planetsElement =
      planets.length > 0
        ? `<span><i class="fa icarus-terminal-planet"></i> ${planets.length} planets</span>`
        : stars.length > 0 && planets.length == 0
        ? `<span class="none"><i class="fa icarus-terminal-planet"></i> No planets on record</span>`
        : "";
    return starsElement + planetsElement
}

const systemFeatures = (system) => {
    return `<i class="fa icarus-terminal-planet-life life"></i>
    <i class="fa icarus-terminal-planet-high-value terraformable"></i>
    <i class="fa icarus-terminal-planet-earthlike elw"></i>
    <i class="fa icarus-terminal-planet-water-world ww"></i>
    <i class="fa icarus-terminal-planet-ammonia-world aw"></i>`
}
// const setFeature = {
//     life: async () => {
//         let element = await document.getElementById("systemFeatures")
//         element.querySelector(".life").classList.add("found")    
//     },
//     terraformable: async () => {
//         let element = await document.getElementById("systemFeatures")
//         element.querySelector(".terraformable").classList.add("found")    
//     }
// }
const setFeature = (feature) => {
    let element = document.getElementById("systemFeatures")
    element.querySelector(`.${feature}`).classList.add("found")
}

const systemDetails = (system) => {
    const formatNumber = require("../../modules/journal/functions").formatNumber
    let details = []
    if (system.population) {
        details.push(`<div>Population<span>${formatNumber(parseFloat(system.population))}</span></div>`)
    }
    if (system.allegiance) {
        details.push(`<div>Allegiance<span class="allegiance-${system.allegiance.toLowerCase()}">${system.allegiance}</span></div>`)
    }
    if (system.economy && system.economy.first != "None") {
        let second = system.economy.second ? `<span class="secondary">${system.economy.second}</span>` : ""
        details.push(`<div>Economy<span>${system.economy.first}</span>${second}</div>`)
    }
    if (system.government != "None") {
        details.push(`<div>Government<span>${system.government}</span></div>`)
    }
    if (system.security) {
        let securityCss = system.security.toLowerCase().replace(" ", "-")
        details.push(`<div>Security<span class="security-${securityCss}">${system.security}</span></div>`)
    }
    return details.join("")
}

const getPlanetIcon = (planetClass) => {
    function iconTemplate (icon, css) {
        return `<i class="fa icarus-terminal-${icon} ${css}"></i>`
    }
    let map = {
        "Metal rich body": { icon: "planet", css: "metal-rich" },
        "High metal content body": { icon: "planet-high-metal-content", css: "high-metal-content" },
        "Icy body": { icon: "planet", css: "icy" },
        "Rocky body": { icon: "planet", css: "rocky" },
        "Rocky ice body": { icon: "planet", css: "rocky-ice" },
        "Earthlike body": { icon: "planet-earthlike", css: "earthlike" },
        "Water world": { icon: "planet-water-world", css: "water-world" },
        "Ammonia world": { icon: "planet-ammonia-world", css: "ammonia-world" },
        "Water giant": { icon: "planet-gas-giant", css: "water-giant" },
        "Water giant with life": { icon: "planet-water-based-life", css: "water-giant" },
        "Gas giant with water based life": { icon: "planet-water-based-life", css: "water-based-life" },
        "Gas giant with ammonia based life": { icon: "planet-ammonia-based-life", css: "ammonia-based-life" },
        "Sudarsky class I gas giant": { icon: "planet-gas-giant", css: "gas-giant" },
        "Sudarsky class II gas giant": { icon: "planet-gas-giant", css: "gas-giant" },
        "Sudarsky class III gas giant": { icon: "planet-gas-giant", css: "gas-giant" },
        "Sudarsky class IV gas giant": { icon: "planet-gas-giant", css: "gas-giant" },
        "Sudarsky class V gas giant": { icon: "planet-gas-giant", css: "gas-giant" },
        "Helium rich gas giant": { icon: "planet-gas-giant", css: "helium-giant" },
        "Helium gas giant": { icon: "planet-gas-giant", css: "helium-giant" },
    }
    return map[planetClass] ? iconTemplate(map[planetClass].icon, map[planetClass].css) : iconTemplate("planet", "empty")
}

const icon = {
    star: `<i class="fa icarus-terminal-star"></i>`,
    planet: function (planetClass) {
        return getPlanetIcon(planetClass)
    },
    volcanism: `<i class="fa icarus-terminal-planet-volcanic volcanism"></i>`,
    atmosphere: `<i class="fa icarus-terminal-planet-atmosphere atmosphere"></i>`,
    terraformable: `<i class="fa icarus-terminal-planet-terraformable terraformable"></i>`,
    landable: function (gravity) {
        let gravityCss = (gravity/10) > 1.5 ? "high" : ""
        return `<i class="fa icarus-terminal-planet-lander landable gravity"><span class="gravity ${gravityCss}">${parseFloat(gravity/10).toFixed(2)}G</span></i>`
    },
    life: `<i class="fa icarus-terminal-planet-life life"></i>`,
    undiscovered: `<i class="fa fa-eye-slash undiscovered"></i>`,
    unmapped: `<i class="fa fa-map unmapped"></i>`
}


const starClassification = (starClass) => {
    // O B A F G K M L T Y
    if (["O", "B", "A", "F", "G", "K", "M", "L", "T", "Y"].includes(starClass)) {
        return `${starClass} class main sequence`
    }
    return `class ${starClass}`
}


const bodyAttributes = (body) => {
    attributes = []
    if (body.distance > 4000) {
        attributes.push(`far-away`)
    }
    if (body.landable) {
        attributes.push("landable")
        attributes.push(`gravity:${parseFloat(body.gravity/10).toFixed(2)}`)
    }
    if (body.terraformstate) {
        setFeature("terraformable")
        attributes.push(`terraformable`)
    }
    if (body.atmosphere) {
        attributes.push(`atmosphere`)
    }
    if (body.volcanism) {
        attributes.push(`volcanism`)
    }
    if (body.class == "Earthlike body") {
        setFeature("elw")
        attributes.push(`earthlike`)
    }
    if (body.class == "Water world") {
        setFeature("ww")
        attributes.push(`water-world`)
    }
    if (body.class == "Ammonia world") {
        setFeature("aw")
        attributes.push(`ammonia-world`)
    }
    if (store.get(`session.exobiology.signals.${body.address}`)) {
        let signal = store.get(`session.exobiology.signals.${body.address}`)
        if (signal[body.id] != null) {
            setFeature("life")
            attributes.push(`life`)
        }
    }
    return attributes
}

// const bodyHasLife = async (address, id) => {
//     if (store.get(`session.exobiology.signals.${address}`)) {
//         let body = store.get(`session.exobiology.signals.${address}`)
//         if (body[id] != null) {
//             setFeature("life")
//             return true
//         }
//     }
// }

const renderSystemSummary = async (address) => {
    let system = await db.systems.get(address)
    let template = `<header>
        <div class="icon"><i class="fa icarus-terminal-system-orbits"></i></div>
        <div class="title">
            <div class="h1">${system.name}</div>
            <div class="h4">
            <div class="summary">${await bodySummary(address)}</div>
                <div class="features" id="systemFeatures">${systemFeatures()}</div>
            
            </div>
        </div>
        <div class="details">${systemDetails(system)}</div>
    </header>`
    return template
}

const renderBodyElement = async (address, body) => {
    const lineFormatter = require("../../modules/journal/functions").lineFormatter
    body = lineFormatter(body)
    
    if (body.type == "Star" || body.type == "Planet") {
        let element = document.createElement('div')
        rowCss = ["body", body.type == "Star" ? "star" : "planet"]
        element.classList.add(...rowCss)

        let attributes = bodyAttributes(body)
        let signals = store.get(`session.exobiology.signals.${body.address}`)[body.id] ? "siganls found" : ""
        element.innerHTML = `<div class="icon">${body.type == "Planet" ? icon.planet(body.class) : icon.star }</div>
        <div class="details">
            <div class="name">${body.name}</div>
            <div class="class">${body.type == "Planet" ? body.class : starClassification(body.class) }</div>
        </div>
        <div class="attributes">
            ${!body.discovered ? icon.undiscovered : ""}
            ${body.discovered && !body.mapped && body.type != "Star" ? icon.unmapped : ""}
            ${attributes.includes("life") ? icon.life : ""}
            ${body.terraformstate ? icon.terraformable : ""}
            ${body.volcanism ? icon.volcanism : ""}
            ${body.atmosphere ? icon.atmosphere : ""}
            ${body.landable ? icon.landable(body.gravity) : ""}
        </div>
        <div class="distance ${attributes.includes("far-away") ? "far-away" : ""}">${parseFloat(body.distance.toFixed(2))} ls</div>
        <div class="signals">${signals}</div>
        `
        return element
    }
    else { return "" }
}


const renderSystemContent = async (address) => {
    // address = 354678770179
    let element = document.createElement('div')
    element.classList.add("system-summary")

    let summary = await renderSystemSummary(address)
    element.innerHTML = summary

    let bodiesElement = document.createElement('div')
    bodiesElement.classList.add("system-bodies")

    element.appendChild(bodiesElement)
    return element
}


module.exports = { 
    render: renderSystemContent,
    renderBodies: renderBodyElement
}