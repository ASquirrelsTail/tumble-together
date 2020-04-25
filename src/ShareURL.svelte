<script>
  import encodeBoard from './encodeBoard.js';

  export let board;
  export let parts;

  let copyText;

  function copyToClipboard() {
    let code = encodeBoard(board);
    let query = parts.filter(part => part.count !== Infinity).map(part => `${part.name}=${part.count}`).join('&');

    let url = `${window.location.origin}${window.location.pathname}?code=${code}&${query}`;

    copyText.value = url;

    copyText.select();
    copyText.setSelectionRange(0, 99999);

    document.execCommand('copy');

  }
</script>

<div id="copy-url">
  <button on:click={copyToClipboard}>Copy Board Link To Clipboard</button>
  <textarea name="url" id="copy-text" cols="30" rows="10" bind:this={copyText}></textarea>
</div>

<style>
  #copy-text {
    /*display: none;*/
    width: 1px;
    height: 1px;
    pointer-events: none;
    opacity: 0;
  }
</style>