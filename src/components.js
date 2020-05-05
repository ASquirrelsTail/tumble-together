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

export default {Ramp, Bit, Crossover, Interceptor, GearBit, Gear};
