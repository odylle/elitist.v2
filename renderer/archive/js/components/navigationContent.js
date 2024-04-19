let formatNumber = require('../helpers').formatNumber

const lineFormatter = (line) => {
    let result = {}
    result.address = line.SystemAddress ? line.SystemAddress : line.address    
    result.id = (line.BodyID != undefined) ? line.BodyID : line.id
    result.name = line.BodyName ? line.BodyName : line.name
    result.type = ("StarType" in line) ? "Star" : ("PlanetClass" in line) ? "Planet" : line.type
    result.class = line.PlanetClass ? line.PlanetClass : line.StarType ? line.StarType : line.class
    result.distance = line.DistanceFromArrivalLS == 0 ? line.DistanceFromArrivalLS : line.extended.distancefromarrivalls
    result.parents = line.Parents ? line.Parents : line.parents
    result.rings = line.Rings ? line.Rings : line.rings
    result.discovered = line.WasDiscovered ? line.WasDiscovered : line.discovered
    result.mapped = line.WasMapped ? line.WasMapped : line.mapped
    result.gravity = line.SurfaceGravity ? line.SurfaceGravity : line.gravity
    result.landable = line.Landable ? line.Landable : line.landable
    result.temperature = line.SurfaceTemperature ? line.SurfaceTemperature : line.extended.temperature
    result.terraformstate = line.TerraformState =! undefined ? line.TerraformState : line.extended.terraformstate =! undefined ? line.extended.terraformstate : false
    result.atmosphere = line.Atmosphere =! undefined ? line.Atmosphere : line.extended.atmosphere =! undefined ? line.extended.atmosphere : false
    result.volcanism = line.Volcanism =! undefined ? line.Volcanism : line.extended.volcanism =! undefined ? line.extended.volcanism : false
    result.materials = line.Materials =! undefined ? line.Materials : line.materials =! undefined ? line.materials : false
    return result
}


