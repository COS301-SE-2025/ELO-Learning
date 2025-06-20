// server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { supabase } from '../database/supabaseClient.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { calculateSinglePlayerXP } from './singlePlayer.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

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
    .select('Q_id, topic, difficulty, level, questionText, xpGain')
    .eq('level', level)
    .eq('topic', topic);

  if (error) {
    console.error(
      'Error fetching questions by level and topic:',
      error.message,
    );
    return res.status(500).json({ error: 'Failed to fetch questions' });
  }

  res.status(200).json({ questions: data });
});

// Register new user
app.post('/register', async (req, res) => {
  const { name, surname, username, email, password } = req.body; //need to add handling for joinDate, xp and currentLevel

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

  const { data, error } = await supabase
    .from('Users')
    .insert([{ name, surname, username, email, password: hashedPassword }])
    .select()
    .single();

  if (error) {
    console.error('Error registering user:', error.message);
    return res.status(500).json({ error: 'Failed to register user' });
  }

  res.status(201).json({ message: 'User registered successfully', user: data });
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
    .select('id,name,surname,username,email,password')
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
      currentLevel: user.currentLevel || 1, // Default to level 1 if not set
      joinDate: user.joinDate || new Date().toISOString(), // Default to current date if not set
      xp: user.xp || 0, // Default to 0 XP if not set
    },
  });
});

app.post('/attempt', async (req, res) => {
  try {
    const { user_id, question_id, isCorrect, timeSpent, nextLevelXP } =
      req.body; //For testing with postman

    if (
      !user_id ||
      !question_id ||
      isCorrect === undefined ||
      timeSpent === undefined ||
      !nextLevelXP
    ) {
      return res.status(400).json({ error: 'Missing required fields!' });
    }

    //Fetch current user XP & level
    const { data: userData, error: userError } = await supabase
      .from('Users')
      .select('xp, currentLevel')
      .eq('id', user_id)
      .single();

    if (userError || !userData) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { xp: currentXP, currentLevel } = userData;

    //Fetch question xpGain
    const { data: questionData, error: qError } = await supabase
      .from('Questions')
      .select('xpGain')
      .eq('Q_id', question_id)
      .single();

    if (qError || !questionData) {
      return res.status(404).json({ error: 'Question not found' });
    }

    const CA = isCorrect ? 1 : 0;

    // Calculate XP earned (single player)
    const xpEarned = await calculateSinglePlayerXP({
      CA,
      XPGain: questionData.xpGain,
      actualTimeSeconds: timeSpent,
      currentLevel,
      currentXP,
      nextLevelXP,
    });

    const newXP = currentXP + xpEarned;
    // Check for level up
    let newLevel = currentLevel;
    let leveledUp = false;
    if (newXP >= nextLevelXP) {
      newLevel = currentLevel + 1;
      leveledUp = true;
    }

    //Insert into QuestionAttempts
    const { error: insertError } = await supabase
      .from('QuestionAttempts')
      .insert([
        {
          question_id,
          user_id,
          isCorrect,
          timeSpent,
          ratingBefore: userData.xp,
          ratingAfter: newXP,
          ratingChange: xpEarned,
          attemptDate: new Date(),
        },
      ]);
    if (insertError) {
      return res
        .status(500)
        .json({ error: 'Error saving attempt', details: insertError.message });
    }
    // Update the user record
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

    return res.status(200).json({
      message: 'User XP and level updated successfully',
      newXP,
      newLevel,
      leveledUp,
    });
  } catch (err) {
    console.error('Error in /attempt:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Only start the server if not testing - changed you may consult Monica

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}

// for Jest + Supertest
export default app;
