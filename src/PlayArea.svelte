<script>
  import GameBoard from './GameBoard.svelte';
  import PartsTray from  './PartsTray.svelte';
  import Hand from './Hand.svelte';
  import {urlEncode64} from './constants.js';
  import components from './components.js';
  import {BlueMarble, RedMarble} from './marbles.js';
  import Board from './boardUtils.js';
  import io from 'socket.io-client'
  import { createEventDispatcher, onMount } from 'svelte';

  let holding = false;
  let mousePosition = {};
  let board;
  let boardElement;

  function encode() {
    return board.encode() + urlEncode64[63] + urlEncode64[marbles.numbers.left] + urlEncode64[marbles.numbers.right] + 
      parts.filter(part => part.count < 20).map(part => urlEncode64[part.code[0]] + urlEncode64[part.count]).join('');
  }

  function decode(code, send=false) {
    board = Board.create(code);
    board = board;

    let partsCode = false;
    if (code)
      partsCode = code.split(urlEncode64[63]).length === 2 ? code.split(urlEncode64[63])[1] : false;

    parts.forEach(part => {
      if (partsCode) {
        let marker = partsCode.indexOf(urlEncode64[part.code[0]]);
        if (marker > 0 && marker + 1 < partsCode.length) part.count = urlEncode64.indexOf(partsCode[marker + 1]);
        else part.count = Infinity;
      } else part.count = Infinity;
    });
    parts = parts;

    marbles.numbers = {left: 8, right: 8};

    if (partsCode) {
      let left = urlEncode64.indexOf(partsCode[0]);
      let right = urlEncode64.indexOf(partsCode[1]);
      if (left <= 20 && right <= 20) {
        marbles.numbers.left = left;
        marbles.numbers.right = right;
      }
    }
    marbles.reset();
    if (send && !sendBoard()) {
      let url = window.location.pathname;
      if (code) url += '?code=' + code;
      history.pushState(null, document.title, url);
    }
  }

  const dispatch = createEventDispatcher();
  onMount(() => {
    dispatch('decoders', {encode, decode});
  });

  
  const urlParams = new URLSearchParams(window.location.search);

  let socket = false;
  let code = false;
  if (window.location.pathname === '/room/') {
    socket = io.connect(window.location.origin);
  } else if (urlParams.has('code')) code = urlParams.get('code');

  let parts = Object.values(components);

  let marbles = {
    numbers: {left: 8, right: 8},
    reset() {
      if (board.marble) {
        board.marble = false;
      }
      this.results = [];
      this.left = [...Array(this.numbers.left)].map(i => new BlueMarble());
      this.right = [...Array(this.numbers.right)].map(i => new RedMarble());
      marbles = marbles;
      board.position = false;
      board = board;
    }
  };

  decode(code);

  if (socket) {
    socket.on('board', decode);
  }

  function sendBoard() {
    if (socket) {
      socket.emit('board', encode());
      return true;
    }else return false;
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
      if (!board.marble && boardPosition && (!holding.requiresSlot || board.hasSlot(...boardPosition)) &&
          !board[boardPosition[1]][boardPosition[0]]) {
        board[boardPosition[1]][boardPosition[0]] = holding;
        if (lastGrab.x === boardPosition[0] && lastGrab.y === boardPosition[1]) {
          board.flip(...boardPosition);
          console.log(`Flipped ${holding.name}`);
        }
        console.log(`Placed ${holding.name}`);
        let flipableNeighbors = Array.from(board.flipableNeighbors(...boardPosition));
        if (flipableNeighbors.length > 1) flipableNeighbors.forEach(part => part.facing = flipableNeighbors[1].facing);
      }else{
        parts.find(part => part.name === holding.name).count++;
        parts = parts;
        console.log(`Dropped ${holding.name}`);
      }
      if (lastGrab.timeout) window.clearTimeout(lastGrab.timeout)
      holding = false;
      sendBoard();
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
    on:touchend={drop}>
  <GameBoard bind:boardElement bind:board bind:marbles bind:holding
    bind:lastGrab {socket} on:send={sendBoard}/>
  <PartsTray bind:parts bind:holding/>
</div>
<Hand {holding} {mousePosition}/>

<style>
  #play-area {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
  }
  @media (max-aspect-ratio: 7/9) {
    #play-area {
      flex-direction: column;
    }
  }
  .grabbed {
    cursor: grabbing;
  }
</style>