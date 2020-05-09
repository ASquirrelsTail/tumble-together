import { writable, get } from 'svelte/store';
import io from 'socket.io-client';
import { encode, decode } from './utilities.js';

export const socket = writable(false);
socket.connect = function (uuid, board) {
  let query = false;
  if (uuid) query = 'uuid=' + uuid;
  else if (board) query = 'board=' + board;

  const $socket = io.connect(window.location.origin, {query});
  this.set($socket);

  $socket.on('joined', (handshake) => {
    decode(handshake.board);
    history.pushState(null, document.title, window.location.pathname + '?uuid=' + handshake.uuid);
  });

  $socket.on('board', decode);

  $socket.on('failed', (reason) => {
    this.disconnect();
    alert(reason);
  });

  $socket.on('disconnect', (reason) => {
    this.disconnect();
    if (reason !== 'io client disconnect') alert(reason);
  });
}
socket.disconnect = function () {
  // On disconnect remove room from the url and close socket and remove it from the store.
  const url = window.location.pathname.slice(0, -'room/'.length);
  history.pushState(null, document.title, url);

  this.update($socket => {
    if ($socket) $socket.close();
    return false;
  });
}
socket.sendBoard = function () {
  // Sends encoded board and parts data to server, returns false if sockets not connected.
  const $socket = get(this);
  if ($socket) {
    $socket.emit('board', encode());
    return true;
  }else return false;
}
