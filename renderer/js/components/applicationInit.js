

const logEntry = (icon, message) => {
    const element = document.createElement('div')
    element.classList.add("entry")
    let i = document.createElement('i')
    i.classList.add(...icon)
    element.appendChild(i)
    let span = document.createElement('span')
    span.innerHTML = message
    element.appendChild(span)
    return element
}

const renderInterface = () => {
    const element = document.createElement('div')
    element.classList.add("init")
    element.innerHTML = `<div class="title">
        <div class="icon"><i class="fa icarus-terminal-planet-ringed"></i></div>
        <div class="text">
            <div class="h1">Welcome to Elitist</div>
            <div class="h4">an E:D Companion</div>
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
        let main = document.getElementById('mainContent')
        main.appendChild(renderInterface())
        let logContainer = document.getElementById('initLog')
        const { readFolder, readJournal, orderLogFiles } = require('../modules/journal').functions
        logContainer.insertBefore(logEntry(["fa", "fa-folder-open"], "read folder with logfiles"), logContainer.firstChild)
        await readFolder(folder).then(async (files) => {
            let logFiles = await files.filter(file => file.split(".").pop() == "log")
            
            logContainer.insertBefore(logEntry(["fa", "fa-filter"], "filter out the logfiles"), logContainer.firstChild)
            return logFiles
        }).then(async logFiles => {
            logContainer.insertBefore(logEntry(["fa", "fa-sort"], "ordering logfiles"), logContainer.firstChild)
            let orderedLogFiles = await orderLogFiles(logFiles)
            console.log(orderedLogFiles)
            return orderedLogFiles
        }).then(async orderedLogFiles => {
            for (let file of orderedLogFiles) {
                logContainer.insertBefore(logEntry(["fa", "fa-book-open"], `Reading: ${file}`), logContainer.firstChild)
                await readJournal(folder + "/" + file).then(async result => {
                    console.log("applicationInit > readJournal", result)
                    logContainer.insertBefore(logEntry(["fa", "fa-check", "green"], `File read: ${result} lines processed`), logContainer.firstChild)
                })
                
                // break
            }
        })
        resolve()
    })
}
module.exports = init