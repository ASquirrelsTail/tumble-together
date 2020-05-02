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
      board.startRun(marbles[side].pop(), side, () => {
        board = board;
        return new Promise(resolve => setTimeout(resolve, 300));
      }).then(result => {
        if (result) {
          marbles.results.push(result.marble);
          board = board;
          triggerLever(result.side);
          marbles = marbles;
        }
      }).catch(resetMarbles);
    }
  }

  function isMoving(x, y) {
    return (board.position && ((x === board.position.x && y === board.position.y) ||
      (board.flipableNeighbors(board.position.x, board.position.y).has(board.at(x, y)))))
  }

  function hasMarble(x, y) {
    return (board.marble && board.position &&
      ((x === board.position.x && y === board.position.y)));
  }

  function marbleDirection(x, y) {
    return hasMarble(x, y) &&
      (Math.floor((board.direction +1) / 2) === board.at(x, y).facing);
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
          <div class:flipped={part.facing} class={part.name} class:right="{marbleDirection(x, y)}" >
            <div class="wrapper" class:down="{isMoving(x, y)}">
              <img class="part" src="/images/{part.name}.svg" alt={part.name}>
              {#if hasMarble(x, y)}
                <img class="marble" src="/images/marble{board.marble.color}.svg" alt="">
              {/if}
            </div>
          </div>
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
  .wrapper {
    position: relative;
  }
  .part {
    width: 120%;
    height: 120%;
    margin: -10%;
    pointer-events: none;
  }
  .slot .gear .part {
    transform: rotate(22.5deg);
  }
  .slot .gear.flipped .part {
    transform: rotate(-22.5deg);
  }
  .flipped {
    transform: scaleX(-1);
  }
  .ramp .wrapper {
    transition: transform 0.2s ease-in;
  }
  .down {
    transition: transform 0.2s ease-in;
    transform: rotate(-90deg);
    transition-delay: 0.05s;
  }

  .crossover .down, .interceptor .down {
    transform: none;
  }
  .ramp.right .down, .bit.right .down {
    transition-delay: 0.1s;
  }
  .marble {
    position: absolute;
    top: 10%;
    left: 10%;
    transform: translate(-50%, -50%);
    animation-duration: 0.3s;
  }

  .marble {
    width: 1.44vh;
    height: 1.44vh;
    z-index: 1;
  }

  .bit .part, .gearbit .part {
    position: relative;
    z-index: 2;
  }

  @media (max-aspect-ratio: 7/9) {
    .marble {
      width: 1.92vw;
      height: 1.92vw;
    }
  }



  @keyframes ramp {
    0% {top: -10%; left: 0;}
    30% {top: 20%; left: 20%;}
    90% {top: 20%; left: 20%;}
    100% {top: -10%; left: -10%;}
  }

  @keyframes rampright {
    0% {top: -10%; left: 100%;}
    30% {top: 20%; left: 20%;}
    90% {top: 20%; left: 20%;}
    100% {top: -10%; left: -10%;}
  }

  @keyframes bit {
    0% {top: -10%; left: 0;}
    30% {top: 38%; left: 20%;}
    85% {top: 38%; left: 20%;}
    100% {top: -10%; left: -10%;}
  }

  @keyframes bitright {
    0% {top: -10%; left: 100%;}
    20% {top: 0; left: 60%;}
    30% {top: 38%; left: 20%;}
    90% {top: 38%; left: 20%;}
    100% {top: -10%; left: -10%;}
  }

  @keyframes crossover {
    0% {top: -10%; left: 0;}
    10% {top: 10%; left: 10%;}
    20% {top: 25%; left: 20%;}
    30% {top: 40%; left: 15%;}
    40% {top: 60%; left: 25%;}
    50% {top: 75%; left: 40%;}
    60% {top: 85%; left: 50%;}
    100% {left: 100%;}
  }

  @keyframes crossoverright {
    0% {top: -10%; left: 100%;}
    10% {top: 10%; left: 90%;}
    20% {top: 25%; left: 80%;}
    30% {top: 40%; left: 85%;}
    40% {top: 60%; left: 75%;}
    50% {top: 75%; left: 60%;}
    60% {top: 85%; left: 50%;}
    100% {left: 0;}
  }

  @keyframes interceptor {
    0% {top: -10%; left: 0;}
    10% {top: 10%; left: 10%;}
    20% {top: 25%; left: 20%;}
    30% {left: 30%;}
    100% {left: 50%;}
  }

  @keyframes interceptorright {
    0% {top: -10%; left: 100%;}
    10% {top: 10%; left: 90%;}
    20% {top: 25%; left: 80%;}
    30% {left: 70%;}
    100% {left: 50%;}
  }

  .ramp .marble, .bit .marble {
    animation-name: ramp;
    top: -10%;
    left: -10%;
  }

  .ramp.right .marble, .bit.right .marble {
    animation-name: rampright;
  }

  .bit .marble, .gearbit .marble {
    animation-name: bit;
    top: -10%;
    left: -10%;
  }

  .bit.right .marble, .gearbit.right .marble {
    animation-name: bitright;
  }

  .interceptor .marble {
    animation-name: interceptor;
    top: 25%;
    left: 50%;
  }
  .interceptor.right .marble{
    animation-name: interceptorright;
  }

  .crossover .marble {
    animation-name: crossover;
    top: 85%;
    left: 100%;
  }

  .crossover.right .marble {
    animation-name: crossoverright;
    top: 85%;
    left: 0;
  }
</style>
