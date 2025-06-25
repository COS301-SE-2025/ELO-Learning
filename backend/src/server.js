// server.js
import bcrypt from 'bcrypt';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import jwt from 'jsonwebtoken';
import { calculateExpected, distributeXP } from './multiPlayer.js';
import { calculateSinglePlayerXP } from './singlePlayer.js';

import { supabase } from '../database/supabaseClient.js';
import { backendMathValidator } from './mathValidator.js';

import { createServer } from 'http';
import { Server } from 'socket.io';

//Change this import to ES6
import socketsHandlers from './sockets.js';

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

//GET /users Endpoint: works.
app.get('/users', async (req, res) => {
  const { data, error } = await supabase
    .from('Users')
    .select('id,name,surname,username,email,currentLevel,joinDate,xp');
  if (error) {
    console.error('Error fetching users:', error.message);
    return res.status(500).json({ error: 'Failed to fetch users' });
  }
  res.status(200).json(data);
});

// Return specific user: (works)
app.get('/user/:id', async (req, res) => {
  const { id } = req.params;

  // Check for Authorization header (mock for now)
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res
      .status(401)
      .json({ error: 'You are unauthorized to make this request.' });
  }

  // Fetch user from Supabase
  const { data, error } = await supabase
    .from('Users')
    .select('id,name,surname,username,email,currentLevel,joinDate,xp')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return res.status(404).json({ error: "User doesn't exist" });
    }
    console.error('Error fetching user:', error.message);
    return res.status(500).json({ error: 'Failed to fetch user' });
  }

  res.status(200).json(data);
});

// Return user's achievements: (works)
app.get('/users/:id/achievements', async (req, res) => {
  const { id } = req.params;

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res
      .status(401)
      .json({ error: 'You are unauthorized to make this request.' });
  }

  const { data, error } = await supabase
    .from('Achievements')
    .select('*')
    .eq('user_id', id);

  if (error) {
    console.error('Error fetching achievements:', error.message);
    return res.status(500).json({ error: 'Failed to fetch achievements' });
  }

  if (data.length === 0) {
    return res
      .status(404)
      .json({ error: "User doesn't exist or has no achievements" });
  }

  res.status(200).json({ achievements: data });
});

// Update a user's XP: (works)
app.post('/user/:id/xp', async (req, res) => {
  const { id } = req.params;
  const { xp } = req.body;

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res
      .status(401)
      .json({ error: 'You are unauthorized to make this request.' });
  }

  if (typeof xp !== 'number') {
    return res.status(400).json({ error: 'XP must be a number.' });
  }

  const { data, error } = await supabase
    .from('Users')
    .update({ xp })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return res.status(404).json({ error: "User doesn't exist" });
    }
    console.error('Error updating XP:', error.message);
    return res.status(500).json({ error: 'Failed to update XP' });
  }

  res.status(200).json(data);
});

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

  const { data, error } = await supabase
    .from('Questions')
    .select('Q_id, topic, difficulty, level, questionText, xpGain')
    .eq('level', level);

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

  if (!topic) {
    return res.status(400).json({ error: 'Missing topic parameter' });
  }

  const { data, error } = await supabase
    .from('Questions')
    .select('Q_id, topic, difficulty, level, questionText, xpGain')
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

  const { data, error } = await supabase
    .from('Questions')
    .select('Q_id, topic, difficulty, level, questionText, xpGain, type')
    .eq('level', level)
    .eq('topic_id', topic);
  if (data) {
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
      .eq('id', selectedAnswerId)
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

    return res.status(200).json({
      correct: true,
      message: `Correct answer! +${xpToAdd} XP awarded.`,
      newXP: updatedUser.xp,
    });
  } catch (err) {
    console.error('Unexpected error:', err);
    return res.status(500).json({ error: 'Unexpected server error' });
  }
});

