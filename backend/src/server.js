// server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { supabase } from '../database/supabaseClient.js';

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

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// Return specific user: (works)
app.get('/user/:id', async (req, res) => {
  const { id } = req.params;

  // Check for Authorization header (mock for now)
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: "You are unauthorized to make this request." });
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

// Return user's achievements: ( to work once tables are there)
app.get('/users/:id/achievements', async (req, res) => {
  const { id } = req.params;

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: "You are unauthorized to make this request." });
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
    return res.status(404).json({ error: "User doesn't exist or has no achievements" });
  }

  res.status(200).json({ achievements: data });
});

// Update a user's XP: (works)
app.post('/user/:id/xp', async (req, res) => {
  const { id } = req.params;
  const { xp } = req.body;


  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: "You are unauthorized to make this request." });
  }

  if (typeof xp !== 'number') {
    return res.status(400).json({ error: "XP must be a number." });
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
    return res.status(401).json({ error: "You are unauthorized to make this request." });
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
    return res.status(404).json({ error: "Level doesn’t exist" });
  }

  res.status(200).json({ questions: data });
});

// Return the answer to a specific question
app.get('/question/:id/answer', async (req, res) => {
  const { id } = req.params;

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: "You are unauthorized to make this request." });
  }


  const { data, error } = await supabase
    .from('Answers') 
    .select('*')     // Ask group what we want to display, just answer or all details?
    .eq('question_id', id);

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
    return res.status(400).json({ error: "Missing topic parameter" });
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
    return res.status(400).json({ error: "Missing level or topic parameter" });
  }

  const { data, error } = await supabase
    .from('Questions') 
    .select('Q_id, topic, difficulty, level, questionText, xpGain')
    .eq('level', level)
    .eq('topic', topic);

  if (error) {
    console.error('Error fetching questions by level and topic:', error.message);
    return res.status(500).json({ error: 'Failed to fetch questions' });
  }

  res.status(200).json({ questions: data });
});

