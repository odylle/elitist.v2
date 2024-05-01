function timeNow() {
    var d = new Date(),
      h = (d.getHours()<10?'0':'') + d.getHours(),
      m = (d.getMinutes()<10?'0':'') + d.getMinutes();
      s = (d.getSeconds()<10?'0':'') + d.getSeconds();
    return h + ':' + m + ':' + s;
}

const logEntry = (icon, message) => {
    const element = document.createElement('div')
    element.classList.add("entry")
    let i = document.createElement('i')
    i.classList.add(...icon)
    element.appendChild(i)
    let logSpan = document.createElement('span')
    logSpan.classList.add("entry-time")
    logSpan.innerHTML = timeNow()
    element.appendChild(logSpan)
    let span = document.createElement('span')
    span.innerHTML = message
    element.appendChild(span)
    return element
}

const renderContent = () => {
    const element = document.createElement('div')
    element.classList.add("init")
    element.innerHTML = `<div class="title">
        <div class="icon"><i class="fa icarus-terminal-planet-ringed"></i></div>
        <div class="text">
            <div class="h1">Welcome to Elitist</div>
            <div class="h4">an Elite:Dangerous Companion</div>
        </div>
    </div>
    <div class="message">
    Be patient whilst we initialize the application. 
    This may take a while depending on the number of logfiles found.
    We are storing visited systems and bodies for future use.
    </div>
    <div class="log" id="initLog"></div>
    <footer>2024</footer>`
    return element
}
const init = async () => {
    return new Promise(async resolve => {   
        if (!store.get('session')) {
            const schema = require('../constants').schema 
            store.set(schema)
        }   
        let main = document.getElementById('mainContent')
        main.appendChild(renderContent())
        let logContainer = document.getElementById('initLog')
        const { readFolder, readJournal, orderLogFiles, logDateToTimestamp } = require('../modules/journal').functions
        logContainer.insertBefore(logEntry(["fa", "fa-folder-open"], "check folder for unprocessed logfiles"), logContainer.firstChild)
        await readFolder(folder).then(async (files) => {
            let logFiles = await files.filter(file => file.split(".").pop() == "log")
            logContainer.insertBefore(logEntry(["fa", "fa-filter"], "filter out non logfiles"), logContainer.firstChild)
            return logFiles
        }).then(async logFiles => {
            logContainer.insertBefore(logEntry(["fa", "fa-sort"], "ordering logfiles by date"), logContainer.firstChild)
            let orderedLogFiles = await orderLogFiles(logFiles)
            return orderedLogFiles
        }).then(async orderedLogFiles => {
            let bodiesInDB = 0
            for (let file of orderedLogFiles) {
                let fileDate = file.split('.')[1]
                let logDate = logDateToTimestamp(fileDate)
                let processedLogFiles = store.get("logs.files")
                if (!processedLogFiles.includes(logDate)) {
                    logContainer.insertBefore(logEntry(["fa", "fa-book-open"], `Reading: ${file}`), logContainer.firstChild)
                    store.set("app.fromLine", 0)
                    await readJournal(folder + "/" + file).then(async result => {
                        await db.bodies.count().then(count => {
                            logContainer.insertBefore(logEntry(["fa", "fa-plus", "info"], `<span class="highlight">${count-bodiesInDB}</span> Bodies added`), logContainer.firstChild)
                            bodiesInDB = count
                        })
                        logContainer.insertBefore(logEntry(["fa", "fa-check", "success"], `File read: <span class="highlight">${result}</span> lines processed`), logContainer.firstChild)
                    })

                    processedLogFiles.push(logDate)
                    store.set("logs.files", processedLogFiles)
                    store.set("logs.last", logDate)
                }
            }
        }).catch(e => {
            console.log(folder)
            logContainer.insertBefore(logEntry(["fa", "fa-exclamation-triangle", "error"], e), logContainer.firstChild)
        })
        logContainer.insertBefore(logEntry(["fa", "fa-check-square", "success"], `Files read, events processed, loading application...`), logContainer.firstChild)
        resolve()
    })
}
module.exports = init