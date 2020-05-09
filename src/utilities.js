import io from 'socket.io-client'
import { urlEncode64 } from './constants.js';
import { board } from './board.js';
import { parts } from './parts.js';
import { marbles } from './marbles.js';

export function encode() {
  // URL encodes a string in base 64 containing the board code and marbles and parts codes seperated by the _ character.
  return board.encode() + urlEncode64[63] + marbles.encode() + parts.encode();
}

export function decode(code, send=false) {
  // Decodes an URL encoded string in base 64 to update the board, marbles and parts accordingly.
  // Sends the board to the server if in a live room, otherwise updates the URL with the code.
  board.decode(code);

  let partsCode = false;
  if (code)
    partsCode = code.split(urlEncode64[63]).length === 2 ? code.split(urlEncode64[63])[1] : false;

  parts.decode(partsCode);
  marbles.decode(partsCode);
}