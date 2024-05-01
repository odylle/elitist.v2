const applicationInit = require("./applicationInit");
const cargoContent = require("./cargoContent");
const exobiologyContent = require("./exobiologyContent");
const mainContent = require("./mainContent");
const materialsContent = require("./materialsContent");
const notificationCenter = require("./notificationCenter");
const systemContent = require("./system");

module.exports = {
  init: applicationInit,
  cargo: cargoContent,
  exobiology: exobiologyContent,
  main: mainContent,
  materials: materialsContent,
  notifications: notificationCenter,
  system: systemContent,
};
