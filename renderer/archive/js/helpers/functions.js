const bodyLineformatter = (line) => {
    if (line.extended == undefined) { line.extended = {distancefromarrivalls: 0}}
    let result = {}
    result.address = line.SystemAddress ? line.SystemAddress : line.address    
    result.id = (line.BodyID != undefined) ? line.BodyID : line.id
    result.name = line.BodyName ? line.BodyName : line.name
    result.type = ("StarType" in line) ? "Star" : ("PlanetClass" in line) ? "Planet" : line.type
    result.class = line.PlanetClass ? line.PlanetClass : line.StarType ? line.StarType : line.class
    result.distance = line.DistanceFromArrivalLS == 0 ? line.DistanceFromArrivalLS : line.extended.distancefromarrivalls != undefined ? line.extended.distancefromarrivalls : "unknown"
    result.parents = line.Parents ? line.Parents : line.parents
    result.rings = line.Rings ? line.Rings : line.rings
    result.discovered = line.WasDiscovered ? line.WasDiscovered : line.discovered
    result.mapped = line.WasMapped ? line.WasMapped : line.mapped
    result.gravity = line.SurfaceGravity ? line.SurfaceGravity : line.gravity
    result.landable = line.Landable ? line.Landable : line.landable
    result.temperature = line.SurfaceTemperature ? line.SurfaceTemperature : line.extended.temperature
    result.terraformstate = line.TerraformState != undefined ? line.TerraformState : line.extended.terraformstate != undefined ? line.extended.terraformstate : false
    result.atmosphere = line.Atmosphere != undefined ? line.Atmosphere : line.extended.atmosphere != undefined ? line.extended.atmosphere : false
    result.volcanism = line.Volcanism != undefined ? line.Volcanism : line.extended.volcanism != undefined ? line.extended.volcanism : false
    result.materials = line.Materials != undefined ? line.Materials : line.materials != undefined ? line.materials : false
    return result
}

// System functionality
const isKnownSystem = async (address) => {
    let bodies = await db.bodies.where('address').equals(address).toArray()
    if (bodies.length > 0) {
        return true
    }
}

const getPlanetAttributes = (body) => {
    let attributes = []
    let DiscoveredBodies = {
        "Earthlike body": "elw",
        "Water world": "ww",
        "Ammonia world": "aw",        
    }
    if (DiscoveredBodies[body.class]) {
        attributes.push(DiscoveredBodies[body.class])
        setDiscovery(DiscoveredBodies[body.class])
    }
    if (body.discovered == false) {
        attributes.push("undiscovered")
    }
    if (body.mapped == false && body.discovered == true) {
        attributes.push("unmapped")
    }
    let hasLife = hasBioSignals(store.get("signals." + store.get("session.location.address") + "." + body.id))
    if (hasLife) {
        attributes.push("bio")
        setDiscovery("bio")
    }
    if (body.terraformstate) {
        attributes.push("terraformable")
        attributes.push("high-value")
        setDiscovery("high")
    }
    if (body.volcanism) {
        attributes.push("volcanic")
    }
    if (body.landable) {
        attributes.push("landable")
        attributes.push(`gravity:${body.gravity}`)
    }
    if (body.atmosphere) {
        attributes.push("atmosphere")
    }
    return attributes
}

