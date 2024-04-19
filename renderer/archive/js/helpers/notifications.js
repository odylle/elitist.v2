class Notification extends Event {
    static #ALLOWED_LEVELS = ['info', 'warning', 'error'];
    #message = '';
    #level = '';
    #icon = '';
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
  
    constructor(message = '', level = 'info', icon = '') {
      super('notification');
  
      if (!this.constructor.#ALLOWED_LEVELS.includes(level)) {
        throw new Error(`Level ${level} is not allowed, must be one of ${this.#ALLOWED_LEVELS.join(', ')}`);
      }
  
      this.#message = message;
      this.#level = level;
      this.#icon = icon;
  
      this.#dismissed = new Promise((resolve) => this.#dismissResolve = resolve);
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
        throw new Error('Argument must be an instance of Notification');
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

  // function renderNotification(notification) {
  //   const levels = {
  //     info: {
  //       icon: 'ⓘ',
  //       color: '#5b79de'
  //     },
  //     warning: {
  //       icon: '⚠',
  //       color: '#f0ad4e'
  //     },
  //     error: {
  //       icon: '⛔',
  //       color: '#d9534f'
  //     }
  //   };
  
  //   // Create notification element
  //   const icon = document.createElement('span');
  //   icon.textContent = levels[notification.level].icon;
  //   icon.style.color = '#fff';
  //   icon.style.lineHeight = '1.2';
  
  //   const message = document.createElement('span');
  //   message.textContent = notification.message;
  //   message.style.color = '#fff';
  
  //   const button = document.createElement('button');
  //   button.textContent = '×';
  //   button.style.color = '#fff';
  //   button.style.position = 'absolute';
  //   button.style.top = '0.2em';
  //   button.style.right = '0';
  //   button.style.border = 'none';
  //   button.style.background = 'none';
  //   button.style.cursor = 'pointer';
  
  //   const element = document.createElement('div');
  //   element.style.position = 'fixed';
  //   element.style.top = '1em';
  //   element.style.right = '-100%';
  //   element.style.transition = 'right 500ms ease-in-out';
  //   element.style.background = levels[notification.level].color;
  //   element.style.fontWeight = 'bold';
  //   element.style.borderRadius = '0.2em';
  //   element.style.boxShadow = '0 0.2em 0.3em #888';
  //   element.style.padding = '1em';
  //   element.style.display = 'grid';
  //   element.style.gridTemplateColumns = 'auto auto';
  //   element.style.gridGap = '0.5em';
  
  //   element.appendChild(icon);
  //   element.appendChild(message);
  //   element.appendChild(button);
  
  //   document.body.appendChild(element);
  
  //   // Animate element to visible
  //   setTimeout(() => element.style.right = '1em', 0);
  
  //   function close() {
  //     // Animate element
  //     element.style.transition = 'right 250ms ease-in-out';
  //     element.style.right = '-100%';
  
  //     // Remove element after animation
  //     setTimeout(() => {
  //       // If element was not removed already
  //       if (element.parentElement) {
  //         element.parentElement.removeChild(element);
  //         notification.dismiss();
  //       }
  //     }, 600);
  //   }
  
  //   // Close automatically after 7 seconds
  //   setTimeout(close, 7000);
  
  //   // Close on button click
  //   button.addEventListener('click', close, {once: true});
  // }



module.exports = { Notification, NotificationQueue };