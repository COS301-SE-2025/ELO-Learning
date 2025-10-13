// server.js

// Suppress specific deprecation warnings
process.removeAllListeners('warning');
process.on('warning', (warning) => {
  // Suppress the url.parse() deprecation warning (DEP0169)
  if (warning.code === 'DEP0169') {
    return; // Ignore this specific warning
  }
  // Log other warnings
  console.warn(warning.name, warning.message);
});

import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';

import { createServer } from 'http';
import { Server } from 'socket.io';
import classroomWars from './classroomWars.js';
import achievementRoutes from './achievementRoutes.js';
import openaiRoutes from './openaiRoutes.js';
import answerRoutes from './answerRoutes.js';
import avatarUnlockablesRoutes from './avatarUnlockablesRoutes.js';
import baselineRoutes from './baselineRoutes.js';
import multiPlayerRoutes from './multiPlayerRoute.js';
import oauthRoutes from './oauthRoutes.js';
import practiceRoutes from './practiceRoutes.js';
import pushNotificationRoutes from './pushNotificationRoutes.js';
import questionRoutes from './questionRoutes.js';
import singlePlayerRoutes from './singlePlayerRoutes.js';
import socketsHandlers from './sockets.js';
import userRoutes from './userRoutes.js';
import validateRoutes from './validateRoutes.js';
import analysisRoutes from './analysisRoutes.js';

import rateLimit from 'express-rate-limit'; //to prevent brute-force and DDoS attacks
// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // limit each IP to 100 requests per windowMs
  skip: (req) => req.path.startsWith('/users/') && req.path.endsWith('/streak'),
});

// Use the frontend URL from env or fallback to localhost:8080 for dev
const FRONTEND_URL =
  process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:8080';

const server = createServer(app);

// Middleware
app.use(
  cors({
    origin: process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:8080',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
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

// Apply rate limiting to all requests
app.use(limiter);

// Routes
app.use('/', userRoutes);
app.use('/', practiceRoutes);
app.use('/', questionRoutes);
app.use('/', answerRoutes);
app.use('/', validateRoutes);
app.use('/', singlePlayerRoutes);
app.use('/', multiPlayerRoutes);
app.use('/', achievementRoutes);
app.use('/', openaiRoutes);
app.use('/api/avatar-unlockables', avatarUnlockablesRoutes);
app.use('/', oauthRoutes);
app.use('/', baselineRoutes);
app.use('/', analysisRoutes);
app.use('/notifications', pushNotificationRoutes);
app.use('/', classroomWars);
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

// Attach io and supabase to app for use in classroomWars.js
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY,
);
app.set('io', io);
app.set('supabase', supabase);

io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);
  socketsHandlers(io, socket);
});

// for Jest + Supertest
export default app;
