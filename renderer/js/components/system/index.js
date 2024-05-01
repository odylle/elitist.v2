const update = require("./update")
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
    if (starClass == "TTS") {
        return `T Tauri star`
    }
    if (starClass == undefined) {
        return `Unknown class`
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
    if (!body.discovered) {
        attributes.push(`undiscovered`)
    }
    if (body.discovered && !body.mapped) {
        attributes.push(`unmapped`)
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

const bodyCss = (css, attributes) => {
    if (attributes.includes("far-away")) {
        css.push("far-away")
    }
    if (attributes.includes("earthlike")) {
        css.push("earthlike")
    }
    if (attributes.includes("water-world")) {
        css.push("water-world")
    }
    if (attributes.includes("ammonia-world")) {
        css.push("ammonia-world")
    }
    if (attributes.includes("terraformable")) {
        css.push("terraformable")
    }
    return css
}

const isValuable = (genus, species) => {
    const bioValues = require("../../modules/journal/exobiology").values
    if (bioValues[genus][species] > 10000000) {
        return true
    }
}
const getColonyRange = (genus) => {
    const range = require("../../modules/journal/exobiology").range
    return range[genus]
}

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
    const {lineFormatter, formatNumber} = require("../../modules/journal/functions")
    body = lineFormatter(body)
    
    if (body.type == "Star" || body.type == "Planet") {
        let element = document.createElement('div')
        element.id = `${body.address}.${body.id}`
        let css = ["body", body.type == "Star" ? "star" : "planet"]

        let attributes = bodyAttributes(body)
        css = bodyCss(css, attributes)
        element.classList.add(...css)
        element.innerHTML = `<div class="icon">
            ${body.type == "Planet" ? icon.planet(body.class) : icon.star }
            ${attributes.includes("atmosphere") ? `<div class="atmosphere"><i class="fa icarus-terminal-atmosphere"></i></div>` : ""}
            ${attributes.includes("landable") ? `<div class="lander"><i class="fa icarus-terminal-planet-lander"></i></div>` : ""}
        </div>
        <div class="details">
            <div class="name">${body.name}</div>
            <div class="class">${body.type == "Planet" ? body.class : starClassification(body.class) }</div>
        </div>
        <div class="attributes">
            ${attributes.includes("landable") ? icon.landable(body.gravity) : ""}
            ${attributes.includes("life") ? icon.life : ""}
            ${attributes.includes("terraformable") ? icon.terraformable : ""}
            ${attributes.includes("volcanism") ? icon.volcanism : ""}

            ${attributes.includes("undiscovered") ? icon.undiscovered : ""}
            ${attributes.includes("unmapped") && body.type != "Star" ? icon.unmapped : ""}
        </div>
        <div class="distance ${attributes.includes("far-away") ? "far-away" : ""}">${formatNumber(body.distance.toFixed(2))}Ls</div>
        <div class="signals">${await renderSignals(body.address, body.id) }</div>
        `
        return element
    }
    else { return "" }
}

const renderSignalElement = (genus, values) => {
    return `<div>
        <span class="genus">
            ${isValuable(genus, values.species) ? `<i class="fa icarus-terminal-planet-high-value"></i>` : ""}
            ${genus}</span> 
        <span class="species">${values.species != null ? values.species : ""}</span> 
        <span class="variant">${values.variant != null ? values.variant : ""}</span>
    </div>
    <div>
        <span class="colony-range">${getColonyRange(genus)}m</span>
        <span class="progress">
            <i class="fa ${values.progress < 1 ? `fa-square` : `fa-check-square`}"></i>
            <i class="fa ${values.progress < 2 ? `fa-square` : `fa-check-square`}"></i>
            <i class="fa ${values.progress < 3 ? `fa-square` : `fa-check-square`}"></i>
        </span>
    </div>`
}

const renderSignals = async (address, body) => {
    let result = ""
    if (address in store.get(`session.exobiology.signals`) && body in store.get(`session.exobiology.signals.${address}`)) {
        let signals = store.get(`session.exobiology.signals.${address}`)[body]
        if (typeof signals == "number") {
            return `<div class="only-count"><i class="fa icarus-terminal-signal"></i> ${signals} ${signals > 1 ? "signals" : "signal" } Found. Use FSS</div>`
        } else {
            Object.entries(signals).forEach(async ([genus, values]) => {
                let element = document.createElement('div')
                let css = ["signal", genus.toLocaleLowerCase()]
                element.classList.add(...css)
                element.innerHTML = renderSignalElement(genus, values)
                result += element.outerHTML
            });
            return result
        }
    }
    else { return "" }
}


const renderSystemContent = async (address) => {
    // address = 357522412162
    let element = document.createElement('div')
    element.classList.add("system-summary")
    element.id = address
    element.innerHTML = `<span class="no-address">No System Found</span>`
    if (address != null) {
        let summary = await renderSystemSummary(address)
        element.innerHTML = summary

        let bodiesElement = document.createElement('div')
        bodiesElement.classList.add("system-bodies")

        element.appendChild(bodiesElement)
    }
    return element
}


module.exports = {
    summary: bodySummary, 
    render: renderSystemContent,
    renderBodies: renderBodyElement,
    renderSummary: renderSystemSummary,
    renderSignalElement: renderSignalElement,
    starClassification: starClassification,
    update: update
}