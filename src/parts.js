import { writable, get } from 'svelte/store';
import { urlEncode64 } from './constants.js';

class Component {
  static requiresSlot = true;
  constructor(facing=0, locked=false) {
    this.facing = facing;
    this.locked = locked;
  }
  flip() {
    this.facing = (this.facing + 1) % 2;
  }
  handleMarble(entry) {
    // Determines the direction the marble will leave a component given it's direction of entry.
    return (this.facing * 2) - 1;
  }
  get name() {
    return this.constructor.name;
  }
  get requiresSlot() {
    return this.constructor.requiresSlot;
  }
  get stopsMarble() {
    return this.constructor.stopsMarble;
  }
  get flipsOnMarble() {
    return this.constructor.flipsOnMarble;
  }
  get flipsNeighbors() {
    return this.constructor.flipsNeighbors;
  }

}

class SymetricalComponent extends Component {
  constructor(facing=0, locked=false) {
    super(0, locked);
  }
  flip() {}
}

class Ramp extends Component {
  static name = 'ramp';
  static code = [52, 53];
}

class Bit extends Component {
  static name = 'bit';
  static code = [54, 55];
  static flipsOnMarble = true;
}

class GearBit extends Component {
  static name = 'gearbit';
  static code = [56, 57];
  static flipsOnMarble = true;
  static flipsNeighbors = true;
}

class Crossover extends SymetricalComponent {
  static name = 'crossover';
  static code = [58];
  handleMarble(entry) {
    return entry;
  }
}

class Interceptor extends SymetricalComponent {
  static name = 'interceptor';
  static code = [59];
  static stopsMarble = true;
}

class Gear extends Component {
  static requiresSlot = false;
  static name = 'gear';
  static code = [60, 61];
  static flipsNeighbors = true;
  static stopsMarble = true;
}

export const partsList = [Ramp, Bit, Crossover, Interceptor, GearBit, Gear]

// Svelte store for parts
export const parts = writable(partsList);
parts.encode = function() {
  // URL encode the parts list as a string of identifying part codes followed by their count.
  let $parts = get(this);
  return $parts.filter(part => typeof part.count !== "undefined" && part.count >= 0 && part.count < 20)
               .map(part => urlEncode64[part.code[0]] + urlEncode64[part.count])
               .join('');
}

parts.decode = function (code) {
  // Decodes URL encoded string containing part code/count pairs.
  this.update($parts => {
    $parts.forEach(part => {
      if (code) {
        let marker = code.indexOf(urlEncode64[part.code[0]]);
        if (marker > 0 && marker + 1 < code.length) part.count = urlEncode64.indexOf(code[marker + 1]);
        else part.count = Infinity;
      } else part.count = Infinity;
    });

    return $parts;
  });
}
