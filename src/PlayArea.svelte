<script>
  import GameBoard from './GameBoard.svelte';
  import PartsTray from  './PartsTray.svelte';
  import Hand from './Hand.svelte';
  import ShareURL from './ShareURL.svelte';
  import components from './components.js';
  import Board from './boardUtils.js';
  import io from 'socket.io-client'

  let holding = false;
  let mousePosition = {};
  let boardElement;

  let parts = Object.values(components);

  // For each part check the query string for the count, otherwise infinity.
  const urlParams = new URLSearchParams(window.location.search);
  parts.forEach(part => {
    if (urlParams.has(part.name) && parseInt(urlParams.get(part.name)) != NaN)
      part.count = Math.max(0, parseInt(urlParams.get(part.name)));
    else part.count = Infinity;
  });

  let socket = false;
  let code = false;
  if (window.location.pathname === '/room/') {
    socket = io.connect(window.location.origin);
  } else if (urlParams.has('code')) code = urlParams.get('code');
  let board = Board.create(code);

  if (socket) socket.on('board', (code) => board = Board.create(code));

  function sendBoard() {
    if (socket) socket.emit('board', board.encode());
  }

  function getBoardPosition(pageX, pageY) {
    let boardRect = boardElement.getBoundingClientRect();
    let x = Math.floor((pageX - boardRect.left) / (boardRect.width / board[0].length));
    let y = Math.floor((pageY - boardRect.top) / (boardRect.height / board.length));
    if (pageX > boardRect.left && pageX < boardRect.right &&
        pageY > boardRect.top && pageY < boardRect.bottom &&
        board.isValid(x, y)) return [x, y];
    else return false;
  }

  let lastGrab = {x: false, y: false, timeout: false};

  function setMousePosition(e) {
    mousePosition.left = e.pageX;
    mousePosition.top = e.pageY;
  }

  function touchMove(e) {
    if (e.touches.length === 1) {
      setMousePosition(e.touches[0]);
      e.preventDefault();
      e.stopPropagation();
    }
  }

  function drop(e, force=false) {
    if (holding && ((e.type === 'mouseup' && e.button === 0) ||
        (e.type === 'touchend' && e.changedTouches.length === 1 && e.touches.length === 0) || force)) {
      let boardPosition;
      if (e.type === 'touchend') boardPosition = getBoardPosition(e.changedTouches[0].pageX, e.changedTouches[0].pageY);
      else boardPosition = getBoardPosition(e.pageX, e.pageY);
      if (boardPosition && (!holding.requiresSlot || board.hasSlot(...boardPosition)) &&
          !board[boardPosition[1]][boardPosition[0]]) {
        board[boardPosition[1]][boardPosition[0]] = holding;
        if (lastGrab.x === boardPosition[0] && lastGrab.y === boardPosition[1]) {
          holding.flip();
          console.log(`Flipped ${holding.name}`);
        }
        console.log(`Placed ${holding.name}`);
        sendBoard();
      }else{
        parts.find(part => part.name === holding.name).count++;
        parts = parts;
        console.log(`Dropped ${holding.name}`);
      }
      if (lastGrab.timeout) window.clearTimeout(lastGrab.timeout)
      holding = false;
      e.preventDefault();
      e.stopPropagation();
    }
  }

</script>

<div id="play-area" class:grabbed={holding}
    on:mousemove={setMousePosition}
    on:mouseup={drop}
    on:mouseleave="{e => drop(e, true)}"
    on:touchmove={touchMove}
    on:touchend="{e => drop(e)}">
  <GameBoard bind:boardElement={boardElement} bind:board={board} bind:holding={holding}
    on:grab="{sendBoard}" bind:lastGrab={lastGrab}/>
  <PartsTray bind:parts={parts} bind:holding={holding}/>
</div>
<Hand {holding} {mousePosition}/>
<ShareURL {board} {parts} />

<style>
  #play-area {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }
  @media (min-aspect-ratio: 9/8) {
    #play-area {
      flex-direction: row;
    }
  }
  .grabbed {
    cursor: grabbing;
  }
</style>