const isFuelStar = (starClass) => {
    const fuelStars = ["O", "B", "A", "F", "G", "K", "M"]
    if (fuelStars.includes(starClass)) {
        return true
    }
}
const isVisited = async (address) => {
    let bodies = await db.bodies.where('address').equals(address).toArray()
    if (bodies.length > 0) {
        return true
    }
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

const checkSignals = (address,id) => {
    if (store.get("signals." + address + "." + id)) {
        let signals = store.get("signals." + address + "." + id + ".signals")
        for (i in signals) {
            if (signals[i].Type_Localised == "Biological") {
                setDiscovery("bio")
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

const setDiscovery = (discovered) => {
    let element = document.querySelector(`.${discovered}`)
    if (!element.classList.contains("found")) {
        element.classList.add("found")
    }
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
const setPlanetDiscovery = (planetClass) => {
    let DiscoveredBodies = {
        "Earthlike body": "ew",
        "Water world": "ww",
        "Ammonia world": "aw",        
    }
    if (DiscoveredBodies[planetClass]) {
        setDiscovery(DiscoveredBodies[planetClass])
    }
}
const getDiscoveryAttributes = (line) => {
    let discovered = ""
    let mapped = ""
    function template (icon) {
        return `<i class="far fa-${icon} discovery"></i>`
    }
    // console.log(line.discovered)
    if (line.discovered == false) {
        discovered = template("eye-slash")
    }
    if (line.mapped == false) {
        mapped = template("map")
    }
    // console.log("...", discovered, mapped)
    return discovered + mapped
}

const navigationStop = async (line, seq) => {
    const distanceInLY = require('../helpers').distanceInLY
    let scanAttribute = !isVisited(line.SystemAddress) ? `<i class="fa icarus-terminal-scan"></i>` : "" 
    let fuelAttribute = isFuelStar(line.StarClass) ? '<i data-attribute="fuel" class="fa icarus-terminal-fuel"></i>' : ''
    let distance = store.get("session.location.coordinates") ? distanceInLY(store.get("session.location.coordinates"), line.StarPos) : "-"
    let currentCSS = store.get("session.location.address") == line.SystemAddress ? "current" : ""
    let routeIcon = store.get("session.location.address") == line.SystemAddress ? "location-filled" : "system-orbits"
    return `<div class="stop ${currentCSS}" id="${line.SystemAddress}">
    <div class="seq">${seq}.</div>
    <div class="icon"><i class="fa icarus-terminal-${routeIcon}"></i></div>
    <div class="title">
        <div class="h1">${line.StarSystem}</div>
        <div class="h4 system-bodies">${await getBodiesSummary(line.SystemAddress)}</div>
    </div>
    <div class="attributes">${scanAttribute} ${fuelAttribute}</div>
    <div class="system-distance" data-coordinates="${line.StarPos}" >${distance} LY</div>
</div>`;
}

const renderCurrentSystem = () => {
    let div = document.createElement("div")
    div.classList.add("current-system")
    // Discovery Overview
    let discovery = discoveryOverview()
    div.appendChild(discovery)
    // Bodies Overview
    let bodies = document.createElement("div")
    bodies.classList.add("bodies")
    div.appendChild(bodies)
    return div
}

const discoveryOverview = () => {
    let div = document.createElement("div")
    div.classList.add("discovery")
    div.innerHTML = `<div class="elw"><i class="fa icarus-terminal-planet-earthlike"></i> <span>ELW</span></div>
    <div class="ww"><i class="fa icarus-terminal-planet-water-world"></i> <span>WW</span></div>
    <div class="aw"><i class="fa icarus-terminal-planet-ammonia-world"></i> <span>AW</span></div>
    <div class="bio"><i class="fa icarus-terminal-planet-life"></i> <span>Bio</span></div>
    <div class="high"><i class="fa icarus-terminal-planet-high-value"></i> <span>High Value</span></div>
    <div class="tf"><i class="fa icarus-terminal-planet-terraformable"></i> <span>Terraform</span></div>`
    return div
}

const systemStarRow = (line) => {
    // line = lineFormatter(line)
    let distanceColor = parseFloat(line.distance) > 4000 ? "far-away" : ""
    distance = formatNumber(parseFloat((line.distance).toFixed(2)))
    return `<div class="body star common" id="${store.get("session.location.address") + "." +line.id}">
    <div class="icon"><i class="fa icarus-terminal-star"></i></div>
    <div class="name">${line.name}<span class="class">${line.class} Class Main Sequence</span></div>
    <div class="distance ${distanceColor}">${distance} Ls</div>
</div>`
}

const systemBodyRow = (line) => {
    let planetIcon = getPlanetIcon(line.class)
    let life = hasBioSignals(store.get("signals." + store.get("session.location.address") + "." + line.id)) ? '<i class="fa icarus-terminal-plant bio"></i>' : "" 
    let volcanism = line.volcanism ? '<i class="fa icarus-terminal-planet-volcanic attr-volcanic"></i>' : ""
    let gravityColor = parseFloat(line.gravity) > 1.5 ? "high-gravity" : ""
    // let gravityText = parseInt(line.gravity) > 1.5 ? `<span class="gravity-text">${parseFloat(line.gravity).toFixed(2)}</span>` : ""
    let landable = line.landable ? `<i class="fa icarus-terminal-planet-lander ${gravityColor}"></i><span class="gravity-text ${gravityColor}">${parseFloat(line.gravity).toFixed(2)}</span>` : ""    
    let atmosphere = line.atmosphere ? '<i class="fa icarus-terminal-planet-atmosphere"></i>' : ""
    let terraformable = line.terraformstate ? '<i class="fa icarus-terminal-planet-terraformable"></i>' : ""
    let discoverAndMap = getDiscoveryAttributes(line)
    let attributes = "" + life + volcanism + landable + atmosphere + terraformable + discoverAndMap
    let distance = line.distance
    let distanceColor = parseFloat(distance) > 4000 ? "far-away" : ""
    distance = formatNumber(parseFloat(distance.toFixed(2)))
    let signals = checkSignals(store.get("session.location.address"), line.id)
    let interesting = life || landable && terraformable ? "interesting" : "common"
    setPlanetDiscovery(line.class)
    return `<div class="body planet ${interesting}" id="${store.get("session.location.address") + "." +line.id}">
    <div class="icon">${planetIcon}</div>
    <div class="name">${line.name}<span class="class">${line.class}</span></div>
    <div class="attributes">${attributes}</div>
    <div class="distance ${distanceColor}">${distance} Ls</div>
    <div class="signals">${signals}</div>
</div>`
}

const bodyRow = (line) => {
    line = lineFormatter(line)
    if (line.type == "Star") {
        return systemStarRow(line)
    }
    if (line.type == "Planet") {
        return systemBodyRow(line)
    }
}

const updateLocation = async () => {
    let element = document.getElementById(store.get("session.location.address"))
    let seqValue = element.querySelector(".seq").innerHTML
    seqValue = parseInt(seqValue.replace(".", ""))
    store.set("session.route.current", seqValue)
    if (element) {
        updateAllCoords()
        
        // Set previous row to previous
        if (element.previousElementSibling && element.previousElementSibling.classList.contains("current-system")) {
            element.previousElementSibling.remove()
        }
        if (element.previousElementSibling && element.previousElementSibling.classList.contains("current")) {
            element.previousElementSibling.classList.remove("current")
            element.previousElementSibling.querySelector(".icon").innerHTML = `<i class="fa icarus-terminal-system-orbits"></i>`
            element.previousElementSibling.classList.add("previous")
        }
        // Set Row class to current

        element.classList.add("current")
        element.querySelector(".icon").innerHTML = `<i class="fa icarus-terminal-location-filled"></i>`
    }
    let bodies = await db.bodies.where('address').equals(store.get("session.location.address")).toArray()
    if (bodies) {
        await updateCurrentSystem()
    }
}

const updateCurrentSystem = async (body) => {
    let parent = document.getElementById(store.get("session.location.address"))
    let allowedBodies = ["Star", "Planet"]
    if (parent && !parent.nextElementSibling.classList.contains("current-system")) {
        let current = renderCurrentSystem()
        parent.after(current)
    }
    if (body) {
        let idExists = document.getElementById(store.get("session.location.address") + "." + body.BodyID) ? true : false
        if (parent && !idExists) {
            if (allowedBodies.includes(body.type)) {
                let bodyElement = bodyRow(body)
                parent.nextSibling.querySelector(".bodies").innerHTML += bodyElement
            }
        }
    } else {
        let bodies = await db.bodies.where('address').equals(store.get("session.location.address")).toArray()
        let bodiesElement = parent.nextElementSibling.querySelector(".bodies")
        if (bodiesElement.children.length > 0) { bodiesElement.innerHTML = "" } 
        for await (body of bodies) {
            if (parent && allowedBodies.includes(body.type)) {
                let bodyElement = bodyRow(body)
                parent.nextSibling.querySelector(".bodies").innerHTML += bodyElement
            } 
        }
    }    
}

const updateAllCoords = () => {
    return new Promise(resolve => {
        let coords = document.querySelectorAll(".system-distance")
        coords.forEach(coord => {
            let distance = coord.getAttribute("data-coordinates").split(",")
            if (distance) {
                let current = store.get("session.location.coordinates")
                let distanceInLY = require('../helpers').distanceInLY
                let distanceLY = distanceInLY(current, distance)
                if (distanceLY == 0) {
                    coord.innerHTML = `CURRENT SYSTEM`
                } else {
                    coord.innerHTML = `${distanceLY} Ly`
                }
            }
        })
        resolve()
    })
}

const updateAllSystemBodies = () => {
    return new Promise(async resolve => {
        let element = document.getElementById(store.get("session.location.address"))
        // let previous = element.previousElementSibling
        let bodies = await db.bodies.where('address').equals(store.get("session.location.address")).toArray()
        let update = await getBodiesSummary(bodies)
        console.log("updateAllSystemBodies: ",update)
        element.querySelector(".system-bodies").innerHTML = update
        resolve()
    })
}
// const subText = {
//     navigation: () => {
//         let route = store.get('session.route')
//         if (!route || route.length == 0) return "No Route Found"
//         return `${route.length} jumps remaining`
//     }
// }



module.exports = { navigationStop, updateLocation, updateCurrentSystem, updateAllSystemBodies };