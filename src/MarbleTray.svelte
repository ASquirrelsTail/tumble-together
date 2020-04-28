<script>
  export let marbles = [];
</script>

<div id="marble-tray">
  {#each marbles as marble, i (i)}
    <img src="/images/marble{marble.color}.svg" alt="{marble.color} marble">
  {/each}
</div>

<style>
  #marble-tray {
    width: 40%;
    /*transform: rotate(5deg);*/
    text-align: center;
    /*border: 3px solid grey;
    border-top: none;
    border-left:none;
    border-radius: 0 0 10px 0;*/
  }

  /*#marble-tray img {
    transform: rotate(-5deg);
    margin-bottom: -3px;
  }*/
</style>