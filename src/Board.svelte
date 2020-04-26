<script>
  import createBoard from './createBoard.js';
  import { createEventDispatcher } from 'svelte';

  export let board = createBoard();
  export let holding;
  export let lastGrab;
  export let boardElement;

  const dispatch = createEventDispatcher();

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
    if (((e.type === 'mousedown' && e.button === 0) ||
         (e.type === 'touchstart' && e.touches.length === 1)) &&
        !holding && board[y][x]) {
      e.preventDefault();
      e.stopPropagation();
      console.log(`Grabbed ${board[y][x].name}`);
      holding = board[y][x];
      board[y][x] = false;
      lastGrab = {x, y, timeout: setTimeout(() => lastGrab = {x: false, y: false, timeout: false}, 300)};
      dispatch('grab');
    }
  }

</script>

<div id="board" bind:this={boardElement}>
  {#each board as row, y (y)}
  <div class="row">
    {#each row as part, x (x)}
      {#if isValid(x, y)}
      <div class:occupied={part} class:slot="{hasSlot(x, y)}" class="position"
          on:mousedown="{e => grab(e, x, y)}"
          on:touchstart="{e => grab(e, x, y)}">
        {#if part}
          <img class:flipped={part.facing} class={part.name} src="/images/{part.name}.svg" alt={part.name}>
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
    pointer-events: none;
  }
  .slot .gear {
    transform: rotate(22.5deg);
  }
  .flipped {
    transform: scaleX(-1);
  }
</style>
