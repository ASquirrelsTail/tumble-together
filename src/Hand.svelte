<script>
  export let holding;
  export let mousePosition;
</script>

{#if holding}
<div id="hand" style="top: {mousePosition.top}px;
    left: {mousePosition.left}px;">
  <img class:flipped={holding.facing} src="images/{holding.name}.svg" alt={holding.name}>
</div>
{/if}

<style>
  #hand {
    position: absolute;
    transform: translate(-50%, -50%);
    cursor: grabbing;
    pointer-events: none;
  }
  .flipped {
    transform: scaleX(-1);
  }
</style>