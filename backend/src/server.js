// server.js
import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'

import { createServer } from 'http'
import { Server } from 'socket.io'

//Change this import to ES6
import achievementRoutes from './achievementRoutes.js'
import answerRoutes from './answerRoutes.js'
import multiPlayerRoutes from './multiPlayerRoute.js'
import oauthRoutes from './oauthRoutes.js'
import practiceRoutes from './practiceRoutes.js'
import questionRoutes from './questionRoutes.js'
import singlePlayerRoutes from './singlePlayerRoutes.js'
import socketsHandlers from './sockets.js'
import userRoutes from './userRoutes.js'
import validateRoutes from './validateRoutes.js'

// Load environment variables
dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

const server = createServer(app)

// Middleware
app.use(cors())
app.use(express.json())

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Server is running',
    timestamp: new Date().toISOString()
  })
})

// Routes
app.use('/', userRoutes)
app.use('/', practiceRoutes)
app.use('/', questionRoutes)
app.use('/', answerRoutes)
app.use('/', validateRoutes)
app.use('/', singlePlayerRoutes)
app.use('/', multiPlayerRoutes)
app.use('/', achievementRoutes);
app.use('/', oauthRoutes)

// Simple health check route
app.get('/', (req, res) => {
  res.send('API is running successfully!')
})

// Return all questions: (works)
app.get('/questions', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('Questions')
      .select('Q_id, topic, difficulty, level, questionText, xpGain');

    if (error) {
      console.error('Error fetching questions:', error.message);
      return res.status(500).json({ error: 'Failed to fetch questions' });
    }

    res.status(200).json({ questions: data });
  } catch (err) {
    console.error('Unexpected error:', err);
    res.status(500).json({ error: 'Unexpected server error' });
  }
});

//return 10 questions for practice
//also get all the answers for those questions
app.get('/practice', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('Questions')
      .select('*')
      .limit(10);

    for (const question of data) {
      const { data, error } = await supabase
        .from('Answers')
        .select('*')
        .eq('question_id', question.Q_id);
      if (error) {
        console.error(
          'Error fetching practice questions:',
          error.message,
          question,
        );
        return res
          .status(500)
          .json({ error: 'Failed to fetch practice questions' });
      }
      question.answers = data;
    }

    if (error) {
      console.error('Error fetching practice questions:', error.message);
      return res
        .status(500)
        .json({ error: 'Failed to fetch practice questions' });
    }

    res.status(200).json({ questions: data });
  } catch (err) {
    console.error('Unexpected error:', err);
    res.status(500).json({ error: 'Unexpected server error' });
  }
});

// Return specific question by ID (ADD THIS NEW ROUTE)
app.get('/questionsById/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const { data, error } = await supabase
      .from('Questions')
      .select('*')
      .eq('Q_id', id)
      .single();

    if (error) {
      console.error('Error fetching question:', error.message);
      return res.status(500).json({ error: 'Failed to fetch question' });
    }

    if (!data) {
      return res.status(404).json({ error: 'Question not found' });
    }

    res.status(200).json({ question: data });
  } catch (err) {
    console.error('Unexpected error:', err);
    res.status(500).json({ error: 'Unexpected server error' });
  }
});

// Return all questions for given level: (works)
app.get('/question/:level', async (req, res) => {
  const { level } = req.params;

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res
      .status(401)
      .json({ error: 'You are unauthorized to make this request.' });
  }

  // Validate that level is a valid number
  const levelNum = parseInt(level, 10);
  if (isNaN(levelNum) || levelNum < 1) {
    return res.status(400).json({
      error: 'Invalid level parameter. Level must be a positive number.',
    });
  }

  const { data, error } = await supabase
    .from('Questions')
    .select('Q_id, topic, difficulty, level, questionText, xpGain')
    .eq('level', levelNum);

  if (error) {
    console.error('Error fetching questions:', error.message);
    return res.status(500).json({ error: 'Failed to fetch questions' });
  }

  if (!data || data.length === 0) {
    return res.status(404).json({ error: 'Level doesn’t exist' });
  }

  res.status(200).json({ questions: data });
});

