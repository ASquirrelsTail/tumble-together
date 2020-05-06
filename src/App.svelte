<script>
	import PlayArea from './PlayArea.svelte';
  import Menu from './Menu.svelte';

  let encode;
  let decode;


</script>

<main>
  <nav>
    <h1>Tumble Together!</h1>
    <Menu {encode} {decode}/>
  </nav>
	<PlayArea on:decoders="{(e) => {encode = e.detail.encode; decode = e.detail.decode}}"/>
</main>

<style>
  nav {
    width: 100%;
    display: flex;
    justify-content: space-between;
    background-color: #eee;
    padding: 0.2rem 0;
    margin-bottom: 0.3rem;
  }
  nav h1 {
    margin: 0 0.5rem;
  }
</style>
