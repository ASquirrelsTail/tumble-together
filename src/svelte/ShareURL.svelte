<script>
  export let textFunction = () => '';

  let copyText;

  function copyToClipboard() {
    copyText.value = textFunction();

    copyText.style.display = 'inline-block';

    copyText.select();
    copyText.setSelectionRange(0, 99999);

    document.execCommand('copy');

    copyText.style.display = '';

  }
</script>

<div class="copy-url">
  <button on:click={copyToClipboard}><slot></slot></button>
  <textarea name="url" class="copy-text" cols="30" rows="10" bind:this={copyText}></textarea>
</div>

<style>
  .copy-text {
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