// Register new user
app.post('/register', async (req, res) => {
  const { name, surname, username, email, password, joinDate } = req.body;

  if (!name || !surname || !username || !email || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  // Check if user already exists
  const { data: existingUser, error: fetchError } = await supabase
    .from('Users')
    .select('id')
    .eq('email', email)
    .maybeSingle();

  if (fetchError) {
    console.error('Error checking existing user:', fetchError.message);
    return res.status(500).json({ error: 'Internal server error' });
  }

  if (existingUser) {
    return res.status(409).json({ error: 'Email already registered' });
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  const safeCurrentLevel = 5;
  const safeJoinDate = joinDate || new Date().toISOString();
  const safeXP = 1000;

  const { data, error } = await supabase
    .from('Users')
    .insert([
      {
        name,
        surname,
        username,
        email,
        password: hashedPassword,
        currentLevel: safeCurrentLevel,
        joinDate: safeJoinDate,
        xp: safeXP,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error('Error registering user:', error.message);
    return res.status(500).json({ error: 'Failed to register user' });
  }

  const token = jwt.sign(
    { id: data.id, email: data.email },
    process.env.JWT_SECRET,
    { expiresIn: '1h' },
  );

  res.status(201).json({
    message: 'User registered successfully',
    token,
    user: {
      id: data.id,
      name: data.name,
      surname: data.surname,
      username: data.username,
      email: data.email,
      currentLevel: data.currentLevel,
      joinDate: data.joinDate,
      xp: data.xp,
    },
  });
});

// Login user
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  // Fetch user by email
  const { data: user, error: fetchError } = await supabase
    .from('Users')
    .select(
      'id,name,surname,username,email,password,currentLevel,joinDate,xp,pfpURL',
    )
    .eq('email', email)
    .single();

  if (fetchError || !user) {
    console.error('Error fetching user:', fetchError?.message);
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  // Verify password
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  // Generate JWT token
  const token = jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '1h' },
  );

  res.status(200).json({
    message: 'Login successful',
    token,
    user: {
      id: user.id,
      name: user.name,
      surname: user.surname,
      username: user.username,
      email: user.email,
      currentLevel: user.currentLevel || 5, // Default to level 1 if not set
      joinDate: user.joinDate || new Date().toISOString(), // Default to current date if not set
      xp: user.xp || 0, // Default to 0 XP if not set
      pfpURL: user.pfpURL,
    },
  });
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
      xpEarned: parseFloat(xpEarned.toFixed(2)),
      leveledUp,
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
// Math Validation Endpoints

// Validate a math answer
app.post('/validate-answer', async (req, res) => {
  try {
    const { studentAnswer, correctAnswer } = req.body;

    if (!studentAnswer || !correctAnswer) {
      return res.status(400).json({
        error: 'Both studentAnswer and correctAnswer are required',
      });
    }

    const isCorrect = backendMathValidator.validateAnswer(
      studentAnswer,
      correctAnswer,
    );

    res.status(200).json({
      isCorrect,
      studentAnswer,
      correctAnswer,
      message: isCorrect ? 'Answer is correct!' : 'Answer is incorrect.',
    });
  } catch (error) {
    console.error('Error validating answer:', error);
    res.status(500).json({ error: 'Failed to validate answer' });
  }
});

// Quick validation for real-time feedback
app.post('/quick-validate', async (req, res) => {
  try {
    const { studentAnswer, correctAnswer } = req.body;

    if (!studentAnswer || !correctAnswer) {
      return res.status(400).json({
        error: 'Both studentAnswer and correctAnswer are required',
      });
    }

    const isCorrect = backendMathValidator.quickValidate(
      studentAnswer,
      correctAnswer,
    );

    res.status(200).json({
      isCorrect,
      studentAnswer,
      correctAnswer,
    });
  } catch (error) {
    console.error('Error in quick validation:', error);
    res.status(500).json({ error: 'Failed to perform quick validation' });
  }
});

// Validate math expression format
app.post('/validate-expression', async (req, res) => {
  try {
    const { expression } = req.body;

    if (!expression) {
      return res.status(400).json({
        error: 'Expression is required',
      });
    }

    const isValid = backendMathValidator.isValidMathExpression(expression);
    const message = backendMathValidator.getValidationMessage(expression);

    res.status(200).json({
      isValid,
      expression,
      message,
    });
  } catch (error) {
    console.error('Error validating expression:', error);
    res.status(500).json({ error: 'Failed to validate expression' });
  }
});

// Submit and validate answer for a specific question
app.post('/question/:id/submit', async (req, res) => {
  const { id } = req.params;
  const { studentAnswer, userId } = req.body;

  try {
    // Fetch the correct answer from database
    const { data: correctAnswerData, error: answerError } = await supabase
      .from('Answers')
      .select('answer_text')
      .eq('question_id', id)
      .eq('isCorrect', true)
      .single();

    if (answerError || !correctAnswerData) {
      return res
        .status(404)
        .json({ error: 'Question or correct answer not found' });
    }

    const correctAnswer = correctAnswerData.answerText;
    const isCorrect = backendMathValidator.validateAnswer(
      studentAnswer,
      correctAnswer,
    );

    // If correct and userId provided, award XP
    let updatedUser = null;
    if (isCorrect && userId) {
      // Fetch question XP value
      const { data: questionData, error: questionError } = await supabase
        .from('Questions')
        .select('xpGain')
        .eq('Q_id', id)
        .single();

      if (!questionError && questionData) {
        // Update user XP
        const { data: currentUser, error: userError } = await supabase
          .from('Users')
          .select('xp')
          .eq('id', userId)
          .single();

        if (!userError && currentUser) {
          const newXp = (currentUser.xp || 0) + questionData.xpGain;

          const { data: updated, error: updateError } = await supabase
            .from('Users')
            .update({ xp: newXp })
            .eq('id', userId)
            .select('id, xp')
            .single();

          if (!updateError) {
            updatedUser = updated;
          }
        }
      }
    }

    res.status(200).json({
      isCorrect,
      studentAnswer,
      correctAnswer,
      message: isCorrect ? 'Correct! Well done!' : 'Incorrect. Try again!',
      xpAwarded:
        isCorrect && updatedUser
          ? updatedUser.xp - (updatedUser.xp - (questionData?.xpGain || 0))
          : 0,
      updatedUser,
    });
  } catch (error) {
    console.error('Error submitting answer:', error);
    res.status(500).json({ error: 'Failed to submit answer' });
  }
});

// Get practice questions by type
app.get('/practice/type/:questionType', async (req, res) => {
  try {
    const { questionType } = req.params;

    const { data, error } = await supabase
      .from('Questions')
      .select('*')
      .eq('type', questionType)
      .limit(10);

    if (error) {
      console.error('Error fetching questions by type:', error.message);
      return res
        .status(500)
        .json({ error: 'Failed to fetch questions by type' });
    }

    // Get answers for each question
    for (const question of data) {
      const { data: answers, error: answerError } = await supabase
        .from('Answers')
        .select('*')
        .eq('question_id', question.Q_id);

      if (answerError) {
        console.error('Error fetching answers:', answerError.message);
        return res.status(500).json({ error: 'Failed to fetch answers' });
      }

      question.answers = answers;
    }

    res.status(200).json({ questions: data });
  } catch (err) {
    console.error('Unexpected error:', err);
    res.status(500).json({ error: 'Unexpected server error' });
  }
});

app.get('/questions/random', async (req, res) => {
  try {
    const userId = req.query.userId;
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    //Fetch currentLevel for this user
    const { data: userData, error: userError } = await supabase
      .from('Users')
      .select('currentLevel')
      .eq('id', userId)
      .single();

    if (userError || !userData) {
      return res.status(404).json({ error: 'User not found' });
    }

    const currentLevel = userData.currentLevel;
    //console.log('User level:',currentLevel)

    // Fetch 15 random questions for this level
    const { data: questions, error: qError } = await supabase
      .from('Questions')
      .select('*')
      .eq('level', currentLevel);

    if (qError) {
      //console.log(qError);
      return res
        .status(500)
        .json({ error: 'Failed to fetch questions', details: qError.message });
    }

    if (!questions || questions.length === 0) {
      return res
        .status(404)
        .json({ error: 'No questions found for this level' });
    }

    //shuffle and pick 15
    const shuffled = questions.sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 15);

    //Map to clean structure
    const cleanQuestions = selected.map((q) => ({
      id: q.Q_id,
      topic: q.topic,
      difficulty: q.difficulty,
      level: q.level,
      question: q.questionText,
      xpGain: q.xpGain,
      type: q.type,
    }));

    return res.status(200).json({ questions: cleanQuestions });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'Server error' });
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
