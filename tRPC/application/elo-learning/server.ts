// server.ts
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';

// Import routes
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import questionRoutes from './routes/questions';
import topicRoutes from './routes/topics';
import gameRoutes from './routes/games';
import mathValidationRoutes from './routes/mathValidation';

// Import socket handlers
// import socketsHandlers from './sockets';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const server = createServer(app);

// Middleware
app.use(cors());
app.use(express.json());

// Simple health check route
app.get('/', (req, res) => {
  res.send('API is running successfully!');
});

// Routes
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/user', userRoutes); // For backward compatibility
app.use('/questions', questionRoutes);
app.use('/topics', topicRoutes);
app.use('/game', gameRoutes);
app.use('/math', mathValidationRoutes);

// Backward compatibility routes
app.use('/singleplayer', gameRoutes);
app.use('/multiplayer', gameRoutes);
app.use('/validate-answer', mathValidationRoutes);
app.use('/quick-validate', mathValidationRoutes);
app.use('/validate-expression', mathValidationRoutes);

// Only start the server if not testing
if (process.env.NODE_ENV !== 'test') {
  server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);
  // Add handlers for sockets.js here
  // socketsHandlers(io, socket);
});

// For Jest + Supertest
export default app;
