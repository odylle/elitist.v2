const LineByLineReader = require("line-by-line");

const lineFormatter = (line) => {
  if (line.extended == undefined) {
    line.extended = { distancefromarrivalls: 0 };
  }
  let result = {};
  result.address = line.SystemAddress ? line.SystemAddress : line.address;
  result.id = line.BodyID != undefined ? line.BodyID : line.id;
  result.name = line.BodyName ? line.BodyName : line.name;
  result.type =
    "StarType" in line ? "Star" : "PlanetClass" in line ? "Planet" : line.type;
  result.class = line.PlanetClass
    ? line.PlanetClass
    : line.StarType
      ? line.StarType
      : line.class;
  result.distance =
    line.DistanceFromArrivalLS == 0
      ? line.DistanceFromArrivalLS
      : line.extended.distancefromarrivalls != undefined
        ? line.extended.distancefromarrivalls
        : "unknown";
  result.parents = line.Parents ? line.Parents : line.parents;
  result.rings = line.Rings ? line.Rings : line.rings;
  result.discovered = line.WasDiscovered ? line.WasDiscovered : line.discovered;
  result.mapped = line.WasMapped ? line.WasMapped : line.mapped;
  result.gravity = line.SurfaceGravity ? line.SurfaceGravity : line.gravity;
  result.landable = line.Landable ? line.Landable : line.landable;
  result.temperature = line.SurfaceTemperature
    ? line.SurfaceTemperature
    : line.extended.temperature;
  result.terraformstate =
    line.TerraformState != undefined
      ? line.TerraformState
      : line.extended.terraformstate != undefined
        ? line.extended.terraformstate
        : false;
  result.atmosphere =
    line.Atmosphere != undefined
      ? line.Atmosphere
      : line.extended.atmosphere != undefined
        ? line.extended.atmosphere
        : false;
  result.volcanism =
    line.Volcanism != undefined
      ? line.Volcanism
      : line.extended.volcanism != undefined
        ? line.extended.volcanism
        : false;
  result.materials =
    line.Materials != undefined
      ? line.Materials
      : line.materials != undefined
        ? line.materials
        : false;
  return result;
};
/**
 * ----------------------------------
 * Elitist: Read Folder and return contents
 * ----------------------------------
 */
const readFolder = async (folder) => {
  const fs = require("fs");
  return new Promise(async (resolve, reject) => {
    await fs.promises.readdir(folder, (err, files) => {
      if (err) {
        reject(err);
      }
      resolve(files);
    });
  });
};

/**
 * ----------------------------------
 * Elitist: Order Log Files old to new
 * ----------------------------------
 */
const orderLogFiles = async (files) => {
  return new Promise(async (resolve, reject) => {
    if (files.length == 0) reject("No files found");
    let oldFormat = [],
      newFormat = [];
    let logFiles = files.filter((file) => file.split(".").pop() == "log");
    for (let file of logFiles) {
      let fileDate = file.split(".")[1];
      if (!fileDate.includes("-")) {
        oldFormat.push(file);
      } else {
        newFormat.push(file);
      }
    }
    resolve(oldFormat.concat(newFormat));
  });
};

/**
 * ----------------------------------
 * Elitist: Read Journal file and process constants
 * ----------------------------------
 */
const readJournal = async (journal, live = false) => {
  let lines = 0;
  const configuredEvents = require("./constants").configuredEvents;
  return new Promise(async (resolve, reject) => {
    let readFromLine = store.get("app.fromLine")
      ? store.get("app.fromLine")
      : 0;
    let lr = new LineByLineReader(journal);
    lr.on("error", function (err) {
      console.log(err);
      reject(err);
    });
    lr.on("line", async (line) => {
      // if (line) overcomes a weird error where a newline is suddenly empty..
      if (line && lines >= readFromLine) {
        lr.pause();
        line = JSON.parse(line);
        if (configuredEvents.includes(line.event)) {
          await processEvent(line).then(async (result) => {
            if (result && live) {
              await processResult(result);
            }
          });
        }
        readFromLine++;
      }
      lines++;
      lr.resume();
    });
    lr.on("end", function () {
      store.set("app.fromLine", readFromLine);
      resolve(lines);
    });
  });
};

/**
 * ----------------------------------
 * Elitist: Process line event
 * ----------------------------------
 */
const processEvent = async (event) => {
  return new Promise(async (resolve, reject) => {
    let events = require("./events");
    if (event.event in events) {
      let result = await events[event.event](event);
      resolve(result);
    } else {
      console.log("Event not found (Should never be hit): ", event.event);
      resolve();
    }
  });
};
const processResult = async (result) => {
  return new Promise(async (resolve) => {
    let func = getFunction(result.callback);
    if (result.callback && func) {
      await func(result.data);
    }
    resolve();
  });
};

function getFunction(path) {
  let parts = path.split(".");
  let obj = components;
  for (let part of parts) {
    if (obj[part] === undefined) {
      return undefined;
    }
    obj = obj[part];
  }
  return typeof obj === "function" ? obj : undefined;
}

/**
 * ----------------------------------
 * Elitist: Logdate to Timestamp
 *
 * Readable and comparable formatting.
 * ----------------------------------
 */
const logDateToTimestamp = (logDate) => {
  let year = logDate.includes("T")
    ? logDate.substring(0, 4)
    : "20" + logDate.substring(0, 2);
  let month = logDate.includes("T")
    ? logDate.substring(5, 7)
    : logDate.substring(2, 4);
  let day = logDate.includes("T")
    ? logDate.substring(8, 10)
    : logDate.substring(4, 6);
  let hour = logDate.includes("T")
    ? logDate.substring(11, 13)
    : logDate.substring(6, 8);
  let minute = logDate.includes("T")
    ? logDate.substring(13, 15)
    : logDate.substring(8, 10);
  let second = logDate.includes("T")
    ? logDate.substring(15, 17)
    : logDate.substring(10, 12);
  return new Date(year, month, day, hour, minute, second).getTime();
};
/**
 * ----------------------------------
 * Elitist: FormatNumber
 *
 * Readable number formatting.
 * ----------------------------------
 */
const formatNumber = (x) => {
  if (x != undefined) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }
};

module.exports = {
  lineFormatter,
  readFolder,
  readJournal,
  processEvent,
  processResult,
  orderLogFiles,
  logDateToTimestamp,
  formatNumber,
};
