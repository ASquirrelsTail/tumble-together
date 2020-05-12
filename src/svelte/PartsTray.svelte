<script>
  import NumbersModal from './NumbersModal.svelte';
  import { holding, currentChallenge } from '../store.js';
  import { parts } from '../parts.js';

  function grab(e, part) {
    if (((e.type === 'mousedown' && e.button === 0) ||
         (e.type === 'touchstart' && e.touches.length === 1)) && 
         !$holding) {
      e.preventDefault();
      e.stopPropagation();
      if (part.count > 0) {
        console.log(`Grabbed ${part.name}`);
        part.count -= 1;
        $holding = new part();
      }
      part.editTimer = setTimeout(() => part.editTimer = false, 600);
      $parts = $parts;
    }
  }

  function edit(e, part) {
    if (part.editTimer && ((e.type === 'mouseup' && e.button === 0) ||
         (e.type === 'touchend' && e.changedTouches.length === 1 && e.touches.length === 0))) {
      if (e.type === 'touchend') {
        const targetArea = e.target.getBoundingClientRect();
        const pageX = e.changedTouches[0].pageX;
        const pageY = e.changedTouches[0].pageY;
        if (pageX > (targetArea.left + window.scrollX) && pageX < (targetArea.right + window.scrollX) &&
            pageY > (targetArea.top + window.scrollY) && pageY < (targetArea.bottom + window.scrollY))
                part.editing = !$currentChallenge;
      } else part.editing = !$currentChallenge;
      clearTimeout(part.editTimer);
      part.editTimer = false;
      $parts = $parts;
    }
  }

  function updatePartNumbers(part, number) {
    part.count = number;
    $parts = $parts;
  }
</script>

<div id="parts-tray">
  {#each $parts as part}
  <div class="part" class:unavailable={!part.count}
      on:mousedown="{e => grab(e, part)}"
      on:touchstart="{e => grab(e, part)}"
      on:mouseup="{e => edit(e, part)}"
      on:touchend="{e => edit(e, part)}">
    <img src="/images/{part.name}.svg" alt={part.name}>
    <span class="count">x 
      {#if part.count != Infinity}
        {part.count}
      {:else}
        <span class="infinity">&infin;</span>
      {/if}
    </span>
  </div>
  <NumbersModal bind:visible="{part.editing}" title="Number of {part.name}s"
    number={part.count} on:update="{(e) => updatePartNumbers(part, e.detail)}">
    <img class="modal-image" src="/images/{part.name}.svg" alt={part.name}>
  </NumbersModal>
  {/each}
</div>

<style>
  #parts-tray {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    width: 8vh;
    padding: 0.4vh;
    border: 3px solid #c8c8c8;
    border-radius: 10px;
    margin: 10px;
  }
  .part {
    cursor: grab;
    width: 100%;
  }
  .part img {
    display: block;
    margin-left: auto;
    margin-right: auto;
    width: 7.2vh;
    height: 7.2vh;
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
    top: 0.35rem;
    font-size: 2rem;
    font-weight: normal;
    line-height: 0;
  }

  .modal-image {
    width: 120px;
    height: 120px;
  }

  @media (max-aspect-ratio: 7/9) {
    #parts-tray {
      flex-direction: row;
      width: unset;
      padding: 0.2vw;
    }
    .part {
      width: unset;
    }
    .part img{
      width: 9.6vw;
      height: 9.6vw;
    }
  }
</style>