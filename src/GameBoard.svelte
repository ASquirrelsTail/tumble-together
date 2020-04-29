<script>
  import Board from './boardUtils.js';
  import MarbleTray from './MarbleTray.svelte';
  import {BlueMarble, RedMarble} from './marbles.js';
  import {createEventDispatcher} from 'svelte';

  export let board = Board.create();
  export let holding;
  export let lastGrab;
  export let boardElement;

  const dispatch = createEventDispatcher();

  function grab(e, x, y) {
    if (((e.type === 'mousedown' && e.button === 0) ||
         (e.type === 'touchstart' && e.touches.length === 1)) &&
        !holding && !board.marble && board[y][x]) {
      e.preventDefault();
      e.stopPropagation();
      console.log(`Grabbed ${board[y][x].name}`);
      holding = board[y][x];
      board[y][x] = false;
      lastGrab = {x, y, timeout: setTimeout(() => lastGrab = {x: false, y: false, timeout: false}, 300)};
      dispatch('grab');
    }
  }

  let marbles = {numbers: {left: 8, right: 8}};
  const urlParams = new URLSearchParams(window.location.search);
  Object.keys(marbles.numbers).forEach(side => {
    if (urlParams.has(side) && parseInt(urlParams.get(side)) != NaN)
      marbles.numbers[side] = Math.min(20, Math.max(0, parseInt(urlParams.get(side))));
    else marbles.numbers[side] = 8;
  });


  resetMarbles();

  function resetMarbles() {
    if (board.marble) {
      board.marble = false;
    }
    marbles.results = [];
    marbles.left = [...Array(marbles.numbers.left)].map(i => new BlueMarble());
    marbles.right = [...Array(marbles.numbers.right)].map(i => new RedMarble());
    marbles = marbles;
  }

  function triggerLever(side='left') {
    if (!board.marble && marbles[side].length) {
      try {
        let result = board.startRun(marbles[side].pop(), side);
        if (result) {
          marbles.results.push(result.marble);
          board = board;
          setTimeout(() => triggerLever(result.side), 500);
        }
        marbles = marbles;
      }
      catch(err) {
        resetMarbles();
      }
    }
  }

</script>
<div id="board-container">
  <div id="top-trays">
    <div class="container">
      <div class="marble-numbers">
        <img src="/images/marbleblue.svg" alt="{marbles.numbers.left} Blue Marbles">
        x {marbles.numbers.left}
      </div>
      <MarbleTray marbles={marbles.left}/>
    </div>
    <div class="container">
      <div class="marble-numbers">
        <img src="/images/marblered.svg" alt="{marbles.numbers.right} Red Marbles">
        x {marbles.numbers.right}
      </div>
      <MarbleTray direction="right" marbles={marbles.right}/>
    </div>
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
  #top-trays .container {
    width: 100%;
  }
  .marble-numbers {
    text-align: center;
    padding-bottom: 0.5em;
    cursor: pointer;
  }
  .marble-numbers img {
    height: 1.5em;
    width: 1.5em;
    margin-bottom: -0.4em;
  }
  .row {
    width: 66vh;
    height: 6vh;
    overflow: visible;
  }
  .position {
    background-image: url(/images/bg-peg.svg);
    background-size: cover;
    display: inline-block;
    width: 6vh;
    height: 6vh;
    overflow: visible;
  }

  @media (max-aspect-ratio: 7/9) {
    .row {
      width: 88vw;
      height: 8vw;
    }
    .position {
      width: 8vw;
      height: 8vw;
    }

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
    width: 120%;
    height: 120%;
    margin: -10%;
    pointer-events: none;
  }
  .slot .gear {
    transform: rotate(22.5deg);
  }
  .flipped {
    transform: scaleX(-1);
  }
</style>
