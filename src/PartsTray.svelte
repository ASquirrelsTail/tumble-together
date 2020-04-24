<script>
  import { createEventDispatcher } from 'svelte';

  export let parts = [];

  const dispatch = createEventDispatcher();

  function grab(e, part) {
    if (e.button === 0 && part.count){
      e.preventDefault();
      console.log(`Grabbed ${part.name}`);
      part.count -= 1;
      parts = parts;
      dispatch('grab', new part());
    }
  }
</script>

<div id="parts-tray">
  {#each parts as part}
  <div class="part" class:unavailable={!part.count} on:mousedown="{e => {grab(e, part)}}">
    <img src="images/{part.name}.svg" alt={part.name}>
    <span class="count">x 
      {#if part.count != Infinity}
        {part.count}
      {:else}
        <span class="infinity">&infin;</span>
      {/if}
    </span>
  </div>
  {/each}
</div>

<style>
  #parts-tray {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    height: 100%;
  }
  .part {
    cursor: grab;
    width: 70px;
  }
  .part.unavailable {
    cursor: default;
    opacity: 0.4;
  }
  .count {
    display: block;
    font-weight: bold;
    text-align: right;
    padding-bottom: 1rem;
    margin-top: -0.5rem;
  }
  .count .infinity {
    position: relative;
    top: 0.55rem;
    font-size: 3rem;
    font-weight: normal;
    line-height: 0;
  }
</style>