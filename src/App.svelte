<script>
	import PlayArea from './PlayArea.svelte';
  import Menu from './Menu.svelte';
  import AboutModal from './AboutModal.svelte';

  let encode;
  let decode;

  let aboutModal = false;


</script>


<nav>
  <h1>Tumble Together!</h1>
  <Menu {encode} {decode} on:aboutModal="{() => aboutModal = true}"/>
</nav>
<PlayArea on:decoders="{(e) => {encode = e.detail.encode; decode = e.detail.decode}}"/>

<AboutModal bind:visible={aboutModal} />

<style>
  nav {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-content: center;
    background-color: #eee;
    padding: 0.2rem 0;
    margin-bottom: 0.5rem;
    border-bottom: solid #3c98f6 5px;
  }
  nav h1 {
    margin: 0 0.5rem;
  }

  main {
    display: none;
  }
</style>
