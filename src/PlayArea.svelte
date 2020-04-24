<script>
  import Board from './Board.svelte';
  import PartsTray from  './PartsTray.svelte';
  import Hand from './Hand.svelte';
  import ShareURL from './ShareURL.svelte';
  import components from './components.js';
  import createBoard from './createBoard.js';

  let holding = false;
  let mousePosition = {};

  let parts = Object.values(components);

  // For each part check the query string for the count, otherwise infinity.
  const urlParams = new URLSearchParams(window.location.search);
  parts.forEach(part => {
    if (urlParams.has(part.name) && parseInt(urlParams.get(part.name)) != NaN)
      part.count = Math.max(0, parseInt(urlParams.get(part.name)));
    else part.count = Infinity;
  });

  let code = false;
  if (urlParams.has('code')) code = urlParams.get('code');
  let board = createBoard(code);

  function setMousePosition(e) {
    mousePosition.left = e.pageX;
    mousePosition.top = e.pageY;
    mousePosition.moveX = e.movementX;
    mousePosition.moveY = e.movementY;
  }

  function drop(e, mouseOut = false) {
    if (holding && (e.button === 0 || mouseOut)) {
      parts.find(part => part.name === holding.name).count++;
      parts = parts;
      console.log(`Dropped ${holding.name}`);
      holding = false;
    }
  }

</script>

<div id="play-area" class:grabbed={holding} on:mousemove={setMousePosition} on:mouseup={drop} on:mouseleave="{e => drop(e, true)}">
  <Board  bind:board={board} bind:holding={holding} on:grab="{e => holding=e.detail}"/>
  <PartsTray bind:parts={parts} on:grab="{e => holding=e.detail}"/>
  <ShareURL {board} {parts} />
  <Hand {holding} {mousePosition}/>
</div>

<style>
  .grabbed {
    cursor: grabbing;
  }
</style>