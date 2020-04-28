<script>
  import Board from './boardUtils.js';
  import MarbleTray from './MarbleTray.svelte';
  import {BlueMarble, RedMarble} from './marbles.js';
  import {createEventDispatcher} from 'svelte';

  export let board = Board.create();
  export let holding;
  export let lastGrab;
  export let boardElement;

  let marbles = {
    left: [...Array(8)].map(i => new BlueMarble()),
    right: [...Array(8)].map(i => new RedMarble()),
    results: []
  }

  const dispatch = createEventDispatcher();

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

  function triggerLever(side='left') {
    if (!board.marble && marbles[side].length) {
      let result = board.startRun(marbles[side].pop(), side);
      if (result) {
        marbles.results.push(result.marble);
        board = board;
        setTimeout(() => triggerLever(result.side), 500);
      }
      marbles = marbles;
    }
  }

  function resetMarbles() {
    if (board.marble) {
      marbles.results.push(board.marble);
      board.marble = false;
    }
    marbles.results.forEach((marble) => {
      if (marble.color === 'blue') marbles.left.push(marble);
      else marbles.right.push(marble);
      marbles.results = [];
      marbles = marbles;
    });
  }

</script>
<div id="board-container">
  <div id="top-trays">
    <MarbleTray marbles={marbles.left}/>
    <MarbleTray marbles={marbles.right}/>
  </div>
  <div id="board" bind:this={boardElement}>
    {#each board as row, y (y)}
    <div class="row">
      {#each row as part, x (x)}
        {#if board.isValid(x, y)}
        <div class:occupied={part} class:slot="{board.hasSlot(x, y)}" class="position"
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
  <div>
    <button on:click="{() => triggerLever('left')}">Trigger Left</button>
    <button on:click="{() => triggerLever('right')}">Trigger Right</button>
    <button on:click="{resetMarbles}">Reset</button>
  </div>
  <MarbleTray marbles={marbles.results}/>
</div>

<style>
  #top-trays {
    display: flex;
    justify-content: space-around;
  }
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
