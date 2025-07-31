// server.js
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import { calculateExpected, distributeXP } from './multiPlayer.js';
import { calculateSinglePlayerXP } from './singlePlayer.js';

import { supabase } from '../database/supabaseClient.js';

import { createServer } from 'http';
import { Server } from 'socket.io';

//Change this import to ES6
import socketsHandlers from './sockets.js';
import userRoutes from './userRoutes.js';
import practiceRoutes from './practiceRoutes.js';
import questionRoutes from './questionRoutes.js';
import answerRoutes from './answerRoutes.js';
import validateRoutes from './validateRoutes.js';

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

// Simple health check route
app.get('/', (req, res) => {
  res.send('API is running successfully!');
});

// Fetch players' current XP + level
const { data: playersData, error: playersError } = await supabase
  .from('Users')
  .select('id, xp, currentLevel')
  .in('id', [player1_id, player2_id]);

if (playersError || playersData.length !== 2) {
  return res.status(404).json({ error: 'One or both users not found' });
}

const player1 = playersData.find((p) => p.id === player1_id);
const player2 = playersData.find((p) => p.id === player2_id);

// Expected outcomes
const [expected1, expected2] = calculateExpected(player1.xp, player2.xp);
const [xp1_raw, xp2_raw] = distributeXP(xpTotal, expected1, expected2, score1);

// Clamp XP
const updatedXP1 = Math.max(0, player1.xp + xp1_raw);
const updatedXP2 = Math.max(0, player2.xp + xp2_raw);

// Fetch level thresholds
const { data: levelsData, error: levelsError } = await supabase
  .from('Levels')
  .select('level, minXP')
  .order('minXP', { ascending: true });

if (levelsError || !levelsData.length) {
  return res.status(500).json({ error: 'Levels data not found' });
}

// Determine new levels
const newLevel1 = levelsData.filter((l) => updatedXP1 >= l.minXP).pop().level;

const newLevel2 = levelsData.filter((l) => updatedXP2 >= l.minXP).pop().level;

const leveledUp1 = newLevel1 > player1.currentLevel;
const leveledUp2 = newLevel2 > player2.currentLevel;

// Update users
const { error: updateError1 } = await supabase
  .from('Users')
  .update({ xp: updatedXP1, currentLevel: newLevel1 })
  .eq('id', player1_id);

const { error: updateError2 } = await supabase
  .from('Users')
  .update({ xp: updatedXP2, currentLevel: newLevel2 })
  .eq('id', player2_id);

if (updateError1 || updateError2) {
  return res.status(500).json({ error: 'Error updating users XP/level' });
}

// Insert attempt records
const attemptDate = new Date().toISOString();

const inserts = [
  {
    question_id,
    user_id: player1_id,
    isCorrect: score1 === 1,
    timeSpent: null,
    ratingBefore: player1.xp,
    ratingAfter: updatedXP1,
    ratingChange: xp1_raw,
    attemptDate,
    attemptType: 'multi',
  },
  {
    question_id,
    user_id: player2_id,
    isCorrect: score1 === 0,
    timeSpent: null,
    ratingBefore: player2.xp,
    ratingAfter: updatedXP2,
    ratingChange: xp2_raw,
    attemptDate,
    attemptType: 'multi',
  },
];

const { error: insertError } = await supabase
  .from('QuestionAttempts')
  .insert(inserts);

if (insertError) {
  return res.status(500).json({ error: 'Error saving attempts' });
}

return res.status(200).json({
  message: 'Multiplayer match processed successfully',
  players: [
    {
      id: player1_id,
      xpEarned: parseFloat(xp1_raw.toFixed(2)),
      newXP: updatedXP1,
      currentLevel: newLevel1,
      leveledUp: leveledUp1,
    },
    {
      id: player2_id,
      xpEarned: parseFloat(xp2_raw.toFixed(2)),
      newXP: updatedXP2,
      currentLevel: newLevel2,
      leveledUp: leveledUp2,
    },
  ],
});

// Start server
// app.listen(PORT, () => {
//   console.log(`Server is running on http://localhost:${PORT}`);
// });

// Only start the server if not testing - changed you may consult Monica

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
