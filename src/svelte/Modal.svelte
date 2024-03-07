<script>
  import { fade, fly} from 'svelte/transition';
  import {createEventDispatcher} from 'svelte';

  export let visible = false;
  export let title = 'Modal';

  const dispatch = createEventDispatcher();

  function closeModal() {
    visible = false;
    dispatch('close');
  }


</script>

{#if visible}
<div transition:fade|global class:fading={!visible} class="cover" on:click|self|preventDefault={closeModal}>
  <div transition:fly|global="{{ y: -300, duration: 600 }}" class="modal">
    <header>
      <h2>{title}</h2>
      <button class="close-modal" on:click={closeModal}>X</button>
    </header>
    <slot></slot>
  </div>
</div>
{/if}

<style>
    .cover {
    position: fixed;
    display: flex;
    justify-content: center;
    align-items: center;
    top: 0;
    left: 0;
    height: 100vh;
    width: 100vw;
    z-index: 1002;
    background-color: #0009;
  }

  .modal {
    max-width: 60vw;
    max-height: 80vh;
    overflow-y: auto;
    background-color: white;
    z-index: 1003;
    padding: 1rem;
    border-radius: 1rem;
  }

  .modal header {
    display: flex;
    justify-content: space-between;
  }

  .modal header h2 {
    margin-top: 0;
  }

  .fading {
    pointer-events: none;
  }

  .close-modal {
    width: 2em;
    height: 2em;
    margin-left: 0.5rem;
  }

  @media (max-width: 576px) {
    .modal {
      max-width: 95vw;
    }
  }

  @media (max-width: 768px) {
    .modal {
      max-width: 80vw;
    }
  }
</style>