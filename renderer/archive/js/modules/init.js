const LineByLineReader = require('line-by-line');
/**
 * ----------------------------------
 * Elitist: First Start -> Find Current Location
 * ----------------------------------
 */
const findLocation = async (file) => {
    let locationEvents = [
        "Location", "FSDJump"
    ]
    let lastLocation
    return new Promise( async (resolve, reject) => {
        let lr = new LineByLineReader(file);
        
        lr.on('error', function (err) {
            reject(err)
        });
        lr.on('line', async (line) => {
            lr.pause();
            let ev = JSON.parse(line)
            if (locationEvents.includes(ev.event)) {
                let locationDetails = {address: ev.SystemAddress, coordinates: ev.StarPos}
                lastLocation = ev.StarSystem
                store.set("session.location", locationDetails)
            }
            lr.resume();
        });
        lr.on('end', function () {
            resolve(lastLocation);
        });
    });
}
/**
 * ----------------------------------
 * Elitist: First Start -> Process historic logs
 * ----------------------------------
 */
const historicLogs = async (file) => {
    let events = ["Cargo", "FSDJump", "Location", "Scan", "ScanOrganic", "FSSBodySignals", "SAASignalsFound", "Loadout"]
    const lines = {read: 0, bodies: 0}
    const { EventProcessor, ResultProcessor } = require('./journal')
    return new Promise( async (resolve, reject) => {
        let lr = new LineByLineReader(file);
        lr.on('error', function (err) {
            console.log(err)
            reject(err)
        });
        lr.on('line', async (line) => {
            lr.pause()
            lines.read++
            let ev = JSON.parse(line)
            if (events.includes(ev.event)) {
                await EventProcessor(ev).then(async result => {
                    if (result && ev.event == "Scan") {
                        // await ResultProcessor(result)
                        lines.bodies++
                    }
                })
                lr.resume()
            }
            lr.resume()
        });
        
        lr.on('end', function () {
            resolve(lines);
        });
    });
}

/**
 * ----------------------------------
 * Elitist: First Start -> UI Loader
 * ----------------------------------
 */
const renderLoader = (create) => {
    let main = document.getElementById('mainContent')
    if (!create) {
        main.innerHTML = ""
        return
    }
    main.innerHTML = `<div class="init-application">
    <div><i class="fa-solid fa-heart fa-beat" style="--fa-beat-scale: 2.0;"></i></div>
   <div class="message">Initializing application</div>
   <div class="first-use">On first use this may take a while, whilst we add all the bodies you've visited.
   <br /> The more log files, the longer it takes... But it's for a good cause.
   </div>
   <footer class="notifications" id="notificationCenter"></footer>
    </div>`
}


const initApplication = async () => {
    // Initialize session storage. Only used once
    if (!store.get('session')) {
        store.set('session', helpers.constants.storage.session)
    }
    // Check if we have a current location. This is an indicator that the app was used before.
    // If we don't have an address, scour the log files for the last known location.
    // Also suggest to search for systems and bodies in logs and store.
    return new Promise((resolve, reject) => {
        if (!store.get('session.location.address')) {
            renderLoader(true)
            helpers.lastLogFile(folder).then(async file => {
                let location = await findLocation(folder + "/" + file)
                queue.add(new helpers.Notification(`Your last known location was: <span>${location}</span>`, 'info', 'icarus-terminal-pin-window'));
                return
            }).then(async ()=> {
                let allFiles = await helpers.readFolder(folder)
                let logFiles = allFiles.filter(file => file.split(".").pop() == "log")
                return logFiles               
            }).then(async logFiles => {
                let orderedLogFiles = await helpers.orderLogFiles(logFiles)
                return orderedLogFiles
            }).then(async orderedLogFiles => {
                if (!store.get('logs')) {
                    store.set('logs', {last: null, processed: []})
                }
                let lines = {read: 0, bodies: 0}
                queue.add(new helpers.Notification(`Initializing some application features. Please wait...`, 'info', 'search'));
                for (i in orderedLogFiles) {
                    let file = orderedLogFiles[i]
                    let fileDate = file.split(".")[1]
                    let result = await historicLogs(folder + "/" + file)
                    if (result) {
                        store.set("logs.last", helpers.logDateToTimestamp(fileDate))
                        let logStore = store.get("logs.processed")                        
                        logStore.push(helpers.logDateToTimestamp(fileDate))
                        store.set("logs.processed", logStore)
                        lines.read += result.read
                        lines.bodies += result.bodies
                        continue
                    }
                }
                queue.add(new helpers.Notification(`Historic logs: ${lines.read} lines read, ${lines.bodies} bodies scanned`, 'info', 'icarus-terminal-system-bodies'));
                if (await db.bodies.count()) {
                    // Only resolve after we have all the bodies in the database
                    renderLoader(false)
                    resolve()
                }
            })
        } else {
            // let date = new Date()
            // let yesterday = new Date(date.setDate(date.getDate() - 1))
            // let lastLogDate = new Date(Date.parse(store.get('logs.last')))

            resolve()
        }
    })
}
module.exports = initApplication