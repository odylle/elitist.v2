const LineByLineReader = require('line-by-line');
const constants = require('./constants'); 
const globals = require('./globals');  
const functions = require('./functions');
const notifications = require('./notifications');
/**
 * ----------------------------------
 * Elitist: Distance between 2 systems
 * ----------------------------------
 */
const distanceInLY = (origin, dest) => {
  let distance = Math.sqrt(
    Math.pow(dest[0] - origin[0], 2) +
      Math.pow(dest[1] - origin[1], 2) +
      Math.pow(dest[2] - origin[2], 2)
  );
  return Math.round(distance * 10) / 10;
};

/**
 * ----------------------------------
 * Elitist: Format Number
 *
 * Large numbers will have added commas.
 * Used for credits and population
 * ----------------------------------
 */
const formatNumber = (x) => {
  if (x != undefined) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }
};

/**
 * ----------------------------------
 * Elitist: Read NavRoute.json
 * ----------------------------------
 */
const readJson = (file) => {
    return new Promise(resolve => {
        fetch([folder, file].join('/'))
            .then((response) => response.json())
            .then((json) => resolve(json));
    })
}

/**
 * ----------------------------------
 * Elitist: Read Log Folder
 * ----------------------------------
 */
const readFolder = async (folder) => {
  const fs = require("fs");
  return new Promise( async (resolve, reject) => {
      await fs.promises.readdir(folder, (err, files) => {
            if (err) {
                reject(err);
            }
            resolve(files);
      });
  });
}

/**
 * ----------------------------------
 * Elitist: Order Log Files old to new
 * ----------------------------------
 */
const orderLogFiles = async (files) => {
  return new Promise(async (resolve, reject) => {
      let oldFormat = []
      let newFormat = []
      let logFiles = files.filter(file => file.split(".").pop() == "log")
      for (let file of logFiles) {
          let fileDate = file.split('.')[1]
            if (!fileDate.includes("-")) {
                oldFormat.push(file)
            } else {
                newFormat.push(file)
            }
      }
    //   console.log(oldFormat, newFormat)
      resolve(oldFormat.concat(newFormat))
  })
}

/**
 * ----------------------------------
 * Elitist: Read supplied file.
 * ----------------------------------
 */
const processLogFile = async (file) => {
    let lineRead = 0
    const { EventProcessor, ResultProcessor } = require('../modules/journal')
    return new Promise( async (resolve, reject) => {
        let lr = new LineByLineReader(file);
        lr.on('error', function (err) {
            reject(err)
        });
        lr.on('line', async (line) => {
            
            lr.pause();
            lineRead++
            if (lineRead > fromLine) {
                await EventProcessor(JSON.parse(line)).then(async result => {
                    if (result) {
                        console.log("Result", result)
                        await ResultProcessor(result)
                        
                        // Do something with the result
                        // log.info('%cprocessLogFile%c› %cProcessed event: ' + JSON.parse(line).event, logColors.app.functions.css, 'color: unset', logColors.info.css)
                    } else {
                        // console.log("no Result", result)
                        // log.info('%cprocessLogFile%c› %cNo result for event: ' + JSON.parse(line).event, logColors.app.functions.css, 'color: unset', logColors.error.css)
                    }    
                    fromLine++;
                    store.set('app.fromLine', fromLine)
                    lr.resume();                
                })
                
            } else {
                lr.resume();
            }
        });
        
        lr.on('end', function () {
            // All lines are read, file is closed now.
            // log.info('%cprocessLogFile%c› %cProcessed all events', logColors.app.functions.css, 'color: unset', logColors.info.css)
            resolve("done");
        });
    });
}

/**
 * ----------------------------------
 * Elitist: Last Log File
 * ----------------------------------
 */
const lastLogFile = async (files) => {
    return new Promise(async (resolve, reject) => {
        await readFolder(folder).then(async allFiles => {
            let logFiles = allFiles.filter(file => file.split(".").pop() == "log")
            return logFiles
        }).then(async logFiles => {
            let orderedLogFiles = await orderLogFiles(logFiles)
            return orderedLogFiles
        }).then(async orderedLogFiles => {
            resolve(orderedLogFiles.pop())
        })
    })
}

/**
 * ----------------------------------
 * Elitist: Logdate to Timestamp
 *
 * Readable and comparable formatting.
 * ----------------------------------
 */
const logDateToTimestamp = (logDate) => {
    // Convert this format date to Unix Timestamp: 2022-10-02T203059 (YYYY-MM-DDTHHMMSS)
    let year = logDate.substring(0, 4)
    let month = logDate.substring(5, 7)
    let day = logDate.substring(8, 10)
    let hour = logDate.substring(11, 13)
    let minute = logDate.substring(13, 15)
    let second = logDate.substring(15, 17)
    return new Date(year, month, day, hour, minute, second).getTime()
}


/**
 * ----------------------------------
 * Elitist: renderNotification
 * ----------------------------------
 */
const renderNotification = (notification) => {
    const levels = {
        info: { cssClass: 'info' },
        warning: { cssClass: 'warning' },
        error: { cssClass: 'error' }
    }
    let icon = notification.icon ? `<i class="fa ${notification.icon}"></i>` : '<i class="fa icarus-terminal-info"></i>'
    let element = document.getElementById('notificationCenter')
    let notificationElement = document.createElement('div')
    notificationElement.classList.add('notification')
    notificationElement.classList.add(levels[notification.level].cssClass)
    notificationElement.innerHTML = `${icon}<span>${notification.message}</span>`
    element.appendChild(notificationElement)

    notificationElement.addEventListener('animationend', (event) => {
        if (event.animationName == 'fadeOut') {
            element.removeChild(notificationElement)
        }
        notification.dismiss()
    })
}

module.exports = Object.assign(
    {
        distanceInLY,
        formatNumber,
        readFolder,
        readJson,
        lastLogFile,
        processLogFile,
        orderLogFiles,
        constants,
        logDateToTimestamp,
        renderNotification
    },
    functions,
    notifications
);
