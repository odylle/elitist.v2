const { System, Star, Planet, Body } = require('./index')
const Cargo = async (line) => {
    return new Promise(resolve => {
        store.set("session.cargo.count", line.Count)
        resolve()
    })

}

const Location = async (line) => {
    return new Promise(resolve => {
        // Set current location
        let locationDetails = {address: line.SystemAddress, coordinates: line.StarPos}
        store.set("session.location", locationDetails)

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

        resolve({ callback: "updateLocation", data: locationDetails })
    })

}
const FSDTarget = async (line) => {
    return new Promise(resolve => {
        resolve()
    })
}
const FSDJump = async (line) => {
    return new Promise(resolve => {
        // Set current location
        let locationDetails = {address: line.SystemAddress, coordinates: line.StarPos}
        store.set("session.location", locationDetails)

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
        result = { callback: "updateLocation", data: locationDetails }
        resolve(result)
    })
}
const FSSAllBodiesFound = async (line) => {
    return new Promise(resolve => {
        result = {callback: "updateAllSystemBodies", data: ""}
        resolve()
    })

}

const FSSBodySignals = async (line) => {
    return new Promise(resolve => {
        store.set("signals." + line.SystemAddress + "." + line.BodyID + ".signals" , line.Signals)
        resolve()
    })
}

const Loadout = async (line) => {
    return new Promise(resolve => {
        store.set("session.cargo.capacity", line.CargoCapacity)
        resolve()
    })
}

const NavRoute = async (line) => {
    return new Promise(async resolve => {
        document.getElementById('navigationContent').innerHTML = ""
        await helpers.readJson('NavRoute.json').then(async json => {
            for (i in json.Route) {
                if (json.Route.length > 0) {
                    store.set("session.route.summary", json.Route)
                    document.getElementById('navigationSubtext').innerHTML = `${json.Route.length} jumps remaining`
                } else {
                    document.getElementById('navigationSubtext').innerHTML = `No route planned`
                }
                document.getElementById('navigationContent').innerHTML += await components.navigationStop(json.Route[i], parseInt(i) + 1)
            }
            result = { callback: "updateLocation", data: store.get("session.location") }
            resolve(result)
        })
    })
}

const SAASignalsFound = async (line) => {
    return new Promise(resolve => {
        if ("Genuses" in line) {
            store.set("signals." + line.SystemAddress + "." + line.BodyID + ".genuses" , line.Genuses)
        }
        resolve()
    })
}

const Scan = async (line) => {
    return new Promise(async (resolve) => {
        let obj
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
        }
        // result = { callback: "updateCurrentSystem", data: obj }
        result = true
        resolve(result)
    })
}

const ScanBaryCentre = async (line) => {
    // return new Promise(resolve => {
    //     const { Body } = require('./index')
    //     obj = new Body(line.SystemAddress, line.BodyID)
    //     bodyUpdate = {
    //         type: "BaryCentre",
    //     }
    //     Object.assign(obj, bodyUpdate);
    //     obj.save()
    //     resolve()
    // })
}

const ScanOrganic = (line) => {
    return new Promise(async resolve => {
        if (line.ScanType == "Analyse") {
            let biolog = {
                address: line.SystemAddress,
                body: line.Body,
                genus: line.Genus_Localised,
                species: line.Species_Localised,
                variant: line.Variant_Localised
            }
            await db.biolog.add(biolog).catch(() => { });
        }        
        resolve()
    })
}

const Shutdown = async (line) => {
    return new Promise(resolve => {
        fromLine = 0
        fileName = undefined
        store.set("app", {fromLine: 0, fileName: fileName})
        resolve()
    })
}

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
    Shutdown
}