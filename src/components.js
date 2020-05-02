class Component {
  static requiresSlot = true;
  constructor(facing=0) {
    this.facing = facing;
  }
  flip() {
    this.facing = (this.facing + 1) % 2;
  }
  handleMarble(entry) {
    const exit = (this.facing * 2) - 1;
    return exit;
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
  constructor() {
    super();
    this.facing = 0;
  }
  flip() {}
}

class Ramp extends Component {
  static name = 'ramp';
  static code = [53, 54];
}

class Bit extends Component {
  static name = 'bit';
  static code = [55, 56];
  static flipsOnMarble = true;
}

class GearBit extends Component {
  static name = 'gearbit';
  static code = [57, 58];
  static flipsOnMarble = true;
  static flipsNeighbors = true;
}

class Crossover extends SymetricalComponent {
  static name = 'crossover';
  static code = [59];
  handleMarble(entry) {
    return entry;
  }
}

class Interceptor extends SymetricalComponent {
  static name = 'interceptor';
  static code = [60];
  static stopsMarble = true;
}

class Gear extends Component {
  static requiresSlot = false;
  static name = 'gear';
  static code = [61, 62];
  static flipsNeighbors = true;
  static stopsMarble = true;
}

export default {Ramp, Bit, Crossover, Interceptor, GearBit, Gear};