// Return the answer to a specific question (works)
app.get('/question/:id/answer', async (req, res) => {
  const { id } = req.params;

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res
      .status(401)
      .json({ error: 'You are unauthorized to make this request.' });
  }

  const { data, error } = await supabase
    .from('Answers')
    .select('*') // Ask group what we want to display, just answer or all details?
    .eq('question_id', id)
    .eq('isCorrect', true);

  if (error) {
    console.error('Error fetching answer:', error.message);
    return res.status(500).json({ error: 'Failed to fetch answer' });
  }

  if (!data || data.length === 0) {
    return res.status(404).json({ error: "Question doesn't exist" });
  }

  res.status(200).json({ answer: data });
});

//Return all answers to a specific question
app.get('/answers/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const { data, error } = await supabase
      .from('Answers')
      .select('*')
      .eq('question_id', id);

    if (error) {
      console.error('Error fetching answers:', error.message);
      return res.status(500).json({ error: 'Failed to fetch answers' });
    }

    res.status(200).json({ answer: data });
  } catch (err) {
    console.error('Unexpected error:', err);
    res.status(500).json({ error: 'Unexpected server error' });
  }
});

// Return all questions for a specific topic: (works)
app.get('/questions/topic', async (req, res) => {
  const { topic } = req.query;

  if (topic === undefined) {
    return res.status(400).json({ error: 'Missing topic parameter' });
  }

  const { data, error } = await supabase
    .from('Questions')
    .select('Q_id, topic, difficulty, level, questionText, xpGain, type')
    .eq('topic', topic);

  if (error) {
    console.error('Error fetching questions by topic:', error.message);
    return res.status(500).json({ error: 'Failed to fetch questions' });
  }

  res.status(200).json({ questions: data });
});

// Return questions filtered by level and topic: (works)
app.get('/questions/level/topic', async (req, res) => {
  const { level, topic } = req.query;

  if (!level || !topic) {
    return res.status(400).json({ error: 'Missing level or topic parameter' });
  }

  // Validate that level is a valid number
  const levelNum = parseInt(level, 10);
  if (isNaN(levelNum) || levelNum < 1) {
    return res.status(400).json({
      error: 'Invalid level parameter. Level must be a positive number.',
    });
  }

  const { data, error } = await supabase
    .from('Questions')
    .select('Q_id, topic, difficulty, level, questionText, xpGain, type')
    .eq('level', levelNum)
    .eq('topic_id', topic);
  if (data) {
    //fetch the answers for the above questions
    const questionIds = data.map((q) => q.Q_id);
    const { data: answers, error: aError } = await supabase
      .from('Answers')
      .select('*')
      .in('question_id', questionIds);
    if (aError) {
      console.log('Database error:', aError);
      return res
        .status(500)
        .json({ error: 'Failed to fetch practice answers' });
    }
    data.forEach((q) => {
      q.answers = answers.filter((a) => a.question_id === q.Q_id);
    });
    // for (const question of data) {
    //   const { data, error } = await supabase
    //     .from('Answers')
    //     .select('*')
    //     .eq('question_id', question.Q_id);
    //   if (error) {
    //     console.error(
    //       'Error fetching practice questions:',
    //       error.message,
    //       question,
    //     );
    //     return res
    //       .status(500)
    //       .json({ error: 'Failed to fetch practice questions' });
    //   }
    //   question.answers = data;
    // }
  }

  if (error) {
    console.error(
      'Error fetching questions by level and topic:',
      error.message,
    );
    return res.status(500).json({ error: 'Failed to fetch questions' });
  }

  res.status(200).json({ questions: data });
});

app.get('/topics', async (req, res) => {
  try {
    const { data, error } = await supabase.from('Topics').select('*');

    if (error) {
      console.error('Error fetching topics:', error.message);
      return res.status(500).json({ error: 'Failed to fetch topics' });
    }

    res.status(200).json({ topics: data });
  } catch (err) {
    console.error('Unexpected error:', err);
    res.status(500).json({ error: 'Unexpected server error' });
  }
});

