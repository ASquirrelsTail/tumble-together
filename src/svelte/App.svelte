<script>
	import PlayArea from './PlayArea.svelte';
  import Menu from './Menu.svelte';
  import AboutModal from './AboutModal.svelte';
  import InstructionModal from './InstructionModal.svelte';
  import { socket } from '../socket.js';

  let aboutModal = false;
  let instructionModal = false;

</script>


<nav>
  <h1>Tumble Together! {#if $socket} <span>- Sharing</span>{/if}</h1>
  <div>
    <button id="instructions-button" on:click="{() => instructionModal = true}">
      <span class="title">Instructions </span>
      <span class="question">?</span>
    </button>
    <Menu on:aboutModal="{() => aboutModal = true}"
      on:instructionModal="{() => instructionModal = true}"/>
  </div>
</nav>
<PlayArea />

<AboutModal bind:visible={aboutModal} />
<InstructionModal bind:visible={instructionModal} on:aboutModal="{() => aboutModal = true}"/>

<style>
  nav {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    align-content: center;
    background-color: #eee;
    padding: 0.2rem 0;
    margin-bottom: 0.5rem;
    border-bottom: solid #3c98f6 5px;
  }
  h1 {
    margin: 0 0.5rem;
  }

  @media (max-width: 576px) {
    h1 {
      font-size: 1.2rem;
    }
  }

  h1 span {
    font-size: 0.6em;
    font-style: italic;
    vertical-align: middle;
  }

  #instructions-button {
    margin-bottom: 0;
    margin-right: 1rem;
  }

  #instructions-button .question {
    display: inline-block;
    width: 1em;
    height: 1em;
    text-align: center;
  }
  @media (max-width: 576px) {
    h1 span {
      display: block;
      margin-top: -0.5rem;
      text-align: right;
      margin-right: -1rem;
    }
    #instructions-button {
      margin-bottom: 0;
      margin-right: 0.2rem;
    }
    #instructions-button .title {
      display: none;
    }
  }
</style>
