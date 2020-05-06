<script>
  import challenges from './challenges.js';
  import { fade, fly } from 'svelte/transition';
  import ShareURL from './ShareURL.svelte';

  export let encode = () => {};
  export let decode = () => {};

  function setUpBoard(code) {
    decode(code, true);
  }

  let visible = false;
</script>

<button id="menu-button" on:click="{() => visible = !visible}">
  <span>Menu </span>
  <img src="/images/menu.svg" alt="Menu">
</button>

{#if visible}
<div transition:fade id="cover" on:click="{() => visible = false}"></div>
<div transition:fly="{{ x: -300, duration: 600 }}" id="menu">
  <button on:click|preventDefault="{() => setUpBoard()}">Clear Board</button>
  <h2>Challenges</h2>
  <ol id="challenges">
    {#each challenges as challenge}
    <li><a href="{window.location.origin + window.location.pathname + '?code=' + challenge.code}"
        on:click|preventDefault="{() => setUpBoard(challenge.code)}">
      {challenge.name}
    </a></li>
    {/each}
  </ol>
  <ShareURL {encode} />
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

  #menu {
    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;
    width: 300px;
    z-index: 1001;
    background-color: white;
    overflow-y: auto;
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

  #challenges {
    list-style: none;
    counter-reset: challenges;
    padding-left: 0.5rem;
  }

  #challenges li {
    counter-increment: challenges;
  }

  #challenges li:before {
    content: "#" counter(challenges) ":";
    margin-right: 0.5rem;
    width: 2em;
    display: inline-block;
  }
</style>