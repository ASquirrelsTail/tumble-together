<script>
  import Modal from './Modal.svelte';
  import { basePath } from '../store';

  export let visible = false;

  const path = 'about';

  let oldPath = window.location.pathname;
  let oldQuery = window.location.search;
  let oldTitle = document.title;

  $: if (visible) openModal();

  if (window.location.pathname.endsWith(path) || window.location.pathname.endsWith(path + '/')) visible = true;

  function openModal() {
    // Open modal and set current location to About.
    oldPath = window.location.pathname;
    oldQuery = window.location.search;
    oldTitle = document.title;

    if (oldPath.endsWith(path) || oldPath.endsWith(path + '/')) oldPath = $basePath;

    let pathname = $basePath + path + '/';

    document.title = 'Tumble Together - About';
    history.pushState(null, document.title, pathname);
    basePath.update();
  }

  function closeModal() {
    document.title = oldTitle;
    history.pushState(null, oldTitle, oldPath + oldQuery);
    basePath.update()
  }
</script>

<Modal title='About Tumble Together' bind:visible on:close={closeModal}>
    <article>
      <p>Tumble Together is a web-based emulator for the <a href="https://www.turingtumble.com/" target="_blank">Turing Tumble</a> marble-powered mechanical computer to help build, test and share designs. Tumble Together allows users to quickly share challenges and solutions, and is a useful companion for using the Turing Tumble to teach kids about computer science.</p>
      <p>The full source code, including instructions on how to run it can be found <a href="https://github.com/ASquirrelsTail/tumble-together" target="_blank">here on GitHub</a>. The client side app built with <a href="https://svelte.dev/" target="_blank">Svelte.js</a> can be run independently to create and share designs. An optional server side implementation allows a group of users to collaborate in real time on a shared Turing Tumble board remotely, using <a href="https://expressjs.com/" target="_blank">Express.js</a> and <a href="https://socket.io/" target="_blank">Socket.IO</a> on a Node.js server.</p>
      <p>Tumble Together was built by Richard Twilton, in order to help his nephew learn with his Turing Tumble remotely during the Covid-19 Pandemic.</p>
    </article>
</Modal>

<style>
  p {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif;
  }
</style>
