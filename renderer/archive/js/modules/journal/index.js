

const EventProcessor = async (line) => {
    return new Promise(resolve => {
        const events = require('./events')
        if (typeof events[line.event] == "function") {
            events[line.event](line).then(result => {
                // console.log(line.event, result)
                resolve(result)
            })
        } else if ("SystemAddress" in line) {
            // console.log(`Undefined event (${line.event}) with SystemAddress`, line.SystemAddress, line)
            resolve(false)
        } else {
            resolve(false)
        }
    })
}

const ResultProcessor = async (result) => {
    return new Promise(async resolve => {
        const components = require('../../components')
        if (result.callback) {
            if (typeof components[result.callback] == "function") {
                await components[result.callback](result.data)
            }
        }
        resolve()
    })
}

/**
 * ----------------------------------
 * Elitist: System Class
 * ----------------------------------
 */
class System {
    constructor(address) {
        this.address = address;
    }
    init() {
        db.systems.add({ address: this.address }).catch(() => { });
    }
    save() {
        this.init()
        db.systems.update({ address: this.address }, this).catch(() => { });
    }
}

/**
 * ----------------------------------
 * Elitist: Body Class extends System
 * ----------------------------------
 */
class Body extends System {
    constructor(address, id) {
      super(address);
      this.id = id;
    }
    init() {
      db.bodies.add({ address: this.address, id: this.id }).catch(() => {});
    }
    save() {
      this.init();
      db.bodies.update({ address: this.address, id: this.id }, this);
    }
  }
  
  /**
   * ----------------------------------
   * Elitist: Star Class extends Body
   * ----------------------------------
   */
  class Star extends Body {
    constructor(address, id) {
      super(address, id);
      this.type = "Star";
    }
    init() {
      db.bodies.add({ address: this.address, id: this.id }).catch(() => {});
    }
    save() {
      this.init();
      db.bodies.put(this);
    }
  }
  
  /**
   * ----------------------------------
   * Elitist: Planet Class extends Body
   * ----------------------------------
   */
  class Planet extends Body {
    constructor(address, id) {
      super(address, id);
      this.type = "Planet";
    }
    init() {
      db.bodies.add({ address: this.address, id: this.id }).catch(() => {});
    }
    save() {
      this.init();
      db.bodies.put(this);
    }
  }


module.exports = { EventProcessor, ResultProcessor, System, Body, Star, Planet}