class Marble {
  constructor() {

  }
  get color() {
    return this.constructor.color;
  }
}

export class BlueMarble extends Marble {
  static color = 'blue';
}

export class RedMarble extends Marble {
  static color = 'red';
}
