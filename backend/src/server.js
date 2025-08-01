// server.js
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import { supabase } from '../database/supabaseClient.js';

import { createServer } from 'http';
import { Server } from 'socket.io';

//Change this import to ES6
import answerRoutes from './answerRoutes.js';
import practiceRoutes from './practiceRoutes.js';
import questionRoutes from './questionRoutes.js';
import socketsHandlers from './sockets.js';
import userRoutes from './userRoutes.js';
import validateRoutes from './validateRoutes.js';
import singlePlayerRoutes from './singlePlayerRoutes.js';
import multiPlayerRoutes from './multiPlayerRoute.js';
import { single } from 'rxjs';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const server = createServer(app);

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/', userRoutes);
app.use('/', practiceRoutes);
app.use('/', questionRoutes);
app.use('/', answerRoutes);
app.use('/', validateRoutes);
app.use('/', singlePlayerRoutes);
app.use('/', multiPlayerRoutes);

// Simple health check route
app.get('/', (req, res) => {
  res.send('API is running successfully!');
});

if (process.env.NODE_ENV !== 'test') {
  server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}

//Socket IO setup
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);
  // add handlers for sockets.js here
  socketsHandlers(io, socket);
});

// for Jest + Supertest
export default app;
