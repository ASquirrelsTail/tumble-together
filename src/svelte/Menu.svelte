<script>
  import { fade, fly, slide } from 'svelte/transition';
  import {createEventDispatcher, onMount} from 'svelte';
  import ShareURL from './ShareURL.svelte';
  import challenges from '../challenges.js';
  import { currentChallenge, rooms, basePath} from '../store.js'
  import { socket } from '../socket.js';
  import { decode, encode } from '../utilities.js';

  const dispatch = createEventDispatcher();

  $: if ($socket) $socket.on('challenge', id => {
      // If the challenge is changed by another player, updates the current challenge and title.
      if (id && id < challenges.length) {
        $currentChallenge = challenges[id];
        document.title = 'Tumble Together - ' + $currentChallenge.name;
        dispatch('instructionModal');
      } else {
        $currentChallenge = false;
        document.title = 'Tumble Together';
      }
    });

  const urlParams = new URLSearchParams(window.location.search);
  if (window.location.pathname.endsWith('room/') || window.location.pathname.endsWith('room')) {
    if (window.location.pathname.endsWith('room')) {
      history.pushState(null, document.title, window.location.pathname + '/');
      basePath.update();
    }
    decode();
    socket.connect(urlParams.get('uuid'));
    $rooms = true;
  } else {
    decode(urlParams.get('code'));
    onMount(() => {
      let newId = urlParams.has('id') ? urlParams.get('id') - 1 : false;
      if (newId && newId < challenges.length) {
        $currentChallenge = challenges[newId];
        document.title = 'Tumble Together - ' + $currentChallenge.name;
        dispatch('instructionModal');
        console.log('dipatched');
      }
      
      fetch($basePath + 'room/', {method: 'HEAD'}).then((response) => {
        $rooms = response.ok;
      });
    });
  }

  function startNewRoom() {
    if (!$socket) socket.connect(false, encode());
    if (!window.location.pathname.endsWith('room/'))
      history.pushState(null, document.title, $basePath + 'room/');
    closeMenu();
    basePath.update();
  }

  function leaveRoom() {
    if ($socket) socket.disconnect();
    history.pushState(null, document.title, $basePath);
    closeMenu();
    basePath.update();
  }


  function setUpBoard(newChallenge, id) {
    // Loads selected challenge, updates the title, and sends the challenge Id to other players if sockets.io is connected.
    let code = false;
    if (newChallenge) {
      code = newChallenge.code;
      $currentChallenge = newChallenge;
      document.title = 'Tumble Together - ' + $currentChallenge.name;
      if ($socket) $socket.emit('challenge', id);
      dispatch('instructionModal');
    }
    else {
      $currentChallenge = false;
      document.title = 'Tumble Together';
      if ($socket) $socket.emit('challenge', false);
    }
    decode(code);
    if (!socket.sendBoard()) {
      let url = $basePath;
      if (code) url += '?code=' + code + '&id=' + (id + 1);
      history.pushState(null, document.title, url);
      basePath.update();
    }
    closeMenu();
  }

  let visible = false;
  let showChallenges = false;

  function closeMenu() {
    visible = false;
  }

  function showAboutModal() {
    dispatch('aboutModal');
    closeMenu();
  }
</script>

<button id="menu-button" on:click="{() => visible = !visible}">
  <span>Menu </span>
  <img src="{$basePath}images/menu.svg" alt="Menu">
</button>

{#if visible}
<div transition:fade id="cover" on:click={closeMenu}></div>
<div transition:fly="{{ x: -300, duration: 600 }}" id="menu">
  <button on:click|preventDefault="{() => setUpBoard()}">Clear Board</button>
  {#if $rooms}
    {#if !$socket}
    <a class="btn" href="{$basePath}room/" on:click|preventDefault={startNewRoom}>Start Shared Room</a>
    {:else}
    <a class="btn" href="{$basePath}" on:click|preventDefault={leaveRoom}>Leave Shared Room</a>
    {/if}
  {/if}
  <button on:click="{() => showChallenges = !showChallenges}">Challenges <span class:up={showChallenges} class="arrow">&gt;</span></button>
  {#if showChallenges}
  <ol transition:slide id="challenges">
    {#each challenges as challenge, challengeId (challengeId)}
    <li><a href="{$basePath + '?code=' + challenge.code}"
        on:click|preventDefault="{() => setUpBoard(challenge, challengeId)}">
      {challenge.name}
    </a></li>
    {/each}
  </ol>
  {/if}
  <ShareURL />
  <a class="btn" href="{$basePath}about.html" on:click|preventDefault={showAboutModal}>About</a>
</div>
{/if}
<style>
  #menu-button {
    margin-bottom: 0;
    margin-right: 1rem;
  }

  #menu-button img {
    width: 1em;
    height: 1em;
    vertical-align: middle;
  }
  @media (max-width: 576px) {
    #menu-button span {
      display: none;
    }
  }

  #cover {
    position: fixed;
    background-color: black;
    opacity: 0.5;
    top: 0;
    left: 0;
    height: 100%;
    width: 100%;
    z-index: 1000;
  }

  #menu {
    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;
    width: 300px;
    max-width: 80%;
    padding: 0.5rem;
    z-index: 1001;
    background-color: white;
    overflow-y: auto;
  }

  #menu button {
    display: block;
    width: 100%;
  }

  #challenges {
    list-style: none;
    counter-reset: challenges;
    padding-left: 0.5rem;
    margin-top: 0.3rem;
    margin-bottom: 0.5rem;
  }

  #challenges li {
    counter-increment: challenges;
  }

  #challenges li:before {
    content: "#" counter(challenges) ":";
    margin-right: 0.5rem;
    width: 2.5em;
    display: inline-block;
  }

  .arrow {
    display: inline-block;
    transform: rotate(90deg);
    transition-property: transform;
    transition-duration: 0.5s;
    vertical-align: middle;
    margin-left: 0.5em;
  }

  .arrow.up {
    transform: rotate(-90deg);
  }

  a.btn {
    display: block;
    width: 100%;
    color: #333;
    background-color: #f4f4f4;
    outline: none;
    font-family: inherit;
    font-size: inherit;
    padding: 0.4em;
    margin: 0 0 0.5em 0;
    box-sizing: border-box;
    border: 1px solid #ccc;
    border-radius: 2px;
    text-align: center;
  }

  a:hover.btn {
    text-decoration: none;
  }
</style>