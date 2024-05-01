const updateLocation = async (address) => {
  let system = document.getElementById("systemContent");
  let summary = system.querySelector(".system-summary");
  if (address !== parseInt(summary.id)) {
    const { renderSummary, renderBodies } = require("./index.js");
    summary.id = address;
    summary.innerHTML = await renderSummary(address);

    let bodiesElement = document.createElement("div");
    bodiesElement.classList.add("system-bodies");

    summary.appendChild(bodiesElement);
    let bodies = await db.bodies.where("address").equals(address).toArray();
    bodies.forEach(async (body) => {
      let bodyElement = await renderBodies(address, body);
      await bodiesElement.appendChild(bodyElement);
    });
  }
};
const updateSystemSummary = () => {};
const updateBodies = async (id) => {
  let system = document.getElementById("systemContent");
  let bodiesElement = system.querySelector(".system-bodies");
  let body = await db.bodies
    .where({ address: store.get("session.location.address"), id: id })
    .first();
  if (
    document.getElementById(store.get("session.location.address") + "." + id)
  ) {
    // Set Star Class if unknown
    const { starClassification } = require("./index.js");
    let bodyElement = document.getElementById(
      store.get("session.location.address") + "." + id,
    );
    if (body.type == "Star") {
      bodyElement.querySelector(".class").innerHTML = starClassification(
        body.class,
      );
    }
  } else {
    const { renderBodies, summary } = require("./index.js");
    let bodyElement = await renderBodies(
      store.get("session.location.address"),
      body,
    );
    await bodiesElement.appendChild(bodyElement);
    system.querySelector(".summary").innerHTML = await summary(
      store.get("session.location.address"),
    );
  }
  await sortBodies(store.get("session.location.address"));
};

const sortBodies = async (address) => {
  let system = document.getElementById("systemContent");
  let bodiesElement = system.querySelector(".system-bodies");
  let bodies = bodiesElement.children;
  bodies = Array.prototype.slice.call(bodies, 0);
  bodies.sort(function (a, b) {
    let aord = +a.id.split(".")[1];
    let bord = +b.id.split(".")[1];
    return aord - bord;
  });
  bodiesElement.innerHTML = "";
  for (body of bodies) {
    bodiesElement.appendChild(body);
  }
};

const updateSignals = async (id) => {
  let address = store.get("session.location.address");
  let element = document.getElementById(address + "." + id);
  let signals = store.get(`session.exobiology.signals.${address}`)[id];
  signalsElement = element.querySelector(".signals");
  signalsElement.innerHTML = "";
  Object.entries(signals).forEach(([genus, values]) => {
    const renderSignalElement = require("./index").renderSignalElement;
    let genusElement = element.querySelector(`.${genus.toLowerCase()}`);
    if (!genusElement) {
      genusElement = document.createElement("div");
      genusElement.classList.add("signal");
      signalsElement.appendChild(genusElement);
    }
    genusElement.classList.add(genus.toLocaleLowerCase());
    genusElement.innerHTML = renderSignalElement(genus, values);
  });
};

module.exports = {
  location: updateLocation,
  bodies: updateBodies,
  signals: updateSignals,
};