const getAttributeIcons = (attributes) => {
    let attributeIcons = ""
    if (attributes.includes("undiscovered")) {
        attributeIcons += `<i class="far fa-eye-slash attr-undiscovered"></i>`
    }
    if (attributes.includes("unmapped")) {
        attributeIcons += `<i class="far fa-map attr-unmapped"></i>`
    }
    if (attributes.includes("bio")) {
        attributeIcons += `<i class="fa icarus-terminal-plant attr-bio"></i>`
    }
    if (attributes.includes("high-value")) {
        attributeIcons += `<i class="fa icarus-terminal-planet-high-value attr-terraformable"></i>`
    }
    if (attributes.includes("terraformable")) {
        attributeIcons += `<i class="fa icarus-terminal-planet-terraformable attr-terraformable"></i>`
    }
    if (attributes.includes("volcanic")) {
        attributeIcons += `<i class="fa icarus-terminal-planet-volcanic attr-volcanic"></i>`
    }
    if (attributes.includes("landable")) {
        let index = attributes.findIndex(attribute => attribute.includes("gravity"))
        let gravity = attributes[index].split(":")[1]
        let gravityCss = parseFloat(gravity) > 1.5 ? "high-gravity" : ""
        attributeIcons += `<i class="fa icarus-terminal-planet-lander attr-landable ${gravityCss}"></i><span class="gravity-text ${gravityCss}">${parseFloat(gravity).toFixed(2)}</span>`
    }
    if (attributes.includes("high-gravity")) {
        attributeIcons += `<i class="fa icarus-terminal-planet-gravity attr-high-gravity"></i>`
    }
    if (attributes.includes("atmosphere")) {
        attributeIcons += `<i class="fa icarus-terminal-planet attr-atmosphere"></i>`
    }
    return attributeIcons
}

// Interesting body discovery
const setDiscovery = (discovered) => {
    let element = document.querySelector(`.${discovered}`)
    if (!element.classList.contains("found")) {
        element.classList.add("found")
    }
}

const setPlanetDiscovery = (planetClass) => {
    let DiscoveredBodies = {
        "Earthlike body": "elw",
        "Water world": "ww",
        "Ammonia world": "aw",        
    }
    if (DiscoveredBodies[planetClass]) {
        setDiscovery(DiscoveredBodies[planetClass])
    }
}

// Stars
const isFuelStar = (starClass) => {
    const fuelStars = ["O", "B", "A", "F", "G", "K", "M"]
    if (fuelStars.includes(starClass)) {
        return true
    }
}

// Planets
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
        "Water giant": { icon: "planet-water-giant", css: "water-giant" },
        "Water giant with life": { icon: "planet-water-giant", css: "water-giant" },
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

const getBodiesSummary = async (address) => {
    function template (icon, count, word) {
        return `<i class="fa icarus-terminal-${icon}"></i><span>${count} ${ count == 1 ? word : word + 's' }</span>`
    }

    let bodies = await db.bodies.where('address').equals(address).toArray()
    let stars = 0
    let planets = 0
    if (bodies.length > 0) {
        for (body of bodies) {
            if (body.type == "Star") {
                stars++
            } else if (body.type == "Planet") {
                planets++
            }
        }
        let starTmpl = template("star", stars, "Star")
        let planetTmpl = planets > 0 ? template("planet", planets, "Planet") : ""
        return starTmpl + planetTmpl
    }
    return `<span>Unknown System</span>`

}

const hasBioSignals = (signals) => {
    for (i in signals) {
        if (signals[i].Type_Localised == "Biological") {
            return true
        }
        if (signals[i].length > 0) {
            if (signals[i][0].Type_Localised == "Biological") {
                return true
            }
        }
    }
    return false
}

const checkSignals = (address,id) => {
    if (store.get("signals." + address + "." + id)) {
        let signals = store.get("signals." + address + "." + id + ".signals")
        for (i in signals) {
            if (signals[i].Type_Localised == "Biological") {
                if (!signals[i].Genuses) {
                    let count = signals[i].Count
                    let signalsWord = count > 1 ? "Signals" : "Signal"
                    return `<i class="fa icarus-terminal-signal"></i><span>${count} Biological ${signalsWord} found. Use FSS</span>`
                } else {
                    console.log(signals[i])
                }
            }
        }
    }
    return ""
}




module.exports = {
    bodyLineformatter,
    getPlanetAttributes,
    getAttributeIcons,
    setDiscovery,
    setPlanetDiscovery,
    isFuelStar,
    getPlanetIcon,
    getBodiesSummary,
    hasBioSignals,
    checkSignals,
    isKnownSystem
}