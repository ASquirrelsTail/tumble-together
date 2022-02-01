import { writable, get } from 'svelte/store';
import { urlEncode64 } from './constants.js';
import { partsList } from './parts.js';

export default class Board extends Array {
  constructor(boardArray) {
    super(...boardArray);
  }
  async startRun(marble, start='left', onTick=() => {}) {
    // Advances a marble through the board from the given starting position.
    // Calls onTick every time the marble advances by a row.
    // Returns object containing the marble, and the side it exited from.
    if (this.marble) return false;
    this.marble = marble;
    this.position = {x: start === 'left' ? 3 : 7, y: -1};
    this.direction = start === 'left' ? 1 : -1;

    let result;

    await onTick();
    this.position.y++;

    await onTick();
    while (this.marble && this.tick()) {
      if (this.position.y === 11)
        result = {marble: this.marble, side: this.direction > 0 ? 'right' : 'left'};
      else if (this.position.y === 10 && this.position.x != 5) 
        result = {marble: this.marble, side: this.position.x > 5 ? 'right' : 'left'};
      else await onTick();
      if (result) {
        this.marble = false;
        return result;
      }
    }
    return false;
  }
  tick() {
    // Advances the marble's position through the board, based on part at its current position.
    if (this.marble) {
      let result = false;
      let part = this[this.position.y][this.position.x]
      if (part) {
        if (part.stopsMarble) return false;
        result = part.handleMarble(this.direction);
        if (part.flipsOnMarble) this.flip(this.position.x, this.position.y)
        if (result) this.position = {x: this.position.x + result, y: this.position.y + 1};
        if (this.position.x < 0 && this.position.x > this[0].length) result = false;
      }
      if (result === false) {
        this.marble = false;
        this.position = false;
        throw `Marble has escaped at ${this.position.x}, ${this.position.y}!`;
      }
      this.direction = result;
      return true;
    }
  }
  at(x, y) {
    // Returns contents of array at x and y.
    if ((x >= 0 && x < this[0].length) &&
        (y >= 0 && y < this.length))
      return this[y][x];
    else return false;
  }
  isValid(x, y) {
    // Returns true for positions on the 11x11 grid that can be used.
    if (y === 0 && (x < 2 || x > 8 || x === 5)) return false;
    else if (y === 1 && (x === 0 || x === 10)) return false;
    else if (y === 10 && x != 5) return false;
    else return true;
  }
  hasSlot(x, y) {
    // Returns true if a positon should have a slot (every other position).
    return Boolean((x + y) % 2) ;
  }
  flipableNeighbors(partX, partY) {
    // Returns a set containing all contiguous parts that can be flipped by the part at x, y.
    let part = this.at(partX, partY);
    let partsToFlip = new Set();
    if (part) {
      partsToFlip.add(part);
      if (part.flipsNeighbors) {
        const adjacent = (x, y) => {
          let adjacentPositions = [[1, 0], [-1, 0], [0, 1], [0, -1]].map(pos => [pos[0] + x, pos[1] + y]);
          let adjacentFlippingPositions = adjacentPositions.filter(pos => {
            let partAtPos = this.at(...pos);
             return (partAtPos && partAtPos.flipsNeighbors &&
                     !partsToFlip.has(partAtPos));
          });
          adjacentFlippingPositions.forEach(pos => partsToFlip.add(this.at(...pos)));
          adjacentFlippingPositions.forEach(pos => adjacent(...pos));
        }
        adjacent(partX, partY);
      }
    }
    return partsToFlip;
  }
  flip(x, y) {
    // Flips the part at x, y, and all contiguous parts that can be flipped.
    this.flipableNeighbors(x, y).forEach(part => part.flip());
  }
  encode() {
    // Returns a base64 encoded version of the board.
    let encodedBoard = ''

    this.forEach(row => {
      for (let position=0; position < row.length; position++) {
        if (!row[position]) {
          let restOfRow = row.slice(position + 1)
          let numberOfBlanks = restOfRow.findIndex(part => part);
          if (numberOfBlanks < 0) numberOfBlanks = restOfRow.length;
          encodedBoard += urlEncode64[numberOfBlanks];
          position += numberOfBlanks;
        } else {
          encodedBoard += urlEncode64[row[position].constructor.code[row[position].facing]];
          if (row[position].locked) encodedBoard += urlEncode64[62];
        }
      }
    });
    return encodedBoard;
  }
  static create(boardCode=null) {
    // Recreates a board from code if provided, else returns an empty board.
    let board = [...Array(11)];
    if (boardCode) {
      if (!/^[a-zA-Z0-9-_]*$/.test(boardCode)) throw 'Code is not base64 url encoded!'
      else if (boardCode.length < 11) throw 'Code is too short!'
      else{
        let position = 0;
        let boardLocked = false;
        if (urlEncode64.indexOf(boardCode[0]) == 62) {
          boardLocked = true;
          position = 1;
        }
        board = board.map(() => {
          let row = [];
          while (row.length < 11 && position < boardCode.length) {
            let code = urlEncode64.indexOf(boardCode[position]);
            if (code < 11) row.push(...Array(code + 1));
            else {
              let partClass = partsList.find(part => part.code.includes(code));
              if (partClass) {
                let locked = (position + 1 < boardCode.length && boardCode[position + 1] === urlEncode64[62]);
                row.push(new partClass(partClass.code.indexOf(code), boardLocked || locked));
                if (locked) position++;
              } else throw 'Invalid code! ' + code + ' @ position ' + position;
            }
            position++;
          }
          return row;
        });
      }
    } else board = board.map(() => Array(11));
    return new Board(board);
  }
}

// Svelte store for board data, with encode and decode shortcuts.
export const board = writable(Board.create());
board.encode = function () {
  return get(this).encode();
}
board.decode = function (code) {
  try {
    this.set(Board.create(code));
  } 
  catch(err) {
    console.log(err);
    console.log('Initializing empty board')
    this.set(Board.create());
  }
  
}
