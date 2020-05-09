import io from 'socket.io-client'
import { urlEncode64 } from './constants.js';
import {board} from './board.js';
import {parts} from './parts.js';
import {marbles} from './marbles.js';

export let socket = false;

if (window.location.pathname.endsWith('room/')) {
  // If user is in a room on the Express server set up sockets.io and await updates.
  decode();
  const urlParams = new URLSearchParams(window.location.search);
  socket = io.connect(window.location.origin, {query: urlParams.has('uuid') ? 'uuid=' + urlParams.get('uuid') : false});
  socket.on('joined', (handshake) => {
    decode(handshake.board);
    history.pushState(null, document.title, window.location.pathname + '?uuid=' + handshake.uuid);
  });
  socket.on('board', decode);
  socket.on('failed', (reason) => {
    socket.close();
    socket = false;
    alert(reason);

    let url = window.location.pathname.slice(0, -'room/'.length);
    history.pushState(null, document.title, url);
  });
} else {
  // Otherwise check for a code in the URL and decode it.
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has('code')) decode(urlParams.get('code'));
  else decode();
}

export function sendBoard() {
  // Sends encoded board and parts data to server, returns false if not using socket.io
  if (socket) {
    socket.emit('board', encode());
    return true;
  }else return false;
}

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
  
  
  if (send && !sendBoard()) {
    let url = window.location.pathname;
    if (code) url += '?code=' + code;
    history.pushState(null, document.title, url);
  }
}