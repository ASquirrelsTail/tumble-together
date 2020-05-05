<script>
  import Board from './boardUtils.js';

  export let generator;

  let copyText;

  function copyToClipboard() {
    let code = generator();

    let url = `${window.location.origin}${window.location.pathname}?code=${code}`;

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