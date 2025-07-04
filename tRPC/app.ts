
import gameRoutes from './routes/game';
import mathRoutes from './routes/math';
import questionRoutes from './routes/question';
import topicRoutes from './routes/topic';

// Routes
app.use('/game', gameRoutes);
app.use('/math', mathRoutes);
app.use('/questions', questionRoutes);
app.use('/topics', topicRoutes);

app.get('/', (_req, res) => {
  res.send('API is running!');
});

export default app;
// src/server.ts
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';

// Routes
import gameRoutes from './routes/game';
import mathRoutes from './routes/math';
import questionRoutes from './routes/question';
import topicRoutes from './routes/topic';

// Routes
app.use('/game', gameRoutes);
app.use('/math', mathRoutes);
app.use('/questions', questionRoutes);
app.use('/topics', topicRoutes); imports will go here: questionRoutes, mathRoutes, topicRoutes)

// Socket handler
import socketsHandlers from './sockets';

// Env config
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Create HTTP server
const server = http.createServer(app);

// Middlewares
app.use(cors());
app.use(express.json());

// Simple health check
app.get('/', (_req, res) => {
  res.send('API is running successfully!');
});

// Start the server unless running in test mode
if (process.env.NODE_ENV !== 'test') {
  server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}

// Setup Socket.IO
const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);
  socketsHandlers(io, socket);
});

export default app;
