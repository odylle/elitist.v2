class Notification extends Event {
  static #ALLOWED_LEVELS = ["info", "warning", "error"];
  #message = "";
  #level = "";
  #icon = "";
  #dismissed;
  #dismissResolve;

  get message() {
    return this.#message;
  }

  get level() {
    return this.#level;
  }

  get icon() {
    return this.#icon;
  }

  get dismissed() {
    return this.#dismissed;
  }

  constructor(message = "", level = "info", icon = "") {
    super("notification");

    if (!this.constructor.#ALLOWED_LEVELS.includes(level)) {
      throw new Error(
        `Level ${level} is not allowed, must be one of ${this.#ALLOWED_LEVELS.join(
          ", ",
        )}`,
      );
    }

    this.#message = message;
    this.#level = level;
    this.#icon = icon;

    this.#dismissed = new Promise(
      (resolve) => (this.#dismissResolve = resolve),
    );
  }

  dismiss() {
    this.#dismissResolve();
  }
}

class NotificationQueue extends EventTarget {
  #queue = new Set();
  #current;

  add(notification) {
    if (!(notification instanceof Notification)) {
      throw new Error("Argument must be an instance of Notification");
    }

    this.#queue.add(notification);

    if (!this.#current) {
      this.#next();
    }
  }

  async #next() {
    this.#current = this.#queue[Symbol.iterator]().next().value;
    if (this.#current) {
      this.#queue.delete(this.#current);
      this.dispatchEvent(this.#current);
      await this.#current.dismissed;
      this.#next();
    }
  }
}

module.exports = { Notification, NotificationQueue };
