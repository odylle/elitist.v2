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
    db.systems.add({ address: this.address }).catch(() => {});
  }
  save() {
    this.init();
    db.systems.update({ address: this.address }, this).catch(() => {});
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
/**
 * ----------------------------------
 * Elitist: Organic
 * ----------------------------------
 */
class Organic {
  constructor(genus, species, variant) {
    this.genus = genus;
    this.species = species;
    this.variant = variant;
  }
  async init() {
    let result = await db.organics.get([
      this.genus,
      this.species,
      this.variant,
    ]);
    if (result) {
      Object.assign(this, result);
    } else {
      this.locations = [];
      this.values = {
        value: 0,
        bonus: 0,
      };
      await db.organics.add(this).catch(() => {});
    }
  }
  async save() {
    await db.organics.update([this.genus, this.species, this.variant], this);
  }
}

module.exports = {
  System,
  Body,
  Star,
  Planet,
  Organic,
};
