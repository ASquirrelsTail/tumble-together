<script>
  export let parts = [];
  export let holding;


  function grab(e, part) {
    if ((e.type === 'mousedown' && e.button === 0) ||
        (e.type === 'touchstart' && e.touches.length === 1) && 
        part.count && !holding) {
      e.preventDefault();
      e.stopPropagation();
      console.log(`Grabbed ${part.name}`);
      part.count -= 1;
      parts = parts;
      holding = new part();
    }
  }
</script>

<div id="parts-tray">
  {#each parts as part}
  <div class="part" class:unavailable={!part.count}
      on:mousedown="{e => grab(e, part)}"
      on:touchstart="{e => grab(e, part)}">
    <img src="/images/{part.name}.svg" alt={part.name}>
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
    width: 8vh;
    padding: 0.4vh;
    border: 3px solid grey;
    border-radius: 10px;
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