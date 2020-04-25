class Component {
  static requiresSlot = true;
  constructor(facing=0) {
    this.facing = facing;
  }
  flip() {
    this.facing = (this.facing + 1) % 2;
  }
  get name() {
    return this.constructor.name;
  }
  get requiresSlot() {
    return this.constructor.requiresSlot;
  }
}

class SymetricalComponent extends Component {
  constructor() {
    super();
    this.facing = 0;
  }
  flip() {
    this.facing = 0;
  }
}

class Ramp extends Component {
  static name = 'ramp';
  static code = [53, 54];
}

class Bit extends Component {
  static name = 'bit';
  static code = [55, 56];
}

class GearBit extends Component {
  static name = 'gearbit';
  static code = [57, 58];
}

class Crossover extends SymetricalComponent {
  static name = 'crossover';
  static code = [59];
}

class Interceptor extends SymetricalComponent {
  static name = 'interceptor';
  static code = [60];
}

class Gear extends SymetricalComponent {
  static requiresSlot = false;
  static name = 'gear';
  static code = [61];
}

export default {Ramp, Bit, Crossover, Interceptor, GearBit, Gear};
