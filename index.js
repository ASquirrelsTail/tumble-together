const express = require('express');
const app = express();
const port = process.env.PORT || 8080;
const http = require('http').createServer(app);

const io = require('socket.io')(http);

app.use(express.static('public', {
  setHeaders: (res, path) => {
    if (path.endsWith('.html') || path.endsWith('.js')) {
      res.setHeader('Cache-Control', 'no-cache');
    }
  }
}));

app.get('/room/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

app.get('/about/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

let board = 'KKKKKKKKKKK';



io.on('connection', (socket) => {
  socket.emit('board', board);
  socket.on('board', (updatedBoard) => {
    board = updatedBoard;
    socket.broadcast.emit('board', board);
  });
  socket.on('run', (side) => {
    socket.broadcast.emit('run', side);
  });
  socket.on('challenge', (id) => {
    socket.broadcast.emit('challenge', id);
  });
});

http.listen(port, () => console.log(`Tumble Together listening at http://localhost:${port}`));
