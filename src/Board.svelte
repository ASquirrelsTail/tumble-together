<script>
  import createBoard from './createBoard.js';
  import { createEventDispatcher } from 'svelte';

  export let holding;
  export let board = createBoard();
  export let boardElement;

  const dispatch = createEventDispatcher();

  let lastGrab = {x: false, y: false};
  let flipTimeout = false;

  function isValid(x, y) {
    // Retrusn true for positions on the 11x11 grid that can be used.
    if (y === 0 && (x < 2 || x > 8 || x === 5)) return false;
    else if (y === 1 && (x === 0 || x === 10)) return false;
    else if (y === 10 && x != 5) return false;
    else return true;
  }

  function hasSlot(x, y) {
    return Boolean((x + y) % 2) ;
  }

  function grab(e, x, y) {
    if (!holding && board[y][x] &&
        ((e.type === 'mousedown' && e.button === 0) ||
         (e.type === 'touchstart' && e.touches.length === 1))){
      e.preventDefault();
      e.stopPropagation();
      let part = board[y][x];
      board[y][x] = false;
      lastGrab = {x, y};
      flipTimeout = setTimeout(() => lastGrab = {x: false, y: false}, 600);
      console.log(`Grabbed ${part.name}`);
      dispatch('grab', part);
      console.log(e);
    }
  }
  
  function drop(e, x, y) {
    if (((e.type === 'mouseup' && e.button === 0) ||
         (e.type === 'touchend' && e.changedTouches.length === 1 && e.touches.length === 0)) && 
        holding && (!holding.requiresSlot || hasSlot(x, y)) && !board[y][x]) {
      if (lastGrab.x === x && lastGrab.y === y) {
        holding.flip();
        console.log(`Flipped ${holding.name}`);
      }
      if (flipTimeout) clearTimeout(flipTimeout);
      board[y][x] = holding;
      console.log(`Placed ${holding.name}`);
      holding = false;
    }
  }

</script>

<div id="board" bind:this={boardElement}>
  {#each board as row, y (y)}
  <div class="row">
    {#each row as part, x (x)}
      {#if isValid(x, y)}
      <div class:occupied={part} class:slot="{hasSlot(x, y)}" class="position"
          on:mouseup="{e => drop(e, x, y)}"
          on:mousedown="{e => grab(e, x, y)}"
          on:touchstart="{e => grab(e, x, y)}"
          on:touchend="{e => drop(e, x, y)}"
          on:touchmove="{e => console.log(e)}">
        {#if part}
          <img class:flipped={part.facing} class={part.name} src="images/{part.name}.svg" alt={part.name}>
        {/if}
      </div>
      {:else}
      <div class="position blank"></div>
      {/if}
    {/each}
  </div>
  {/each}
</div>

<style>
  .row {
    width: 550px;
    height: 50px;
    overflow: visible;
  }
  .position {
    background-image: url(/images/bg-peg.svg);
    background-size: cover;
    display: inline-block;
    width: 50px;
    height: 50px;
    overflow: visible;
  }
  .position.slot {
    background-image: url(/images/bg-slot.svg);
  }
  .position.blank {
    background-image: none;
    z-index: 0;
  }
  .position.occupied {
    cursor: grab;
  }
  .position img {
    margin: -3.445px;
  }
  .slot .gear {
    transform: rotate(22.5deg);
  }
  .flipped {
    transform: scaleX(-1);
  }
</style>
