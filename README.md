# Tumble Together

Tumble Together is a web-based emulator for the [Turing Tumble](https://www.turingtumble.com/) marble-powered mechanical computer to help build, test and share designs. Tumble Together allows users to quickly share challenges and solutions, and is a useful companion for using the Turing Tumble to teach kids about computer science. It can be used to share challenges and solutions as a URL, and to collaborate on shared boards in real time.

I made Tumble Together to continue playing with this awesome marble powered mechanical computer remotely with my nephew during the Covid-19 pandemic.

## Features

- Simulation of the Turing Tumble, with animated marbles and parts.
- Collaborate live on a shared board, solving problems together.
- Sharable URLs for solutions or challenges of your own design.
- Works on touch screen devices and is fully responsive at various screen sizes. Simply click/touch and drag parts in to place.
- First 30 puzzles from the puzzle book ready to load and solve.

## Technologies Used

- Node
- Express
- Socket.io
- Svelte.js

## Deployment

With Node.js installed clone or download the repository, navigate to the base folder and run the following commands:

```
$ npm install
$ npm run build
```

To start the Express server with the ability to work together live on the same board run:

```
$ npm run start
```

Or, to just run the client side app locally run:

```
$ npm run local
```
