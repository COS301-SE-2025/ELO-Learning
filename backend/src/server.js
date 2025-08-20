// server.js
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';

import { createServer } from 'http';
import { Server } from 'socket.io';

//Change this import to ES6
import achievementRoutes from './achievementRoutes.js';
import answerRoutes from './answerRoutes.js';
import multiPlayerRoutes from './multiPlayerRoute.js';
import oauthRoutes from './oauthRoutes.js';
import practiceRoutes from './practiceRoutes.js';
import questionRoutes from './questionRoutes.js';
import singlePlayerRoutes from './singlePlayerRoutes.js';
import socketsHandlers from './sockets.js';
import userRoutes from './userRoutes.js';
import validateRoutes from './validateRoutes.js';
import baselineRoutes from './baselineRoutes.js';

const allowedOrigins = [
  'http://localhost:8080', // Frontend
  'http://localhost:3000', // Backend
];

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const server = createServer(app);

// Middleware
//app.use(cors());
app.use(
  cors({
    origin: allowedOrigins,
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

// Simple health check route
app.get('/', (req, res) => {
  res.send('API is running successfully!');
});

if (process.env.NODE_ENV !== 'test') {
  server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}

// Socket.IO CORS config
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);
  // add handlers for sockets.js here
  socketsHandlers(io, socket);
});

// for Jest + Supertest
export default app;
