const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

const app = express();
app.use(cors());
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
  },
});

const rooms = {};

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('join-room', ({ username, roomId }) => {
    socket.join(roomId);
    socket.username = username;
    socket.roomId = roomId;

    if (!rooms[roomId]) rooms[roomId] = [];
    rooms[roomId].push({ id: socket.id, username });

    const userList = rooms[roomId].map((u) => u.username);
    io.to(roomId).emit('online-users', userList);
  });

  socket.on('send-message', (data) => {
    io.to(data.roomId).emit('receive-message', data);
  });

  socket.on('typing', ({ username, roomId }) => {
    socket.to(roomId).emit('typing', { username });
  });

  socket.on('edit-message', ({ index, roomId, newText }) => {
    io.to(roomId).emit('message-edited', { index, newText });
  });

  socket.on('delete-message', ({ index, roomId }) => {
    io.to(roomId).emit('message-deleted', { index });
  });

  socket.on('disconnecting', () => {
    const { roomId } = socket;
    if (rooms[roomId]) {
      rooms[roomId] = rooms[roomId].filter((u) => u.id !== socket.id);
      io.to(roomId).emit('online-users', rooms[roomId].map((u) => u.username));
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

server.listen(5000, () => {
  console.log('Server listening on port 5000');
});
