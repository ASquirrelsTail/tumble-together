import Board from './board.js';
import { writable } from 'svelte/store';

export const holding = writable(false);
export const rooms = writable(false);
export const currentChallenge = writable(false);
export const toastMessage = writable(false);
export const customMix = writable(false);

export const basePath = writable((window.location.pathname.endsWith('room/') ||
  window.location.pathname.endsWith('about/')) ? '../' : './');
basePath.update = function() {
  // Sets the base path to the relative path given the current location.
  this.set((window.location.pathname.endsWith('room/') || window.location.pathname.endsWith('room') ||
    window.location.pathname.endsWith('about/') || window.location.pathname.endsWith('about') ||
    window.location.pathname.endsWith('about/index.html')) ? '../' : './');
}
