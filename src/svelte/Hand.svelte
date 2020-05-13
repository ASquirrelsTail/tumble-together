<script>
  import { holding, basePath } from '../store.js';

  export let mousePosition;
</script>

{#if $holding}
<div id="hand" style="top: {mousePosition.top}px;
    left: {mousePosition.left}px;">
  <img class:flipped={$holding.facing} src="{$basePath}images/{$holding.name}.svg" alt={$holding.name}>
</div>
{/if}

<style>
  #hand {
    position: absolute;
    transform: translate(-50%, -50%);
    cursor: grabbing;
    pointer-events: none;
  }
  #hand img {
    width: 7.2vh;
    height: 7.2vh;
  }
  .flipped {
    transform: scaleX(-1);
  }

  @media (max-aspect-ratio: 7/9) {
    #hand img{
      width: 9.6vw;
      height: 9.6vw;
    }
  }
</style>