<script>
  import { toastMessage } from '../store.js';
  import { fly } from 'svelte/transition';

  let timer;

  $: if ($toastMessage) {
    timer = setTimeout(() => $toastMessage=false, 4000);
  }

  function clear() {
    $toastMessage = false;
    clearTimeout(timer);
  }
  
</script>
{#if $toastMessage}
<div transition:fly="{{x: 300, duration: 400}}" class="toast-container">
  <div class="toast" on:click={clear}>
    {$toastMessage}
  </div>
</div>
{/if}

<style>
  .toast-container {
    position: fixed;
    top: 3.5rem;
    right: 1rem;
    z-index: 1005;
  }

  .toast {
    background-color: white;
    border: 3px solid #3c98f6;
    border-radius: 10px;
    padding: 0.5rem;
    max-width: 400px;
  }

  @media (max-width: 576px) {
    .toast-container {
      top: unset;
      right: unset;
      bottom: 1rem;
      display: flex;
      width: 100%;
      justify-content: center;
    }
    .toast {
      max-width: 90vw;
    }
  }
</style>