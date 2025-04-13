// queue.js

class Queue {
    constructor() {
      this.items = [];
    }
  
    enqueue(item) {
      this.items.push(item);
    }
  
    dequeue() {
      if (this.isEmpty()) {
        return null;
      }
      return this.items.shift();
    }

    peek() {
        if (this.isEmpty()) {
          return null;
        }
        return this.items[0];
    }

    poll() {
      if (this.isEmpty()) {
          return null;
      }
      return this.items.shift(); // removes and returns the first element
    }
  
  
    isEmpty() {
      return this.items.length === 0;
    }
  
    size() {
      return this.items.length;
    }
  }
  
  module.exports = Queue;
  