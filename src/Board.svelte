<script>
  import createBoard from './createBoard.js';
  import { createEventDispatcher } from 'svelte';

  export let holding;
  export let board = createBoard();

  const dispatch = createEventDispatcher();

  let lastGrab = {x: false, y: false};
  let flipTimeout = false;

  function grab(e, x, y) {
    if (e.button === 0 && board[y][x]){
      e.preventDefault();
      let part = board[y][x];
      board[y][x] = false;
      lastGrab = {x, y};
      flipTimeout = setTimeout(() => lastGrab = {x: false, y: false}, 600);
      console.log(`Grabbed ${part.name}`);
      dispatch('grab', part);
    }
  }
  
  function drop(e, x, y) {
    if (e.button === 0 && holding && !board[y][x]) {
      if (lastGrab.x === x && lastGrab.y === y) {
        holding.flip();
        console.log(`Flipped ${holding.name}`);
      }
      if (flipTimeout) clearTimeout(flipTimeout);
      board[y][x] = holding;
      holding = false;
      e.stopPropagation();
    }
  }

</script>

<div id="board">
  {#each board as row, y (y)}
  <div class="row">
    {#each row as part, x (x)}
      <div class:occupied={part} class="position" on:mouseup="{e => drop(e, x, y)}" on:mousedown="{e => grab(e, x, y)}">
        {#if part}
          <img class:flipped={part.facing} src="images/{part.name}.svg" alt={part.name}>
        {/if}
      </div>
    {/each}
  </div>
  {/each}
</div>

<style>
  #board {
    width: 513px;
    height: 513px;
    background-image: url(/images/background.svg);
  }
  .row {
    width: 600px;
    height: 47px;
    overflow: visible;
  }
  .position {
    display: inline-block;
    width: 57.2px;
    height: 57px;
    margin: -5px;
    overflow: visible;
  }
  .position.occupied {
    cursor: grab;
  }
  .flipped {
    transform: scaleX(-1);
  }
</style>
