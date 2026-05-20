import { Server } from 'socket.io';

let io;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // Join a specific room
    socket.on('join-room', (roomId) => {
      socket.join(roomId);
      console.log(`User ${socket.id} joined room ${roomId}`);
    });

    // Handle file upload progress reporting
    socket.on('upload-progress', (data) => {
      // Broadcast to everyone in the room (or just standard emit)
      if (data.roomId) {
        socket.to(data.roomId).emit('upload-progress', data);
      } else {
        socket.broadcast.emit('upload-progress', data);
      }
    });

    // File uploaded successfully event
    socket.on('file-uploaded', (data) => {
      if (data.roomId) {
        socket.to(data.roomId).emit('file-uploaded', data);
      } else {
        socket.broadcast.emit('file-uploaded', data);
      }
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIo = () => {
  if (!io) {
    throw new Error('Socket.io is not initialized');
  }
  return io;
};