app.post('/submit-answer', async (req, res) => {
  const { userId, questionId, selectedAnswerId } = req.body;

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res
      .status(401)
      .json({ error: 'You are unauthorized to make this request.' });
  }

  if (!userId || !questionId || !selectedAnswerId) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // 1. Check if the selected answer is correct
    const { data: answer, error: answerError } = await supabase
      .from('Answers')
      .select('isCorrect')
      .eq('answer_id', selectedAnswerId)
      .eq('question_id', questionId)
      .single();

    if (answerError || !answer) {
      return res
        .status(404)
        .json({ error: 'Answer not found or does not match question' });
    }

    const isCorrect = answer.isCorrect;

    if (!isCorrect) {
      return res
        .status(200)
        .json({ correct: false, message: 'Incorrect answer. No XP awarded.' });
    }

    // 2. Get XP for the question
    const { data: question, error: questionError } = await supabase
      .from('Questions')
      .select('xpGain')
      .eq('Q_id', questionId)
      .single();

    if (questionError) {
      console.error('Error fetching question XP:', questionError.message);
      return res.status(500).json({ error: 'Failed to fetch XP' });
    }

    const xpToAdd = question?.xpGain ?? 0;

    // 3. Get user XP and add to it
    const { data: user, error: userError } = await supabase
      .from('Users')
      .select('xp')
      .eq('id', userId)
      .single();

    if (userError) {
      console.error('Error fetching user:', userError.message);
      return res.status(500).json({ error: 'Failed to fetch user' });
    }

    const newXP = (user?.xp ?? 0) + xpToAdd;

    const { data: updatedUser, error: updateError } = await supabase
      .from('Users')
      .update({ xp: newXP })
      .eq('id', userId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating XP:', updateError.message);
      return res.status(500).json({ error: 'Failed to update XP' });
    }

    // NEW: Check for achievement unlocks (NON-ELO ONLY)
    let unlockedAchievements = [];

    try {
      // Check question-based achievements only
      const questionAchievements = await checkQuestionAchievements(
        userId,
        isCorrect,
      );
      unlockedAchievements.push(...questionAchievements);
    } catch (achievementError) {
      console.error('Error checking achievements:', achievementError);
      // Don't fail the whole request if achievements fail
    }

    return res.status(200).json({
      correct: true,
      message: `Correct answer! +${xpToAdd} XP awarded.`,
      newXP: updatedUser.xp,
      unlockedAchievements: unlockedAchievements, // 🎯 NEW: Include unlocked achievements
    });
  } catch (err) {
    console.error('Unexpected error:', err);
    return res.status(500).json({ error: 'Unexpected server error' });
  }
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

    // 🎯 NEW: Check for achievement unlocks (NON-ELO ONLY)
    let unlockedAchievements = [];

    try {
      // Import achievement checking functions dynamically
      const { checkQuestionAchievements } = await import('./achievementRoutes.js');
      
      // Check question-based achievements only
      const questionAchievements = await checkQuestionAchievements(
        user_id,
        isCorrect,
      );
      unlockedAchievements.push(...questionAchievements);
      
      // NOTE: Single player mode should NOT trigger match achievements
      // Match achievements are only for multiplayer games
    } catch (achievementError) {
      console.error('Error checking achievements:', achievementError);
      // Don't fail the whole request if achievements fail
    }

    // Return xp earned + leveled up + achievements
    return res.status(200).json({
      xpEarned: xpEarned,
      leveledUp,
      totalXP: newXP,
      unlockedAchievements: unlockedAchievements, // 🎯 NEW: Include unlocked achievements
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

    // 🎯 Check for match achievements (both players participated in a match)
    let unlockedAchievements = [];
    
    try {
      // Import achievement checking functions dynamically
      const { checkMatchAchievements } = await import('./achievementRoutes.js');
      
      // Check match achievements for both players
      const player1Achievements = await checkMatchAchievements(player1_id);
      const player2Achievements = await checkMatchAchievements(player2_id);
      
      unlockedAchievements = [
        ...player1Achievements.map(achievement => ({ ...achievement, playerId: player1_id })),
        ...player2Achievements.map(achievement => ({ ...achievement, playerId: player2_id }))
      ];
      
      console.log(`🏆 Multiplayer match achievements unlocked: ${unlockedAchievements.length}`);
    } catch (achievementError) {
      console.error('Error checking match achievements:', achievementError);
      // Don't fail the whole request if achievements fail
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
      unlockedAchievements: unlockedAchievements, // 🎯 Include match achievements
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
    console.log(`Server is running on http://localhost:${PORT}`)
  })
}

//Socket IO setup
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
})

io.on('connection', (socket) => {
  console.log('New client connected:', socket.id)
  // add handlers for sockets.js here
  socketsHandlers(io, socket)
})

// for Jest + Supertest
export default app
