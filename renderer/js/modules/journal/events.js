const Cargo = async (line) => {}
const FSDTarget = async (line) => {}
const FSDJump = async (line) => {
    return new Promise( resolve => {
        // Set current location
        let locationDetails = {address: line.SystemAddress, coordinates: line.StarPos}
        store.set("session.location", locationDetails)

        const { System, Body } = require("./classes")
        // Store System information
        let systemObj = new System(line.SystemAddress);
        var systemUpdate = {
            name: line.StarSystem,
            position: line.StarPos,
            allegiance: line.SystemAllegiance,
            economy: {
                first: line.SystemEconomy_Localised,
                second: line.SystemSecondEconomy_Localised,
            },
            government: line.SystemGovernment_Localised,
            security:
                line.SystemSecurity_Localised == undefined
                ? line.SystemSecurity
                : line.SystemSecurity_Localised,
            population: line.Population,
        };
        Object.assign(systemObj, systemUpdate);
        systemObj.save();

        // Store Body Information
        let bodyObj = new Body(line.SystemAddress, line.BodyID);
        var bodyUpdate = {
            name: line.Body,
            type: line.BodyType,
        };
        Object.assign(bodyObj, bodyUpdate);
        bodyObj.save();

        // Resolve
        resolve({callback: "system.update.location", data: line.SystemAddress})
    })
}
const FSSAllBodiesFound = async (line) => {}
const FSSBodySignals = async (line) => {
    return new Promise( async resolve => {
        line.Signals.forEach(signal => {
            if (signal.Type_Localised == "Biological") {
                if (!store.get("session.exobiology.signals." + line.SystemAddress)) { store.set("session.exobiology.signals." + line.SystemAddress, {}) }
                store.set("session.exobiology.signals." + line.SystemAddress + "." + line.BodyID, signal.Count)
            }
        })
        resolve()
    })
}
const Loadout = async (line) => {}
const Location = async (line) => {
    return new Promise( resolve => {
        // Set current location
        let locationDetails = {address: line.SystemAddress, coordinates: line.StarPos}
        store.set("session.location", locationDetails)

        const { System, Body } = require("./classes")
        // Store System information
        let systemObj = new System(line.SystemAddress);
        var systemUpdate = {
            name: line.StarSystem,
            position: line.StarPos,
            allegiance: line.SystemAllegiance,
            economy: {
                first: line.SystemEconomy_Localised,
                second: line.SystemSecondEconomy_Localised,
            },
            government: line.SystemGovernment_Localised,
            security:
                line.SystemSecurity_Localised == undefined
                ? line.SystemSecurity
                : line.SystemSecurity_Localised,
            population: line.Population,
        };
        Object.assign(systemObj, systemUpdate);
        systemObj.save();

        // Store Body Information
        let bodyObj = new Body(line.SystemAddress, line.BodyID);
        var bodyUpdate = {
        name: line.Body,
        type: line.BodyType,
        };
        Object.assign(bodyObj, bodyUpdate);
        bodyObj.save();

        resolve({callback: "system.update.location", data: line.SystemAddress})
    })
}
const NavRoute = async (line) => {}
const SAASignalsFound = async (line) => {
    // Signals found in the system
    return new Promise( async resolve => {
        let genuses = {}
        if ("Genuses" in line) {
            line.Genuses.forEach(genus => {
                if (!store.get("session.exobiology.signals." + line.SystemAddress)) { store.set("session.exobiology.signals." + line.SystemAddress, {})}
                // genuses.push(genus.Genus_Localised)
                genuses[genus.Genus_Localised] = {progress: 0, species: null, variant: null}
            })
            store.set("session.exobiology.signals." + line.SystemAddress + "." + line.BodyID , genuses)
            resolve({callback: "system.update.signals", data: line.BodyID})
        }
        else { resolve() }
    })
}
const Scan = async (line) => {
    return new Promise( resolve => {
        const { Star, Planet } = require("./classes")
        let obj, result
        if (line.StarType) {
            obj = new Star(line.SystemAddress, line.BodyID);
            var starUpdate = {
                name: line.BodyName,
                class: line.StarType,
                parents: line.Parents,
                extended: {
                    age: line.Age_MY,
                    distancefromarrivalls: line.DistanceFromArrivalLS,
                    luminosity: line.Luminosity,
                    mass: line.StellarMass,        
                    subclass: line.Subclass,
                    temperature: line.SurfaceTemperature,
                },
                rings: line.Rings,
                discovered: line.WasDiscovered,
                mapped: line.WasMapped,
          };
          Object.assign(obj, starUpdate);
          obj.save()
          result = {callback: "system.update.bodies", data: line.BodyID}
        } else if (line.PlanetClass) {
            obj = new Planet(line.SystemAddress, line.BodyID);
            planetUpdate = {
                name: line.BodyName,
                class: line.PlanetClass,
                parents: line.Parents,
                rings: line.Rings,
                discovered: line.WasDiscovered,
                mapped: line.WasMapped,
                materials: line.Materials,
                gravity: line.SurfaceGravity,
                landable: line.Landable,
                extended: {
                    atmosphere: line.Atmosphere,
                    atmospheretype: line.AtmosphereType,
                    atmospherecomposition: line.AtmosphereComposition,
                    composition: line.Composition,
                    distancefromarrivalls: line.DistanceFromArrivalLS,
                    mass: line.MassEM,
                    pressure: line.SurfacePressure,
                    temperature: line.SurfaceTemperature,
                    terraformstate: line.TerraformState,
                    tidallock: line.TidalLock,
                    volcanism: line.Volcanism,
                },
            };
            Object.assign(obj, planetUpdate);
            obj.save()
            result = {callback: "system.update.bodies", data: line.BodyID}
        }
        resolve(result)
    })
}
const ScanOrganic = async (line) => {
    return new Promise(async resolve => {
        let genus = line.Genus_Localised, species = line.Species_Localised.split(" ").pop(), variant = line.Variant_Localised.split(" ").pop()
        if (line.ScanType == "Log") {
            if (!store.get("session.exobiology.signals." + line.SystemAddress)) { store.set("session.exobiology.signals." + line.SystemAddress, {})}
            store.set(`session.exobiology.signals.${line.SystemAddress}.${line.Body}.${genus}.species`, species)
            store.set(`session.exobiology.signals.${line.SystemAddress}.${line.Body}.${genus}.variant`, variant)
            store.set(`session.exobiology.signals.${line.SystemAddress}.${line.Body}.${genus}.progress`, 1)
            resolve({callback: "system.update.signals", data: line.Body})            
        }
        if (line.ScanType == "Sample") {
            let count = store.get(`session.exobiology.signals.${line.SystemAddress}.${line.Body}.${genus}.progress`)
            store.set(`session.exobiology.signals.${line.SystemAddress}.${line.Body}.${genus}.progress`, count + 1)
            resolve({callback: "system.update.signals", data: line.Body})
        }
        if (line.ScanType == "Analyse") {
            // Add to session. The values there are cleared after a SellorganicData event
            if (!store.get(`session.exobiology.samples.${genus}.${species}.${variant}`)) {
                store.set(`session.exobiology.samples.${genus}.${species}.${variant}.count`, 1)
            } else {
                let count = store.get(`session.exobiology.samples.${genus}.${species}.${variant}.count`)
                count++
                store.set(`session.exobiology.samples.${genus}.${species}.${variant}.count`, count)
            }
            
            const Organic = require("./classes").Organic
            let obj = new Organic(genus, species, variant)
            await obj.init()
            let location = {address: line.SystemAddress, body: line.Body}
            obj.locations.push(location)
            await obj.save()

            resolve()            
        }
        
    })
}
const SellOrganicData = async (line) => {
    return new Promise(async resolve => {
        store.set("session.exobiology.samples", {})
        const Organic = require("./classes").Organic
        for await (let organic of line.BioData) {
            let obj = new Organic(organic.Genus_Localised, organic.Species_Localised.split(" ").pop(), organic.Variant_Localised.split(" ").pop())
            await obj.init()
            if (obj.values.value == 0 || obj.values.value != organic.Value) {
                obj.values.value = organic.Value
                obj.values.bonus = organic.Bonus
                await obj.save()
            }
        }
        resolve()
    })
}
const Shutdown = async (line) => {}

module.exports = {
    Cargo,
    FSDTarget,
    FSDJump,
    FSSAllBodiesFound,
    FSSBodySignals,
    Loadout,
    Location,
    NavRoute,
    SAASignalsFound,
    Scan,
    ScanOrganic,
    SellOrganicData,
    Shutdown
}