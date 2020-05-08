<script>
  import { fade, fly, slide } from 'svelte/transition';
  import {createEventDispatcher} from 'svelte';
  import ShareURL from './ShareURL.svelte';
  import challenges from '../challenges.js';
  import { currentChallenge } from '../store.js'
  import { decode, socket } from '../utilities.js';

  const dispatch = createEventDispatcher();

  if (socket) socket.on('challenge', id => {
    // If the challenge is changed by another player, updates the current challenge and title.
    if (id && id < challenges.length) {
      $currentChallenge = challenges[id];
      document.title = 'Tumble Together - ' + $currentChallenge.name;
    } else {
      $currentChallenge = false;
      document.title = 'Tumble Together';
    }
  });

  function setUpBoard(newChallenge, id) {
    // Loads selected challenge, updates the title, and sends the challenge Id to other players if sockets.io is connected.
    if (newChallenge) {
      decode(newChallenge.code, true);
      $currentChallenge = newChallenge;
      document.title = 'Tumble Together - ' + $currentChallenge.name;
      if (socket) socket.emit('challenge', id);
    }
    else {
      decode(false, true);
      $currentChallenge = false;
      document.title = 'Tumble Together';
      if (socket) socket.emit('challenge', false);
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
  <img src="/images/menu.svg" alt="Menu">
</button>

{#if visible}
<div transition:fade id="cover" on:click={closeMenu}></div>
<div transition:fly="{{ x: -300, duration: 600 }}" id="menu">
  <button on:click|preventDefault="{() => setUpBoard()}">Clear Board</button>
  <button on:click="{() => showChallenges = !showChallenges}">Challenges <span class:up={showChallenges} class="arrow">&gt;</span></button>
  {#if showChallenges}
  <ol transition:slide id="challenges">
    {#each challenges as challenge, challengeId (challengeId)}
    <li><a href="{window.location.origin + window.location.pathname + '?code=' + challenge.code}"
        on:click|preventDefault="{() => setUpBoard(challenge, challengeId)}">
      {challenge.name}
    </a></li>
    {/each}
  </ol>
  {/if}
  <ShareURL />
  <a class="btn" href="/about.html" on:click|preventDefault={showAboutModal}>About</a>
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
</style>