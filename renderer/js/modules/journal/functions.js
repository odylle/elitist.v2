const lineFormatter = (line) => {
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
const readFolder = async (folder) => {
    const fs = require("fs")
    return new Promise(async resolve => {
        await fs.promises.readdir(folder, (err, files) => {
            if (err) {
                reject(err);
            }
            resolve(files);
        });
    })
}

/**
 * ----------------------------------
 * Elitist: Order Log Files old to new
 * ----------------------------------
 */
const orderLogFiles = async (files) => {
    return new Promise(async (resolve, reject) => {
        let oldFormat = [], newFormat = []
        let logFiles = files.filter(file => file.split(".").pop() == "log")
        for (let file of logFiles) {
            let fileDate = file.split('.')[1]
              if (!fileDate.includes("-")) {
                  oldFormat.push(file)
              } else {
                  newFormat.push(file)
              }
        }
        resolve(oldFormat.concat(newFormat))
    })
}

const readJournal = async (journal) => {}
const processEvent = async (event) => {}
const processResult = async (result) => {}

module.exports = {
    lineFormatter,
    readFolder,
    readJournal,
    processEvent,
    processResult,
    orderLogFiles
}