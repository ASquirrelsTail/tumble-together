const express = require('express');
const app = express();
const port = process.env.PORT || 8080;
const http = require('http').createServer(app);

const io = require('socket.io')(http);

app.use(express.static('public', {
  etag: false,
  lastModified: false,
  setHeaders: (res) => {
    res.setHeader('Cache-Control', 'public, max-age=604800, immutable');
  },
}));

app.get('/room/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

let board = 'KB2E2BE2EB2HE2EB2HE2EB2HE2EKK_II2B6A7B4A8A';



io.on('connection', (socket) => {
  socket.emit('board', board);
  socket.on('board', (updatedBoard) => {
    board = updatedBoard;
    socket.broadcast.emit('board', board);
  });
  socket.on('run', (side) => {
    socket.broadcast.emit('run', side);
  });
});

http.listen(port, () => console.log(`Tumble Together listening at http://localhost:${port}`));
