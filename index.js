const express = require('express');
const app = express();
const port = process.env.PORT || 8080;
const http = require('http').createServer(app);

const io = require('socket.io')(http);

app.use(express.static('public'));

app.get('/room/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

let board = 'aa-1-0---0-0-1-1-1-0----1-1-0-1-1-3-1-0---0-0aaaa'; // HI!

io.on('connection', (socket) => {
  socket.emit('board', board);
  socket.on('board', (updatedBoard) => {
    board = updatedBoard;
    socket.broadcast.emit('board', board);
  });
});

http.listen(port, () => console.log(`Tumble Together listening at http://localhost:${port}`));
