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
import answerRoutes from './answerRoutes.js';
import practiceRoutes from './practiceRoutes.js';
import questionRoutes from './questionRoutes.js';
import socketsHandlers from './sockets.js';
import userRoutes from './userRoutes.js';
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

app.post('/singleplayer', async (req, res) => {
  try {
    const { user_id, question_id, isCorrect, timeSpent } = req.body;

    if (
      !user_id ||
      !question_id ||
      isCorrect === undefined ||
      timeSpent === undefined
    ) {
      return res.status(400).json({ error: 'Missing required fields!' });
    }

    // Fetch current user XP & level
    const { data: userData, error: userError } = await supabase
      .from('Users')
      .select('xp, currentLevel')
      .eq('id', user_id)
      .single();

    if (userError || !userData) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { xp: currentXP, currentLevel } = userData;

    // Fetch next level's minXP
    const { data: levelData, error: levelError } = await supabase
      .from('Levels')
      .select('minXP')
      .eq('level', currentLevel + 1)
      .single();

    if (levelError || !levelData) {
      return res.status(404).json({ error: 'Next level not found' });
    }

    const nextLevelXP = levelData.minXP;

    // Fetch question xpGain
    const { data: questionData, error: qError } = await supabase
      .from('Questions')
      .select('xpGain')
      .eq('Q_id', question_id)
      .single();

    if (qError || !questionData) {
      return res.status(404).json({ error: 'Question not found' });
    }

    const CA = isCorrect ? 1 : 0;

    // Calculate XP earned
    const xpEarned = await calculateSinglePlayerXP({
      CA,
      XPGain: questionData.xpGain,
      actualTimeSeconds: timeSpent,
      currentLevel,
      currentXP,
      nextLevelXP,
    });

    const newXP = currentXP + xpEarned;

    // Determine level up
    let newLevel = currentLevel;
    let leveledUp = false;
    if (newXP >= nextLevelXP) {
      newLevel = currentLevel + 1;
      leveledUp = true;
    }

    // Insert into QuestionAttempts
    const { error: insertError } = await supabase
      .from('QuestionAttempts')
      .insert([
        {
          question_id,
          user_id,
          isCorrect,
          timeSpent,
          ratingBefore: currentXP,
          ratingAfter: newXP,
          ratingChange: xpEarned,
          attemptDate: new Date(),
          attemptType: 'single',
        },
      ]);

    if (insertError) {
      return res.status(500).json({
        error: 'Error saving attempt',
        details: insertError.message,
      });
    }

    // Update user record
    const { error: updateError } = await supabase
      .from('Users')
      .update({ xp: newXP, currentLevel: newLevel })
      .eq('id', user_id);

    if (updateError) {
      return res.status(500).json({
        error: 'Error updating user XP/level',
        details: updateError.message,
      });
    }

    // Return xp earned + leveled up
    return res.status(200).json({
      xpEarned: xpEarned,
      leveledUp,
      totalXP: newXP,
    });
  } catch (err) {
    console.error('Error in /singleplayer:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/multiplayer', async (req, res) => {
  try {
    const { player1_id, player2_id, question_id, score1, xpTotal } = req.body;

    if (
      !player1_id ||
      !player2_id ||
      !question_id ||
      (score1 !== 0 && score1 !== 0.5 && score1 !== 1) ||
      typeof xpTotal !== 'number' ||
      xpTotal <= 0
    ) {
      return res.status(400).json({ error: 'Missing or invalid fields' });
    }

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
    const [xp1_raw, xp2_raw] = distributeXP(
      xpTotal,
      expected1,
      expected2,
      score1,
    );

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
    const newLevel1 = levelsData
      .filter((l) => updatedXP1 >= l.minXP)
      .pop().level;

    const newLevel2 = levelsData
      .filter((l) => updatedXP2 >= l.minXP)
      .pop().level;

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
  } catch (err) {
    console.error('Error in /multiplayer:', err);
    res.status(500).json({ error: 'Server error' });
  }
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
