const express = require('express');
const app = express();
const port = process.env.PORT || 8080;
const http = require('http').createServer(app);
const uuid = require('uuid');
const io = require('socket.io')(http);

const maxRooms = process.env.MAX_ROOMS || 1;

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

let board = 'KKKKKKKKKKK';

class Room {
  static s = [];
  static start(board) {
    if (Room.s.length < maxRooms) {
      const newRoom = new Room(board);
      this.s.push(newRoom);
      return newRoom;
    } else return false;
  }
  constructor(board='KKKKKKKKKKK') {
    this.uuid = uuid.v4();
    this.board = board;
    this.members = 0;
  }
  leave() {
    this.members--;
    console.log('User left room ' + this.uuid);
    if (this.members < 1) this.close();
  }
  close() {
    Room.s.splice(Room.s.indexOf(this), 1);
  }
  join(socket) {
    this.members++;

    socket.join(this.uuid);
    socket.emit('joined', {uuid: this.uuid, board: this.board});
    console.log('User connected to room ' + this.uuid);

    socket.on('board', (updatedBoard) => {
      this.board = updatedBoard;
      socket.to(this.uuid)
            .broadcast
            .emit('board', this.board);
    });

    socket.on('run', (side) => {
      socket.to(this.uuid)
            .broadcast
            .emit('run', side);
    });

    socket.on('challenge', (id) => {
      socket.to(this.uuid)
            .broadcast
            .emit('challenge', id);
    });

    socket.on('disconnect', () => this.leave());
  }
}

io.on('connection', (socket) => {
  const roomUuid = socket.handshake.query.uuid;
  const board = socket.handshake.query.board;
  let room;
  if (typeof roomUuid === 'undefined') room = Room.start(board);
  else room = Room.s.find(room => room.uuid === roomUuid);
  if (room) room.join(socket);
  else socket.emit('failed', room === false ?
                             'Server at capacity, please try again later or join an existing room.' :
                             'Failed to find room, please check URL and try again.');
});

http.listen(port, () => console.log(`Tumble Together listening at http://localhost:${port}`));
