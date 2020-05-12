<script>
  import Modal from './Modal.svelte';
  import {createEventDispatcher} from 'svelte';
  import { currentChallenge, rooms } from '../store.js';

  export let visible = false;

  let challengeTitle
  let title = 'Instructions'

  $: challengeTitle = 'Instructions - Challenge #' + $currentChallenge.id + ': ' + $currentChallenge.name;
  $: title = !$currentChallenge ? 'Instructions' : challengeTitle;

  const dispatch = createEventDispatcher();

  function aboutModal() {
    visible = false;
    dispatch('aboutModal');
  }
</script>

<Modal {title} bind:visible>
  <article>
    {#if $currentChallenge}
      <h3>Objective:</h3>
      <p>{$currentChallenge.objective}</p>
      {#if $currentChallenge.output}
        <h3>Required Output:</h3>
        <p>
          {#each $currentChallenge.output as marble }
            <img src="/images/marble{marble === 'b' ? 'blue' : 'red'}.svg" alt="Marble">
          {/each}
        </p>
      {/if}
      <h3>Instructions</h3>
      <p>Use the available parts to complete the challenge. Greyed-out parts cannot be moved, but greyed-out Bits and Gear Bits can be flipped by clicking/tapping on them. Press the {#if $currentChallenge.trigger}{$currentChallenge.trigger}{:else}either{/if} trigger to start the marbles rolling. Press the <span class="orbitron">Reset</span> button to put the marbles back and try again.</p>
    {/if}
    <p>New parts can be dragged from the box and placed on the board. Most parts require a slot (or smile) to fit on the board, only the Red Gears can be placed on pegs without a slot. To flip a part simply tap/click on it once. To remove a part from drag it off the board.
    {#if !$currentChallenge}
      You can set the number of available parts in the box by clicking or tapping the corresponding part.
    {/if}
    </p>
    {#if !$currentChallenge}
      <p>To start the marbles rolling press the trigger on the side you would like to start with. To put the marbles back to the start, or end the run early, press the <span class="orbitron">Reset</span> button in the bottom right. You can change the number of marbles by clicking/tapping the marbles at the top of the board.</p>
    {/if}
    <p>A collection of ready made challenges can be found in the <span class="orbitron">Menu <img src="/images/menu.svg" alt="Menu"></span> in the top right, as well as buttons to clear the board and copy the current board to a URL you can share with others.</p>
    {#if $rooms}
      <p>To work together with friends you can start a shared room from the <span class="orbitron">Menu <img src="/images/menu.svg" alt="Menu"></span> and send the link to others to work on he same board, tackle challenges together and share changes in real time. Use the menu to leave a shared room as well.</p>
    {/if}
    <p>You can return to these instructions at any time by clicking the <span class="orbitron">Instructions ?</span> button in the top right</p>
    <p>More information about Tumble Together and the <a href="https://www.turingtumble.com/" target="_blank">Turing Tumble</a> can be found on <a href="/about/" on:click|preventDefault={aboutModal}>the about page.</a></p>
  </article>
</Modal>

<style>
  h3 {
    margin-top: 0;
    margin-bottom: 0.5rem;
  }

  p {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif;
  }

  .orbitron {
    font-family: 'Orbitron';
  }

  .orbitron img {
    width: 1em;
    height: 1em;
    vertical-align: middle;
  }
</style>