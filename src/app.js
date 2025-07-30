import express from 'express';
import mongoose from 'mongoose';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

import userRoutes from '../routes/userRoutes.js';
import messageRoutes from '../routes/messageRoutes.js';
import groupRoutes from '../routes/groupRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// App setup
const app = express();
const server = http.createServer(app);

// CORS setup for frontend
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
});

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/groups', groupRoutes);

// Optional MongoDB Connection
const connectDB = async () => {
  try {
    if (process.env.MONGO_URI) {
      await mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log('✅ MongoDB connected');
    } else {
      console.warn('⚠️ No MONGO_URI provided. Skipping DB connection.');
    }
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
  }
};
connectDB();

// Online users map
const onlineUsers = new Map();

// Socket.IO logic
io.on('connection', (socket) => {
  console.log('🔌 Client connected:', socket.id);

  socket.on('join', (userId) => {
    socket.join(userId);
    onlineUsers.set(userId, socket.id);
    console.log(`👤 User ${userId} joined`);
  });

  socket.on('join_group', (groupId) => {
    socket.join(groupId);
    console.log(`👥 Joined group room: ${groupId}`);
  });

  socket.on('send_message', ({ senderId, receiverId, message }) => {
    io.to(receiverId).emit('receive_message', {
      senderId,
      message,
      timestamp: new Date(),
    });

    io.to(receiverId).emit('receive_notification', {
      type: 'message',
      from: senderId,
      content: message,
      timestamp: new Date(),
    });
  });

  socket.on('send_file', ({ senderId, receiverId, fileName }) => {
    if (!receiverId || !fileName) return;
    const fileUrl = `${process.env.SERVER_URL || 'http://localhost:5000'}/uploads/${fileName}`;
    io.to(receiverId).emit('receive_file', {
      senderId,
      fileUrl,
      timestamp: new Date(),
    });

    io.to(receiverId).emit('receive_notification', {
      type: 'file',
      from: senderId,
      content: fileUrl,
      timestamp: new Date(),
    });
  });

  socket.on('send_group_message', ({ groupId, senderId, message }) => {
    if (!groupId || !message) return;
    io.to(groupId).emit('receive_group_message', {
      groupId,
      senderId,
      message,
      timestamp: new Date(),
    });

    socket.to(groupId).emit('receive_notification', {
      type: 'group_message',
      from: senderId,
      groupId,
      content: message,
      timestamp: new Date(),
    });
  });

  socket.on('send_notification', ({ toUserId, notification }) => {
    const socketId = onlineUsers.get(toUserId);
    if (socketId) {
      io.to(socketId).emit('receive_notification', notification);
    }
  });

  socket.on('disconnect', () => {
    console.log('🔌 Disconnected:', socket.id);
    for (const [userId, sockId] of onlineUsers.entries()) {
      if (sockId === socket.id) {
        onlineUsers.delete(userId);
        break;
      }
    }
  });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
