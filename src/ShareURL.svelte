<script>
  import Board from './boardUtils.js';

  export let encode;

  let copyText;

  function copyToClipboard() {
    let code = encode();

    let pathname = window.location.pathname;

    if (pathname.endsWith('room/')) pathname = pathname.slice(0, - 'room/'.length);
    if (pathname.endsWith('about/')) pathname = pathname.slice(0, - 'about/'.length);

    let url = `${window.location.origin}${pathname}?code=${code}`;

    copyText.value = url;

    copyText.style.display = 'inline-block';

    copyText.select();
    copyText.setSelectionRange(0, 99999);

    document.execCommand('copy');

    copyText.style.display = '';

  }
</script>

<div id="copy-url">
  <button on:click={copyToClipboard}>Copy Board Link To Clipboard</button>
  <textarea name="url" id="copy-text" cols="30" rows="10" bind:this={copyText}></textarea>
</div>

<style>
  #copy-text {
    display: none;
    width: 1px;
    height: 1px;
    pointer-events: none;
    opacity: 0;
  }

  button {
    width: 100%;
  }
</style>