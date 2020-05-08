import Board from './board.js';
import { writable } from 'svelte/store';

export const holding = writable(false);
export const currentChallenge = writable(false);