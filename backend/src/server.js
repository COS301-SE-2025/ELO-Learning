// server.js
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';

import { createServer } from 'http';
import { Server } from 'socket.io';

import achievementRoutes from './achievementRoutes.js';
import answerRoutes from './answerRoutes.js';
import baselineRoutes from './baselineRoutes.js';
import multiPlayerRoutes from './multiPlayerRoute.js';
import oauthRoutes from './oauthRoutes.js';
import practiceRoutes from './practiceRoutes.js';
import questionRoutes from './questionRoutes.js';
import singlePlayerRoutes from './singlePlayerRoutes.js';
import socketsHandlers from './sockets.js';
import userRoutes from './userRoutes.js';
import validateRoutes from './validateRoutes.js';
import analysisRoutes from './analysisRoutes.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Use the frontend URL from env or fallback to localhost:8080 for dev
const FRONTEND_URL =
  process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:8080';

const server = createServer(app);

// Middleware
app.use(
  cors({
    origin: process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:8080',
    credentials: true,
  }),
);
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

// Routes
app.use('/', userRoutes);
app.use('/', practiceRoutes);
app.use('/', questionRoutes);
app.use('/', answerRoutes);
app.use('/', validateRoutes);
app.use('/', singlePlayerRoutes);
app.use('/', multiPlayerRoutes);
app.use('/', achievementRoutes);
app.use('/', oauthRoutes);
app.use('/', baselineRoutes);
app.use('/', analysisRoutes);

// Simple health check route
app.get('/', (req, res) => {
  res.send('API is running successfully!');
});

if (process.env.NODE_ENV !== 'test') {
  server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: FRONTEND_URL,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);
  socketsHandlers(io, socket);
});

// for Jest + Supertest
export default app;
