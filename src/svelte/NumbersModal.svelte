<script>
  import Modal from './Modal.svelte';
  import { createEventDispatcher, tick } from 'svelte';

  export let number = 0;
  export let max = 50;
  export let infinity = true;
  export let title;
  export let visible = false;

  let input;
  let inputElement;
  $: input = number === Infinity ? '∞' : number;

  const dispatch = createEventDispatcher();

  function increase() {
    if (input !== '∞' && parseInt(input) < max) input = parseInt(input) + 1;
    else if (infinity) input = '∞';
    else input = max;
  }

  function decrease() {
    if (input !== '∞') input = Math.max(0, parseInt(input) - 1);
    else input = max;
  }

  function beforeInput(e) {
    if (e.data !== null){
      const newData = e.data.replace(/[^0-9]/, '');
      if (newData === '') e.preventDefault();
      if (input === '∞') input = '';
    }
  }

  function onInput(e) {
    if (input === '') input = '0';
    input = Math.max(0, parseInt(input));
    if (input > max) input = infinity ? '∞' : max;
  }

  function cancel() {
    visible = false;
    input = number;
  }

  function ok() {
    dispatch('update', input === '∞' ? Infinity : parseInt(input));
    visible = false;
  }
</script>

<Modal {title} bind:visible>
  <div class="container">
    <div>
      <slot></slot>
    </div>
    <div>
      <div class="number-input">
        <button class="decrease" on:click={decrease}>-</button><form on:submit|preventDefault={ok}><input maxlength=2 type="text" bind:value={input} bind:this={inputElement} class:infinity="{input==='∞'}" on:input={onInput}
        on:beforeinput={beforeInput}></form><button class="increase"  on:click|preventDefault={increase}>+</button>
      </div>
      {#if infinity}
      <div class="infinity-button">
        <button class="infinity" on:click="{() => input = '∞'}"><span>&infin;</span></button>
      </div>
      {/if}
    </div>
  </div>
  <div class="confirm">
    <button on:click={ok}>OK</button> <button on:click={cancel}>Cancel</button>
  </div>
</Modal>

<style>
  .container {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .infinity {
    font-size: 2rem;
    vertical-align: bottom;
    margin-bottom: 0.5rem;
  }

  button.infinity {
    height: 2.2rem;
    border-top: 0;
    border-radius: 0 0 2px 2px;
    width: 7.4rem;
  }

  button.infinity span {
    position: relative;
    top: -1.2rem;
  }

  .number-input input {
    width: 3rem;
    height: 2.2rem;
    text-align: center;
    border-radius: 0px;
    border-width: 1px 0;
    margin-bottom: 0;
  }

  .number-input form {
    display: inline;
  }

  .increase, .decrease {
    width: 2.2rem;
    height: 2.2rem;
    margin-bottom: 0;
  }

  .decrease {
    border-radius: 2px 0 0 0;
  }

  .increase {
    border-radius: 0 2px 0 0;
  }

  .confirm {
    text-align: right;
    font-size: 1.4em;
    display: flex;
    justify-content: space-around;
    margin-top: 1rem;
  }

  @media (max-width: 576px) {
    .confirm {
      text-align: center;
    }
  }
</style>
