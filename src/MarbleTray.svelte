<script>
  export let marbles = [];
  export let direction = 'left'
</script>

<div id="marble-tray" style="text-align: {direction};">
  {#each marbles as marble, i (i)}
    <img src="/images/marble{marble.color}.svg" alt="{marble.color} marble">
  {/each}
</div>

<style>
  #marble-tray {
    width: 90%;
    /*transform: rotate(5deg);*/
    /*border: 3px solid grey;
    border-top: none;
    border-left:none;
    border-radius: 0 0 10px 0;*/
  }

  #marble-tray img {
    width: 1.44vh;
    height: 1.44vh;
  }

  @media (max-aspect-ratio: 7/9) {
    #marble-tray img{
      width: 1.92vw;
      height: 1.92vw;
    }
  }

  /*#marble-tray img {
    transform: rotate(-5deg);
    margin-bottom: -3px;
  }*/
</style>